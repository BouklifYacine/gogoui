import { useContext } from 'react'
import { Toggle as TogglePrimitive } from '@base-ui/react/toggle'
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group'

import { ChipBody } from '../internal/chip-body.tsx'
import { ChipContext } from '../internal/chip-context.ts'
import { ChipGroup } from '../internal/chip-group.tsx'
import type { ChipGroupLabels } from '../internal/chip-group.tsx'
import { pressed } from '../internal/colors.ts'
import type { Color } from '../internal/colors.ts'
import { cn } from '../lib/cn.ts'

/** The words ToggleGroup writes (variant="chips"), to change on one group only. */
type ToggleGroupLabels = ChipGroupLabels

type ToggleGroupProps = ToggleGroupPrimitive.Props & {
  /**
   * `default`: segments in a tray. `chips`: chips that wrap and show a tick
   * once pressed, to filter by tags, stages, kinds of event.
   */
  variant?: 'default' | 'chips'
  /** `chips` only: chips shown before the rest fold behind « +N de plus ». */
  maxVisible?: number
  /** `chips` only: 28px (`sm`) or 32px high; taller on a phone. */
  size?: 'sm' | 'default'
  /** `chips` only: its words on this one, over GoGoUIProvider's `messages`. */
  labels?: ToggleGroupLabels
}

/**
 * A segmented choice among a few buttons, or a set of chips to toggle.
 *
 * **Use it for** a display choice (Liste | Grille | Calendrier), text
 * alignment, a period (Jour | Semaine | Mois); with `variant="chips"`, the
 * facets people toggle often to narrow a list (stages, kinds of event,
 * tags). **Not for** a form's value (`RadioGroup`, `MultiSelectField`),
 * views with their own content (`Tabs`), filters already applied and to
 * remove (`FilterChips`).
 *
 * **Where**: in a toolbar, above a list, at the top of a filter panel.
 *
 * **States**: pressed or not, disabled; `chips` folded (« +N de plus »)
 * or unfolded (« Voir moins »).
 *
 * **Compose**: `ToggleGroup` > `ToggleGroupItem`s.
 *
 * **Key props**: `value` + `onValueChange` (an array), `multiple`,
 * `variant` (default, chips), `maxVisible` and `size` with chips; on items
 * `color`, `labels` to change its words.
 *
 * **Motion** (chips), after Arc UI (https://uiarc.dev, MIT): the tick
 * pushes the words aside as it draws itself, the fill's edge follows on a
 * spring, the other chips glide to their place, the fold opens its height
 * and the revealed chips arrive one after another. Still with reduced
 * motion.
 *
 * **Accessibility**: one tab stop, arrows move between items; each item
 * says pressed or not, never by colour alone (chips carry a tick); an icon
 * alone needs an `aria-label`. The « +N de plus » chip is a button of its
 * own that says whether the group is unfolded.
 *
 * @summary A segmented choice, or chips to toggle.
 */
function ToggleGroup({
  className,
  variant = 'default',
  maxVisible = Number.POSITIVE_INFINITY,
  size = 'default',
  labels,
  ...props
}: ToggleGroupProps) {
  if (variant === 'chips') {
    return (
      <ChipGroup
        maxVisible={maxVisible}
        size={size}
        className={className}
        labels={labels}
        {...props}
      />
    )
  }
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      className={cn(
        'inline-flex w-fit items-center gap-1 rounded-full bg-tray p-1',
        className,
      )}
      {...props}
    />
  )
}

type ToggleGroupItemProps = TogglePrimitive.Props & {
  /** Its tint once pressed; white by default, neutral grey for chips. */
  color?: Color
}

/** @summary One button of a ToggleGroup, or one chip. */
function ToggleGroupItem({
  className,
  color,
  children,
  ...props
}: ToggleGroupItemProps) {
  const chips = useContext(ChipContext)

  if (chips) {
    return (
      <TogglePrimitive
        data-slot="toggle-group-item"
        data-variant="chips"
        className={cn(
          'group/chip relative inline-flex max-w-full rounded-full text-sm font-medium text-fg-muted outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-50 data-[pressed]:text-fg [&_svg]:pointer-events-none [&_svg]:shrink-0',
          className,
        )}
        render={(buttonProps, state) => (
          <button {...buttonProps}>
            <ChipBody
              pressed={state.pressed}
              color={color ?? 'neutral'}
              size={chips.size}
            >
              {buttonProps.children}
            </ChipBody>
          </button>
        )}
        {...props}
      >
        {children}
      </TogglePrimitive>
    )
  }

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      className={cn(
        "inline-flex h-7 min-w-7 shrink-0 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium whitespace-nowrap text-fg-muted transition-[color,background-color,box-shadow] outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-1 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-50 data-[pressed]:bg-control data-[pressed]:text-fg data-[pressed]:shadow-button max-md:h-9 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        color && pressed[color],
        className,
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  )
}

export { ToggleGroup, ToggleGroupItem }
export type { ToggleGroupItemProps, ToggleGroupLabels, ToggleGroupProps }
