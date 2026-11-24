import { useId, useRef, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { AnimatePresence, LayoutGroup, m } from 'motion/react'
import type { Variants } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { AutoHeight } from '../internal/auto-height.tsx'
import { duration, ease, spring } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { cn } from '../lib/cn.ts'
import { BlogCard } from './blog-card.tsx'
import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from './pagination.tsx'
import { PillTabsList } from './pill-tabs-list.tsx'
import { Tabs } from './tabs.tsx'

/** One post of the index. */
type BlogPost = {
  id: string
  title: string
  /** The post's own page: the index has no reader of its own. */
  href: string
  /** ISO day (`2026-11-18`); the index is sorted on it, newest first. */
  date: string
  category?: string
  excerpt?: string
  readingTime?: number
  author?: string
  image?: { src: string; alt: string }
  /** Shown large on page 1, rather than the newest post. */
  featured?: boolean
}

/** The words BlogGrid writes, to change on one BlogGrid only. */
type BlogGridLabels = Partial<
  Pick<GoGoUIMessages, 'blogCategories' | 'blogAll' | 'blogEmpty' | 'blogPage'>
>

type BlogGridProps = {
  posts: BlogPost[]
  /** The index's title, an `h2`. */
  title?: ReactNode
  description?: ReactNode
  /** The category tabs, in order; read from the posts by default. « Tous » comes first. */
  categories?: string[]
  /** The chosen category, null for all (controlled). */
  category?: string | null
  defaultCategory?: string | null
  onCategoryChange?: (category: string | null) => void
  /** The page, from 1 (controlled). */
  page?: number
  defaultPage?: number
  onPageChange?: (page: number) => void
  /** Cards per page under the featured one; 6 by default. */
  pageSize?: number
  /** The newest (or `featured`) post large on page 1; true by default. */
  showFeatured?: boolean
  /**
   * The router's link for a post, Base UI style:
   * `renderLink={(post) => <Link to={post.href} />}`.
   */
  renderLink?: (post: BlogPost) => ReactElement
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: BlogGridLabels
}

// The tab every post is under.
const ALL = '*'

// A new page slides in from the side one goes to; a new category rises.
const pageVariants: Variants = {
  enter: ({ direction, reduce }: { direction: number; reduce: boolean }) =>
    reduce
      ? { opacity: 0 }
      : { opacity: 0, x: direction * 24, y: direction ? 0 : 10 },
  center: { opacity: 1, x: 0, y: 0 },
  exit: ({ direction, reduce }: { direction: number; reduce: boolean }) =>
    reduce
      ? { opacity: 0 }
      : {
          opacity: 0,
          x: direction * -24,
          transition: { duration: duration.exit, ease: ease.standard },
        },
}

/**
 * A blog's index: a featured post, then a grid of cards by category and by
 * page, after Arc UI (https://uiarc.dev, MIT).
 *
 * **Use it for** a public blog's home page. **Not for** reading a post:
 * each card links to the post's own page (good for search engines).
 *
 * **Where**: the page's main column, 1180 px wide at most.
 *
 * **States**: by category (the pill glides, the cards rise in), by page
 * (the cards slide from the side one goes to, the height follows on a
 * spring, the page pill glides, the block scrolls back to its top), an
 * empty category. Three columns, two under 900 px of width, one under 540
 * px.
 *
 * **Compose**: `PillTabsList` for the categories, `BlogCard` for each post,
 * `Pagination` under them.
 *
 * **Key props**: `posts`, `title`, `description`, `categories`, `category`
 * / `defaultCategory` + `onCategoryChange`, `page` / `defaultPage` +
 * `onPageChange`, `pageSize`, `showFeatured`, `renderLink`,
 * `labels` to change its words.
 *
 * **Accessibility**: categories are tabs; pages are buttons named « Page
 * 2 », the current one `aria-current="page"`; each card's link is its
 * title alone. Still with reduced motion.
 *
 * @summary A blog's index: featured post, category tabs, cards, pages.
 */
function BlogGrid({
  posts,
  title,
  description,
  categories,
  category: categoryProp,
  defaultCategory = null,
  onCategoryChange,
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  pageSize = 6,
  showFeatured = true,
  renderLink,
  className,
  labels,
}: BlogGridProps) {
  const messages = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const uid = useId()
  const rootRef = useRef<HTMLElement>(null)
  // Until when the height springs: set when the page or the category changes.
  const armedUntil = useRef(0)
  const [innerCategory, setInnerCategory] = useState(defaultCategory)
  const [innerPage, setInnerPage] = useState(defaultPage)
  const [direction, setDirection] = useState(0)
  const category = categoryProp === undefined ? innerCategory : categoryProp
  const page = pageProp ?? innerPage

  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date))
  const tabs =
    categories ??
    sorted.reduce<string[]>(
      (found, post) =>
        post.category && !found.includes(post.category)
          ? [...found, post.category]
          : found,
      [],
    )
  const filtered = category
    ? sorted.filter((post) => post.category === category)
    : sorted
  const featured =
    showFeatured && filtered.length > 1
      ? (filtered.find((post) => post.featured) ?? filtered[0])
      : undefined
  const rest = featured
    ? filtered.filter((post) => post !== featured)
    : filtered
  const pageCount = Math.max(1, Math.ceil(rest.length / pageSize))
  const safePage = Math.min(Math.max(1, page), pageCount)
  const pagePosts = rest.slice((safePage - 1) * pageSize, safePage * pageSize)

  function changeCategory(next: string | null) {
    if (next === category) {
      return
    }
    armedUntil.current = performance.now() + 900
    setDirection(0)
    if (categoryProp === undefined) {
      setInnerCategory(next)
    }
    onCategoryChange?.(next)
    if (pageProp === undefined) {
      setInnerPage(1)
    }
    onPageChange?.(1)
  }

  function changePage(next: number) {
    if (next === safePage || next < 1 || next > pageCount) {
      return
    }
    armedUntil.current = performance.now() + 900
    setDirection(next > safePage ? 1 : -1)
    if (pageProp === undefined) {
      setInnerPage(next)
    }
    onPageChange?.(next)
    // Back to the block's top when its top has scrolled away.
    const root = rootRef.current
    if (root && root.getBoundingClientRect().top < 0) {
      root.scrollIntoView({
        behavior: reduce ? 'auto' : 'smooth',
        block: 'start',
      })
    }
  }

  const card = (post: BlogPost, large = false) => (
    <BlogCard
      key={post.id}
      title={post.title}
      href={post.href}
      date={post.date}
      category={post.category}
      excerpt={post.excerpt}
      readingTime={post.readingTime}
      author={post.author}
      image={post.image}
      variant={large ? 'featured' : 'default'}
      linkRender={renderLink?.(post)}
    />
  )

  return (
    <MotionScope>
      <section
        ref={rootRef}
        data-slot="blog-grid"
        aria-labelledby={title ? `${uid}-title` : undefined}
        className={cn(
          '@container mx-auto grid w-full max-w-295 min-w-0 scroll-mt-4 gap-8 text-fg',
          className,
        )}
      >
        {(title || description) && (
          <header className="grid max-w-150 gap-3">
            {title && (
              <h2
                id={`${uid}-title`}
                className="font-heading text-3xl font-medium text-fg @min-[680px]:text-4xl"
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="text-base text-pretty text-fg-muted">
                {description}
              </p>
            )}
          </header>
        )}

        {tabs.length > 0 && (
          // A tray wider than a phone scrolls sideways.
          <div className="-mx-4 -my-1 overflow-x-auto px-4 py-1 [scrollbar-width:none]">
            <Tabs
              value={category ?? ALL}
              onValueChange={(value) =>
                changeCategory(value === ALL ? null : String(value))
              }
            >
              <PillTabsList
                label={messages.blogCategories}
                value={category ?? ALL}
                tabs={[
                  { value: ALL, label: messages.blogAll },
                  ...tabs.map((name) => ({ value: name, label: name })),
                ]}
              />
            </Tabs>
          </div>
        )}

        <LayoutGroup id={uid}>
          <AutoHeight armedUntil={armedUntil} className="grid gap-8">
            <AnimatePresence
              mode="wait"
              initial={false}
              custom={{ direction, reduce }}
            >
              <m.div
                key={`${category ?? ALL}-${safePage}`}
                className="grid gap-12 @max-[680px]:gap-10"
                custom={{ direction, reduce }}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  ...spring.smooth,
                  opacity: { duration: duration.standard },
                }}
              >
                {featured && safePage === 1 && card(featured, true)}
                {pagePosts.length > 0 && (
                  <div className="grid grid-cols-3 gap-x-6 gap-y-12 @max-[900px]:grid-cols-2 @max-[680px]:gap-x-4 @max-[680px]:gap-y-10 @max-[540px]:grid-cols-1">
                    {pagePosts.map((post) => card(post))}
                  </div>
                )}
                {filtered.length === 0 && (
                  <p className="py-16 text-center text-fg-muted">
                    {messages.blogEmpty}
                  </p>
                )}
              </m.div>
            </AnimatePresence>

            {pageCount > 1 && (
              <Pagination className="border-t border-line pt-6">
                <PaginationContent className="w-full">
                  <PaginationItem className="mr-auto">
                    <PaginationPrevious
                      disabled={safePage === 1}
                      onClick={() => changePage(safePage - 1)}
                    />
                  </PaginationItem>
                  {Array.from(
                    { length: pageCount },
                    (_, index) => index + 1,
                  ).map((number) => {
                    const isCurrent = number === safePage
                    return (
                      <PaginationItem key={number}>
                        <PaginationButton
                          isActive={isCurrent}
                          variant="ghost"
                          aria-label={messages.blogPage(number)}
                          onClick={() => changePage(number)}
                          className="relative isolate aria-[current=page]:text-fg"
                        >
                          {isCurrent && (
                            <m.span
                              layoutId="page-pill"
                              aria-hidden="true"
                              className="absolute inset-0 -z-10 rounded-[inherit] bg-selected"
                              transition={
                                reduce ? { duration: 0 } : spring.morph
                              }
                            />
                          )}
                          {number}
                        </PaginationButton>
                      </PaginationItem>
                    )
                  })}
                  <PaginationItem className="ml-auto">
                    <PaginationNext
                      disabled={safePage === pageCount}
                      onClick={() => changePage(safePage + 1)}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </AutoHeight>
        </LayoutGroup>
      </section>
    </MotionScope>
  )
}

export { BlogGrid }
export type { BlogGridProps, BlogPost, BlogGridLabels }
