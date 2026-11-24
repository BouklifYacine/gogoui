// Fifty countries written by hand for PhoneField (France first), after Arc UI's phone
// input (https://uiarc.dev, MIT licence, Elia Kuratli): no phone library,
// no metadata to download; the flags are pictures (phone-flag.tsx). A number is checked on its length only, not on
// its real prefixes. Names come from Intl.DisplayNames, in the reader's
// language.

export type PhoneCountry = {
  /** ISO 3166-1 alpha-2 code, « FR ». */
  iso: string
  /** The calling code without the plus, « 33 ». */
  dial: string
  /** National shapes from shortest to longest; `#` is a digit. */
  patterns: string[]
  /** What people may type first at home, « 0 » in « 06 12 34 56 78 ». */
  trunk: string
  /** A real-looking number: the faint guide after what is typed. */
  example: string
  /** Area codes that pick this country when several share a code (Canada in +1). */
  areaCodes?: string[]
}

const country = (
  iso: string,
  dial: string,
  patterns: string | string[],
  example: string,
  trunk = '0',
  areaCodes?: string[],
): PhoneCountry => ({
  iso,
  dial,
  patterns: Array.isArray(patterns) ? patterns : [patterns],
  example,
  trunk,
  areaCodes,
})

const CA_AREA_CODES =
  '204 226 236 249 250 263 289 306 343 354 365 367 368 382 387 403 416 418 428 431 437 438 450 468 474 506 514 519 548 579 581 584 587 604 613 639 647 672 683 705 709 742 753 778 780 782 807 819 825 867 873 879 902 905'.split(
    ' ',
  )

export const PHONE_COUNTRIES: PhoneCountry[] = [
  country('FR', '33', '# ## ## ## ##', '612345678'),
  country('US', '1', '(###) ###-####', '2015550123', '1'),
  country('CA', '1', '(###) ###-####', '5065550123', '1', CA_AREA_CODES),
  country('MX', '52', '## #### ####', '2221234567', ''),
  country('BR', '55', ['(##) ####-####', '(##) #####-####'], '11961234567'),
  country('AR', '54', '## ####-####', '1123456789'),
  country('CO', '57', '### ### ####', '3211234567', ''),
  country('CL', '56', '# #### ####', '221234567', ''),
  country('PE', '51', '### ### ###', '912345678'),
  country('GB', '44', '#### ######', '7400123456'),
  country('IE', '353', '## ### ####', '850123456'),
  country('DE', '49', ['### #######', '### ########'], '15123456789'),
  country('ES', '34', '### ## ## ##', '612345678', ''),
  country('IT', '39', ['### ### ###', '### ### ####'], '3123456789', ''),
  country('PT', '351', '### ### ###', '912345678', ''),
  country('NL', '31', '# ########', '612345678'),
  country('BE', '32', '### ## ## ##', '470123456'),
  country('CH', '41', '## ### ## ##', '781234567'),
  country('AT', '43', ['### #######', '### ########'], '6641234567'),
  country('SE', '46', '## ### ## ##', '701234567'),
  country('NO', '47', '### ## ###', '40612345', ''),
  country('DK', '45', '## ## ## ##', '32123456', ''),
  country('FI', '358', ['## ### ####', '## ### #####'], '412345678'),
  country('PL', '48', '### ### ###', '512345678', ''),
  country('CZ', '420', '### ### ###', '601123456', ''),
  country('GR', '30', '### ### ####', '6912345678', ''),
  country('UA', '380', '## ### ## ##', '501234567'),
  country('TR', '90', '### ### ## ##', '5012345678'),
  country('IL', '972', '##-###-####', '502345678'),
  country('AE', '971', '## ### ####', '501234567'),
  country('SA', '966', '## ### ####', '512345678'),
  country('EG', '20', '### ### ####', '1001234567'),
  country('NG', '234', '### ### ####', '8021234567'),
  country('KE', '254', '### ######', '712123456'),
  country('ZA', '27', '## ### ####', '711234567'),
  country('IN', '91', '#####-#####', '8123456789'),
  country('PK', '92', '### #######', '3012345678'),
  country('CN', '86', '### #### ####', '13123456789'),
  country('JP', '81', '##-####-####', '9012345678'),
  country('KR', '82', ['##-###-####', '##-####-####'], '1020000000'),
  country('TW', '886', '### ### ###', '912345678'),
  country('HK', '852', '#### ####', '51234567', ''),
  country('SG', '65', '#### ####', '81234567', ''),
  country('PH', '63', '### ### ####', '9051234567'),
  country(
    'ID',
    '62',
    ['###-###-####', '###-####-####', '###-####-#####'],
    '81234567890',
  ),
  country('TH', '66', '## ### ####', '812345678'),
  country('VN', '84', '## ### ## ##', '912345678'),
  country('AU', '61', '### ### ###', '412345678'),
  country(
    'NZ',
    '64',
    ['# ### ####', '## ### ####', '## #### ####'],
    '211234567',
  ),
]

const BY_ISO = new Map(PHONE_COUNTRIES.map((entry) => [entry.iso, entry]))

/** A country of the table by its ISO code. */
export function phoneCountry(iso: string): PhoneCountry | undefined {
  return BY_ISO.get(iso.toUpperCase())
}

const capacity = (pattern: string) => pattern.split('#').length - 1

/** The lengths a national number may have, without its trunk « 0 ». */
export function phoneLengths(entry: PhoneCountry): number[] {
  return entry.patterns.map(capacity)
}

export const onlyDigits = (text: string) => text.replace(/\D/g, '')

/** The trunk typed first, and the rest. */
export function splitTrunk(
  entry: PhoneCountry,
  digits: string,
): [string, string] {
  return entry.trunk && digits.startsWith(entry.trunk)
    ? [entry.trunk, digits.slice(entry.trunk.length)]
    : ['', digits]
}

/** Digits cut to the longest number, a typed trunk earning its own room. */
export function capDigits(entry: PhoneCountry, digits: string) {
  return digits.slice(
    0,
    splitTrunk(entry, digits)[0].length + Math.max(...phoneLengths(entry)),
  )
}

/** Separators print only while digits follow: no dangling « ) » or « - ». */
function applyPattern(digits: string, pattern: string) {
  let out = ''
  let index = 0
  for (const char of pattern) {
    if (index >= digits.length) {
      break
    }
    out += char === '#' ? digits[index++] : char
  }
  return out + digits.slice(index)
}

/** National digits in their country's shape, a typed trunk kept: « 06 12 34 56 78 ». */
export function formatNational(entry: PhoneCountry, digits: string): string {
  const [trunk, rest] = splitTrunk(entry, digits)
  const pattern =
    entry.patterns.find((item) => capacity(item) >= rest.length) ??
    entry.patterns[entry.patterns.length - 1] ??
    ''
  const body = applyPattern(rest, pattern)
  if (!trunk) {
    return body
  }
  if (!rest) {
    return trunk
  }
  return trunk + (pattern.startsWith('#') ? '' : ' ') + body
}

/** How complete a number is: on its length only. */
export type PhoneStatus = 'empty' | 'incomplete' | 'valid' | 'too-long'

export function nationalStatus(
  entry: PhoneCountry,
  digits: string,
): PhoneStatus {
  const length = splitTrunk(entry, digits)[1].length
  const lengths = phoneLengths(entry)
  if (!length) {
    return 'empty'
  }
  if (lengths.includes(length)) {
    return 'valid'
  }
  return length > Math.max(...lengths) ? 'too-long' : 'incomplete'
}

/** The number in E.164, « +33612345678 », or « » without digits. */
export function nationalE164(entry: PhoneCountry, digits: string): string {
  const rest = splitTrunk(entry, digits)[1]
  return rest ? `+${entry.dial}${rest}` : ''
}

/** The number written for people with its code: « +33 6 12 34 56 78 ». */
export function internationalText(entry: PhoneCountry, digits: string) {
  const rest = splitTrunk(entry, digits)[1]
  return rest ? `+${entry.dial} ${formatNational(entry, rest)}` : ''
}

/**
 * « +44 (0)7911 123456 », « 0044 7911… » or « +14165550123 » read into a
 * country and its national digits; the longest calling code wins. Null
 * without a « + » or « 00 ».
 */
export function parseInternational(
  input: string,
  pool: PhoneCountry[] = PHONE_COUNTRIES,
): { country: PhoneCountry; national: string } | null {
  const trimmed = input.trim()
  let digits = onlyDigits(trimmed)
  if (!trimmed.startsWith('+')) {
    if (!trimmed.startsWith('00')) {
      return null
    }
    digits = digits.slice(2)
  }
  for (const size of [3, 2, 1]) {
    const dial = digits.slice(0, size)
    const matches = pool.filter((entry) => entry.dial === dial)
    const first = matches[0]
    if (!first) {
      continue
    }
    let rest = digits.slice(size)
    const entry =
      matches.find((item) =>
        item.areaCodes?.some((code) => rest.startsWith(code)),
      ) ??
      matches.find((item) => !item.areaCodes) ??
      first
    // « +44 (0)7911… » carries a trunk it should not: drop it when the rest
    // is still a whole number without it.
    if (
      entry.trunk &&
      rest.startsWith(entry.trunk) &&
      rest.length - entry.trunk.length >= Math.min(...phoneLengths(entry))
    ) {
      rest = rest.slice(entry.trunk.length)
    }
    return { country: entry, national: capDigits(entry, rest) }
  }
  return null
}
