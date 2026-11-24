import { useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import type { Variants } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { blur, duration, ease } from './motion.ts'
import { MotionScope } from './motion-scope.tsx'

// A later date rises from below, an earlier one drops from above.
const roll: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    y: `${direction * 0.35}em`,
    filter: `blur(${blur.soft}px)`,
  }),
  center: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: duration.standard, ease: ease.enter },
  },
  exit: (direction: number) => ({
    opacity: 0,
    y: `${direction * -0.3}em`,
    filter: `blur(${blur.subtle}px)`,
    transition: { duration: duration.fast, ease: ease.standard },
  }),
}

// Reduced motion: a quick crossfade, nothing travels.
const fade: Variants = {
  enter: { opacity: 0 },
  center: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: duration.instant },
  },
  exit: { opacity: 0, transition: { duration: duration.instant } },
}

const capitalize = (text: string) =>
  text.charAt(0).toLocaleUpperCase() + text.slice(1)

/**
 * A day in words whose changed parts roll, after Arc UI's date picker
 * (https://uiarc.dev, MIT): from « samedi 12 juin 2027 » to « samedi 12
 * juillet 2027 », only « juillet » rolls, upwards when the date moves
 * later; the parts beside it shift on the same curve. The whole date is
 * read once, the moving parts are hidden from screen readers.
 *
 * @summary Internal: DateField's day in words, rolling part by part.
 */
export function RollingDate({
  date,
  locale,
  id,
  className,
}: {
  date: Date
  locale: string
  id?: string
  className?: string
}) {
  const reduce = useReduceMotion()
  const time = date.getTime()
  const [seen, setSeen] = useState(time)
  const [direction, setDirection] = useState(1)
  if (seen !== time) {
    setSeen(time)
    setDirection(time >= seen ? 1 : -1)
  }
  const parts = new Intl.DateTimeFormat(locale, {
    dateStyle: 'full',
  }).formatToParts(date)
  const first = parts.findIndex((part) => part.type !== 'literal')
  const words = parts.map((part, index) =>
    index === first ? capitalize(part.value) : part.value,
  )
  const shift = reduce
    ? { duration: 0 }
    : { duration: duration.standard, ease: ease.enter }

  return (
    <p id={id} className={className}>
      <span className="sr-only">{capitalize(words.join(''))}</span>
      <span aria-hidden="true" className="inline-flex whitespace-pre">
        <MotionScope>
          {parts.map((part, index) => (
            <m.span
              key={`${index}-${part.type}`}
              layout="position"
              layoutDependency={time}
              transition={shift}
              className="relative inline-flex whitespace-pre"
            >
              {part.type === 'literal' ? (
                words[index]
              ) : (
                <AnimatePresence
                  mode="popLayout"
                  initial={false}
                  custom={direction}
                >
                  <m.span
                    key={words[index]}
                    custom={direction}
                    variants={reduce ? fade : roll}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="inline-block whitespace-pre"
                  >
                    {words[index]}
                  </m.span>
                </AnimatePresence>
              )}
            </m.span>
          ))}
        </MotionScope>
      </span>
    </p>
  )
}
