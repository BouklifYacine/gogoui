/** A field's first error in words (Zod and Valibot give { message } objects). */
export function firstErrorMessage(
  errors: readonly unknown[],
): string | undefined {
  const [first] = errors
  if (typeof first === 'string') {
    return first
  }
  if (first && typeof first === 'object' && 'message' in first) {
    return String(first.message)
  }
  return undefined
}
