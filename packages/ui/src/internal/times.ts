/** Every quarter of an hour of a day, "00:00" to "23:45". */
export const QUARTER_HOURS: readonly string[] = Array.from(
  { length: 24 * 4 },
  (_, index) =>
    `${String(Math.floor(index / 4)).padStart(2, '0')}:${String((index % 4) * 15).padStart(2, '0')}`,
)

/**
 * A time typed by hand ("14:10"), or null while it is not one yet.
 * « 14:10 », « 14h10 », « 14h », « 1410 » and « 9:5 » are read; « 25:00 »
 * and « 14:60 » are not.
 */
export function typedTime(text: string): string | null {
  const match = /^(\d{1,2})[:hH.]?(\d{1,2})?$/.exec(text.trim())
  if (!match) {
    return null
  }
  const hours = Number(match[1])
  const minutes = Number(match[2] ?? 0)
  if (hours > 23 || minutes > 59) {
    return null
  }
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/**
 * Whether a time of the list answers what is typed, by its digits alone:
 * « 22 » keeps 22:00 to 22:45, « 9 » keeps 09:00 to 09:45.
 */
export function timeMatches(time: string, query: string): boolean {
  const typed = query.replace(/\D/g, '')
  if (typed === '') {
    return true
  }
  const digits = time.replace(':', '')
  return digits.startsWith(typed) || digits.startsWith(`0${typed}`)
}

/**
 * The text as one types it: four digits at most, the colon put in after
 * the hours (« 22 » → « 22: »), but not while erasing.
 */
export function maskTime(next: string, erasing: boolean): string {
  const digits = next.replace(/\D/g, '').slice(0, 4)
  if (digits.length > 2) {
    return `${digits.slice(0, 2)}:${digits.slice(2)}`
  }
  return digits.length === 2 && !erasing ? `${digits}:` : digits
}
