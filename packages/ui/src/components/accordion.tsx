import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'
import { CaretDownIcon } from '@phosphor-icons/react'

import { cn } from '../lib/cn.ts'

/**
 * Several sections that open and close under their titles (a FAQ, the
 * details of an offer). One open at a time by default; `multiple` lets
 * several stay open. Compose it: `Accordion` > `AccordionItem` >
 * `AccordionTrigger` + `AccordionContent`. For a single section, use
 * `Collapsible`.
 *
 * @summary Sections that open and close under their titles.
 */
function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn('flex w-full flex-col', className)}
      {...props}
    />
  )
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('border-b border-line last:border-b-0', className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group/accordion-trigger flex min-h-11 flex-1 items-center justify-between gap-4 rounded-md py-3 text-left text-sm font-medium text-fg outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus disabled:pointer-events-none disabled:opacity-50',
          className,
        )}
        {...props}
      >
        {children}
        <CaretDownIcon
          aria-hidden="true"
          className="size-4 shrink-0 text-fg-subtle transition-transform duration-200 group-data-[panel-open]/accordion-trigger:rotate-180 motion-reduce:transition-none"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="h-(--accordion-panel-height) overflow-hidden text-sm text-fg-muted transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none"
      {...props}
    >
      <div className={cn('pb-4', className)}>{children}</div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
