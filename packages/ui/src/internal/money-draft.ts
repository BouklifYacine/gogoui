// How MoneyField reads and writes an amount as it is typed, after Arc UI's
// money input (https://uiarc.dev, MIT licence, Elia Kuratli). A draft is
// the amount in a plain form: digits and an optional « . », like « 1234.5 ».

/** The cents an amount keeps. */
export const MONEY_DECIMALS = 2
const MAX_WHOLE_DIGITS = 12

/** The language's group and decimal marks: « 1 234,5 » in French. */
export function moneySymbols(locale: string) {
  const parts = new Intl.NumberFormat(locale, {
    numberingSystem: 'latn',
  }).formatToParts(12345.6)
  return {
    group: parts.find((part) => part.type === 'group')?.value ?? ',',
    decimal: parts.find((part) => part.type === 'decimal')?.value ?? '.',
  }
}

export type MoneySymbols = ReturnType<typeof moneySymbols>

/**
 * What the field holds read into a draft, with how many digits and marks
 * sit before the caret, so the caret comes back to the same place. Null
 * when the keystroke must be refused (a third cent, too many digits).
 */
export function readMoney(
  raw: string,
  caret: number,
  symbols: MoneySymbols,
): { draft: string; before: number } | null {
  let out = ''
  let before = 0
  let dot = false
  for (let index = 0; index < raw.length; index++) {
    const char = raw[index] ?? ''
    let kept = ''
    if (/\d/.test(char)) {
      kept = char
    } else if (
      (char === symbols.decimal || (char === '.' && symbols.group !== '.')) &&
      !dot
    ) {
      kept = '.'
      dot = true
    }
    if (!kept) {
      continue
    }
    out += kept
    if (index < caret) {
      before++
    }
  }
  const [rawWhole = '', fraction] = out.split('.')
  const stripped = rawWhole.length - rawWhole.replace(/^0+/, '').length
  let whole = rawWhole.replace(/^0+/, '')
  let shift = -Math.min(stripped, before)
  if (!whole && (fraction !== undefined || stripped > 0)) {
    whole = '0'
    shift += 1
  }
  if (fraction !== undefined && fraction.length > MONEY_DECIMALS) {
    return null
  }
  if (whole.length > MAX_WHOLE_DIGITS) {
    return null
  }
  return {
    draft: fraction === undefined ? whole : `${whole}.${fraction}`,
    before: Math.max(0, before + shift),
  }
}

/** A draft in cents, or null when empty. */
export function moneyCents(draft: string): number | null {
  if (!draft) {
    return null
  }
  const [whole = '', fraction = ''] = draft.split('.')
  return (
    Number(whole || '0') * 10 ** MONEY_DECIMALS +
    Number(fraction.padEnd(MONEY_DECIMALS, '0').slice(0, MONEY_DECIMALS))
  )
}

/** Cents back into a draft; whole euros stay whole unless `keepCents`. */
export function moneyDraft(cents: number, keepCents: boolean): string {
  const whole = Math.trunc(cents / 10 ** MONEY_DECIMALS)
  const rest = cents % 10 ** MONEY_DECIMALS
  return rest === 0 && !keepCents
    ? String(whole)
    : `${whole}.${String(rest).padStart(MONEY_DECIMALS, '0')}`
}

/** A draft as the field shows it: « 1 234,5 ». */
export function moneyText(draft: string, symbols: MoneySymbols): string {
  if (!draft) {
    return ''
  }
  const [whole = '', fraction] = draft.split('.')
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, symbols.group)
  return fraction === undefined
    ? grouped
    : `${grouped}${symbols.decimal}${fraction}`
}

/** One character of the painted amount; `ghost` for cents not typed yet. */
export type MoneyPart = { key: string; char: string; ghost: boolean }

/**
 * The amount cut in columns keyed by place value, so 9 → 10 keeps the ones
 * column. Missing cents are ghosts that hold their width.
 */
export function moneyParts(draft: string, symbols: MoneySymbols): MoneyPart[] {
  if (!draft) {
    return []
  }
  const [whole = '', fraction] = draft.split('.')
  const parts: MoneyPart[] = []
  ;[...whole].forEach((char, index) => {
    const place = whole.length - 1 - index
    parts.push({ key: `i${place}`, char, ghost: false })
    if (place > 0 && place % 3 === 0) {
      parts.push({ key: `g${place}`, char: symbols.group, ghost: false })
    }
  })
  parts.push({
    key: 'd',
    char: symbols.decimal,
    ghost: fraction === undefined,
  })
  for (let index = 0; index < MONEY_DECIMALS; index++) {
    parts.push({
      key: `f${index}`,
      char: fraction?.[index] ?? '0',
      ghost: fraction === undefined || index >= fraction.length,
    })
  }
  return parts
}

/** Where the caret goes in the shown text: after `count` digits and marks. */
export function caretAfter(
  text: string,
  count: number,
  symbols: MoneySymbols,
): number {
  if (count <= 0) {
    return 0
  }
  let seen = 0
  for (let index = 0; index < text.length; index++) {
    const char = text[index] ?? ''
    if ((/\d/.test(char) || char === symbols.decimal) && ++seen === count) {
      return index + 1
    }
  }
  return text.length
}

/** « 1.234,56 € », « $1,234.56 », « 1234.5 » pasted: a final mark with one or two digits is the decimal. */
export function pastedMoney(text: string): string | null {
  const match = /[.,](\d{1,2})\s*\D*$/.exec(text)
  const whole = (match ? text.slice(0, match.index) : text).replace(/\D/g, '')
  const pasted = match ? `${whole}.${match[1]}` : whole
  return /\d/.test(pasted) ? pasted : null
}
