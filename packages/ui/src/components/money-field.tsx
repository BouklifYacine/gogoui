import { CurrencyEurIcon } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

import type { FieldValueProps } from '../internal/field-props.ts'
import { FieldShell } from './field-shell.tsx'
import { InputWithIcon } from './input-with-icon.tsx'

type MoneyFieldProps = FieldValueProps<string> & {
  label: string
  placeholder?: string
  required?: boolean
  /** The currency's icon, the euro by default. */
  icon?: Icon
  /** The field's height: sm, default or lg. */
  size?: 'sm' | 'default' | 'lg'
}

/**
 * A labelled amount, typed the way people write it.
 *
 * **Use it for** a price, a deposit, a budget. Accepts « 1 200,50 » and
 * « 1200.5 ».
 *
 * **States**: empty, filled, invalid.
 *
 * **Key props**: `label`, `value` (the typed text: your form's schema turns
 * it into a number or says what is wrong) + `onValueChange`, `error`,
 * `description`, `placeholder`, `required`, `size`, `icon` (the currency,
 * the euro by default).
 *
 * **Accessibility**: a decimal keyboard on a phone; the currency is read
 * with the label.
 *
 * @summary A labelled amount, typed as people write it.
 */
function MoneyField({
  id,
  name,
  label,
  description,
  error,
  value,
  onValueChange,
  onBlur,
  // None by default: a grey amount in an empty field reads as one already
  // typed. An example goes in the description instead.
  placeholder,
  required,
  icon = CurrencyEurIcon,
  size,
}: MoneyFieldProps) {
  return (
    <FieldShell
      id={id}
      name={name}
      label={label}
      description={description}
      error={error}
    >
      {(control) => (
        <InputWithIcon
          icon={icon}
          size={size}
          {...control}
          name={name}
          // type="number" would refuse « 3 000 » and lose the comma.
          inputMode="decimal"
          autoComplete="off"
          placeholder={placeholder}
          required={required}
          className="text-base tabular-nums"
          value={value}
          onBlur={onBlur}
          onChange={(event) => onValueChange(event.target.value)}
        />
      )}
    </FieldShell>
  )
}

export { MoneyField }
export type { MoneyFieldProps }
