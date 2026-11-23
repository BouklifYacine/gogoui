import { useState } from 'react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { describedBy, useFieldIds } from '../internal/field-props.ts'
import type { FieldValueProps } from '../internal/field-props.ts'
import {
  TYPED_NAME_FONT,
  signatureToPng,
  signatureToSvg,
  svgDataUrl,
  typedNameToDataUrl,
} from '../internal/signature-ink.ts'
import type {
  SignatureInk,
  SignatureStroke,
  SignatureWidth,
} from '../internal/signature-ink.ts'
import { cn } from '../lib/cn.ts'
import { Button } from './button.tsx'
import { Field, FieldDescription, FieldError, FieldLabel } from './field.tsx'
import { Input } from './input.tsx'
import { SignaturePad } from './signature-pad.tsx'
import { SignaturePadAction } from './signature-pad-action.tsx'
import { SignaturePadSurface } from './signature-pad-surface.tsx'
import { ToggleGroup, ToggleGroupItem } from './toggle-group.tsx'

type SignatureFieldProps = FieldValueProps<string> & {
  label: string
  /** Printed under the line: the signer's name. Fills the typed name too. */
  signer?: string
  /** On the line until the first stroke; « Signez ici » by default. */
  hint?: string
  /** What `value` holds: a PNG data URL (default) or an SVG data URL. */
  format?: 'png' | 'svg'
  ink?: SignatureInk
  width?: SignatureWidth
  /** Offers « Écrire mon nom »: the way to sign without drawing. */
  allowTyped?: boolean
  required?: boolean
  disabled?: boolean
  className?: string
}

/**
 * A labelled signature in a form: drawn on a white sheet, or typed.
 *
 * **Use it for** a couple signing a contract, an amendment, a check-in
 * sheet. **Prefer** `SignaturePad` for a sheet without a form around it.
 *
 * **Where**: last in the form, just above the button that sends it.
 *
 * **States**: empty, drawn, typed, a signature saved earlier (shown, with
 * « Signer à nouveau »), invalid (`error`), disabled.
 *
 * **Key props**: `label`, `value` + `onValueChange` (controlled: '' or a
 * data URL, PNG by default, SVG with `format="svg"`), `signer`, `error`,
 * `description`, `allowTyped` (true), `ink`, `width`.
 *
 * **Accessibility**: drawing has no keyboard path, so « Écrire mon nom »
 * is always offered (Arc UI's pad has none: GoGoUI adds it); the typed name
 * is a real text field. Label, help and error are linked to the sheet and
 * to the field.
 *
 * @summary A labelled signature, drawn or typed.
 */
function SignatureField({
  id,
  name,
  label,
  description,
  error,
  value,
  onValueChange,
  onBlur,
  signer,
  hint,
  format = 'png',
  ink,
  width,
  allowTyped = true,
  required,
  disabled = false,
  className,
}: SignatureFieldProps) {
  const messages = useGoGoUIMessages()
  const ids = useFieldIds(id, name)
  const labelId = `${ids.id}-label`
  const [mode, setMode] = useState<'draw' | 'type'>('draw')
  const [typed, setTyped] = useState(signer ?? '')
  const [padKey, setPadKey] = useState(0)
  // A value set from outside (a reset, a saved signature) starts the field
  // over; a value it sent itself changes nothing.
  const [sent, setSent] = useState(value)
  const [showSaved, setShowSaved] = useState(value !== '')
  if (value !== sent) {
    setSent(value)
    setPadKey((key) => key + 1)
    setShowSaved(value !== '')
  }

  function send(next: string) {
    setSent(next)
    onValueChange(next)
  }

  function fromStrokes(strokes: SignatureStroke[]) {
    if (!strokes.length) return ''
    return format === 'svg'
      ? svgDataUrl(signatureToSvg(strokes))
      : signatureToPng(strokes)
  }

  const invalid = error ? true : undefined
  const describe = describedBy(
    description && ids.descriptionId,
    error && ids.errorId,
  )

  return (
    <Field
      data-slot="signature-field"
      data-invalid={invalid}
      data-disabled={disabled || undefined}
      className={className}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <FieldLabel id={labelId} htmlFor={ids.id}>
          {label}
        </FieldLabel>
        {allowTyped && !showSaved && (
          <ToggleGroup
            aria-label={messages.signatureMode}
            value={[mode]}
            disabled={disabled}
            onValueChange={(next: string[]) => {
              const chosen = next[0] as 'draw' | 'type' | undefined
              if (!chosen || chosen === mode) return
              setMode(chosen)
              // Each way keeps its own signature; the value follows the one shown.
              if (chosen === 'type') send(typedNameToDataUrl(typed, format))
              else {
                setPadKey((key) => key + 1)
                send('')
              }
            }}
          >
            <ToggleGroupItem value="draw">
              {messages.signatureDraw}
            </ToggleGroupItem>
            <ToggleGroupItem value="type">
              {messages.signatureType}
            </ToggleGroupItem>
          </ToggleGroup>
        )}
      </div>

      {showSaved ? (
        <div className="grid gap-2.5">
          <div className="light grid aspect-[600/260] w-full place-items-center rounded-2xl bg-surface p-4 ring-1 ring-line ring-inset">
            <img
              id={ids.id}
              src={value}
              alt={messages.savedSignature}
              aria-describedby={describe}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => {
                setShowSaved(false)
                setMode('draw')
                send('')
              }}
            >
              {messages.signAgain}
            </Button>
          </div>
        </div>
      ) : mode === 'draw' ? (
        <SignaturePad
          key={padKey}
          label={label}
          signer={signer}
          hint={hint}
          ink={ink}
          width={width}
          disabled={disabled}
          onValueChange={(strokes) => send(fromStrokes(strokes))}
        >
          <SignaturePadSurface
            id={ids.id}
            aria-describedby={describe}
            aria-invalid={invalid}
            onBlur={onBlur}
          />
          <div className="flex justify-end gap-1">
            <SignaturePadAction action="undo" />
            <SignaturePadAction action="redo" />
            <SignaturePadAction action="replay" />
            <SignaturePadAction action="clear" />
          </div>
        </SignaturePad>
      ) : (
        <div className="grid gap-2.5">
          <Input
            id={ids.id}
            name={name}
            value={typed}
            autoComplete="name"
            placeholder={messages.signatureTypedPlaceholder}
            aria-invalid={invalid}
            aria-describedby={describe}
            aria-required={required || undefined}
            disabled={disabled}
            onBlur={onBlur}
            onChange={(event) => {
              setTyped(event.target.value)
              send(typedNameToDataUrl(event.target.value, format))
            }}
          />
          {/* The name as it will sign, on the same white sheet. */}
          <div
            aria-hidden="true"
            className="light relative aspect-[600/260] w-full overflow-hidden rounded-2xl bg-surface ring-1 ring-line ring-inset"
          >
            <span className="absolute top-[72%] right-[7%] left-[7%] border-t-[1.5px] border-dashed border-line-strong" />
            <span
              className={cn(
                'absolute top-[72%] right-[7%] left-[7%] -translate-y-[calc(100%+4px)] truncate text-center text-4xl italic',
                typed.trim() ? 'text-fg' : 'text-fg-subtle',
              )}
              style={{ fontFamily: TYPED_NAME_FONT }}
            >
              {typed.trim() || messages.signHere}
            </span>
            {signer && (
              <span className="absolute top-[calc(72%+8px)] left-[7%] text-xs text-fg-subtle">
                {signer}
              </span>
            )}
          </div>
        </div>
      )}

      {description && (
        <FieldDescription id={ids.descriptionId}>
          {description}
        </FieldDescription>
      )}
      {error && <FieldError id={ids.errorId}>{error}</FieldError>}
    </Field>
  )
}

export { SignatureField }
export type { SignatureFieldProps }
