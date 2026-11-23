// How RollingNumber cuts a formatted number into wheels and signs, after
// Arc UI (https://uiarc.dev, MIT licence, Elia Kuratli).

/** A digit on its wheel, or a sign (group, decimal, currency, minus…). */
export type RollingPart =
  { key: string; digit: number; order: number } | { key: string; text: string }

/**
 * Splits a formatted number into parts keyed by place value (`i0` the
 * ones, `i1` the tens…), so 999 → 1 000 keeps the ones on the ones wheel and
 * only a new column opens on the left. Signs are keyed by their kind and
 * rank, so a currency sign stays put when a digit joins.
 */
export function rollingParts(
  value: number,
  locale: string,
  format: Intl.NumberFormatOptions = {},
): RollingPart[] {
  const parts = new Intl.NumberFormat(locale, {
    ...format,
    numberingSystem: 'latn',
  }).formatToParts(value)
  let place = parts.reduce(
    (count, part) => count + (part.type === 'integer' ? part.value.length : 0),
    0,
  )
  let fraction = 0
  let order = 0
  const seen = new Map<string, number>()
  return parts.flatMap((part): RollingPart[] => {
    if (part.type === 'integer') {
      return [...part.value].map((char) => ({
        key: `i${--place}`,
        digit: Number(char),
        order: order++,
      }))
    }
    if (part.type === 'fraction') {
      return [...part.value].map((char) => ({
        key: `f${fraction++}`,
        digit: Number(char),
        order: order++,
      }))
    }
    if (part.type === 'group') {
      return [{ key: `g${place}`, text: part.value }]
    }
    const rank = seen.get(part.type) ?? 0
    seen.set(part.type, rank + 1)
    return [{ key: `${part.type}${rank}`, text: part.value }]
  })
}
