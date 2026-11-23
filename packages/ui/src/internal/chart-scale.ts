// The maths GoGoUI's hand-drawn charts share, after Arc UI's charts
// (https://uiarc.dev, MIT licence, Elia Kuratli): clean gridlines, a
// smooth line that never swings past the data, and a way to morph one
// line into the next.

export const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, value))

/** Rounds away float noise (0.1 + 0.2), so tick keys stay stable. */
const clean = (value: number) => Number(value.toPrecision(12))

export type ChartScale = { min: number; max: number; ticks: number[] }

/**
 * Clean gridlines: the smallest step of 1, 2, 2.5 or 5 (times a power of
 * ten) that covers `low` to `high` in `rows` rows or fewer. It starts at
 * zero unless the data dips below, so shared steps survive a new range.
 */
export function niceScale(low: number, high: number, rows = 4): ChartScale {
  const bottom = Math.min(0, low)
  const top = Math.max(high, bottom + 1)
  const magnitude = 10 ** Math.floor(Math.log10((top - bottom) / rows))
  for (const factor of [1, 2, 2.5, 5, 10]) {
    const step = factor * magnitude
    const from = Math.floor(bottom / step) * step
    const to = Math.ceil(top / step) * step
    if ((to - from) / step <= rows + 1e-9) {
      const ticks: number[] = []
      for (let value = from; value <= to + step / 2; value += step) {
        ticks.push(clean(value))
      }
      return { min: clean(from), max: clean(to), ticks }
    }
  }
  return { min: bottom, max: top, ticks: [bottom, top] }
}

/** A point of a sampled line: x from 0 (first value) to 1 (last), and the value. */
export type CurvePoint = [x: number, value: number]

/**
 * The line through every value, sampled densely on x from 0 to 1. Smooth,
 * it follows monotone cubic tangents and each stretch stays between its
 * two values, so a curve never invents a peak; otherwise straight segments.
 */
export function curveThrough(values: number[], smooth = true): CurvePoint[] {
  if (values.length === 0) {
    return []
  }
  if (values.length === 1) {
    return [
      [0, values[0]!],
      [1, values[0]!],
    ]
  }
  const last = values.length - 1
  const step = 1 / last
  if (!smooth) {
    return values.map((value, index) => [index * step, value])
  }
  const slopes = values
    .slice(1)
    .map((value, index) => (value - values[index]!) / step)
  const tangents = values.map((_, index) => {
    if (index === 0 || index === last) {
      return slopes[0]!
    }
    const before = slopes[index - 1]!
    const after = slopes[index]!
    return (
      (Math.sign(before) + Math.sign(after)) *
        Math.min(
          Math.abs(before),
          Math.abs(after),
          Math.abs(before + after) / 4,
        ) || 0
    )
  })
  if (last > 1) {
    tangents[0] = (3 * slopes[0]! - tangents[1]!) / 2
    tangents[last] = (3 * slopes[last - 1]! - tangents[last - 1]!) / 2
  }
  const samples = Math.max(1, Math.min(16, Math.round(192 / last)))
  const points: CurvePoint[] = []
  for (let index = 0; index < last; index++) {
    const from = values[index]!
    const to = values[index + 1]!
    for (let sample = 0; sample < samples; sample++) {
      const t = sample / samples
      const t2 = t * t
      const t3 = t2 * t
      const value =
        (2 * t3 - 3 * t2 + 1) * from +
        (t3 - 2 * t2 + t) * step * tangents[index]! +
        (3 * t2 - 2 * t3) * to +
        (t3 - t2) * step * tangents[index + 1]!
      points.push([
        (index + t) * step,
        clamp(value, Math.min(from, to), Math.max(from, to)),
      ])
    }
  }
  points.push([1, values[last]!])
  return points
}

/** The value of a sampled line at x, straight between two samples. */
export function valueAt(shape: CurvePoint[], x: number): number {
  if (shape.length === 0) {
    return 0
  }
  let low = 0
  let high = shape.length - 1
  if (x <= shape[low]![0]) {
    return shape[low]![1]
  }
  if (x >= shape[high]![0]) {
    return shape[high]![1]
  }
  while (high - low > 1) {
    const middle = (low + high) >> 1
    if (shape[middle]![0] < x) {
      low = middle
    } else {
      high = middle
    }
  }
  const [x0, y0] = shape[low]!
  const [x1, y1] = shape[high]!
  return x1 === x0 ? y1 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
}

const GRID = Array.from({ length: 241 }, (_, index) => index / 240)

/**
 * The lines between two shapes, from 0 (`from`) to 1 (`to`). Both are read
 * on shared x positions, so a series that gains or loses points flows
 * instead of jumping.
 */
export function blendCurves(
  from: CurvePoint[],
  to: CurvePoint[],
): (progress: number) => CurvePoint[] {
  const xs = [...new Set([...GRID, ...to.map(([x]) => x)])].sort(
    (a, b) => a - b,
  )
  const start = xs.map((x) => valueAt(from, x))
  const goal = xs.map((x) => valueAt(to, x))
  return (progress) =>
    xs.map((x, at) => [x, start[at]! + (goal[at]! - start[at]!) * progress])
}
