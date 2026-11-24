import { useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react'
import { m, useInView } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { chartColor } from '../internal/chart-color.ts'
import type { ChartColor } from '../internal/chart-color.ts'
import { ChartDataTable } from '../internal/chart-data-table.tsx'
import { clamp } from '../internal/chart-scale.ts'
import { ChartTooltip } from '../internal/chart-tooltip.tsx'
import { ease, spring } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { SlopeRank } from '../internal/slope-rank.tsx'
import { useElementSize } from '../internal/use-element-size.ts'
import { cn } from '../lib/cn.ts'

export type SlopeItem = {
  /** Stable identity: an item keeps its line across datasets, so a switch morphs it. */
  key: string
  /** Its name beside the first value, in the tooltip and the table. */
  label: string
  /** The value in the first period. */
  start: number
  /** The value in the second period. */
  end: number
}

/** The words SlopeChart writes, to change on one SlopeChart only. */
type SlopeChartLabels = Partial<
  Pick<
    GoGoUIMessages,
    | 'slopeRankSame'
    | 'slopeRankUp'
    | 'slopeRankDown'
    | 'chartSpan'
    | 'chartRange'
    | 'slopeRole'
    | 'slopeKeys'
    | 'slopeItem'
    | 'slopeChange'
    | 'slopeRank'
    | 'slopeRankMove'
  >
>

export type SlopeChartProps = {
  data: SlopeItem[]
  /** What is measured (« Chiffre d'affaires par espace »): the chart's accessible name. */
  label: string
  /** The first column's heading (« 2025 »). */
  startLabel: string
  /** The second column's heading (« 2026 »). */
  endLabel: string
  formatValue?: (value: number) => string
  /** The change in the tooltip; the difference in `formatValue`'s words by default. */
  formatChange?: (change: number, item: SlopeItem) => string
  /** The plot's height in px; 44 px per item by default. */
  height?: number
  /** The item the story is about, drawn in `color`. */
  highlightKey?: string | null
  /** The highlighted item's colour; `chart-1` by default. */
  color?: ChartColor
  /** The item in focus (controlled): the others fade. */
  activeKey?: string | null
  onActiveChange?: (key: string | null) => void
  /** The rank change beside each second value. */
  ranks?: boolean
  /** Shown when there is no item; « Aucune donnée pour cette période » by default. */
  emptyLabel?: string
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: SlopeChartLabels
}

type Row = {
  item: SlopeItem
  y0: number
  y1: number
  l0: number
  l1: number
  rank0: number
  rank1: number
  order: number
}

const LABEL_GAP = 20
const PAD = 14
const HEAD = 28

/** Moves labels apart just enough to stop overlaps: touching labels form a group centred on where its members want to be. */
function spread(wanted: number[], gap: number, low: number, high: number) {
  const order = wanted
    .map((y, index) => ({ y, index }))
    .sort((a, b) => a.y - b.y)
  let groups = order.map((entry) => ({ members: [entry], top: entry.y }))
  for (let changed = true; changed;) {
    changed = false
    const next: typeof groups = []
    for (const group of groups) {
      const previous = next[next.length - 1]
      if (
        previous &&
        previous.top + previous.members.length * gap > group.top
      ) {
        const members = [...previous.members, ...group.members]
        next[next.length - 1] = {
          members,
          top:
            members.reduce((sum, member, k) => sum + member.y - k * gap, 0) /
            members.length,
        }
        changed = true
      } else {
        next.push(group)
      }
    }
    groups = next.map((group) => ({
      ...group,
      top: clamp(
        group.top,
        low,
        Math.max(low, high - (group.members.length - 1) * gap),
      ),
    }))
  }
  const out = Array.from({ length: wanted.length }, () => 0)
  groups.forEach((group) =>
    group.members.forEach((member, k) => {
      out[member.index] = group.top + k * gap
    }),
  )
  return out
}

/**
 * A slope chart, after Arc UI (https://uiarc.dev, MIT): each item is a
 * line between its value at two moments, so both the change and the new
 * order read at a glance.
 *
 * **Use it for** several items compared between exactly two moments (the
 * revenue of each space, 2025 against 2026; the average guests by event
 * type). **Not for** more than two moments (a line chart in `Chart`) or a
 * single item (a figure with its trend).
 *
 * **Where**: a report or a dashboard card, with room for the names on the
 * left.
 *
 * **States**: drawn, an item highlighted (`highlightKey`), an item in
 * focus (pointer, keyboard or `activeKey`) with its tooltip, empty.
 *
 * **Compose**: in a `Card`; `formatValue` for money or percentages.
 *
 * **Key props**: `data` (key, label, start, end), `label`, `startLabel`,
 * `endLabel`, `formatValue`, `formatChange`, `highlightKey` + `color`,
 * `activeKey` + `onActiveChange`, `ranks`, `height`,
 * `labels` to change its words.
 *
 * **Motion**: the lines draw from left to right the first time the chart
 * is seen, their dots landing as each line ends; new data moves lines,
 * dots and labels on a spring and rolls the rank changes. With reduced
 * motion the final state is drawn at once.
 *
 * **Accessibility**: a named figure; the plot takes the focus and the
 * arrows walk the items in the second period's order, each said in a live
 * region; a hidden table gives every value and rank.
 *
 * @summary Lines showing how several items changed between two moments.
 */
export function SlopeChart({
  data,
  label,
  startLabel,
  endLabel,
  formatValue,
  formatChange,
  height,
  highlightKey = null,
  color = 'chart-1',
  activeKey,
  onActiveChange,
  ranks = true,
  emptyLabel,
  className,
  labels,
}: SlopeChartProps) {
  const t = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const figure = useRef<HTMLElement>(null)
  const inView = useInView(figure, { once: true, amount: 0.3 })
  const [stage, stageRef] = useElementSize<HTMLDivElement>()
  const width = stage?.width ?? 0
  const empty = data.length === 0
  const plotHeight = height ?? Math.max(200, data.length * 44)

  const narrow = width < 440
  const leftRoom = narrow ? (width < 300 ? 116 : 132) : 168
  const rightRoom = ranks ? (narrow ? 76 : 96) : narrow ? 52 : 64
  const x0 = leftRoom
  const x1 = Math.max(x0 + 40, width - rightRoom)

  // One value axis for both columns, padded so dots never touch the edges.
  const values = data.flatMap((item) => [item.start, item.end])
  let lo = Math.min(...values)
  let hi = Math.max(...values)
  if (!Number.isFinite(lo)) {
    lo = 0
    hi = 1
  }
  if (hi - lo < 1e-9) {
    lo -= 1
    hi += 1
  }
  const yOf = (value: number) =>
    PAD + (1 - (value - lo) / (hi - lo)) * (plotHeight - PAD * 2)
  const rankOf = (field: 'start' | 'end') => {
    const sorted = [...data].sort((a, b) => b[field] - a[field])
    return (item: SlopeItem) => sorted.indexOf(item) + 1
  }
  const r0 = rankOf('start')
  const r1 = rankOf('end')
  const l0 = spread(
    data.map((item) => yOf(item.start)),
    LABEL_GAP,
    8,
    plotHeight - 8,
  )
  const l1 = spread(
    data.map((item) => yOf(item.end)),
    LABEL_GAP,
    8,
    plotHeight - 8,
  )
  const rows: Row[] = data.map((item, index) => ({
    item,
    y0: yOf(item.start),
    y1: yOf(item.end),
    l0: l0[index],
    l1: l1[index],
    rank0: r0(item),
    rank1: r1(item),
    order: 0,
  }))
  const byEnd = [...rows].sort((a, b) => a.rank1 - b.rank1)
  byEnd.forEach((row, k) => {
    row.order = k
  })

  const [ownActive, setOwnActive] = useState<string | null>(null)
  const wanted = activeKey !== undefined ? activeKey : ownActive
  const active =
    wanted && data.some((item) => item.key === wanted) ? wanted : null
  const setActive = (key: string | null) => {
    if (activeKey === undefined) {
      setOwnActive(key)
    }
    if (key !== active) {
      onActiveChange?.(key)
    }
  }
  // A keyboard step lands the tooltip at once; only the pointer glides it.
  const [keyed, setKeyed] = useState(false)
  // The tooltip keeps the last item's words while it fades out.
  const [shownKey, setShownKey] = useState<string | null>(null)
  if (active && active !== shownKey) {
    setShownKey(active)
  }
  const activeRow = rows.find((row) => row.item.key === active) ?? null
  const tipRow =
    activeRow ?? rows.find((row) => row.item.key === shownKey) ?? null

  // The line nearest the pointer, measured where the pointer is along the plot.
  const nearest = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    if (empty) {
      return null
    }
    const px = event.clientX - box.left
    const x = clamp(px, x0, x1)
    const y = event.clientY - box.top - HEAD
    const along = (x - x0) / Math.max(1, x1 - x0)
    let best: Row | null = null
    let distance = Infinity
    for (const row of rows) {
      const inLine = Math.abs(row.y0 + (row.y1 - row.y0) * along - y)
      const onLabel =
        px < x0
          ? Math.abs(row.l0 - y)
          : px > x1
            ? Math.abs(row.l1 - y)
            : Infinity
      const d = Math.min(inLine, onLabel)
      if (d < distance) {
        distance = d
        best = row
      }
    }
    return distance <= 22 ? (best?.item.key ?? null) : null
  }
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    setKeyed(false)
    if (event.pointerType === 'mouse' || event.buttons) {
      setActive(nearest(event))
    }
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (empty) {
      return
    }
    if (event.key === 'Escape' && active) {
      event.preventDefault()
      setActive(null)
      return
    }
    const at = activeRow ? activeRow.order : -1
    const moves: Record<string, number> = {
      ArrowDown: at + 1,
      ArrowRight: at + 1,
      ArrowUp: at < 0 ? 0 : at - 1,
      ArrowLeft: at < 0 ? 0 : at - 1,
      Home: 0,
      End: byEnd.length - 1,
    }
    if (!(event.key in moves)) {
      return
    }
    event.preventDefault()
    setKeyed(true)
    setActive(byEnd[clamp(moves[event.key], 0, byEnd.length - 1)].item.key)
  }

  const number = new Intl.NumberFormat(t.intlLocale, {
    maximumFractionDigits: 1,
  })
  const format = (value: number) =>
    formatValue ? formatValue(value) : number.format(value)
  const change = (item: SlopeItem) =>
    formatChange
      ? formatChange(item.end - item.start, item)
      : `${item.end >= item.start ? '+' : '−'}${format(Math.abs(item.end - item.start))}`
  const rankText = (row: Row) =>
    row.rank0 === row.rank1
      ? t.slopeRankSame
      : row.rank1 < row.rank0
        ? t.slopeRankUp(row.rank0 - row.rank1, row.rank1)
        : t.slopeRankDown(row.rank1 - row.rank0, row.rank1)
  const announce = activeRow
    ? `${activeRow.item.label}, ${startLabel} ${format(activeRow.item.start)}, ${endLabel} ${format(activeRow.item.end)}, ${change(activeRow.item)}, ${rankText(activeRow)}`
    : ''
  const summary = empty
    ? `${label}. ${emptyLabel ?? t.chartNoData}.`
    : `${t.chartSpan(label, startLabel, endLabel)} ${byEnd.map((row) => `${row.item.label} ${t.chartRange(format(row.item.start), format(row.item.end))}`).join(', ')}.`
  const settle = reduce ? { duration: 0 } : spring.morph
  const drawn = inView || reduce
  const anchor = activeRow
    ? { x: (x0 + x1) / 2, y: HEAD + (activeRow.y0 + activeRow.y1) / 2 }
    : null

  return (
    <MotionScope>
      <figure
        ref={figure}
        aria-label={label}
        style={{ '--slope-accent': chartColor(color) } as CSSProperties}
        className={cn('relative m-0 grid min-w-0 text-fg', className)}
      >
        {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- the plot is explored with the arrows; each reading is said in a live region */}
        <div
          ref={stageRef}
          role="group"
          tabIndex={empty ? -1 : 0}
          aria-roledescription={t.slopeRole}
          aria-label={`${label}. ${t.slopeKeys(endLabel)}`}
          data-narrow={narrow ? '' : undefined}
          data-active={active ? '' : undefined}
          className="group/slope relative min-w-0 touch-pan-y rounded-md outline-none select-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus"
          onPointerMove={onPointerMove}
          onPointerDown={(event) => {
            if (event.pointerType !== 'mouse') {
              event.currentTarget.setPointerCapture?.(event.pointerId)
              setKeyed(false)
              setActive(nearest(event))
            }
          }}
          onPointerUp={(event) => {
            if (event.pointerType !== 'mouse') {
              setActive(null)
            }
          }}
          onPointerCancel={() => setActive(null)}
          onPointerLeave={(event) => {
            if (event.pointerType === 'mouse') {
              setActive(null)
            }
          }}
          onKeyDown={onKeyDown}
          onBlur={() => setActive(null)}
          onFocus={(event) => {
            if (
              event.currentTarget.matches(':focus-visible') &&
              !empty &&
              !active
            ) {
              setKeyed(true)
              setActive(byEnd[0].item.key)
            }
          }}
        >
          {width > 0 && !empty && (
            <>
              <div aria-hidden="true" className="relative h-7">
                <span
                  className="absolute top-0 -translate-x-1/2 text-sm leading-5 whitespace-nowrap text-fg-subtle"
                  style={{ left: x0 }}
                >
                  {startLabel}
                </span>
                <span
                  className="absolute top-0 -translate-x-1/2 text-sm leading-5 whitespace-nowrap text-fg-subtle"
                  style={{ left: x1 }}
                >
                  {endLabel}
                </span>
              </div>
              <div className="relative" style={{ height: plotHeight }}>
                <svg
                  width={width}
                  height={plotHeight}
                  aria-hidden="true"
                  focusable="false"
                  className="block overflow-visible"
                >
                  <line
                    x1={x0}
                    x2={x0}
                    y1={0}
                    y2={plotHeight}
                    className="stroke-line [shape-rendering:crispEdges]"
                  />
                  <line
                    x1={x1}
                    x2={x1}
                    y1={0}
                    y2={plotHeight}
                    className="stroke-line [shape-rendering:crispEdges]"
                  />
                  {rows.map((row, index) => {
                    const key = row.item.key
                    const on = active === key
                    // The lines draw in once like a chart: 0.7 s each, the
                    // dots landing as each line ends.
                    const delay = reduce ? 0 : index * 0.05
                    return (
                      <g
                        key={key}
                        data-on={on ? '' : undefined}
                        data-accent={highlightKey === key ? '' : undefined}
                        data-dim={active !== null && !on ? '' : undefined}
                        className="[--ink:color-mix(in_oklab,var(--fg)_36%,var(--surface))] transition-opacity duration-200 ease-standard data-accent:[--ink:var(--slope-accent)] data-dim:opacity-14 data-on:not-data-accent:[--ink:var(--fg)] motion-reduce:transition-none"
                      >
                        <m.path
                          className="fill-none stroke-line-strong"
                          initial={false}
                          animate={{
                            d: `M${x0 - 6},${row.l0}L${x0 - 1},${row.y0}`,
                          }}
                          transition={settle}
                        />
                        <m.path
                          className="fill-none stroke-line-strong"
                          initial={false}
                          animate={{
                            d: `M${x1 + 6},${row.l1}L${x1 + 1},${row.y1}`,
                          }}
                          transition={settle}
                        />
                        <m.line
                          x1={x0}
                          x2={x1}
                          className="fill-none stroke-(--ink) stroke-2 transition-[stroke] duration-150 [stroke-linecap:round]"
                          initial={
                            reduce
                              ? false
                              : { y1: row.y0, y2: row.y1, pathLength: 0 }
                          }
                          animate={{
                            y1: row.y0,
                            y2: row.y1,
                            pathLength: drawn ? 1 : 0,
                          }}
                          transition={{
                            y1: settle,
                            y2: settle,
                            pathLength: reduce
                              ? { duration: 0 }
                              : {
                                  duration: 0.7,
                                  ease: ease.inOut,
                                  delay: 0.1 + delay,
                                },
                          }}
                        />
                        <m.circle
                          cx={x0}
                          r={4}
                          className="origin-center fill-(--ink) stroke-surface stroke-2 transition-[fill] duration-150 [transform-box:fill-box]"
                          initial={reduce ? false : { cy: row.y0, scale: 0 }}
                          animate={{ cy: row.y0, scale: drawn ? 1 : 0 }}
                          transition={{
                            cy: settle,
                            scale: reduce
                              ? { duration: 0 }
                              : { ...spring.snappy, delay },
                          }}
                        />
                        <m.circle
                          cx={x1}
                          r={4}
                          className="origin-center fill-(--ink) stroke-surface stroke-2 transition-[fill] duration-150 [transform-box:fill-box]"
                          initial={reduce ? false : { cy: row.y1, scale: 0 }}
                          animate={{ cy: row.y1, scale: drawn ? 1 : 0 }}
                          transition={{
                            cy: settle,
                            scale: reduce
                              ? { duration: 0 }
                              : { ...spring.snappy, delay: 0.7 + delay },
                          }}
                        />
                      </g>
                    )
                  })}
                </svg>
                {rows.map((row, index) => {
                  const key = row.item.key
                  const on = active === key
                  const delay = reduce ? 0 : index * 0.05
                  return (
                    <div
                      key={key}
                      aria-hidden="true"
                      data-on={on ? '' : undefined}
                      data-accent={highlightKey === key ? '' : undefined}
                      data-dim={active !== null && !on ? '' : undefined}
                      className="group/label transition-opacity duration-200 ease-standard data-dim:opacity-30 motion-reduce:transition-none"
                    >
                      <m.span
                        className="pointer-events-none absolute top-0 -mt-2.5 flex h-5 max-w-full items-center justify-end gap-2 text-sm leading-5 whitespace-nowrap group-data-narrow/slope:gap-1.5 group-data-narrow/slope:text-xs"
                        style={{ right: width - x0 + 10, maxWidth: x0 - 10 }}
                        initial={reduce ? false : { y: row.l0, opacity: 0 }}
                        animate={{ y: row.l0, opacity: drawn ? 1 : 0 }}
                        transition={{
                          y: settle,
                          opacity: reduce
                            ? { duration: 0 }
                            : { duration: 0.3, delay },
                        }}
                      >
                        <span className="min-w-0 truncate text-fg-muted group-data-accent/label:text-fg group-data-on/label:text-fg">
                          {row.item.label}
                        </span>
                        <span className="text-fg tabular-nums group-data-accent/label:font-medium">
                          {format(row.item.start)}
                        </span>
                      </m.span>
                      <m.span
                        className="pointer-events-none absolute top-0 -mt-2.5 flex h-5 items-center gap-2 text-sm leading-5 whitespace-nowrap group-data-narrow/slope:gap-1.5 group-data-narrow/slope:text-xs"
                        style={{ left: x1 + 10 }}
                        initial={reduce ? false : { y: row.l1, opacity: 0 }}
                        animate={{ y: row.l1, opacity: drawn ? 1 : 0 }}
                        transition={{
                          y: settle,
                          opacity: reduce
                            ? { duration: 0 }
                            : { duration: 0.3, delay: 0.7 + delay },
                        }}
                      >
                        <span className="text-fg tabular-nums group-data-accent/label:font-medium">
                          {format(row.item.end)}
                        </span>
                        {ranks && <SlopeRank move={row.rank0 - row.rank1} />}
                      </m.span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
          <ChartTooltip
            anchor={anchor}
            bounds={{ width, height: plotHeight + HEAD }}
            placement={{ x: 'center', y: 'above', gap: 16 }}
            instant={keyed}
            className="min-w-42 gap-0.75"
          >
            <p className="m-0 mb-0.5 font-medium whitespace-nowrap">
              {tipRow?.item.label}
            </p>
            <p className="m-0 flex items-center justify-between gap-3 leading-tight">
              <span className="text-fg-muted">{startLabel}</span>
              <span className="font-medium tabular-nums">
                {tipRow ? format(tipRow.item.start) : ''}
              </span>
            </p>
            <p className="m-0 flex items-center justify-between gap-3 leading-tight">
              <span className="text-fg-muted">{endLabel}</span>
              <span className="font-medium tabular-nums">
                {tipRow ? format(tipRow.item.end) : ''}
              </span>
            </p>
            <p className="m-0 mt-0.5 text-xs text-fg-subtle tabular-nums">
              {tipRow ? `${change(tipRow.item)}, ${rankText(tipRow)}` : ''}
            </p>
          </ChartTooltip>
          {empty && (
            <p className="m-0 grid min-h-40 place-items-center text-sm text-fg-subtle">
              {emptyLabel ?? t.chartNoData}
            </p>
          )}
        </div>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {announce}
        </p>
        <p className="sr-only">{summary}</p>
        {!empty && (
          <ChartDataTable
            caption={label}
            head={[
              t.slopeItem,
              startLabel,
              endLabel,
              t.slopeChange,
              t.slopeRank,
            ]}
            rows={byEnd.map((row) => ({
              key: row.item.key,
              cells: [
                row.item.label,
                format(row.item.start),
                format(row.item.end),
                change(row.item),
                t.slopeRankMove(row.rank0, row.rank1),
              ],
            }))}
          />
        )}
      </figure>
    </MotionScope>
  )
}
export type { SlopeChartLabels }
