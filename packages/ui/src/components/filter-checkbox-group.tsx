import { ListBulletsIcon } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

import { useFilterLayout } from '../internal/filter-layout.ts'
import { FilterRow } from '../internal/filter-row.tsx'
import { cn } from '../lib/cn.ts'
import { Checkbox } from './checkbox.tsx'

type FilterCheckboxGroupProps<TValue extends string> = {
  legend: string
  options: readonly { value: TValue; label: string }[]
  checked: TValue | undefined
  onCheckedChange: (value: TValue | undefined) => void
  /** Its icon in the menu's sidebar. */
  icon?: Icon
}

/**
 * A group of a `FilterMenu` where one box at most is ticked: ticking one
 * unticks the other, ticking it again shows everything.
 *
 * @summary A filter group of boxes, one ticked at most.
 */
function FilterCheckboxGroup<TValue extends string>({
  legend,
  options,
  checked,
  onCheckedChange,
  icon = ListBulletsIcon,
}: FilterCheckboxGroupProps<TValue>) {
  const layout = useFilterLayout()
  if (layout.mode === 'row') {
    return (
      <FilterRow
        label={legend}
        summary={
          options.find((option) => option.value === checked)?.label ?? null
        }
        onOpen={layout.open}
        icon={icon}
      />
    )
  }

  return (
    <fieldset className="flex flex-col">
      <legend className="pb-1 font-medium">{legend}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            'flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-1 hover:bg-hover',
            layout.panel && 'px-3 has-data-checked:bg-selected',
          )}
        >
          <Checkbox
            checked={checked === option.value}
            onCheckedChange={(tick) =>
              onCheckedChange(tick ? option.value : undefined)
            }
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  )
}

export { FilterCheckboxGroup }
export type { FilterCheckboxGroupProps }
