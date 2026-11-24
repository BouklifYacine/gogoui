import { useState } from 'react'

type ControllableStateOptions<TValue> = {
  /** The parent's value. When it is given, the parent owns the value. */
  value: TValue | undefined
  /** The first value when the parent gives none; the control keeps it. */
  defaultValue: TValue
  /** Told about every change, whoever owns the value. */
  onChange?: (value: TValue) => void
}

/**
 * The value a control shows: the parent's when it gives one (controlled),
 * the control's own otherwise (uncontrolled).
 */
function shownValue<TValue>(value: TValue | undefined, own: TValue): TValue {
  return value === undefined ? own : value
}

/**
 * A value the parent may own or leave to the control, like `useState`.
 *
 * Controlled: pass `value` (and `onChange` to hear about changes); the
 * control shows `value` and only asks for a new one.
 * Uncontrolled: leave `value` undefined; the control starts at
 * `defaultValue`, keeps its own value and still calls `onChange`.
 *
 * @example
 * const [text, setText] = useControllableState({
 *   value,
 *   defaultValue: defaultValue ?? '',
 *   onChange: onValueChange,
 * })
 */
function useControllableState<TValue>({
  value,
  defaultValue,
  onChange,
}: ControllableStateOptions<TValue>): [TValue, (next: TValue) => void] {
  const [own, setOwn] = useState(defaultValue)
  const isControlled = value !== undefined

  function setValue(next: TValue) {
    if (!isControlled) setOwn(next)
    onChange?.(next)
  }

  return [shownValue(value, own), setValue]
}

export { shownValue, useControllableState }
export type { ControllableStateOptions }
