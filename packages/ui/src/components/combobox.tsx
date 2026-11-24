import * as React from 'react'
import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { FollowHeight } from '../internal/follow-height.tsx'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { MenuHighlight } from '../internal/menu-highlight.tsx'
import { menuRow } from '../internal/menu-styles.ts'
import { blur, duration, ease } from '../internal/motion.ts'
import { cn } from '../lib/cn.ts'
import { Button } from './button.tsx'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from './input-group.tsx'

/**
 * A field that filters a long list as you type, then picks one value, or
 * several as chips.
 *
 * **Use it for** a client, a city, a country, a tag among dozens. **Prefer**
 * `SelectField` under 15 known options, `Command` for actions.
 *
 * **Where**: in a form or a filter.
 *
 * **States**: empty, typing (filtered), no result (`ComboboxEmpty`), chosen,
 * several chosen (chips), disabled.
 *
 * **Key props**: on `Combobox` `items`, `value` + `onValueChange`,
 * `multiple`; on `ComboboxInput` `showTrigger`, `showClear`.
 *
 * **Compose**: `Combobox` > `ComboboxInput` + `ComboboxContent` >
 * `ComboboxEmpty` + `ComboboxList` > `ComboboxItem`s; for several values
 * `ComboboxChips` around the chips and the input.
 *
 * **Motion**, after Arc UI (https://uiarc.dev, MIT): the list opens like
 * the menus and its height follows the filter on a spring; a highlight
 * glides from row to row; a picked label settles into the field; the ×
 * pops in. Still with reduced motion.
 *
 * **Accessibility**: arrows move in the list, Enter picks; give it a label.
 *
 * @summary Type to filter a long list, then pick a value.
 */
const Combobox = ComboboxPrimitive.Root

// A picked label settles into the field: it rises from below out of a soft
// blur (Arc UI). Several values (chips) leave the field empty: nothing to
// settle.
function settleLabel(row: HTMLElement) {
  const list = row.closest("[role='listbox']")
  if (!list?.id || list.getAttribute('aria-multiselectable') === 'true') {
    return
  }
  const input = document.querySelector<HTMLInputElement>(
    `input[aria-controls="${CSS.escape(list.id)}"]`,
  )
  input?.animate(
    [
      {
        opacity: 0,
        transform: 'translateY(0.35em)',
        filter: `blur(${blur.soft}px)`,
      },
      { opacity: 1, transform: 'none', filter: 'blur(0px)' },
    ],
    {
      duration: duration.standard * 1000,
      easing: `cubic-bezier(${ease.enter.join(', ')})`,
    },
  )
}

// Clearing fades the placeholder in, instead of snapping from the label.
function fadeInField(button: HTMLElement) {
  button
    .closest("[data-slot='input-group']")
    ?.querySelector('input')
    ?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: duration.fast * 1000,
      easing: `cubic-bezier(${ease.enter.join(', ')})`,
    })
}

function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />
}

function ComboboxTrigger({
  className,
  children,
  ...props
}: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn(
        "group/combobox-trigger [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...props}
    >
      {children}
      <GoGoIcon
        name="chevronDown"
        aria-hidden="true"
        className="pointer-events-none size-3.5 text-fg-subtle transition-[rotate] duration-(--motion-spring) ease-spring group-data-popup-open/combobox-trigger:rotate-180"
      />
    </ComboboxPrimitive.Trigger>
  )
}

function ComboboxClear({
  className,
  onClick,
  ...props
}: ComboboxPrimitive.Clear.Props) {
  const reduce = useReduceMotion()
  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      // It pops in and out (combobox-clear in styles.css).
      render={<InputGroupButton variant="ghost" size="icon-xs" />}
      className={cn(className)}
      onClick={(event) => {
        if (!reduce) {
          fadeInField(event.currentTarget)
        }
        onClick?.(event)
      }}
      {...props}
    >
      <GoGoIcon name="close" className="pointer-events-none" />
    </ComboboxPrimitive.Clear>
  )
}

/** The words ComboboxInput writes, to change on one ComboboxInput only. */
type ComboboxInputLabels = Partial<
  Pick<GoGoUIMessages, 'showOptions' | 'clear'>
>

/** **Key props**: `labels` to change its words. */
function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  labels,
  ...props
}: ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean
  showClear?: boolean
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: ComboboxInputLabels
}) {
  const { showOptions, clear } = useGoGoUIMessages(labels)
  return (
    <InputGroup className={cn('w-auto', className)}>
      <ComboboxPrimitive.Input
        render={<InputGroupInput disabled={disabled} />}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        {showTrigger && (
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            render={<ComboboxTrigger />}
            data-slot="input-group-button"
            // Only an arrow shows: its name is for a screen reader.
            aria-label={showOptions}
            className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
            disabled={disabled}
          />
        )}
        {showClear && <ComboboxClear aria-label={clear} disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  )
}

function ComboboxContent({
  className,
  side = 'bottom',
  sideOffset = 6,
  align = 'start',
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    'side' | 'align' | 'sideOffset' | 'alignOffset' | 'anchor'
  >) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          data-chips={!!anchor}
          className={cn(
            // Its entrance and exit live in styles.css (combobox-content),
            // like the menus'.
            'group/combobox-content relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] overflow-hidden rounded-parent-menu bg-floating text-fg shadow-menu outline-none data-[chips=true]:min-w-(--anchor-width) *:data-[slot=input-group]:m-1.5 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:shadow-none',
            className,
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

/**
 * The rows. Its height follows the filter on a spring, so the list never
 * jumps, and a highlight glides from row to row (the menus' own).
 *
 * @summary The filtered rows of a Combobox.
 */
function ComboboxList({
  className,
  children,
  ...props
}: ComboboxPrimitive.List.Props) {
  return (
    <FollowHeight>
      <ComboboxPrimitive.List
        data-slot="combobox-list"
        className={cn(
          'no-scrollbar relative max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1.5 overflow-y-auto overscroll-contain p-1.5 data-empty:p-0',
          className,
        )}
        {...props}
      >
        <MenuHighlight />
        {typeof children === 'function' ? (
          <ComboboxPrimitive.Collection>
            {children}
          </ComboboxPrimitive.Collection>
        ) : (
          children
        )}
      </ComboboxPrimitive.List>
    </FollowHeight>
  )
}

function ComboboxItem({
  className,
  children,
  onClick,
  ...props
}: ComboboxPrimitive.Item.Props) {
  const reduce = useReduceMotion()
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        // Its background is the gliding highlight (MenuHighlight).
        menuRow,
        'w-full pr-9',
        className,
      )}
      onClick={(event) => {
        if (!reduce) {
          settleLabel(event.currentTarget)
        }
        onClick?.(event)
      }}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2.5 flex size-4 items-center justify-center" />
        }
      >
        <GoGoIcon name="check" className="pointer-events-none" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  )
}

function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return (
    <ComboboxPrimitive.Group
      data-slot="combobox-group"
      className={cn(className)}
      {...props}
    />
  )
}

function ComboboxLabel({
  className,
  ...props
}: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-label"
      className={cn(
        'px-2.5 pt-2 pb-1 text-xs font-medium text-fg-subtle',
        className,
      )}
      {...props}
    />
  )
}

function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props) {
  return (
    <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />
  )
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        // It rises as it fades in (combobox-empty in styles.css).
        'hidden w-full justify-center px-3 py-3 text-center text-sm text-fg-subtle group-data-empty/combobox-content:flex',
        className,
      )}
      {...props}
    />
  )
}

function ComboboxSeparator({
  className,
  ...props
}: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      className={cn('-mx-1.5 my-1 h-px bg-line-subtle', className)}
      {...props}
    />
  )
}

function ComboboxChips({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> &
  ComboboxPrimitive.Chips.Props) {
  return (
    <ComboboxPrimitive.Chips
      data-slot="combobox-chips"
      className={cn(
        'flex min-h-9 flex-wrap items-center gap-1 rounded-lg bg-field px-3 py-1 text-sm shadow-field ring-1 ring-field-line transition-[box-shadow] ring-inset hover:ring-fg-subtle focus-within:ring-line-focus has-aria-invalid:ring-danger has-data-[slot=combobox-chip]:px-1',
        className,
      )}
      {...props}
    />
  )
}

function ComboboxChip({
  className,
  children,
  showRemove = true,
  removeLabel,
  ...props
}: ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean
  /** The name of the ×, read aloud. « Retirer <the chip's words> » by default. */
  removeLabel?: string
}) {
  const { removeTag, removeChoice } = useGoGoUIMessages()
  const removeName =
    removeLabel ??
    (typeof children === 'string' ? removeTag(children) : removeChoice)
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={cn(
        'flex h-6 w-fit items-center justify-center gap-1 rounded-full bg-control px-2 text-xs font-medium whitespace-nowrap text-fg shadow-button has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0',
        className,
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          render={<Button variant="ghost" size="icon-xs" />}
          className="-ml-1 opacity-50 hover:opacity-100"
          data-slot="combobox-chip-remove"
          aria-label={removeName}
        >
          <GoGoIcon name="close" className="pointer-events-none" />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  )
}

function ComboboxChipsInput({
  className,
  ...props
}: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chip-input"
      className={cn('min-w-16 flex-1 outline-none', className)}
      {...props}
    />
  )
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null)
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
}
export type { ComboboxInputLabels }
