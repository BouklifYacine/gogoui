import { useCallback, useRef, useState } from 'react'
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
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { chartColor, chartTextColor } from '../internal/chart-color.ts'
import type { ChartColor } from '../internal/chart-color.ts'
import { physicalSpring } from '../internal/chart-motion.ts'
import { clamp } from '../internal/chart-scale.ts'
import { ChartSwap } from '../internal/chart-swap.tsx'
import { duration, spring } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { cn } from '../lib/cn.ts'

// Adapted from Arc UI's gauge (https://uiarc.dev, MIT licence, Elia
// Kuratli): GoGoUI's colours and words, `color` and `size`, the band's
// colour from GoGoUI's palette.

/**
 * A band that starts at `from`: the highest band the value reaches gives
 * the ring its colour and names the state, so the state never rests on
 * colour alone.
 */
type GaugeThreshold = { from: number; color: ChartColor; label: string }

/** The words Gauge writes, to change on one Gauge only. */
type GaugeLabels = Partial<Pick<GoGoUIMessages, 'chartReading' | 'chartOutOf'>>

type GaugeProps = {
  value: number
  min?: number
  max?: number
  /** What is measured: « Taux de remplissage ». */
  label: string
  /** A line under the label: « 214 jours réservés sur 300 ». */
  detail?: string
  /** The ring's colour when no band applies. */
  color?: ChartColor
  /** Bands, each from a value up: their colour and their word. */
  thresholds?: readonly GaugeThreshold[]
  size?: 'sm' | 'default' | 'lg'
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: GaugeLabels
}

/** A 270° ring open at the bottom, drawn clockwise from its lower left end. */
const RADIUS = 42
const START = -135
const SPAN = 270
function arcFor(sweep: number) {
  const end = START + SPAN * clamp(sweep, 0, 1)
  const at = (angle: number) =>
    `${(50 + RADIUS * Math.sin((angle * Math.PI) / 180)).toFixed(3)} ${(50 - RADIUS * Math.cos((angle * Math.PI) / 180)).toFixed(3)}`
  return `M ${at(START)} A ${RADIUS} ${RADIUS} 0 ${end - START > 180 ? 1 : 0} 1 ${at(end)}`
}
const TRACK = arcFor(1)

/** The first fill is slower than later ones, like a ring closing as the view opens. */
const reveal = physicalSpring(duration.considered * 1.6)

const sizes = {
  sm: { box: 'w-[min(100%,8rem)]', number: 'text-2xl' },
  default: { box: 'w-[min(100%,11rem)]', number: 'text-3xl' },
  lg: { box: 'w-[min(100%,14rem)]', number: 'text-4xl' },
} as const

/**
 * A value on a ring that fills, with its percentage in the middle, after
 * Arc UI's gauge (https://uiarc.dev, MIT).
 *
 * **Use it for** one figure against its ceiling: a year's booked days, a
 * deposit collected, a goal. **Not for** a task in progress (`Progress`),
 * a level in a list (`Meter`) or several figures (`BarChart`).
 *
 * **Where**: in a dashboard card, alone or two to four in a row.
 *
 * **States**: plain, with bands (`thresholds`) whose word and colour
 * change as the count crosses them, three sizes.
 *
 * **Compose**: inside a `Card`, beside a `StatCard`.
 *
 * **Key props**: `value`, `min` / `max` (0 to 100), `label`, `detail`,
 * `color`, `thresholds` (`{ from, color, label }`), `size`,
 * `labels` to change its words.
 *
 * **Motion**: the ring fills once it is seen and the percentage counts
 * up with it; a new value springs the ring and the count without
 * overshoot; a band's word swaps as the count crosses it. With reduced
 * motion the ring is drawn full at once.
 *
 * **Accessibility**: a `meter` named by `label`, read as a percentage
 * and the band's word; the figure is named by the value out of the
 * maximum.
 *
 * @summary A value on a ring that fills, with bands that name its state.
 */
function Gauge({
  value,
  min = 0,
  max = 100,
  label,
  detail,
  color = 'primary',
  thresholds,
  size = 'default',
  className,
  labels,
}: GaugeProps) {
  const messages = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const safeMax = max > min ? max : min + 1
  const share = clamp((value - min) / (safeMax - min), 0, 1)
  const percent = Math.round(share * 100)
  const bands = [...(thresholds ?? [])].sort((a, b) => a.from - b.from)
  const bandAt = (at: number) =>
    bands.filter((band) => at >= band.from - 1e-6).pop()
  const band = bandAt(value)

  const figure = useRef<HTMLElement>(null)
  const inView = useInView(figure, { once: true, amount: 0.5 })
  const sweep = useMotionValue(0)
  const count = useMotionValue(0)
  const [filled, setFilled] = useState(false)
  const [live, setLive] = useState(band)
  const path = useTransform(sweep, arcFor)
  // The round cap fades in over the first sliver instead of popping in as a dot.
  const arcOpacity = useTransform(sweep, (now) => clamp(now / 0.02, 0, 1))
  const digits = useTransform(count, (now) =>
    String(Math.round(clamp(now, 0, 100))),
  )
  // Which way the value moved, so the words come from that side.
  const [moved, setMoved] = useState({ percent, direction: 1 })
  if (moved.percent !== percent) {
    setMoved({ percent, direction: percent < moved.percent ? -1 : 1 })
  }

  // The ring fills once it is seen, then springs to each new value; the
  // count follows without overshooting.
  const fill = useCallback(
    (node: SVGPathElement | null) => {
      if (!node) {
        return undefined
      }
      if (reduce) {
        sweep.jump(share)
        count.jump(share * 100)
        setFilled(true)
        return undefined
      }
      if (!inView) {
        return undefined
      }
      const ring = animate(sweep, share, filled ? spring.morph : reveal)
      const number = animate(count, share * 100, {
        ...(filled ? spring.smooth : reveal),
        onComplete: () => setFilled(true),
      })
      return () => {
        ring.stop()
        number.stop()
      }
    },
    [count, filled, inView, reduce, share, sweep],
  )

  // Once filled, the band follows the number on screen, so the colour and
  // the word change exactly as the count crosses a threshold.
  useMotionValueEvent(count, 'change', (now) => {
    const next = bandAt(min + (now / 100) * (safeMax - min))
    if (next?.from !== live?.from || next?.label !== live?.label) {
      setLive(next)
    }
  })
  const shown = reduce || !filled ? band : live
  const tone = shown?.color ?? color

  const number = new Intl.NumberFormat(messages.intlLocale)
  const percentText = new Intl.NumberFormat(messages.intlLocale, {
    style: 'percent',
  }).format(share)
  const state = band ? `, ${band.label}` : ''

  return (
    <MotionScope>
      <figure
        ref={figure}
        data-slot="gauge"
        aria-label={`${messages.chartReading(label, messages.chartOutOf(number.format(value), number.format(safeMax)))}${state}`}
        style={{ '--gauge': chartColor(tone) } as CSSProperties}
        className={cn(
          'm-0 grid min-w-0 justify-items-center gap-2.5 text-center',
          className,
        )}
      >
        <div
          role="meter"
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={safeMax}
          aria-valuenow={clamp(value, min, safeMax)}
          aria-valuetext={`${percentText}${state}`}
          className={cn('relative aspect-[100/90]', sizes[size].box)}
        >
          <svg
            viewBox="0 0 100 90"
            aria-hidden="true"
            focusable="false"
            className="block size-full overflow-visible"
          >
            {/* A plain element carries the fill: motion's own elements never re-run a changed ref. */}
            <path
              ref={fill}
              d={TRACK}
              fill="none"
              strokeWidth={9}
              strokeLinecap="round"
              className="stroke-[color-mix(in_oklab,var(--gauge)_13%,transparent)] transition-[stroke] duration-200 ease-standard motion-reduce:transition-none"
            />
            <m.path
              d={path}
              fill="none"
              strokeWidth={9}
              strokeLinecap="round"
              style={{ opacity: arcOpacity }}
              className="stroke-(--gauge) transition-[stroke] duration-200 ease-standard motion-reduce:transition-none"
            />
          </svg>
          {/* The readout sits on the ring's true centre: the middle of a square as wide as the ring. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 grid aspect-square w-full place-content-center justify-items-center gap-1"
          >
            <span
              className={cn(
                'inline-flex items-baseline leading-none font-medium tracking-title text-fg tabular-nums',
                sizes[size].number,
              )}
            >
              {/* The digits sit right aligned in a box as wide as the target, so the ones never jump. */}
              <span className="inline-grid justify-items-end">
                <m.span className="[grid-area:1/1]">{digits}</m.span>
                <span className="invisible [grid-area:1/1]">{percent}</span>
              </span>
              <span className="ml-0.5 text-[0.5em] font-normal tracking-normal text-fg-muted">
                %
              </span>
            </span>
            {bands.length > 0 && (
              <ChartSwap
                text={filled ? (shown?.label ?? '') : ''}
                direction={moved.direction}
                className={cn(
                  'min-h-[1.4em] min-w-24 text-xs/[1.4] font-medium transition-colors duration-200 motion-reduce:transition-none',
                  chartTextColor(tone),
                )}
              />
            )}
          </div>
        </div>
        <figcaption className="grid min-w-0 gap-0.5">
          <strong className="text-sm font-medium text-fg">
            <ChartSwap text={label} />
          </strong>
          {detail && (
            <span className="text-xs text-fg-muted tabular-nums">
              <ChartSwap text={detail} direction={moved.direction} />
            </span>
          )}
        </figcaption>
      </figure>
    </MotionScope>
  )
}

export { Gauge }
export type { GaugeProps, GaugeThreshold, GaugeLabels }
