import { Children, isValidElement, useId, useState } from 'react'
import type { ReactElement } from 'react'
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import type { Transition } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import { ChipContext } from './chip-context.ts'
import { ChipMore } from './chip-more.tsx'
import { FollowHeight } from './follow-height.tsx'
import { MotionScope } from './motion-scope.tsx'
import { duration, ease, spring, stagger } from './motion.ts'

/** The words ChipGroup writes, to change on one ChipGroup only. */
type ChipGroupLabels = Partial<Pick<GoGoUIMessages, 'chipsMore' | 'chipsLess'>>

type ChipGroupProps = ToggleGroupPrimitive.Props & {
  maxVisible: number
  size: 'sm' | 'default'
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: ChipGroupLabels
}

/**
 * ToggleGroup variant="chips", after Arc UI's chip group
 * (https://uiarc.dev, MIT): chips that wrap, glide to their new place when
 * one grows or shrinks (even to another line), and fold past `maxVisible`
 * behind a « +N de plus » chip. Unfolding opens the height on a spring and
 * the revealed chips arrive one after another; chips pressed when it folds
 * stay in view.
 *
 * **Key props**: `labels` to change its words.
 *
 * @summary Internal: the chips variant of ToggleGroup.
 */
export function ChipGroup({
  value,
  defaultValue,
  onValueChange,
  maxVisible,
  size,
  className,
  children,
  labels,
  ...props
}: ChipGroupProps) {
  const { chipsMore, chipsLess } = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const groupId = useId()
  const [own, setOwn] = useState<readonly string[]>(defaultValue ?? [])
  const pressed = value ?? own
  const [expanded, setExpanded] = useState(false)
  // Chips pressed when the group folds stay in view, so a choice is never
  // hidden and letting one go never makes it vanish.
  const [pinned, setPinned] = useState<readonly string[]>(pressed)

  const items = Children.toArray(children).filter(
    (child): child is ReactElement<{ value?: string }> => isValidElement(child),
  )
  const foldable = items.length > maxVisible
  const shown =
    !foldable || expanded
      ? items
      : items.filter((item, index) => {
          const itemValue = item.props.value ?? ''
          return (
            index < maxVisible ||
            pinned.includes(itemValue) ||
            pressed.includes(itemValue)
          )
        })
  const hidden = items.length - shown.length

  const enter = (index: number): Transition => {
    if (reduce) {
      return { layout: { duration: 0 }, duration: duration.fast }
    }
    // Revealed chips arrive one after another, in reading order.
    const delay = expanded
      ? Math.min(Math.max(0, index - maxVisible) * stagger.item, 0.3)
      : 0
    return {
      layout: spring.morph,
      default: { ...spring.snappy, delay },
      opacity: { duration: duration.fast, ease: ease.standard, delay },
    }
  }

  return (
    <ChipContext value={{ size }}>
      <MotionScope>
        <LayoutGroup id={groupId}>
          {/* The negative margin and the padding give focus rings room. */}
          <FollowHeight className="-m-1">
            <ToggleGroupPrimitive
              id={groupId}
              data-slot="toggle-group"
              data-variant="chips"
              value={pressed}
              onValueChange={(next, details) => {
                if (value === undefined) {
                  setOwn(next)
                }
                onValueChange?.(next, details)
              }}
              className={cn('relative flex flex-wrap gap-2 p-1', className)}
              {...props}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {shown.map((item, index) => (
                  <motion.span
                    key={item.key}
                    layout="position"
                    className="relative z-10 inline-flex max-w-full"
                    initial={
                      reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }
                    }
                    animate={{ opacity: 1, scale: 1 }}
                    exit={
                      reduce
                        ? {
                            opacity: 0,
                            transition: { duration: duration.fast },
                          }
                        : {
                            opacity: 0,
                            scale: 0.9,
                            transition: {
                              duration: duration.instant,
                              ease: ease.standard,
                            },
                          }
                    }
                    transition={enter(index)}
                  >
                    {item}
                  </motion.span>
                ))}
                {foldable && (expanded || hidden > 0) && (
                  // It travels under the chips it reveals, so they seem to
                  // come out of it.
                  <motion.span
                    key="more"
                    layout="position"
                    className="inline-flex"
                    transition={{
                      layout: reduce ? { duration: 0 } : spring.morph,
                    }}
                  >
                    <ChipMore
                      text={expanded ? chipsLess : chipsMore(hidden)}
                      expanded={expanded}
                      controls={groupId}
                      size={size}
                      onToggle={() => {
                        if (expanded) {
                          setPinned(pressed)
                        }
                        setExpanded(!expanded)
                      }}
                    />
                  </motion.span>
                )}
              </AnimatePresence>
            </ToggleGroupPrimitive>
          </FollowHeight>
        </LayoutGroup>
      </MotionScope>
    </ChipContext>
  )
}
export type { ChipGroupLabels }
