import { useCallback, useMemo, useRef, useState } from 'react'
import type {
  CSSProperties,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
} from 'react'
import {
  AnimatePresence,
  animate,
  cancelFrame,
  frame,
  m,
  motionValue,
  useInView,
} from 'motion/react'
import type { MotionValue, Transition } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { chartColor } from '../internal/chart-color.ts'
import type { ChartColor } from '../internal/chart-color.ts'
import { ChartCount } from '../internal/chart-count.tsx'
import { ChartDataTable } from '../internal/chart-data-table.tsx'
import { physicalSpring } from '../internal/chart-motion.ts'
import { duration, ease, spring, stagger } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { cn } from '../lib/cn.ts'

// Adapted from Arc UI's donut chart (https://uiarc.dev, MIT licence, Elia
// Kuratli): GoGoUI's colours (--chart-1 … --chart-5, then neutral steps)
// and words, numbers through Intl in the provider's language.

type DonutChartDatum = {
  /** Stable identity: a segment whose key survives new data keeps its place and colour, so the arcs morph. */
  key: string
  label: string
  value: number
  /** By default the palette in the order keys are first seen. */
  color?: ChartColor
}

/** The words DonutChart writes, to change on one DonutChart only. */
type DonutChartLabels = Partial<
  Pick<
    GoGoUIMessages,
    | 'chartShareOfTotal'
    | 'chartToggled'
    | 'chartIncludes'
    | 'chartAndMore'
    | 'chartHiddenItem'
    | 'chartReading'
    | 'chartRingHint'
    | 'chartSegments'
    | 'chartSegment'
    | 'chartValue'
    | 'chartShare'
  >
>

type DonutChartProps = {
  data: readonly DonutChartDatum[]
  /** What the whole is: « Événements par type ». Names the chart. */
  label: string
  /** A word after the values: « événements ». Leave it out for a currency. */
  unit?: string
  /** How the numbers are written, through Intl. */
  format?: Intl.NumberFormatOptions
  /** The centre's word at rest, above the total. */
  totalLabel?: string
  /** The diameter in px; the ring shrinks to fit a narrower parent. */
  size?: number
  /** The ring's thickness in px. */
  thickness?: number
  /** Parts under this share of the whole join « Autres » (when at least two would). */
  groupBelow?: number
  /** The most segments drawn, « Autres » included. */
  maxSegments?: number
  otherLabel?: string
  /** The selected segment's key, controlled. Hover and focus preview others without changing it. */
  activeKey?: string | null
  defaultActiveKey?: string | null
  onActiveChange?: (key: string | null) => void
  /** The hidden segments' keys, controlled: a hidden segment closes and the ring shares out again. */
  hiddenKeys?: readonly string[]
  defaultHiddenKeys?: readonly string[]
  onHiddenKeysChange?: (keys: string[]) => void
  /** What pressing a legend row does: show or hide its segment, or select it. */
  legendAction?: 'toggle' | 'select'
  /** The legend beside the ring, or under it on a narrow card. */
  legend?: boolean
  emptyLabel?: string
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: DonutChartLabels
}

type Slice = {
  key: string
  label: string
  value: number
  color?: ChartColor
  members?: readonly DonutChartDatum[]
}
type Arc = { start: number; end: number }
type Segment = {
  start: MotionValue<number>
  end: MotionValue<number>
  lift: MotionValue<number>
  off: () => void
}

const OTHER = '__other'
const TAU = Math.PI * 2
// Arcs drawing in and settling on new data are chart motion: longer than
// interface springs, never overshooting.
const reveal = physicalSpring(0.72)
const settle = physicalSpring(0.5)
const pop = physicalSpring(spring.snappy.visualDuration, 0.002)
/** Neutral steps after the five palette colours, and the quietest one for « Autres ». */
const NEUTRAL = [56, 42, 32]
const paletteColor = (index: number) =>
  index < 5
    ? `var(--chart-${index + 1})`
    : `color-mix(in oklab, var(--fg) ${NEUTRAL[(index - 5) % NEUTRAL.length]}%, var(--surface))`
const OTHER_COLOR = 'color-mix(in oklab, var(--fg) 26%, var(--surface))'
/** Room outside the ring for the lift; the lift, the growth, the gap between segments and their corner, in px. */
const MARGIN = 7
const LIFT = 4
const GROW = 2
const GAP = 3
const CORNER = 4

const n2 = (value: number) => (Math.round(value * 100) / 100).toString()

/** Small parts join one « Autres » segment, but only when at least two would. */
function sliceData(
  data: readonly DonutChartDatum[],
  groupBelow: number,
  maxSegments: number,
  otherLabel: string,
): Slice[] {
  const parts = data.filter((item) => item.value > 0)
  const total = parts.reduce((sum, item) => sum + item.value, 0)
  if (!total) {
    return []
  }
  const ranked = [...parts].sort((a, b) => b.value - a.value)
  const keep = new Set(
    ranked
      .filter(
        (item, rank) =>
          item.value / total >= groupBelow && rank < maxSegments - 1,
      )
      .map((item) => item.key),
  )
  const rest = parts.filter((item) => !keep.has(item.key))
  if (rest.length < 2) {
    return parts.map((item) => ({ ...item }))
  }
  return [
    ...parts.filter((item) => keep.has(item.key)).map((item) => ({ ...item })),
    {
      key: OTHER,
      label: otherLabel,
      value: rest.reduce((sum, item) => sum + item.value, 0),
      members: rest,
    },
  ]
}

/** The turns of the ring each slice takes, in data order; a hidden slice closes to a point where it sits. */
function layout(slices: readonly Slice[], hidden: ReadonlySet<string>) {
  const total =
    slices.reduce(
      (sum, item) => sum + (hidden.has(item.key) ? 0 : item.value),
      0,
    ) || 1
  let at = 0
  return new Map(
    slices.map((item) => {
      const arc = {
        start: at,
        end: at + (hidden.has(item.key) ? 0 : item.value / total),
      }
      at = arc.end
      return [item.key, arc]
    }),
  )
}

/** Half the width of a sector's outer edge once the gap is cut; under a couple of px a segment fades rather than drawing a hairline. */
function breadth(R: number, t0: number, t1: number, gap: number) {
  const turns = t1 - t0
  if (turns >= 1 - 1e-6) {
    return Infinity
  }
  return (
    Math.sin(Math.min(turns * Math.PI, Math.PI / 2)) * R -
    Math.min(gap / 2, ((1 - turns) * TAU * R) / 2)
  )
}

/**
 * A ring sector between two turns, clockwise from the top, with rounded
 * corners. Its sides run parallel to the radius, so the gap between two
 * segments is as wide inside as outside; a thin sector narrows to a wedge,
 * then to nothing, so a closing segment never pops.
 */
function sector(
  c: number,
  R: number,
  r: number,
  t0: number,
  t1: number,
  gap: number,
  corner: number,
) {
  const turns = t1 - t0
  if (turns <= 1e-6) {
    return ''
  }
  const at = (radius: number, angle: number) =>
    `${n2(c + radius * Math.cos(angle))} ${n2(c + radius * Math.sin(angle))}`
  if (turns >= 1 - 1e-6) {
    return `M${at(R, -Math.PI / 2)}A${n2(R)} ${n2(R)} 0 1 1 ${at(R, Math.PI / 2)}A${n2(R)} ${n2(R)} 0 1 1 ${at(R, -Math.PI / 2)}ZM${at(r, -Math.PI / 2)}A${n2(r)} ${n2(r)} 0 1 0 ${at(r, Math.PI / 2)}A${n2(r)} ${n2(r)} 0 1 0 ${at(r, -Math.PI / 2)}Z`
  }
  // Half the gap on each side; a lone segment closes its gap as the rest
  // of the ring empties, so it becomes a whole ring without a jump.
  const p = Math.min(gap / 2, ((1 - turns) * TAU * R) / 2)
  const a0 = t0 * TAU - Math.PI / 2
  const a1 = t1 * TAU - Math.PI / 2
  const half = (a1 - a0) / 2
  const s = Math.sin(Math.min(half, Math.PI / 2))
  if (s * R <= p + 1e-6) {
    return ''
  }
  const side = (t: number, angle: number, sign: number) =>
    `${n2(c + t * Math.cos(angle) - sign * p * Math.sin(angle))} ${n2(c + t * Math.sin(angle) + sign * p * Math.cos(angle))}`
  const band = (R - r) / 2
  const ro = Math.max(
    0,
    Math.min(corner, band, s >= 0.9999 ? Infinity : (s * R - p) / (1 + s)),
  )
  const dO = Math.asin(Math.min(1, (p + ro) / (R - ro)))
  const tO = Math.sqrt(Math.max(0, (R - ro) ** 2 - (p + ro) ** 2))
  const bigO = a1 - a0 - 2 * dO > Math.PI ? 1 : 0
  let d = `M${side(tO, a0, 1)}`
  if (ro > 0.01) {
    d += `A${n2(ro)} ${n2(ro)} 0 0 1 ${at(R, a0 + dO)}`
  }
  d += `A${n2(R)} ${n2(R)} 0 ${bigO} 1 ${at(R, a1 - dO)}`
  if (ro > 0.01) {
    d += `A${n2(ro)} ${n2(ro)} 0 0 1 ${side(tO, a1, -1)}`
  }
  if (s * r > p + 1e-6 || s >= 0.9999) {
    const ri = Math.max(
      0,
      Math.min(corner, band, s >= 0.9999 ? Infinity : (s * r - p) / (1 - s)),
    )
    const dI = Math.asin(Math.min(1, (p + ri) / (r + ri)))
    const tI = Math.sqrt(Math.max(0, (r + ri) ** 2 - (p + ri) ** 2))
    const bigI = a1 - a0 - 2 * dI > Math.PI ? 1 : 0
    d += `L${side(tI, a1, -1)}`
    if (ri > 0.01) {
      d += `A${n2(ri)} ${n2(ri)} 0 0 1 ${at(r, a1 - dI)}`
    }
    d += `A${n2(r)} ${n2(r)} 0 ${bigI} 0 ${at(r, a0 + dI)}`
    if (ri > 0.01) {
      d += `A${n2(ri)} ${n2(ri)} 0 0 1 ${side(tI, a0, 1)}`
    }
  } else {
    d += `L${at(p / s, (a0 + a1) / 2)}`
  }
  return `${d}Z`
}

/** The centre's readouts share one cell and roll like a drum: those before the active one wait above, those after it below. */
function drum(
  place: number,
  reduce: boolean,
): { animate: { opacity: number; y: string }; transition: Transition } {
  return {
    animate: {
      opacity: place === 0 ? 1 : 0,
      y: `${0.45 * Math.sign(place)}em`,
    },
    transition: reduce
      ? { duration: 0 }
      : place === 0
        ? { duration: duration.standard, ease: ease.enter }
        : { duration: duration.fast, ease: ease.standard },
  }
}

/**
 * A few parts of one whole, after Arc UI's donut chart
 * (https://uiarc.dev, MIT).
 *
 * **Use it for** shares that matter more than exact comparison: events by
 * type, requests by source, revenue by space. Keep it to a few parts:
 * small ones join « Autres ». **Not for** values over time (`BarChart`,
 * `LineChart`) or comparing many parts precisely (`BarChart`).
 *
 * **Where**: in a dashboard card; the legend sits beside the ring when
 * there is room, under it on a phone.
 *
 * **States**: at rest (the total in the centre), a segment previewed
 * (hover, focus) or selected (it slides out and the centre reads it),
 * segments hidden from the legend, empty.
 *
 * **Compose**: in a `Card`; drive a detail list with `onActiveChange`.
 *
 * **Key props**: `data` (`key`, `label`, `value`, `color`), `label`,
 * `unit`, `format`, `totalLabel`, `size`, `thickness`, `groupBelow`,
 * `maxSegments`, `activeKey` / `onActiveChange`, `hiddenKeys` /
 * `onHiddenKeysChange`, `legendAction` (toggle, select), `legend`,
 * `labels` to change its words.
 *
 * **Motion**: the ring sweeps in once seen, each edge a beat after the
 * one before; new data or a hidden segment moves every arc from where it
 * is; the active segment slides out and thickens; the centre rolls like a
 * drum and its figures count. With reduced motion everything lands at
 * once.
 *
 * **Accessibility**: the whole is summed up in words and every part is
 * in a hidden table (the members of « Autres » too). Legend rows are
 * buttons that name their part, value and share, walked with the arrows;
 * without a legend the ring itself is focusable and read with the arrows.
 * Showing or hiding a part is announced.
 *
 * @summary A ring of a few parts of one whole, with a synced legend.
 */
function DonutChart({
  data,
  label,
  unit = '',
  format,
  totalLabel,
  size = 208,
  thickness = 24,
  groupBelow = 0.04,
  maxSegments = 6,
  otherLabel,
  activeKey,
  defaultActiveKey = null,
  onActiveChange,
  hiddenKeys,
  defaultHiddenKeys,
  onHiddenKeysChange,
  legendAction = 'toggle',
  legend = true,
  emptyLabel,
  className,
  labels,
}: DonutChartProps) {
  const messages = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const totalWord = totalLabel ?? messages.chartTotal
  const otherWord = otherLabel ?? messages.chartOther
  const emptyWord = emptyLabel ?? messages.chartNoData
  const suffix = unit ? ` ${unit}` : ''
  // Stable writers, so the counting figures are not restarted by a render.
  const { formatNumber, formatShare } = useMemo(() => {
    const number = new Intl.NumberFormat(messages.intlLocale, {
      maximumFractionDigits: 1,
      ...format,
    })
    const percent = new Intl.NumberFormat(messages.intlLocale, {
      style: 'percent',
      maximumFractionDigits: 0,
    })
    return {
      formatNumber: (value: number) => number.format(value),
      formatShare: (share: number) =>
        share > 0 && share < 0.01
          ? `< ${percent.format(0.01)}`
          : percent.format(share),
    }
  }, [messages.intlLocale, format])
  const shareOfTotal = useCallback(
    (share: number) => messages.chartShareOfTotal(formatShare(share)),
    [formatShare, messages],
  )
  const write = (value: number) => `${formatNumber(value)}${suffix}`
  const list = new Intl.ListFormat(messages.intlLocale, {
    style: 'long',
    type: 'conjunction',
  })

  // The slices are made again only when the data does.
  const dataKey = `${groupBelow}|${maxSegments}|${otherWord}|${data
    .map(
      (item) => `${item.key}:${item.label}:${item.value}:${item.color ?? ''}`,
    )
    .join(';')}`
  const [sliced, setSliced] = useState(() => ({
    key: dataKey,
    slices: sliceData(data, groupBelow, maxSegments, otherWord),
  }))
  if (sliced.key !== dataKey) {
    setSliced({
      key: dataKey,
      slices: sliceData(data, groupBelow, maxSegments, otherWord),
    })
  }
  const slices = sliced.slices

  // Hidden segments, controlled or not.
  const [ownHidden, setOwnHidden] = useState<readonly string[]>(
    defaultHiddenKeys ?? [],
  )
  const hiddenList = hiddenKeys ?? ownHidden
  const hidden = new Set(
    hiddenList.filter((key) => slices.some((item) => item.key === key)),
  )
  const hiddenKey = [...hidden].join('|')
  const visible = slices.filter((item) => !hidden.has(item.key))
  const total = visible.reduce((sum, item) => sum + item.value, 0)
  const signature = `${slices.map((item) => `${item.key}:${item.value}${hidden.has(item.key) ? 'h' : ''}`).join('|')}`

  // Colours follow a key from the first time it is seen, through every dataset.
  const [palette, setPalette] = useState(
    () => new Map(data.map((item, index) => [item.key, index])),
  )
  if (data.some((item) => !palette.has(item.key))) {
    const next = new Map(palette)
    for (const item of data) {
      if (!next.has(item.key)) {
        next.set(item.key, next.size)
      }
    }
    setPalette(next)
  }
  const colorFor = (item: Slice) =>
    item.color
      ? chartColor(item.color)
      : item.key === OTHER
        ? OTHER_COLOR
        : paletteColor(palette.get(item.key) ?? 0)

  // Leaving segments stay drawn in their old place while they close.
  const [drawn, setDrawn] = useState<Slice[]>(slices)
  const [seenSignature, setSeenSignature] = useState(signature)
  if (seenSignature !== signature) {
    setSeenSignature(signature)
    const next = [...slices]
    drawn.forEach((item, index) => {
      if (next.some((slice) => slice.key === item.key)) {
        return
      }
      const before = drawn
        .slice(0, index)
        .reverse()
        .find((prior) => next.some((slice) => slice.key === prior.key))
      next.splice(
        before ? next.findIndex((slice) => slice.key === before.key) + 1 : 0,
        0,
        { ...item, value: 0 },
      )
    })
    setDrawn(next)
  }

  // Selection, controlled or not; hover and focus preview over it.
  const [ownActive, setOwnActive] = useState<string | null>(defaultActiveKey)
  const selected = activeKey !== undefined ? activeKey : ownActive
  const [preview, setPreview] = useState<string | null>(null)
  const select = (key: string | null) => {
    if (activeKey === undefined) {
      setOwnActive(key)
    }
    onActiveChange?.(key)
  }
  const current =
    [preview, selected].find(
      (key) => key && visible.some((item) => item.key === key),
    ) ?? null
  const activeSlice = visible.find((item) => item.key === current) ?? null

  const [announcement, setAnnouncement] = useState('')
  const toggleHidden = (key: string) => {
    const wasHidden = hidden.has(key)
    if (!wasHidden && visible.length <= 1) {
      return
    }
    const next = wasHidden
      ? hiddenList.filter((item) => item !== key)
      : [...hiddenList, key]
    if (hiddenKeys === undefined) {
      setOwnHidden(next)
    }
    onHiddenKeysChange?.(next)
    const item = slices.find((slice) => slice.key === key)
    const nextTotal = slices.reduce(
      (sum, slice) => sum + (next.includes(slice.key) ? 0 : slice.value),
      0,
    )
    if (item) {
      setAnnouncement(
        messages.chartToggled(item.label, wasHidden, write(nextTotal)),
      )
    }
  }

  // Geometry in the chart's own units; the SVG scales with its box.
  const c = size / 2
  const outer = c - MARGIN
  const inner = Math.max(8, outer - thickness)
  const corner = Math.min(CORNER, thickness / 4)
  const geometry = useRef({ c, outer, inner, corner })
  const segments = useRef(new Map<string, Segment>())
  const paths = useRef(new Map<string, SVGPathElement>())
  const targets = useRef(new Map<string, Arc>())
  const applied = useRef('')

  // One paint per frame, whatever moved: each path's shape and lift are
  // written straight into the page.
  const paint = useCallback(() => {
    const { c, outer, inner, corner } = geometry.current
    for (const [key, node] of paths.current) {
      const segment = segments.current.get(key)
      if (!segment) {
        node.setAttribute('d', '')
        continue
      }
      const start = segment.start.get()
      const end = segment.end.get()
      const lift = Math.max(0, segment.lift.get())
      const R = outer + lift * GROW
      node.setAttribute(
        'd',
        sector(c, R, inner - lift * GROW * 0.5, start, end, GAP, corner),
      )
      node.setAttribute(
        'fill-opacity',
        n2(Math.min(1, Math.max(0, (breadth(R, start, end, GAP) - 1) / 3))),
      )
      const middle = ((start + end) / 2) * TAU - Math.PI / 2
      const distance = lift * LIFT
      node.setAttribute(
        'transform',
        `translate(${n2(Math.cos(middle) * distance)} ${n2(Math.sin(middle) * distance)})`,
      )
    }
  }, [])
  const schedule = useCallback(() => {
    frame.render(paint)
  }, [paint])

  const figure = useRef<HTMLElement | null>(null)
  const inView = useInView(figure, { once: true, amount: 0.35 })
  const shown = inView || reduce

  // A path joins the painter when it is drawn and leaves with it.
  const registerPath = useCallback(
    (node: SVGPathElement | null) => {
      const key = node?.dataset.key
      if (!node || !key) {
        return undefined
      }
      paths.current.set(key, node)
      paint()
      return () => {
        if (paths.current.get(key) === node) {
          paths.current.delete(key)
        }
      }
    },
    [paint],
  )

  // A new size repaints at once. The ring stops painting when it goes.
  const svg = useRef<SVGSVGElement | null>(null)
  const resize = useCallback(
    (node: SVGSVGElement | null) => {
      svg.current = node
      if (!node) {
        return undefined
      }
      geometry.current = { c, outer, inner, corner }
      paint()
      return () => cancelFrame(paint)
    },
    [c, corner, inner, outer, paint],
  )

  // The active segment slides out along its middle and thickens; the one
  // it replaces settles back at the same time.
  const liftTo = useCallback(
    (key: string | null) => {
      for (const [segmentKey, segment] of segments.current) {
        const to = segmentKey === key ? 1 : 0
        if (reduce) {
          segment.lift.jump(to)
        } else if (segment.lift.get() !== to || segment.lift.isAnimating()) {
          animate(segment.lift, to, pop)
        }
      }
    },
    [reduce],
  )
  const lift = useCallback(
    (node: SVGCircleElement | null) => {
      if (node) {
        liftTo(current)
      }
      return undefined
    },
    [current, liftTo],
  )

  // New data, or a segment shown or hidden, moves every arc from wherever
  // it is on screen, keeping its speed if it was already moving.
  const arrange = useCallback(
    (node: SVGGElement | null) => {
      if (!node || !shown) {
        return undefined
      }
      const runKey = `${signature}|${reduce}`
      if (applied.current === runKey) {
        return undefined
      }
      applied.current = runKey
      const off = new Set(hiddenKey ? hiddenKey.split('|') : [])
      const goal = layout(slices, off)
      targets.current = goal
      const first = segments.current.size === 0
      const place = (index: number) => {
        const before = drawn
          .slice(0, index)
          .reverse()
          .find((item) => goal.has(item.key))
        return before ? goal.get(before.key)!.end : 0
      }
      const drop = (key: string) => {
        segments.current.get(key)?.off()
        segments.current.delete(key)
        setDrawn((items) => items.filter((item) => item.key !== key))
      }
      drawn.forEach((item, index) => {
        const leaving = !goal.has(item.key)
        const to = goal.get(item.key) ?? {
          start: place(index),
          end: place(index),
        }
        let segment = segments.current.get(item.key)
        if (!segment) {
          // A new segment opens from the edge of the one before it, as it is now.
          const prior = drawn
            .slice(0, index)
            .reverse()
            .map((entry) => segments.current.get(entry.key))
            .find(Boolean)
          const from = first ? 0 : prior ? prior.end.get() : 0
          const start = motionValue(from)
          const end = motionValue(from)
          const lift = motionValue(0)
          const offs = [
            start.on('change', schedule),
            end.on('change', schedule),
            lift.on('change', schedule),
          ]
          segment = {
            start,
            end,
            lift,
            off: () => {
              offs.forEach((stop) => stop())
              start.destroy()
              end.destroy()
              lift.destroy()
            },
          }
          segments.current.set(item.key, segment)
        }
        if (reduce) {
          segment.start.jump(to.start)
          segment.end.jump(to.end)
          if (leaving) {
            drop(item.key)
          }
          return
        }
        if (first) {
          // One sweep: every segment leaves the top together, each
          // trailing edge a beat behind the one before.
          animate(segment.start, to.start, reveal)
          animate(segment.end, to.end, {
            ...reveal,
            delay: 0.04 + index * stagger.item,
          })
          return
        }
        animate(segment.start, to.start, settle)
        animate(segment.end, to.end, {
          ...settle,
          onComplete: leaving ? () => drop(item.key) : undefined,
        })
      })
      // Segments made just now take the lift of the active one.
      liftTo(current)
      schedule()
      return undefined
    },
    [
      current,
      drawn,
      hiddenKey,
      liftTo,
      reduce,
      schedule,
      shown,
      signature,
      slices,
    ],
  )

  // One pointer handler for the whole ring: the angle picks the segment,
  // so crossing a gap never drops the hover.
  const hit = (event: { clientX: number; clientY: number }) => {
    const box = svg.current?.getBoundingClientRect()
    if (!box?.width) {
      return undefined
    }
    const scale = size / box.width
    const x = (event.clientX - box.left) * scale - c
    const y = (event.clientY - box.top) * scale - c
    const radius = Math.hypot(x, y)
    if (radius < inner - 6 || radius > c) {
      return null
    }
    let turn = (Math.atan2(y, x) + Math.PI / 2) / TAU
    if (turn < 0) {
      turn += 1
    }
    for (const [key, arc] of targets.current) {
      if (
        arc.end > arc.start &&
        turn >= arc.start &&
        turn < arc.end &&
        visible.some((item) => item.key === key)
      ) {
        return key
      }
    }
    return undefined
  }
  const onRingMove = (event: PointerEvent<SVGSVGElement>) => {
    if (event.pointerType !== 'mouse') {
      return
    }
    const key = hit(event)
    if (key !== undefined && key !== preview) {
      setPreview(key)
    }
  }
  const onRingClick = (event: MouseEvent<SVGSVGElement>) => {
    const key = hit(event)
    if (key) {
      select(selected === key ? null : key)
    }
  }

  const describe = (item: Slice) => {
    const base = `${item.label}, ${write(item.value)}, ${formatShare(item.value / (total || 1))}`
    return item.members
      ? `${base}. ${messages.chartIncludes(list.format(item.members.map((member) => member.label)))}`
      : base
  }
  const members = (item: Slice) =>
    item.members
      ? item.members.length > 2
        ? messages.chartAndMore(
            item.members
              .slice(0, 2)
              .map((member) => member.label)
              .join(', '),
            item.members.length - 2,
          )
        : list.format(item.members.map((member) => member.label))
      : null
  /**
   * A legend row's name: its words and figures in the order they are seen,
   * so a voice command that reads the row out hits it (WCAG 2.5.3), then
   * « masqué » when the segment is hidden.
   */
  const rowName = (item: Slice, off: boolean) => {
    const seen = [
      item.label,
      members(item),
      formatNumber(item.value),
      formatShare(off || !total ? 0 : item.value / total),
    ]
      .filter(Boolean)
      .join(', ')
    return off ? messages.chartHiddenItem(seen) : seen
  }

  // Arrows walk the segments: in the legend, or on the ring without one.
  const rows = useRef<(HTMLButtonElement | null)[]>([])
  const step = (key: string, index: number, count: number) =>
    (
      ({
        ArrowDown: index + 1,
        ArrowRight: index + 1,
        ArrowUp: index - 1,
        ArrowLeft: index - 1,
        Home: 0,
        End: count - 1,
      }) as Record<string, number>
    )[key]
  const onLegendKey = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === 'Escape' && selected) {
      event.preventDefault()
      select(null)
      return
    }
    const next = step(event.key, index, slices.length)
    if (next === undefined) {
      return
    }
    event.preventDefault()
    rows.current[(next + slices.length) % slices.length]?.focus()
  }
  const onRingKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!visible.length) {
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      setPreview(null)
      if (selected) {
        select(null)
      }
      return
    }
    if ((event.key === 'Enter' || event.key === ' ') && current) {
      event.preventDefault()
      select(selected === current ? null : current)
      return
    }
    const index = visible.findIndex((item) => item.key === current)
    const backward = event.key.endsWith('Up') || event.key.endsWith('Left')
    const next = step(
      event.key,
      index < 0 ? (backward ? 0 : -1) : index,
      visible.length,
    )
    if (next === undefined) {
      return
    }
    event.preventDefault()
    const item = visible[(next + visible.length) % visible.length]!
    setPreview(item.key)
    setAnnouncement(describe(item))
  }
  const onLegendBlur = (event: FocusEvent<HTMLButtonElement>) => {
    const into = event.relatedTarget
    if (!(
      into instanceof Node && event.currentTarget.closest('ul')?.contains(into)
    )) {
      setPreview(null)
    }
  }

  // One readout per segment plus the total: the active one rolls in from
  // the side it sits on, so going clockwise rolls the drum forward.
  const readouts = [
    {
      key: '__total',
      label: total ? totalWord : emptyWord,
      value: total,
      part: null as Slice | null,
    },
    ...slices.map((item) => ({
      key: item.key,
      label: item.label,
      value: item.value,
      part: item as Slice | null,
    })),
  ]
  const activeIndex = Math.max(
    0,
    readouts.findIndex(
      (item) => item.key === (activeSlice ? activeSlice.key : '__total'),
    ),
  )
  const summary = total
    ? `${label}. ${messages.chartReading(totalWord, write(total))}. ${visible.map(describe).join('. ')}.`
    : `${label}. ${emptyWord}.`

  return (
    <MotionScope>
      <figure
        ref={figure}
        data-slot="donut-chart"
        aria-label={label}
        className={cn(
          'm-0 grid min-w-0 text-fg @container *:min-w-0',
          legend &&
            'gap-6 @min-[460px]:grid-cols-[auto_minmax(0,1fr)] @min-[460px]:items-center @min-[460px]:gap-8',
          className,
        )}
      >
        <div
          style={
            {
              width: size,
              '--inner': `${((inner * 2) / size) * 100}%`,
            } as CSSProperties
          }
          // Without a legend, the ring itself is read with the arrows.
          {...(legend
            ? {}
            : {
                role: 'group',
                tabIndex: 0,
                'aria-label': messages.chartRingHint(label),
                onKeyDown: onRingKey,
                onBlur: () => setPreview(null),
              })}
          className="relative aspect-square max-w-full justify-self-center rounded-full outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus"
        >
          <svg
            ref={resize}
            viewBox={`0 0 ${size} ${size}`}
            aria-hidden="true"
            focusable="false"
            onPointerMove={onRingMove}
            onPointerLeave={() => setPreview(null)}
            onClick={onRingClick}
            className={cn(
              'block size-full overflow-visible',
              current !== null && 'cursor-pointer',
            )}
          >
            {/* The track shows only before the first sweep and when there is nothing to draw, so the gaps stay the page's colour. */}
            <circle
              ref={lift}
              cx={c}
              cy={c}
              r={(outer + inner) / 2}
              strokeWidth={outer - inner}
              fill="none"
              className={cn(
                'stroke-[color-mix(in_oklab,var(--fg)_6%,transparent)] transition-opacity duration-300 ease-standard motion-reduce:transition-none',
                !shown || !total ? 'opacity-100' : 'opacity-0',
              )}
            />
            <g ref={arrange}>
              {drawn.map((item) => (
                <path
                  key={item.key}
                  ref={registerPath}
                  data-key={item.key}
                  style={{ '--slice': colorFor(item) } as CSSProperties}
                  className={cn(
                    'fill-(--slice) transition-[fill,opacity] duration-200 ease-standard [shape-rendering:geometricPrecision] motion-reduce:transition-none',
                    current !== null && item.key !== current && 'opacity-45',
                  )}
                />
              ))}
            </g>
          </svg>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 grid w-[calc(var(--inner)-1rem)] -translate-x-1/2 -translate-y-1/2"
          >
            {readouts.map((item, index) => (
              <m.span
                key={item.key}
                initial={false}
                {...drum(index - activeIndex, reduce)}
                className="grid min-w-0 justify-items-center gap-0.5 text-center [grid-area:1/1]"
              >
                <span className="block w-full truncate text-xs text-fg-muted">
                  {item.label}
                </span>
                <span className="block max-w-full truncate text-2xl font-medium tracking-title tabular-nums">
                  {item.value || item.part ? (
                    <ChartCount value={item.value} format={formatNumber} />
                  ) : (
                    ' '
                  )}
                </span>
                <span className="block min-h-4 w-full truncate text-xs text-fg-subtle tabular-nums">
                  {item.part ? (
                    <ChartCount
                      value={
                        total && !hidden.has(item.key) ? item.value / total : 0
                      }
                      format={shareOfTotal}
                    />
                  ) : (
                    unit || ' '
                  )}
                </span>
              </m.span>
            ))}
          </div>
        </div>
        {legend && slices.length > 0 && (
          <ul
            aria-label={messages.chartSegments(
              label,
              legendAction === 'toggle',
            )}
            onPointerLeave={() => setPreview(null)}
            className="m-0 -mb-0.5 grid list-none p-0"
          >
            <AnimatePresence initial={false}>
              {slices.map((item, index) => {
                const off = hidden.has(item.key)
                return (
                  // A row that joins or leaves opens or closes its height, so the rows below glide.
                  <m.li
                    key={item.key}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={reduce ? { duration: 0 } : spring.smooth}
                    className="overflow-hidden"
                  >
                    <button
                      ref={(node) => {
                        rows.current[index] = node
                      }}
                      type="button"
                      aria-pressed={
                        legendAction === 'toggle' ? !off : selected === item.key
                      }
                      aria-label={rowName(item, off)}
                      style={{ '--slice': colorFor(item) } as CSSProperties}
                      onClick={() =>
                        legendAction === 'toggle'
                          ? toggleHidden(item.key)
                          : select(selected === item.key ? null : item.key)
                      }
                      onPointerEnter={(event) => {
                        if (event.pointerType === 'mouse') {
                          setPreview(off ? null : item.key)
                        }
                      }}
                      onFocus={(event) => {
                        if (event.currentTarget.matches(':focus-visible')) {
                          setPreview(off ? null : item.key)
                        }
                      }}
                      onBlur={onLegendBlur}
                      onKeyDown={(event) => onLegendKey(event, index)}
                      className={cn(
                        'mb-0.5 grid min-h-10 w-full grid-cols-[0.625rem_minmax(0,1fr)_auto_3.25em] items-center gap-x-2.5 rounded-xl px-2.5 py-1.5 text-left text-sm text-fg transition-[background-color,scale] duration-150 ease-standard hover:bg-hover focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus active:scale-[.985] motion-reduce:transition-none max-md:min-h-11',
                        (item.key === current || selected === item.key) &&
                          'bg-hover',
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'size-2.5 rounded-full shadow-[inset_0_0_0_1.5px_var(--slice)] transition-colors duration-200 motion-reduce:transition-none',
                          off ? 'bg-transparent' : 'bg-(--slice)',
                        )}
                      />
                      {/* The spaces between the parts keep the row's text as separate words; a grid draws no gap for them. */}
                      <span className="grid min-w-0">
                        <span
                          className={cn('truncate', off && 'text-fg-subtle')}
                        >
                          {item.label}
                        </span>{' '}
                        {item.members && (
                          <span className="truncate text-xs text-fg-subtle">
                            {members(item)}
                          </span>
                        )}
                      </span>{' '}
                      <ChartCount
                        value={item.value}
                        format={formatNumber}
                        className={cn(
                          'justify-self-end tabular-nums',
                          off ? 'text-fg-subtle' : 'text-fg-muted',
                        )}
                      />{' '}
                      <ChartCount
                        value={off || !total ? 0 : item.value / total}
                        format={formatShare}
                        className={cn(
                          'justify-self-end font-medium tabular-nums',
                          off && 'text-fg-subtle',
                        )}
                      />
                    </button>
                  </m.li>
                )
              })}
            </AnimatePresence>
          </ul>
        )}
        <p className="sr-only">{summary}</p>
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
        {total > 0 && (
          <ChartDataTable
            caption={label}
            head={[
              messages.chartSegment,
              messages.chartValue,
              messages.chartShare,
            ]}
            rows={visible
              .flatMap((item) =>
                item.members
                  ? item.members.map((member) => ({
                      key: member.key,
                      label: `${member.label} (${otherWord})`,
                      value: member.value,
                    }))
                  : [item],
              )
              .map((item) => ({
                key: item.key,
                cells: [
                  item.label,
                  write(item.value),
                  formatShare(item.value / total),
                ],
              }))}
          />
        )}
      </figure>
    </MotionScope>
  )
}

export { DonutChart }
export type { DonutChartDatum, DonutChartProps, DonutChartLabels }
