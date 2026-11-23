import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { ButtonGroupSurface } from '../internal/button-group-surface.tsx'
import type { Color } from '../internal/colors.ts'
import { cn } from '../lib/cn.ts'

import { Separator } from './separator.tsx'

const buttonGroupVariants = cva(
  "flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-lg [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          '*:data-slot:rounded-r-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-lg! [&>[data-slot]~[data-slot]]:rounded-l-none [&>[data-slot]~[data-slot]]:border-l-0',
        vertical:
          'flex-col *:data-slot:rounded-b-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-lg! [&>[data-slot]~[data-slot]]:rounded-t-none [&>[data-slot]~[data-slot]]:border-t-0',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  },
)

type ButtonGroupProps = React.ComponentProps<'div'> &
  VariantProps<typeof buttonGroupVariants> & {
    /**
     * `default`: buttons glued edge to edge, each with its own fill.
     * `surface`: one surface, hairline separators, and one highlight that
     * glides to the button pointed at (put `ghost` buttons in it).
     */
    variant?: 'default' | 'surface'
    /** `surface` only: fills the surface in a colour (a main group of actions). */
    color?: Color
    /**
     * `surface` only, on by default: when the row does not fit, the buttons
     * with an icon keep only their icon (their words stay for screen
     * readers). Horizontal only.
     */
    collapseLabels?: boolean
  }

/**
 * Buttons joined into one control.
 *
 * **Use it for** actions of the same subject side by side (« Précédent |
 * Suivant », a button and its menu, « Copier | Partager | … »). **Not for**
 * one choice among a few (`ToggleGroup`).
 *
 * **Where**: toolbars, table headers, pagination, a document's actions.
 *
 * **States** (`surface`): a highlight under the button pointed at, pressed
 * (darker) or reached with the keyboard; none over a disabled one; the
 * separators beside it step aside; labels folded into icons when the row
 * does not fit.
 *
 * **Compose**: `ButtonGroup` > `Button`s (`variant="ghost"` in a
 * `surface`), a `DropdownMenuTrigger` rendered as a `Button` for « … »,
 * `ButtonGroupText`, `ButtonGroupSeparator` (`default` only).
 *
 * **Key props**: `variant` (default, surface), `orientation` (horizontal,
 * vertical), `color` and `collapseLabels` (surface).
 *
 * **Accessibility**: `role="group"`; give it an `aria-label` when the
 * buttons do not say what they share. In a `surface`, Tab visits each
 * button and the arrows, Home and End move between them too; a label that
 * changes right after a press (« Copié ») is read once.
 *
 * @summary Buttons joined into one control, or one surface with a gliding highlight.
 */
function ButtonGroup({
  className,
  orientation,
  variant = 'default',
  color,
  collapseLabels,
  ...props
}: ButtonGroupProps) {
  if (variant === 'surface') {
    return (
      <ButtonGroupSurface
        className={className}
        orientation={orientation}
        color={color}
        collapseLabels={collapseLabels}
        {...props}
      />
    )
  }
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

function ButtonGroupText({
  className,
  render,
  ...props
}: useRender.ComponentProps<'div'>) {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        className: cn(
          "flex items-center gap-2 rounded-lg border bg-muted px-2.5 text-sm font-medium [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: 'button-group-text',
    },
  })
}

function ButtonGroupSeparator({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        'relative self-stretch bg-input data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto',
        className,
      )}
      {...props}
    />
  )
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}
export type { ButtonGroupProps }
