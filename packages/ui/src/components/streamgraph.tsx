import { useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react'
import { motion, useInView } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { chartColor, seriesColor } from '../internal/chart-color.ts'
import type { ChartColor } from '../internal/chart-color.ts'
import { ChartDataTable } from '../internal/chart-data-table.tsx'
import { chartMorph, chartReveal } from '../internal/chart-motion.ts'
import { clamp } from '../internal/chart-scale.ts'
import { ChartTooltip } from '../internal/chart-tooltip.tsx'
import { MotionScope } from '../internal/motion-scope.tsx'
import { useChartGlide } from '../internal/use-chart-glide.ts'
import { useElementSize } from '../internal/use-element-size.ts'
import { cn } from '../lib/cn.ts'

export type StreamgraphSeries = {
  /** Stable identity: a layer keeps its place and colour across data changes, so a new dataset morphs it. */
  key: string
  /** Its name in the legend, on the layer, in the tooltip and the table. */
  label: string
  /** Its colour; the palette's slots in order by default (`chart-1`…). */
  color?: ChartColor
}

export type StreamgraphDatum = {
  /** Stable identity, such as an ISO week. */
  key: string
  /** The full name, for the tooltip and screen readers (« Semaine du 14 septembre »). */
  label: string
  /** The short name on the time axis; leave it out to keep the axis quiet there. */
  axisLabel?: string
  /** One value per series key; a missing or negative value counts as zero. */
  values: Record<string, number | undefined>
}

export type StreamgraphProps = {
  data: StreamgraphDatum[]
  /** The layers from the centre out: the first runs through the middle, the others alternate above and below. */
  series: StreamgraphSeries[]
  /** What is measured (« Demandes par type d'événement »): the chart's accessible name. */
  label: string
  /** After each value (« demandes »). */
  unit?: string
  /** The plot's height in px; the width follows the container. */
  height?: number
  /** `wiggle` flows, `silhouette` centres the stack, `zero` stacks from a flat baseline. */
  offset?: 'wiggle' | 'silhouette' | 'zero'
  formatValue?: (value: number, series: StreamgraphSeries) => string
  /** The hidden layers (controlled): a hidden layer thins to nothing and the others close over it. */
  hiddenSeries?: string[]
  defaultHiddenSeries?: string[]
  onHiddenSeriesChange?: (hidden: string[]) => void
  /** Told each reading (the point and the layer), and nulls when it leaves. */
  onActiveChange?: (index: number | null, seriesKey: string | null) => void
  /** The layer toggles above the plot. */
  legend?: boolean
  /** Names each layer on its widest stretch when it is thick enough. */
  directLabels?: boolean
  /** The first column's heading in the hidden table; « Période » by default. */
  categoryLabel?: string
  /** Shown when there is no data; « Aucune donnée pour cette période » by default. */
  emptyLabel?: string
  className?: string
}

type Reading = { index: number; key: string | null; y: number | null }

/** Samples across the plot: every layer is drawn on the same grid, so datasets of any length morph into each other. */
const N = 161
const PAD = 10

/** The first layer sits in the middle, the others alternate above and below it; a flat baseline stacks them in order. */
function stackOrder(count: number, mode: StreamgraphProps['offset']) {
  const order = Array.from({ length: count }, (_, index) => index)
  if (mode === 'zero') {
    return order
  }
  return order.reduce<number[]>(
    (list, index) =>
      index === 0 ? [0] : index % 2 ? [...list, index] : [index, ...list],
    [],
  )
}

/** Values on the shared grid with monotone cubic tangents, so a curve never swings past the data or below zero. */
function resample(raw: number[]): number[] {
  const values = raw.map((value) => Math.max(0, value || 0))
  const out = Array.from({ length: N }, () => values[0] ?? 0)
  if (values.length < 2) {
    return out
  }
  const last = values.length - 1
  const slopes = values.slice(1).map((value, index) => value - values[index])
  const tangents = values.map((_, index) =>
    index === 0 || index === last
      ? 0
      : (Math.sign(slopes[index - 1]) + Math.sign(slopes[index])) *
          Math.min(
            Math.abs(slopes[index - 1]),
            Math.abs(slopes[index]),
            Math.abs(slopes[index - 1] + slopes[index]) / 4,
          ) || 0,
  )
  if (last > 1) {
    tangents[0] = (3 * slopes[0] - tangents[1]) / 2
    tangents[last] = (3 * slopes[last - 1] - tangents[last - 1]) / 2
  } else {
    tangents[0] = tangents[1] = slopes[0]
  }
  for (let k = 0; k < N; k++) {
    const at = (k / (N - 1)) * last
    const segment = Math.min(last - 1, Math.floor(at))
    const t = at - segment
    const t2 = t * t
    const t3 = t2 * t
    const a = values[segment]
    const b = values[segment + 1]
    const value =
      (2 * t3 - 3 * t2 + 1) * a +
      (t3 - 2 * t2 + t) * tangents[segment] +
      (3 * t2 - 2 * t3) * b +
      (t3 - t2) * tangents[segment + 1]
    out[k] = clamp(value, Math.min(a, b), Math.max(a, b))
  }
  return out
}

/** The baseline under the stack. Wiggle follows Byron and Wattenberg, then drops its drift so the stream stays level. */
function baseline(layers: number[][], mode: StreamgraphProps['offset']) {
  const g = Array.from({ length: N }, () => 0)
  const totals = g.map((_, j) =>
    layers.reduce((sum, layer) => sum + layer[j], 0),
  )
  if (mode === 'zero' || !layers.length) {
    return g
  }
  if (mode === 'silhouette') {
    return totals.map((total) => -total / 2)
  }
  for (let j = 1; j < N; j++) {
    let s1 = 0
    let s2 = 0
    let below = 0
    for (const layer of layers) {
      const change = layer[j] - layer[j - 1]
      s1 += layer[j]
      s2 += (below + change / 2) * layer[j]
      below += change
    }
    g[j] = g[j - 1] - (s1 ? s2 / s1 : 0)
  }
  // The least squares line through the stream's centre, taken off so it never tilts off the plot.
  const centers = g.map((value, j) => value + totals[j] / 2)
  const mx = (N - 1) / 2
  const my = centers.reduce((sum, value) => sum + value, 0) / N
  let num = 0
  let den = 0
  centers.forEach((value, j) => {
    num += (j - mx) * (value - my)
    den += (j - mx) ** 2
  })
  const slope = den ? num / den : 0
  return g.map((value, j) => value - (my + slope * (j - mx)))
}

/** The axis labels that fit: one per 72 px at most, counted back from the latest. */
function axisPicks(data: StreamgraphDatum[], width: number) {
  const labelled = data.flatMap((item, index) =>
    item.axisLabel ? [index] : [],
  )
  if (!width || !labelled.length) {
    return []
  }
  const stride = Math.ceil(
    labelled.length / Math.max(2, Math.floor(width / 72)),
  )
  return labelled
    .reverse()
    .filter((_, rank) => rank % stride === 0)
    .reverse()
}

/**
 * A streamgraph, after Arc UI (https://uiarc.dev, MIT): stacked layers
 * flowing around a centre line, for how the mix of several parts changes
 * over time when the overall shape matters more than exact values.
 *
 * **Use it for** a mix over weeks or months (the requests by event type
 * through the season, the bookings by space). **Not for** exact values to
 * compare (a stacked bar chart in `Chart`), one series (`BrushChart`), or
 * parts of a single total (`WaffleChart`, `Treemap`).
 *
 * **Where**: a dashboard or a report, full width, with a few layers
 * (two to six).
 *
 * **States**: drawn, a layer hidden from the legend, a reading (pointer or
 * keyboard) with its crosshair and tooltip, a layer in focus (the others
 * step back), every layer hidden, empty.
 *
 * **Compose**: in a `Card`; `hiddenSeries` + `onHiddenSeriesChange` to
 * drive the layers from outside.
 *
 * **Key props**: `data` (key, label, axisLabel, values), `series` (key,
 * label, color), `label`, `unit`, `offset` (wiggle, silhouette, zero),
 * `formatValue`, `hiddenSeries`, `onActiveChange`, `legend`,
 * `directLabels`, `height`.
 *
 * **Motion**: the stream swells out of a hairline the first time it is
 * seen; new data and hidden layers morph the shapes on a spring; the
 * crosshair and the tooltip glide from one reading to the next. With
 * reduced motion the final state is drawn at once.
 *
 * **Accessibility**: a named figure; the plot takes the focus, the left
 * and right arrows move through time (Page keys by a sixth, Home, End),
 * up and down change the layer, Escape lets go; each reading is said in a
 * live region; the legend's toggles are buttons (`aria-pressed`); a hidden
 * table gives every value.
 *
 * @summary Stacked layers flowing over time, for a changing mix.
 */
export function Streamgraph({
  data,
  series,
  label,
  unit = '',
  height = 260,
  offset = 'wiggle',
  formatValue,
  hiddenSeries,
  defaultHiddenSeries,
  onHiddenSeriesChange,
  onActiveChange,
  legend = true,
  directLabels = true,
  categoryLabel,
  emptyLabel,
  className,
}: StreamgraphProps) {
  const t = useGoGoUIMessages()
  const reduce = useReduceMotion()
  const figure = useRef<HTMLElement>(null)
  const inView = useInView(figure, { once: true, amount: 0.3 })
  const [plot, plotRef] = useElementSize<HTMLDivElement>()
  const width = plot?.width ?? 0
  const last = data.length - 1
  const empty = data.length === 0

  const [ownHidden, setOwnHidden] = useState<string[]>(
    defaultHiddenSeries ?? [],
  )
  const hidden = hiddenSeries ?? ownHidden
  const toggle = (key: string) => {
    const next = hidden.includes(key)
      ? hidden.filter((item) => item !== key)
      : [...hidden, key]
    if (hiddenSeries === undefined) {
      setOwnHidden(next)
    }
    onHiddenSeriesChange?.(next)
  }
  const visible = series.filter((item) => !hidden.includes(item.key))
  const colorOf = (item: StreamgraphSeries) =>
    item.color ? chartColor(item.color) : seriesColor(series.indexOf(item))

  // Each layer becomes a dense curve on the shared grid.
  const signature = `${series.map((item) => item.key).join(',')}|${data.map((item) => series.map((line) => item.values[line.key] ?? 0).join(',')).join(';')}`
  const targets = useMemo(
    () =>
      new Map(
        series.map((line) => [
          line.key,
          resample(data.map((item) => item.values[line.key] ?? 0)),
        ]),
      ),
    [data, series],
  )

  // The stack on screen: a hidden layer is a layer of zeros, so it thins out.
  const frame = useMemo(() => {
    const zeros = Array.from({ length: N }, () => 0)
    const layers = series.map((line) =>
      hidden.includes(line.key) ? zeros : (targets.get(line.key) ?? zeros),
    )
    const stack = stackOrder(series.length, offset)
    const g = baseline(
      stack.map((index) => layers[index]),
      offset,
    )
    const lower: number[][] = series.map(() => zeros)
    const upper: number[][] = series.map(() => zeros)
    let running = g.slice()
    for (const index of stack) {
      const layer = layers[index]
      lower[index] = running
      running = running.map((value, j) => value + layer[j])
      upper[index] = running
    }
    let lo = Infinity
    let hi = -Infinity
    for (let j = 0; j < N; j++) {
      lo = Math.min(lo, g[j])
      hi = Math.max(hi, running[j])
    }
    if (!Number.isFinite(lo) || hi - lo < 1e-9) {
      lo = -1
      hi = 1
    }
    const span = hi - lo
    const center = g.map((value, j) => (value + running[j]) / 2)
    const toY = (value: number) =>
      PAD + (1 - (value - lo) / span) * (height - PAD * 2)
    return { lower, upper, center, toY }
  }, [targets, hidden, offset, height, series])

  const xs = Array.from({ length: N }, (_, j) => (j / (N - 1)) * width)
  const pathOf = (index: number, flat: boolean) => {
    const top = frame.upper[index]
    const bottom = frame.lower[index]
    const y = (value: number, j: number) =>
      frame.toY(flat ? frame.center[j] : value).toFixed(1)
    let d = ''
    for (let j = 0; j < N; j++) {
      d += `${j ? 'L' : 'M'}${xs[j].toFixed(1)},${y(top[j], j)}`
    }
    for (let j = N - 1; j >= 0; j--) {
      d += `L${xs[j].toFixed(1)},${y(bottom[j], j)}`
    }
    return `${d}Z`
  }
  const shown = inView || reduce
  // The first swell is a chart reveal; after it, changes morph quicker.
  const [grown, setGrown] = useState(false)
  const swell = reduce ? { duration: 0 } : grown ? chartMorph : chartReveal

  const [reading, setReadingState] = useState<Reading | null>(null)
  const [seenSignature, setSeenSignature] = useState(signature)
  if (seenSignature !== signature) {
    setSeenSignature(signature)
    setReadingState(null)
  }
  const index = reading && !empty ? Math.min(reading.index, last) : null
  const [legendKey, setLegendKey] = useState<string | null>(null)
  const wanted = reading?.key ?? legendKey
  const activeKey =
    wanted && visible.some((item) => item.key === wanted) ? wanted : null
  const setReading = (next: Reading | null) => {
    setReadingState(next)
    const nextIndex = next && !empty ? Math.min(next.index, last) : null
    if (nextIndex !== index || (next?.key ?? null) !== (reading?.key ?? null)) {
      onActiveChange?.(nextIndex, next?.key ?? null)
    }
  }

  // The layer under the pointer, found in the stack on screen.
  const readAt = (event: PointerEvent<HTMLDivElement>): Reading | null => {
    const box = event.currentTarget.getBoundingClientRect()
    if (!box.width || empty) {
      return null
    }
    const share = clamp((event.clientX - box.left) / box.width, 0, 1)
    const y = event.clientY - box.top
    const at = last > 0 ? Math.round(share * last) : 0
    const j = Math.round(share * (N - 1))
    let key: string | null = null
    series.forEach((line, i) => {
      if (hidden.includes(line.key)) {
        return
      }
      const top = frame.toY(frame.upper[i][j])
      const bottom = frame.toY(frame.lower[i][j])
      if (y >= top - 1 && y <= bottom + 1) {
        key = line.key
      }
    })
    return { index: at, key, y }
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (empty) {
      return
    }
    if (event.key === 'Escape' && reading) {
      event.preventDefault()
      setReading(null)
      return
    }
    const from = index ?? last
    const keys = visible.map((line) => line.key)
    const at = activeKey ? keys.indexOf(activeKey) : -1
    const page = Math.max(1, Math.round(data.length / 6))
    const step = (to: number): Reading => ({
      index: clamp(to, 0, last),
      key: activeKey,
      y: null,
    })
    const layer = (to: number): Reading => ({
      index: from,
      key: keys[to] ?? null,
      y: null,
    })
    const moves: Record<string, () => Reading> = {
      ArrowLeft: () => step(from - 1),
      ArrowRight: () => step(index === null ? last : from + 1),
      PageDown: () => step(from - page),
      PageUp: () => step(from + page),
      Home: () => step(0),
      End: () => step(last),
      ArrowUp: () =>
        layer(at < 0 ? keys.length - 1 : Math.min(keys.length - 1, at + 1)),
      ArrowDown: () => layer(at < 0 ? 0 : Math.max(0, at - 1)),
    }
    const move = moves[event.key]
    if (!move) {
      return
    }
    event.preventDefault()
    setReading(move())
  }

  const number = new Intl.NumberFormat(t.intlLocale, {
    maximumFractionDigits: 1,
  })
  const withUnit = (text: string) => `${text}${unit ? ` ${unit}` : ''}`
  const format = (value: number, line: StreamgraphSeries) =>
    withUnit(formatValue ? formatValue(value, line) : number.format(value))
  // The tooltip keeps its last point while it fades out.
  const [heldIndex, setHeldIndex] = useState<number | null>(null)
  if (index !== null && index !== heldIndex) {
    setHeldIndex(index)
  }
  const shownIndex =
    index ?? (heldIndex !== null && heldIndex <= last ? heldIndex : null)
  const point = shownIndex === null ? null : data[shownIndex]
  const current = index === null ? null : data[index]
  const activeLine = series.find((line) => line.key === activeKey)
  const total = (datum: StreamgraphDatum) =>
    visible.reduce(
      (sum, line) => sum + Math.max(0, datum.values[line.key] ?? 0),
      0,
    )
  const announce = current
    ? `${current.label}. ${activeLine ? `${activeLine.label} ${format(current.values[activeLine.key] ?? 0, activeLine)}, ` : ''}${t.chartReading(t.chartTotal, withUnit(number.format(total(current))))}`
    : ''
  const summary = empty
    ? `${label}. ${emptyLabel ?? t.chartNoData}.`
    : `${t.chartSpan(label, data[0].label, data[last].label)} ${visible.map((line) => t.chartLatestOf(line.label, format(data[last].values[line.key] ?? 0, line))).join('. ')}.`
  const picks = axisPicks(data, width)

  const xAt = (at: number) => (last > 0 ? (at / last) * width : width / 2)
  const cross = useChartGlide()
  let anchor: { x: number; y: number } | null = null
  if (index !== null && width) {
    let y = reading?.y ?? null
    const i = series.findIndex((line) => line.key === activeKey)
    if (y === null && i >= 0) {
      const j = Math.round((xAt(index) / width) * (N - 1))
      y = frame.toY((frame.upper[i][j] + frame.lower[i][j]) / 2)
    }
    anchor = { x: xAt(index), y: y ?? height / 2 }
  }
  const tipOrder = stackOrder(series.length, offset)
    .reverse()
    .map((at) => series[at])
    .filter((line) => !hidden.includes(line.key))

  return (
    <MotionScope>
      <figure
        ref={figure}
        aria-label={label}
        className={cn('m-0 grid min-w-0 gap-4 text-fg', className)}
      >
        {legend && series.length > 1 && (
          <div
            role="group"
            aria-label={t.chartSeriesGroup(label)}
            className="-mx-2 flex min-w-0 flex-wrap gap-x-1 gap-y-0.5"
            onPointerLeave={() => setLegendKey(null)}
          >
            {series.map((line) => (
              <button
                key={line.key}
                type="button"
                aria-pressed={!hidden.includes(line.key)}
                data-active={activeKey === line.key ? '' : undefined}
                data-dim={
                  activeKey !== null && activeKey !== line.key ? '' : undefined
                }
                style={{ '--series': colorOf(line) } as CSSProperties}
                // Off or stepping back shows on the swatch and the strike; the words keep 4.5:1.
                className="group/toggle inline-flex min-h-8 cursor-pointer items-center gap-2 rounded-full pr-2.5 pl-2 text-sm text-fg-muted transition-[color,background-color,scale] duration-150 ease-standard outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus active:scale-[0.97] aria-[pressed=false]:text-fg-subtle data-active:bg-hover data-active:text-fg motion-reduce:transition-none"
                onClick={() => toggle(line.key)}
                onPointerEnter={(event) => {
                  if (event.pointerType === 'mouse') {
                    setLegendKey(line.key)
                  }
                }}
                onFocus={(event) => {
                  if (event.currentTarget.matches(':focus-visible')) {
                    setLegendKey(line.key)
                  }
                }}
                onBlur={() => setLegendKey(null)}
              >
                <span
                  aria-hidden="true"
                  className="size-2.5 flex-none rounded-[3px] bg-(--series) transition-[scale,opacity] duration-200 ease-standard group-data-dim/toggle:opacity-40 group-aria-[pressed=false]/toggle:scale-60 group-aria-[pressed=false]/toggle:opacity-35 motion-reduce:transition-none"
                />
                <span className="whitespace-nowrap decoration-current/55 group-aria-[pressed=false]/toggle:line-through">
                  {line.label}
                </span>
              </button>
            ))}
          </div>
        )}
        <div
          data-active={index !== null ? '' : undefined}
          data-layer={activeKey ? '' : undefined}
          className="group/stream relative grid min-w-0 grid-rows-[auto_1.625rem]"
        >
          {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- the plot is explored with the arrows; each reading is said in a live region */}
          <div
            ref={plotRef}
            role="group"
            tabIndex={empty ? -1 : 0}
            aria-roledescription={t.streamgraphRole}
            aria-label={`${label}. ${t.streamgraphKeys}`}
            style={{ height }}
            className="relative min-w-0 cursor-crosshair touch-pan-y rounded-md outline-none select-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus"
            onPointerMove={(event) => {
              if (event.pointerType === 'mouse' || event.buttons) {
                setReading(readAt(event))
              }
            }}
            onPointerDown={(event) => {
              if (event.pointerType !== 'mouse') {
                event.currentTarget.setPointerCapture?.(event.pointerId)
              }
              setReading(readAt(event))
            }}
            onPointerUp={(event) => {
              if (event.pointerType !== 'mouse') {
                setReading(null)
              }
            }}
            onPointerCancel={() => setReading(null)}
            onPointerLeave={(event) => {
              if (event.pointerType === 'mouse') {
                setReading(null)
              }
            }}
            onKeyDown={onKeyDown}
            onBlur={() => setReading(null)}
            onFocus={(event) => {
              if (event.currentTarget.matches(':focus-visible') && !empty) {
                setReading(reading ?? { index: last, key: null, y: null })
              }
            }}
          >
            <svg
              width="100%"
              height={height}
              aria-hidden="true"
              focusable="false"
              className="block overflow-visible"
            >
              {width > 0 &&
                !empty &&
                series.map((line, at) => (
                  <motion.path
                    key={line.key}
                    data-active={activeKey === line.key ? '' : undefined}
                    style={{ '--series': colorOf(line) } as CSSProperties}
                    className="fill-[color-mix(in_oklab,var(--series)_82%,var(--surface))] stroke-surface stroke-2 transition-[opacity,fill] duration-200 ease-standard [stroke-linejoin:round] group-data-layer/stream:not-data-active:opacity-34 data-active:fill-(--series) motion-reduce:transition-none"
                    initial={reduce ? false : { d: pathOf(at, true) }}
                    animate={{ d: pathOf(at, !shown) }}
                    transition={swell}
                    onAnimationComplete={() => {
                      if (shown && at === 0) {
                        setGrown(true)
                      }
                    }}
                  />
                ))}
              <motion.line
                ref={(node) => {
                  if (node) {
                    cross.moveTo(index === null ? null : xAt(index))
                  }
                }}
                x1={0}
                x2={0}
                y1={0}
                y2={height}
                style={{ x: cross.value }}
                className="pointer-events-none stroke-fg stroke-1 opacity-0 transition-opacity duration-100 [shape-rendering:crispEdges] [stroke-opacity:0.5] group-data-active/stream:opacity-100"
              />
              {directLabels &&
                width > 0 &&
                !empty &&
                series.map((line, i) => {
                  const top = frame.upper[i]
                  const bottom = frame.lower[i]
                  let best = 4
                  for (let j = 4; j < N - 4; j++) {
                    if (top[j] - bottom[j] > top[best] - bottom[best]) {
                      best = j
                    }
                  }
                  const thickness =
                    frame.toY(bottom[best]) - frame.toY(top[best])
                  const room = line.label.length * 6.6 + 4
                  const fits =
                    !hidden.includes(line.key) &&
                    thickness >= 19 &&
                    room + 16 < width
                  const dim = activeKey !== null && activeKey !== line.key
                  const x = clamp(xs[best], room / 2 + 6, width - room / 2 - 6)
                  const y = frame.toY((top[best] + bottom[best]) / 2)
                  return (
                    <motion.text
                      key={line.key}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="pointer-events-none fill-fg stroke-surface text-xs font-medium [paint-order:stroke] [stroke-linejoin:round] [stroke-opacity:0.85] [stroke-width:3px]"
                      initial={reduce ? false : { x, y, opacity: 0 }}
                      animate={{
                        x,
                        y,
                        opacity: shown && fits && !dim ? 1 : 0,
                      }}
                      transition={reduce ? { duration: 0 } : chartMorph}
                    >
                      {line.label}
                    </motion.text>
                  )
                })}
            </svg>
            {!empty && (
              <ChartTooltip
                anchor={anchor}
                bounds={{ width, height }}
                className="min-w-39 gap-1"
              >
                <p className="m-0 mb-0.5 text-xs whitespace-nowrap text-fg-muted tabular-nums">
                  {point?.label}
                </p>
                {tipOrder.map((line) => (
                  <p
                    key={line.key}
                    data-active={activeKey === line.key ? '' : undefined}
                    data-dim={
                      activeKey !== null && activeKey !== line.key
                        ? ''
                        : undefined
                    }
                    style={{ '--series': colorOf(line) } as CSSProperties}
                    className="group/row m-0 flex min-w-0 items-center gap-2 leading-tight"
                  >
                    <span className="h-0.75 w-2.5 flex-none rounded-xs bg-(--series) transition-opacity duration-150 group-data-dim/row:opacity-40" />
                    <span className="min-w-0 flex-1 truncate text-fg-muted group-data-active/row:text-fg">
                      {line.label}
                    </span>
                    <span className="ml-2 flex-none font-medium whitespace-nowrap tabular-nums group-data-dim/row:text-fg-muted">
                      {point ? format(point.values[line.key] ?? 0, line) : ''}
                    </span>
                  </p>
                ))}
              </ChartTooltip>
            )}
            {(empty || visible.length === 0) && (
              <p className="pointer-events-none absolute inset-0 m-0 grid place-items-center text-sm text-fg-subtle">
                {empty ? (emptyLabel ?? t.chartNoData) : t.chartChooseSeries}
              </p>
            )}
          </div>
          <div aria-hidden="true" className="relative min-w-0">
            {picks.map((at) => {
              const share = last > 0 ? at / last : 0.5
              const item = data[at]
              return (
                <span
                  key={item.key}
                  style={{
                    left: `${share * 100}%`,
                    translate: `${-share * 100}% 0`,
                  }}
                  className="absolute top-2 text-xs/none whitespace-nowrap text-fg-subtle tabular-nums transition-opacity duration-200 starting:opacity-0 motion-reduce:transition-none"
                >
                  {item.axisLabel}
                </span>
              )
            })}
          </div>
        </div>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {announce}
        </p>
        <p className="sr-only">{summary}</p>
        {!empty && (
          <ChartDataTable
            caption={label}
            head={[
              categoryLabel ?? t.chartPeriod,
              ...series.map((line) => line.label),
            ]}
            rows={data.map((item) => ({
              key: item.key,
              cells: [
                item.label,
                ...series.map((line) =>
                  format(item.values[line.key] ?? 0, line),
                ),
              ],
            }))}
          />
        )}
      </figure>
    </MotionScope>
  )
}
