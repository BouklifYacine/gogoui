import { useCallback, useId, useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react'
import { animate, m, useInView } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { chartColor } from '../internal/chart-color.ts'
import type { ChartColor } from '../internal/chart-color.ts'
import { ChartDataTable } from '../internal/chart-data-table.tsx'
import { chartMorph, chartReveal } from '../internal/chart-motion.ts'
import { clamp, niceScale } from '../internal/chart-scale.ts'
import { useChartScrub } from '../internal/chart-scrub.ts'
import { ChartTooltip } from '../internal/chart-tooltip.tsx'
import { MotionScope } from '../internal/motion-scope.tsx'
import { useElementSize } from '../internal/use-element-size.ts'
import { cn } from '../lib/cn.ts'

export type BrushChartDatum = {
  /** A day, as a Date or epoch milliseconds; the points in ascending order. */
  date: Date | number
  value: number
}

export type BrushChartAnnotation = {
  date: Date | number
  /** A short name beside the marker (« Salon du mariage »). */
  label: string
  /** A longer note for the tooltip and screen readers. */
  description?: string
}

/** The words BrushChart writes, to change on one BrushChart only. */
type BrushChartLabels = Partial<
  Pick<
    GoGoUIMessages,
    | 'chartRange'
    | 'chartSpan'
    | 'brushShowing'
    | 'brushRole'
    | 'brushKeys'
    | 'brushAverage'
    | 'brushVsWeek'
    | 'brushWindow'
    | 'brushWindowRole'
    | 'brushWindowStart'
    | 'brushWindowEnd'
    | 'brushDate'
    | 'brushEvent'
  >
>

export type BrushChartProps = {
  data: BrushChartDatum[]
  /** What is measured (« Demandes reçues par jour »): the chart's accessible name. */
  label: string
  /** After each value (« demandes »). */
  unit?: string
  formatValue?: (value: number) => string
  /** The value axis; a compact number by default (« 1,2 k »). */
  formatTick?: (value: number) => string
  /** A date in the tooltip and the announcements. */
  formatDate?: (date: Date) => string
  /** Events drawn as markers on both charts. */
  annotations?: BrushChartAnnotation[]
  /** The window (controlled), as [start, end] epoch ms: a new value glides it there. */
  range?: [number, number]
  /** The first window when uncontrolled; the whole series by default. */
  defaultRange?: [number, number]
  /** Told while the window is dragged, resized, stepped or reset. */
  onRangeChange?: (range: [number, number]) => void
  /** The smallest window, in ms; seven days by default. */
  minSpan?: number
  /** The main plot's height in px. */
  height?: number
  /** The overview strip's height in px. */
  overviewHeight?: number
  /** The series' colour; `chart-1` by default. Events take `chart-2`. */
  color?: ChartColor
  /** Shown when there is no series; « Aucune donnée pour cette période » by default. */
  emptyLabel?: string
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: BrushChartLabels
}

type Point = { t: number; value: number }
type Smooth = Point & { low: number; high: number }
type Drag = {
  mode: 'start' | 'end' | 'pan' | 'new'
  pointerX: number
  from: [number, number]
  anchor: number
  moved: boolean
}

const DAY = 86_400_000
const TOP = 28
const GRIP = 14
const time = (date: Date | number) =>
  typeof date === 'number' ? date : date.getTime()

/** Calendar ticks that fit the width: days, weeks, months, quarters or years, each on a real boundary (local time). */
function timeTicks(start: number, end: number, width: number, locale: string) {
  const room = Math.max(2, Math.floor(width / 76))
  const span = end - start
  const dayTick = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  })
  for (const days of [1, 2, 7, 14]) {
    if (span / (days * DAY) > room) {
      continue
    }
    const ticks: { t: number; label: string }[] = []
    const day = new Date(start)
    day.setHours(0, 0, 0, 0)
    if (day.getTime() < start) {
      day.setDate(day.getDate() + 1)
    }
    if (days >= 7) {
      while (day.getDay() !== 1) {
        day.setDate(day.getDate() + 1)
      }
    }
    for (; day.getTime() <= end; day.setDate(day.getDate() + days)) {
      ticks.push({ t: day.getTime(), label: dayTick.format(day) })
    }
    return ticks
  }
  const monthTick = new Intl.DateTimeFormat(locale, { month: 'short' })
  const yearTick = new Intl.DateTimeFormat(locale, { year: 'numeric' })
  for (const months of [1, 2, 3, 6, 12]) {
    if (span / (months * 30.44 * DAY) > room) {
      continue
    }
    const ticks: { t: number; label: string }[] = []
    const first = new Date(start)
    let month =
      first.getMonth() + (first.getDate() > 1 || first.getHours() > 0 ? 1 : 0)
    for (;;) {
      const at = new Date(first.getFullYear(), month, 1)
      if (at.getTime() > end) {
        break
      }
      if (at.getMonth() % months === 0) {
        ticks.push({
          t: at.getTime(),
          label: (at.getMonth() === 0 ? yearTick : monthTick).format(at),
        })
      }
      month += 1
    }
    return ticks
  }
  const ticks: { t: number; label: string }[] = []
  for (
    let year = new Date(start).getFullYear() + 1;
    new Date(year, 0, 1).getTime() <= end;
    year++
  ) {
    ticks.push({ t: new Date(year, 0, 1).getTime(), label: String(year) })
  }
  return ticks
}

/** The first index at or after t. */
function lowerBound(points: Point[], t: number) {
  let low = 0
  let high = points.length
  while (low < high) {
    const middle = (low + high) >> 1
    if (points[middle].t < t) {
      low = middle + 1
    } else {
      high = middle
    }
  }
  return low
}

/** A line through the points in view. Past two points a pixel, each pixel column keeps its low and its high, so spikes survive. */
function linePath(
  points: Point[],
  from: number,
  to: number,
  x: (t: number) => number,
  y: (value: number) => number,
  width: number,
) {
  const slice = points.slice(Math.max(0, from), Math.min(points.length, to))
  if (!slice.length) {
    return ''
  }
  const parts: string[] = []
  const push = (point: Point) =>
    parts.push(`${x(point.t).toFixed(1)},${y(point.value).toFixed(1)}`)
  if (slice.length <= width * 2) {
    slice.forEach(push)
  } else {
    let column = -1
    let low: Point | null = null
    let high: Point | null = null
    const flush = () => {
      if (low && high) {
        ;(low.t < high.t ? [low, high] : [high, low]).forEach(push)
      }
    }
    for (const point of slice) {
      const at = Math.floor(x(point.t))
      if (at !== column) {
        flush()
        column = at
        low = high = point
        continue
      }
      if (low && point.value < low.value) {
        low = point
      }
      if (high && point.value > high.value) {
        high = point
      }
    }
    flush()
  }
  return `M${parts.join('L')}`
}

/** Each point with its centred seven point average and that week's low to high band, the band smoothed once more. */
function smoothOf(points: Point[]): Smooth[] {
  const around = <T,>(index: number, read: (at: number) => T) => {
    const out: T[] = []
    for (
      let at = Math.max(0, index - 3);
      at <= Math.min(points.length - 1, index + 3);
      at++
    ) {
      out.push(read(at))
    }
    return out
  }
  const raw = points.map((_, index) => {
    const values = around(index, (at) => points[at].value)
    return {
      value: values.reduce((sum, value) => sum + value, 0) / values.length,
      low: Math.min(...values),
      high: Math.max(...values),
    }
  })
  return points.map((point, index) => {
    const near = around(index, (at) => raw[at])
    return {
      t: point.t,
      value: raw[index].value,
      low: near.reduce((sum, item) => sum + item.low, 0) / near.length,
      high: near.reduce((sum, item) => sum + item.high, 0) / near.length,
    }
  })
}

const handleClass =
  'absolute top-1/2 grid h-11 w-7 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize touch-none place-items-center rounded-md outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus'

/**
 * A brush chart, after Arc UI (https://uiarc.dev, MIT): a long daily
 * series on top, and below it the whole history in a strip whose window
 * chooses the stretch shown above.
 *
 * **Use it for** a long, dense history read both whole and up close (the
 * requests received each day over two years, the visits booked each day).
 * **Not for** a few points (a line chart in `Chart`), a mix of parts
 * (`Streamgraph`), or a quick trend in a card (`Sparkline`).
 *
 * **Where**: a dashboard or a report, full width.
 *
 * **States**: the whole series, a window (dragged, resized, drawn anew,
 * stepped with the keys, reset by a double click), a reading with its
 * crosshair and tooltip, an event pointed at, empty.
 *
 * **Compose**: in a `Card`; `range` + `onRangeChange` to drive the window
 * from presets (`ToggleGroup` « 30 jours », « 1 an »…).
 *
 * **Key props**: `data` (date, value), `label`, `unit`, `formatValue`,
 * `formatTick`, `formatDate`, `annotations`, `range` + `onRangeChange`,
 * `defaultRange`, `minSpan`, `color`, `height`, `overviewHeight`,
 * `labels` to change its words.
 *
 * **Motion**: the line draws in from the left the first time it is seen;
 * the value axis springs to the tallest point in view; a window set from
 * outside, recentred or reset glides there; zoomed out, a seven-day
 * average and its band fade in for the raw line. With reduced motion the
 * final state is drawn at once.
 *
 * **Accessibility**: a named figure; the plot takes the focus and the
 * arrows read each day in view, said in a live region; the window and its
 * two edges are sliders (arrows, Shift for larger steps, Page keys, Home,
 * End, + and − to zoom, 0 or Escape to reset); a hidden table gives every
 * value in the window.
 *
 * @summary A long time series with an overview strip to choose the stretch.
 */
export function BrushChart({
  data,
  label,
  unit = '',
  formatValue,
  formatTick,
  formatDate,
  annotations = [],
  range,
  defaultRange,
  onRangeChange,
  minSpan = 7 * DAY,
  height = 240,
  overviewHeight = 52,
  color = 'chart-1',
  emptyLabel,
  className,
  labels,
}: BrushChartProps) {
  const t = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const uid = `brush${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const figure = useRef<HTMLElement>(null)
  const inView = useInView(figure, { once: true, amount: 0.3 })
  const [plot, plotRef] = useElementSize<HTMLDivElement>()
  const [strip, stripRef] = useElementSize<HTMLDivElement>()
  const width = plot?.width ?? 0
  const stripWidth = strip?.width ?? 0

  const number = new Intl.NumberFormat(t.intlLocale, {
    maximumFractionDigits: 1,
  })
  const compact = new Intl.NumberFormat(t.intlLocale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  })
  const fullDate = new Intl.DateTimeFormat(t.intlLocale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const shortDate = new Intl.DateTimeFormat(t.intlLocale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const valueText = (value: number) =>
    formatValue ? formatValue(value) : number.format(value)
  const tickText = (value: number) =>
    formatTick ? formatTick(value) : compact.format(value)
  const dateText = (at: number) =>
    formatDate ? formatDate(new Date(at)) : fullDate.format(at)

  const points = useMemo(
    () => data.map((item) => ({ t: time(item.date), value: item.value })),
    [data],
  )
  // Zoomed out, a centred seven-day average and its low to high band take
  // the raw line's place, so weekly noise reads as texture.
  const smooth = useMemo(() => smoothOf(points), [points])
  const events = useMemo(
    () =>
      annotations
        .map((item) => ({ ...item, t: time(item.date) }))
        .sort((a, b) => a.t - b.t),
    [annotations],
  )
  const empty = points.length < 2
  const first = points[0]?.t ?? 0
  const lastT = points[points.length - 1]?.t ?? 1
  const whole: [number, number] = [first, lastT]
  const fit = useCallback(
    ([start, end]: [number, number]): [number, number] => {
      const span = clamp(
        end - start,
        Math.min(minSpan, lastT - first),
        lastT - first,
      )
      const from = clamp(start, first, lastT - span)
      return [from, from + span]
    },
    [first, lastT, minSpan],
  )

  // The window follows the finger 1:1 while dragged, and glides on a
  // spring when set from outside, recentred or reset.
  const [view, setView] = useState<[number, number]>(
    () => range ?? defaultRange ?? whole,
  )
  const viewRef = useRef(view)
  const flight = useRef<{ stop: () => void } | null>(null)
  const place = useCallback((next: [number, number]) => {
    viewRef.current = next
    setView(next)
  }, [])
  const glideTo = useCallback(
    (next: [number, number]) => {
      flight.current?.stop()
      const from = viewRef.current
      if (reduce) {
        place(next)
        return
      }
      flight.current = animate(0, 1, {
        ...chartMorph,
        onUpdate: (step) =>
          place([
            from[0] + (next[0] - from[0]) * step,
            from[1] + (next[1] - from[1]) * step,
          ]),
      })
    },
    [place, reduce],
  )
  const commit = (next: [number, number], glide: boolean) => {
    const target = fit(next)
    if (glide) {
      glideTo(target)
    } else {
      flight.current?.stop()
      place(target)
    }
    onRangeChange?.(target)
  }
  // A new `range` from outside glides the window there (a callback ref:
  // it runs once React has drawn, again for each new range).
  // Read by value, so a new array with the same dates changes nothing.
  const rangeStart = range?.[0]
  const rangeEnd = range?.[1]
  const followRange = useCallback(
    (node: SVGSVGElement | null) => {
      if (
        !node ||
        rangeStart === undefined ||
        rangeEnd === undefined ||
        empty
      ) {
        return
      }
      const target = fit([rangeStart, rangeEnd])
      const now = viewRef.current
      if (Math.abs(target[0] - now[0]) + Math.abs(target[1] - now[1]) > 1000) {
        glideTo(target)
      }
    },
    [rangeStart, rangeEnd, empty, fit, glideTo],
  )

  // Data that no longer covers the window pulls it back inside.
  const [start, end] = empty ? view : fit(view)
  const span = Math.max(1, end - start)
  const from = Math.max(0, lowerBound(points, start) - 1)
  const to = Math.min(points.length, lowerBound(points, end) + 1)
  let peak = 0
  for (let index = from; index < to; index++) {
    peak = Math.max(peak, points[index].value)
  }
  const scale = niceScale(0, peak * 1.04, 4)

  // The value axis springs to the tallest point in view, so zooming into a
  // quiet stretch fills the plot.
  const [top, setTop] = useState(scale.max)
  const topRef = useRef(scale.max)
  const followTop = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || topRef.current === scale.max) {
        return undefined
      }
      if (reduce) {
        topRef.current = scale.max
        setTop(scale.max)
        return undefined
      }
      const controls = animate(topRef.current, scale.max, {
        ...chartMorph,
        onUpdate: (value) => {
          topRef.current = value
          setTop(value)
        },
      })
      return () => controls.stop()
    },
    [scale.max, reduce],
  )

  const x = (at: number) => ((at - start) / span) * width
  const topNow = reduce ? scale.max : top
  const y = (value: number) =>
    TOP + (1 - value / (topNow || 1)) * (height - TOP)
  const line = width && !empty ? linePath(points, from, to, x, y, width) : ''
  const area = line
    ? `${line}L${x(points[to - 1].t).toFixed(1)},${height}L${x(points[from].t).toFixed(1)},${height}Z`
    : ''
  const trend =
    width && !empty ? linePath(smooth, from, to, x, y, width * 4) : ''
  const band = trend
    ? `${linePath(
        smooth.map((point) => ({ t: point.t, value: point.high })),
        from,
        to,
        x,
        y,
        width * 4,
      )}L${linePath(
        smooth.map((point) => ({ t: point.t, value: point.low })),
        from,
        to,
        x,
        y,
        width * 4,
      )
        .slice(1)
        .split('L')
        .reverse()
        .join('L')}Z`
    : ''
  // How much of the raw line shows: all of it past about four pixels a
  // point, none under about three.
  const pxPerPoint = empty
    ? width
    : (width * (lastT - first)) / (points.length - 1) / span
  const detail = clamp((pxPerPoint - 2.75) / 1.5, 0, 1)
  const ticks = scale.max > 0 ? scale.ticks : []
  const xTicks =
    width && !empty ? timeTicks(start, end, width, t.intlLocale) : []

  // The overview: the whole series, drawn once per width.
  const ox = (at: number) => ((at - first) / (lastT - first || 1)) * stripWidth
  const overview = useMemo(() => {
    if (!stripWidth || empty) {
      return { line: '', area: '', marks: [] }
    }
    const max =
      niceScale(
        0,
        smooth.reduce((most, point) => Math.max(most, point.value), 0),
        4,
      ).max || 1
    const scaleX = (at: number) =>
      ((at - first) / (lastT - first || 1)) * stripWidth
    const oy = (value: number) => 4 + (1 - value / max) * (overviewHeight - 4)
    const path = linePath(smooth, 0, smooth.length, scaleX, oy, stripWidth * 4)
    const marks = events.map((event) => {
      const at = clamp(lowerBound(smooth, event.t), 0, smooth.length - 1)
      return { t: event.t, x: scaleX(event.t), y: oy(smooth[at].value) }
    })
    return {
      line: path,
      area: `${path}L${stripWidth},${overviewHeight}L0,${overviewHeight}Z`,
      marks,
    }
  }, [smooth, events, stripWidth, overviewHeight, empty, first, lastT])
  const wx0 = ox(start)
  const wx1 = ox(end)

  // The line draws in from the left once, the first time it is seen.
  const shown = inView || reduce
  const [revealed, setRevealed] = useState(false)

  // The reading: the nearest day in view, explored with the pointer or the arrows.
  const nearest = (clientX: number, box: DOMRect) => {
    const at = start + ((clientX - box.left) / (box.width || 1)) * span
    const after = clamp(lowerBound(points, at), 1, points.length - 1)
    return (
      clamp(
        at - points[after - 1].t < points[after].t - at ? after - 1 : after,
        from,
        to - 1,
      ) - from
    )
  }
  const plotBox = useRef<HTMLDivElement | null>(null)
  const setPlot = useCallback(
    (node: HTMLDivElement | null) => {
      plotBox.current = node
      return plotRef(node)
    },
    [plotRef],
  )
  const scrub = useChartScrub({
    count: empty ? 0 : to - from,
    indexAt: (clientX) =>
      plotBox.current
        ? nearest(clientX, plotBox.current.getBoundingClientRect())
        : 0,
    resetKey: `${from}:${to}`,
  })
  const index = scrub.index === null ? null : from + scrub.index
  const [hoverEvent, setHoverEvent] = useState<number | null>(null)
  const reading = index === null ? null : points[index]
  const cx = reading ? x(reading.t) : 0
  const cy =
    index === null
      ? 0
      : y(
          smooth[index].value +
            (points[index].value - smooth[index].value) * detail,
        )
  const eventAt = reading
    ? (events.find((event) => Math.abs(event.t - reading.t) < DAY / 2) ?? null)
    : null
  const shownEvent = hoverEvent !== null ? events[hoverEvent] : null
  const tipOn = reading !== null || shownEvent !== null
  // The tooltip keeps its last words while it fades out.
  const [held, setHeld] = useState<{
    index: number | null
    event: number | null
  }>({
    index: null,
    event: null,
  })
  if (tipOn && (held.index !== index || held.event !== hoverEvent)) {
    setHeld({ index, event: hoverEvent })
  }
  const heldEvent = held.event !== null ? events[held.event] : null
  const heldPoint =
    held.index !== null && held.index < points.length
      ? points[held.index]
      : null
  const previous =
    heldPoint && held.index !== null && held.index >= 7
      ? points[held.index - 7]
      : null
  const change =
    heldPoint && previous && previous.value
      ? (heldPoint.value - previous.value) / previous.value
      : null
  const heldEventAt = heldPoint
    ? (events.find((event) => Math.abs(event.t - heldPoint.t) < DAY / 2) ??
      null)
    : null
  const anchor = shownEvent
    ? { x: x(shownEvent.t), y: TOP }
    : reading
      ? { x: cx, y: cy }
      : null

  // The overview's gestures: an edge resizes, the window pans, the empty
  // track draws a new window. A tap recentres; a double tap resets.
  const drag = useRef<Drag | null>(null)
  const toTime = (clientX: number, box: DOMRect) =>
    box.width
      ? first + clamp((clientX - box.left) / box.width, 0, 1) * (lastT - first)
      : first
  const onStripDown = (event: PointerEvent<HTMLDivElement>) => {
    if (empty || event.button > 0) {
      return
    }
    const box = event.currentTarget.getBoundingClientRect()
    const px = event.clientX - box.left
    const mode: Drag['mode'] =
      Math.abs(px - wx0) <= GRIP && px <= (wx0 + wx1) / 2
        ? 'start'
        : Math.abs(px - wx1) <= GRIP
          ? 'end'
          : px > wx0 && px < wx1
            ? 'pan'
            : 'new'
    drag.current = {
      mode,
      pointerX: event.clientX,
      from: viewRef.current,
      anchor: toTime(event.clientX, box),
      moved: false,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
    flight.current?.stop()
  }
  const onStripMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current
    if (!current) {
      return
    }
    if (!current.moved && Math.abs(event.clientX - current.pointerX) < 3) {
      return
    }
    current.moved = true
    const at = toTime(
      event.clientX,
      event.currentTarget.getBoundingClientRect(),
    )
    const shift = at - current.anchor
    const [s, e] = current.from
    const least = Math.min(minSpan, lastT - first)
    const next: [number, number] =
      current.mode === 'pan'
        ? [s + shift, e + shift]
        : current.mode === 'start'
          ? [clamp(at, first, e - least), e]
          : current.mode === 'end'
            ? [s, clamp(at, s + least, lastT)]
            : [Math.min(current.anchor, at), Math.max(current.anchor, at)]
    if (current.mode === 'new' && next[1] - next[0] < least) {
      if (at >= current.anchor) {
        next[1] = next[0] + least
      } else {
        next[0] = next[1] - least
      }
    }
    commit(next, false)
  }
  const onStripUp = () => {
    const current = drag.current
    drag.current = null
    if (!current || current.moved || current.mode !== 'new') {
      return
    }
    const half = (viewRef.current[1] - viewRef.current[0]) / 2
    commit([current.anchor - half, current.anchor + half], true)
  }
  const reset = () => commit(whole, true)

  const stepSize = Math.max(
    DAY,
    (lastT - first) / Math.max(1, points.length - 1),
  )
  const onHandleKey = (
    event: KeyboardEvent<HTMLDivElement>,
    edge: 'start' | 'end' | 'window',
  ) => {
    const [s, e] = viewRef.current
    const size = e - s
    const least = Math.min(minSpan, lastT - first)
    const big = event.shiftKey || event.key.startsWith('Page')
    const delta = (
      {
        ArrowLeft: -1,
        ArrowDown: -1,
        PageDown: -1,
        ArrowRight: 1,
        ArrowUp: 1,
        PageUp: 1,
      } as Record<string, number>
    )[event.key]
    let next: [number, number] | null = null
    if (event.key === 'Escape' || event.key === '0') {
      next = whole
    } else if (edge === 'window' && (event.key === '+' || event.key === '=')) {
      next = [s + size / 4, e - size / 4]
    } else if (edge === 'window' && (event.key === '-' || event.key === '_')) {
      next = [s - size / 2, e + size / 2]
    } else if (event.key === 'Home') {
      next =
        edge === 'end'
          ? [s, s + least]
          : [first, edge === 'window' ? first + size : e]
    } else if (event.key === 'End') {
      next =
        edge === 'start'
          ? [e - least, e]
          : [edge === 'window' ? lastT - size : s, lastT]
    } else if (delta) {
      const move =
        delta *
        (edge === 'window'
          ? size * (big ? 0.5 : 0.1)
          : stepSize * (big ? 10 : 1))
      next =
        edge === 'window'
          ? [s + move, e + move]
          : edge === 'start'
            ? [Math.min(s + move, e - minSpan), e]
            : [s, Math.max(e + move, s + minSpan)]
    }
    if (!next) {
      return
    }
    event.preventDefault()
    commit(next, false)
  }

  const format = (value: number) =>
    `${valueText(value)}${unit ? ` ${unit}` : ''}`
  const percent = new Intl.NumberFormat(t.intlLocale, {
    style: 'percent',
    maximumFractionDigits: 1,
    signDisplay: 'exceptZero',
  })
  const windowText = t.chartRange(
    shortDate.format(start),
    shortDate.format(end),
  )
  const inWindow = events.filter((event) => event.t >= start && event.t <= end)
  // Event names are placed left to right, skipped when they would touch the one before.
  const labelled = new Map<number, boolean>()
  let edge = -Infinity
  inWindow.forEach((event, at) => {
    const px = x(event.t)
    const room = event.label.length * 6.2 + 4
    const next = at + 1 < inWindow.length ? x(inWindow[at + 1].t) - 10 : width
    if (px + 14 >= edge && px + 14 + room <= next) {
      labelled.set(event.t, false)
      edge = px + 14 + room + 8
      return
    }
    if (
      px - 14 - room >= Math.max(0, edge) &&
      (at === 0 || px - 14 - room >= x(inWindow[at - 1].t) + 12)
    ) {
      labelled.set(event.t, true)
      edge = px + 12
      return
    }
    edge = Math.max(edge, px + 12)
  })
  const announce = reading
    ? `${dateText(reading.t)}, ${format(reading.value)}${eventAt ? `. ${eventAt.label}` : ''}`
    : ''
  const summary = empty
    ? `${label}. ${emptyLabel ?? t.chartNoData}.`
    : `${t.chartSpan(label, shortDate.format(first), shortDate.format(lastT))} ${t.brushShowing(windowText)}.`
  const tableFrom = lowerBound(points, start)
  const tableTo = lowerBound(points, end + 1)

  return (
    <MotionScope>
      <figure
        ref={figure}
        aria-label={label}
        style={
          {
            '--brush': chartColor(color),
            '--brush-event': chartColor('chart-2'),
          } as CSSProperties
        }
        className={cn('m-0 grid min-w-0 text-fg', className)}
      >
        <div
          ref={followTop}
          data-active={tipOn ? '' : undefined}
          className="group/brush relative grid min-w-0 grid-cols-[minmax(0,1fr)_2.75rem] grid-rows-[auto_1.75rem_auto]"
        >
          <div
            ref={setPlot}
            role="slider"
            tabIndex={empty ? -1 : 0}
            aria-roledescription={t.brushRole}
            aria-label={`${label}, ${windowText}. ${t.brushKeys}`}
            aria-valuemin={0}
            aria-valuemax={Math.max(0, to - from - 1)}
            aria-valuenow={scrub.index ?? Math.max(0, to - from - 1)}
            aria-valuetext={announce || windowText}
            style={{ height }}
            className="relative col-start-1 row-start-1 min-w-0 cursor-crosshair touch-pan-y rounded-md outline-none select-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus"
            {...scrub.handlers}
            onDoubleClick={reset}
          >
            <svg
              ref={followRange}
              width="100%"
              height={height}
              aria-hidden="true"
              focusable="false"
              className="block overflow-visible"
            >
              <defs>
                <clipPath id={`${uid}-plot`}>
                  <m.rect
                    x={0}
                    y={-8}
                    height={height + 16}
                    initial={reduce ? false : { width: 0 }}
                    animate={{ width: shown ? width : 0 }}
                    transition={
                      reduce || revealed ? { duration: 0 } : chartReveal
                    }
                    onAnimationComplete={() => {
                      if (shown && width) {
                        setRevealed(true)
                      }
                    }}
                  />
                </clipPath>
              </defs>
              {ticks.slice(1).map((value) => (
                <line
                  key={value}
                  x1={0}
                  x2="100%"
                  y1={Math.round(y(value)) + 0.5}
                  y2={Math.round(y(value)) + 0.5}
                  className="stroke-line [shape-rendering:crispEdges]"
                />
              ))}
              <line
                x1={0}
                x2="100%"
                y1={height - 0.5}
                y2={height - 0.5}
                className="stroke-line-strong [shape-rendering:crispEdges]"
              />
              {inWindow.map((event) => (
                <line
                  key={event.t}
                  x1={Math.round(x(event.t)) + 0.5}
                  x2={Math.round(x(event.t)) + 0.5}
                  y1={TOP - 10}
                  y2={height}
                  data-active={
                    shownEvent?.t === event.t || eventAt?.t === event.t
                      ? ''
                      : undefined
                  }
                  className="stroke-line-strong transition-[stroke] duration-150 [shape-rendering:crispEdges] data-active:stroke-(--brush-event) motion-reduce:transition-none"
                />
              ))}
              <g clipPath={`url(#${uid}-plot)`}>
                <path
                  d={band}
                  style={{ opacity: 1 - detail }}
                  className="fill-[color-mix(in_oklab,var(--brush)_14%,transparent)]"
                />
                <path
                  d={area}
                  style={{ opacity: detail }}
                  className="fill-[color-mix(in_oklab,var(--brush)_10%,transparent)]"
                />
                <path
                  d={trend}
                  style={{ opacity: 1 - detail }}
                  className="fill-none stroke-(--brush) [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.75]"
                />
                <path
                  d={line}
                  style={{ opacity: detail }}
                  className="fill-none stroke-(--brush) [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.75]"
                />
              </g>
              <line
                x1={Math.round(cx) + 0.5}
                x2={Math.round(cx) + 0.5}
                y1={TOP - 10}
                y2={height}
                className="pointer-events-none stroke-fg opacity-0 transition-opacity duration-100 [shape-rendering:crispEdges] [stroke-opacity:0.45] group-data-active/brush:opacity-100 motion-reduce:transition-none"
              />
              <circle
                cx={cx}
                cy={cy}
                r={4}
                className={cn(
                  'pointer-events-none fill-(--brush) stroke-surface stroke-2 opacity-0 transition-opacity duration-100 motion-reduce:transition-none',
                  reading && 'opacity-100',
                )}
              />
            </svg>
            {inWindow.map((event) => {
              const px = x(event.t)
              const at = events.indexOf(event)
              return (
                <span
                  key={event.t}
                  aria-hidden="true"
                  style={{ left: px }}
                  data-labelled={labelled.has(event.t) ? '' : undefined}
                  data-flip={labelled.get(event.t) ? '' : undefined}
                  data-active={
                    shownEvent?.t === event.t || eventAt?.t === event.t
                      ? ''
                      : undefined
                  }
                  className="group/event absolute top-1.5 -ml-3 flex min-h-6 items-center gap-1.5 pr-1.5 text-xs/none whitespace-nowrap text-fg-muted data-flip:ml-0 data-flip:translate-x-[calc(-100%+0.75rem)] data-flip:flex-row-reverse data-flip:pr-0 data-flip:pl-1.5"
                  onPointerEnter={() => setHoverEvent(at)}
                  onPointerLeave={() => setHoverEvent(null)}
                  onPointerDown={(pointer) => pointer.stopPropagation()}
                >
                  <span className="grid size-6 flex-none place-items-center before:size-1.75 before:rounded-full before:bg-(--brush-event) before:shadow-[0_0_0_2px_var(--surface)] before:transition-[scale] before:duration-150 before:content-[''] group-data-active/event:before:scale-130 motion-reduce:before:transition-none" />
                  <span className="opacity-0 transition-[opacity,color] duration-150 group-data-active/event:text-fg group-data-labelled/event:opacity-100 motion-reduce:transition-none">
                    {event.label}
                  </span>
                </span>
              )
            })}
            {!empty && (
              <ChartTooltip
                anchor={anchor}
                bounds={{ width, height }}
                placement={{ x: 'after', y: 'above' }}
                className="min-w-33"
              >
                {heldEvent ? (
                  <>
                    <p className="m-0 mb-0.5 text-xs whitespace-nowrap text-fg-muted tabular-nums">
                      {dateText(heldEvent.t)}
                    </p>
                    <p className="m-0 text-base font-medium">
                      {heldEvent.label}
                    </p>
                    {heldEvent.description && (
                      <p className="m-0 text-xs text-fg-subtle">
                        {heldEvent.description}
                      </p>
                    )}
                  </>
                ) : heldPoint && held.index !== null ? (
                  <>
                    <p className="m-0 mb-0.5 text-xs whitespace-nowrap text-fg-muted tabular-nums">
                      {dateText(heldPoint.t)}
                    </p>
                    <p className="m-0 text-base font-medium tabular-nums">
                      {format(heldPoint.value)}
                    </p>
                    {detail < 1 && (
                      <p className="m-0 text-xs text-fg-subtle tabular-nums">
                        {t.brushAverage(
                          valueText(Math.round(smooth[held.index].value)),
                        )}
                      </p>
                    )}
                    {change !== null && (
                      <p className="m-0 text-xs text-fg-subtle tabular-nums">
                        {t.brushVsWeek(percent.format(change))}
                      </p>
                    )}
                    {heldEventAt && (
                      <p className="m-0 mt-1 flex items-center gap-1.5 text-xs">
                        <span className="size-1.75 flex-none rounded-full bg-(--brush-event)" />
                        {heldEventAt.label}
                      </p>
                    )}
                  </>
                ) : null}
              </ChartTooltip>
            )}
            {empty && (
              <p className="pointer-events-none absolute inset-0 m-0 grid place-items-center text-sm text-fg-subtle">
                {emptyLabel ?? t.chartNoData}
              </p>
            )}
          </div>
          <div
            aria-hidden="true"
            className="relative col-start-2 row-start-1 min-w-0"
          >
            {ticks.map((value) => (
              <span
                key={value}
                style={{ top: y(value) }}
                className="pointer-events-none absolute left-2.5 -translate-y-1/2 text-xs/none whitespace-nowrap text-fg-subtle tabular-nums"
              >
                {tickText(value)}
              </span>
            ))}
          </div>
          <div
            aria-hidden="true"
            className="relative col-start-1 row-start-2 min-w-0"
          >
            {xTicks.map((tick) => {
              const px = x(tick.t)
              return (
                <span
                  key={tick.t}
                  style={{
                    left: px,
                    translate: `${px < 24 ? 0 : px > width - 24 ? -100 : -50}% 0`,
                  }}
                  className="absolute top-2.25 text-xs/none whitespace-nowrap text-fg-subtle tabular-nums"
                >
                  {tick.label}
                </span>
              )
            })}
          </div>
          <div
            ref={stripRef}
            style={{ height: overviewHeight }}
            className="relative col-start-1 row-start-3 mt-2 min-w-0 cursor-crosshair touch-pan-y rounded-[10px] bg-[color-mix(in_oklab,var(--fg)_2.5%,transparent)] select-none"
            onPointerDown={onStripDown}
            onPointerMove={onStripMove}
            onPointerUp={onStripUp}
            onPointerCancel={() => {
              drag.current = null
            }}
            onDoubleClick={reset}
          >
            <svg
              width="100%"
              height={overviewHeight}
              aria-hidden="true"
              focusable="false"
              className="block overflow-visible [clip-path:inset(0_round_10px)]"
            >
              <defs>
                <clipPath id={`${uid}-window`}>
                  <rect
                    x={wx0}
                    y={-2}
                    width={Math.max(0, wx1 - wx0)}
                    height={overviewHeight + 4}
                  />
                </clipPath>
              </defs>
              <path
                d={overview.area}
                className="fill-[color-mix(in_oklab,var(--fg)_4%,transparent)]"
              />
              <path
                d={overview.line}
                className="fill-none stroke-[color-mix(in_oklab,var(--fg)_28%,var(--surface))] stroke-1 [stroke-linejoin:round]"
              />
              <g clipPath={`url(#${uid}-window)`}>
                <path
                  d={overview.area}
                  className="fill-[color-mix(in_oklab,var(--brush)_12%,transparent)]"
                />
                <path
                  d={overview.line}
                  className="fill-none stroke-(--brush) stroke-1 [stroke-linejoin:round]"
                />
              </g>
              {overview.marks.map((mark) => (
                <circle
                  key={mark.t}
                  cx={mark.x}
                  cy={mark.y}
                  r={2.5}
                  className="fill-(--brush-event) stroke-surface [stroke-width:1.5]"
                />
              ))}
            </svg>
            {!empty && (
              <>
                <div
                  style={{ left: 0, width: Math.max(0, wx0) }}
                  className="pointer-events-none absolute inset-y-0 rounded-l-[10px] bg-[color-mix(in_oklab,var(--surface)_45%,transparent)]"
                />
                <div
                  style={{ left: wx1, right: 0 }}
                  className="pointer-events-none absolute inset-y-0 rounded-r-[10px] bg-[color-mix(in_oklab,var(--surface)_45%,transparent)]"
                />
                <div
                  role="slider"
                  tabIndex={0}
                  aria-label={t.brushWindow(label)}
                  aria-roledescription={t.brushWindowRole}
                  aria-valuemin={first}
                  aria-valuemax={lastT}
                  aria-valuenow={Math.round(start)}
                  aria-valuetext={windowText}
                  style={{ left: wx0, width: Math.max(0, wx1 - wx0) }}
                  className="absolute inset-y-0 cursor-grab rounded-[10px] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--brush)_45%,transparent)] outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus active:cursor-grabbing"
                  onKeyDown={(event) => onHandleKey(event, 'window')}
                />
                <div
                  role="slider"
                  tabIndex={0}
                  aria-label={t.brushWindowStart}
                  aria-valuemin={first}
                  aria-valuemax={Math.round(end)}
                  aria-valuenow={Math.round(start)}
                  aria-valuetext={shortDate.format(start)}
                  style={{ left: wx0 }}
                  className={cn(handleClass, 'group/grip')}
                  onKeyDown={(event) => onHandleKey(event, 'start')}
                >
                  <span className="h-5.5 w-1.5 rounded-[3px] bg-floating shadow-[0_0_0_1px_color-mix(in_oklab,var(--fg)_26%,transparent),var(--shadow-xs)] transition-[scale] duration-100 group-hover/grip:scale-y-112 group-active/grip:scale-y-112 motion-reduce:transition-none" />
                </div>
                <div
                  role="slider"
                  tabIndex={0}
                  aria-label={t.brushWindowEnd}
                  aria-valuemin={Math.round(start)}
                  aria-valuemax={lastT}
                  aria-valuenow={Math.round(end)}
                  aria-valuetext={shortDate.format(end)}
                  style={{ left: wx1 }}
                  className={cn(handleClass, 'group/grip')}
                  onKeyDown={(event) => onHandleKey(event, 'end')}
                >
                  <span className="h-5.5 w-1.5 rounded-[3px] bg-floating shadow-[0_0_0_1px_color-mix(in_oklab,var(--fg)_26%,transparent),var(--shadow-xs)] transition-[scale] duration-100 group-hover/grip:scale-y-112 group-active/grip:scale-y-112 motion-reduce:transition-none" />
                </div>
              </>
            )}
          </div>
        </div>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {announce}
        </p>
        <p className="sr-only">{summary}</p>
        {!empty && (
          <ChartDataTable
            caption={`${label}, ${windowText}`}
            head={[t.brushDate, label, t.brushEvent]}
            rows={points.slice(tableFrom, tableTo).map((point) => {
              const event = events.find(
                (item) => Math.abs(item.t - point.t) < DAY / 2,
              )
              return {
                key: String(point.t),
                cells: [
                  shortDate.format(point.t),
                  format(point.value),
                  event
                    ? `${event.label}${event.description ? `. ${event.description}` : ''}`
                    : '',
                ],
              }
            })}
          />
        )}
      </figure>
    </MotionScope>
  )
}
export type { BrushChartLabels }
