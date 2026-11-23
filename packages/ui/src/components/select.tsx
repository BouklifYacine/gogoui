import { Select as SelectPrimitive } from '@base-ui/react/select'
import { useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ComponentProps, MouseEvent, ReactNode, Ref } from 'react'

import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { MenuHighlight } from '../internal/menu-highlight.tsx'
import { menuPanel, menuRow } from '../internal/menu-styles.ts'
import { SelectChipList } from '../internal/select-chip-list.tsx'
import { SelectSharedContext } from '../internal/select-context.ts'
import type { SelectPick, SelectShared } from '../internal/select-context.ts'
import { SelectMorphLid } from '../internal/select-morph-lid.tsx'
import { SelectRollingValue } from '../internal/select-rolling-value.tsx'
import { cn } from '../lib/cn.ts'

/**
 * A closed list of choices to pick one from, or several (`multiple`).
 *
 * **Use it for** one value among 5 to 15 known options; with `multiple`, a
 * few values from a short list (spaces, stages). **Not for** a list people
 * search (`Combobox`), under 5 options (`RadioGroup`), actions (`DropdownMenu`).
 * In a form, prefer `SelectField` or `MultiSelectField` (label, help, error).
 *
 * **Where**: in a form, a toolbar, a settings row.
 *
 * **States**: placeholder, chosen, open, disabled, invalid; with
 * `multiple`, chips then « +N ».
 *
 * **Compose**: `Select` > `SelectTrigger` (`SelectValue`, or `SelectChips`
 * with `multiple`) + `SelectContent` > `SelectItem`s (+ `SelectGroup`,
 * `SelectLabel`, `SelectSeparator`).
 *
 * **Key props**: on `Select` `value` + `onValueChange`, `items` (gives the
 * trigger each value's words), `multiple`; on `SelectTrigger` `size` (sm,
 * default, lg); on `SelectContent` `variant` (default, morph),
 * `alignItemWithTrigger`.
 *
 * **Motion**, after Arc UI (https://uiarc.dev, MIT): the list opens like the
 * menus, a highlight glides from row to row, the chosen value rolls in the
 * trigger the way the list runs, a tick draws itself; `variant="morph"`
 * grows the button itself into the list. All of it still with reduced
 * motion.
 *
 * **Accessibility**: typing a letter jumps to it; give it a label. The
 * trigger reads the real value once, never the moving copies.
 *
 * @summary A closed list to pick one value, or several, from.
 */
function Select<Value, Multiple extends boolean | undefined = false>({
  actionsRef,
  ...props
}: SelectPrimitive.Root.Props<Value, Multiple>) {
  const ownActionsRef = useRef<SelectPrimitive.Root.Actions | null>(null)
  const rootActionsRef = actionsRef ?? ownActionsRef
  const [placeholder, setPlaceholder] = useState<ReactNode>(null)
  const [pick, setPick] = useState<SelectPick | null>(null)
  const [order] = useState(() => new Map<unknown, number>())
  const [labels] = useState(() => new Map<unknown, string>())
  const { items, itemToStringLabel } = props
  const shared = useMemo<SelectShared>(
    () => ({
      items,
      itemToStringLabel: itemToStringLabel as
        ((value: unknown) => string) | undefined,
      order,
      labels,
      placeholder,
      setPlaceholder,
      pick,
      setPick,
      actionsRef: rootActionsRef,
    }),
    [
      items,
      itemToStringLabel,
      order,
      labels,
      placeholder,
      pick,
      rootActionsRef,
    ],
  )

  return (
    <SelectSharedContext value={shared}>
      <SelectPrimitive.Root {...props} actionsRef={rootActionsRef} />
    </SelectSharedContext>
  )
}

/** @summary A group of items under a SelectLabel. */
function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn('scroll-my-1', className)}
      {...props}
    />
  )
}

/**
 * The chosen value's words in the trigger, or the `placeholder` (an
 * example, never the field's label) while nothing is chosen. A new value
 * rolls in the way the list runs.
 *
 * @summary Shows the chosen value or the placeholder.
 */
function SelectValue({
  className,
  placeholder,
  ...props
}: SelectPrimitive.Value.Props) {
  const setPlaceholder = useContext(SelectSharedContext)?.setPlaceholder
  // Hands the placeholder to a morph list's lid.
  const handOver = useCallback(() => {
    setPlaceholder?.(placeholder)
  }, [setPlaceholder, placeholder])
  return (
    <SelectPrimitive.Value
      ref={handOver}
      data-slot="select-value"
      placeholder={placeholder}
      className={className}
      render={(valueProps, state) => (
        <SelectRollingValue
          {...valueProps}
          value={state.value}
          isPlaceholder={state.placeholder}
        />
      )}
      {...props}
    />
  )
}

type SelectChipsProps = Omit<SelectPrimitive.Value.Props, 'children'> & {
  /** Chips shown before the rest fold into « +N »; 2 by default. */
  maxVisible?: number
}

/**
 * The values of a multiple Select as chips, after Arc UI
 * (https://uiarc.dev, MIT): the first `maxVisible` open their place on a
 * spring, the rest fold into a « +N » that rolls. Use it in place of
 * `SelectValue` in the trigger of a `Select multiple`.
 *
 * @summary The chosen values of a multiple Select, as chips.
 */
function SelectChips({
  className,
  placeholder,
  maxVisible = 2,
  ...props
}: SelectChipsProps) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      placeholder={placeholder}
      className={className}
      render={(valueProps, state) => (
        <SelectChipList
          {...valueProps}
          values={Array.isArray(state.value) ? state.value : []}
          maxVisible={maxVisible}
          isPlaceholder={state.placeholder}
        />
      )}
      {...props}
    />
  )
}

type SelectTriggerProps = SelectPrimitive.Trigger.Props & {
  /** `sm` for a toolbar, `lg` for a big form; 44px on a phone either way. */
  size?: 'sm' | 'default' | 'lg'
}

/**
 * The button that opens the list: an Input's edge, the value, and a
 * chevron that turns over while the list is open.
 *
 * @summary The button showing the value and opening the list.
 */
function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        // Arc UI's field look; it never scales on press: the list measures it.
        "group/select-trigger flex w-fit items-center justify-between gap-2 rounded-lg bg-field px-3 text-sm text-fg whitespace-nowrap shadow-field ring-1 ring-field-line transition-[box-shadow] duration-150 ease-standard outline-none ring-inset select-none hover:ring-fg-subtle focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:ring-danger data-popup-open:ring-fg-subtle data-[size=default]:h-9 data-[size=default]:max-md:h-11 data-[size=lg]:h-11 data-[size=lg]:text-base data-[size=sm]:h-8 data-[size=sm]:rounded-md max-md:text-[16px] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <GoGoIcon
            name="chevronDown"
            aria-hidden="true"
            data-slot="select-icon"
            className="pointer-events-none size-3.5 text-fg-subtle transition-[rotate] duration-(--motion-spring) ease-spring group-data-popup-open/select-trigger:rotate-180"
          />
        }
      />
    </SelectPrimitive.Trigger>
  )
}

type SelectContentProps = SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset' | 'alignItemWithTrigger'
  > & {
    /**
     * `default` opens a list under the trigger; `morph` grows the trigger
     * itself into the list (`side`, `sideOffset` and
     * `alignItemWithTrigger` are then set for you).
     */
    variant?: 'default' | 'morph'
  }

/**
 * The list. It opens like the menus, its rows following one after another,
 * a highlight gliding from row to row. `variant="morph"` grows the trigger
 * itself into the list (Arc UI's morph select), and folds it back.
 *
 * @summary The open list of items, positioned on its trigger.
 */
function SelectContent({
  className,
  children,
  side = 'bottom',
  sideOffset = 6,
  align,
  alignOffset = 0,
  alignItemWithTrigger = false,
  variant = 'default',
  ...props
}: SelectContentProps) {
  if (variant === 'morph') {
    return (
      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          side="bottom"
          // The list's top row lands exactly on the trigger.
          sideOffset={({ anchor }) => -anchor.height}
          align={align ?? 'start'}
          alignOffset={alignOffset}
          alignItemWithTrigger={false}
          // Flipping or shifting would pull it off its trigger.
          collisionAvoidance={{ side: 'none', align: 'none' }}
          className="isolate z-50"
        >
          <SelectPrimitive.Popup
            data-slot="select-content"
            data-variant="morph"
            className={cn(
              // Its size, corners and fill change in styles.css (select-content morph).
              'relative isolate z-50 flex flex-col overflow-hidden bg-floating text-fg shadow-menu outline-none',
              className,
            )}
            {...props}
          >
            <div ref={followHeight} className="flex w-(--morph-width) flex-col">
              <SelectMorphLid />
              <div className="mx-3 h-px shrink-0 bg-line-subtle" />
              <SelectPrimitive.List className="relative max-h-[min(18.5rem,calc(var(--available-height)-var(--anchor-height)))] overflow-y-auto overscroll-contain p-1.5">
                <MenuHighlight />
                {children}
              </SelectPrimitive.List>
            </div>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    )
  }

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align ?? 'center'}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-variant="default"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            // Its entrance and exit live in styles.css (select-content).
            menuPanel,
            'isolate w-(--anchor-width) min-w-36 origin-(--transform-origin)',
            className,
          )}
          {...props}
        >
          <MenuHighlight />
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

// A morph list's open height is its content's: written straight on the
// popup as soon as it shows, so the first frame already knows where to grow.
function followHeight(inner: HTMLDivElement | null) {
  const popup = inner?.parentElement
  if (!inner || !popup) {
    return undefined
  }
  const write = () =>
    popup.style.setProperty('--morph-height', `${inner.offsetHeight}px`)
  write()
  if (typeof ResizeObserver === 'undefined') {
    return undefined
  }
  const observer = new ResizeObserver(write)
  observer.observe(inner)
  return () => observer.disconnect()
}

/** @summary The title of a SelectGroup. */
function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn(
        'px-2.5 pt-2 pb-1 text-xs font-medium text-fg-subtle',
        className,
      )}
      {...props}
    />
  )
}

type SelectItemProps = SelectPrimitive.Item.Props & {
  ref?: Ref<HTMLDivElement>
}

/**
 * One choice of the list; a chosen one gets a tick that draws itself (and
 * retracts when a multiple Select lets it go).
 *
 * @summary One value of the list.
 */
function SelectItem({
  className,
  children,
  value,
  ref,
  onClick,
  ...props
}: SelectItemProps) {
  const shared = useContext(SelectSharedContext)

  // Notes the row's place and words as the list shows, for the trigger.
  const register = (row: HTMLDivElement | null) => {
    if (typeof ref === 'function') {
      ref(row)
    } else if (ref) {
      ref.current = row
    }
    if (!row || !shared) {
      return
    }
    const list = row.closest("[role='listbox']") ?? row.parentElement
    const rows = list
      ? Array.from(list.querySelectorAll("[data-slot='select-item']"))
      : []
    shared.order.set(value, rows.indexOf(row))
    const text = row.querySelector("[data-slot='select-item-text']")
    shared.labels.set(value, text?.textContent ?? '')
  }

  // In a morph list, notes where the picked label sits, so it flies from
  // there into the lid.
  const notePick = (event: MouseEvent<HTMLDivElement>) => {
    const row = event.currentTarget
    const slot = row
      .closest("[data-slot='select-content']")
      ?.querySelector("[data-slot='select-morph-value']")
    const text = row.querySelector("[data-slot='select-item-text']")
    if (shared && slot && text) {
      const from = text.getBoundingClientRect()
      const to = slot.getBoundingClientRect()
      shared.setPick({
        value,
        x: from.left - to.left,
        y: from.top + from.height / 2 - (to.top + to.height / 2),
      })
    }
  }

  return (
    <SelectPrimitive.Item
      ref={register}
      data-slot="select-item"
      value={value}
      onClick={(event) => {
        notePick(event)
        onClick?.(event)
      }}
      className={cn(
        // Its background is the gliding highlight (MenuHighlight).
        menuRow,
        'w-full pr-9 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText
        data-slot="select-item-text"
        className="flex flex-1 shrink-0 gap-2 whitespace-nowrap"
      >
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        keepMounted
        render={
          <span className="pointer-events-none absolute right-2.5 flex size-4 items-center justify-center" />
        }
      >
        {/* A tick that draws itself and retracts (select-tick in styles.css). */}
        <svg
          data-slot="select-tick"
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none size-4"
        >
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

/** @summary A hairline between two groups of items. */
function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(
        'pointer-events-none -mx-1.5 my-1 h-px bg-line-subtle',
        className,
      )}
      {...props}
    />
  )
}

/** @summary Scrolls a long list up. Used by SelectContent. */
function SelectScrollUpButton({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-floating py-1 text-fg-subtle [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...props}
    >
      <GoGoIcon name="chevronUp" aria-hidden="true" />
    </SelectPrimitive.ScrollUpArrow>
  )
}

/** @summary Scrolls a long list down. Used by SelectContent. */
function SelectScrollDownButton({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-floating py-1 text-fg-subtle [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...props}
    >
      <GoGoIcon name="chevronDown" aria-hidden="true" />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectChips,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
export type { SelectChipsProps, SelectContentProps, SelectTriggerProps }
