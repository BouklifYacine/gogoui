/** A calendar day is kept as "YYYY-MM-DD": no time, no time zone. */

/** "2027-06-14" → that day at midnight, local time; anything else → undefined. */
export function parseDay(day: string | null | undefined): Date | undefined {
  const match = day ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(day) : null
  if (!match) {
    return undefined
  }
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  )
  return toDay(date) === day ? date : undefined
}

/** A date → its day, "YYYY-MM-DD", in local time. */
export function toDay(date: Date): string {
  return [
    String(date.getFullYear()).padStart(4, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

/** "2027-06-14" as typed: « 14/06/2027 » (dmy) or « 06/14/2027 » (mdy). */
export function formatTypedDay(day: string, order: 'dmy' | 'mdy'): string {
  const [year, month, date] = day.split('-')
  return order === 'dmy'
    ? `${date}/${month}/${year}`
    : `${month}/${date}/${year}`
}

/**
 * A day typed by hand, any separator (« 14/06/2027 », « 14.6.27 »,
 * « 14 06 2027 »), or null when it is not a real day.
 */
export function parseTypedDay(
  typed: string,
  order: 'dmy' | 'mdy',
): string | null {
  const parts = typed.trim().split(/\D+/).filter(Boolean)
  if (parts.length !== 3) {
    return null
  }
  const [first, second, yearText] = parts as [string, string, string]
  const [dayText, monthText] =
    order === 'dmy' ? [first, second] : [second, first]
  if (yearText.length !== 2 && yearText.length !== 4) {
    return null
  }
  const year = Number(yearText.length === 2 ? `20${yearText}` : yearText)
  const day = `${String(year)}-${monthText.padStart(2, '0')}-${dayText.padStart(2, '0')}`
  return parseDay(day) ? day : null
}
