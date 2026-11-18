import { Switch as SwitchPrimitive } from '@base-ui/react/switch'

import { cn } from '../lib/cn.ts'

/**
 * Turns a setting on or off at once, without a save button: « Recevoir les
 * e-mails ». For a choice saved with a form, prefer a Checkbox.
 *
 * @summary An on/off setting that applies at once.
 */
function Switch({
  className,
  size = 'default',
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: 'sm' | 'default'
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        'peer group/switch relative inline-flex shrink-0 items-center rounded-full p-1 transition-[background-color,box-shadow] duration-300 ease-tactile outline-none focus-visible:outline-hidden forced-colors:border after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:shadow-focus-primary aria-invalid:ring-1 aria-invalid:ring-danger data-[size=default]:h-6 data-[size=default]:w-10 data-[size=sm]:h-5 data-[size=sm]:w-8 data-checked:bg-switch-on data-unchecked:bg-track data-disabled:cursor-not-allowed data-disabled:opacity-60',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        // Toggle Switch (DesignBookmark): pressed, the knob stretches
        // toward where it goes; let go, it lands with a small bounce.
        className={cn(
          'pointer-events-none block rounded-full bg-white shadow-sm transition-[translate,width] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] data-unchecked:translate-x-0 motion-reduce:transition-none',
          'group-data-[size=default]/switch:h-4 group-data-[size=default]/switch:w-4 group-data-[size=default]/switch:group-active/switch:w-5 group-data-[size=default]/switch:data-checked:translate-x-4 group-data-[size=default]/switch:group-active/switch:data-checked:translate-x-3',
          'group-data-[size=sm]/switch:h-3 group-data-[size=sm]/switch:w-3 group-data-[size=sm]/switch:group-active/switch:w-4 group-data-[size=sm]/switch:data-checked:translate-x-3 group-data-[size=sm]/switch:group-active/switch:data-checked:translate-x-2',
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
