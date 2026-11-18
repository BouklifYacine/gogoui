/**
 * A number typed as people write it: « 1 500 », « 1 500,50 », « 1,500.50 »,
 * or null when it is not one. Spaces are dropped; the last comma or dot
 * is the decimal mark when two digits or fewer follow it.
 */
export function parseTypedNumber(typed: string): number | null {
  const text = typed.replace(/[\s  ]/g, '')
  if (!/^\d[\d.,]*$/.test(text)) {
    return null
  }
  const lastMark = Math.max(text.lastIndexOf(','), text.lastIndexOf('.'))
  const decimals = lastMark === -1 ? '' : text.slice(lastMark + 1)
  const whole =
    lastMark !== -1 && decimals.length <= 2 ? text.slice(0, lastMark) : text
  const fraction = lastMark !== -1 && decimals.length <= 2 ? decimals : ''
  const digits = whole.replace(/[.,]/g, '')
  const number = Number(fraction ? `${digits}.${fraction}` : digits)
  return Number.isFinite(number) ? number : null
}

/** What a number filter counts: money in a currency, or a plain count. */
export type NumberUnit = { kind: 'money'; currency: string } | { kind: 'count' }

/** A number in words for its unit: « 1 500 € », « 120 ». */
export function formatNumber(
  value: number,
  locale: string,
  unit: NumberUnit,
): string {
  return unit.kind === 'money'
    ? new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: unit.currency,
        maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
      }).format(value)
    : new Intl.NumberFormat(locale).format(value)
}

/** A number as typed back in its field: « 1 500,5 » without the symbol. */
export function typedNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(value)
}
