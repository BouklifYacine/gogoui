import { describedBy, useFieldIds } from '../internal/field-props.ts'
import type { FieldValueProps } from '../internal/field-props.ts'
import { FieldMessage } from '../internal/field-message.tsx'
import { MotionScope } from '../internal/motion-scope.tsx'
import { Field, FieldLabel } from './field.tsx'
import { Rating } from './rating.tsx'
import type { RatingProps } from './rating.tsx'

type RatingFieldProps = FieldValueProps<number> & {
  label: string
} & Pick<
    RatingProps,
    | 'max'
    | 'size'
    | 'color'
    | 'allowHalf'
    | 'allowClear'
    | 'showValue'
    | 'valueLabels'
    | 'readOnly'
    | 'disabled'
  >

/**
 * A rating in stars inside a form, with its label, help and error.
 *
 * **Use it for** an opinion asked in a form (the couple's review after the
 * event). **Prefer** `Rating` alone, read-only, to show a rating.
 *
 * **States**: empty, rated, help, error, disabled.
 *
 * **Key props**: `label`, `value` (0 = none) + `onValueChange` (controlled)
 * or `defaultValue` (uncontrolled), `description`, `error`, and Rating's `max`, `size`, `color`,
 * `allowHalf`, `allowClear`, `showValue`, `valueLabels`.
 *
 * **Accessibility**: the label names the group of stars; the help and the
 * error are read with it.
 *
 * @summary A labelled rating in stars, for a form.
 */
function RatingField({
  id,
  name,
  label,
  description,
  error,
  value,
  defaultValue,
  onValueChange,
  onBlur,
  ...rating
}: RatingFieldProps) {
  const ids = useFieldIds(id, name)
  const labelId = `${ids.id}-label`

  return (
    <MotionScope>
      <Field data-invalid={error ? true : undefined}>
        <FieldLabel id={labelId}>{label}</FieldLabel>
        <Rating
          {...rating}
          id={ids.id}
          name={name}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          onBlur={onBlur}
          aria-labelledby={labelId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(
            description && ids.descriptionId,
            error && ids.errorId,
          )}
        />
        <FieldMessage
          id={ids.descriptionId}
          tone="muted"
          slot="field-description"
        >
          {description}
        </FieldMessage>
        <FieldMessage id={ids.errorId} tone="danger" slot="field-error">
          {error}
        </FieldMessage>
      </Field>
    </MotionScope>
  )
}

export { RatingField }
export type { RatingFieldProps }
