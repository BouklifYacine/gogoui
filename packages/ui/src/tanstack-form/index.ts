import { createFormHook } from '@tanstack/react-form'

import { CheckboxCardField as CheckboxCardFieldBase } from '../components/checkbox-card-field.tsx'
import { CheckboxField as CheckboxFieldBase } from '../components/checkbox-field.tsx'
import { ColorField as ColorFieldBase } from '../components/color-field.tsx'
import { DateField as DateFieldBase } from '../components/date-field.tsx'
import { IconField as IconFieldBase } from '../components/icon-field.tsx'
import { MoneyField as MoneyFieldBase } from '../components/money-field.tsx'
import { PasswordField as PasswordFieldBase } from '../components/password-field.tsx'
import { RadioCardField as RadioCardFieldBase } from '../components/radio-card-field.tsx'
import { SelectField as SelectFieldBase } from '../components/select-field.tsx'
import { SwitchField as SwitchFieldBase } from '../components/switch-field.tsx'
import { TextField as TextFieldBase } from '../components/text-field.tsx'
import { TextareaField as TextareaFieldBase } from '../components/textarea-field.tsx'
import { TimeField as TimeFieldBase } from '../components/time-field.tsx'
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

/** GoGoUI's fields, each bound to its TanStack field. */
export const fieldComponents = {
  TextField: bindField(TextFieldBase),
  TextareaField: bindField(TextareaFieldBase),
  PasswordField: bindField(PasswordFieldBase),
  MoneyField: bindField(MoneyFieldBase),
  SelectField: bindField(SelectFieldBase),
  RadioCardField: bindField(RadioCardFieldBase),
  CheckboxField: bindField(CheckboxFieldBase),
  CheckboxCardField: bindField(CheckboxCardFieldBase),
  SwitchField: bindField(SwitchFieldBase),
  DateField: bindField(DateFieldBase),
  TimeField: bindField(TimeFieldBase),
  ColorField: bindField(ColorFieldBase),
  IconField: bindField(IconFieldBase),
  CodeField: BoundCodeField,
}

/** The form's own parts: its element, its submit button, its error summary. */
export const formComponents = {
  Form,
  SubmitButton: BoundSubmitButton,
  ErrorSummary: BoundErrorSummary,
}

/**
 * TanStack Form's useForm with GoGoUI's fields already wired:
 *
 *   <form.AppField name="email">
 *     {(field) => <field.TextField label="E-mail" type="email" />}
 *   </form.AppField>
 *
 * Labels, errors and their accessibility links come with every field. To
 * add fields of your own, build your hook with createFormHook from
 * `fieldContext`, `formContext`, `fieldComponents` and `bindField`.
 */
export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents,
  formComponents,
})

export { bindField, fieldContext, formContext, useFieldContext, useFormContext }
