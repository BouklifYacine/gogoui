import type { ReactElement } from 'react'
import { useRender } from '@base-ui/react/use-render'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { cn } from '../lib/cn.ts'

/** The words BlogCard writes, to change on one BlogCard only. */
type BlogCardLabels = Partial<Pick<GoGoUIMessages, 'blogReadingTime'>>

type BlogCardProps = {
  title: string
  /** The post's page. */
  href: string
  /** The publication day, ISO (`2026-11-18`): written in the provider's language. */
  date: string
  category?: string
  /** Two lines (three when featured), cut with « … ». */
  excerpt?: string
  /** Minutes of reading: « 6 min de lecture ». */
  readingTime?: number
  author?: string
  image?: { src: string; alt: string }
  /** `featured`: the large card at the top of an index, image beside the words. */
  variant?: 'default' | 'featured'
  /**
   * The router's link to render instead of `<a>`, Base UI style:
   * `linkRender={<Link to="/blog/caution" />}`.
   */
  linkRender?: ReactElement
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: BlogCardLabels
}

/**
 * A blog post's card: its image, its category and day, its title and a
 * short excerpt, after Arc UI (https://uiarc.dev, MIT).
 *
 * **Use it for** a blog index, the latest posts on a landing page.
 * **Not for** a record of the app (`Card`, `Item`).
 *
 * **Where**: in a grid of 1 to 3 columns (`BlogGrid` lays them out), or one
 * `featured` card above it.
 *
 * **States**: at rest, pointed at (the image zooms to 1.03, the title
 * fades a step), pressed (the image shrinks to .99), focused (an outline
 * around the whole card). Featured, under 680 px of width the image goes
 * above the words.
 *
 * **Key props**: `title`, `href` (or `linkRender` for a router link),
 * `date`, `category`, `excerpt`, `readingTime`, `author`, `image`,
 * `variant` (default, featured), `labels` to change its words.
 *
 * **Accessibility**: the link is the title alone, stretched over the card,
 * so its name stays short; an `h3`; the day is a `<time>`. Still with
 * reduced motion.
 *
 * @summary A blog post's card: image, category, day, title, excerpt.
 */
function BlogCard({
  title,
  href,
  date,
  category,
  excerpt,
  readingTime,
  author,
  image,
  variant = 'default',
  linkRender,
  className,
  labels,
}: BlogCardProps) {
  const messages = useGoGoUIMessages(labels)
  const featured = variant === 'featured'
  const day = new Intl.DateTimeFormat(messages.intlLocale, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))

  // The title's link covers the whole card through its ::after.
  const link = useRender({
    defaultTagName: 'a',
    render: linkRender,
    props: {
      href,
      className: 'outline-none after:absolute after:inset-0 after:rounded-3xl',
      children: title,
    },
  })

  return (
    <article
      data-slot="blog-card"
      data-variant={variant}
      className={cn(
        'group/blog-card @container relative rounded-3xl text-fg has-focus-visible:outline-2 has-focus-visible:outline-focus has-focus-visible:outline-solid',
        className,
      )}
    >
      <div
        className={cn(
          'grid content-start gap-4',
          featured &&
            'grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] items-center gap-10 @max-[900px]:gap-6 @max-[680px]:grid-cols-1 @max-[680px]:gap-4',
        )}
      >
        {image && (
          <div
            className={cn(
              'relative aspect-[3/2] overflow-hidden rounded-2xl bg-tray transition-transform duration-(--motion-fast) ease-standard group-active/blog-card:scale-[0.99] motion-reduce:transition-none motion-reduce:group-active/blog-card:scale-100',
              featured &&
                'aspect-[16/10] rounded-3xl @max-[680px]:aspect-[3/2] @max-[680px]:rounded-2xl',
            )}
          >
            <img
              src={image.src}
              alt={image.alt}
              loading={featured ? 'eager' : 'lazy'}
              decoding="async"
              className="block size-full object-cover transition-transform duration-(--motion-considered) ease-standard group-hover/blog-card:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover/blog-card:scale-100"
            />
          </div>
        )}
        <div className={cn('grid content-start gap-2', featured && 'gap-3')}>
          <p className="flex flex-wrap gap-1.5 text-xs text-fg-subtle">
            {category && (
              <>
                <span className="font-medium text-fg">{category}</span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <time dateTime={date}>{day}</time>
          </p>
          <h3
            className={cn(
              'text-lg font-medium text-balance text-fg transition-colors duration-(--motion-fast) ease-standard',
              featured
                ? 'font-heading text-2xl @min-[900px]:text-3xl'
                : 'group-hover/blog-card:text-fg-muted',
            )}
          >
            {link}
          </h3>
          {excerpt && (
            <p
              className={cn(
                'line-clamp-2 text-sm text-pretty text-fg-muted',
                featured && 'line-clamp-3 text-base',
              )}
            >
              {excerpt}
            </p>
          )}
          {author || readingTime ? (
            <p className="mt-1 flex min-w-0 items-center gap-2 text-sm">
              {author && <span className="truncate">{author}</span>}
              {author && readingTime ? (
                <span aria-hidden="true" className="text-fg-subtle">
                  ·
                </span>
              ) : null}
              {readingTime ? (
                <span className="shrink-0 text-fg-subtle">
                  {messages.blogReadingTime(readingTime)}
                </span>
              ) : null}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export { BlogCard }
export type { BlogCardProps, BlogCardLabels }
