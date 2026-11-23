import { useState } from 'react'
import { motion, useMotionValue } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { duration, spring } from './motion.ts'
import { RollingGlyph } from './rolling-glyph.tsx'

const FIGURES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

// The first roll up from zero is a little slower than a change.
const reveal = { ...spring.smooth, visualDuration: duration.considered }

type Wheel = {
  digit: number
  /** Where the wheel turns to: it keeps counting past 9, like an odometer. */
  target: number
  revealed: boolean
  /** This turn is the first roll up from zero. */
  entering: boolean
}

/**
 * One digit wheel, after Arc UI (https://uiarc.dev, MIT): it turns the way
 * the whole number moved and goes 9 → 0 like an odometer. Its window
 * reaches past the line and fades at the edges, so a figure fades out
 * rather than being cut. A new column opens in width.
 *
 * Shared by RollingNumber and every figure that rolls (BillingPrice, a
 * slider's bubble).
 *
 * @summary Internal: one rolling digit of RollingNumber.
 */
export function RollingDigit({
  digit,
  direction,
  armed = false,
  delay = 0,
}: {
  digit: number
  /** 1 when the number went up, −1 when it went down. */
  direction: number
  /** Waits at 0 until the number is seen (`animateOnView`). */
  armed?: boolean
  /** The wait before the first roll up from zero, in seconds. */
  delay?: number
}) {
  const reduce = useReduceMotion()
  const start = armed ? 0 : digit
  const position = useMotionValue(start)
  const [wheel, setWheel] = useState<Wheel>({
    digit: start,
    target: start,
    revealed: !armed,
    entering: false,
  })
  // The digit changed (or the number was just seen): the wheel takes its
  // next turn, decided here during the render rather than in an effect.
  if (!armed && (wheel.digit !== digit || !wheel.revealed)) {
    const step =
      wheel.digit === digit
        ? 0
        : direction < 0 && wheel.revealed
          ? -((wheel.digit - digit + 10) % 10)
          : (digit - wheel.digit + 10) % 10
    setWheel({
      digit,
      target: wheel.target + step,
      revealed: true,
      entering: !wheel.revealed,
    })
  }

  return (
    <motion.span
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 'auto', opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={reduce ? { duration: 0 } : spring.morph}
      className="relative inline-block overflow-hidden [--feather:0.16em] my-[calc(var(--feather)*-1)] py-(--feather) [mask-image:linear-gradient(to_bottom,transparent,#000_calc(var(--feather)*1.5),#000_calc(100%-var(--feather)*1.5),transparent)]"
    >
      {/* Sizes the wheel, and carries its turn: motion springs this
          variable, and each frame moves the wheel's position. */}
      <motion.span
        className="invisible"
        initial={false}
        animate={{ '--wheel': wheel.target }}
        transition={
          reduce
            ? { duration: 0 }
            : wheel.entering
              ? { ...reveal, delay }
              : spring.smooth
        }
        onUpdate={(latest) => position.set(Number(latest['--wheel']))}
      >
        0
      </motion.span>
      {reduce ? (
        <span className="absolute inset-x-0 inset-y-(--feather) text-center">
          {digit}
        </span>
      ) : (
        FIGURES.map((figure) => (
          <RollingGlyph key={figure} position={position} digit={figure} />
        ))
      )}
    </motion.span>
  )
}
