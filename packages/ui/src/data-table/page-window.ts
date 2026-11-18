/** A page number to show, or a gap (« … ») between two of them. */
export type PageSlot = number | 'gap'

/**
 * The page numbers worth a button: the first, the last, and the pages
 * around the current one, with a gap where pages are left out. Pages
 * count from 1; with 7 pages or fewer, every page shows.
 *
 *   pageWindow(5, 26) → [1, 'gap', 4, 5, 6, 'gap', 26]
 */
export function pageWindow(current: number, count: number): PageSlot[] {
  if (count <= 7) {
    return Array.from({ length: count }, (_, index) => index + 1)
  }
  const kept = new Set([1, count, current - 1, current, current + 1])
  // Near an end, keep three pages beside it instead of a lone gap.
  if (current <= 3) {
    for (const page of [2, 3, 4]) kept.add(page)
  }
  if (current >= count - 2) {
    for (const page of [count - 3, count - 2, count - 1]) kept.add(page)
  }
  const pages = [...kept]
    .filter((page) => page >= 1 && page <= count)
    .sort((a, b) => a - b)

  const slots: PageSlot[] = []
  for (const page of pages) {
    const previous = slots.at(-1)
    if (typeof previous === 'number' && page - previous > 1) {
      slots.push('gap')
    }
    slots.push(page)
  }
  return slots
}
