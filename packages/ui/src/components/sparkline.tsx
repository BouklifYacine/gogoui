import { useCallback, useId, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  animate,
  m,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { chartColor, chartTextColor } from '../internal/chart-color.ts'
import type { ChartColor } from '../internal/chart-color.ts'
import { ChartDataTable } from '../internal/chart-data-table.tsx'
import { blendCurves, curveThrough, valueAt } from '../internal/chart-scale.ts'
import type { CurvePoint } from '../internal/chart-scale.ts'
import { useChartScrub } from '../internal/chart-scrub.ts'
import { ChartSwap } from '../internal/chart-swap.tsx'
import { duration, ease, spring } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { cn } from '../lib/cn.ts'
import { RollingNumber } from './rolling-number.tsx'

// Adapted from Arc UI's sparkline (https://uiarc.dev, MIT licence, Elia
// Kuratli): GoGoUI's colours and words, numbers through Intl in the
// provider's language, a fixed height and the full width of its parent.

type SparklineProps = {
  /** The values, oldest first. */
  data: readonly number[]
  /** What is measured: « Demandes reçues ». */
  label: string
  /** The headline at rest, usually the latest figure. Absent: no headline. */
  value?: number
  /** Words beside the headline at rest: « +12 % vs octobre ». */
  change?: string
  /** One label per point (« mars 2026 »), shown while it is explored. */
  labels?: readonly string[]
  /** How the numbers are written, through Intl: `{ style: 'currency', currency: 'EUR' }`. */
  format?: Intl.NumberFormatOptions
  /** The line's colour; the change's words take its readable shade. */
  color?: ChartColor
  /** The plot's height in px; its width follows the parent. */
  height?: number
  /** A faint wash of the colour under the line. */
  area?: boolean
  /** Explore the points with a pointer, a finger or the arrows. */
  interactive?: boolean
  className?: string
}

/** Room above the highest point and below the lowest, and half the line's width. */
const INSET = 5
const CAP = 1.25
/** The first draw: one stroke, slow at both ends like a pen. */
const drawIn = { duration: duration.considered * 1.75, ease: ease.inOut }
const quick = { duration: duration.fast, ease: ease.standard }

/** Where the pen is along the line once `progress` of its length is drawn, so the wash follows its tip. */
function tipAt(points: CurvePoint[], progress: number) {
  const steps = points
    .slice(1)
    .map(([x, y], index) =>
      Math.hypot(x - points[index]![0], y - points[index]![1]),
    )
  let left = progress * steps.reduce((sum, step) => sum + step, 0)
  for (let index = 0; index < steps.length; index++) {
    const step = steps[index]!
    const from = points[index]![0]
    if (left <= step) {
      return from + (points[index + 1]![0] - from) * (step ? left / step : 1)
    }
    left -= step
  }
  return points[points.length - 1]?.[0] ?? 0
}

/**
 * A small line of a figure over time, with its headline, after Arc UI's
 * sparkline (https://uiarc.dev, MIT).
 *
 * **Use it for** the trend beside a key figure: requests per week,
 * revenue per month, in a card or a table row. **Not for** reading
 * exact values against an axis (`LineChart`, `BarChart`).
 *
 * **Where**: in a dashboard card, under a `StatCard`'s figure, in a row.
 *
 * **States**: at rest (headline and change), explored (the point's value
 * and label, the later stretch dimmed), with or without the wash, still
 * (`interactive={false}`).
 *
 * **Compose**: in a `Card` with a `Badge`, or several in a grid.
 *
 * **Key props**: `data`, `label`, `value`, `change`, `labels`, `format`,
 * `color`, `height`, `area`, `interactive`.
 *
 * **Motion**: the line draws left to right once it is seen, the wash
 * follows the pen, then the end dot lands; new data morphs the line; the
 * cursor springs from point to point and the headline's digits roll.
 * With reduced motion the finished line shows at once.
 *
 * **Accessibility**: the figure is named by its label, figure and
 * change, and its points are in a hidden table. The plot is a slider:
 * arrows, Page up / Page down, Home / End and Escape read each point.
 *
 * @summary A small line of a figure over time, explored point by point.
 */
function Sparkline({
  data,
  label,
  value,
  change,
  labels,
  format,
  color = 'chart-1',
  height = 52,
  area = true,
  interactive = true,
  className,
}: SparklineProps) {
  const messages = useGoGoUIMessages()
  const reduce = useReduceMotion()
  const points = data.length > 1 ? data : [data[0] ?? 0, data[0] ?? 0]
  const last = points.length - 1
  const key = points.join(',')
  // The line in unit space: x and the value both from 0 to 1.
  const target = useMemo(() => {
    const values = key.split(',').map(Number)
    const low = Math.min(...values)
    const span = Math.max(...values) - low
    return curveThrough(
      values.map((item) => (span ? (item - low) / span : 0.5)),
    )
  }, [key])
  const uid = `spark${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const number = new Intl.NumberFormat(messages.intlLocale, format)

  const figure = useRef<HTMLElement>(null)
  const plot = useRef<HTMLDivElement>(null)
  const inView = useInView(figure, { once: true, amount: 0.5 })
  const [width, setWidth] = useState(0)
  const [landed, setLanded] = useState(false)
  const { index, handlers } = useChartScrub({
    count: points.length,
    resetKey: key,
    indexAt: (clientX) => {
      const box = plot.current?.getBoundingClientRect()
      return box?.width
        ? Math.round(((clientX - box.left) / box.width) * last)
        : last
    },
  })
  const scrubbing = index !== null
  // Which way the exploring moved, so the point's words come from that side.
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

  // Every drawn string, written per frame by `paint`, never by React.
  const shape = useRef(target)
  const box = useRef({ w: 0, h: height })
  const drawn = useMotionValue(0)
  const cursor = useMotionValue(1)
  const line = useMotionValue('')
  const trail = useMotionValue('')
  const wash = useMotionValue('')
  const dot = useMotionValue('')
  const cursorX = useMotionValue(0)
  const lit = useMotionValue(0)
  const dim = useMotionValue(0)
  const reveal = useMotionValue(0)
  const lineOpacity = useTransform(drawn, (progress) =>
    progress > 0.001 ? 1 : 0,
  )

  // One writer for every drawn attribute: the morph, the cursor, the pen
  // and the measured size all repaint through here.
  const paint = useCallback(() => {
    const { w, h } = box.current
    const toY = (y: number) => INSET + (1 - y) * (h - INSET * 2)
    const placed = shape.current.map(([x, y]): CurvePoint => [x * w, toY(y)])
    const pairs = placed.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
    const at = cursor.get()
    const cx = at * w
    const cy = toY(valueAt(shape.current, at))
    const progress = drawn.get()
    line.set(pairs.join(' '))
    trail.set(`M${pairs.join('L')}`)
    wash.set(`M${pairs.join('L')}L${w},${h}L0,${h}Z`)
    dot.set(`${cx},${cy} ${cx},${cy}`)
    cursorX.set(cx)
    lit.set(cx + CAP + 16)
    dim.set(cx + CAP)
    reveal.set(progress >= 1 ? w + 32 : tipAt(placed, progress) + 16)
  }, [cursor, cursorX, dim, dot, drawn, line, lit, reveal, trail, wash])
  useMotionValueEvent(cursor, 'change', paint)
  useMotionValueEvent(drawn, 'change', paint)

  // The plot draws in its own px: its width followed, its height given.
  const measure = useCallback(
    (node: HTMLDivElement | null) => {
      plot.current = node
      if (!node || typeof ResizeObserver === 'undefined') {
        return undefined
      }
      const read = () => {
        box.current = { w: node.clientWidth, h: height }
        setWidth(node.clientWidth)
        paint()
      }
      read()
      const observer = new ResizeObserver(read)
      observer.observe(node)
      return () => observer.disconnect()
    },
    [height, paint],
  )

  // The line draws left to right once it is seen, then the end dot lands.
  const drawOnView = useCallback(
    (node: SVGSVGElement | null) => {
      if (!node) {
        return undefined
      }
      if (reduce) {
        drawn.jump(1)
        setLanded(true)
        return undefined
      }
      if (!inView) {
        return undefined
      }
      const controls = animate(drawn, 1, {
        ...drawIn,
        onComplete: () => setLanded(true),
      })
      return () => controls.stop()
    },
    [drawn, inView, reduce],
  )

  // New data morphs the line from the one on screen.
  const morph = useCallback(
    (node: SVGGElement | null) => {
      if (!node) {
        return undefined
      }
      const from = shape.current
      if (from === target || reduce) {
        shape.current = target
        paint()
        return undefined
      }
      const blend = blendCurves(from, target)
      const controls = animate(0, 1, {
        ...spring.smooth,
        onUpdate: (progress) => {
          shape.current = blend(progress)
          paint()
        },
        onComplete: () => {
          shape.current = target
          paint()
        },
      })
      return () => controls.stop()
    },
    [paint, reduce, target],
  )

  // The cursor springs to the explored point and rides the line between
  // points; letting go sends it home to the latest one.
  const follow = useCallback(
    (node: SVGLineElement | null) => {
      if (!node) {
        return undefined
      }
      const to = index === null || last === 0 ? 1 : index / last
      if (reduce) {
        cursor.jump(to)
        return undefined
      }
      const controls = animate(cursor, to, spring.snappy)
      return () => controls.stop()
    },
    [cursor, index, last, reduce],
  )

  const at = index ?? last
  const pointText = number.format(points[at]!)
  const when = labels?.[at]
  const aside =
    index === null
      ? (change ?? '')
      : value === undefined
        ? [pointText, when].filter(Boolean).join(' · ')
        : (when ?? messages.chartPointOf(index + 1, points.length))
  const summary = messages.chartReading(
    label,
    `${number.format(value ?? points[last]!)}${change ? `, ${change}` : ''}`,
  )
  const still = reduce ? { duration: 0 } : quick

  return (
    <MotionScope>
      <figure
        ref={figure}
        data-slot="sparkline"
        aria-label={summary}
        style={{ '--spark': chartColor(color) } as CSSProperties}
        className={cn('m-0 grid min-w-0 gap-3 text-fg', className)}
      >
        <figcaption
          aria-hidden="true"
          className="flex min-w-0 items-baseline gap-2 text-sm text-fg-muted"
        >
          <span className="min-w-0 truncate">{label}</span>
          {value !== undefined && (
            <strong className="ml-auto text-lg font-medium text-fg tabular-nums">
              <RollingNumber
                value={scrubbing ? points[index]! : value}
                format={format}
              />
            </strong>
          )}
          <small
            className={cn(
              'shrink-0 text-xs font-medium tabular-nums transition-colors duration-200 motion-reduce:transition-none',
              value === undefined && 'ml-auto',
              scrubbing ? 'text-fg-muted' : chartTextColor(color),
            )}
          >
            <ChartSwap
              text={aside}
              direction={scrubbing ? moved.direction : 1}
            />
          </small>
        </figcaption>
        <div
          ref={measure}
          {...(interactive
            ? {
                role: 'slider',
                tabIndex: 0,
                'aria-label': messages.chartExplore(label),
                'aria-valuemin': 1,
                'aria-valuemax': points.length,
                'aria-valuenow': at + 1,
                'aria-valuetext': messages.chartReading(
                  when ??
                    (index === null
                      ? messages.chartLatest
                      : messages.chartPointOf(index + 1, points.length)),
                  pointText,
                ),
                ...handlers,
              }
            : {})}
          className={cn(
            'relative min-w-0 rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus',
            interactive && 'cursor-default touch-pan-y select-none',
          )}
        >
          <svg
            ref={drawOnView}
            viewBox={`0 0 ${width || 1} ${height}`}
            width="100%"
            height={height}
            aria-hidden="true"
            focusable="false"
            className="block overflow-visible"
          >
            <defs>
              <clipPath id={`${uid}-lit`} clipPathUnits="userSpaceOnUse">
                <m.rect x={-16} y={-16} width={lit} height={height + 32} />
              </clipPath>
              <clipPath id={`${uid}-dim`} clipPathUnits="userSpaceOnUse">
                <m.rect
                  x={dim}
                  y={-16}
                  width={width + 32}
                  height={height + 32}
                />
              </clipPath>
              <clipPath id={`${uid}-wash`} clipPathUnits="userSpaceOnUse">
                <m.rect x={-16} y={-16} width={reveal} height={height + 32} />
              </clipPath>
            </defs>
            {area && (
              <m.path
                d={wash}
                clipPath={`url(#${uid}-wash)`}
                className="fill-[color-mix(in_oklab,var(--spark)_9%,transparent)]"
              />
            )}
            {/* The baseline carries the cursor's spring: motion's own elements never re-run a changed ref. */}
            <line
              ref={follow}
              x1={0}
              y1={height - 0.5}
              x2={width}
              y2={height - 0.5}
              strokeWidth={1}
              className="stroke-line"
            />
            <g ref={morph}>
              {/* Exploring dims the stretch after the cursor, as if those points have not happened yet. */}
              <m.path
                d={trail}
                clipPath={`url(#${uid}-dim)`}
                fill="none"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="stroke-line-strong"
                initial={false}
                animate={{ opacity: scrubbing && landed ? 1 : 0 }}
                transition={still}
              />
              <m.polyline
                points={line}
                clipPath={`url(#${uid}-lit)`}
                fill="none"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ pathLength: drawn, opacity: lineOpacity }}
                className="stroke-(--spark) transition-[stroke] duration-200 motion-reduce:transition-none"
              />
            </g>
            <m.line
              x1={cursorX}
              x2={cursorX}
              y1={0}
              y2={height}
              strokeWidth={1}
              className="stroke-line-strong"
              initial={false}
              animate={{ opacity: scrubbing ? 1 : 0 }}
              transition={still}
            />
            {/* A zero-length round-capped stroke is a true circle in the line's colour: it rests on the latest point and becomes the handle. */}
            <m.polyline
              points={dot}
              fill="none"
              strokeLinecap="round"
              className="stroke-(--spark)"
              initial={false}
              animate={{
                opacity: landed ? 1 : 0,
                strokeWidth: landed ? (scrubbing ? 10 : 7) : 0,
              }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { opacity: quick, strokeWidth: spring.snappy }
              }
            />
          </svg>
        </div>
        <ChartDataTable
          caption={label}
          head={[messages.chartPeriod, label]}
          rows={points.map((item, at) => ({
            key: String(at),
            cells: [
              labels?.[at] ?? messages.chartPointOf(at + 1, points.length),
              number.format(item),
            ],
          }))}
        />
      </figure>
    </MotionScope>
  )
}

export { Sparkline }
export type { SparklineProps }
