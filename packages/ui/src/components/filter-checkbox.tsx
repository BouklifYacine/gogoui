import { useFilterLayout } from '../internal/filter-layout.ts'
import { cn } from '../lib/cn.ts'
import { Checkbox } from './checkbox.tsx'

type FilterCheckboxProps = {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

/**
 * One on / off filter (« Avec acompte payé »).
 *
 * **Key props**: `label`, `checked` + `onCheckedChange`.
 *
 * @summary One on/off filter.
 */
function FilterCheckbox({
  label,
  checked,
  onCheckedChange,
}: FilterCheckboxProps) {
  const layout = useFilterLayout()
  return (
    <label
      className={cn(
        'flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-1 font-medium hover:bg-hover',
        layout.mode === 'full' &&
          layout.panel &&
          'px-3 has-data-checked:bg-selected',
      )}
    >
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
      {label}
    </label>
  )
}

export { FilterCheckbox }
export type { FilterCheckboxProps }
