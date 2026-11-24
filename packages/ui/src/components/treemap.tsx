import { useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react'
import { AnimatePresence, motion, useInView } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { seriesColor } from '../internal/chart-color.ts'
import { ChartDataTable } from '../internal/chart-data-table.tsx'
import { chartReveal, physicalSpring } from '../internal/chart-motion.ts'
import { clamp } from '../internal/chart-scale.ts'
import { ChartSwap } from '../internal/chart-swap.tsx'
import { ChartTooltip } from '../internal/chart-tooltip.tsx'
import { blur, duration, ease, spring } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { useElementSize } from '../internal/use-element-size.ts'
import { cn } from '../lib/cn.ts'

export type TreemapNode = {
  /** Stable identity, unique in the tree: a tile that survives a data change morphs to its new size. */
  id: string
  label: string
  /** A leaf's size; a branch's size is the sum of its children. */
  value?: number
  /** A second measure for the shade (« Évolution »); a branch takes its children's mean, weighted by size. */
  measure?: number
  children?: TreemapNode[]
}

export type TreemapProps = {
  /** The root; its label names the whole in the first crumb. */
  data: TreemapNode
  /** What the whole is (« Chiffre d'affaires 2026 »): the chart's accessible name. */
  label: string
  formatValue?: (value: number) => string
  /** Names the shading measure in the tooltip and the scale (« Évolution »): tiles take their top branch's hue and deepen with it. Leave it out for one shade. */
  measureLabel?: string
  formatMeasure?: (value: number) => string
  /** The measure's range; the leaves' range by default. */
  measureDomain?: [number, number]
  /** The node that fills the view (controlled). */
  focus?: string
  defaultFocus?: string
  onFocusChange?: (id: string) => void
  /** The tiles' height in px. */
  height?: number
  /** Shown when the whole is zero; « Aucune donnée pour cette période » by default. */
  emptyLabel?: string
  className?: string
}

type Rect = { x: number; y: number; w: number; h: number }
type Flat = {
  id: string
  label: string
  value: number
  measure: number | null
  depth: number
  parent: string | null
  children: string[]
  path: string[]
}
type Carry = ((rect: Rect) => Rect) | null

// The zoom keeps a longer spring than interface motion so the change of
// level reads; it settles without overshoot.
const zoomSpring = physicalSpring(0.62)
const GAP = 2
const PAD = 3
const HEADER = 22
const STEPS = 5

/** Top branches take the palette in order; a sixth and beyond stay neutral rather than reuse a hue. */
const hueOf = (index: number) =>
  index < 0 ? seriesColor(0) : index < 5 ? seriesColor(index) : 'var(--fg)'
const inset = (rect: Rect, top: number, side: number): Rect => ({
  x: rect.x + side,
  y: rect.y + top,
  w: Math.max(0, rect.w - side * 2),
  h: Math.max(0, rect.h - top - side),
})
/** The map that carries rect `from` onto rect `to`, applied to `rect`. */
const carry = (rect: Rect, from: Rect, to: Rect): Rect => {
  const sx = to.w / (from.w || 1)
  const sy = to.h / (from.h || 1)
  return {
    x: to.x + (rect.x - from.x) * sx,
    y: to.y + (rect.y - from.y) * sy,
    w: rect.w * sx,
    h: rect.h * sy,
  }
}
const box = (rect: Rect) => ({
  x: rect.x,
  y: rect.y,
  width: rect.w,
  height: rect.h,
})

function flatten(root: TreemapNode) {
  const flat = new Map<string, Flat>()
  const visit = (
    node: TreemapNode,
    depth: number,
    parent: string | null,
    path: string[],
  ): { value: number; weighted: number; measured: number } => {
    const kids = node.children ?? []
    let value = 0
    let weighted = 0
    let measured = 0
    if (kids.length) {
      for (const kid of kids) {
        const sum = visit(
          kid,
          depth + 1,
          node.id,
          depth === 0 ? [] : [...path, node.label],
        )
        value += sum.value
        weighted += sum.weighted
        measured += sum.measured
      }
    } else {
      value = Math.max(0, node.value ?? 0)
      if (node.measure !== undefined && Number.isFinite(node.measure)) {
        weighted = node.measure * value
        measured = value
      }
    }
    flat.set(node.id, {
      id: node.id,
      label: node.label,
      value,
      measure: measured ? weighted / measured : null,
      depth,
      parent,
      children: kids.map((kid) => kid.id),
      path: depth === 0 ? [node.label] : [...path, node.label],
    })
    return { value, weighted, measured }
  }
  visit(root, 0, null, [])
  return flat
}

/** Squarified layout: rows of tiles along the short side, each row closed when one more tile would worsen its worst aspect ratio. */
function squarify(
  items: { id: string; value: number }[],
  rect: Rect,
  out: Map<string, Rect>,
) {
  const list = items
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
  const total = list.reduce((sum, item) => sum + item.value, 0)
  if (!total || rect.w <= 0 || rect.h <= 0) {
    for (const item of items) {
      out.set(item.id, { x: rect.x, y: rect.y, w: 0, h: 0 })
    }
    return
  }
  const scale = (rect.w * rect.h) / total
  let { x, y, w, h } = rect
  let i = 0
  const worst = (row: number[], side: number) => {
    const sum = row.reduce((a, b) => a + b, 0)
    const max = Math.max(...row)
    const min = Math.min(...row)
    return Math.max(
      (side * side * max) / (sum * sum),
      (sum * sum) / (side * side * min),
    )
  }
  while (i < list.length) {
    const side = Math.min(w, h)
    const row: number[] = [list[i].value * scale]
    let j = i + 1
    while (j < list.length) {
      const next = [...row, list[j].value * scale]
      if (worst(next, side) > worst(row, side)) {
        break
      }
      row.push(list[j].value * scale)
      j++
    }
    const sum = row.reduce((a, b) => a + b, 0)
    if (w >= h) {
      const cw = sum / h
      let cy = y
      for (let k = i; k < j; k++) {
        const th = (list[k].value * scale) / cw
        out.set(list[k].id, { x, y: cy, w: cw, h: th })
        cy += th
      }
      x += cw
      w -= cw
    } else {
      const rh = sum / w
      let cx = x
      for (let k = i; k < j; k++) {
        const tw = (list[k].value * scale) / rh
        out.set(list[k].id, { x: cx, y, w: tw, h: rh })
        cx += tw
      }
      y += rh
      h -= rh
    }
    i = j
  }
  for (const item of items) {
    if (!out.has(item.id)) {
      out.set(item.id, { x: rect.x, y: rect.y, w: 0, h: 0 })
    }
  }
}

/** Every descendant's rect when `focus` fills the view: its children fill it, each branch holds its own children under a header. */
function layoutFrom(flat: Map<string, Flat>, focus: string, view: Rect) {
  const out = new Map<string, Rect>()
  const nest = (id: string, rect: Rect, top: boolean) => {
    const node = flat.get(id)
    if (!node?.children.length) {
      return
    }
    const room = top
      ? rect
      : inset(rect, rect.h > 48 && rect.w > 64 ? HEADER : PAD, PAD)
    const placed = new Map<string, Rect>()
    squarify(
      node.children.map((child) => ({
        id: child,
        value: flat.get(child)?.value ?? 0,
      })),
      room,
      placed,
    )
    for (const [child, r] of placed) {
      const gapped = {
        x: r.x + GAP / 2,
        y: r.y + GAP / 2,
        w: Math.max(0, r.w - GAP),
        h: Math.max(0, r.h - GAP),
      }
      out.set(child, gapped)
      nest(child, gapped, false)
    }
  }
  nest(focus, view, true)
  return out
}

/**
 * A treemap, after Arc UI (https://uiarc.dev, MIT): a hierarchy of parts
 * as nested tiles sized by value, with a zoom into any branch.
 *
 * **Use it for** a whole split in parts and sub-parts when sizes matter
 * more than exact comparisons (the year's revenue by space then by event
 * type, the costs by supplier then by line). **Not for** one level of a
 * few parts (`WaffleChart`, a donut in `Chart`), or values to compare
 * exactly (a bar chart).
 *
 * **Where**: a report or a dashboard, full width.
 *
 * **States**: the whole, a branch zoomed in (breadcrumb, total), a tile
 * read (pointer or keyboard) with its tooltip and its branch's tiles in
 * front, empty.
 *
 * **Compose**: in a `Card`; `focus` + `onFocusChange` to drive the zoom
 * from outside.
 *
 * **Key props**: `data` (id, label, value, measure, children), `label`,
 * `formatValue`, `measureLabel` + `formatMeasure` + `measureDomain`,
 * `focus` + `onFocusChange`, `height`.
 *
 * **Motion**: the tiles grow in a wave from the largest the first time
 * they are seen; a zoom carries the chosen tile out to fill the view (or
 * back into its place) while the others ride the same move; the crumbs
 * and the total swap; the tooltip glides. With reduced motion the final
 * state is drawn at once.
 *
 * **Accessibility**: a named figure; the tiles take the focus as one
 * group: arrows go to the nearest tile that way, Enter zooms in, Escape
 * or Backspace zooms out, each tile said in a live region; the breadcrumb
 * is a `nav` with its buttons; a hidden table gives every node's value
 * and share.
 *
 * @summary Nested tiles sized by value, with a zoom into each branch.
 */
export function Treemap({
  data,
  label,
  formatValue,
  measureLabel,
  formatMeasure,
  measureDomain,
  focus,
  defaultFocus,
  onFocusChange,
  height = 420,
  emptyLabel,
  className,
}: TreemapProps) {
  const t = useGoGoUIMessages()
  const reduce = useReduceMotion()
  const figure = useRef<HTMLElement>(null)
  const inView = useInView(figure, { once: true, amount: 0.25 })
  const [stage, stageRef] = useElementSize<HTMLDivElement>()
  const width = stage?.width ?? 0
  const number = new Intl.NumberFormat(t.intlLocale, {
    maximumFractionDigits: 1,
  })
  const percent = new Intl.NumberFormat(t.intlLocale, {
    style: 'percent',
    maximumFractionDigits: 1,
  })
  const valueText = (value: number) =>
    formatValue ? formatValue(value) : number.format(value)
  const measureText = (value: number) =>
    formatMeasure ? formatMeasure(value) : number.format(value)

  const flat = useMemo(() => flatten(data), [data])
  const root = flat.get(data.id) as Flat
  const nodes = useMemo(
    () => [...flat.values()].filter((node) => node.depth > 0),
    [flat],
  )
  const [ownFocus, setOwnFocus] = useState(defaultFocus ?? data.id)
  const wanted = flat.get(focus ?? ownFocus)
  const center = wanted && wanted.children.length ? wanted : root
  const zoomTo = (id: string) => {
    if (focus === undefined) {
      setOwnFocus(id)
    }
    onFocusChange?.(id)
  }
  const [active, setActive] = useState<string | null>(null)
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null)

  const target = useMemo(
    () => layoutFrom(flat, center.id, { x: 0, y: 0, w: width, h: height }),
    [flat, center.id, width, height],
  )
  const isUnder = (id: string, ancestor: string) => {
    for (
      let at: Flat | undefined = flat.get(id);
      at;
      at = at.parent ? flat.get(at.parent) : undefined
    ) {
      if (at.id === ancestor) {
        return true
      }
    }
    return false
  }

  // The zoom's pivot: the tile that grows to fill the view, or the view
  // that shrinks back into its tile. Kept from the last zoom so new tiles
  // enter from where they were, and leaving ones go where they will be.
  const [zoom, setZoom] = useState<{
    id: string
    layout: Map<string, Rect>
    toOld: Carry
    toNew: Carry
  }>({ id: center.id, layout: target, toOld: null, toNew: null })
  if (zoom.id !== center.id) {
    const view = { x: 0, y: 0, w: width, h: height }
    let toOld: Carry = null
    let toNew: Carry = null
    if (isUnder(center.id, zoom.id)) {
      const inOld = zoom.layout.get(center.id)
      if (inOld) {
        toOld = (rect) => carry(rect, view, inOld)
        toNew = (rect) => carry(rect, inOld, view)
      }
    } else if (isUnder(zoom.id, center.id)) {
      const inNew = target.get(zoom.id)
      if (inNew) {
        toOld = (rect) => carry(rect, inNew, view)
        toNew = (rect) => carry(rect, view, inNew)
      }
    }
    setZoom({ id: center.id, layout: target, toOld, toNew })
  } else if (zoom.layout !== target) {
    setZoom({ ...zoom, layout: target })
  }

  const levelOf = (node: Flat) => node.depth - center.depth
  const visibleNodes = nodes.filter((node) => {
    const level = levelOf(node)
    const rect = target.get(node.id)
    return (
      level >= 1 &&
      level <= 2 &&
      rect &&
      rect.w >= 0.5 &&
      rect.h >= 0.5 &&
      isUnder(node.id, center.id)
    )
  })

  // The shade: a few steps from light to deep, so more reads without a new hue.
  const leaves = nodes.filter(
    (node) => !node.children.length && node.measure !== null,
  )
  const [lo, hi] =
    measureDomain ??
    (leaves.length
      ? [
          Math.min(...leaves.map((node) => node.measure as number)),
          Math.max(...leaves.map((node) => node.measure as number)),
        ]
      : [0, 1])
  const shaded = measureLabel !== undefined && leaves.length > 0
  const shade = (value: number | null) => {
    if (!shaded || value === null) {
      return 34
    }
    const share = clamp((value - lo) / (hi - lo || 1), 0, 1)
    return Math.round(14 + (Math.round(share * (STEPS - 1)) / (STEPS - 1)) * 44)
  }
  const branchOf = useMemo(() => {
    const map = new Map<string, number>()
    root.children.forEach((id, index) => {
      const walk = (at: string) => {
        map.set(at, index)
        flat.get(at)?.children.forEach(walk)
      }
      walk(id)
    })
    return map
  }, [flat, root])

  const activeNode = active ? (flat.get(active) ?? null) : null
  const parentOf = (node: Flat) =>
    node.parent ? (flat.get(node.parent) ?? node) : node
  const share = (node: Flat, of: Flat) => (of.value ? node.value / of.value : 0)
  // The tooltip keeps its last tile while it fades out.
  const [heldId, setHeldId] = useState<string | null>(null)
  if (active && active !== heldId) {
    setHeldId(active)
  }
  const held = heldId ? (flat.get(heldId) ?? null) : null

  // The keyboard: arrows hop to the nearest top tile that way, Enter zooms
  // in, Escape zooms out.
  const topTiles = center.children
    .map((id) => flat.get(id))
    .filter((node): node is Flat => !!node && node.value > 0)
  const topOf = (node: Flat | null) => {
    let at = node
    while (at && at.parent && at.parent !== center.id) {
      at = flat.get(at.parent) ?? null
    }
    return at && at.parent === center.id ? at : null
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = topOf(activeNode)
    const directions: Record<string, [number, number]> = {
      ArrowRight: [1, 0],
      ArrowLeft: [-1, 0],
      ArrowDown: [0, 1],
      ArrowUp: [0, -1],
    }
    if (event.key in directions) {
      event.preventDefault()
      setPointer(null)
      if (!current) {
        setActive(topTiles[0]?.id ?? null)
        return
      }
      const [dx, dy] = directions[event.key]
      const from = target.get(current.id) as Rect
      const ox = from.x + from.w / 2
      const oy = from.y + from.h / 2
      let best: Flat | null = null
      let score = Infinity
      for (const node of topTiles) {
        const rect = target.get(node.id)
        if (node.id === current.id || !rect) {
          continue
        }
        const vx = rect.x + rect.w / 2 - ox
        const vy = rect.y + rect.h / 2 - oy
        const along = vx * dx + vy * dy
        const across = Math.abs(vx * dy - vy * dx)
        if (along <= 1) {
          continue
        }
        if (along + across * 1.5 < score) {
          score = along + across * 1.5
          best = node
        }
      }
      if (best) {
        setActive(best.id)
      }
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      setPointer(null)
      setActive(
        (event.key === 'Home' ? topTiles[0] : topTiles[topTiles.length - 1])
          ?.id ?? null,
      )
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (current?.children.length) {
        event.preventDefault()
        zoomTo(current.id)
        setActive(current.children[0])
      }
    } else if (event.key === 'Escape' || event.key === 'Backspace') {
      if (center.parent) {
        event.preventDefault()
        zoomTo(center.parent)
        setActive(center.id)
      } else if (active) {
        event.preventDefault()
        setActive(null)
      }
    }
  }
  const onTilePointer = (event: PointerEvent<HTMLDivElement>, id: string) => {
    event.stopPropagation()
    if (event.pointerType !== 'mouse') {
      return
    }
    const frame = event.currentTarget.offsetParent?.getBoundingClientRect()
    if (frame) {
      setPointer({
        x: event.clientX - frame.left,
        y: event.clientY - frame.top,
      })
    }
    setActive(id)
  }
  const onTileClick = (node: Flat) => {
    const top = topOf(node)
    if (top?.children.length) {
      zoomTo(top.id)
    } else if (activeNode?.id !== node.id) {
      setActive(node.id)
    }
  }

  const trail: Flat[] = []
  for (
    let at: Flat | undefined = center;
    at;
    at = at.parent ? flat.get(at.parent) : undefined
  ) {
    trail.unshift(at)
  }
  const empty = !root.value
  const describe = (node: Flat) =>
    `${node.path.join(', ')}, ${valueText(node.value)}, ${t.treemapShareOf(percent.format(share(node, parentOf(node))), parentOf(node).label)}${shaded && node.measure !== null ? `, ${measureLabel} ${measureText(node.measure)}` : ''}`
  const focusTop = topOf(activeNode)
  const shown = (inView || reduce) && width > 0
  const viewArea = width * height || 1
  const [revealed, setRevealed] = useState(false)
  const activeRect = activeNode ? target.get(activeNode.id) : undefined
  const anchor = activeNode
    ? (pointer ??
      (activeRect
        ? {
            x: activeRect.x + activeRect.w / 2,
            y: activeRect.y + Math.min(activeRect.h / 2, 28),
          }
        : null))
    : null

  return (
    <MotionScope>
      <figure
        ref={figure}
        aria-label={label}
        className={cn('m-0 grid min-w-0 gap-3 text-fg', className)}
      >
        <div className="flex min-w-0 items-center justify-between gap-3">
          <nav aria-label={t.treemapPath(label)} className="-ml-1 min-w-0">
            <ol className="relative m-0 flex min-h-8 min-w-0 list-none flex-wrap items-center p-0">
              <AnimatePresence initial={false} mode="popLayout">
                {trail.map((node, index) => (
                  <motion.li
                    key={node.id}
                    layout={reduce ? false : 'position'}
                    className="inline-flex min-w-0 items-center"
                    initial={{
                      opacity: 0,
                      x: reduce ? 0 : -6,
                      filter: reduce ? 'none' : `blur(${blur.subtle}px)`,
                    }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    exit={{
                      opacity: 0,
                      x: reduce ? 0 : -6,
                      transition: {
                        duration: duration.instant,
                        ease: ease.exit,
                      },
                    }}
                    transition={reduce ? { duration: 0 } : spring.smooth}
                  >
                    {index > 0 && (
                      <span
                        aria-hidden="true"
                        className="px-1 text-sm text-line-strong"
                      >
                        /
                      </span>
                    )}
                    {index < trail.length - 1 ? (
                      <button
                        type="button"
                        className="-mx-0.5 min-h-8 cursor-pointer rounded-[10px] px-1.5 text-sm whitespace-nowrap text-fg-muted transition-[color,background-color,scale] duration-150 ease-standard outline-none hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus active:scale-[0.97] motion-reduce:transition-none"
                        onClick={() => {
                          zoomTo(node.id)
                          setActive(null)
                        }}
                      >
                        {node.label}
                      </button>
                    ) : (
                      <span
                        aria-current="location"
                        className="px-1 text-sm font-medium whitespace-nowrap"
                      >
                        {node.label}
                      </span>
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>
          </nav>
          <ChartSwap
            text={valueText(center.value)}
            className="flex-none text-right text-sm font-medium tabular-nums"
          />
        </div>
        {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- the plot is explored with the arrows; each reading is said in a live region */}
        <div
          ref={stageRef}
          role="group"
          tabIndex={empty ? -1 : 0}
          aria-roledescription={t.treemapRole}
          aria-label={`${label}, ${center.label}. ${t.treemapKeys}`}
          data-active={activeNode ? '' : undefined}
          style={{ height }}
          className="group/treemap relative min-w-0 rounded-xl outline-none select-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus"
          onKeyDown={onKeyDown}
          onBlur={() => setActive(null)}
          onPointerLeave={() => {
            setActive(null)
            setPointer(null)
          }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            <AnimatePresence custom={zoom.toNew}>
              {shown &&
                visibleNodes.map((node) => {
                  const goal = target.get(node.id) as Rect
                  const level = levelOf(node)
                  const top = topOf(node)
                  const hue = hueOf(branchOf.get(node.id) ?? -1)
                  const room =
                    goal.w > 64 && goal.h > 38
                      ? goal.h > 54
                        ? 'full'
                        : 'name'
                      : 'none'
                  // A top branch prints its name and total on one header line.
                  const header = node.children.length > 0 && level === 1
                  // The first time, tiles grow from their centre in a quick wave from the largest.
                  const wave = Math.min(
                    0.3,
                    (1 - (goal.w * goal.h) / viewArea) * 0.3,
                  )
                  const enter = revealed
                    ? {
                        ...box(zoom.toOld ? zoom.toOld(goal) : goal),
                        opacity: 0,
                      }
                    : {
                        x: goal.x + goal.w / 2,
                        y: goal.y + goal.h / 2,
                        width: 0,
                        height: 0,
                        opacity: 0,
                      }
                  return (
                    <motion.div
                      key={node.id}
                      custom={zoom.toNew}
                      data-branch={node.children.length > 0 ? '' : undefined}
                      data-level={level}
                      data-room={room}
                      data-active={active === node.id ? '' : undefined}
                      data-lineage={
                        focusTop?.id === node.id && active !== node.id
                          ? ''
                          : undefined
                      }
                      data-dim={
                        focusTop !== null &&
                        top !== null &&
                        focusTop.id !== top.id
                          ? ''
                          : undefined
                      }
                      style={
                        {
                          '--hue': hue,
                          '--fill': `color-mix(in oklab, ${hue} ${shade(node.measure)}%, var(--surface))`,
                          zIndex: node.depth,
                        } as CSSProperties
                      }
                      className={cn(
                        'absolute top-0 left-0 flex cursor-pointer flex-col gap-px overflow-hidden rounded-md bg-(--fill) px-2 py-1.5 text-fg will-change-transform',
                        'transition-[background-color,filter,box-shadow] duration-150 ease-standard motion-reduce:transition-none',
                        'data-[level=2]:px-1.75 data-[level=2]:py-1.25',
                        'data-branch:data-[level=1]:cursor-zoom-in data-branch:data-[level=1]:flex-row data-branch:data-[level=1]:items-baseline data-branch:data-[level=1]:justify-between data-branch:data-[level=1]:gap-2 data-branch:data-[level=1]:rounded-lg data-branch:data-[level=1]:bg-[color-mix(in_oklab,var(--hue)_9%,var(--surface))] data-branch:data-[level=1]:py-0.75',
                        'data-active:shadow-[inset_0_0_0_2px_var(--fg)] data-lineage:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--hue)_70%,transparent)] group-data-active/treemap:data-dim:[filter:opacity(0.5)]',
                      )}
                      variants={{
                        enter,
                        shown: { ...box(goal), opacity: 1 },
                        gone: (toNew: Carry) => ({
                          ...box(toNew ? toNew(goal) : goal),
                          opacity: 0,
                        }),
                      }}
                      initial={reduce ? false : 'enter'}
                      animate="shown"
                      exit="gone"
                      transition={
                        reduce
                          ? { duration: 0 }
                          : revealed
                            ? zoomSpring
                            : { ...chartReveal, delay: wave }
                      }
                      onAnimationComplete={() => setRevealed(true)}
                      onPointerMove={(event) => onTilePointer(event, node.id)}
                      onClick={(event) => {
                        event.stopPropagation()
                        onTileClick(node)
                      }}
                    >
                      <span
                        style={{ opacity: room === 'none' ? 0 : 1 }}
                        className="truncate text-xs/4 font-medium transition-opacity duration-150 motion-reduce:transition-none"
                      >
                        {node.label}
                      </span>
                      {/* The value stays opaque so it keeps 4.5:1 on the tile; a header's pale band takes the muted text instead. */}
                      <span
                        style={{
                          opacity: (header ? room !== 'none' : room === 'full')
                            ? 1
                            : 0,
                        }}
                        className={cn(
                          'truncate text-xs/4 tabular-nums transition-opacity duration-150 motion-reduce:transition-none',
                          header && 'flex-none text-fg-muted',
                        )}
                      >
                        {valueText(node.value)}
                      </span>
                    </motion.div>
                  )
                })}
            </AnimatePresence>
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
              placement={{ x: 'after', y: 'below' }}
              className="z-50 min-w-40 grid-cols-[minmax(0,1fr)]"
            >
              {held && (
                <>
                  <p className="m-0 truncate text-xs text-fg-subtle">
                    {held.path.slice(0, -1).join(' / ') || root.label}
                  </p>
                  <p className="m-0 flex items-baseline justify-between gap-3 leading-snug">
                    <span className="min-w-0 truncate">{held.label}</span>
                    <span className="flex-none font-medium tabular-nums">
                      {valueText(held.value)}
                    </span>
                  </p>
                  <p className="m-0 text-xs text-fg-subtle tabular-nums">
                    {t.treemapShareOf(
                      percent.format(share(held, parentOf(held))),
                      parentOf(held).label,
                    )}
                  </p>
                  {shaded && held.measure !== null && (
                    <p className="m-0 text-xs text-fg-subtle tabular-nums">
                      {measureLabel} {measureText(held.measure)}
                    </p>
                  )}
                </>
              )}
            </ChartTooltip>
          )}
        </div>
        {shaded && (
          <div
            aria-hidden="true"
            className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-fg-subtle tabular-nums"
          >
            <span className="mr-1 text-fg-muted">{measureLabel}</span>
            <span>{measureText(lo)}</span>
            <span className="inline-flex gap-0.5">
              {Array.from({ length: STEPS }, (_, step) => (
                <span
                  key={step}
                  style={{
                    background: `color-mix(in oklab, ${center.depth === 0 ? 'var(--fg)' : hueOf(branchOf.get(center.id) ?? -1)} ${Math.round(14 + (step / (STEPS - 1)) * 44)}%, var(--surface))`,
                  }}
                  className="h-2.5 w-4.5 rounded-[3px]"
                />
              ))}
            </span>
            <span>{measureText(hi)}</span>
          </div>
        )}
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {activeNode
            ? describe(activeNode)
            : `${center.label}, ${valueText(center.value)}`}
        </p>
        {!empty && (
          <ChartDataTable
            caption={label}
            head={[
              t.treemapPathColumn,
              t.chartValue,
              t.treemapShareColumn,
              ...(shaded && measureLabel ? [measureLabel] : []),
            ]}
            rows={nodes.map((node) => ({
              key: node.id,
              cells: [
                node.path.join(' / '),
                valueText(node.value),
                percent.format(share(node, parentOf(node))),
                ...(shaded
                  ? [node.measure === null ? '' : measureText(node.measure)]
                  : []),
              ],
            }))}
          />
        )}
      </figure>
    </MotionScope>
  )
}
