import { useContext } from 'react'
import { Select as SelectPrimitive } from '@base-ui/react/select'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { GoGoIcon } from './gogo-icon.tsx'
import { SelectSharedContext } from './select-context.ts'
import { SelectMorphValue } from './select-morph-value.tsx'

/**
 * The top row of a morph Select's open list, after Arc UI
 * (https://uiarc.dev, MIT): the trigger's place, with its value and its
 * turned chevron, so the button seems to have become the list. Pressing it
 * folds the list back (Escape does too, from the keyboard).
 *
 * @summary Internal: the lid of SelectContent variant="morph".
 */
export function SelectMorphLid() {
  const shared = useContext(SelectSharedContext)
  const { close } = useGoGoUIMessages()

  return (
    <div
      data-slot="select-morph-lid"
      className="relative flex h-(--anchor-height) shrink-0 items-center pr-9 pl-3 text-sm"
    >
      <SelectPrimitive.Value
        placeholder={shared?.placeholder}
        render={(props, state) => (
          <SelectMorphValue
            {...props}
            value={state.value}
            isPlaceholder={state.placeholder}
          />
        )}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={close}
        onClick={() => shared?.actionsRef.current?.close()}
        className="absolute inset-0 cursor-pointer outline-none"
      />
      <GoGoIcon
        name="chevronDown"
        aria-hidden="true"
        className="pointer-events-none absolute right-3 size-3.5 rotate-180 text-fg-subtle"
      />
    </div>
  )
}
