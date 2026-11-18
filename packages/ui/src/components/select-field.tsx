import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { FieldValueProps } from '../internal/field-props.ts'
import { FieldShell } from './field-shell.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select.tsx'

type SelectFieldProps<TValue extends string> = FieldValueProps<TValue | ''> & {
  label: string
  options: readonly { value: TValue; label: string }[]
  /** Shown while nothing is chosen: an example, never the label. */
  placeholder?: string
  /** Said to screen readers; the look stays the same. */
  required?: boolean
  /** The list's height: sm, default or lg. */
  size?: 'sm' | 'default' | 'lg'
}

/**
 * One choice in a list, with its label, help and error. The value is ''
 * while nothing is chosen. For two to five choices seen at once, prefer
 * `RadioCardField`; never for a date or an amount.
 *
 * @summary A labelled list to pick one choice from.
 */
function SelectField<TValue extends string>({
  id,
  name,
  label,
  description,
  error,
  value,
  onValueChange,
  onBlur,
  options,
  placeholder,
  required,
  size,
}: SelectFieldProps<TValue>) {
  const { choose } = useGoGoUIMessages()

  return (
    <FieldShell
      id={id}
      name={name}
      label={label}
      description={description}
      error={error}
    >
      {(control) => (
        <Select
          // Gives the trigger the label of the chosen value, not its code.
          items={options}
          name={name}
          value={value === '' ? null : value}
          onValueChange={(next) => onValueChange((next as TValue | null) ?? '')}
          required={required}
        >
          <SelectTrigger
            {...control}
            size={size}
            onBlur={onBlur}
            className="w-full"
          >
            <SelectValue placeholder={placeholder ?? choose} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FieldShell>
  )
}

export { SelectField }
export type { SelectFieldProps }
