import { CopyButton } from '../components/copy-button.tsx'
import type { ChangelogMedia as ChangelogMediaData } from '../components/changelog-feed.tsx'

/**
 * The photo or the code under an opened release note of ChangelogFeed,
 * after Arc UI (https://uiarc.dev, MIT): a 16/10 photo with its caption, or
 * a code block with its file name and a copy button.
 *
 * @summary Internal: a release note's photo or code.
 */
export function ChangelogMediaView({ media }: { media: ChangelogMediaData }) {
  if (media.type === 'photo') {
    return (
      <figure className="mt-4.5 max-w-140">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-tray after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-fg/8 after:ring-inset">
          <img
            src={media.src}
            alt={media.alt}
            width={media.width}
            height={media.height}
            loading="lazy"
            decoding="async"
            className="block size-full object-cover"
          />
        </div>
        {media.caption && (
          <figcaption className="mt-2 text-xs text-fg-subtle">
            {media.caption}
          </figcaption>
        )}
      </figure>
    )
  }
  return (
    <div className="mt-4.5 max-w-140 overflow-hidden rounded-2xl bg-subtle ring-1 ring-line ring-inset">
      <div className="flex h-12 items-center justify-between gap-3 border-b border-line pr-1.5 pl-3.5 text-xs text-fg-subtle">
        <span className="truncate font-mono">{media.file}</span>
        <CopyButton text={media.code} className="h-8 max-md:h-9" />
      </div>
      {/* A long line wraps instead of scrolling: no hidden part to reach
          with the keyboard, and the copy button gives the code as is. */}
      <pre className="px-4 pt-3.5 pb-4 font-mono text-xs leading-[1.7] break-words whitespace-pre-wrap text-fg [tab-size:2]">
        <code>{media.code}</code>
      </pre>
    </div>
  )
}
