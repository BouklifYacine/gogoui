import { AnimatePresence, motion } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import { blur, duration, ease } from './motion.ts'

type ChipMoreProps = {
  /** The words it shows: « +4 de plus », or « Voir moins » once open. */
  text: string
  expanded: boolean
  /** The id of the group it folds and unfolds. */
  controls: string
  size: 'sm' | 'default'
  onToggle: () => void
}

/**
 * The last chip of a folded ToggleGroup variant="chips", after Arc UI
 * (https://uiarc.dev, MIT): it shows the folded chips, then folds them
 * back; its words rise in as they change.
 *
 * @summary Internal: the « +N de plus » chip of a chip group.
 */
export function ChipMore({
  text,
  expanded,
  controls,
  size,
  onToggle,
}: ChipMoreProps) {
  const reduce = useReduceMotion()

  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={onToggle}
      className={cn(
        'group/chip relative inline-flex shrink-0 items-center rounded-full bg-subtle text-sm font-medium text-fg-muted tabular-nums ring-1 ring-line outline-none ring-inset hover:text-fg hover:ring-line-strong focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus',
        size === 'sm' ? 'h-7 px-2.5 max-md:h-9' : 'h-8 px-3 max-md:h-10',
      )}
    >
      <span className="inline-grid">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={text}
            className="col-start-1 row-start-1 whitespace-nowrap"
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, y: '0.3em', filter: `blur(${blur.soft}px)` }
            }
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={
              reduce
                ? { opacity: 0, transition: { duration: duration.fast } }
                : {
                    opacity: 0,
                    y: '-0.3em',
                    filter: `blur(${blur.subtle}px)`,
                    transition: {
                      duration: duration.fast,
                      ease: ease.standard,
                    },
                  }
            }
            transition={{
              duration: reduce ? duration.fast : duration.standard,
              ease: ease.enter,
            }}
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  )
}
