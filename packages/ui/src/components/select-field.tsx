import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { FieldValueProps } from '../internal/field-props.ts'
import { useControllableState } from '../internal/use-controllable-state.ts'
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
 * A labelled list to pick one choice from.
 *
 * **Use it for** 5 to 15 known options in a form. **Prefer**
 * `RadioCardField` under 5 when each needs a picture or a sentence,
 * `Combobox` when people search.
 *
 * **States**: placeholder, chosen, open, disabled, invalid.
 *
 * **Key props**: `label`, `options` (`{ value, label }[]`), `value` +
 * `onValueChange` (controlled) or `defaultValue` (uncontrolled),
 * `placeholder`, `required`, `error`, `description`, `size`.
 *
 * **Accessibility**: label and error wired; letters jump to options.
 *
 * @summary A labelled list to pick one choice from.
 */
function SelectField<TValue extends string>({
  id,
  name,
  label,
  description,
  error,
  value: valueProp,
  defaultValue = '',
  onValueChange,
  onBlur,
  options,
  placeholder,
  required,
  size,
}: SelectFieldProps<TValue>) {
  const { choose } = useGoGoUIMessages()
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })

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
          onValueChange={(next) => setValue((next as TValue | null) ?? '')}
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
