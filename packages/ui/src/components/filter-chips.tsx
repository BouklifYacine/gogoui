import { GoGoIcon } from '../internal/gogo-icon.tsx'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { Button } from './button.tsx'

/** One filter that is on (« Étape : Nouvelle ») and how to take it off. */
type FilterChip = {
  /** Unique in the list: the chip's id is built from it. */
  id: string
  label: string
  onRemove: () => void
}

type FilterChipsProps = {
  chips: FilterChip[]
  onReset: () => void
  /** Where the focus goes once the last chip is gone (the search's glass). */
  fallbackFocusId?: string
}

// Once the screen has been redrawn without the chip.
function focusSoon(id: string) {
  requestAnimationFrame(() => document.getElementById(id)?.focus())
}

/**
 * The filters that are on, each a chip that removes it.
 *
 * **Use it for** showing what narrows a list, under its toolbar.
 *
 * **Key props**: `chips` (`{ id, label, onRemove }[]`), `onReset`
 * (« Tout effacer »), `fallbackFocusId` (where the focus goes when the last
 * chip is gone).
 *
 * **Accessibility**: each chip says « Retirer le filtre … ».
 *
 * @summary The filters that are on, each a chip that removes it.
 */
function FilterChips({ chips, onReset, fallbackFocusId }: FilterChipsProps) {
  const messages = useGoGoUIMessages()
  if (chips.length === 0) {
    return null
  }

  const chipId = (chip: FilterChip) => `filter-chip-${chip.id}`

  function remove(index: number) {
    const next = chips[index + 1] ?? chips[index - 1]
    chips[index]?.onRemove()
    const target = next ? chipId(next) : fallbackFocusId
    if (target) {
      focusSoon(target)
    }
  }

  return (
    <div
      role="group"
      aria-label={messages.activeFilters}
      data-slot="filter-chips"
      className="flex flex-wrap items-center gap-2"
    >
      {chips.map((chip, index) => (
        <Button
          key={chip.id}
          id={chipId(chip)}
          aria-label={messages.removeFilter(chip.label)}
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-md bg-tray pe-2 font-normal"
          onClick={() => remove(index)}
        >
          {chip.label}
          <GoGoIcon
            name="close"
            aria-hidden="true"
            className="text-fg-subtle"
          />
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          onReset()
          if (fallbackFocusId) {
            focusSoon(fallbackFocusId)
          }
        }}
      >
        {messages.resetFilters}
      </Button>
    </div>
  )
}

export { FilterChips }
export type { FilterChip, FilterChipsProps }
