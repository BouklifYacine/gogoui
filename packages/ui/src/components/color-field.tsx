import { CheckIcon } from '@phosphor-icons/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { describedBy, useFieldIds } from '../internal/field-props.ts'
import type { FieldValueProps } from '../internal/field-props.ts'
import { cn } from '../lib/cn.ts'
import {
  FieldDescription,
  FieldError,
  FieldLegend,
  FieldSet,
} from './field.tsx'
import { RadioGroup, RadioGroupItem } from './radio-group.tsx'

type ColorFieldProps = Omit<FieldValueProps<string>, 'description'> & {
  legend: string
  description?: string
  /** The colours offered: a CSS colour and its name. */
  options: readonly { value: string; label: string }[]
}

/**
 * One colour among rounded tiles.
 *
 * **Use it for** a calendar's colour, a tag's colour.
 *
 * **Key props**: `legend`, `options` (`{ value, label }[]`, value a CSS
 * colour or a token), `value` + `onValueChange`, `description`, `error`.
 *
 * **Accessibility**: each colour has a name in words.
 *
 * @summary One colour among rounded tiles.
 */
function ColorField({
  id,
  name,
  legend,
  description,
  error,
  value,
  onValueChange,
  onBlur,
  options,
}: ColorFieldProps) {
  const ids = useFieldIds(id, name)
  const { chosenColor } = useGoGoUIMessages()
  const legendId = `${ids.id}-legend`
  const chosen = options.find((color) => color.value === value)

  return (
    <FieldSet
      data-invalid={error ? true : undefined}
      aria-describedby={describedBy(
        description && ids.descriptionId,
        error && ids.errorId,
      )}
    >
      <FieldLegend id={legendId} className={cn(error && 'text-danger-fg')}>
        {legend}
      </FieldLegend>
      {description && (
        <FieldDescription id={ids.descriptionId}>
          {description}
        </FieldDescription>
      )}
      <RadioGroup
        id={ids.id}
        name={name}
        aria-labelledby={legendId}
        value={value}
        onValueChange={(next) => onValueChange(next as string)}
        className="flex flex-wrap gap-2"
      >
        {options.map((color, index) => {
          const optionId = `${ids.id}-${index}`
          return (
            <label
              key={color.value}
              htmlFor={optionId}
              title={color.label}
              className="group flex size-11 cursor-pointer items-center justify-center rounded-xl has-focus-visible:outline-2 has-focus-visible:outline-solid has-focus-visible:outline-offset-2 has-focus-visible:outline-focus"
            >
              <RadioGroupItem
                id={optionId}
                value={color.value}
                onBlur={onBlur}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-lg ring-offset-2 ring-offset-surface group-has-data-checked:ring-2 group-has-data-checked:ring-fg"
                style={{ backgroundColor: color.value }}
              >
                <CheckIcon
                  weight="bold"
                  className="hidden size-4.5 text-white drop-shadow-sm group-has-data-checked:block"
                />
              </span>
              <span className="sr-only">{color.label}</span>
            </label>
          )
        })}
      </RadioGroup>
      {chosen && (
        <p className="text-sm text-fg-muted">{chosenColor(chosen.label)}</p>
      )}
      {error && <FieldError id={ids.errorId}>{error}</FieldError>}
    </FieldSet>
  )
}

export { ColorField }
export type { ColorFieldProps }
