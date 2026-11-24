import { useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { animate, m, useMotionValue, useTransform } from 'motion/react'
import { useReduceMotion } from '../i18n/motion-context.ts'

import { fill, onFill } from '../internal/colors.ts'
import type { Color } from '../internal/colors.ts'
import { MotionFeatures } from '../internal/motion-features.tsx'
import { cn } from '../lib/cn.ts'
import { TabsList, TabsTrigger } from './tabs.tsx'

type PillTab<TValue extends string> = {
  value: TValue
  label: ReactNode
  /** How many rows the tab holds, on a small pill after its name. */
  count?: number
  /** What the count is, for a screen reader (« non lues »). */
  countLabel?: string
  /** The count's pill in green: things connected, things done. */
  countTone?: 'success'
  /**
   * A word or two after the name when something waits behind the tab
   * (« 1 en retard », « À signer »), in the danger or info colour.
   */
  note?: { label: string; tone: 'danger' | 'info' }
}

// On the grey tray, the badges' own pale background and dark text.
const noteTones = {
  danger: 'bg-danger-subtle text-danger-fg',
  info: 'bg-info-subtle text-info-fg',
}
// On the chosen tab's pill, dark in light mode and light in dark mode:
// the surface's colour under the state's text reads on both.
const chosenNoteTones = {
  danger: 'bg-surface text-danger-fg',
  info: 'bg-surface text-info-fg',
}

type PillTabsListProps<TValue extends string> = {
  /** What the tabs choose, for a screen reader. */
  label: string
  tabs: readonly PillTab<TValue>[]
  /** The chosen tab: says where the pill is. */
  value: TValue
  className?: string
  tabClassName?: string
  /** False: the pill lands at once, for tabs that swap a heavy page. */
  slides?: boolean
  /** The pill's colour; dark by default. */
  color?: Color
}

// The edge that leads the move is stiff, the one that follows is soft:
// the pill stretches toward the new tab, then pulls its tail in.
const lead = { type: 'spring', stiffness: 620, damping: 40 } as const
const trail = { type: 'spring', stiffness: 170, damping: 19 } as const

/**
 * Tabs on a tray with a sliding pill.
 *
 * **Use it for** a light set of tabs, counts included; `ListTabs` builds
 * on it.
 *
 * **Key props**: `label`, `tabs` (`value`, `label`, `count`, `note`),
 * `value`, `color`, `slides` (the pill
 * moves, off with reduced motion).
 *
 * @summary Tabs on a tray with a sliding pill.
 */
function PillTabsList<TValue extends string>({
  label,
  tabs,
  value,
  className,
  tabClassName,
  slides = true,
  color,
}: PillTabsListProps<TValue>) {
  const reduce = useReduceMotion() || !slides
  // The pill's two edges, in px from the tray's left.
  const left = useMotionValue(0)
  const right = useMotionValue(0)
  const width = useTransform(() => Math.max(0, right.get() - left.get()))
  // Before the first measure, the chosen tab paints its own pill.
  const [placed, setPlaced] = useState(false)
  const index = tabs.findIndex((tab) => tab.value === value)
  const previous = useRef(index)

  // A callback ref renewed when the chosen tab changes: it runs once the
  // tabs are laid out, so the pill moves to where the tab now is. On a
  // plain marker: Base UI's TabsList keeps the first ref it is given.
  const followChosenTab = useCallback(
    (marker: HTMLSpanElement | null) => {
      const tray = marker?.parentElement
      if (!tray) {
        return undefined
      }
      const edges = () => {
        const tab = tray.querySelector<HTMLElement>(
          `[data-pill-tab="${CSS.escape(value)}"]`,
        )
        return tab
          ? { from: tab.offsetLeft, to: tab.offsetLeft + tab.offsetWidth }
          : null
      }
      const jump = () => {
        const target = edges()
        if (target) {
          left.jump(target.from)
          right.jump(target.to)
        }
      }

      const target = edges()
      if (target && placed && !reduce && previous.current !== index) {
        const forward = index > previous.current
        animate(left, target.from, forward ? trail : lead)
        animate(right, target.to, forward ? lead : trail)
      } else {
        jump()
      }
      previous.current = index
      setPlaced(true)

      // A font loaded, a wider window: the pill follows without moving,
      // on a real change of size only.
      if (typeof ResizeObserver === 'undefined') {
        return undefined
      }
      let size = tray.offsetWidth
      const observer = new ResizeObserver(() => {
        if (tray.offsetWidth !== size) {
          size = tray.offsetWidth
          jump()
        }
      })
      observer.observe(tray)
      return () => observer.disconnect()
    },
    [value, index, placed, reduce, left, right],
  )

  return (
    <TabsList
      aria-label={label}
      data-slot="pill-tabs-list"
      className={cn(
        // In dark mode a hairline keeps the tray's edge on a black page.
        'relative h-9! shrink-0 rounded-full max-md:h-11! dark:bg-surface dark:ring-1 dark:ring-line-strong dark:ring-inset',
        className,
      )}
    >
      <span ref={followChosenTab} hidden />
      <MotionFeatures>
        <m.span
          aria-hidden="true"
          style={{ x: left, width }}
          className={cn(
            'pointer-events-none absolute top-1 bottom-1 left-0 rounded-full bg-inverse will-change-[transform,width]',
            color && fill[color],
            !placed && 'invisible',
          )}
        />
      </MotionFeatures>
      {tabs.map((tab) => {
        const active = value === tab.value
        return (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            data-pill-tab={tab.value}
            className={cn(
              'rounded-full px-3 transition-colors duration-250 data-active:bg-transparent! data-active:text-fg-inverse! data-active:shadow-none!',
              !placed && 'data-active:bg-inverse!',
              color && onFill[color],
              tabClassName,
            )}
          >
            <span className="relative flex items-center gap-1.5">
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'min-w-5 rounded-full px-1.5 text-center text-xs leading-5 font-medium tabular-nums transition-colors duration-250',
                    tab.countTone === 'success'
                      ? active
                        ? // On the inverted pill: the solid fill reads in both themes.
                          'bg-success text-success-foreground'
                        : 'bg-success-subtle text-success-fg'
                      : active
                        ? 'bg-fg-inverse/15 text-fg-inverse'
                        : 'bg-raised text-fg-muted dark:bg-floating',
                  )}
                >
                  {tab.count}
                  {tab.countLabel && (
                    <span className="sr-only">{` ${tab.countLabel}`}</span>
                  )}
                </span>
              )}
              {tab.note && (
                <span
                  className={cn(
                    'rounded-full px-2 text-xs leading-5 font-medium whitespace-nowrap transition-colors duration-250',
                    active
                      ? chosenNoteTones[tab.note.tone]
                      : noteTones[tab.note.tone],
                  )}
                >
                  {tab.note.label}
                </span>
              )}
            </span>
          </TabsTrigger>
        )
      })}
    </TabsList>
  )
}

export { PillTabsList }
export type { PillTab, PillTabsListProps }
