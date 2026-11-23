import { useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react'
import { motion, useInView } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { chartColor } from '../internal/chart-color.ts'
import type { ChartColor } from '../internal/chart-color.ts'
import { ChartDataTable } from '../internal/chart-data-table.tsx'
import { chartMorph, chartReveal } from '../internal/chart-motion.ts'
import { clamp } from '../internal/chart-scale.ts'
import { ChartTooltip } from '../internal/chart-tooltip.tsx'
import { MotionScope } from '../internal/motion-scope.tsx'
import { useElementSize } from '../internal/use-element-size.ts'
import { cn } from '../lib/cn.ts'

export type RidgelineSeries = {
  /** Stable identity: a ridge that survives a data change morphs into its new shape. */
  id: string
  label: string
  /** The raw observations; the ridge is their smoothed density. */
  values: number[]
}

export type RidgelineProps = {
  /** One ridge per series, top to bottom. */
  series: RidgelineSeries[]
  /** What is measured (« Invités par mariage, selon le mois »): the chart's accessible name. */
  label: string
  /** After each value (« invités », « °C »). */
  unit?: string
  formatValue?: (value: number) => string
  /** The axis' range; the data with a little room on each side by default. */
  domain?: [number, number]
  /** How far a ridge may rise into the rows above, in rows. */
  overlap?: number
  /** One row's height in px. */
  rowHeight?: number
  /** The smoothing, in value units; Silverman's rule per series by default. */
  bandwidth?: number
  /** Shades each ridge by its median, from a light tint to the full colour, with the scale under the axis. */
  tint?: boolean
  /** The ridges' colour; `chart-1` by default. */
  color?: ChartColor
  /** The lifted ridge (controlled). */
  active?: string | null
  defaultActive?: string | null
  onActiveChange?: (id: string | null) => void
  /** Shown when there are no values; « Aucune donnée pour cette période » by default. */
  emptyLabel?: string
  className?: string
}

type Stats = {
  q1: number
  median: number
  q3: number
  min: number
  max: number
  n: number
  sorted: number[]
}
type Shape = {
  xs: number[]
  ys: number[]
  row: number
  q1: number
  median: number
  q3: number
}

const SAMPLES = 96
const AXIS = 28
const LIFT = 6

function quantile(sorted: number[], q: number) {
  if (!sorted.length) {
    return 0
  }
  const at = (sorted.length - 1) * q
  const low = Math.floor(at)
  const high = Math.ceil(at)
  return sorted[low] + (sorted[high] - sorted[low]) * (at - low)
}

function statsOf(values: number[]): Stats {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b)
  return {
    sorted,
    n: sorted.length,
    min: sorted[0] ?? 0,
    max: sorted[sorted.length - 1] ?? 0,
    q1: quantile(sorted, 0.25),
    median: quantile(sorted, 0.5),
    q3: quantile(sorted, 0.75),
  }
}

function silverman(stats: Stats) {
  if (stats.n < 2) {
    return 1
  }
  const mean = stats.sorted.reduce((sum, value) => sum + value, 0) / stats.n
  const sd = Math.sqrt(
    stats.sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
      (stats.n - 1),
  )
  const spread = Math.min(sd, (stats.q3 - stats.q1) / 1.34 || sd)
  return Math.max(1e-6, 0.9 * (spread || 1) * Math.pow(stats.n, -0.2))
}

function niceStep(span: number, count: number) {
  const raw = span / Math.max(1, count) || 1
  const power = Math.pow(10, Math.floor(Math.log10(raw)))
  const unit = raw / power
  return (unit >= 5 ? 5 : unit >= 2 ? 2 : 1) * power
}

/** A Gaussian kernel density, sampled across the domain. */
function density(stats: Stats, lo: number, hi: number, bandwidth: number) {
  const xs: number[] = []
  const ys: number[] = []
  const norm = 1 / (Math.max(1, stats.n) * bandwidth * Math.sqrt(2 * Math.PI))
  for (let i = 0; i < SAMPLES; i++) {
    const x = lo + ((hi - lo) * i) / (SAMPLES - 1)
    let sum = 0
    for (const value of stats.sorted) {
      const u = (x - value) / bandwidth
      if (u > -5 && u < 5) {
        sum += Math.exp(-0.5 * u * u)
      }
    }
    xs.push(x)
    ys.push(sum * norm)
  }
  return { xs, ys }
}

/** A ridge's height at a value, straight between two samples. */
function heightAt(shape: Shape, x: number) {
  const { xs, ys } = shape
  if (x <= xs[0] || x >= xs[xs.length - 1]) {
    return 0
  }
  let i = 1
  while (i < xs.length - 1 && xs[i] < x) {
    i++
  }
  const t = (x - xs[i - 1]) / (xs[i] - xs[i - 1] || 1)
  return ys[i - 1] + (ys[i] - ys[i - 1]) * t
}

/**
 * A ridgeline chart, after Arc UI (https://uiarc.dev, MIT): one smoothed
 * distribution per row, overlapping like hills, to compare many shapes at
 * once.
 *
 * **Use it for** how values spread across several groups (the guests per
 * wedding month by month, the days between a request and its visit by
 * origin). **Not for** a few totals (a bar chart in `Chart`), a change
 * over time (`BrushChart`), or fewer than about twenty values a group.
 *
 * **Where**: a report or an analysis page, full width.
 *
 * **States**: drawn, a ridge lifted (pointer, keyboard or `active`) with
 * its middle half shaded, its median and a tooltip, a value read along it
 * (crosshair and the share at or below), empty.
 *
 * **Compose**: in a `Card`; `domain` to compare two charts on one axis.
 *
 * **Key props**: `series` (id, label, values), `label`, `unit`,
 * `formatValue`, `domain`, `overlap`, `rowHeight`, `bandwidth`, `tint`,
 * `color`, `active` + `onActiveChange`.
 *
 * **Motion**: the ridges rise from their baselines in a wave from the top
 * row the first time they are seen; new data morphs them and slides the
 * axis; the lifted ridge rises over its neighbours; the tooltip glides.
 * With reduced motion the final state is drawn at once.
 *
 * **Accessibility**: a named figure; the plot takes the focus, up and
 * down choose a ridge, left and right move along the values, Escape lets
 * go; each reading is said in a live region; a hidden table gives each
 * series' median, quartiles, range and count.
 *
 * @summary Overlapping distributions, one ridge per group.
 */
export function Ridgeline({
  series,
  label,
  unit = '',
  formatValue,
  domain,
  overlap = 2.4,
  rowHeight = 30,
  bandwidth,
  tint = true,
  color = 'chart-1',
  active,
  defaultActive = null,
  onActiveChange,
  emptyLabel,
  className,
}: RidgelineProps) {
  const t = useGoGoUIMessages()
  const reduce = useReduceMotion()
  const figure = useRef<HTMLElement>(null)
  const inView = useInView(figure, { once: true, amount: 0.3 })
  const [plot, plotRef] = useElementSize<HTMLDivElement>()
  const width = plot?.width ?? 0
  const number = new Intl.NumberFormat(t.intlLocale, {
    maximumFractionDigits: 1,
  })
  const percent = new Intl.NumberFormat(t.intlLocale, {
    style: 'percent',
    maximumFractionDigits: 0,
  })
  const format = (value: number) =>
    formatValue
      ? formatValue(value)
      : `${number.format(value)}${unit ? ` ${unit}` : ''}`

  // One density per series on a shared domain, scaled so the tallest peak
  // of all rises `overlap` rows.
  const model = useMemo(() => {
    const stats = series.map((entry) => statsOf(entry.values))
    const widths = stats.map((entry) => bandwidth ?? silverman(entry))
    const filled = stats
      .map((entry, index) => ({ entry, room: 2.5 * widths[index] }))
      .filter(({ entry }) => entry.n)
    let lo =
      domain?.[0] ??
      Math.min(...filled.map(({ entry, room }) => entry.min - room))
    let hi =
      domain?.[1] ??
      Math.max(...filled.map(({ entry, room }) => entry.max + room))
    if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo === hi) {
      lo = 0
      hi = 1
    }
    if (!domain) {
      const step = niceStep(hi - lo, 5)
      lo = Math.floor(lo / step) * step
      hi = Math.ceil(hi / step) * step
    }
    const curves = stats.map((entry, index) =>
      entry.n
        ? density(entry, lo, hi, widths[index])
        : {
            xs: Array.from(
              { length: SAMPLES },
              (_, i) => lo + ((hi - lo) * i) / (SAMPLES - 1),
            ),
            ys: Array.from({ length: SAMPLES }, () => 0),
          },
    )
    const peak = Math.max(1e-9, ...curves.flatMap((curve) => curve.ys))
    const shapes = new Map<string, Shape>(
      series.map((entry, index) => [
        entry.id,
        {
          xs: curves[index].xs,
          ys: curves[index].ys.map((y) => y / peak),
          row: index,
          q1: stats[index].q1,
          median: stats[index].median,
          q3: stats[index].q3,
        },
      ]),
    )
    return {
      stats: new Map(series.map((entry, index) => [entry.id, stats[index]])),
      shapes,
      lo,
      hi,
    }
  }, [series, domain, bandwidth])

  const [ownActive, setOwnActive] = useState<string | null>(defaultActive)
  const current = active !== undefined ? active : ownActive
  const setCurrent = (id: string | null) => {
    if (active === undefined) {
      setOwnActive(id)
    }
    if (id !== current) {
      onActiveChange?.(id)
    }
  }
  const [cursor, setCursor] = useState<{
    value: number
    pointerY: number | null
  } | null>(null)

  const narrow = width > 0 && width < 420
  // The row names' column: room for the longest name, within a third of the width.
  const longest = Math.max(0, ...series.map((entry) => entry.label.length))
  const gutter = Math.min(
    Math.max(narrow ? 36 : 52, Math.ceil(longest * 6.4) + 14),
    Math.max(36, width / 3),
  )
  const top = Math.ceil((overlap - 1) * rowHeight) + LIFT + 8
  const height = top + series.length * rowHeight + AXIS
  const plotWidth = Math.max(40, width - gutter - 4)
  const lift = rowHeight * overlap
  const baselineOf = (row: number) => top + (row + 1) * rowHeight
  const xOf = (value: number) =>
    gutter + ((value - model.lo) / (model.hi - model.lo || 1)) * plotWidth

  const curvePath = (
    shape: Shape,
    closed: boolean,
    flat = false,
    from = -Infinity,
    to = Infinity,
  ) => {
    const base = baselineOf(shape.row)
    const points: string[] = []
    const push = (x: number, y: number) =>
      points.push(
        `${xOf(x).toFixed(2)},${(base - (flat ? 0 : y) * lift).toFixed(2)}`,
      )
    if (from > -Infinity) {
      push(from, heightAt(shape, from))
    }
    shape.xs.forEach((x, i) => {
      if (x > from && x < to) {
        push(x, shape.ys[i])
      }
    })
    if (to < Infinity) {
      push(to, heightAt(shape, to))
    }
    if (!points.length) {
      return ''
    }
    const first = from > -Infinity ? from : shape.xs[0]
    const last = to < Infinity ? to : shape.xs[shape.xs.length - 1]
    return closed
      ? `M${xOf(first).toFixed(2)},${base}L${points.join('L')}L${xOf(last).toFixed(2)},${base}Z`
      : `M${points.join('L')}`
  }

  // The first rise is a chart reveal, a wave from the top row; after it,
  // changes morph quicker.
  const shown = inView || reduce
  const [revealed, setRevealed] = useState(false)
  const motionFor = (row: number) =>
    reduce
      ? { duration: 0 }
      : revealed
        ? chartMorph
        : { ...chartReveal, delay: row * 0.025 }

  // The axis ticks for the domain.
  const tickCount = Math.max(2, Math.floor(plotWidth / 72))
  const step = niceStep(model.hi - model.lo, tickCount)
  const ticks: number[] = []
  for (
    let value = Math.ceil(model.lo / step) * step;
    value <= model.hi + 1e-9;
    value += step
  ) {
    ticks.push(Math.round(value * 1e6) / 1e6 || 0)
  }

  const activeStats = current ? model.stats.get(current) : undefined
  const activeSeries = current
    ? series.find((entry) => entry.id === current)
    : undefined
  const below = (stats: Stats | undefined, value: number) =>
    stats?.n ? stats.sorted.filter((item) => item <= value).length / stats.n : 0
  const reading =
    cursor && activeStats
      ? { value: cursor.value, below: below(activeStats, cursor.value) }
      : null
  // The tooltip keeps its last words while it fades out.
  const [held, setHeld] = useState<{ id: string; value: number | null } | null>(
    null,
  )
  if (
    current &&
    (held?.id !== current || held.value !== (reading?.value ?? null))
  ) {
    setHeld({ id: current, value: reading?.value ?? null })
  }
  const tipSeries = held
    ? series.find((entry) => entry.id === held.id)
    : undefined
  const tipStats = held ? model.stats.get(held.id) : undefined
  const lensShape = current ? model.shapes.get(current) : undefined
  const anchor =
    lensShape && width
      ? {
          x: reading ? xOf(reading.value) : xOf(lensShape.median),
          y:
            cursor?.pointerY ??
            baselineOf(lensShape.row) -
              heightAt(lensShape, lensShape.median) * lift -
              LIFT,
        }
      : null

  const valueAt = (x: number) =>
    model.lo + clamp((x - gutter) / plotWidth, 0, 1) * (model.hi - model.lo)
  const pick = (x: number, y: number) => {
    const value = valueAt(x)
    let best: Shape | null = null
    let bestId: string | null = null
    for (const [id, shape] of model.shapes) {
      const base = baselineOf(shape.row)
      const rise = heightAt(shape, value) * lift
      if (
        y <= base + 2 &&
        y >= base - rise - 4 &&
        (!best || shape.row > best.row)
      ) {
        best = shape
        bestId = id
      }
    }
    if (!bestId) {
      const row = clamp(Math.floor((y - top) / rowHeight), 0, series.length - 1)
      bestId = series[row]?.id ?? null
    }
    return { id: bestId, value }
  }
  const leave = () => {
    setCurrent(null)
    setCursor(null)
  }
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - box.left
    const y = event.clientY - box.top
    if (x < gutter - 8 || y > height - AXIS + 4) {
      if (event.pointerType === 'mouse') {
        leave()
      }
      return
    }
    const hit = pick(x, y)
    setCurrent(hit.id)
    setCursor({ value: hit.value, pointerY: y })
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const at = current ? series.findIndex((entry) => entry.id === current) : -1
    const median = (id: string | undefined) =>
      id ? model.stats.get(id)?.median : undefined
    const choose = (index: number) => {
      event.preventDefault()
      const next = series[clamp(index, 0, series.length - 1)]
      if (!next) {
        return
      }
      setCurrent(next.id)
      setCursor({
        value: cursor?.value ?? median(next.id) ?? model.lo,
        pointerY: null,
      })
    }
    const nudge = (direction: number) => {
      event.preventDefault()
      if (!current) {
        choose(0)
        return
      }
      const base = cursor?.value ?? median(current) ?? model.lo
      setCursor({
        value: clamp(
          (Math.round(base / step) + direction) * step,
          model.lo,
          model.hi,
        ),
        pointerY: null,
      })
    }
    if (event.key === 'ArrowDown') {
      choose(at + 1)
    } else if (event.key === 'ArrowUp') {
      choose(at < 0 ? 0 : at - 1)
    } else if (event.key === 'Home') {
      choose(0)
    } else if (event.key === 'End') {
      choose(series.length - 1)
    } else if (event.key === 'ArrowRight') {
      nudge(1)
    } else if (event.key === 'ArrowLeft') {
      nudge(-1)
    } else if (event.key === 'Escape' && current) {
      event.preventDefault()
      leave()
    }
  }

  const empty = !series.length || series.every((entry) => !entry.values.length)
  /** One hue from a light tint (a low median) to full strength (a high one), never through a muddy middle. */
  const toneOf = (share: number) =>
    `color-mix(in oklab, var(--ridge-base) ${Math.round(38 + clamp(share, 0, 1) * 62)}%, var(--surface))`
  const ridgeColor = (value: number) =>
    tint
      ? toneOf((value - model.lo) / (model.hi - model.lo || 1))
      : 'var(--ridge-base)'
  const describe = (entry: RidgelineSeries) => {
    const s = model.stats.get(entry.id) as Stats
    return t.ridgelineDescribe(
      entry.label,
      format(s.median),
      t.chartRange(format(s.q1), format(s.q3)),
      t.chartRange(format(s.min), format(s.max)),
      s.n,
    )
  }
  const announce = activeSeries
    ? `${describe(activeSeries)}${reading ? `. ${t.ridgelineAtOrBelow(percent.format(reading.below), format(reading.value))}` : ''}`
    : ''
  const lensBase = lensShape ? baselineOf(lensShape.row) : 0

  return (
    <MotionScope>
      <figure
        ref={figure}
        aria-label={label}
        style={{ '--ridge-base': chartColor(color) } as CSSProperties}
        className={cn('m-0 grid min-w-0 text-fg', className)}
      >
        {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- the plot is explored with the arrows; each reading is said in a live region */}
        <div
          ref={plotRef}
          role="group"
          tabIndex={empty ? -1 : 0}
          aria-roledescription={t.ridgelineRole}
          aria-label={`${label}. ${t.ridgelineKeys}`}
          data-active={current ? '' : undefined}
          data-cursor={reading ? '' : undefined}
          style={{ height }}
          className="group/ridge relative min-w-0 cursor-crosshair touch-pan-y rounded-md outline-none select-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus"
          onPointerMove={onPointerMove}
          onPointerDown={onPointerMove}
          onPointerLeave={(event) => {
            if (event.pointerType === 'mouse') {
              leave()
            }
          }}
          onKeyDown={onKeyDown}
          onBlur={leave}
        >
          {width > 0 && !empty && (
            <div
              aria-hidden="true"
              style={{ height: height - AXIS + 22 }}
              className="pointer-events-none absolute inset-x-0 top-0"
            >
              {ticks.map((value) => (
                <motion.div
                  key={value}
                  style={{ top: top - rowHeight * 0.5 }}
                  className="absolute bottom-0 left-0 w-px bg-line-subtle"
                  initial={reduce ? false : { x: xOf(value), opacity: 0 }}
                  animate={{ x: xOf(value), opacity: 1 }}
                  transition={reduce ? { duration: 0 } : chartMorph}
                >
                  <span className="absolute bottom-0 left-0 -translate-x-1/2 text-xs/none whitespace-nowrap text-fg-subtle tabular-nums">
                    {format(value)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
          <div
            aria-hidden="true"
            style={{
              top: top - rowHeight * 0.5,
              height: height - AXIS - top + rowHeight * 0.5,
              transform: `translateX(${reading ? xOf(reading.value).toFixed(2) : 0}px)`,
            }}
            className="pointer-events-none absolute left-0 w-px bg-fg opacity-0 transition-opacity duration-100 group-data-cursor/ridge:opacity-35 motion-reduce:transition-none"
          />
          {width > 0 && !empty && (
            <svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              aria-hidden="true"
              focusable="false"
              className="absolute inset-0 block overflow-visible"
            >
              {series.map((entry) => {
                const shape = model.shapes.get(entry.id) as Shape
                const base = baselineOf(shape.row)
                const medianX = xOf(shape.median)
                return (
                  <g
                    key={entry.id}
                    data-dim={
                      current !== null && current !== entry.id ? '' : undefined
                    }
                    data-lifted={current === entry.id ? '' : undefined}
                    style={
                      {
                        '--ridge': ridgeColor(
                          model.stats.get(entry.id)?.median ?? model.lo,
                        ),
                      } as CSSProperties
                    }
                    className="transition-opacity duration-200 ease-standard group-data-active/ridge:data-dim:opacity-38 data-lifted:opacity-0 data-lifted:duration-100 motion-reduce:transition-none"
                  >
                    <motion.path
                      className="fill-[color-mix(in_oklab,var(--ridge)_34%,var(--surface))] stroke-none"
                      initial={
                        reduce ? false : { d: curvePath(shape, true, true) }
                      }
                      animate={{ d: curvePath(shape, true, !shown) }}
                      transition={motionFor(shape.row)}
                    />
                    <motion.line
                      className="stroke-[color-mix(in_oklab,var(--ridge)_55%,var(--surface))] stroke-1"
                      initial={
                        reduce
                          ? false
                          : { x1: medianX, x2: medianX, y1: base, y2: base }
                      }
                      animate={{
                        x1: medianX,
                        x2: medianX,
                        y1: base,
                        y2: shown
                          ? base - heightAt(shape, shape.median) * lift
                          : base,
                      }}
                      transition={motionFor(shape.row)}
                    />
                    <motion.path
                      className="fill-none stroke-(--ridge) [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.5]"
                      initial={
                        reduce ? false : { d: curvePath(shape, false, true) }
                      }
                      animate={{ d: curvePath(shape, false, !shown) }}
                      transition={motionFor(shape.row)}
                      onAnimationComplete={() => {
                        if (shown && shape.row === series.length - 1) {
                          setRevealed(true)
                        }
                      }}
                    />
                  </g>
                )
              })}
              {/* The lifted ridge is a copy drawn above the others, so it rises over its neighbours. */}
              <g
                data-on={lensShape ? '' : undefined}
                style={
                  tipStats
                    ? ({
                        '--ridge': ridgeColor(tipStats.median),
                      } as CSSProperties)
                    : undefined
                }
                className="pointer-events-none opacity-0 transition-[opacity,translate] duration-(--motion-spring) ease-spring data-on:-translate-y-1.5 data-on:opacity-100 motion-reduce:transition-none"
              >
                {lensShape && (
                  <>
                    <path
                      d={curvePath(lensShape, true)}
                      className="fill-[color-mix(in_oklab,var(--ridge)_18%,var(--surface))] stroke-none"
                    />
                    <path
                      d={curvePath(
                        lensShape,
                        true,
                        false,
                        lensShape.q1,
                        lensShape.q3,
                      )}
                      className="fill-[color-mix(in_oklab,var(--ridge)_48%,var(--surface))] stroke-none"
                    />
                    <line
                      x1={xOf(lensShape.median)}
                      x2={xOf(lensShape.median)}
                      y1={lensBase}
                      y2={
                        lensBase - heightAt(lensShape, lensShape.median) * lift
                      }
                      className="stroke-fg [stroke-linecap:round] [stroke-width:1.5]"
                    />
                    <path
                      d={curvePath(lensShape, false)}
                      className="fill-none stroke-(--ridge) [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:2.25]"
                    />
                  </>
                )}
              </g>
            </svg>
          )}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            {series.map((entry, index) => (
              <span
                key={entry.id}
                data-active={current === entry.id ? '' : undefined}
                style={{ top: baselineOf(index) - 18, width: gutter - 10 }}
                className="absolute left-0 truncate text-xs/4.5 text-fg-muted transition-colors duration-150 data-active:font-medium data-active:text-fg motion-reduce:transition-none"
              >
                {entry.label}
              </span>
            ))}
          </div>
          {empty && (
            <p className="pointer-events-none absolute inset-0 m-0 grid place-items-center text-sm text-fg-subtle">
              {emptyLabel ?? t.chartNoData}
            </p>
          )}
          {!empty && (
            <ChartTooltip
              anchor={anchor}
              bounds={{ width, height }}
              placement={{ x: 'after', y: 'above' }}
              instant={cursor !== null && cursor.pointerY === null}
              className="min-w-42.5"
            >
              {tipSeries && tipStats && (
                <>
                  <p className="m-0 mb-0.5 text-xs text-fg-muted">
                    {tipSeries.label}
                  </p>
                  <p className="m-0 flex items-baseline justify-between gap-3 leading-snug font-medium whitespace-nowrap tabular-nums">
                    <span className="text-xs font-normal text-fg-subtle">
                      {t.ridgelineMedian}
                    </span>
                    <span>{format(tipStats.median)}</span>
                  </p>
                  <p className="m-0 flex items-baseline justify-between gap-3 text-xs whitespace-nowrap tabular-nums">
                    <span className="text-fg-subtle">{t.ridgelineMiddle}</span>
                    <span>
                      {t.chartRange(format(tipStats.q1), format(tipStats.q3))}
                    </span>
                  </p>
                  <p className="m-0 flex items-baseline justify-between gap-3 text-xs whitespace-nowrap tabular-nums">
                    <span className="text-fg-subtle">{t.ridgelineSpread}</span>
                    <span>
                      {t.chartRange(format(tipStats.min), format(tipStats.max))}
                    </span>
                  </p>
                  {held?.value != null && (
                    <p className="m-0 mt-1 text-xs text-fg-subtle tabular-nums">
                      {t.ridgelineAtOrBelow(
                        percent.format(below(tipStats, held.value)),
                        format(held.value),
                      )}
                    </p>
                  )}
                </>
              )}
            </ChartTooltip>
          )}
        </div>
        {tint && !empty && (
          <div
            aria-hidden="true"
            className="mt-3 flex flex-wrap items-center justify-end gap-2 text-xs text-fg-subtle tabular-nums"
          >
            <span className="mr-1 text-fg-muted">{t.ridgelineMedian}</span>
            <span>{format(model.lo)}</span>
            <span className="inline-flex gap-0.5">
              {[0, 0.25, 0.5, 0.75, 1].map((share) => (
                <span
                  key={share}
                  style={{ background: toneOf(share) }}
                  className="h-2.5 w-4.5 rounded-[3px]"
                />
              ))}
            </span>
            <span>{format(model.hi)}</span>
          </div>
        )}
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {announce}
        </p>
        {!empty && (
          <ChartDataTable
            caption={label}
            head={[
              t.ridgelineSeries,
              t.ridgelineMedian,
              t.ridgelineFirstQuartile,
              t.ridgelineThirdQuartile,
              t.ridgelineLowest,
              t.ridgelineHighest,
              t.ridgelineCount,
            ]}
            rows={series.map((entry) => {
              const s = model.stats.get(entry.id) as Stats
              return {
                key: entry.id,
                cells: [
                  entry.label,
                  format(s.median),
                  format(s.q1),
                  format(s.q3),
                  format(s.min),
                  format(s.max),
                  number.format(s.n),
                ],
              }
            })}
          />
        )}
      </figure>
    </MotionScope>
  )
}
