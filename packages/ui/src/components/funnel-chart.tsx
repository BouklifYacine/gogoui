import { motion, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import { cn } from '../lib/cn.ts'

// Adapted from Bklit UI's funnel chart (MIT, Copyright (c) 2026 uixmat,
// https://github.com/bklit/bklit-ui, see THIRD_PARTY_NOTICES.md): GoGoUI's
// cn, French numbers by default, the highest value as scale (a zero first
// step or a later step above it no longer breaks the shape) and no
// animation under reduced motion.

// ─── PatternLines ────────────────────────────────────────────────────────────

export interface PatternLinesProps {
  id: string
  width?: number
  height?: number
  stroke?: string
  strokeWidth?: number
  orientation?: ('diagonal' | 'horizontal' | 'vertical')[]
  background?: string
}

export function PatternLines({
  id,
  width = 6,
  height = 6,
  stroke = 'var(--chart-1)',
  strokeWidth = 1,
  orientation = ['diagonal'],
  background,
}: PatternLinesProps) {
  const paths: string[] = []

  for (const o of orientation) {
    if (o === 'diagonal') {
      paths.push(`M0,${height}l${width},${-height}`)
      paths.push(`M${-width / 4},${height / 4}l${width / 2},${-height / 2}`)
      paths.push(
        `M${(3 * width) / 4},${height + height / 4}l${width / 2},${-height / 2}`,
      )
    } else if (o === 'horizontal') {
      paths.push(`M0,${height / 2}l${width},0`)
    } else if (o === 'vertical') {
      paths.push(`M${width / 2},0l0,${height}`)
    }
  }

  return (
    <pattern
      id={id}
      width={width}
      height={height}
      patternUnits="userSpaceOnUse"
    >
      {background && <rect width={width} height={height} fill={background} />}
      <path
        d={paths.join(' ')}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="square"
      />
    </pattern>
  )
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FunnelGradientStop {
  offset: string | number
  color: string
}

export interface FunnelStage {
  label: string
  value: number
  displayValue?: string
  color?: string
  gradient?: FunnelGradientStop[]
}

export interface FunnelChartProps {
  data: FunnelStage[]
  orientation?: 'horizontal' | 'vertical'
  color?: string
  layers?: number
  className?: string
  style?: CSSProperties
  showPercentage?: boolean
  showValues?: boolean
  showLabels?: boolean
  hoveredIndex?: number | null
  onHoverChange?: (index: number | null) => void
  formatPercentage?: (pct: number) => string
  formatValue?: (value: number) => string
  staggerDelay?: number
  gap?: number
  renderPattern?: (id: string, color: string) => ReactNode
  edges?: 'curved' | 'straight'
  labelLayout?: 'spread' | 'grouped'
  labelOrientation?: 'vertical' | 'horizontal'
  labelAlign?: 'center' | 'start' | 'end'
  grid?:
    | boolean
    | {
        bands?: boolean
        bandColor?: string
        lines?: boolean
        lineColor?: string
        lineOpacity?: number
        lineWidth?: number
      }
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const fmtPct = (p: number) => `${Math.round(p)} %`
const fmtVal = (v: number) => v.toLocaleString('fr-FR')

const springConfig = { stiffness: 120, damping: 20, mass: 1 }
const hoverSpring = { stiffness: 300, damping: 24 }

// ─── SVG Helpers ─────────────────────────────────────────────────────────────

function hSegmentPath(
  normStart: number,
  normEnd: number,
  segW: number,
  H: number,
  layerScale: number,
  straight = false,
) {
  const my = H / 2
  const h0 = normStart * H * 0.44 * layerScale
  const h1 = normEnd * H * 0.44 * layerScale

  if (straight) {
    return `M 0 ${my - h0} L ${segW} ${my - h1} L ${segW} ${my + h1} L 0 ${my + h0} Z`
  }

  const cx = segW * 0.55
  const top = `M 0 ${my - h0} C ${cx} ${my - h0}, ${segW - cx} ${my - h1}, ${segW} ${my - h1}`
  const bot = `L ${segW} ${my + h1} C ${segW - cx} ${my + h1}, ${cx} ${my + h0}, 0 ${my + h0}`
  return `${top} ${bot} Z`
}

function vSegmentPath(
  normStart: number,
  normEnd: number,
  segH: number,
  W: number,
  layerScale: number,
  straight = false,
) {
  const mx = W / 2
  const w0 = normStart * W * 0.44 * layerScale
  const w1 = normEnd * W * 0.44 * layerScale

  if (straight) {
    return `M ${mx - w0} 0 L ${mx - w1} ${segH} L ${mx + w1} ${segH} L ${mx + w0} 0 Z`
  }

  const cy = segH * 0.55
  const left = `M ${mx - w0} 0 C ${mx - w0} ${cy}, ${mx - w1} ${segH - cy}, ${mx - w1} ${segH}`
  const right = `L ${mx + w1} ${segH} C ${mx + w1} ${segH - cy}, ${mx + w0} ${cy}, ${mx + w0} 0`
  return `${left} ${right} Z`
}

// Moves a spring to its target, or jumps there under reduced motion.
function setSpring(
  value: ReturnType<typeof useSpring>,
  target: number,
  reduced: boolean,
) {
  if (reduced) value.jump(target)
  else value.set(target)
}

// ─── Animated Ring ───────────────────────────────────────────────────────────

interface RingProps {
  d: string
  color: string
  fill?: string
  opacity: number
  hovered: boolean
  ringIndex: number
  totalRings: number
  reduced: boolean
}

function useRingScale({
  hovered,
  ringIndex,
  totalRings,
  reduced,
}: Pick<RingProps, 'hovered' | 'ringIndex' | 'totalRings' | 'reduced'>) {
  const extraScale = 1 + (ringIndex / Math.max(totalRings - 1, 1)) * 0.12
  const scale = useSpring(1, {
    stiffness: 300 - ringIndex * 60,
    damping: 24 - ringIndex * 3,
  })

  useEffect(() => {
    setSpring(scale, hovered ? extraScale : 1, reduced)
  }, [hovered, scale, extraScale, reduced])

  return scale
}

function HRing({ d, color, fill, opacity, ...rest }: RingProps) {
  const scaleY = useRingScale(rest)
  return (
    <motion.path
      d={d}
      fill={fill ?? color}
      opacity={opacity}
      style={{ scaleY, transformOrigin: 'center center' }}
    />
  )
}

function VRing({ d, color, fill, opacity, ...rest }: RingProps) {
  const scaleX = useRingScale(rest)
  return (
    <motion.path
      d={d}
      fill={fill ?? color}
      opacity={opacity}
      style={{ scaleX, transformOrigin: 'center center' }}
    />
  )
}

// ─── Animated Segments ───────────────────────────────────────────────────────

interface SegmentProps {
  index: number
  normStart: number
  normEnd: number
  color: string
  layers: number
  staggerDelay: number
  hovered: boolean
  dimmed: boolean
  renderPattern?: (id: string, color: string) => ReactNode
  straight: boolean
  gradientStops?: FunnelGradientStop[]
  reduced: boolean
}

// The segment's entrance and its dimming while another one is hovered.
function useSegmentMotion({
  index,
  staggerDelay,
  dimmed,
  reduced,
}: Pick<SegmentProps, 'index' | 'staggerDelay' | 'dimmed' | 'reduced'>) {
  const growProgress = useSpring(reduced ? 1 : 0, springConfig)
  const entranceScale = useTransform(growProgress, [0, 1], [0, 1])
  const dimOpacity = useSpring(1, hoverSpring)

  useEffect(() => {
    setSpring(dimOpacity, dimmed ? 0.4 : 1, reduced)
  }, [dimmed, dimOpacity, reduced])

  useEffect(() => {
    if (reduced) {
      growProgress.jump(1)
      return
    }
    const timeout = setTimeout(
      () => growProgress.set(1),
      index * staggerDelay * 1000,
    )
    return () => clearTimeout(timeout)
  }, [growProgress, index, staggerDelay, reduced])

  return { entranceScale, dimOpacity }
}

function GradientDef({
  id,
  stops,
  vertical,
}: {
  id: string
  stops: FunnelGradientStop[]
  vertical: boolean
}) {
  return (
    <linearGradient
      id={id}
      x1="0"
      x2={vertical ? '0' : '1'}
      y1="0"
      y2={vertical ? '1' : '0'}
    >
      {stops.map((stop) => (
        <stop
          key={`${stop.offset}-${stop.color}`}
          offset={
            typeof stop.offset === 'number'
              ? `${stop.offset * 100}%`
              : stop.offset
          }
          stopColor={stop.color}
        />
      ))}
    </linearGradient>
  )
}

function Segment({
  vertical,
  segSize,
  fullSize,
  ...props
}: SegmentProps & { vertical: boolean; segSize: number; fullSize: number }) {
  const {
    index,
    normStart,
    normEnd,
    color,
    layers,
    hovered,
    renderPattern,
    straight,
    gradientStops,
    reduced,
  } = props
  const axis = vertical ? 'v' : 'h'
  const patternId = `funnel-${axis}-pattern-${index}`
  const gradientId = `funnel-${axis}-grad-${index}`
  const { entranceScale, dimOpacity } = useSegmentMotion(props)
  const width = vertical ? fullSize : segSize
  const height = vertical ? segSize : fullSize
  const Ring = vertical ? VRing : HRing

  const rings = Array.from({ length: layers }, (_, l) => {
    const scale = 1 - (l / layers) * 0.35
    const opacity = 0.18 + (l / (layers - 1 || 1)) * 0.65
    return {
      d: vertical
        ? vSegmentPath(normStart, normEnd, segSize, fullSize, scale, straight)
        : hSegmentPath(normStart, normEnd, segSize, fullSize, scale, straight),
      opacity,
    }
  })

  return (
    <motion.div
      className="pointer-events-none relative shrink-0 overflow-visible"
      style={{ width, height, zIndex: hovered ? 10 : 1, opacity: dimOpacity }}
    >
      <motion.div
        className="absolute inset-0 overflow-visible"
        style={{
          scaleX: entranceScale,
          scaleY: entranceScale,
          transformOrigin: vertical ? 'center top' : 'left center',
        }}
      >
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full overflow-visible"
          preserveAspectRatio="none"
          role="presentation"
          viewBox={`0 0 ${width} ${height}`}
        >
          <defs>
            {gradientStops && (
              <GradientDef
                id={gradientId}
                stops={gradientStops}
                vertical={vertical}
              />
            )}
            {renderPattern?.(patternId, color)}
          </defs>
          {rings.map((r, i) => {
            const isInnermost = i === rings.length - 1
            let ringFill: string | undefined
            if (isInnermost && renderPattern) {
              ringFill = `url(#${patternId})`
            } else if (isInnermost && gradientStops) {
              ringFill = `url(#${gradientId})`
            }
            return (
              <Ring
                color={color}
                d={r.d}
                fill={ringFill}
                hovered={hovered}
                key={`${axis}-ring-${r.opacity.toFixed(2)}`}
                opacity={r.opacity}
                ringIndex={i}
                totalRings={layers}
                reduced={reduced}
              />
            )
          })}
        </svg>
      </motion.div>
    </motion.div>
  )
}

// ─── Label Overlay ───────────────────────────────────────────────────────────

function SegmentLabel({
  stage,
  pct,
  isHorizontal,
  showValues,
  showPercentage,
  showLabels,
  formatPercentage,
  formatValue,
  index,
  staggerDelay,
  layout = 'spread',
  orientation,
  align = 'center',
  reduced,
}: {
  stage: FunnelStage
  pct: number
  isHorizontal: boolean
  showValues: boolean
  showPercentage: boolean
  showLabels: boolean
  formatPercentage: (p: number) => string
  formatValue: (v: number) => string
  index: number
  staggerDelay: number
  layout?: 'spread' | 'grouped'
  orientation?: 'vertical' | 'horizontal'
  align?: 'center' | 'start' | 'end'
  reduced: boolean
}) {
  const display = stage.displayValue ?? formatValue(stage.value)
  const transition = reduced
    ? { duration: 0 }
    : {
        delay: index * staggerDelay + 0.25,
        duration: 0.35,
        ease: 'easeOut' as const,
      }

  const valueEl = showValues && (
    <span className="whitespace-nowrap text-sm font-medium text-foreground">
      {display}
    </span>
  )
  const pctEl = showPercentage && (
    <span className="rounded-full bg-foreground px-3 py-1 text-xs font-bold text-background shadow-sm">
      {formatPercentage(pct)}
    </span>
  )
  const labelEl = showLabels && (
    // Wraps on a narrow phone: « Devis envoyés » no longer pushes the page
    // sideways at 320 px.
    <span className="text-center text-xs font-medium text-muted-foreground">
      {stage.label}
    </span>
  )

  if (layout === 'spread') {
    return (
      <motion.div
        animate={{ opacity: 1 }}
        className={cn(
          'absolute inset-0 flex',
          isHorizontal ? 'flex-col items-center' : 'flex-row items-center',
        )}
        initial={{ opacity: 0 }}
        transition={transition}
      >
        {isHorizontal ? (
          <>
            <div className="flex h-[16%] items-end justify-center pb-1">
              {valueEl}
            </div>
            <div className="flex flex-1 items-center justify-center">
              {pctEl}
            </div>
            <div className="flex h-[16%] items-start justify-center pt-1">
              {labelEl}
            </div>
          </>
        ) : (
          <>
            <div className="flex w-[16%] items-center justify-end pr-2">
              {valueEl}
            </div>
            <div className="flex flex-1 items-center justify-center">
              {pctEl}
            </div>
            <div className="flex w-[16%] items-center justify-start pl-2">
              {labelEl}
            </div>
          </>
        )}
      </motion.div>
    )
  }

  // Grouped layout
  const resolvedOrientation =
    orientation ?? (isHorizontal ? 'vertical' : 'horizontal')
  const isVerticalStack = resolvedOrientation === 'vertical'

  const justifyMap = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  } as const
  const itemsMap = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
  } as const

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className={cn(
        'absolute inset-0 flex',
        isHorizontal
          ? cn('flex-col items-center', justifyMap[align])
          : cn('flex-row items-center', justifyMap[align]),
      )}
      initial={{ opacity: 0 }}
      style={{ padding: isHorizontal ? '8% 0' : '0 8%' }}
      transition={transition}
    >
      <div
        className={cn(
          'flex gap-1.5',
          isVerticalStack
            ? cn('flex-col', itemsMap[isHorizontal ? 'center' : align])
            : cn('flex-row', itemsMap.center),
        )}
      >
        {valueEl}
        {pctEl}
        {labelEl}
      </div>
    </motion.div>
  )
}

// ─── FunnelChart ─────────────────────────────────────────────────────────────

/**
 * A funnel from the first step to the last (requests, visits, signed),
 * each step’s width its value, the drop between steps in percent. Numbers
 * in French by default.
 *
 * @summary A funnel of steps with their values and drop rates.
 */
export function FunnelChart({
  data,
  orientation = 'horizontal',
  color = 'var(--chart-1)',
  layers = 3,
  className,
  style,
  showPercentage = true,
  showValues = true,
  showLabels = true,
  hoveredIndex: hoveredIndexProp,
  onHoverChange,
  formatPercentage = fmtPct,
  formatValue = fmtVal,
  staggerDelay = 0.12,
  gap = 4,
  renderPattern,
  edges = 'curved',
  labelLayout = 'spread',
  labelOrientation,
  labelAlign = 'center',
  grid: gridProp = false,
}: FunnelChartProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion() ?? false
  const [sz, setSz] = useState({ w: 0, h: 0 })
  const [internalHoveredIndex, setInternalHoveredIndex] = useState<
    number | null
  >(null)

  const isControlled = hoveredIndexProp !== undefined
  const hoveredIndex = isControlled ? hoveredIndexProp : internalHoveredIndex
  const setHoveredIndex = useCallback(
    (index: number | null) => {
      if (isControlled) {
        onHoverChange?.(index)
      } else {
        setInternalHoveredIndex(index)
      }
    },
    [isControlled, onHoverChange],
  )

  const measure = useCallback(() => {
    if (!ref.current) return
    const { width: w, height: h } = ref.current.getBoundingClientRect()
    if (w > 0 && h > 0) setSz({ w, h })
  }, [])

  useEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (ref.current) ro.observe(ref.current)
    return () => ro.disconnect()
  }, [measure])

  if (!data.length) return null

  // The highest step is the scale, never zero: steps need not decrease.
  const max = Math.max(...data.map((d) => d.value), 1)
  const n = data.length
  const norms = data.map((d) => d.value / max)
  const horiz = orientation === 'horizontal'
  const { w: W, h: H } = sz

  const totalGap = gap * (n - 1)
  const segW = (W - (horiz ? totalGap : 0)) / n
  const segH = (H - (horiz ? 0 : totalGap)) / n

  // Grid config
  const gridEnabled = gridProp !== false
  const gridCfg = typeof gridProp === 'object' ? gridProp : {}
  const showBands = gridEnabled && (gridCfg.bands ?? true)
  const bandColor = gridCfg.bandColor ?? 'var(--color-muted)'
  const showGridLines = gridEnabled && (gridCfg.lines ?? true)
  const gridLineColor = gridCfg.lineColor ?? 'var(--border)'
  const gridLineOpacity = gridCfg.lineOpacity ?? 1
  const gridLineWidth = gridCfg.lineWidth ?? 1

  return (
    <div
      className={cn('relative w-full select-none overflow-visible', className)}
      ref={ref}
      style={{ aspectRatio: horiz ? '2.2 / 1' : '1 / 1.8', ...style }}
    >
      {W > 0 && H > 0 && (
        <>
          {/* Grid background bands */}
          {gridEnabled && (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
              role="presentation"
              viewBox={`0 0 ${W} ${H}`}
            >
              {showBands &&
                data.map((stage, i) => {
                  if (i % 2 !== 0) return null
                  return horiz ? (
                    <rect
                      fill={bandColor}
                      height={H}
                      key={`band-${stage.label}`}
                      width={segW}
                      x={(segW + gap) * i}
                      y={0}
                    />
                  ) : (
                    <rect
                      fill={bandColor}
                      height={segH}
                      key={`band-${stage.label}`}
                      width={W}
                      x={0}
                      y={(segH + gap) * i}
                    />
                  )
                })}
            </svg>
          )}

          {/* Segments */}
          <div
            className={cn(
              'absolute inset-0 flex overflow-visible',
              horiz ? 'flex-row' : 'flex-col',
            )}
            style={{ gap }}
          >
            {data.map((stage, i) => {
              const firstStop = stage.gradient?.[0]
              return (
                <Segment
                  color={firstStop ? firstStop.color : (stage.color ?? color)}
                  dimmed={hoveredIndex !== null && hoveredIndex !== i}
                  fullSize={horiz ? H : W}
                  gradientStops={stage.gradient}
                  hovered={hoveredIndex === i}
                  index={i}
                  key={stage.label}
                  layers={layers}
                  normEnd={norms[Math.min(i + 1, n - 1)] ?? 0}
                  normStart={norms[i] ?? 0}
                  reduced={reduced}
                  renderPattern={renderPattern}
                  segSize={horiz ? segW : segH}
                  staggerDelay={staggerDelay}
                  straight={edges === 'straight'}
                  vertical={!horiz}
                />
              )
            })}
          </div>

          {/* Grid lines */}
          {gridEnabled && showGridLines && (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
              role="presentation"
              viewBox={`0 0 ${W} ${H}`}
            >
              {Array.from({ length: n - 1 }, (_, i) => {
                const idx = i + 1
                const at = (horiz ? segW : segH) * idx + gap * i + gap / 2
                return (
                  <line
                    key={`grid-${idx}`}
                    stroke={gridLineColor}
                    strokeOpacity={gridLineOpacity}
                    strokeWidth={gridLineWidth}
                    x1={horiz ? at : 0}
                    x2={horiz ? at : W}
                    y1={horiz ? 0 : at}
                    y2={horiz ? H : at}
                  />
                )
              })}
            </svg>
          )}

          {/* Label overlays — hover triggers */}
          {data.map((stage, i) => {
            const pct = (stage.value / max) * 100
            const posStyle: CSSProperties = horiz
              ? { left: (segW + gap) * i, width: segW, top: 0, height: H }
              : { top: (segH + gap) * i, height: segH, left: 0, width: W }
            const isDimmed = hoveredIndex !== null && hoveredIndex !== i

            return (
              <motion.div
                animate={{ opacity: isDimmed ? 0.4 : 1 }}
                className="absolute cursor-pointer"
                key={`lbl-${stage.label}`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ ...posStyle, zIndex: 20 }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 300, damping: 24 }
                }
              >
                <SegmentLabel
                  align={labelAlign}
                  formatPercentage={formatPercentage}
                  formatValue={formatValue}
                  index={i}
                  isHorizontal={horiz}
                  layout={labelLayout}
                  orientation={labelOrientation}
                  pct={pct}
                  reduced={reduced}
                  showLabels={showLabels}
                  showPercentage={showPercentage}
                  showValues={showValues}
                  stage={stage}
                  staggerDelay={staggerDelay}
                />
              </motion.div>
            )
          })}
        </>
      )}
    </div>
  )
}
