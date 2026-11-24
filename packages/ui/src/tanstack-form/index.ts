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
import { ColorPickerField as ColorPickerFieldBase } from '../components/color-picker-field.tsx'
import { MentionField as MentionFieldBase } from '../components/mention-field.tsx'
import { MultiSelectField as MultiSelectFieldBase } from '../components/multi-select-field.tsx'
import { PhoneField as PhoneFieldBase } from '../components/phone-field.tsx'
import { RatingField as RatingFieldBase } from '../components/rating-field.tsx'
import { ShortcutField as ShortcutFieldBase } from '../components/shortcut-field.tsx'
import { SignatureField as SignatureFieldBase } from '../components/signature-field.tsx'
import { TagField as TagFieldBase } from '../components/tag-field.tsx'
import {
  BoundCodeField,
  bindField,
  fieldContext,
  formComponents,
  formContext,
  useFieldContext,
  useFormContext,
} from './core.ts'

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
  ColorPickerField: bindField(ColorPickerFieldBase),
  MentionField: bindField(MentionFieldBase),
  MultiSelectField: bindField(MultiSelectFieldBase),
  PhoneField: bindField(PhoneFieldBase),
  RatingField: bindField(RatingFieldBase),
  ShortcutField: bindField(ShortcutFieldBase),
  SignatureField: bindField(SignatureFieldBase),
  TagField: bindField(TagFieldBase),
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

export {
  bindField,
  fieldContext,
  formComponents,
  formContext,
  useFieldContext,
  useFormContext,
}
