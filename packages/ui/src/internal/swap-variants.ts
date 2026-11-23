import type { Variants } from 'motion/react'

import { blur, duration, ease } from './motion.ts'

/**
 * Words that change in place, after Arc UI (https://uiarc.dev, MIT): the
 * new ones rise 0.45em out of a slight blur, the old ones leave upward,
 * quicker. For `initial="hidden" animate="shown" exit="gone"`.
 */
export const swapRise: Variants = {
  hidden: { opacity: 0, y: '0.45em', filter: `blur(${blur.subtle}px)` },
  shown: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: duration.standard, ease: ease.enter },
  },
  gone: {
    opacity: 0,
    y: '-0.45em',
    filter: `blur(${blur.subtle}px)`,
    transition: { duration: duration.fast, ease: ease.standard },
  },
}

/** The same change with reduced motion: a plain fade. */
export const swapFade: Variants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: duration.fast } },
  gone: { opacity: 0, transition: { duration: 0 } },
}
