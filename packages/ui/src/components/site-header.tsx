import { useCallback, useId, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { duration, ease, spring, stagger } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { RenderLink } from '../internal/render-link.tsx'
import { cn } from '../lib/cn.ts'
import { Button } from './button.tsx'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from './navigation-menu.tsx'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from './sheet.tsx'

/** A page inside a `mega` panel. */
type SiteHeaderLink = {
  label: string
  href: string
  /** One short line under the label. */
  description?: string
  /** A small icon before the label (any library's). */
  icon?: ReactNode
}

/** A card beside the links of a `mega` panel. */
type SiteHeaderFeature = {
  title: string
  href: string
  description?: string
  image?: { src: string; alt: string }
}

/** A top-level destination. With `links`, the `mega` variant opens a panel. */
type SiteHeaderItem = {
  /** Stable value, also used for `current`. */
  value: string
  label: string
  /** The page; for an item with `links`, used by `simple` and `centered`. */
  href?: string
  links?: SiteHeaderLink[]
  feature?: SiteHeaderFeature
}

/** The words SiteHeader writes, to change on one SiteHeader only. */
type SiteHeaderLabels = Partial<Pick<GoGoUIMessages, 'openMenu' | 'closeMenu'>>

type SiteHeaderProps = {
  /**
   * `simple`: the links beside the brand. `centered`: the links centred
   * on a tray. `mega`: items with `links` open a panel.
   */
  variant?: 'simple' | 'centered' | 'mega'
  /** The logo and the name, a link home. */
  brand: ReactNode
  items: SiteHeaderItem[]
  /** The item of the current page (controlled). */
  current?: string
  defaultCurrent?: string
  onCurrentChange?: (value: string) => void
  /** The buttons at the end of the bar (« Se connecter », « Essai gratuit »); at the bottom of the phone menu. */
  actions?: ReactNode
  /** The one button kept in the bar on a phone, before the menu button. */
  mobileAction?: ReactNode
  /** Sticks to the top of what scrolls; true by default. */
  sticky?: boolean
  /** Pixels of scroll before the bar fills; 8 by default. */
  scrollThreshold?: number
  /**
   * The router's link, Base UI style:
   * `renderLink={({ href }) => <Link to={href} />}`.
   */
  renderLink?: (link: { href: string; label: string }) => ReactElement
  /** The navigation's name, « Navigation principale » by default. */
  label?: string
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: SiteHeaderLabels
}

// Under this width of the header, the links fold into the phone menu.
// The same 760 is written in the container classes below.
const COLLAPSE_AT = 760

/**
 * A website's header: the brand, the main pages, the actions, and a menu
 * on a phone, after Arc UI (https://uiarc.dev, MIT).
 *
 * **Use it for** a public site (landing page, blog, docs). **Not for** an
 * app's own navigation (`Sidebar`).
 *
 * **Where**: at the top of every page of the site.
 *
 * **States**: clear at the top, filled (background, edge, shadow) once the
 * page scrolls past `scrollThreshold`, clear again only near the top so it
 * never flickers; the current page underlined (the line glides to it); a
 * `mega` panel open; under 760 px of the header's width, folded: the
 * brand, `mobileAction` and a ☰ button opening a menu from the top (its ×
 * turns in, the rows drop in one after the other, groups open like an
 * accordion). Widening the header closes the menu.
 *
 * **Compose**: `NavigationMenu` on a computer, `Sheet side="top"` on a
 * phone; `actions` and `mobileAction` take GoGoUI `Button`s.
 *
 * **Key props**: `variant` (simple, centered, mega), `brand`, `items`,
 * `current` / `defaultCurrent` + `onCurrentChange`, `actions`,
 * `mobileAction`, `sticky`, `scrollThreshold`, `renderLink`, `label`,
 * `labels` to change its words.
 *
 * **Accessibility**: a named `nav`; the current page has
 * `aria-current="page"`; panels open with Enter and arrows; the phone menu
 * is a modal sheet (focus kept inside, Escape closes it and brings the
 * focus back to ☰, the page does not scroll behind). Still with reduced
 * motion.
 *
 * @summary A website's header, with a menu from the top on a phone.
 */
function SiteHeader({
  variant = 'simple',
  brand,
  items,
  current: currentProp,
  defaultCurrent,
  onCurrentChange,
  actions,
  mobileAction,
  sticky = true,
  scrollThreshold = 8,
  renderLink,
  label,
  className,
  labels,
}: SiteHeaderProps) {
  const messages = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const uid = useId()
  const [innerCurrent, setInnerCurrent] = useState(defaultCurrent)
  const current = currentProp ?? innerCurrent
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const name = label ?? messages.siteNavigation
  const centered = variant === 'centered'

  // Follows what scrolls (the nearest scrolling box, or the window), and
  // closes the phone menu when the header grows past the fold.
  const watch = useCallback(
    (header: HTMLElement | null) => {
      if (!header) {
        return undefined
      }
      let scroller = header.parentElement
      while (
        scroller &&
        !/(auto|scroll)/.test(getComputedStyle(scroller).overflowY)
      ) {
        scroller = scroller.parentElement
      }
      const box = scroller
      const read = () => (box ? box.scrollTop : window.scrollY)
      // Filled past the threshold, clear again only under half of it.
      const update = () => {
        const y = read()
        setScrolled((filled) =>
          filled ? y > scrollThreshold / 2 : y > scrollThreshold,
        )
      }
      update()
      const target: HTMLElement | Window = box ?? window
      target.addEventListener('scroll', update, { passive: true })
      const observer =
        typeof ResizeObserver === 'undefined'
          ? null
          : new ResizeObserver(([entry]) => {
              if (entry && entry.contentRect.width >= COLLAPSE_AT) {
                setMenuOpen(false)
              }
            })
      observer?.observe(header)
      return () => {
        target.removeEventListener('scroll', update)
        observer?.disconnect()
      }
    },
    [scrollThreshold],
  )

  function choose(value: string) {
    if (currentProp === undefined) {
      setInnerCurrent(value)
    }
    onCurrentChange?.(value)
    setMenuOpen(false)
  }

  const routerLink = (href: string, text: string) =>
    renderLink?.({ href, label: text })
  const itemHref = (item: SiteHeaderItem) =>
    item.href ?? item.links?.[0]?.href ?? '#'

  // The current page's mark: a line under the words, or a raised pill on
  // the centred tray. One per header: it glides from page to page.
  const mark = (
    <motion.span
      layoutId="current"
      aria-hidden="true"
      className={
        centered
          ? 'absolute inset-0 -z-10 rounded-full bg-surface shadow-xs ring-1 ring-line'
          : 'absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-primary'
      }
      transition={reduce ? { duration: 0 } : spring.morph}
    />
  )

  const itemClass = cn(
    navigationMenuTriggerStyle,
    'relative isolate flex-row gap-1 py-0 data-active:text-fg',
    centered && 'h-8 rounded-full px-3.5',
  )

  return (
    <MotionScope>
      <header
        ref={watch}
        data-slot="site-header"
        data-variant={variant}
        data-scrolled={scrolled || menuOpen || undefined}
        className={cn(
          '@container/site-header relative z-20 border-b border-transparent text-fg transition-[background-color,border-color,box-shadow] duration-(--motion-standard) ease-standard data-[scrolled]:border-line data-[scrolled]:bg-surface data-[scrolled]:shadow-xs motion-reduce:transition-none',
          sticky && 'sticky top-0',
          className,
        )}
      >
        <div
          className={cn(
            'mx-auto flex h-16 max-w-300 items-center gap-2 px-6 @max-[760px]/site-header:px-4',
            centered &&
              '@min-[760px]/site-header:grid @min-[760px]/site-header:grid-cols-[1fr_auto_1fr]',
          )}
        >
          <div className="flex min-w-0 items-center">{brand}</div>

          <LayoutGroup id={uid}>
            <NavigationMenu
              aria-label={name}
              className={cn(
                'ml-4 @max-[760px]/site-header:hidden',
                centered && 'ml-0 justify-self-center',
              )}
            >
              <NavigationMenuList
                className={cn(
                  'gap-0.5',
                  centered &&
                    'rounded-full bg-tray p-[3px] ring-1 ring-line ring-inset',
                )}
              >
                {items.map((item) => {
                  const isCurrent = current === item.value
                  const panel = variant === 'mega' && !!item.links?.length
                  const words = centered ? (
                    <>
                      {isCurrent && mark}
                      <span>{item.label}</span>
                    </>
                  ) : (
                    <span className="relative">
                      {item.label}
                      {isCurrent && mark}
                    </span>
                  )
                  return (
                    <NavigationMenuItem key={item.value} value={item.value}>
                      {panel ? (
                        <>
                          <NavigationMenuTrigger
                            className={cn(itemClass, isCurrent && 'text-fg')}
                          >
                            {words}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent className="p-3">
                            <div
                              className={cn(
                                'grid gap-2',
                                item.feature &&
                                  'grid-cols-[minmax(0,1fr)_minmax(200px,260px)]',
                              )}
                            >
                              <ul className="grid w-[min(34rem,calc(100vw-4rem))] grid-cols-2 gap-0.5">
                                {item.links?.map((link) => (
                                  <li key={link.href}>
                                    <NavigationMenuLink
                                      href={link.href}
                                      render={routerLink(link.href, link.label)}
                                      onClick={() => choose(item.value)}
                                      className="h-full flex-row items-start gap-3 rounded-2xl"
                                    >
                                      {link.icon && (
                                        <span
                                          aria-hidden="true"
                                          className="mt-0.5 flex shrink-0 text-fg-muted [&_svg]:size-4"
                                        >
                                          {link.icon}
                                        </span>
                                      )}
                                      <span className="grid min-w-0 gap-0.5">
                                        <span className="font-medium">
                                          {link.label}
                                        </span>
                                        {link.description && (
                                          <span className="text-fg-subtle">
                                            {link.description}
                                          </span>
                                        )}
                                      </span>
                                    </NavigationMenuLink>
                                  </li>
                                ))}
                              </ul>
                              {item.feature && (
                                <NavigationMenuLink
                                  href={item.feature.href}
                                  render={routerLink(
                                    item.feature.href,
                                    item.feature.title,
                                  )}
                                  onClick={() => choose(item.value)}
                                  className="group/feature content-start gap-1.5 rounded-2xl bg-tray p-2 pb-3 hover:bg-tray"
                                >
                                  {item.feature.image && (
                                    <span className="relative mb-1 block aspect-[16/10] overflow-hidden rounded-xl bg-line">
                                      <img
                                        src={item.feature.image.src}
                                        alt={item.feature.image.alt}
                                        loading="lazy"
                                        decoding="async"
                                        className="size-full object-cover transition-transform duration-(--motion-considered) ease-standard group-hover/feature:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover/feature:scale-100"
                                      />
                                    </span>
                                  )}
                                  <span className="inline-flex items-center gap-1.5 px-1 font-medium">
                                    {item.feature.title}
                                    <GoGoIcon
                                      name="chevronRight"
                                      aria-hidden="true"
                                      className="size-3.5 text-fg-subtle transition-transform duration-(--motion-fast) ease-standard group-hover/feature:translate-x-0.5 motion-reduce:transition-none"
                                    />
                                  </span>
                                  {item.feature.description && (
                                    <span className="px-1 text-fg-subtle">
                                      {item.feature.description}
                                    </span>
                                  )}
                                </NavigationMenuLink>
                              )}
                            </div>
                          </NavigationMenuContent>
                        </>
                      ) : (
                        <NavigationMenuLink
                          href={itemHref(item)}
                          render={routerLink(itemHref(item), item.label)}
                          active={isCurrent}
                          onClick={() => choose(item.value)}
                          className={itemClass}
                        >
                          {words}
                        </NavigationMenuLink>
                      )}
                    </NavigationMenuItem>
                  )
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </LayoutGroup>

          <div
            className={cn(
              'ml-auto flex items-center gap-2',
              centered && 'justify-self-end',
            )}
          >
            {actions && (
              <div className="flex items-center gap-2 @max-[760px]/site-header:hidden">
                {actions}
              </div>
            )}
            {mobileAction && (
              <div className="hidden items-center @max-[760px]/site-header:flex">
                {mobileAction}
              </div>
            )}
            <Sheet
              open={menuOpen}
              onOpenChange={(open) => {
                setMenuOpen(open)
                if (!open) {
                  setExpanded(null)
                }
              }}
            >
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={messages.openMenu}
                    className="hidden text-fg @max-[760px]/site-header:inline-flex"
                  />
                }
              >
                <GoGoIcon name="menu" aria-hidden="true" className="size-5" />
              </SheetTrigger>
              <SheetContent
                side="top"
                showCloseButton={false}
                className="max-h-dvh gap-0 overflow-y-auto overscroll-contain pb-5"
              >
                <SheetTitle className="sr-only">{name}</SheetTitle>
                {/* The bar again, its ☰ turned into a ×. */}
                <div className="flex h-16 shrink-0 items-center gap-2 px-4">
                  <div className="flex min-w-0 items-center">{brand}</div>
                  <SheetClose
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={messages.closeMenu}
                        className="ml-auto text-fg"
                      />
                    }
                  >
                    <motion.span
                      className="grid place-items-center"
                      initial={
                        reduce
                          ? { opacity: 0 }
                          : { opacity: 0, rotate: -45, scale: 0.8 }
                      }
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      transition={
                        reduce
                          ? { duration: 0 }
                          : {
                              ...spring.snappy,
                              opacity: { duration: duration.instant },
                            }
                      }
                    >
                      <GoGoIcon
                        name="close"
                        aria-hidden="true"
                        className="size-5"
                      />
                    </motion.span>
                  </SheetClose>
                </div>
                <nav aria-label={name} className="px-4">
                  <ul>
                    {items.map((item, index) => {
                      const isCurrent = current === item.value
                      const group = variant === 'mega' && !!item.links?.length
                      const isExpanded = expanded === item.value
                      const groupId = `${uid}-group-${item.value}`
                      return (
                        <motion.li
                          key={item.value}
                          className="border-b border-line-subtle"
                          initial={reduce ? false : { opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: duration.standard,
                            ease: ease.enter,
                            delay: 0.04 + index * stagger.item,
                          }}
                        >
                          {group ? (
                            <>
                              <button
                                type="button"
                                aria-expanded={isExpanded}
                                aria-controls={isExpanded ? groupId : undefined}
                                onClick={() =>
                                  setExpanded(isExpanded ? null : item.value)
                                }
                                className="group/row flex min-h-13 w-full items-center justify-between gap-3 rounded-lg px-1 text-left text-base font-medium outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus focus-visible:outline-solid"
                              >
                                <span className="flex items-center gap-2.5">
                                  {item.label}
                                  {isCurrent && (
                                    <span
                                      aria-hidden="true"
                                      className="size-1.5 rounded-full bg-primary"
                                    />
                                  )}
                                </span>
                                <GoGoIcon
                                  name="chevronDown"
                                  aria-hidden="true"
                                  className="size-4.5 text-fg-subtle transition-transform duration-(--motion-standard) ease-standard group-aria-expanded/row:rotate-180 motion-reduce:transition-none"
                                />
                              </button>
                              <AnimatePresence initial={false}>
                                {isExpanded && (
                                  <motion.div
                                    key="group"
                                    id={groupId}
                                    className="overflow-hidden"
                                    initial={
                                      reduce
                                        ? { opacity: 0 }
                                        : { height: 0, opacity: 0 }
                                    }
                                    animate={
                                      reduce
                                        ? { opacity: 1 }
                                        : { height: 'auto', opacity: 1 }
                                    }
                                    exit={
                                      reduce
                                        ? { opacity: 0 }
                                        : { height: 0, opacity: 0 }
                                    }
                                    transition={
                                      reduce
                                        ? { duration: 0 }
                                        : {
                                            height: spring.smooth,
                                            opacity: {
                                              duration: duration.fast,
                                            },
                                          }
                                    }
                                  >
                                    <ul className="grid pb-3">
                                      {item.links?.map((link) => (
                                        <li key={link.href}>
                                          <RenderLink
                                            href={link.href}
                                            render={routerLink(
                                              link.href,
                                              link.label,
                                            )}
                                            onClick={() => choose(item.value)}
                                            className="flex min-h-11 items-center gap-3 rounded-xl px-2 text-sm text-fg-muted outline-none hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus focus-visible:outline-solid active:bg-hover active:text-fg [&_svg]:size-4 [&_svg]:shrink-0"
                                          >
                                            {link.icon}
                                            <span>{link.label}</span>
                                          </RenderLink>
                                        </li>
                                      ))}
                                    </ul>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </>
                          ) : (
                            <RenderLink
                              href={itemHref(item)}
                              render={routerLink(itemHref(item), item.label)}
                              aria-current={isCurrent ? 'page' : undefined}
                              onClick={() => choose(item.value)}
                              className="flex min-h-13 items-center justify-between gap-3 rounded-lg px-1 text-base font-medium outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus focus-visible:outline-solid"
                            >
                              <span>{item.label}</span>
                              {isCurrent && (
                                <span
                                  aria-hidden="true"
                                  className="size-1.5 rounded-full bg-primary"
                                />
                              )}
                            </RenderLink>
                          )}
                        </motion.li>
                      )
                    })}
                  </ul>
                  {actions && (
                    <motion.div
                      className="mt-5 grid auto-cols-fr grid-flow-col gap-2 *:w-full"
                      initial={reduce ? false : { opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: duration.standard,
                        ease: ease.enter,
                        delay: 0.04 + items.length * stagger.item,
                      }}
                    >
                      {actions}
                    </motion.div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </MotionScope>
  )
}

export { SiteHeader }
export type {
  SiteHeaderFeature,
  SiteHeaderItem,
  SiteHeaderLink,
  SiteHeaderProps,
  SiteHeaderLabels,
}
