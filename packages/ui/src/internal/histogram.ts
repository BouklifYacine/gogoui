/**
 * Counts values into `bins` equal bars between `min` and `max`; the last
 * bar keeps `max` itself. After Arc UI's range histogram slider
 * (https://uiarc.dev, MIT).
 */
export function histogram(
  data: readonly number[],
  min: number,
  max: number,
  bins: number,
): number[] {
  const counts = Array.from({ length: bins }, () => 0)
  const width = (max - min) / bins || 1
  for (const item of data) {
    if (item >= min && item <= max) {
      const bar = Math.min(bins - 1, Math.floor((item - min) / width))
      counts[bar] = (counts[bar] ?? 0) + 1
    }
  }
  return counts
}
