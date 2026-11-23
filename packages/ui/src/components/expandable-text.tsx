import { useCallback, useId, useRef, useState } from 'react'
import type {
  ComponentProps,
  CSSProperties,
  FocusEvent,
  ReactNode,
} from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import type { AnimationPlaybackControls } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { duration, ease } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { cn } from '../lib/cn.ts'

type ExpandableTextProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** The text: a string, paragraphs, inline links. */
  children: ReactNode
  /** How many lines show while it is closed. */
  lines?: number
  /** Open, when the page keeps it. */
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  /** The text's size: sm (`text-xs`), default (`text-sm`), lg (`text-base`). */
  size?: 'sm' | 'default' | 'lg'
  /** The button's words while closed; « Lire la suite » by default. */
  moreLabel?: string
  /** The button's words while open; « Réduire » by default. */
  lessLabel?: string
  /**
   * What the text is, read after the button's words: « du message de
   * Julie » makes « Lire la suite du message de Julie ».
   */
  about?: string
}

const sizes = { sm: 'text-xs', default: 'text-sm', lg: 'text-base' } as const

// Opening is a considered reveal, closing a quicker move; each grows by up
// to 100ms with the distance the text travels.
const openingTime = (distance: number) =>
  duration.considered + Math.min(distance / 1600, duration.instant)
const closingTime = (distance: number) =>
  duration.standard + Math.min(distance / 2000, duration.instant)

/**
 * A long text cut to a few lines, with « Lire la suite » to open it, after
 * Arc UI (https://uiarc.dev, MIT).
 *
 * **Use it for** a couple's message, a note, an answer of a FAQ: text
 * that is usually short and sometimes long. **Not for** a whole section
 * (`Collapsible`) or a list of questions (`Accordion`).
 *
 * **Where**: in a card or a list row, under its title.
 *
 * **States**: short (no button: it only shows when the text overflows,
 * and follows width and font changes), closed (the last line and a half
 * fade out), opening, open, closing. One value drives the height, the
 * fade and the chevron together; the time grows a little with the
 * distance; the new lines rise through the soft edge; the two labels
 * cross on one spot, so the button never jumps. Closing far down the page
 * brings the text's start back into view.
 *
 * **Key props**: `lines` (3), `expanded` + `onExpandedChange` (or
 * `defaultExpanded`), `size`, `about`, `moreLabel` / `lessLabel`.
 *
 * **Accessibility**: the button has `aria-expanded` and points at the
 * text; the whole text is always read by screen readers, even closed; a
 * link hidden under the cut opens the text when it gets the keyboard's
 * focus. With reduced motion it opens at once.
 *
 * @summary A long text cut to a few lines, with « Lire la suite ».
 */
function ExpandableText({
  children,
  lines = 3,
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  size = 'default',
  moreLabel,
  lessLabel,
  about,
  className,
  style,
  onFocusCapture,
  ...props
}: ExpandableTextProps) {
  const messages = useGoGoUIMessages()
  const reduce = useReduceMotion()
  const contentId = useId()
  const [uncontrolled, setUncontrolled] = useState(defaultExpanded)
  const expanded = expandedProp ?? uncontrolled
  // Long text is the common case: the button is there until the first
  // measure finds the text fits.
  const [overflowing, setOverflowing] = useState(true)
  const [animating, setAnimating] = useState(false)
  // The state the page has settled in; the cut only changes once a move
  // ends.
  const [settled, setSettled] = useState(expanded)
  const rootRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement | null>(null)
  const clampHeight = useRef(0)
  const running = useRef<AnimationPlaybackControls | null>(null)

  /** 0 is cut, 1 is open: the height, the fade and the chevron follow it. */
  const progress = useMotionValue(expanded ? 1 : 0)
  const height = useMotionValue<number | 'auto'>('auto')
  const rotate = useTransform(progress, [0, 1], [0, 180])
  // The fade eases away as the text opens and only comes back near the
  // cut, so new lines rise through a soft edge rather than a hard one.
  const maskImage = useTransform(progress, (value) => {
    const fade = Math.pow(1 - Math.min(Math.max(value, 0), 1), 1.35)
    return fade <= 0.002
      ? 'none'
      : `linear-gradient(to bottom, #000 calc(100% - 1.6lh), rgb(0 0 0 / ${(1 - fade * 0.96).toFixed(3)}) 100%)`
  })

  // Opened or closed by the page itself (not the button): no move, the
  // text simply takes its new state.
  if (!animating && expanded !== settled) {
    setSettled(expanded)
    progress.jump(expanded ? 1 : 0)
  }

  // The probe is exactly `lines` lines high in the text's own line
  // height: no font or size to compute by hand.
  const measure = useCallback((inner: HTMLDivElement | null) => {
    innerRef.current = inner
    const probe = inner?.previousElementSibling
    if (!inner || !probe || typeof ResizeObserver === 'undefined') {
      return undefined
    }
    const check = () => {
      clampHeight.current = probe.getBoundingClientRect().height
      setOverflowing(
        inner.getBoundingClientRect().height > clampHeight.current + 1,
      )
    }
    check()
    const observer = new ResizeObserver(check)
    observer.observe(probe)
    observer.observe(inner)
    return () => observer.disconnect()
  }, [])

  function move(next: boolean) {
    running.current?.stop()
    running.current = null
    const node = contentRef.current
    const inner = innerRef.current
    if (!node || !inner || reduce) {
      progress.jump(next ? 1 : 0)
      height.jump('auto')
      setAnimating(false)
      setSettled(next)
      return
    }
    const full = inner.getBoundingClientRect().height
    const clamp = Math.min(clampHeight.current, full)
    const current = node.getBoundingClientRect().height
    const span = Math.max(full - clamp, 1)
    // From the real height, in case the text reflowed since the last move.
    progress.jump(Math.min(Math.max((current - clamp) / span, 0), 1))
    // Pinned before the cut lifts, so nothing jumps for a frame.
    node.style.height = `${current}px`
    height.jump(current)
    setAnimating(true)
    const target = next ? 1 : 0
    const distance = Math.abs(target - progress.get()) * span
    running.current = animate(progress, target, {
      duration: next ? openingTime(distance) : closingTime(distance),
      ease: ease.enter,
      onUpdate: (value) => height.set(clamp + (full - clamp) * value),
      onComplete: () => {
        running.current = null
        height.jump('auto')
        setAnimating(false)
        setSettled(next)
      },
    })
  }

  function setExpanded(next: boolean) {
    if (next === expanded) {
      return
    }
    // Closing from far down would leave the reader below the text: its
    // start comes back into view as it closes.
    const root = rootRef.current
    if (!next && root && root.getBoundingClientRect().top < 0) {
      root.scrollIntoView({
        block: 'start',
        behavior: reduce ? 'auto' : 'smooth',
      })
    }
    if (expandedProp === undefined) {
      setUncontrolled(next)
    }
    onExpandedChange?.(next)
    move(next)
  }

  // A link hidden under the cut opens the text when the keyboard reaches
  // it.
  function openOnHiddenFocus(event: FocusEvent<HTMLDivElement>) {
    onFocusCapture?.(event)
    const content = contentRef.current
    if (expanded || !overflowing || !content?.contains(event.target)) {
      return
    }
    if (
      event.target.getBoundingClientRect().bottom >
      content.getBoundingClientRect().bottom + 1
    ) {
      setExpanded(true)
    }
  }

  const clamped = !settled && !animating && overflowing
  const masked = overflowing && (!settled || animating)
  const more = moreLabel ?? messages.readMore
  const less = lessLabel ?? messages.showLess
  const shown = expanded ? less : more

  return (
    <MotionScope>
      <div
        {...props}
        ref={rootRef}
        data-slot="expandable-text"
        onFocusCapture={openOnHiddenFocus}
        style={{ ...style, '--lines': lines } as CSSProperties}
        className={cn(
          'grid min-w-0 justify-items-start gap-2 text-fg-muted',
          sizes[size],
          className,
        )}
      >
        <motion.div
          ref={contentRef}
          id={contentId}
          data-clamped={clamped || undefined}
          style={{
            height,
            maskImage: masked ? maskImage : 'none',
            WebkitMaskImage: masked ? maskImage : 'none',
          }}
          className="relative w-full min-w-0 overflow-hidden wrap-anywhere data-clamped:max-h-[calc(var(--lines)*1lh)]"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none invisible absolute top-0 left-0 h-[calc(var(--lines)*1lh)] w-0"
          />
          <div ref={measure} className="[&_p+p]:mt-3">
            {children}
          </div>
        </motion.div>
        {overflowing && (
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={contentId}
            aria-label={about ? `${shown} ${about}` : undefined}
            onClick={() => setExpanded(!expanded)}
            className="-ms-0.5 inline-flex min-h-7 items-center gap-1 rounded-md px-0.5 font-medium text-fg outline-none transition-[color,scale] duration-150 ease-standard hover:text-fg-muted focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus active:scale-[0.97] active:text-fg-subtle motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            {/* Both words share one cell: the button keeps the wider width
                and the chevron never jumps as they cross. */}
            <span className="inline-grid justify-items-start">
              <span
                data-active={!expanded || undefined}
                aria-hidden={expanded || undefined}
                className="col-start-1 row-start-1 -translate-y-1 opacity-0 blur-[2px] transition-[opacity,translate,filter] duration-200 ease-standard data-active:translate-y-0 data-active:opacity-100 data-active:blur-none motion-reduce:transition-none"
              >
                {more}
              </span>
              <span
                data-active={expanded || undefined}
                aria-hidden={!expanded || undefined}
                className="col-start-1 row-start-1 translate-y-1 opacity-0 blur-[2px] transition-[opacity,translate,filter] duration-200 ease-standard data-active:translate-y-0 data-active:opacity-100 data-active:blur-none motion-reduce:transition-none"
              >
                {less}
              </span>
            </span>
            <motion.span
              aria-hidden="true"
              style={{ rotate }}
              className="inline-flex text-fg-subtle"
            >
              <GoGoIcon name="chevronDown" className="size-4" />
            </motion.span>
          </button>
        )}
      </div>
    </MotionScope>
  )
}

export { ExpandableText }
export type { ExpandableTextProps }
