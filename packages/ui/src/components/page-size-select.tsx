import { useId } from 'react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select.tsx'

type PageSizeSelectProps = {
  value: number
  onValueChange: (size: number) => void
  /** The sizes offered, 10, 20 and 25 by default. */
  sizes?: readonly number[]
}

/**
 * How many rows a page of a list shows.
 *
 * **Key props**: `value` + `onValueChange`, `sizes` (25, 50, 100),
 * `label`.
 *
 * @summary How many rows a page of a list shows.
 */
function PageSizeSelect({
  value,
  onValueChange,
  sizes = [10, 20, 25],
}: PageSizeSelectProps) {
  const labelId = useId()
  const { rowsPerPage } = useGoGoUIMessages()
  const options = sizes.map((size) => ({
    value: String(size),
    label: String(size),
  }))

  return (
    <div data-slot="page-size-select" className="flex items-center gap-2">
      <span id={labelId} className="text-fg-muted">
        {rowsPerPage}
      </span>
      <Select
        items={options}
        value={String(value)}
        onValueChange={(next) => {
          const size = sizes.find((option) => String(option) === next)
          if (size) {
            onValueChange(size)
          }
        }}
      >
        <SelectTrigger aria-labelledby={labelId} className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export { PageSizeSelect }
export type { PageSizeSelectProps }
