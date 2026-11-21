import { NavigationMenu as NavigationMenuPrimitive } from '@base-ui/react/navigation-menu'

import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { cn } from '../lib/cn.ts'

/**
 * A website's top navigation, its menus opening panels of links.
 *
 * **Use it for** a public site or a docs site with groups of pages. **Not
 * for** an app's own navigation (`Sidebar`).
 *
 * **Where**: in the site's header.
 *
 * **Compose**: `NavigationMenu` > `NavigationMenuList` >
 * `NavigationMenuItem`s with a `NavigationMenuTrigger` +
 * `NavigationMenuContent`, or a `NavigationMenuLink` alone.
 *
 * **Accessibility**: a `nav`; each panel opens with Enter and arrows.
 *
 * @summary A site's top navigation with panels of links.
 */
function NavigationMenu({
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Root.Props) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      className={cn('relative', className)}
      {...props}
    >
      {children}
      <NavigationMenuPrimitive.Portal>
        <NavigationMenuPrimitive.Positioner
          sideOffset={8}
          collisionPadding={16}
          className="isolate z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom] duration-200 ease-tactile data-instant:transition-none"
        >
          <NavigationMenuPrimitive.Popup className="relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) overflow-hidden rounded-2xl bg-floating text-fg shadow-menu transition-[opacity,scale,width,height] duration-200 ease-tactile data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <NavigationMenuPrimitive.Viewport className="relative size-full overflow-hidden" />
          </NavigationMenuPrimitive.Popup>
        </NavigationMenuPrimitive.Positioner>
      </NavigationMenuPrimitive.Portal>
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({
  className,
  ...props
}: NavigationMenuPrimitive.List.Props) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn('flex list-none items-center gap-1', className)}
      {...props}
    />
  )
}

function NavigationMenuItem({
  className,
  ...props
}: NavigationMenuPrimitive.Item.Props) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn('relative', className)}
      {...props}
    />
  )
}

const triggerStyle =
  'inline-flex h-9 items-center justify-center gap-1 rounded-lg px-3 text-sm font-medium text-fg-muted transition-colors outline-none hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus data-popup-open:bg-hover data-popup-open:text-fg max-md:h-11'

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Trigger.Props) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(triggerStyle, 'group/nav-trigger', className)}
      {...props}
    >
      {children}
      <NavigationMenuPrimitive.Icon className="transition-transform duration-200 group-data-popup-open/nav-trigger:rotate-180">
        <GoGoIcon name="chevronDown" aria-hidden="true" className="size-3.5" />
      </NavigationMenuPrimitive.Icon>
    </NavigationMenuPrimitive.Trigger>
  )
}

function NavigationMenuContent({
  className,
  ...props
}: NavigationMenuPrimitive.Content.Props) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        'w-max p-2 transition-[opacity,translate] duration-200 ease-tactile data-ending-style:opacity-0 data-starting-style:opacity-0 data-[activation-direction=left]:data-starting-style:-translate-x-4 data-[activation-direction=right]:data-starting-style:translate-x-4',
        className,
      )}
      {...props}
    />
  )
}

function NavigationMenuLink({
  className,
  ...props
}: NavigationMenuPrimitive.Link.Props) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        'flex flex-col gap-0.5 rounded-lg p-3 text-sm text-fg outline-none hover:bg-hover focus-visible:outline-2 focus-visible:outline-line-focus data-active:font-medium',
        className,
      )}
      {...props}
    />
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  triggerStyle as navigationMenuTriggerStyle,
}
