import type { ComponentType } from 'react'

import type { FieldValueProps } from '../internal/field-props.ts'
import { firstErrorMessage } from './first-error-message.ts'
import { useFieldContext } from './form-context.ts'

/** What the form gives the field; the rest stays the field's props. */
type FromForm = 'id' | 'name' | 'value' | 'onValueChange' | 'onBlur' | 'error'

/**
 * Turns a GoGoUI field (or one of yours taking `value`, `onValueChange`,
 * `onBlur` and `error`) into a field of a TanStack form: its id and name
 * are the field's name, its error the first one in words.
 *
 * @summary Bind a field of your own to a TanStack form.
 */
// oxlint-disable-next-line typescript/no-explicit-any
export function bindField<TProps extends FieldValueProps<any>>(
  Field: ComponentType<TProps>,
) {
  function BoundField(props: Omit<TProps, FromForm>) {
    const field = useFieldContext<TProps['value']>()
    const bound = {
      ...props,
      id: field.name,
      name: field.name,
      value: field.state.value,
      onValueChange: (value: TProps['value']) => field.handleChange(value),
      onBlur: field.handleBlur,
      error: firstErrorMessage(field.state.meta.errors),
    } as unknown as TProps
    return <Field {...bound} />
  }
  BoundField.displayName = `Bound${Field.displayName ?? Field.name}`
  return BoundField
}
