import { useContext, useState } from 'react'
import type { HTMLAttributes, Ref } from 'react'
import { AnimatePresence, m } from 'motion/react'
import type { Transition } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import { MotionScope } from './motion-scope.tsx'
import { blur, duration, ease } from './motion.ts'
import { SelectSharedContext } from './select-context.ts'

// Arc UI's hand-tuned springs (https://uiarc.dev, MIT), none overshooting:
// the picked label flies a touch faster than the surface folds back.
const fly: Transition = { type: 'spring', visualDuration: 0.22, bounce: 0 }
const glide: Transition = { type: 'spring', visualDuration: 0.18, bounce: 0 }

type Shown = {
  value: unknown
  key: number
  from: { x: number; y: number } | null
}

type SelectMorphValueProps = HTMLAttributes<HTMLSpanElement> & {
  ref?: Ref<HTMLSpanElement>
  value: unknown
  isPlaceholder: boolean
}

/**
 * The value in a morph Select's lid: a label picked in the list flies up
 * from its row into place while the list folds back; any other change
 * rolls in.
 *
 * @summary Internal: the value of a morph Select's lid.
 */
export function SelectMorphValue({
  value,
  isPlaceholder,
  className,
  children,
  ...props
}: SelectMorphValueProps) {
  const shared = useContext(SelectSharedContext)
  const reduce = useReduceMotion()
  const [shown, setShown] = useState<Shown>({ value, key: 0, from: null })
  if (!Object.is(shown.value, value)) {
    const pick = shared?.pick
    setShown({
      value,
      key: shown.key + 1,
      from:
        pick && Object.is(pick.value, value) && !reduce
          ? { x: pick.x, y: pick.y }
          : null,
    })
  }
  const from = shown.from

  let transition: Transition = { duration: duration.instant }
  if (!reduce) {
    transition = from
      ? { x: fly, y: fly }
      : { y: glide, opacity: { duration: duration.fast, ease: ease.enter } }
  }

  return (
    <span
      {...props}
      data-slot="select-morph-value"
      className={cn(
        'relative grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)]',
        className,
      )}
    >
      <MotionScope>
        <AnimatePresence initial={false}>
          <m.span
            key={shown.key}
            data-placeholder={isPlaceholder || undefined}
            className="col-start-1 row-start-1 block truncate data-placeholder:text-fg-subtle"
            initial={
              from
                ? { x: from.x, y: from.y, opacity: 1 }
                : {
                    opacity: 0,
                    y: reduce ? 0 : '0.4em',
                    filter: `blur(${blur.subtle}px)`,
                  }
            }
            animate={{ x: 0, y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{
              opacity: 0,
              y: reduce ? 0 : '-0.3em',
              transition: { duration: duration.instant, ease: ease.standard },
            }}
            transition={transition}
          >
            {children}
          </m.span>
        </AnimatePresence>
      </MotionScope>
    </span>
  )
}
