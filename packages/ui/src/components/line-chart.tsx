import { useCallback, useId, useMemo, useRef, useState } from 'react'
import type { CSSProperties, RefObject } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
} from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { chartColor, seriesColor } from '../internal/chart-color.ts'
import type { ChartColor } from '../internal/chart-color.ts'
import { ChartDataTable } from '../internal/chart-data-table.tsx'
import { ChartGridline } from '../internal/chart-gridline.tsx'
import { ChartLegend } from '../internal/chart-legend.tsx'
import { chartFollow, chartMorph } from '../internal/chart-motion.ts'
import {
  blendCurves,
  curveThrough,
  niceScale,
  valueAt,
} from '../internal/chart-scale.ts'
import type { CurvePoint } from '../internal/chart-scale.ts'
import { useChartScrub } from '../internal/chart-scrub.ts'
import { ChartTick } from '../internal/chart-tick.tsx'
import { ChartTooltip } from '../internal/chart-tooltip.tsx'
import { duration, ease } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { cn } from '../lib/cn.ts'

// Adapted from Arc UI's line chart (https://uiarc.dev, MIT licence, Elia
// Kuratli): GoGoUI's colours (series on --chart-1 … --chart-5) and words,
// numbers through Intl in the provider's language, GoGoUI's shared chart
// tooltip.

type LineChartSeries = {
  /** Stable identity: a series keeps its line across new data, so a new range morphs it. */
  key: string
  /** Its name in the legend, the tooltip and the table. */
  label: string
  /** By default the palette in order: --chart-1, --chart-2… */
  color?: ChartColor
  /** A dashed line, for last year or a target. */
  dashed?: boolean
  /** A faint wash under the line; the first series has one by default. */
  area?: boolean
}

type LineChartDatum = {
  /** Stable identity: « 2026-03 ». */
  key: string
  /** The full label, for the tooltip and screen readers: « mars 2026 ». */
  label: string
  /** The short label on the axis: « mars ». Absent: nothing at that point. */
  axisLabel?: string
  /** One value per series key; a missing one counts as zero. */
  values: Record<string, number | undefined>
}

/** The words LineChart writes, to change on one LineChart only. */
type LineChartLabels = Partial<
  Pick<
    GoGoUIMessages,
    | 'chartReading'
    | 'chartSeriesShown'
    | 'chartSpan'
    | 'chartLatestOf'
    | 'chartSeriesGroup'
    | 'chartExplore'
    | 'chartChooseSeries'
    | 'loading'
  >
>

type LineChartProps = {
  data: readonly LineChartDatum[]
  series: readonly LineChartSeries[]
  /** What is measured: « Demandes reçues ». Names the chart. */
  label: string
  /** A word after each value: « demandes ». Leave it out for a currency. */
  unit?: string
  /** The plot's height in px; its width follows the parent. */
  height?: number
  /** How the numbers are written, through Intl. The value axis writes them compact. */
  format?: Intl.NumberFormatOptions
  /** The hidden series' keys, controlled. */
  hiddenSeries?: readonly string[]
  defaultHiddenSeries?: readonly string[]
  onHiddenSeriesChange?: (hidden: string[]) => void
  /** Told as the reading moves, and with null when it is let go: drive a headline with it. */
  onActiveChange?: (index: number | null, datum: LineChartDatum | null) => void
  /** Keeps the lines on screen, dimmed, while the next range loads. */
  loading?: boolean
  /** Shown when there is no point. */
  emptyLabel?: string
  /** The series switches above the plot; shown when there are several. */
  legend?: boolean
  /** The first column of the hidden table. */
  categoryLabel?: string
  /** Smooth curves that never swing past the data, or straight segments. */
  curve?: 'smooth' | 'linear'
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: LineChartLabels
}

/** A series' line as it moves, read by `paint`, never by React. */
type Track = {
  shape: CurvePoint[]
  presence: number
  fade: { stop: () => void } | null
}

type Store = {
  /** The series drawn, in order. */
  keys: string[]
  tracks: Map<string, Track>
  lines: Map<string, SVGElement>
  areas: Map<string, SVGElement>
  groups: Map<string, SVGElement>
  dots: Map<string, SVGElement>
}
type Drawn = 'lines' | 'areas' | 'groups' | 'dots'

/** The store, made on first use. */
function kept(store: RefObject<Store | null>): Store {
  store.current ??= {
    keys: [],
    tracks: new Map(),
    lines: new Map(),
    areas: new Map(),
    groups: new Map(),
    dots: new Map(),
  }
  return store.current
}

/** Room above the top gridline. */
const TOP = 12
const drawIn = { duration: duration.considered * 1.75, ease: ease.inOut }
const fadeQuick = { duration: duration.instant, ease: ease.standard }

/** The axis labels that fit, one per 76px at most, counted back from the latest so the newest always shows. */
function axisPicks(data: readonly LineChartDatum[], width: number) {
  const labeled = data.flatMap((item, index) => (item.axisLabel ? [index] : []))
  if (!width || labeled.length === 0) {
    return []
  }
  const room = Math.max(2, Math.floor(width / 76))
  const stride = Math.ceil(labeled.length / room)
  return labeled
    .reverse()
    .filter((_, rank) => rank % stride === 0)
    .reverse()
}

/** Every line as a dense curve, keyed by series. */
function curvesOf(
  data: readonly LineChartDatum[],
  series: readonly LineChartSeries[],
  smooth: boolean,
) {
  return new Map(
    series.map((line) => [
      line.key,
      curveThrough(
        data.map((item) => item.values[line.key] ?? 0),
        smooth,
      ),
    ]),
  )
}

/**
 * One or more measures over time, where the shape of the trend matters,
 * after Arc UI's line chart (https://uiarc.dev, MIT).
 *
 * **Use it for** a trend and its comparison: requests per week this year
 * against last year, revenue per month by kind of event. **Not for**
 * comparing each period exactly (`BarChart`), parts of a whole
 * (`DonutChart`) or a small trend beside a figure (`Sparkline`).
 *
 * **Where**: in a dashboard card, full width.
 *
 * **States**: at rest, explored (crosshair, dots and tooltip), series
 * hidden from the legend, loading (lines kept, dimmed), empty, every
 * series hidden.
 *
 * **Compose**: in a `Card`; drive a headline (`RollingNumber`) with
 * `onActiveChange`; switch the range with `Tabs`.
 *
 * **Key props**: `data` (`key`, `label`, `axisLabel`, `values`), `series`
 * (`key`, `label`, `color`, `dashed`, `area`), `label`, `unit`, `format`,
 * `hiddenSeries` / `onHiddenSeriesChange`, `onActiveChange`, `loading`,
 * `curve`, `height`, `labels` to change its words.
 *
 * **Motion**: the lines draw left to right once seen; new data morphs
 * every line from the one on screen; a hidden series flattens and fades
 * while the axis rescales; the crosshair and the tooltip glide from
 * point to point. With reduced motion everything lands at once.
 *
 * **Accessibility**: the chart is summed up in words (span, latest value
 * of each series) and its values are in a hidden table; the plot is a
 * slider read with the arrows, Page up / Page down, Home / End and
 * Escape; the legend's switches are toggle buttons.
 *
 * @summary Lines over time, explored point by point, with series to hide.
 */
function LineChart({
  data,
  series,
  label,
  unit = '',
  height = 220,
  format,
  hiddenSeries,
  defaultHiddenSeries,
  onHiddenSeriesChange,
  onActiveChange,
  loading = false,
  emptyLabel,
  legend,
  categoryLabel,
  curve = 'smooth',
  className,
  labels,
}: LineChartProps) {
  const messages = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const uid = `line${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const emptyText = emptyLabel ?? messages.chartNoData
  const firstColumn = categoryLabel ?? messages.chartPeriod
  const number = useMemo(
    () =>
      new Intl.NumberFormat(messages.intlLocale, {
        maximumFractionDigits: 1,
        ...format,
      }),
    [messages.intlLocale, format],
  )
  const compact = useMemo(
    () =>
      new Intl.NumberFormat(messages.intlLocale, {
        maximumFractionDigits: 1,
        ...format,
        notation: 'compact',
      }),
    [messages.intlLocale, format],
  )
  const write = (value: number) =>
    `${number.format(value)}${unit ? ` ${unit}` : ''}`
  const last = data.length - 1
  const empty = data.length === 0
  const colorOf = (line: LineChartSeries) =>
    line.color
      ? chartColor(line.color)
      : seriesColor(series.findIndex((item) => item.key === line.key))

  // Hidden series, controlled or not.
  const [ownHidden, setOwnHidden] = useState<readonly string[]>(
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
  const visible = series.filter((line) => !hidden.includes(line.key))
  const showLegend = legend ?? series.length > 1
  const hiddenKey = hidden.join('|')

  // Each series becomes a dense curve, made again only when the data does.
  const signature = `${curve}|${series.map((line) => line.key).join(',')}|${data
    .map(
      (item) =>
        `${item.key}:${series.map((line) => item.values[line.key] ?? 0).join(',')}`,
    )
    .join(';')}`
  const [curves, setCurves] = useState(() => ({
    signature,
    targets: curvesOf(data, series, curve === 'smooth'),
  }))
  if (curves.signature !== signature) {
    setCurves({
      signature,
      targets: curvesOf(data, series, curve === 'smooth'),
    })
  }
  const targets = curves.targets

  // The value axis fits the series on show only.
  let low = Infinity
  let high = -Infinity
  for (const line of visible) {
    for (const item of data) {
      const value = item.values[line.key] ?? 0
      low = Math.min(low, value)
      high = Math.max(high, value)
    }
  }
  const range = Number.isFinite(low) ? niceScale(low, high) : null
  const [steady, setSteady] = useState(() => range ?? niceScale(0, 100))
  if (range && (range.min !== steady.min || range.max !== steady.max)) {
    setSteady(range)
  }
  const axisMin = useMotionValue(steady.min)
  const axisMax = useMotionValue(steady.max)
  const [axis] = useState(() => ({ min: axisMin, max: axisMax }))

  const figure = useRef<HTMLElement>(null)
  const plot = useRef<HTMLDivElement | null>(null)
  const inView = useInView(figure, { once: true, amount: 0.3 })
  const { index, handlers } = useChartScrub({
    count: data.length,
    resetKey: signature,
    indexAt: (clientX) => {
      const box = plot.current?.getBoundingClientRect()
      if (!box?.width || last < 1) {
        return Math.max(0, last)
      }
      return Math.round(((clientX - box.left) / box.width) * last)
    },
    onChange: (at) => onActiveChange?.(at, at === null ? null : data[at]!),
  })
  const scrubbing = index !== null

  const [plotWidth, setPlotWidth] = useState(0)
  const width = useRef(0)
  // What `paint` writes to, made on first use: the lines as they move,
  // and the drawn elements of each series.
  const store = useRef<Store | null>(null)
  const clip = useRef<SVGRectElement | null>(null)
  const crosshair = useRef<SVGLineElement | null>(null)
  const drawn = useMotionValue(0)
  const cursor = useMotionValue(1)

  // One writer for every drawn attribute: morphs, switches, the axis, the
  // crosshair and the measured width all repaint through here.
  const paint = useCallback(() => {
    const w = width.current
    if (!w) {
      return
    }
    const lo = axisMin.get()
    const span = axisMax.get() - lo || 1
    const toY = (value: number) =>
      TOP + (1 - (value - lo) / span) * (height - TOP)
    const at = cursor.get()
    const { keys, tracks, lines, areas, groups, dots } = kept(store)
    for (const key of keys) {
      const track = tracks.get(key)
      if (!track) {
        continue
      }
      // A series leaving flattens toward the axis as it fades.
      const y = (value: number) => toY(lo + (value - lo) * track.presence)
      const path = track.shape.length
        ? `M${track.shape.map(([x, value]) => `${(x * w).toFixed(1)},${y(value).toFixed(1)}`).join('L')}`
        : ''
      lines.get(key)?.setAttribute('d', path)
      areas
        .get(key)
        ?.setAttribute('d', path ? `${path}L${w},${height}L0,${height}Z` : '')
      const group = groups.get(key)
      if (group) {
        group.style.opacity = String(track.presence)
      }
      const dot = dots.get(key)
      if (dot && track.shape.length) {
        dot.setAttribute('cx', (at * w).toFixed(1))
        dot.setAttribute('cy', y(valueAt(track.shape, at)).toFixed(1))
      }
    }
    clip.current?.setAttribute('width', String(drawn.get() * (w + 16)))
    const cx = String(Math.round(at * w) + 0.5)
    crosshair.current?.setAttribute('x1', cx)
    crosshair.current?.setAttribute('x2', cx)
  }, [axisMax, axisMin, cursor, drawn, height])
  useMotionValueEvent(cursor, 'change', paint)
  useMotionValueEvent(drawn, 'change', paint)
  useMotionValueEvent(axisMin, 'change', paint)
  useMotionValueEvent(axisMax, 'change', paint)

  // The plot draws in its own px: its width followed.
  const measure = useCallback(
    (node: HTMLDivElement | null) => {
      plot.current = node
      if (!node || typeof ResizeObserver === 'undefined') {
        return undefined
      }
      const read = () => {
        width.current = node.clientWidth
        setPlotWidth(node.clientWidth)
        paint()
      }
      read()
      const observer = new ResizeObserver(read)
      observer.observe(node)
      return () => observer.disconnect()
    },
    [paint],
  )

  // New data morphs every line from the one on screen; a hidden series
  // flattens and fades, a shown one rises back.
  const move = useCallback(
    (node: SVGGElement | null) => {
      if (!node) {
        return undefined
      }
      const off = new Set(hiddenKey ? hiddenKey.split('|') : [])
      const drawnNow = kept(store)
      const { tracks } = drawnNow
      drawnNow.keys = [...targets.keys()]
      for (const key of tracks.keys()) {
        if (!targets.has(key)) {
          tracks.delete(key)
        }
      }
      const moves: {
        track: Track
        blend: (progress: number) => CurvePoint[]
        target: CurvePoint[]
      }[] = []
      for (const [key, target] of targets) {
        const track = tracks.get(key)
        if (!track) {
          tracks.set(key, {
            shape: target,
            presence: off.has(key) ? 0 : 1,
            fade: null,
          })
        } else if (reduce || track.shape.length === 0 || target.length === 0) {
          track.shape = target
        } else if (track.shape !== target) {
          moves.push({ track, blend: blendCurves(track.shape, target), target })
        }
      }
      for (const [key, track] of tracks) {
        const to = off.has(key) ? 0 : 1
        if (track.presence === to) {
          continue
        }
        track.fade?.stop()
        if (reduce) {
          track.presence = to
          continue
        }
        track.fade = animate(track.presence, to, {
          ...chartMorph,
          onUpdate: (value) => {
            track.presence = value
            paint()
          },
        })
      }
      const morph = moves.length
        ? animate(0, 1, {
            ...chartMorph,
            onUpdate: (progress) => {
              for (const item of moves) {
                item.track.shape = item.blend(progress)
              }
              paint()
            },
            onComplete: () => {
              for (const item of moves) {
                item.track.shape = item.target
              }
              paint()
            },
          })
        : null
      paint()
      return () => morph?.stop()
    },
    [hiddenKey, paint, reduce, targets],
  )

  // The value axis springs to the series on show.
  const rescale = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) {
        return undefined
      }
      if (reduce) {
        axisMin.jump(steady.min)
        axisMax.jump(steady.max)
        return undefined
      }
      const controls = [
        animate(axisMin, steady.min, chartMorph),
        animate(axisMax, steady.max, chartMorph),
      ]
      return () => controls.forEach((control) => control.stop())
    },
    [axisMax, axisMin, reduce, steady],
  )

  // The lines draw left to right the first time the chart is seen with data.
  const drawOnView = useCallback(
    (node: SVGRectElement | null) => {
      clip.current = node
      if (!node || empty) {
        return undefined
      }
      if (reduce) {
        drawn.jump(1)
        return undefined
      }
      if (!inView || drawn.get() >= 1) {
        return undefined
      }
      const controls = animate(drawn, 1, drawIn)
      return () => controls.stop()
    },
    [drawn, empty, inView, reduce],
  )

  // The crosshair lands on the first explored point and glides between
  // the ones after it.
  const exploring = useRef(false)
  const follow = useCallback(
    (node: SVGLineElement | null) => {
      crosshair.current = node
      if (!node) {
        return undefined
      }
      if (index === null) {
        exploring.current = false
        return undefined
      }
      const to = last > 0 ? index / last : 0.5
      if (reduce || !exploring.current) {
        cursor.jump(to)
        exploring.current = true
        return undefined
      }
      const controls = animate(cursor, to, chartFollow)
      return () => controls.stop()
    },
    [cursor, index, last, reduce],
  )

  const reading = index === null ? null : data[index]!
  // The tooltip's anchor: the crosshair, at the middle of the dots it reads.
  const anchor =
    reading && plotWidth
      ? (() => {
          const span = steady.max - steady.min || 1
          const ys = visible.map(
            (line) =>
              TOP +
              (1 - ((reading.values[line.key] ?? 0) - steady.min) / span) *
                (height - TOP),
          )
          return {
            x: (last > 0 ? index! / last : 0.5) * plotWidth,
            y: ys.length
              ? ys.reduce((sum, value) => sum + value, 0) / ys.length
              : height / 2,
          }
        })()
      : null
  const valueText = reading
    ? messages.chartReading(
        reading.label,
        visible
          .map(
            (line) => `${line.label} ${write(reading.values[line.key] ?? 0)}`,
          )
          .join(', '),
      )
    : empty
      ? emptyText
      : messages.chartSeriesShown(visible.length, series.length)
  const summary = empty
    ? `${label}. ${emptyText}.`
    : [
        messages.chartSpan(label, data[0]!.label, data[last]!.label),
        ...visible.map(
          (line) =>
            `${messages.chartLatestOf(line.label, write(data[last]!.values[line.key] ?? 0))}.`,
        ),
      ].join(' ')
  const picks = axisPicks(data, plotWidth)
  const allHidden = !empty && visible.length === 0
  // A series' element joins the painter's store when drawn, leaves with it.
  const register = (kind: Drawn, key: string) => (node: SVGElement | null) => {
    if (!node) {
      return undefined
    }
    const map = kept(store)[kind]
    map.set(key, node)
    return () => {
      if (map.get(key) === node) {
        map.delete(key)
      }
    }
  }

  return (
    <MotionScope>
      <figure
        ref={figure}
        data-slot="line-chart"
        aria-label={label}
        aria-busy={loading || undefined}
        className={cn('m-0 grid min-w-0 gap-4 text-fg', className)}
      >
        {showLegend && (
          <ChartLegend
            label={messages.chartSeriesGroup(label)}
            items={series.map((line) => ({
              key: line.key,
              label: line.label,
              color: colorOf(line),
              dashed: line.dashed,
            }))}
            hidden={hidden}
            onToggle={toggle}
          />
        )}
        <div className="relative grid min-w-0 grid-cols-[minmax(0,1fr)_3rem] grid-rows-[auto_1.625rem]">
          <div
            ref={measure}
            role="slider"
            tabIndex={empty ? -1 : 0}
            aria-label={messages.chartExplore(label)}
            aria-orientation="horizontal"
            aria-valuemin={1}
            aria-valuemax={Math.max(1, data.length)}
            aria-valuenow={(index ?? Math.max(0, last)) + 1}
            aria-valuetext={valueText}
            {...handlers}
            style={{ height }}
            className="relative min-w-0 touch-pan-y rounded-sm outline-none select-none [grid-area:1/1] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus"
          >
            <svg
              width="100%"
              height={height}
              aria-hidden="true"
              focusable="false"
              className="block overflow-visible"
            >
              <defs>
                <clipPath id={`${uid}-draw`} clipPathUnits="userSpaceOnUse">
                  <rect
                    ref={drawOnView}
                    x={-8}
                    y={-16}
                    width={0}
                    height={height + 32}
                  />
                </clipPath>
              </defs>
              <AnimatePresence initial={false}>
                {steady.ticks.slice(1).map((value) => (
                  <ChartGridline
                    key={value}
                    value={value}
                    axis={axis}
                    height={height}
                    top={TOP}
                  />
                ))}
              </AnimatePresence>
              <line
                x1={0}
                x2="100%"
                y1={height - 0.5}
                y2={height - 0.5}
                strokeWidth={1}
                className="stroke-line-strong [shape-rendering:crispEdges]"
              />
              <line
                ref={follow}
                y1={TOP - 4}
                y2={height}
                strokeWidth={1}
                className={cn(
                  'stroke-line-strong transition-opacity duration-100 [shape-rendering:crispEdges] motion-reduce:transition-none',
                  scrubbing ? 'opacity-100' : 'opacity-0',
                )}
              />
              <g
                ref={move}
                clipPath={`url(#${uid}-draw)`}
                className={cn(
                  'transition-opacity duration-200 motion-reduce:transition-none',
                  loading && 'opacity-35',
                )}
              >
                <g className={cn(loading && 'motion-safe:animate-pulse')}>
                  {series.map((line, at) => (
                    <g
                      key={line.key}
                      ref={register('groups', line.key)}
                      style={{ '--series': colorOf(line) } as CSSProperties}
                    >
                      {(line.area ?? at === 0) && (
                        <path
                          ref={register('areas', line.key)}
                          className="fill-[color-mix(in_oklab,var(--series)_9%,transparent)]"
                        />
                      )}
                      <path
                        ref={register('lines', line.key)}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={line.dashed ? 1.75 : 2}
                        strokeDasharray={line.dashed ? '4 5' : undefined}
                        className="stroke-(--series)"
                      />
                    </g>
                  ))}
                </g>
              </g>
              {series.map((line) => (
                <circle
                  key={line.key}
                  ref={register('dots', line.key)}
                  r={4}
                  strokeWidth={2}
                  style={{ '--series': colorOf(line) } as CSSProperties}
                  className={cn(
                    'fill-(--series) stroke-surface transition-opacity duration-100 motion-reduce:transition-none',
                    scrubbing && !hidden.includes(line.key)
                      ? 'opacity-100'
                      : 'opacity-0',
                  )}
                />
              ))}
            </svg>
            <ChartTooltip anchor={anchor} bounds={{ width: plotWidth, height }}>
              <p className="mb-0.5 text-xs whitespace-nowrap text-fg-muted tabular-nums">
                {(reading ?? data[last])?.label ?? ''}
              </p>
              {visible.map((line) => (
                <p
                  key={line.key}
                  style={{ '--series': colorOf(line) } as CSSProperties}
                  className="flex min-w-0 items-center gap-2 text-sm"
                >
                  <span
                    className={cn(
                      'h-[2.5px] w-2.5 flex-none rounded-xs',
                      line.dashed
                        ? 'bg-[repeating-linear-gradient(to_right,var(--series)_0_3px,transparent_3px_5px)]'
                        : 'bg-(--series)',
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate text-fg-muted">
                    {line.label}
                  </span>
                  <span className="ml-2 flex-none font-medium whitespace-nowrap tabular-nums">
                    {write((reading ?? data[last])?.values[line.key] ?? 0)}
                  </span>
                </p>
              ))}
            </ChartTooltip>
            <AnimatePresence initial={false}>
              {(empty || allHidden) && !loading && (
                <motion.p
                  key={empty ? 'empty' : 'hidden'}
                  className="pointer-events-none absolute inset-0 m-0 grid place-items-center text-sm text-fg-subtle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: fadeQuick }}
                >
                  {empty ? emptyText : messages.chartChooseSeries}
                </motion.p>
              )}
              {loading && empty && (
                <motion.span
                  key="skeleton"
                  aria-hidden="true"
                  className="absolute inset-x-0 top-[30%] bottom-1/4 rounded-xl bg-linear-to-b from-transparent to-[color-mix(in_oklab,var(--fg)_6%,transparent)] motion-safe:animate-pulse"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: fadeQuick }}
                />
              )}
            </AnimatePresence>
          </div>
          <div
            ref={rescale}
            aria-hidden="true"
            className="relative min-w-0 [grid-area:1/2]"
          >
            <AnimatePresence initial={false}>
              {steady.ticks.map((value) => (
                <ChartTick
                  key={value}
                  value={value}
                  text={compact.format(value)}
                  axis={axis}
                  height={height}
                  top={TOP}
                />
              ))}
            </AnimatePresence>
          </div>
          <div aria-hidden="true" className="relative min-w-0 [grid-area:2/1]">
            <AnimatePresence initial={false}>
              {picks.map((at) => {
                const share = last > 0 ? at / last : 0.5
                const item = data[at]!
                return (
                  <motion.span
                    key={`${item.key}:${item.axisLabel}`}
                    style={{
                      left: `${share * 100}%`,
                      translateX: `${-share * 100}%`,
                    }}
                    className="absolute top-2 text-xs/none whitespace-nowrap text-fg-subtle tabular-nums"
                    // Motion's reduced mode still fades opacity: with less motion the label is simply there, at full contrast.
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={
                      reduce ? undefined : { opacity: 0, transition: fadeQuick }
                    }
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { duration: duration.standard, ease: ease.standard }
                    }
                  >
                    {item.axisLabel}
                  </motion.span>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
        <p className="sr-only">{summary}</p>
        <ChartDataTable
          caption={label}
          head={[firstColumn, ...series.map((line) => line.label)]}
          rows={data.map((item) => ({
            key: item.key,
            cells: [
              item.label,
              ...series.map((line) => write(item.values[line.key] ?? 0)),
            ],
          }))}
        />
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {loading ? messages.loading : ''}
        </p>
      </figure>
    </MotionScope>
  )
}

export { LineChart }
export type { LineChartDatum, LineChartProps, LineChartSeries, LineChartLabels }
