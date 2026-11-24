import { useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import type { TargetAndTransition } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { blur, duration, ease, spring, stagger } from './motion.ts'

type Glyph = { id: string; char: string; order: number; lead: number }

const toGlyphs = (chars: string[], run: number, lead = 0): Glyph[] =>
  chars.map((char, order) => ({ id: `${run}:${order}`, char, order, lead }))

/**
 * The letters of a text, each with a name that lasts: the letters shared at
 * the start and the end of the old and new texts keep theirs, so « Copier
 * le lien » → « Lien copié » only replaces what changed. Letters growing
 * out of an empty text wait a beat, the time for their shape to open.
 */
function useGlyphs(text: string): Glyph[] {
  const [state, setState] = useState(() => ({
    text,
    run: 0,
    glyphs: toGlyphs([...text], 0),
  }))
  if (state.text === text) {
    return state.glyphs
  }
  const before = [...state.text]
  const after = [...text]
  let start = 0
  let end = 0
  while (
    start < before.length &&
    start < after.length &&
    before[start] === after[start]
  ) {
    start++
  }
  while (
    end < before.length - start &&
    end < after.length - start &&
    before[before.length - 1 - end] === after[after.length - 1 - end]
  ) {
    end++
  }
  // A single shared letter is chance, not a shared word.
  if (start < 2) start = 0
  if (end < 2) end = 0
  const run = state.run + 1
  const glyphs = [
    ...state.glyphs.slice(0, start),
    ...toGlyphs(
      after.slice(start, after.length - end),
      run,
      before.length ? 0 : 0.1,
    ),
    ...state.glyphs.slice(state.glyphs.length - end),
  ]
  setState({ text, run, glyphs })
  return glyphs
}

const rest: TargetAndTransition = { opacity: 1, y: 0, filter: 'blur(0px)' }
const glyphIn: TargetAndTransition = {
  opacity: 0,
  y: 4,
  filter: `blur(${blur.soft}px)`,
}
const glyphOut: TargetAndTransition = {
  opacity: 0,
  y: -3,
  filter: `blur(${blur.subtle}px)`,
  transition: { duration: duration.fast, ease: ease.standard },
}
const fadeIn: TargetAndTransition = { ...rest, opacity: 0 }
const fadeOut: TargetAndTransition = {
  opacity: 0,
  transition: { duration: duration.instant },
}

/**
 * A text that morphs letter by letter, after Arc UI (https://uiarc.dev,
 * MIT): kept letters slide to their new place, new ones rise out of a soft
 * blur one after another (16ms apart, 120ms at most), old ones lift away
 * faster. Still, it only crossfades. Decorative: hide it from screen
 * readers (`aria-hidden` on a parent) and say the text another way.
 *
 * @summary Internal: the letter morph of SplitButton and ActionSwap.
 */
export function MorphText({ text }: { text: string }) {
  const reduce = useReduceMotion()
  const glyphs = useGlyphs(text)
  return (
    <span
      data-slot="morph-text"
      className="relative inline-flex flex-none whitespace-pre"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {glyphs.map((glyph) => (
          <m.span
            key={glyph.id}
            className="inline-block"
            layout={reduce ? false : 'position'}
            layoutDependency={text}
            initial={reduce ? fadeIn : glyphIn}
            animate={rest}
            exit={reduce ? fadeOut : glyphOut}
            transition={
              reduce
                ? { duration: duration.instant }
                : {
                    duration: duration.standard,
                    ease: ease.enter,
                    delay:
                      glyph.lead + Math.min(glyph.order * stagger.char, 0.12),
                    layout: spring.morph,
                  }
            }
          >
            {glyph.char}
          </m.span>
        ))}
      </AnimatePresence>
    </span>
  )
}
