import type { ColorFormat } from '../internal/color-math.ts'
import type { FieldValueProps } from '../internal/field-props.ts'
import {
  ColorPicker,
  ColorPickerContent,
  ColorPickerTrigger,
} from './color-picker.tsx'
import type { ColorSwatch } from './color-picker.tsx'
import { FieldShell } from './field-shell.tsx'

type ColorPickerFieldProps = FieldValueProps<string> & {
  label: string
  /** The colour's name on the button (« Accent »); the label by default. */
  colorName?: string
  disabled?: boolean
  /** The button's height: sm, default or lg. */
  size?: 'sm' | 'default' | 'lg'
  /** The background the colour will sit on: shows the contrast and its WCAG level. */
  contrastWith?: string
  /** The ways the field can write the colour; HEX only by default. */
  formats?: readonly ColorFormat[]
  /** An opacity bar. */
  alpha?: boolean
  swatches?: readonly ColorSwatch[]
  onSwatchesChange?: (swatches: ColorSwatch[]) => void
  maxSwatches?: number
}

/**
 * A labelled free colour, with its help and its error: a `ColorPicker`
 * in a field.
 *
 * **Use it for** a brand colour, a public page's colour, a resource's
 * colour chosen freely. **Prefer** `ColorField` to choose among a few set
 * colours.
 *
 * **Where**: in a settings form, one per line.
 *
 * **States**: closed, open, invalid (`error` under it, the button edged in
 * red), disabled.
 *
 * **Key props**: `label`, `value` + `onValueChange` (hex), `error`,
 * `description`, `disabled`, `colorName`, `contrastWith`, `formats`,
 * `alpha`, `swatches` + `onSwatchesChange`, `size`.
 *
 * **Accessibility**: the label names the button; help and error are wired
 * with `aria-describedby` and `aria-invalid`; the panel works from the
 * keyboard (see `ColorPicker`).
 *
 * @summary A labelled free colour, with its error.
 */
function ColorPickerField({
  id,
  name,
  label,
  description,
  error,
  value,
  onValueChange,
  onBlur,
  colorName,
  disabled,
  size,
  contrastWith,
  formats,
  alpha,
  swatches,
  onSwatchesChange,
  maxSwatches,
}: ColorPickerFieldProps) {
  return (
    <FieldShell
      id={id}
      name={name}
      label={label}
      description={description}
      error={error}
    >
      {(control) => (
        <ColorPicker
          value={value}
          onValueChange={onValueChange}
          label={colorName ?? label}
          disabled={disabled}
          size={size}
          contrastWith={contrastWith}
          formats={formats}
          alpha={alpha}
          swatches={swatches}
          onSwatchesChange={onSwatchesChange}
          maxSwatches={maxSwatches}
          // Leaving the panel is leaving the field.
          onOpenChange={(open) => {
            if (!open) {
              onBlur?.()
            }
          }}
        >
          <ColorPickerTrigger {...control} />
          <ColorPickerContent />
          {name && <input type="hidden" name={name} value={value} />}
        </ColorPicker>
      )}
    </FieldShell>
  )
}

export { ColorPickerField }
export type { ColorPickerFieldProps }
