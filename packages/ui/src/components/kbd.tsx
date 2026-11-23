import { cn } from '../lib/cn.ts'

/**
 * A keyboard key shown in a text, drawn as a key cap after Arc UI
 * (https://uiarc.dev, MIT): a thin edge, a heavier one underneath, so it
 * reads as a key without a shadow.
 *
 * **Use it for** shortcuts in a menu, a tooltip or help: « Ctrl K », « / ».
 *
 * **States**: at rest; held (`data-pressed`), it sinks a pixel and lights
 * up, as `ShortcutKeys` draws keys held down.
 *
 * **Compose**: several keys in `KbdGroup`; a whole shortcut, spoken in
 * full, in `ShortcutKeys`.
 *
 * **Accessibility**: a `kbd` element; write keys the way the platform does.
 *
 * @summary A keyboard key shown in a text.
 */
function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-[5px] border border-b-2 border-line-strong bg-raised px-1 font-sans text-xs leading-none font-medium text-fg-muted tabular-nums select-none [&_svg:not([class*='size-'])]:size-3",
        // Held: a pixel down, lit; quick to sink, springing back up.
        'transition-[translate,border-color,border-bottom-width,background-color,color] duration-(--motion-spring) ease-spring data-pressed:translate-y-px data-pressed:border-b data-pressed:border-primary-subtle-stronger data-pressed:bg-primary-subtle data-pressed:text-primary-active data-pressed:duration-100 motion-reduce:transition-none motion-reduce:data-pressed:translate-y-0',
        'in-data-[slot=tooltip-content]:border-transparent in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10',
        className,
      )}
      {...props}
    />
  )
}

function KbdGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn('inline-flex items-center gap-1', className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }
