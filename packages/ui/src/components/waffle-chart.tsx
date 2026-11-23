import { useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react'
import { motion, useInView } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { chartColor, seriesColor } from '../internal/chart-color.ts'
import type { ChartColor } from '../internal/chart-color.ts'
import { ChartDataTable } from '../internal/chart-data-table.tsx'
import { clamp } from '../internal/chart-scale.ts'
import { ChartTooltip } from '../internal/chart-tooltip.tsx'
import { duration, ease, spring } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { RollingShare } from '../internal/rolling-share.tsx'
import { useElementSize } from '../internal/use-element-size.ts'
import { cn } from '../lib/cn.ts'

export type WaffleCategory = {
  /** Stable identity: cells keep following their category when the data changes. */
  key: string
  /** Its name in the legend, the tooltip and the table. */
  label: string
  /** The raw amount; shares come from the total, negatives count as zero. */
  value: number
  /** Its colour; the palette's slots in order by default (`chart-1`…). */
  color?: ChartColor
}

export type WaffleChartProps = {
  /** The categories in fill order: the first fills from the bottom-left corner, column by column. */
  data: WaffleCategory[]
  /** What the whole is (« Dates de 2026 »): the chart's accessible name. */
  label: string
  /** After each raw value in the tooltip and the table (« dates »). */
  unit?: string
  formatValue?: (value: number, category: WaffleCategory) => string
  /** Rows × columns cells make the whole; 10 × 10 is one cell per percent. */
  rows?: number
  columns?: number
  /** The category in focus (controlled): the others step back. */
  activeKey?: string | null
  defaultActiveKey?: string | null
  onActiveChange?: (key: string | null) => void
  /** The list of categories, each with its share rolling to its new value. */
  legend?: boolean
  /** Decimals of the shares. */
  decimals?: number
  /** Shown when there is nothing to count; « Aucune donnée pour cette période » by default. */
  emptyLabel?: string
  className?: string
}

type Cell = { id: number; key: string | null; slot: number }
type Reading = { key: string; slot: number } | null

const GAP = 3
/** A colour-free second channel once the five palette slots come round again: square, round, framed. */
const SHAPES = ['square', 'round', 'framed'] as const

/** Whole cells per category by largest remainder, so the counts always add up to the grid. */
function allocate(data: WaffleCategory[], total: number, cells: number) {
  if (total <= 0) {
    return data.map(() => 0)
  }
  const exact = data.map((item) => (Math.max(0, item.value) / total) * cells)
  const counts = exact.map(Math.floor)
  let left = cells - counts.reduce((sum, count) => sum + count, 0)
  const order = exact
    .map((value, index) => ({ index, rest: value - Math.floor(value) }))
    .sort((a, b) => b.rest - a.rest)
  for (let k = 0; left > 0 && k < order.length; k++, left--) {
    counts[order[k].index]++
  }
  return counts
}

/**
 * Hands the cells to the categories while moving as few as possible: each
 * keeps the cells it had, the surplus joins the categories that grew, and
 * every block takes its cells in their former order so no paths cross.
 */
function reassign(previous: Cell[], data: WaffleCategory[], counts: number[]) {
  const bySlot = [...previous].sort((a, b) => a.slot - b.slot)
  const kept = new Map<string, Cell[]>()
  const pool: Cell[] = []
  const want = new Map(data.map((item, index) => [item.key, counts[index]]))
  for (const cell of bySlot) {
    const list = cell.key === null ? [] : (kept.get(cell.key) ?? [])
    if (cell.key !== null && list.length < (want.get(cell.key) ?? 0)) {
      list.push(cell)
      kept.set(cell.key, list)
    } else {
      pool.push(cell)
    }
  }
  const next: Cell[] = []
  let slot = 0
  data.forEach((item, index) => {
    const own = kept.get(item.key) ?? []
    while (own.length < counts[index] && pool.length) {
      own.push(pool.shift() as Cell)
    }
    own
      .sort((a, b) => a.slot - b.slot)
      .forEach((cell) =>
        next.push({ id: cell.id, key: item.key, slot: slot++ }),
      )
  })
  pool.forEach((cell) => next.push({ id: cell.id, key: null, slot: slot++ }))
  return next.sort((a, b) => a.id - b.id)
}

/**
 * A waffle chart, after Arc UI (https://uiarc.dev, MIT): a grid of cells
 * where each cell is one share of the whole, so the parts of a total read
 * as countable squares.
 *
 * **Use it for** one total split in a few parts (the year's dates by
 * status, the requests by origin). **Not for** a change over time
 * (`Streamgraph`, `BrushChart`), many small parts (`Treemap`), or exact
 * comparisons (a bar chart in `Chart`).
 *
 * **Where**: a dashboard card or a report, beside the figure it explains.
 *
 * **States**: filled, a category in focus (pointer, legend, keyboard or
 * `activeKey`), a cell read (crosshair ring and tooltip), empty.
 *
 * **Compose**: in a `Card`; the legend can be turned off when the card
 * already names the parts.
 *
 * **Key props**: `data` (key, label, value, color), `label`, `unit`,
 * `formatValue`, `rows` × `columns` (10 × 10), `activeKey` +
 * `onActiveChange`, `legend`, `decimals`.
 *
 * **Motion**: the cells fill in a wave from the bottom-left corner the
 * first time the chart is seen; new data moves cells from one category to
 * another (each dips in flight); the legend's shares count to their new
 * value. With reduced motion the final state is drawn at once.
 *
 * **Accessibility**: a named figure; the grid takes the focus, the arrows
 * walk the cells and Page Up / Page Down jump between categories, each
 * reading said in a live region; the legend's buttons pin a category
 * (`aria-pressed`); a hidden table gives every value.
 *
 * @summary A grid of cells showing the parts of a whole.
 */
export function WaffleChart({
  data,
  label,
  unit = '',
  formatValue,
  rows = 10,
  columns = 10,
  activeKey,
  defaultActiveKey = null,
  onActiveChange,
  legend = true,
  decimals = 0,
  emptyLabel,
  className,
}: WaffleChartProps) {
  const t = useGoGoUIMessages()
  const reduce = useReduceMotion()
  const figure = useRef<HTMLElement>(null)
  const inView = useInView(figure, { once: true, amount: 0.35 })
  const [board, boardRef] = useElementSize<HTMLDivElement>()
  const [grid, gridRef] = useElementSize<HTMLDivElement>()
  const count = Math.max(1, rows * columns)
  const total = data.reduce((sum, item) => sum + Math.max(0, item.value), 0)
  const empty = !data.length || total <= 0

  // Cells are kept from one dataset to the next: each change hands them
  // over, so they travel instead of repainting.
  const signature = `${count}|${data.map((item) => `${item.key}:${item.value}`).join(',')}`
  const counts = allocate(data, total, count)
  const [layout, setLayout] = useState(() => ({
    signature,
    cells: reassign(
      Array.from({ length: count }, (_, id) => ({ id, key: null, slot: id })),
      data,
      counts,
    ),
    moved: new Set<number>(),
    version: 0,
  }))
  if (layout.signature !== signature) {
    const base = Array.from(
      { length: count },
      (_, id) => layout.cells[id] ?? { id, key: null, slot: id },
    )
    const next = reassign(base, data, counts)
    setLayout({
      signature,
      cells: next,
      moved: new Set(
        next
          .filter(
            (cell) =>
              base[cell.id].slot !== cell.slot ||
              base[cell.id].key !== cell.key,
          )
          .map((cell) => cell.id),
      ),
      version: layout.version + 1,
    })
  }
  const { cells, moved, version } = layout

  const [ownActive, setOwnActive] = useState<string | null>(defaultActiveKey)
  const pinned = activeKey !== undefined ? activeKey : ownActive
  const setPinned = (key: string | null) => {
    if (activeKey === undefined) {
      setOwnActive(key)
    }
    onActiveChange?.(key)
  }
  const [reading, setReading] = useState<Reading>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const focusKey = reading?.key ?? preview ?? pinned
  const active =
    focusKey && data.some((item) => item.key === focusKey) ? focusKey : null
  // The tooltip keeps its last words while it fades out.
  const [heldKey, setHeldKey] = useState<string | null>(null)
  if (reading && reading.key !== heldKey) {
    setHeldKey(reading.key)
  }

  const side = grid?.width ?? 0
  const size = side ? (side - GAP * (columns - 1)) / columns : 0
  const height = size ? size * rows + GAP * (rows - 1) : 0
  // Column by column from the bottom-left corner, like a glass filling up.
  const place = (slot: number) => ({
    x: Math.floor(slot / rows) * (size + GAP),
    y: (rows - 1 - (slot % rows)) * (size + GAP),
  })
  const indexOf = (key: string | null) =>
    key === null ? -1 : data.findIndex((item) => item.key === key)
  const colorOf = (key: string | null) => {
    const item = data[indexOf(key)]
    if (!item) {
      return 'transparent'
    }
    return item.color ? chartColor(item.color) : seriesColor(indexOf(key))
  }
  const shapeOf = (key: string | null) => {
    const index = indexOf(key)
    return index < 5 ? 'square' : SHAPES[(index - 5) % SHAPES.length]
  }

  const slotAt = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    if (!size) {
      return null
    }
    const column = clamp(
      Math.floor((event.clientX - box.left) / (size + GAP)),
      0,
      columns - 1,
    )
    const row = clamp(
      Math.floor((event.clientY - box.top) / (size + GAP)),
      0,
      rows - 1,
    )
    return column * rows + (rows - 1 - row)
  }
  const readAt = (slot: number | null): Reading => {
    if (slot === null) {
      return null
    }
    const cell = cells.find((item) => item.slot === slot)
    return cell?.key ? { key: cell.key, slot } : null
  }
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' || event.buttons) {
      setReading(readAt(slotAt(event)))
    }
  }
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') {
      event.currentTarget.setPointerCapture?.(event.pointerId)
    }
    setReading(readAt(slotAt(event)))
  }

  // The arrows walk the grid cell by cell; Page keys jump between categories.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (empty) {
      return
    }
    if (event.key === 'Escape' && reading) {
      event.preventDefault()
      setReading(null)
      return
    }
    const filled = cells.filter((cell) => cell.key !== null).length
    const at = reading?.slot ?? 0
    const column = Math.floor(at / rows)
    const row = at % rows
    let start = 0
    const blocks = counts
      .map((size) => {
        const block = { start, size }
        start += size
        return block
      })
      .filter((block) => block.size > 0)
    const block = Math.max(
      0,
      blocks.findIndex(
        (item) => at >= item.start && at < item.start + item.size,
      ),
    )
    const moves: Record<string, () => number> = {
      ArrowUp: () => column * rows + Math.min(rows - 1, row + 1),
      ArrowDown: () => column * rows + Math.max(0, row - 1),
      ArrowRight: () => Math.min(columns - 1, column + 1) * rows + row,
      ArrowLeft: () => Math.max(0, column - 1) * rows + row,
      PageDown: () => blocks[Math.min(blocks.length - 1, block + 1)].start,
      PageUp: () =>
        at > blocks[block].start
          ? blocks[block].start
          : blocks[Math.max(0, block - 1)].start,
      Home: () => 0,
      End: () => filled - 1,
    }
    const move = moves[event.key]
    if (!move) {
      return
    }
    event.preventDefault()
    setReading(readAt(clamp(reading ? move() : 0, 0, Math.max(0, filled - 1))))
  }

  const number = new Intl.NumberFormat(t.intlLocale, {
    maximumFractionDigits: 1,
  })
  const percent = new Intl.NumberFormat(t.intlLocale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  const format = (value: number, item: WaffleCategory) =>
    `${formatValue ? formatValue(value, item) : number.format(value)}${unit ? ` ${unit}` : ''}`
  const share = (item: WaffleCategory) =>
    total > 0 ? (Math.max(0, item.value) / total) * 100 : 0
  const shareText = (item: WaffleCategory) => percent.format(share(item) / 100)
  const read = reading
    ? (data.find((item) => item.key === reading.key) ?? null)
    : null
  const held = data.find((item) => item.key === heldKey) ?? null
  const announce = read
    ? `${read.label}, ${shareText(read)}, ${format(read.value, read)}`
    : ''
  const summary = empty
    ? `${label}. ${emptyLabel ?? t.chartNoData}.`
    : `${label}. ${data.map((item) => `${item.label} ${shareText(item)}`).join(', ')}.`
  const shown = inView || reduce
  const settle = reduce ? { duration: 0 } : spring.morph
  const gridLeft = ((board?.width ?? side) - side) / 2
  const anchor =
    reading && size
      ? {
          x: gridLeft + place(reading.slot).x + size / 2,
          y: place(reading.slot).y,
          height: size,
        }
      : null

  return (
    <MotionScope>
      <figure
        ref={figure}
        aria-label={label}
        className={cn('@container relative m-0 min-w-0 text-fg', className)}
      >
        <div
          className={cn(
            'grid min-w-0 grid-cols-1 items-center gap-6',
            legend && '@[420px]:grid-cols-[minmax(0,14.5rem)_minmax(0,1fr)]',
          )}
        >
          <div ref={boardRef} className="relative min-w-0">
            {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- the plot is explored with the arrows; each reading is said in a live region */}
            <div
              ref={gridRef}
              role="group"
              tabIndex={empty ? -1 : 0}
              aria-roledescription={t.waffleRole}
              aria-label={`${label}. ${t.waffleKeys(count)}`}
              data-active={active ? '' : undefined}
              style={{
                height: height || undefined,
                aspectRatio: height ? undefined : `${columns} / ${rows}`,
              }}
              className="group/waffle relative mx-auto w-full max-w-75 touch-pan-y rounded-md outline-none select-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus"
              onPointerMove={onPointerMove}
              onPointerDown={onPointerDown}
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
                  setReading((current) => current ?? readAt(0))
                }
              }}
            >
              {size > 0 &&
                cells.map((cell) => {
                  const { x, y } = place(cell.slot)
                  const travel = moved.has(cell.id) && !reduce
                  const delay = reduce ? 0 : (cell.slot / count) * 0.32
                  // A cell in flight dips, so the flow reads as cells lifting
                  // out of one block and landing in another.
                  const dip = travel ? [1, 0.62 + (version % 2) * 0.001, 1] : 1
                  return (
                    <motion.span
                      key={cell.id}
                      aria-hidden="true"
                      data-on={
                        cell.key !== null && cell.key === active
                          ? ''
                          : undefined
                      }
                      data-cursor={reading?.slot === cell.slot ? '' : undefined}
                      data-shape={shapeOf(cell.key)}
                      style={
                        {
                          width: size,
                          height: size,
                          '--cell': colorOf(cell.key),
                          '--delay': `${delay}s`,
                        } as CSSProperties
                      }
                      className={cn(
                        'absolute top-0 left-0 rounded-[22%] bg-(--cell) will-change-transform',
                        '[--inner:0_0_0_0_transparent] [--outer:0_0_0_0_transparent] [box-shadow:var(--inner),var(--outer)]',
                        'data-[shape=framed]:[--inner:inset_0_0_0_2.5px_var(--cell),inset_0_0_0_3.25px_var(--surface)] data-[shape=round]:rounded-full',
                        'data-cursor:[--outer:0_0_0_2px_var(--surface),0_0_0_3.5px_color-mix(in_oklab,var(--fg)_55%,transparent)]',
                        '[transition:background-color_var(--motion-considered)_var(--ease-standard)_var(--delay),border-radius_var(--motion-considered)_var(--ease-standard)_var(--delay),box-shadow_var(--motion-considered)_var(--ease-standard)_var(--delay),opacity_var(--motion-fast)_var(--ease-standard)]',
                        'group-data-active/waffle:not-data-on:opacity-26!',
                        reduce && 'transition-none!',
                      )}
                      initial={
                        reduce ? false : { x, y, scale: 0.4, opacity: 0 }
                      }
                      animate={
                        shown
                          ? {
                              x,
                              y,
                              scale: dip,
                              opacity: cell.key === null ? 0 : 1,
                            }
                          : { x, y, scale: 0.4, opacity: 0 }
                      }
                      transition={
                        reduce
                          ? { duration: 0 }
                          : {
                              x: { ...settle, delay },
                              y: { ...settle, delay },
                              scale: travel
                                ? {
                                    duration: 0.62,
                                    times: [0, 0.42, 1],
                                    ease: ease.inOut,
                                    delay,
                                  }
                                : { ...spring.snappy, delay: delay * 0.6 },
                              opacity: {
                                duration: duration.standard,
                                ease: ease.standard,
                                delay: delay * 0.6,
                              },
                            }
                      }
                    />
                  )
                })}
            </div>
            {!empty && (
              <ChartTooltip
                anchor={anchor}
                bounds={{
                  width: board?.width ?? 0,
                  height: board?.height ?? 0,
                }}
                placement={{ x: 'center', y: 'above', gap: 10 }}
                className="min-w-38"
              >
                <p className="m-0 flex min-w-0 items-center gap-2 leading-tight">
                  <span
                    data-shape={shapeOf(held?.key ?? null)}
                    style={
                      { '--cell': colorOf(held?.key ?? null) } as CSSProperties
                    }
                    className="size-2.5 flex-none rounded-[3px] bg-(--cell) data-[shape=framed]:shadow-[inset_0_0_0_2px_var(--cell),inset_0_0_0_3px_var(--surface)] data-[shape=round]:rounded-full"
                  />
                  <span className="min-w-0 flex-1 truncate text-fg-muted">
                    {held?.label}
                  </span>
                  <span className="ml-2 flex-none font-medium tabular-nums">
                    {held ? shareText(held) : ''}
                  </span>
                </p>
                <p className="m-0 ml-4.5 text-xs whitespace-nowrap text-fg-subtle tabular-nums">
                  {held ? format(held.value, held) : ''}
                </p>
              </ChartTooltip>
            )}
            {empty && (
              <p className="m-0 grid min-h-40 place-items-center text-sm text-fg-subtle">
                {emptyLabel ?? t.chartNoData}
              </p>
            )}
          </div>
          {legend && !empty && (
            <ul
              aria-label={t.chartCategories(label)}
              className="m-0 grid min-w-0 list-none grid-cols-1 gap-0.5 p-0"
              onPointerLeave={() => setPreview(null)}
            >
              {data.map((item) => (
                <li key={item.key}>
                  <button
                    type="button"
                    aria-pressed={pinned === item.key}
                    data-on={active === item.key ? '' : undefined}
                    data-dim={
                      active !== null && active !== item.key ? '' : undefined
                    }
                    className="grid min-h-9 w-full cursor-pointer grid-cols-[0.625rem_minmax(0,1fr)_auto] items-center gap-2.5 rounded-xl border-0 bg-transparent px-2.5 py-1 text-left text-sm text-fg-muted transition-[color,background-color,opacity,scale] duration-150 ease-standard outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus active:scale-[0.98] aria-pressed:text-fg data-dim:opacity-50 data-on:bg-hover data-on:text-fg motion-reduce:transition-none"
                    onClick={() =>
                      setPinned(pinned === item.key ? null : item.key)
                    }
                    onPointerEnter={(event) => {
                      if (event.pointerType === 'mouse') {
                        setPreview(item.key)
                      }
                    }}
                    onFocus={(event) => {
                      if (event.currentTarget.matches(':focus-visible')) {
                        setPreview(item.key)
                      }
                    }}
                    onBlur={() => setPreview(null)}
                  >
                    <span
                      aria-hidden="true"
                      data-shape={shapeOf(item.key)}
                      style={{ '--cell': colorOf(item.key) } as CSSProperties}
                      className="size-2.5 rounded-[3px] bg-(--cell) data-[shape=framed]:shadow-[inset_0_0_0_2px_var(--cell),inset_0_0_0_3px_var(--surface)] data-[shape=round]:rounded-full"
                    />
                    <span className="min-w-0 truncate">{item.label}</span>
                    <span className="min-w-[3.2em] text-right text-base font-medium text-fg tabular-nums">
                      <RollingShare
                        value={share(item)}
                        locale={t.intlLocale}
                        decimals={decimals}
                      />
                      <span className="sr-only">{shareText(item)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {announce}
        </p>
        <p className="sr-only">{summary}</p>
        {!empty && (
          <ChartDataTable
            caption={label}
            head={[t.chartCategory, t.chartValue, t.chartShare, t.waffleCells]}
            rows={data.map((item, index) => ({
              key: item.key,
              cells: [
                item.label,
                format(item.value, item),
                shareText(item),
                String(counts[index]),
              ],
            }))}
          />
        )}
      </figure>
    </MotionScope>
  )
}
