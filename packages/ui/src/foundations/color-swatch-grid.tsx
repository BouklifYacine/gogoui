/** Props of {@link ColorSwatchGrid}. */
export type ColorSwatchGridProps = {
  /** CSS variable names without their dashes: `primary`, `brand-500`… */
  tokens: string[]
}

/**
 * A grid of colour tokens for the Storybook « Fondations/Couleurs » page:
 * a swatch painted with each variable, its name under it. It reads the
 * live variables, so the theme and the « Palette » toolbar repaint it.
 *
 * Use it for: documentation pages only (it is not published).
 *
 * @summary Swatches of GoGoUI's colour tokens.
 */
export function ColorSwatchGrid({ tokens }: ColorSwatchGridProps) {
  return (
    <ul className="not-prose my-4 grid list-none grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-3 p-0">
      {tokens.map((token) => (
        <li key={token} className="m-0 flex flex-col gap-1.5">
          <span
            className="h-12 rounded-lg shadow-xs ring-1 ring-line ring-inset"
            style={{ background: `var(--${token})` }}
          />
          <code className="text-xs text-fg-muted">--{token}</code>
        </li>
      ))}
    </ul>
  )
}
