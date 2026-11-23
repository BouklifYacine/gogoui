/**
 * A colour's name over its hex, on ColorPicker's button and its panel's
 * head (the panel opens over the button, so both must match).
 *
 * @summary Internal: ColorPicker's name and hex.
 */
export function ColorPickerName({
  label,
  hex,
}: {
  label: string
  hex: string
}) {
  return (
    <span className="grid min-w-0 leading-tight">
      <span className="truncate text-xs text-fg-muted">{label}</span>
      <span className="text-sm font-medium tabular-nums">{hex}</span>
    </span>
  )
}
