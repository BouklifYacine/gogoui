import { createFormHookContexts } from '@tanstack/react-form'

// The bound fields read their field through these contexts instead of
// receiving value, onValueChange, onBlur and error by props.
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()
