import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible'

/**
 * One section that opens and closes under its trigger.
 *
 * **Use it for** « Plus d'options », advanced settings, a long detail.
 * **Prefer** `Accordion` for several sections.
 *
 * **Where**: under the content it completes.
 *
 * **States**: closed, open.
 *
 * **Key props**: `open` / `defaultOpen` + `onOpenChange`.
 *
 * **Compose**: `Collapsible` > `CollapsibleTrigger` + `CollapsibleContent`.
 *
 * **Accessibility**: the trigger is a button with `aria-expanded`.
 *
 * @summary Show or hide a section under its trigger.
 */
function Collapsible({ ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({ ...props }: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
  )
}

function CollapsibleContent({ ...props }: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel data-slot="collapsible-content" {...props} />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
