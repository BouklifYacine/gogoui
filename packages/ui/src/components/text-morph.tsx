import { useCallback, useMemo, useRef, useState } from 'react'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { AnimatePresence, animate, m } from 'motion/react'
import type { AnimationPlaybackControls } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { blur, duration, ease, spring, stagger } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { cn } from '../lib/cn.ts'

type TextMorphProps = Omit<useRender.ComponentProps<'span'>, 'children'> & {
  /** The words. When they change, the letters they share glide to their new place. */
  children: string
}

// Leaving letters start to clear before the first new one sharpens in.
const HANDOFF = 0.05

/** Letters pair by character and rank: the second « e » of one word with the second « e » of the next. */
function toGlyphs(text: string) {
  const seen = new Map<string, number>()
  return Array.from(text).map((char) => {
    const count = seen.get(char) ?? 0
    seen.set(char, count + 1)
    return { char, key: `${char}-${count}` }
  })
}

/**
 * A short label that turns into the next one letter by letter, after Arc UI
 * (https://uiarc.dev, MIT): the letters both words share glide to their new
 * place, new ones sharpen in, the others blur away, and the width follows
 * on a spring so what stands beside it glides too.
 *
 * **Use it for** a status of a few words that changes a few letters at a
 * time: « Envoyer → Envoi… → Envoyé », « HEX → RGB ». **Not for** a figure
 * or a sentence (`RollingLine`), nor a button's whole label (`Button`
 * already crossfades its words).
 *
 * **Where**: inside a button, a badge, a field's addon. One line only.
 *
 * **States**: at rest, changing.
 *
 * **Key props**: `children` (a string), `render` (another element than a
 * span: `render={<strong />}`), `className`.
 *
 * **Accessibility**: the whole text is read once (`sr-only`), the moving
 * letters are hidden from screen readers; with reduced motion the words
 * swap in place.
 *
 * @deprecated Use `RollingLine`, which does the same change of words. Removed in 0.4.0.
 *
 * @summary A label that morphs into the next one, letter by letter.
 */
function TextMorph({ children, className, render, ...props }: TextMorphProps) {
  const reduce = useReduceMotion()
  const glyphs = useMemo(() => toGlyphs(children), [children])
  // The words before tell which letters are new: only those stagger in.
  const [labels, setLabels] = useState({
    current: children,
    previous: children,
  })
  if (labels.current !== children) {
    setLabels({ current: children, previous: labels.current })
  }
  const kept = useMemo(
    () => new Set(toGlyphs(labels.previous).map((glyph) => glyph.key)),
    [labels.previous],
  )
  const width = useRef(0)
  const measured = useRef(children)
  const sizing = useRef<AnimationPlaybackControls | null>(null)
  // Only the new letters stagger, in reading order.
  const arriving = glyphs
    .filter((glyph) => !kept.has(glyph.key))
    .map((glyph) => glyph.key)

  // The frame holds a width of its own, so new words never snap it: it
  // springs to the track, where the new letters already sit. A callback
  // ref, run again each time the words change.
  const followTrack = useCallback(
    (frame: HTMLSpanElement | null) => {
      const track = frame?.firstElementChild
      if (!frame || !(track instanceof HTMLElement)) {
        return undefined
      }
      const measure = () => parseFloat(getComputedStyle(track).width)
      const next = measure()
      const changed = measured.current !== children
      measured.current = children
      if (Number.isFinite(next)) {
        sizing.current?.stop()
        sizing.current = null
        if (
          changed &&
          width.current &&
          Math.abs(next - width.current) > 0.5 &&
          !reduce
        ) {
          const controls = animate(frame, { width: next }, spring.morph)
          sizing.current = controls
          void controls.then(() => {
            if (sizing.current === controls) {
              sizing.current = null
            }
          })
        } else {
          frame.style.width = `${next}px`
        }
        width.current = next
      }
      // A late font changes the width without new words: follow it at once.
      if (typeof ResizeObserver === 'undefined') {
        return undefined
      }
      const observer = new ResizeObserver(() => {
        const size = measure()
        if (!Number.isFinite(size) || Math.abs(size - width.current) < 0.5) {
          return
        }
        if (sizing.current) {
          return
        }
        frame.style.width = `${size}px`
        width.current = size
      })
      observer.observe(track)
      return () => observer.disconnect()
    },
    // The words are what the frame follows: a new label measures again.
    [children, reduce],
  )

  return useRender({
    defaultTagName: 'span',
    render,
    props: mergeProps<'span'>(
      {
        className: cn('inline-block', className),
        children: (
          <>
            <span className="sr-only">{children}</span>
            {/* The frame carries the width. Its mask fades the trailing edge
                over .5em, in padding given back by negative margins, so the
                resting text is never dimmed. */}
            <span
              ref={followTrack}
              aria-hidden="true"
              className="relative -my-[.5em] -mr-[.5em] -ml-[.2em] box-content inline-block py-[.5em] pr-[.5em] pl-[.2em] text-start whitespace-nowrap [mask-image:linear-gradient(90deg,#000_calc(100%-.5em),transparent)]"
            >
              <span className="relative inline-block whitespace-nowrap">
                <MotionScope>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {glyphs.map(({ char, key }) => {
                      const order = Math.max(0, arriving.indexOf(key))
                      return (
                        <m.span
                          key={key}
                          layout="position"
                          className="inline-block origin-[50%_60%] whitespace-pre"
                          initial={
                            reduce
                              ? false
                              : {
                                  opacity: 0,
                                  scale: 0.8,
                                  y: '0.14em',
                                  filter: `blur(${blur.soft}px)`,
                                }
                          }
                          animate={{
                            opacity: 1,
                            scale: 1,
                            y: '0em',
                            filter: 'blur(0px)',
                          }}
                          exit={
                            reduce
                              ? { opacity: 0, transition: { duration: 0 } }
                              : {
                                  opacity: 0,
                                  scale: 0.86,
                                  y: '-0.1em',
                                  filter: `blur(${blur.soft}px)`,
                                  transition: {
                                    duration: duration.exit,
                                    ease: ease.standard,
                                  },
                                }
                          }
                          transition={
                            reduce
                              ? { duration: 0 }
                              : {
                                  layout: spring.morph,
                                  default: {
                                    duration: duration.standard + 0.04,
                                    ease: ease.enter,
                                    delay:
                                      HANDOFF +
                                      Math.min(order, 8) * stagger.char * 2,
                                  },
                                }
                          }
                        >
                          {char === ' ' ? ' ' : char}
                        </m.span>
                      )
                    })}
                  </AnimatePresence>
                </MotionScope>
              </span>
            </span>
          </>
        ),
      },
      props,
    ),
    state: { slot: 'text-morph' },
  })
}

export { TextMorph }
export type { TextMorphProps }
