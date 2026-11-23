import { AnimatePresence, motion } from 'motion/react'

import { RollingNumber } from '../components/rolling-number.tsx'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { blur, duration, ease } from './motion.ts'

/**
 * A small plain count (« 12 »): it rolls instead of rising. Four digits
 * and more stay words: a year must not be written « 2 027 ».
 */
const isCount = (word: string) => /^\d{1,3}$/.test(word)

/**
 * A line of words where only the changed words move, after Arc UI
 * (https://uiarc.dev, MIT): a new word rises 0.35em out of a 4px blur, a
 * leaving word drops away, the others hold still, and a count rolls its
 * digits. A screen reader reads the plain text once.
 *
 * @summary Internal: the moving words of a field's help and error.
 */
export function MotionWords({ text }: { text: string }) {
  const reduce = useReduceMotion()
  const words = text.split(' ')

  return (
    <>
      <span className="sr-only">{text}</span>
      {/* Leaving words pop out against this box: it must be positioned. */}
      <span aria-hidden="true" className="relative block">
        <AnimatePresence initial={false} mode="popLayout">
          {words.map((word, index) => (
            <motion.span
              // A count keeps its key so its digits roll in place.
              key={`${index}:${isCount(word) ? '#' : word}`}
              className="inline-block whitespace-pre"
              initial={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: '0.35em', filter: `blur(${blur.soft}px)` }
              }
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={
                reduce
                  ? { opacity: 0, transition: { duration: 0 } }
                  : {
                      opacity: 0,
                      y: '-0.35em',
                      filter: `blur(${blur.subtle}px)`,
                      transition: {
                        duration: duration.exit,
                        ease: ease.standard,
                      },
                    }
              }
              transition={
                reduce
                  ? { duration: duration.instant }
                  : { duration: duration.standard, ease: ease.enter }
              }
            >
              {isCount(word) ? <RollingNumber value={Number(word)} /> : word}
              {index < words.length - 1 ? ' ' : null}
            </motion.span>
          ))}
        </AnimatePresence>
      </span>
    </>
  )
}
