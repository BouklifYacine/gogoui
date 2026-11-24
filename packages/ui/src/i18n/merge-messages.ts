import type { GoGoUIMessages } from './messages.ts'

/**
 * The words of `base`, with each word of `overrides` written over it. A
 * word left `undefined` keeps the base's, so `{ close: undefined }` changes
 * nothing. Without overrides, `base` itself comes back.
 *
 * @summary Write a few words, or a whole language, over GoGoUI's words.
 */
export function mergeMessages(
  base: GoGoUIMessages,
  overrides?: Partial<GoGoUIMessages>,
): GoGoUIMessages {
  if (!overrides) return base
  const givenWords = Object.fromEntries(
    Object.entries(overrides).filter(([, word]) => word !== undefined),
  )
  return { ...base, ...givenWords }
}
