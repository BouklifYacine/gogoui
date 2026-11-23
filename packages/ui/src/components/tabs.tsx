import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn.ts'

/**
 * Views of the same subject, one at a time.
 *
 * **Use it for** a record's parts (Détails, Paiements, Historique).
 * **Prefer** `ListTabs` to switch the rows of one list, `PillTabsList` for
 * a light look, `ToggleGroup` for a display choice.
 *
 * **Where**: under a page's or a card's title.
 *
 * **States**: tab chosen, hover, focus, disabled.
 *
 * **Key props**: `value` / `defaultValue` + `onValueChange`, `orientation`;
 * on `TabsList` `variant` (default, line) and `size` (sm, default, lg).
 *
 * **Compose**: `Tabs` > `TabsList` > `TabsTrigger`s + `TabsContent`s.
 *
 * **Accessibility**: arrows move between tabs; Tab goes into the panel.
 *
 * @summary Switch between views of the same subject.
 */
function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        'group/tabs flex gap-2 data-horizontal:flex-col',
        className,
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  'group/tabs-list inline-flex w-fit items-center justify-center text-fg-muted group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col',
  {
    variants: {
      variant: {
        // Segmented: a tray, the chosen tab raised on it, its corners
        // concentric with the tray's.
        default:
          'gap-1 rounded-parent-lg bg-tray p-1 group-data-horizontal/tabs:h-9',
        // Line: an underline under the chosen tab.
        line: 'gap-6 rounded-none border-b border-line bg-transparent group-data-horizontal/tabs:h-12',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function TabsList({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: TabsPrimitive.List.Props &
  VariantProps<typeof tabsListVariants> & {
    /** The tray's height: sm 32 px, default 36 px, lg 44 px. */
    size?: 'sm' | 'default' | 'lg'
  }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      data-size={size}
      className={cn(
        tabsListVariants({ variant }),
        variant === 'default' &&
          'data-[size=sm]:group-data-horizontal/tabs:h-8 data-[size=lg]:group-data-horizontal/tabs:h-11 data-[size=lg]:text-base',
        className,
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-full flex-1 items-center justify-center gap-2 rounded-concentric-1 px-2 text-sm font-medium whitespace-nowrap text-fg-muted transition-[color,background-color,box-shadow] duration-150 ease-tactile outline-none group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-fg focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-60 aria-disabled:pointer-events-none aria-disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        'group-data-[variant=default]/tabs-list:data-active:bg-raised group-data-[variant=default]/tabs-list:data-active:text-fg group-data-[variant=default]/tabs-list:data-active:shadow-sm',
        'group-data-[variant=line]/tabs-list:flex-none group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:px-0 group-data-[variant=line]/tabs-list:data-active:text-fg group-data-[variant=line]/tabs-list:data-active:[&_svg]:text-primary',
        'after:absolute after:bg-primary after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:-bottom-px group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn('flex-1 text-sm outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
