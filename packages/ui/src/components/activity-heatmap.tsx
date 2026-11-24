import { useCallback, useId, useMemo, useRef, useState } from 'react'
import type {
  CSSProperties,
  FocusEvent,
  KeyboardEvent,
  PointerEvent,
  ReactNode,
} from 'react'
import { useInView } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { chartColor } from '../internal/chart-color.ts'
import type { ChartColor } from '../internal/chart-color.ts'
import { ChartSwap } from '../internal/chart-swap.tsx'
import { ChartTooltip } from '../internal/chart-tooltip.tsx'
import { MotionScope } from '../internal/motion-scope.tsx'
import { cn } from '../lib/cn.ts'
import { RollingNumber } from './rolling-number.tsx'

// Adapted from Arc UI's activity heatmap (https://uiarc.dev, MIT licence,
// Elia Kuratli): GoGoUI's colours and words, weeks starting on Monday by
// default, dates and numbers through Intl in the provider's language,
// GoGoUI's shared chart tooltip (inverted).

type ActivityDay = {
  /** The day, as YYYY-MM-DD. */
  date: string
  count: number
}

/** The words ActivityHeatmap writes, to change on one ActivityHeatmap only. */
type ActivityHeatmapLabels = Partial<
  Pick<
    GoGoUIMessages,
    | 'chartRange'
    | 'chartOrMore'
    | 'heatmapDays'
    | 'heatmapDaysWith'
    | 'heatmapLegend'
    | 'heatmapLess'
    | 'heatmapLevels'
    | 'heatmapHighlight'
    | 'heatmapMore'
  >
>

type ActivityHeatmapProps = {
  /** One entry per day, oldest first; a day missing inside the range counts as zero. */
  days: readonly ActivityDay[]
  /** The grid's name: « Jours réservés en 2026 ». */
  label: string
  /** The end of the summary, after the total and its unit: « en 2026 », « sur 12 mois ». */
  period: string
  /** The count's noun, one and several: `{ one: 'événement', other: 'événements' }`. */
  unit?: { one: string; other: string }
  /** The top of levels one to three; above the last is level four. By default, quarters of the busiest day. */
  thresholds?: readonly [number, number, number]
  /** 1: weeks start on Monday (default); 0: on Sunday. */
  weekStartsOn?: 0 | 1
  /** The chosen day, as YYYY-MM-DD: a ring marks it. */
  selectedDate?: string | null
  /** Makes the days choosable (click, Enter, Space). */
  onSelectDate?: (date: string) => void
  /** Controls beside the summary: a year switch. */
  actions?: ReactNode
  /** The busiest days' colour; the levels are tints of it. */
  color?: ChartColor
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: ActivityHeatmapLabels
}

type Model = {
  start: number
  length: number
  lead: number
  weeks: number
  total: number
  counts: number[]
  levels: number[]
  thresholds: readonly [number, number, number]
  months: { month: number; col: number; label: string }[]
  /** How many days sit at each level. */
  perLevel: number[]
}

type Tip = {
  index: number
  cell: HTMLElement
  anchor: { x: number; y: number }
  /** Moved by an arrow: it lands at once instead of gliding. */
  keyed: boolean
  direction: number
}

const DAY = 86_400_000
const LEVELS = [0, 1, 2, 3, 4] as const
/** The whole wave's travel in ms, under the stagger budget however many weeks. */
const WAVE = 420
const toUtc = (iso: string) => Date.parse(`${iso}T00:00:00Z`)
const toIso = (time: number) => new Date(time).toISOString().slice(0, 10)

function buildModel(
  days: readonly ActivityDay[],
  weekStartsOn: 0 | 1,
  thresholds: readonly [number, number, number] | undefined,
  monthName: Intl.DateTimeFormat,
): Model {
  const dates = days.map((day) => toUtc(day.date)).filter(Number.isFinite)
  const start = dates.length ? Math.min(...dates) : toUtc('2026-01-01')
  const length = dates.length
    ? Math.round((Math.max(...dates) - start) / DAY) + 1
    : 0
  const counts = Array.from({ length }, () => 0)
  for (const day of days) {
    const index = Math.round((toUtc(day.date) - start) / DAY)
    if (index >= 0 && index < length) {
      counts[index]! += Math.max(0, day.count)
    }
  }
  const max = counts.reduce((a, b) => Math.max(a, b), 0)
  const bounds =
    thresholds ??
    ([
      Math.max(1, Math.ceil(max * 0.25)),
      Math.max(2, Math.ceil(max * 0.5)),
      Math.max(3, Math.ceil(max * 0.75)),
    ] as const)
  const levels = counts.map((count) =>
    count <= 0
      ? 0
      : count <= bounds[0]
        ? 1
        : count <= bounds[1]
          ? 2
          : count <= bounds[2]
            ? 3
            : 4,
  )
  const lead = (new Date(start).getUTCDay() - weekStartsOn + 7) % 7
  const weeks = Math.ceil((lead + length) / 7)
  const months: Model['months'] = []
  for (let index = 0; index < length; index++) {
    const date = new Date(start + index * DAY)
    if (index === 0 || date.getUTCDate() === 1) {
      months.push({
        month: date.getUTCFullYear() * 12 + date.getUTCMonth(),
        col: Math.floor((lead + index) / 7),
        label: monthName.format(date),
      })
    }
  }
  // A partial first month keeps its name only when there is room before the next.
  if (months.length > 1 && months[1]!.col - months[0]!.col < 3) {
    months.shift()
  }
  const perLevel = [0, 0, 0, 0, 0]
  for (const level of levels) {
    perLevel[level]!++
  }
  return {
    start,
    length,
    lead,
    weeks,
    total: counts.reduce((a, b) => a + b, 0),
    counts,
    levels,
    thresholds: bounds,
    months,
    perLevel,
  }
}

const levelFill = [
  'bg-(--level-0)',
  'bg-(--level-1)',
  'bg-(--level-2)',
  'bg-(--level-3)',
  'bg-(--level-4)',
] as const
const swatchFill = [
  'before:bg-(--level-0)',
  'before:bg-(--level-1)',
  'before:bg-(--level-2)',
  'before:bg-(--level-3)',
  'before:bg-(--level-4)',
] as const

// How a day square moves. The wave's delay rides --delay, so a first
// reveal and a recolouring sweep the same diagonal.
const settled =
  '[transition:background-color_320ms_var(--ease-standard)_var(--delay),scale_var(--motion-spring)_var(--ease-spring)_var(--delay),opacity_var(--motion-fast)_var(--ease-standard)]'
const revealing =
  '[transition:background-color_320ms_var(--ease-standard)_var(--delay),scale_var(--motion-spring)_var(--ease-spring)_var(--delay),opacity_360ms_var(--ease-enter)_var(--delay)]'
const still =
  '[transition:background-color_var(--motion-fast)_var(--ease-standard),opacity_var(--motion-fast)_var(--ease-standard)]'

/**
 * One square per day, weeks as columns, tinted by how busy each day was,
 * after Arc UI's activity heatmap (https://uiarc.dev, MIT).
 *
 * **Use it for** a year's rhythm: booked days, events, requests per day,
 * when busy seasons and quiet weeks matter more than exact comparison.
 * **Not for** comparing periods precisely (`BarChart`) or a trend
 * (`LineChart`).
 *
 * **Where**: in a wide dashboard card; on a phone the grid scrolls
 * sideways and opens on the latest weeks.
 *
 * **States**: at rest, a day pointed at or focused (tooltip), a level
 * previewed or pinned from the scale (the other days step back), a chosen
 * day (ring), a new range (the grid recolours in a sweep).
 *
 * **Compose**: in a `Card`, with `actions` holding a year switch
 * (`Tabs`, `SelectField`).
 *
 * **Key props**: `days` (`date`, `count`), `label`, `period`, `unit`,
 * `thresholds`, `weekStartsOn` (1, Monday), `selectedDate` /
 * `onSelectDate`, `actions`, `color`, `labels` to change its words.
 *
 * **Motion**: the squares wave in once seen; one tooltip glides from day
 * to day; a new range recolours the grid in a sweep forward or back; the
 * total's digits roll. With reduced motion everything is immediate.
 *
 * **Accessibility**: a grid with one tab stop; arrows move by day (up,
 * down) and by week (left, right), Home / End go to the ends, Enter and
 * Space choose. Each day is named by its count and full date; the scale's
 * buttons highlight a level and say how many days it holds; the levels
 * are described in words.
 *
 * @summary A year of days as tinted squares, read day by day.
 */
function ActivityHeatmap({
  days,
  label,
  period,
  unit,
  thresholds,
  weekStartsOn = 1,
  selectedDate = null,
  onSelectDate,
  actions,
  color = 'chart-1',
  className,
  labels,
}: ActivityHeatmapProps) {
  const messages = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const id = useId()
  const locale = messages.intlLocale
  const nouns = unit ?? messages.heatmapUnit
  const formats = useMemo(
    () => ({
      long: new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }),
      short: new Intl.DateTimeFormat(locale, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }),
      weekday: new Intl.DateTimeFormat(locale, {
        weekday: 'short',
        timeZone: 'UTC',
      }),
      month: new Intl.DateTimeFormat(locale, {
        month: 'short',
        timeZone: 'UTC',
      }),
      number: new Intl.NumberFormat(locale),
      plural: new Intl.PluralRules(locale),
    }),
    [locale],
  )
  const noun = (count: number) =>
    formats.plural.select(count) === 'one' ? nouns.one : nouns.other
  const countText = (count: number) =>
    `${formats.number.format(count)} ${noun(count)}`

  // The model is made again only when the days or the levels change.
  const modelKey = `${weekStartsOn}|${locale}|${thresholds?.join(',') ?? ''}|${days.map((day) => `${day.date}:${day.count}`).join(';')}`
  const [built, setBuilt] = useState(() => ({
    key: modelKey,
    model: buildModel(days, weekStartsOn, thresholds, formats.month),
  }))
  if (built.key !== modelKey) {
    setBuilt({
      key: modelKey,
      model: buildModel(days, weekStartsOn, thresholds, formats.month),
    })
  }
  const model = built.model

  // A later range sweeps forward, an earlier one back.
  const [range, setRange] = useState({ start: model.start, direction: 1 })
  if (range.start !== model.start) {
    setRange({
      start: model.start,
      direction: model.start > range.start ? 1 : -1,
    })
  }

  const plot = useRef<HTMLDivElement>(null)
  const grid = useRef<HTMLDivElement | null>(null)
  const inView = useInView(plot, { once: true, amount: 0.35 })
  const [reveal, setReveal] = useState<'hidden' | 'revealing' | 'done'>(
    'hidden',
  )
  // The squares wave in a frame after they are seen, and settle after the wave.
  const wave = useCallback(
    (node: HTMLDivElement | null) => {
      grid.current = node
      if (!node) {
        return undefined
      }
      if (reveal === 'hidden' && (inView || reduce)) {
        const next = requestAnimationFrame(() =>
          setReveal(reduce ? 'done' : 'revealing'),
        )
        return () => cancelAnimationFrame(next)
      }
      if (reveal === 'revealing') {
        const timer = setTimeout(() => setReveal('done'), WAVE + 700)
        return () => clearTimeout(timer)
      }
      return undefined
    },
    [inView, reduce, reveal],
  )

  const selectedIndex = selectedDate
    ? Math.round((toUtc(selectedDate) - model.start) / DAY)
    : -1
  const hasSelection = selectedIndex >= 0 && selectedIndex < model.length
  const [focusIndex, setFocusIndex] = useState<number | null>(null)
  const tabDay =
    focusIndex !== null && focusIndex < model.length
      ? focusIndex
      : hasSelection
        ? selectedIndex
        : model.length - 1

  // The scale: pointing at or focusing a level previews it on the grid,
  // a press pins it; the caption says how many days it holds.
  const [preview, setPreview] = useState<number | null>(null)
  const [pinned, setPinned] = useState<number | null>(null)
  const [scaleFocus, setScaleFocus] = useState(0)
  const previewTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const highlight = preview ?? pinned
  const previewLevel = (level: number | null) => {
    clearTimeout(previewTimer.current)
    if (level !== null) {
      setPreview(level)
    } else {
      previewTimer.current = setTimeout(() => setPreview(null), 90)
    }
  }

  // The levels in words: « 0 activité », « 1 à 3 activités »…
  const [a, b, c] = model.thresholds
  const between = (from: number, to: number) =>
    from >= to
      ? countText(to)
      : `${messages.chartRange(formats.number.format(from), formats.number.format(to))} ${nouns.other}`
  const ranges = [
    countText(0),
    between(1, a),
    between(a + 1, b),
    between(b + 1, c),
    messages.chartOrMore(countText(c + 1)),
  ]
  const dayCount =
    highlight === null
      ? ''
      : messages.heatmapDays(
          model.perLevel[highlight]!,
          formats.number.format(model.perLevel[highlight]!),
        )
  const caption =
    highlight === null
      ? ''
      : messages.heatmapDaysWith(dayCount, ranges[highlight]!)

  // One tooltip for the whole grid, anchored on its day.
  const root = useRef<HTMLDivElement | null>(null)
  const [bounds, setBounds] = useState({ width: 0, height: 0 })
  const measure = useCallback((node: HTMLDivElement | null) => {
    root.current = node
    if (!node || typeof ResizeObserver === 'undefined') {
      return undefined
    }
    const observer = new ResizeObserver(() =>
      setBounds((before) =>
        before.width === node.offsetWidth && before.height === node.offsetHeight
          ? before
          : { width: node.offsetWidth, height: node.offsetHeight },
      ),
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  const [tip, setTip] = useState<Tip | null>(null)
  const [open, setOpen] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  // The middle of a day's top edge, in the heatmap's px.
  const anchorOf = (cell: HTMLElement) => {
    const box = root.current?.getBoundingClientRect()
    const rect = cell.getBoundingClientRect()
    return {
      x: rect.left - (box?.left ?? 0) + rect.width / 2,
      y: rect.top - (box?.top ?? 0),
    }
  }
  const show = (index: number, cell: HTMLElement, keyed: boolean) => {
    clearTimeout(hideTimer.current)
    setTip({
      index,
      cell,
      anchor: anchorOf(cell),
      keyed,
      direction:
        tip && open
          ? Math.sign(model.counts[index]! - model.counts[tip.index]!) || 1
          : 1,
    })
    setOpen(true)
  }
  const hideSoon = (delay = 110) => {
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setOpen(false), delay)
  }

  const dayOf = (element: Element | null) => {
    const cell = element?.closest<HTMLElement>('[data-index]')
    return cell && grid.current?.contains(cell)
      ? { cell, index: Number(cell.dataset.index) }
      : null
  }
  const focusDay = (index: number) =>
    grid.current?.querySelector<HTMLElement>(`[data-index="${index}"]`)?.focus()
  const dateOf = (index: number) => toIso(model.start + index * DAY)

  const onGridPointerOver = (event: PointerEvent<HTMLDivElement>) => {
    const hit = dayOf(event.target as Element)
    if (hit) {
      show(hit.index, hit.cell, false)
    }
  }
  const onGridPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    // A keyboard user keeps the tooltip on the focused day; a tap leaves
    // it long enough to read.
    const focused = dayOf(document.activeElement)
    if (focused?.cell.matches(':focus-visible')) {
      show(focused.index, focused.cell, true)
    } else {
      hideSoon(event.pointerType === 'touch' ? 2400 : 110)
    }
  }
  const onGridFocus = (event: FocusEvent<HTMLDivElement>) => {
    const hit = dayOf(event.target)
    if (hit) {
      setFocusIndex(hit.index)
      show(hit.index, hit.cell, true)
    }
  }
  const onGridBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!grid.current?.contains(event.relatedTarget as Node | null)) {
      hideSoon(0)
    }
  }
  const onDayKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const hit = dayOf(event.target as Element)
    if (!hit) {
      return
    }
    const moves: Record<string, number> = {
      ArrowUp: hit.index - 1,
      ArrowDown: hit.index + 1,
      ArrowLeft: hit.index - 7,
      ArrowRight: hit.index + 7,
      Home: 0,
      End: model.length - 1,
    }
    if (event.key in moves) {
      event.preventDefault()
      focusDay(Math.min(Math.max(moves[event.key]!, 0), model.length - 1))
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (onSelectDate) {
        event.preventDefault()
        onSelectDate(dateOf(hit.index))
      }
    } else if (event.key === 'Escape' && open) {
      event.preventDefault()
      setOpen(false)
    }
  }
  const onScaleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      previewLevel(null)
      return
    }
    const moves: Record<string, number> = {
      ArrowLeft: scaleFocus - 1,
      ArrowRight: scaleFocus + 1,
      Home: 0,
      End: 4,
    }
    if (!(event.key in moves)) {
      return
    }
    event.preventDefault()
    const next = Math.min(Math.max(moves[event.key]!, 0), 4)
    root.current
      ?.querySelector<HTMLElement>(`[data-level-key="${next}"]`)
      ?.focus()
  }

  const maxDiagonal = Math.max(1, model.weeks - 1 + 6)
  const step = Math.min(12, WAVE / maxDiagonal)
  const motionClass = reduce
    ? still
    : reveal === 'revealing'
      ? revealing
      : settled
  const rows = Array.from({ length: 7 }, (_, row) => (
    <div key={row} role="row" className="flex gap-(--gap)">
      {Array.from({ length: model.weeks }, (_, col) => {
        const index = col * 7 + row - model.lead
        const diagonal =
          range.direction < 0 ? maxDiagonal - col - row : col + row
        const style = {
          '--delay': `${Math.round(diagonal * step)}ms`,
        } as CSSProperties
        if (index < 0 || index >= model.length) {
          return (
            <span
              key={col}
              aria-hidden="true"
              style={style}
              className={cn(
                'block size-(--cell) flex-none rounded-[calc(var(--cell)*.28)] bg-(--level-0)',
                motionClass,
                reduce ? 'opacity-0' : 'scale-0',
              )}
            />
          )
        }
        const count = model.counts[index]!
        const level = model.levels[index]!
        const date = new Date(model.start + index * DAY)
        return (
          <span
            key={col}
            role="gridcell"
            data-index={index}
            tabIndex={index === tabDay ? 0 : -1}
            aria-selected={onSelectDate ? index === selectedIndex : undefined}
            aria-label={`${countText(count)}, ${formats.long.format(date)}`}
            onClick={() => onSelectDate?.(toIso(date.getTime()))}
            onKeyDown={onDayKeyDown}
            style={style}
            className={cn(
              'block size-(--cell) flex-none cursor-default rounded-[calc(var(--cell)*.28)] outline-[1.5px] outline-offset-1 outline-transparent outline-solid',
              'focus-visible:outline-2 focus-visible:outline-focus pointer-fine:hover:outline-[color-mix(in_oklab,var(--fg)_45%,transparent)]',
              levelFill[level],
              // Before the wave, still and small; the wave's transition
              // arrives with the change, so the squares move into place.
              reveal === 'hidden'
                ? cn('opacity-0', !reduce && 'scale-50')
                : cn(
                    motionClass,
                    highlight !== null && level !== highlight && 'opacity-20',
                  ),
            )}
          />
        )
      })}
    </div>
  ))

  const weekdayLabels = Array.from({ length: 7 }, (_, row) => {
    const weekday = (row + weekStartsOn) % 7
    // 4 January 1970 was a Sunday: Monday, Wednesday and Friday are named.
    return weekday % 2 === 1
      ? formats.weekday.format(new Date((3 + weekday) * DAY))
      : ''
  })
  const selectedCol = hasSelection
    ? Math.floor((selectedIndex + model.lead) / 7)
    : 0
  const selectedRow = hasSelection ? (selectedIndex + model.lead) % 7 : 0
  const ringShown = hasSelection && reveal !== 'hidden'
  const summary = `${countText(model.total)} ${period}`
  const tipCount = tip ? model.counts[tip.index]! : 0

  return (
    <MotionScope>
      <div
        ref={measure}
        data-slot="activity-heatmap"
        style={
          {
            '--heat': chartColor(color),
            '--level-0': 'color-mix(in oklab, var(--fg) 6.5%, var(--surface))',
            '--level-1': 'color-mix(in oklab, var(--heat) 26%, var(--level-0))',
            '--level-2': 'color-mix(in oklab, var(--heat) 50%, var(--level-0))',
            '--level-3': 'color-mix(in oklab, var(--heat) 76%, var(--level-0))',
            '--level-4': 'var(--heat)',
          } as CSSProperties
        }
        className={cn(
          'relative grid min-w-0 gap-4 text-fg @container',
          className,
        )}
      >
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <p className="m-0 flex min-w-0 flex-wrap items-baseline gap-x-[.3em] text-sm text-fg-muted tabular-nums">
            <span
              aria-hidden="true"
              className="font-medium whitespace-nowrap text-fg"
            >
              <RollingNumber value={model.total} /> {noun(model.total)}
            </span>
            <span aria-hidden="true" className="whitespace-nowrap">
              <ChartSwap text={period} />
            </span>
            <span role="status" className="sr-only">
              {summary}
            </span>
          </p>
          {actions && (
            <div className="flex flex-none items-center">{actions}</div>
          )}
        </div>

        {/* The scroller opens on its right edge (the latest weeks) on a narrow screen, through its writing direction. */}
        <div
          // The tooltip stays on its day while a narrow grid scrolls.
          onScroll={() => {
            if (open && tip) {
              setTip({ ...tip, anchor: anchorOf(tip.cell), keyed: true })
            }
          }}
          className="-m-1.5 overflow-x-auto overflow-y-hidden overscroll-x-contain p-1.5 [direction:rtl] [scrollbar-width:thin]"
        >
          <div
            style={
              {
                '--gap': '3px',
                '--label': '30px',
                '--cell':
                  'clamp(9px, calc((100cqi - var(--label) - var(--gap) * 53) / 53), 15px)',
                '--step': 'calc(var(--cell) + var(--gap))',
              } as CSSProperties
            }
            className="grid w-max grid-cols-[var(--label)_auto] grid-rows-[auto_auto] gap-x-(--gap) gap-y-2 [direction:ltr]"
          >
            <div
              aria-hidden="true"
              className="relative col-start-2 row-start-1 h-4 text-xs/4 text-fg-subtle"
            >
              {model.months.map((month, order) => (
                <span
                  key={`${month.month % 12}-${model.months.findIndex((item) => item.month % 12 === month.month % 12) === order ? 0 : 1}`}
                  style={{ '--col': month.col } as CSSProperties}
                  className="absolute top-0 left-0 translate-x-[calc(var(--col)*var(--step))] whitespace-nowrap transition-transform duration-(--motion-spring) ease-spring motion-reduce:transition-none"
                >
                  {month.label}
                </span>
              ))}
            </div>
            {/* The weekdays stay pinned while a narrow grid scrolls under them. Set --heatmap-surface on another surface. */}
            <div
              aria-hidden="true"
              className="sticky left-[-6px] z-1 col-start-1 row-span-2 row-start-1 -ml-1.5 grid grid-rows-[repeat(7,var(--cell))] content-end gap-y-(--gap) bg-[var(--heatmap-surface,var(--surface))] pl-1.5 text-xs text-fg-subtle"
            >
              {weekdayLabels.map((text, row) => (
                <span
                  key={row}
                  className="flex h-(--cell) items-center leading-none whitespace-nowrap"
                >
                  {text}
                </span>
              ))}
            </div>
            <div ref={plot} className="relative col-start-2 row-start-2">
              <div
                ref={wave}
                role="grid"
                aria-label={label}
                aria-readonly="true"
                aria-describedby={`${id}-legend`}
                onPointerOver={onGridPointerOver}
                onPointerLeave={onGridPointerLeave}
                onFocus={onGridFocus}
                onBlur={onGridBlur}
                tabIndex={-1}
                className="grid gap-(--gap) outline-none"
              >
                {rows}
              </div>
              {/* The ring glides between chosen days; drawn anew when it appears, it fades in where it lands. */}
              <span
                key={ringShown ? 'shown' : 'hidden'}
                aria-hidden="true"
                style={
                  {
                    '--col': selectedCol,
                    '--row': selectedRow,
                  } as CSSProperties
                }
                className={cn(
                  'pointer-events-none absolute -top-[3px] -left-[3px] size-[calc(var(--cell)+6px)] translate-x-[calc(var(--col)*var(--step))] translate-y-[calc(var(--row)*var(--step))] rounded-[calc(var(--cell)*.28+3px)] border-[1.5px] border-fg transition-[translate,opacity] duration-(--motion-spring) ease-spring starting:opacity-0 motion-reduce:transition-opacity',
                  ringShown ? 'opacity-100' : 'opacity-0',
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-between gap-3 text-xs text-fg-subtle">
          <span id={`${id}-legend`} className="sr-only">
            {messages.heatmapLegend(ranges.join(', '))}
          </span>
          <span
            className="relative min-w-0 truncate text-fg-muted tabular-nums"
            aria-live="polite"
          >
            <span aria-hidden="true">
              <ChartSwap text={caption} className="@max-[440px]:hidden" />
              <ChartSwap
                text={dayCount}
                className="hidden @max-[440px]:block"
              />
            </span>
            <span className="sr-only">{caption}</span>
          </span>
          <span className="flex flex-none items-center gap-2">
            <span aria-hidden="true" className="leading-none">
              {messages.heatmapLess}
            </span>
            <div
              role="group"
              aria-label={messages.heatmapLevels}
              className="flex"
            >
              {LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  data-level-key={level}
                  tabIndex={level === scaleFocus ? 0 : -1}
                  aria-pressed={pinned === level}
                  aria-label={messages.heatmapHighlight(ranges[level]!)}
                  onClick={() =>
                    setPinned((now) => (now === level ? null : level))
                  }
                  onPointerEnter={() => previewLevel(level)}
                  onPointerLeave={() => previewLevel(null)}
                  onFocus={() => {
                    setScaleFocus(level)
                    previewLevel(level)
                  }}
                  onBlur={() => previewLevel(null)}
                  onKeyDown={onScaleKeyDown}
                  className={cn(
                    'grid h-5 w-[15px] cursor-pointer place-items-center rounded-sm before:size-[11px] before:rounded-[3px] before:content-[""] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus aria-pressed:shadow-[inset_0_0_0_1.5px_var(--fg)] max-md:h-11 max-md:w-6',
                    swatchFill[level],
                  )}
                />
              ))}
            </div>
            <span aria-hidden="true" className="leading-none">
              {messages.heatmapMore}
            </span>
          </span>
        </div>

        <ChartTooltip
          anchor={open && tip ? tip.anchor : null}
          bounds={bounds}
          placement={{ x: 'center', y: 'above', gap: 8 }}
          instant={tip?.keyed ?? false}
          className="min-w-0 gap-0 rounded-lg bg-inverse px-3 py-2 text-fg-inverse shadow-md ring-0"
        >
          <ChartSwap
            text={tip ? countText(tipCount) : ''}
            direction={tip?.direction ?? 1}
            className="text-sm font-medium whitespace-nowrap tabular-nums"
          />
          <ChartSwap
            text={
              tip
                ? formats.short.format(new Date(model.start + tip.index * DAY))
                : ''
            }
            direction={tip?.direction ?? 1}
            className="text-xs whitespace-nowrap opacity-70"
          />
        </ChartTooltip>
      </div>
    </MotionScope>
  )
}

export { ActivityHeatmap }
export type { ActivityDay, ActivityHeatmapProps, ActivityHeatmapLabels }
