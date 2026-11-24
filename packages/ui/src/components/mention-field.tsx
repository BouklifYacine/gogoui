import type { FieldValueProps } from '../internal/field-props.ts'
import type { MentionValue } from '../internal/mentions.ts'
import { FieldShell } from './field-shell.tsx'
import { MentionInput } from './mention-input.tsx'
import type { MentionInputProps } from './mention-input.tsx'

type MentionFieldProps = FieldValueProps<MentionValue> &
  Omit<
    MentionInputProps,
    | 'id'
    | 'name'
    | 'value'
    | 'defaultValue'
    | 'onValueChange'
    | 'onBlur'
    | 'aria-invalid'
    | 'aria-describedby'
    | 'aria-label'
  > & {
    label: string
  }

/**
 * A labelled text where @ mentions a person, with its help and its error.
 *
 * **Use it for** an internal note on a request that cites a colleague, a
 * comment. **Not for** formatted text (`RichTextEditor`) or a plain
 * message (`TextareaField`).
 *
 * **Where**: in a form or under a thread, full width.
 *
 * **States**: empty, typing, list of people open, with mentions, invalid
 * (`error`), disabled. The help and the error slide in (FieldShell); the
 * rest moves as MentionInput does.
 *
 * **Key props**: `label`, `value` + `onValueChange` (`{ text, mentions }`,
 * controlled) or `defaultValue` (uncontrolled), `people`, `error`,
 * `description`, `onMentionAdd`, `minRows`, `maxRows`. Store `serializeMentions(value)`.
 *
 * **Accessibility**: label, help and error are wired with
 * `aria-describedby`; the list is a combobox's listbox (see MentionInput).
 *
 * @summary A labelled text where @ mentions a person.
 */
function MentionField({
  id,
  name,
  label,
  description,
  error,
  value,
  defaultValue,
  onValueChange,
  onBlur,
  ...inputProps
}: MentionFieldProps) {
  return (
    <FieldShell
      id={id}
      name={name}
      label={label}
      description={description}
      error={error}
    >
      {(control) => (
        <MentionInput
          {...inputProps}
          {...control}
          name={name}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          onBlur={onBlur}
        />
      )}
    </FieldShell>
  )
}

export { MentionField }
export type { MentionFieldProps }
