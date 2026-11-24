import { useCallback, useId, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  AnimatePresence,
  animate,
  m,
  useInView,
  useMotionValue,
  useTransform,
} from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { BarChartAxisLabel } from '../internal/bar-chart-axis-label.tsx'
import { BarChartBar } from '../internal/bar-chart-bar.tsx'
import { chartColor } from '../internal/chart-color.ts'
import type { ChartColor } from '../internal/chart-color.ts'
import { ChartDataTable } from '../internal/chart-data-table.tsx'
import { ChartGridline } from '../internal/chart-gridline.tsx'
import {
  chartFollow,
  chartMorph,
  physicalSpring,
} from '../internal/chart-motion.ts'
import { clamp, niceScale } from '../internal/chart-scale.ts'
import { useChartScrub } from '../internal/chart-scrub.ts'
import { ChartSwap } from '../internal/chart-swap.tsx'
import { ChartTick } from '../internal/chart-tick.tsx'
import { duration, ease, stagger } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { barCenter } from '../internal/use-bar-slot.ts'
import { cn } from '../lib/cn.ts'
import { RollingNumber } from './rolling-number.tsx'

// Adapted from Arc UI's bar chart (https://uiarc.dev, MIT licence, Elia
// Kuratli): GoGoUI's colours and words, numbers through Intl in the
// provider's language (compact on the value axis), a `color`.

type BarChartDatum = {
  /** Stable identity (« 2026-03 »): a bar whose key survives new data keeps its place, so a new range morphs. */
  key: string
  /** The full label, for the headline and screen readers: « mars 2026 ». */
  label: string
  /** The short label under the bar: « mars ». Absent: nothing under it. */
  axisLabel?: string
  value: number
}

/** The words BarChart writes, to change on one BarChart only. */
type BarChartLabels = Partial<
  Pick<
    GoGoUIMessages,
    | 'chartAverageShort'
    | 'chartReading'
    | 'chartHighest'
    | 'chartLowest'
    | 'chartExplore'
    | 'chartNoData'
  >
>

type BarChartProps = {
  data: readonly BarChartDatum[]
  /** What is measured: « Chiffre d'affaires ». Names the chart. */
  label: string
  /** The range on show, under the headline: « 2026 ». */
  period: string
  /** A word after each value: « demandes ». Leave it out for a currency. */
  unit?: string
  /** The headline's word at rest, above the average. */
  averageLabel?: string
  /** The headline's word while a bar is explored. */
  valueLabel?: string
  /** The first column of the hidden table. */
  categoryLabel?: string
  /** Draws the average as a dashed line that springs to each new range. */
  showAverage?: boolean
  /** The plot's height in px; its width follows the parent. */
  height?: number
  /** How the numbers are written, through Intl: `{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }`. */
  format?: Intl.NumberFormatOptions
  color?: ChartColor
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: BarChartLabels
}

/** Room above the top gridline. */
const TOP = 12
/** A range change zooms in fractions of the plot, so it rests far below a pixel. */
const zoom = physicalSpring(0.3, 0.00001)
const fadeQuick = { duration: duration.instant, ease: ease.standard }

/**
 * The axis labels that fit once the range has settled: every one, else
 * every second, third…, counted back from the latest so the newest always
 * shows and the spacing stays even. Each kept label gets the nudge that
 * holds it inside the plot.
 */
function fittingLabels(
  data: readonly BarChartDatum[],
  width: number,
  sizes: Record<string, number>,
) {
  const fitting = new Map<string, number>()
  if (!width) {
    return fitting
  }
  const count = Math.max(1, data.length)
  const labels = data
    .flatMap((item, index) => {
      const size = item.axisLabel ? sizes[item.axisLabel] : undefined
      if (size === undefined) {
        return []
      }
      const natural =
        width - (data.length - 1 - index + 0.5) * (width / count) - size / 2
      return [
        {
          key: item.key,
          size,
          natural,
          left: clamp(natural, 0, Math.max(0, width - size)),
        },
      ]
    })
    .reverse()
  for (let stride = 1; stride <= labels.length; stride++) {
    const picked = labels.filter((_, rank) => rank % stride === 0)
    const clear = picked.every(
      (label, rank) =>
        rank === 0 || label.left + label.size + 10 <= picked[rank - 1]!.left,
    )
    if (clear || stride === labels.length) {
      for (const label of picked) {
        fitting.set(label.key, label.left - label.natural)
      }
      break
    }
  }
  return fitting
}

/**
 * One measure across a run of periods, with its average, after Arc UI's
 * bar chart (https://uiarc.dev, MIT).
 *
 * **Use it for** comparing periods with each other and with the average:
 * revenue per month, requests per week. **Not for** a trend where the
 * shape matters more than each value (`LineChart`), parts of a whole
 * (`DonutChart`) or a figure in a row (`Sparkline`).
 *
 * **Where**: in a dashboard card, full width.
 *
 * **States**: at rest (the average as headline), explored (a bar's value,
 * its neighbours stepping back), a new range (bars that stay slide, new
 * ones grow, old ones sink), with or without the average line.
 *
 * **Compose**: in a `Card`, with a `Tabs` or a `SelectField` that changes
 * the range.
 *
 * **Key props**: `data` (`key`, `label`, `axisLabel`, `value`), `label`,
 * `period`, `unit`, `format`, `showAverage`, `height`, `color`,
 * `labels` to change its words.
 *
 * **Motion**: the bars grow one after another once seen; a new range
 * zooms the axis around the latest bar, rescales the gridlines and moves
 * the average; the cursor glides from bar to bar and the headline's
 * digits roll. With reduced motion everything lands at once.
 *
 * **Accessibility**: the plot is named by a summary (average, highest,
 * lowest) and its values are in a hidden table; a slider reads each bar
 * with the arrows, Page up / Page down, Home / End and Escape; a new
 * range is announced.
 *
 * @summary Bars across periods with their average, explored bar by bar.
 */
function BarChart({
  data,
  label,
  period,
  unit = '',
  averageLabel,
  valueLabel,
  categoryLabel,
  showAverage = true,
  height = 176,
  format,
  color = 'chart-1',
  className,
  labels,
}: BarChartProps) {
  const messages = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const titleId = useId()
  const restWord = averageLabel ?? messages.chartAverage
  const scrubWord = valueLabel ?? messages.chartValue
  const firstColumn = categoryLabel ?? messages.chartPeriod
  const number = useMemo(
    () =>
      new Intl.NumberFormat(messages.intlLocale, {
        maximumFractionDigits: 0,
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
  const suffix = unit ? ` ${unit}` : ''
  const write = (value: number) => `${number.format(value)}${suffix}`

  const figure = useRef<HTMLElement>(null)
  const plot = useRef<HTMLDivElement>(null)
  const inView = useInView(figure, { once: true, amount: 0.35 })
  const shown = inView || reduce
  const count = Math.max(data.length, 1)
  const last = data.length - 1
  const average = data.length
    ? data.reduce((sum, item) => sum + item.value, 0) / data.length
    : 0
  const peak = data.reduce((max, item) => Math.max(max, item.value), 0)
  const { max: top, ticks } = useMemo(() => niceScale(0, peak), [peak])
  const signature = data.map((item) => item.key).join('|')

  // Bars that join a chart grow outward from the ones that stayed; the
  // first reveal runs left to right.
  const [known, setKnown] = useState(() => ({
    signature,
    keys: new Set(data.map((item) => item.key)),
    fresh: new Map<string, number>(),
    changes: 0,
  }))
  if (known.signature !== signature) {
    const incoming = data
      .map((item, index) => ({ key: item.key, place: last - index }))
      .filter((item) => !known.keys.has(item.key))
      .sort((a, b) => a.place - b.place)
    const step = Math.min(stagger.item, 0.32 / Math.max(1, incoming.length))
    setKnown({
      signature,
      keys: new Set(data.map((item) => item.key)),
      fresh: new Map(incoming.map((item, rank) => [item.key, rank * step])),
      changes: known.changes + 1,
    })
  }
  const revealStep = Math.min(stagger.item, 0.36 / count)

  const { index, handlers } = useChartScrub({
    count: data.length,
    resetKey: signature,
    indexAt: (clientX) => {
      const box = plot.current?.getBoundingClientRect()
      if (!box?.width) {
        return last
      }
      return last - Math.floor(((box.right - clientX) / box.width) * count)
    },
  })
  const scrubbed = index === null ? null : data[index]!
  // Which way the exploring moved: a later bar's words come from below.
  const [moved, setMoved] = useState({ index, direction: 1 })
  if (moved.index !== index) {
    setMoved({
      index,
      direction:
        index === null || moved.index === null
          ? 1
          : Math.sign(index - moved.index) || 1,
    })
  }

  const width = useMotionValue(0)
  const unitShare = useMotionValue(1 / count)
  const scale = useMotionValue(top)
  const zero = useMotionValue(0)
  const mean = useMotionValue(0)
  const cursor = useMotionValue(0)
  // Fixed for the chart's life: the motion values inside move, not the objects.
  const [frame] = useState(() => ({ width, unit: unitShare }))
  const [axis] = useState(() => ({ min: zero, max: scale }))

  // The plot draws in its own px: its width is followed, and the axis
  // labels wait for it, then thin out where they would collide.
  const [plotWidth, setPlotWidth] = useState(0)
  const [labelSizes, setLabelSizes] = useState<Record<string, number>>({})
  const labelTexts = [
    ...new Set(
      data
        .map((item) => item.axisLabel)
        .filter((text): text is string => !!text),
    ),
  ]
  const measurePlot = useCallback(
    (node: HTMLDivElement | null) => {
      plot.current = node
      if (!node || typeof ResizeObserver === 'undefined') {
        return undefined
      }
      const read = () => {
        width.set(node.clientWidth)
        setPlotWidth(node.clientWidth)
      }
      read()
      const observer = new ResizeObserver(read)
      observer.observe(node)
      return () => observer.disconnect()
    },
    [width],
  )
  // The ruler holds every label once; it is drawn anew (its `key`) when
  // the words change, so they are measured again.
  const measureLabels = useCallback((node: HTMLSpanElement | null) => {
    if (!node || typeof ResizeObserver === 'undefined') {
      return undefined
    }
    const read = () => {
      const sizes: Record<string, number> = {}
      for (const item of node.querySelectorAll<HTMLElement>('[data-text]')) {
        sizes[item.dataset.text ?? ''] = item.offsetWidth
      }
      setLabelSizes((before) =>
        Object.keys(sizes).length === Object.keys(before).length &&
        Object.keys(sizes).every((text) => before[text] === sizes[text])
          ? before
          : sizes,
      )
    }
    read()
    const observer = new ResizeObserver(read)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  const shownLabels = fittingLabels(data, plotWidth, labelSizes)

  // A new range zooms the axis around the latest bar and rescales the
  // gridlines, on springs that can be retargeted mid-flight.
  const rescale = useCallback(
    (node: SVGSVGElement | null) => {
      if (!node) {
        return undefined
      }
      if (reduce) {
        unitShare.jump(1 / count)
        scale.jump(top)
        return undefined
      }
      const controls = [
        animate(unitShare, 1 / count, zoom),
        animate(scale, top, chartMorph),
      ]
      return () => controls.forEach((control) => control.stop())
    },
    [count, reduce, scale, top, unitShare],
  )

  // The average rises with the first bars, then springs to each new range.
  const settleMean = useCallback(
    (node: SVGGElement | null) => {
      if (!node) {
        return undefined
      }
      if (reduce) {
        mean.jump(average)
        return undefined
      }
      if (!inView) {
        return undefined
      }
      const first = mean.get() === 0 && !mean.isAnimating()
      const controls = animate(
        mean,
        average,
        first ? { ...chartMorph, delay: 0.12 } : chartMorph,
      )
      return () => controls.stop()
    },
    [average, inView, mean, reduce],
  )

  // The cursor appears on the first explored bar and glides between the
  // ones after it.
  const exploring = useRef(false)
  const glide = useCallback(
    (node: SVGGElement | null) => {
      if (!node) {
        return undefined
      }
      if (index === null) {
        exploring.current = false
        return undefined
      }
      const place = last - index
      if (reduce || !exploring.current) {
        cursor.jump(place)
        exploring.current = true
        return undefined
      }
      const controls = animate(cursor, place, chartFollow)
      return () => controls.stop()
    },
    [cursor, index, last, reduce],
  )

  const cursorX = useTransform(
    () => Math.round(barCenter(frame, cursor.get())) + 0.5,
  )
  const meanY = useTransform(
    () =>
      Math.round(height - (mean.get() / (scale.get() || 1)) * (height - TOP)) +
      0.5,
  )
  const meanText = useTransform(
    () =>
      `${messages.chartAverageShort} ${compact.format(Math.round(mean.get()))}`,
  )

  const reading = scrubbed ?? data[last]
  const highest = data.reduce<BarChartDatum | null>(
    (best, item) => (!best || item.value > best.value ? item : best),
    null,
  )
  const lowest = data.reduce<BarChartDatum | null>(
    (best, item) => (!best || item.value < best.value ? item : best),
    null,
  )
  const averageText = messages.chartReading(
    restWord,
    write(Math.round(average)),
  )
  const summary = [
    `${label}, ${period}.`,
    `${averageText}.`,
    highest ? messages.chartHighest(highest.label, write(highest.value)) : '',
    lowest && lowest !== highest
      ? messages.chartLowest(lowest.label, write(lowest.value))
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <MotionScope>
      <figure
        ref={figure}
        data-slot="bar-chart"
        aria-labelledby={titleId}
        style={{ '--bar': chartColor(color) } as CSSProperties}
        className={cn('m-0 grid min-w-0 gap-5 text-fg', className)}
      >
        <figcaption id={titleId} className="sr-only">
          {label}, {period}
        </figcaption>
        <div aria-hidden="true" className="grid min-w-0 gap-0.5">
          <ChartSwap
            text={scrubbed ? scrubWord : restWord}
            className="min-h-5 text-sm text-fg-muted"
          />
          <span className="flex min-w-0 items-baseline gap-1.5 text-3xl font-medium tracking-title tabular-nums">
            <RollingNumber
              value={scrubbed ? scrubbed.value : Math.round(average)}
              format={{ maximumFractionDigits: 0, ...format }}
            />
            {unit && (
              <span className="text-base font-normal tracking-normal text-fg-muted">
                {unit}
              </span>
            )}
          </span>
          <ChartSwap
            text={scrubbed ? scrubbed.label : period}
            direction={scrubbed ? moved.direction : 1}
            className="min-h-5 text-sm text-fg-subtle"
          />
        </div>
        <div className="relative grid min-w-0 grid-cols-[minmax(0,1fr)_3.25rem] grid-rows-[auto_1.625rem]">
          <div
            ref={measurePlot}
            className="relative min-w-0 [grid-area:1/1]"
            style={{ height }}
          >
            <svg
              ref={rescale}
              width="100%"
              height={height}
              role="img"
              aria-label={summary}
              className="block overflow-hidden"
            >
              <AnimatePresence initial={false}>
                {ticks
                  .filter((value) => value !== 0)
                  .map((value) => (
                    <ChartGridline
                      key={value}
                      value={value}
                      axis={axis}
                      height={height}
                      top={TOP}
                    />
                  ))}
              </AnimatePresence>
              {/* Plain groups carry the springs: motion's own elements never re-run a changed ref. */}
              <g ref={glide}>
                <m.line
                  x1={cursorX}
                  x2={cursorX}
                  y1={TOP}
                  y2={height}
                  strokeWidth={1}
                  className="stroke-line-strong [shape-rendering:crispEdges]"
                  initial={false}
                  animate={{ opacity: index === null ? 0 : 1 }}
                  transition={reduce ? { duration: 0 } : fadeQuick}
                />
              </g>
              <AnimatePresence initial={false}>
                {data.map((item, at) => (
                  <BarChartBar
                    key={item.key}
                    place={last - at}
                    value={item.value}
                    delay={known.fresh.get(item.key) ?? at * revealStep}
                    shown={shown}
                    tone={
                      index === null ? 'rest' : index === at ? 'active' : 'dim'
                    }
                    frame={frame}
                    scale={scale}
                    height={height}
                    top={TOP}
                    reduce={reduce}
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
              {showAverage && (
                <g ref={settleMean}>
                  <m.line
                    x1={0}
                    x2="100%"
                    y1={meanY}
                    y2={meanY}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    className="stroke-fg-muted [shape-rendering:crispEdges]"
                    initial={false}
                    animate={{ opacity: shown ? 1 : 0 }}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { duration: duration.standard, delay: 0.12 }
                    }
                  />
                </g>
              )}
            </svg>
          </div>
          <div aria-hidden="true" className="relative min-w-0 [grid-area:1/2]">
            <AnimatePresence initial={false}>
              {ticks.map((value) => (
                <ChartTick
                  key={value}
                  value={value}
                  text={compact.format(value)}
                  axis={axis}
                  height={height}
                  top={TOP}
                  avoid={showAverage ? meanY : null}
                />
              ))}
            </AnimatePresence>
            {showAverage && (
              <m.span
                style={{ y: meanY }}
                className="pointer-events-none absolute top-0 left-2.5 block h-0 whitespace-nowrap"
                initial={false}
                animate={{ opacity: shown ? 1 : 0 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: duration.standard, delay: 0.12 }
                }
              >
                <m.span className="block -translate-y-1/2 text-xs/none font-medium text-fg tabular-nums">
                  {meanText}
                </m.span>
              </m.span>
            )}
          </div>
          <div
            aria-hidden="true"
            className="relative min-w-0 overflow-hidden [grid-area:2/1]"
          >
            <AnimatePresence initial={false}>
              {data.map((item, at) =>
                item.axisLabel && shownLabels.has(item.key) ? (
                  <BarChartAxisLabel
                    key={`${item.key}:${item.axisLabel}`}
                    text={item.axisLabel}
                    size={labelSizes[item.axisLabel] ?? 0}
                    shift={shownLabels.get(item.key) ?? 0}
                    place={last - at}
                    frame={frame}
                    reduce={reduce}
                  />
                ) : null,
              )}
            </AnimatePresence>
            <span
              key={labelTexts.join('\n')}
              ref={measureLabels}
              className="pointer-events-none invisible absolute top-0 left-0 flex"
            >
              {labelTexts.map((text) => (
                <span
                  key={text}
                  data-text={text}
                  className="flex-none text-xs/none whitespace-nowrap tabular-nums"
                >
                  {text}
                </span>
              ))}
            </span>
          </div>
          {/* The explorer lies over the plot and its axes: hover or drag across it, or focus it and use the arrows. */}
          <div
            role="slider"
            tabIndex={data.length ? 0 : -1}
            aria-label={messages.chartExplore(label)}
            aria-orientation="horizontal"
            aria-valuemin={1}
            aria-valuemax={Math.max(1, data.length)}
            aria-valuenow={(index ?? Math.max(0, last)) + 1}
            aria-valuetext={
              reading
                ? messages.chartReading(reading.label, write(reading.value))
                : messages.chartNoData
            }
            {...handlers}
            className="absolute inset-0 touch-pan-y rounded-sm outline-none select-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus"
          />
        </div>
        <ChartDataTable
          caption={`${label}, ${period}`}
          head={[firstColumn, label]}
          rows={data.map((item) => ({
            key: item.key,
            cells: [item.label, write(item.value)],
          }))}
        />
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {known.changes ? `${period}. ${averageText}.` : ''}
        </p>
      </figure>
    </MotionScope>
  )
}

export { BarChart }
export type { BarChartDatum, BarChartProps, BarChartLabels }
