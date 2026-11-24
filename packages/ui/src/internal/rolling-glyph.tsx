import { m, useTransform } from 'motion/react'
import type { MotionValue } from 'motion/react'

import { blur } from './motion.ts'

/**
 * One figure on a digit wheel, after Arc UI (https://uiarc.dev, MIT). Its
 * distance from the wheel's position sets where it sits (1em a step), how
 * much it shows (1 − distance) and how blurred it is.
 *
 * @summary Internal: one figure of RollingDigit's wheel.
 */
export function RollingGlyph({
  position,
  digit,
}: {
  position: MotionValue<number>
  digit: number
}) {
  // The shortest way round the wheel, between −5 and 5.
  const offset = useTransform(
    position,
    (current) => ((((digit - current) % 10) + 15) % 10) - 5,
  )
  const y = useTransform(offset, (current) => `${current}em`)
  const opacity = useTransform(offset, (current) =>
    Math.max(0, 1 - Math.abs(current)),
  )
  const visibility = useTransform(offset, (current) =>
    Math.abs(current) >= 1 ? 'hidden' : 'visible',
  )
  const filter = useTransform(offset, (current) =>
    Math.abs(current) < 0.02 || Math.abs(current) >= 1
      ? 'none'
      : `blur(${(Math.abs(current) * blur.subtle).toFixed(2)}px)`,
  )
  return (
    <m.span
      style={{ y, opacity, filter, visibility }}
      className="absolute inset-x-0 inset-y-(--feather) text-center"
    >
      {digit}
    </m.span>
  )
}
