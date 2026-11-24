/**
 * TanStack Form's binding without GoGoUI's fields: `bindField`, the
 * contexts and the form's own parts. The `@gogoui/ui/tanstack-form` entry
 * binds all 22 fields up front, so an app importing it loads PhoneField,
 * SignatureField… even unused. With this one, an app binds only its own:
 *
 *   import { TextField } from '@gogoui/ui/text-field'
 *   import { bindField, fieldContext, formContext, formComponents }
 *     from '@gogoui/ui/tanstack-form/core'
 *   const { useAppForm } = createFormHook({ fieldContext, formContext,
 *     fieldComponents: { TextField: bindField(TextField) }, formComponents })
 */
import { bindField } from './bind-field.tsx'
import { BoundCodeField } from './bound-code-field.tsx'
import { BoundErrorSummary } from './bound-error-summary.tsx'
import { BoundSubmitButton } from './bound-submit-button.tsx'
import { Form } from './form.tsx'
import {
  fieldContext,
  formContext,
  useFieldContext,
  useFormContext,
} from './form-context.ts'

/** The form's own parts: its element, its submit button, its error summary. */
export const formComponents = {
  Form,
  SubmitButton: BoundSubmitButton,
  ErrorSummary: BoundErrorSummary,
}

export {
  bindField,
  BoundCodeField,
  fieldContext,
  formContext,
  useFieldContext,
  useFormContext,
}
