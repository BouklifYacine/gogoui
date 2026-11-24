import preview from '#.storybook/preview'

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from './field.tsx'
import { Input } from './input.tsx'

const meta = preview.meta({
  title: 'Formulaires/Saisie/Field',
  component: Field,
  subcomponents: {
    FieldSet,
    FieldLegend,
    FieldGroup,
    FieldLabel,
    FieldTitle,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldSeparator,
  },
})

/**
 * A field with its label above and a hint under it, linked for a screen
 * reader.
 */
export const Basic = meta.story({
  render: () => (
    <FieldGroup className="w-80">
      <Field>
        <FieldLabel htmlFor="guests">Nombre d'invités</FieldLabel>
        <Input
          id="guests"
          inputMode="numeric"
          placeholder="120"
          aria-describedby="guests-hint"
        />
        <FieldDescription id="guests-hint">
          Une estimation suffit, elle se change plus tard.
        </FieldDescription>
      </Field>
    </FieldGroup>
  ),
})

/**
 * An error: `data-invalid` on the field, `aria-invalid` on the control, and
 * the message that says how to fix it.
 */
export const Invalid = meta.story({
  render: () => (
    <FieldGroup className="w-80">
      <Field data-invalid>
        <FieldLabel htmlFor="phone">Téléphone</FieldLabel>
        <Input
          id="phone"
          defaultValue="06 12"
          aria-invalid
          aria-describedby="phone-error"
        />
        <FieldError id="phone-error">
          Il manque des chiffres : 10 en tout, comme 06 12 34 56 78.
        </FieldError>
      </Field>
    </FieldGroup>
  ),
})
