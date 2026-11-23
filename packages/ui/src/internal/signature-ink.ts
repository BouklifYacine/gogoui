/*
 * A signature's ink, after Arc UI's signature pad (https://uiarc.dev, MIT
 * licence, Elia Kuratli), itself in the spirit of perfect-freehand: each
 * stroke is a filled outline whose width follows the pen's pressure, or
 * the speed of a mouse or a finger, with tapered ends like a nib lifting.
 *
 * Pure functions: no React, no DOM except the two exports that draw on a
 * canvas.
 */

/** A sampled point, in pad units; `p` the pen's pressure (0-1, or -1 without one), `t` ms since the stroke began. */
export type SignaturePoint = { x: number; y: number; p: number; t: number }

/** The ink: black, or a blue that reads as a pen's. */
export type SignatureInk = 'black' | 'blue'

/** The nib: fine, medium, bold. */
export type SignatureWidth = 'sm' | 'default' | 'lg'

/** One stroke of a signature, from pen down to pen up. */
export type SignatureStroke = {
  id: string
  points: SignaturePoint[]
  ink: SignatureInk
  width: SignatureWidth
  /** When it began, in ms: the replay keeps the rhythm between strokes. */
  at: number
}

/** The pad's own space: strokes are stored in it and scale with the pad. */
export const PAD_WIDTH = 600
export const PAD_HEIGHT = 260

/**
 * The colours of a signature once it leaves the screen (a PNG, an SVG,
 * a printed contract): data, not a theme, so they stay fixed.
 */
export const PRINT_INK: Record<SignatureInk, string> = {
  black: '#17171a',
  blue: '#1d3fae',
}

/** The nib's diameter, in pad units. */
export const NIB: Record<SignatureWidth, number> = {
  sm: 3.4,
  default: 5.6,
  lg: 8.4,
}

type Vec = [number, number]
const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]]
const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]]
const mul = (a: Vec, n: number): Vec => [a[0] * n, a[1] * n]
const lerp = (a: Vec, b: Vec, t: number): Vec => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
]
const dist = (a: Vec, b: Vec) => Math.hypot(a[0] - b[0], a[1] - b[1])
const norm = (a: Vec): Vec => {
  const length = Math.hypot(a[0], a[1])
  return length ? [a[0] / length, a[1] / length] : [0, 0]
}
const perp = (a: Vec): Vec => [a[1], -a[0]]
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1]
const rotateAround = (p: Vec, c: Vec, r: number): Vec => {
  const sin = Math.sin(r)
  const cos = Math.cos(r)
  const x = p[0] - c[0]
  const y = p[1] - c[1]
  return [x * cos - y * sin + c[0], x * sin + y * cos + c[1]]
}
const easeOut = (t: number) => t * (2 - t)

type OutlineOptions = {
  /** The stroke's diameter at half pressure. */
  size: number
  thinning?: number
  /** How far each point trails the pointer (0-1): smoother, a little late. */
  streamline?: number
  /** Pressure from speed when the device gives none: fast is thin. */
  simulatePressure?: boolean
  taperStart?: number
  taperEnd?: number
  /** False while the stroke is drawn, so its end does not taper yet. */
  last?: boolean
}

/** The outline of a stroke of varying width, as a closed polygon. */
function strokeOutline(
  input: SignaturePoint[],
  options: OutlineOptions,
): Vec[] {
  const {
    size,
    thinning = 0.62,
    streamline = 0.42,
    simulatePressure = true,
    taperStart = 0,
    taperEnd = 0,
    last = true,
  } = options
  const head = input[0]
  if (!head) return []
  const usePen = !simulatePressure && input.some((point) => point.p > 0)

  // Each point eases towards the raw input: no jitter, no smoothing pass.
  const points: { at: Vec; pressure: number; length: number; vector: Vec }[] =
    []
  let previous: Vec = [head.x, head.y]
  let length = 0
  const start = {
    at: previous,
    pressure: usePen ? head.p : 0.5,
    length: 0,
    vector: [1, 0] as Vec,
  }
  points.push(start)
  for (let index = 1; index < input.length; index++) {
    const sample = input[index]!
    const raw: Vec = [sample.x, sample.y]
    const at =
      index === input.length - 1 && last
        ? raw
        : lerp(previous, raw, 1 - streamline)
    const step = dist(at, previous)
    if (step < 0.4) continue
    length += step
    points.push({
      at,
      pressure: usePen ? sample.p : 0.5,
      length,
      vector: norm(sub(previous, at)),
    })
    previous = at
  }
  const second = points[1]
  if (second) start.vector = second.vector
  const total = length

  // A dot: a round mark sized by the first pressure.
  if (points.length === 1) {
    const radius = Math.max(
      0.6,
      size * (0.5 - thinning * (0.5 - start.pressure)) * 0.9,
    )
    return Array.from({ length: 18 }, (_, index) =>
      add(
        start.at,
        mul(
          [
            Math.cos((index / 18) * Math.PI * 2),
            Math.sin((index / 18) * Math.PI * 2),
          ],
          radius,
        ),
      ),
    )
  }

  const left: Vec[] = []
  const right: Vec[] = []
  let pressure = start.pressure
  let previousVector = start.vector
  for (let index = 0; index < points.length; index++) {
    const point = points[index]!
    if (usePen) {
      pressure = point.pressure
    } else {
      // A long step between samples reads as a fast stroke, so a thin one.
      const step = index === 0 ? 0 : dist(point.at, points[index - 1]!.at)
      const speed = Math.min(1, step / size)
      const target = Math.min(1, 1 - speed)
      pressure = Math.min(1, pressure + (target - pressure) * speed * 0.3)
    }
    let radius = Math.max(0.25, size * (0.5 - thinning * (0.5 - pressure)))
    const fromStart = taperStart
      ? easeOut(Math.min(1, point.length / taperStart))
      : 1
    const toEnd =
      taperEnd && last
        ? easeOut(Math.min(1, (total - point.length) / taperEnd))
        : 1
    radius = Math.max(0.12 * size, radius * Math.min(fromStart, toEnd))

    const next = points[index + 1]?.vector ?? point.vector
    const offset = mul(perp(lerp(next, point.vector, 0.5)), radius)
    // A sharp turn: sweep round the corner so the outline does not pinch.
    if (
      index > 0 &&
      index < points.length - 1 &&
      dot(point.vector, next) < -0.2
    ) {
      const corner = mul(perp(previousVector), radius)
      for (let t = 0; t <= 1; t += 1 / 12) {
        left.push(rotateAround(sub(point.at, corner), point.at, Math.PI * t))
        right.push(rotateAround(add(point.at, corner), point.at, -Math.PI * t))
      }
    } else {
      left.push(sub(point.at, offset))
      right.push(add(point.at, offset))
    }
    previousVector = point.vector
  }

  // Round caps: half circles around the first and the last points.
  const cap = (center: Vec, from: Vec, to: Vec, away: Vec) => {
    const out: Vec[] = []
    const radius = dist(center, from)
    const angle = Math.atan2(from[1] - center[1], from[0] - center[0])
    const middle = angle + Math.PI / 2
    const sign = dot([Math.cos(middle), Math.sin(middle)], away) >= 0 ? 1 : -1
    for (let k = 1; k < 12; k++) {
      const a = angle + (sign * Math.PI * k) / 12
      out.push([
        center[0] + Math.cos(a) * radius,
        center[1] + Math.sin(a) * radius,
      ])
    }
    out.push(to)
    return out
  }
  const end = points[points.length - 1]!
  const endCap = cap(
    end.at,
    left[left.length - 1]!,
    right[right.length - 1]!,
    mul(end.vector, -1),
  )
  const startCap = cap(start.at, right[0]!, left[0]!, start.vector)
  return [...left, ...endCap, ...right.reverse(), ...startCap]
}

const round = (value: number) => Math.round(value * 100) / 100

/** An outline as one smooth closed SVG path, curving through its edges' midpoints. */
function outlineToPath(points: Vec[]): string {
  if (points.length < 3) return ''
  let d = `M${round(points[0]![0])} ${round(points[0]![1])} Q`
  for (let index = 0; index < points.length; index++) {
    const [x0, y0] = points[index]!
    const [x1, y1] = points[(index + 1) % points.length]!
    d += `${round(x0)} ${round(y0)} ${round((x0 + x1) / 2)} ${round((y0 + y1) / 2)} `
  }
  return `${d}Z`
}

/**
 * The SVG path of a stroke; of its first `upTo` ms during a replay, and
 * without its end's taper while it is still drawn (`drawing`).
 */
export function strokePath(
  stroke: Pick<SignatureStroke, 'width' | 'points'>,
  upTo = Infinity,
  drawing = false,
): string {
  const all = stroke.points
  const lastPoint = all[all.length - 1]
  if (!lastPoint) return ''
  const done = !drawing && upTo >= lastPoint.t
  const points = done ? all : all.filter((point) => point.t <= upTo)
  const size = NIB[stroke.width]
  const pen = all.some((point) => point.p > 0)
  return outlineToPath(
    strokeOutline(points, {
      size,
      simulatePressure: !pen,
      taperStart: size * 1.5,
      taperEnd: pen ? 0 : size * 5,
      last: done,
    }),
  )
}

/** The ink's tight bounds, padded, so an export is cropped to it. */
function inkBounds(strokes: SignatureStroke[]) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const stroke of strokes) {
    for (const point of stroke.points) {
      minX = Math.min(minX, point.x)
      minY = Math.min(minY, point.y)
      maxX = Math.max(maxX, point.x)
      maxY = Math.max(maxY, point.y)
    }
  }
  const pad = 16
  return {
    x: Math.floor(minX - pad),
    y: Math.floor(minY - pad),
    width: Math.ceil(maxX - minX + pad * 2),
    height: Math.ceil(maxY - minY + pad * 2),
  }
}

/** A standalone SVG of the signature, cropped to the ink, in print colours. */
export function signatureToSvg(strokes: SignatureStroke[]): string {
  if (!strokes.length) return ''
  const box = inkBounds(strokes)
  const paths = strokes
    .map(
      (stroke) =>
        `<path d="${strokePath(stroke)}" fill="${PRINT_INK[stroke.ink]}"/>`,
    )
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.x} ${box.y} ${box.width} ${box.height}" width="${box.width}" height="${box.height}">${paths}</svg>`
}

/**
 * A transparent PNG of the signature as a data URL, cropped to the ink, at
 * `scale` times the pad's resolution. '' when there is no ink or no canvas.
 */
export function signatureToPng(strokes: SignatureStroke[], scale = 2): string {
  if (!strokes.length || typeof document === 'undefined') return ''
  const box = inkBounds(strokes)
  const canvas = document.createElement('canvas')
  canvas.width = box.width * scale
  canvas.height = box.height * scale
  const context = canvas.getContext('2d')
  if (!context) return ''
  context.scale(scale, scale)
  context.translate(-box.x, -box.y)
  for (const stroke of strokes) {
    context.fillStyle = PRINT_INK[stroke.ink]
    context.fill(new Path2D(strokePath(stroke)))
  }
  return canvas.toDataURL('image/png')
}

/** An SVG as a data URL, for an `<img>` or a form. */
export function svgDataUrl(svg: string): string {
  return svg
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    : ''
}

/** The handwriting-like faces a typed name is set in. */
export const TYPED_NAME_FONT =
  '"Snell Roundhand", "Segoe Script", "Brush Script MT", "Apple Chancery", cursive'

const escapeXml = (text: string) =>
  text.replace(/[<>&"']/g, (character) => `&#${character.charCodeAt(0)};`)

/**
 * A typed name drawn as a signature: a PNG data URL (canvas) or an SVG
 * data URL (text), in black print ink. '' for an empty name.
 */
export function typedNameToDataUrl(
  name: string,
  format: 'png' | 'svg',
  scale = 2,
): string {
  const text = name.trim()
  if (!text || typeof document === 'undefined') return ''
  const size = 56
  const font = `italic 400 ${size}px ${TYPED_NAME_FONT}`
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (context) context.font = font
  const measured = context
    ? context.measureText(text).width
    : text.length * size * 0.5
  const width = Math.ceil(measured + 32)
  const height = Math.ceil(size * 1.6)
  if (format === 'svg') {
    return svgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><text x="16" y="${Math.round(size * 1.1)}" font-family='${TYPED_NAME_FONT}' font-style="italic" font-size="${size}" fill="${PRINT_INK.black}">${escapeXml(text)}</text></svg>`,
    )
  }
  if (!context) return ''
  canvas.width = width * scale
  canvas.height = height * scale
  context.scale(scale, scale)
  context.font = font
  context.fillStyle = PRINT_INK.black
  context.textBaseline = 'alphabetic'
  context.fillText(text, 16, Math.round(size * 1.1))
  return canvas.toDataURL('image/png')
}
