import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible'

/**
 * A section that opens and closes under its trigger, the rest of the page
 * making room: « Plus d’options ». Compose it: `Collapsible` >
 * `CollapsibleTrigger` + `CollapsibleContent`.
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
