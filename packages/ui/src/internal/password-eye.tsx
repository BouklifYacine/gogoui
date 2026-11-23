import { useId } from 'react'
import { motion } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { duration, ease } from './motion.ts'

const SLASH = 'M3 3l18 18'

/**
 * One eye that a slash draws across, cutting the outline under it, after
 * Arc UI (https://uiarc.dev, MIT), instead of swapping two icons. A mask
 * follows the slash, so the outline opens where it crosses. Drawn by hand
 * (not a provider icon): only a path can be drawn.
 *
 * @summary Internal: the animated eye of PasswordInput.
 */
export function PasswordEye({ slashed }: { slashed: boolean }) {
  const reduce = useReduceMotion()
  const maskId = `password-eye-${useId().replace(/[^\w-]/g, '')}`
  const slash = { pathLength: slashed ? 1 : 0, opacity: slashed ? 1 : 0 }
  const transition = reduce
    ? { duration: 0 }
    : {
        pathLength: { duration: duration.standard, ease: ease.standard },
        opacity: { duration: duration.instant },
      }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4.5"
    >
      <mask
        id={maskId}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="24"
      >
        <rect width="24" height="24" fill="white" stroke="none" />
        <motion.path
          d={SLASH}
          stroke="black"
          strokeWidth={5}
          initial={false}
          animate={slash}
          transition={transition}
        />
      </mask>
      <g mask={`url(#${maskId})`}>
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
        <circle cx="12" cy="12" r="3" />
      </g>
      <motion.path
        d={SLASH}
        initial={false}
        animate={slash}
        transition={transition}
      />
    </svg>
  )
}
