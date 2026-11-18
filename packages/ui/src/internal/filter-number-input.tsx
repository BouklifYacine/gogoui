import { useState } from 'react'
import type { Icon } from '@phosphor-icons/react'

import { Field, FieldError, FieldLabel } from '../components/field.tsx'
import { InputWithIcon } from '../components/input-with-icon.tsx'
import { cn } from '../lib/cn.ts'
import { useFilterLayout } from './filter-layout.ts'
import { parseTypedNumber } from './numbers.ts'

/**
 * One bound of a FilterNumberRange, typed as people write it (« 1 500 »).
 * The filter changes once the number is typed, on leaving the field or on
 * Enter, not at every digit. Empty takes the bound off.
 */
export function FilterNumberInput({
  id,
  label,
  icon,
  decimals,
  show,
  example,
  value,
  onChange,
}: {
  id: string
  label: string
  icon: Icon
  /** Money takes decimals; a count does not. */
  decimals: boolean
  /** The value as typed back in the field. */
  show: (value: number) => string
  /** Said when what is typed is not a number. */
  example: string
  value: number | undefined
  onChange: (value: number | undefined) => void
}) {
  const layout = useFilterLayout()
  const shown = (bound: number | undefined) =>
    bound === undefined ? '' : show(bound)
  const [typed, setTyped] = useState(shown(value))
  const [refused, setRefused] = useState(false)

  // The bound changed elsewhere (a chip took it off): the field follows.
  const [seen, setSeen] = useState(value)
  if (value !== seen) {
    setSeen(value)
    setTyped(shown(value))
    setRefused(false)
  }

  function commit() {
    if (typed.trim() === '') {
      setRefused(false)
      onChange(undefined)
      return
    }
    const number = parseTypedNumber(typed)
    const accepted =
      number !== null && (decimals || Number.isInteger(number)) ? number : null
    setRefused(accepted === null)
    if (accepted !== null) {
      onChange(accepted)
    }
  }

  const errorId = `${id}-error`
  return (
    <Field data-invalid={refused || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputWithIcon
        id={id}
        icon={icon}
        inputMode={decimals ? 'decimal' : 'numeric'}
        autoComplete="off"
        className={cn(
          'tabular-nums',
          layout.mode === 'full' && layout.panel && 'bg-surface',
        )}
        value={typed}
        aria-invalid={refused || undefined}
        aria-describedby={refused ? errorId : undefined}
        onChange={(event) => setTyped(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            commit()
          }
        }}
      />
      {refused && <FieldError id={errorId}>{example}</FieldError>}
    </Field>
  )
}
