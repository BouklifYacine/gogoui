import { describedBy, useFieldIds } from '../internal/field-props.ts'
import type { FieldValueProps } from '../internal/field-props.ts'
import { Field, FieldDescription, FieldError, FieldLabel } from './field.tsx'
import { ShortcutRecorder } from './shortcut-recorder.tsx'
import type {
  ShortcutBinding,
  ShortcutRecorderProps,
} from './shortcut-recorder.tsx'

type ShortcutFieldProps = Omit<
  FieldValueProps<string | null>,
  'onValueChange'
> &
  Omit<
    ShortcutRecorderProps,
    | 'id'
    | 'value'
    | 'defaultValue'
    | 'onValueChange'
    | 'onBlur'
    | 'aria-label'
    | 'aria-labelledby'
    | 'aria-describedby'
    | 'aria-invalid'
  > & {
    label: string
    /**
     * Called on every change, controlled or not. `replaced`: the binding
     * it was taken from, to unbind it.
     */
    onValueChange?: (
      value: string | null,
      details: { replaced?: ShortcutBinding },
    ) => void
  }

/**
 * A labelled shortcut recorder, with its help and its error.
 *
 * **Use it for** a keyboard shortcut in a settings form.
 *
 * **Where**: in a form, one per line.
 *
 * **States**: those of `ShortcutRecorder`, plus invalid (`error` shown
 * under it and linked to it).
 *
 * **Key props**: `label`, `value` + `onValueChange` (controlled) or
 * `defaultValue` (uncontrolled), `error`, `description`, and the
 * recorder's `bindings`, `resetValue`, `requireModifier`, `warnReserved`,
 * `size`, `color`.
 *
 * **Accessibility**: the recorder is named by the label and its shortcut
 * read in full; help and error are wired with `aria-describedby` and
 * `aria-invalid`.
 *
 * @deprecated Too rare in a web app; show a shortcut with `ShortcutKeys` or `Kbd`. Removed in 0.4.0.
 *
 * @summary A labelled shortcut recorder with its error.
 */
function ShortcutField({
  id,
  name,
  label,
  description,
  error,
  value,
  defaultValue,
  onValueChange,
  onBlur,
  ...recorderProps
}: ShortcutFieldProps) {
  const ids = useFieldIds(id, name)
  const labelId = `${ids.id}-label`

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel id={labelId} htmlFor={ids.id}>
        {label}
      </FieldLabel>
      <ShortcutRecorder
        {...recorderProps}
        id={ids.id}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        onBlur={onBlur}
        aria-labelledby={labelId}
        aria-describedby={describedBy(
          description && ids.descriptionId,
          error && ids.errorId,
        )}
        aria-invalid={error ? true : undefined}
      />
      {description && (
        <FieldDescription id={ids.descriptionId}>
          {description}
        </FieldDescription>
      )}
      {error && <FieldError id={ids.errorId}>{error}</FieldError>}
    </Field>
  )
}

export { ShortcutField }
export type { ShortcutFieldProps }
