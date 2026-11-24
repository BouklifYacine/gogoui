import { useId } from 'react'
import type { ReactNode } from 'react'

/**
 * What every GoGoUI form field takes: its value and how it changes, its
 * error in words. Works with any form library, with useState, or alone.
 *
 * Controlled: pass `value` + `onValueChange`, the parent owns the value.
 * Uncontrolled: pass `defaultValue` (or nothing), the field keeps its own
 * value; `onValueChange` still tells about each change.
 */
export type FieldValueProps<TValue> = {
  /** The control's id; the field's name, or a generated one, by default. */
  id?: string
  /** The name sent with the form. */
  name?: string
  /**
   * The value, when the parent owns it (controlled). Pair it with
   * `onValueChange`, or the field cannot change.
   */
  value?: TValue
  /**
   * The first value when the field owns it (uncontrolled, no `value`).
   * Read once, on the first render.
   */
  defaultValue?: TValue
  /** Called with the new value on every change, controlled or not. */
  onValueChange?: (value: TValue) => void
  onBlur?: () => void
  /** What is wrong, in words: the field turns red and says it. */
  error?: string
  /** A line of help under the field. */
  description?: ReactNode
}

/** The control's id, and the ids of its help and its error. */
export function useFieldIds(id: string | undefined, name: string | undefined) {
  const generated = useId()
  const controlId = id ?? name ?? generated
  return {
    id: controlId,
    descriptionId: `${controlId}-description`,
    errorId: `${controlId}-error`,
  }
}

/** The ids a control is described by, or undefined when none shows. */
export function describedBy(...ids: unknown[]): string | undefined {
  return (
    ids
      .filter((id): id is string => typeof id === 'string' && id !== '')
      .join(' ') || undefined
  )
}
