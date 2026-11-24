import { useState } from 'react'

import preview from '#.storybook/preview'

import { SignatureField } from './signature-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/Champs prêts/SignatureField',
  tags: ['beta'],
  component: SignatureField,
  decorators: [
    (Story) => <div className="w-[34rem] max-w-full">{Story()}</div>,
  ],
})

/**
 * The couple signs the contract: drawn on the sheet, or typed with
 * « Écrire mon nom » (the way without a mouse or a finger). The value is a
 * PNG data URL, '' while unsigned.
 */
export const Basic = meta.story({
  args: {
    name: 'signature',
    label: 'Signature de Julie Martin',
    signer: 'Julie Martin',
    description: 'Elle vaut acceptation du contrat.',
    error: '',
    format: 'png',
    allowTyped: true,
    disabled: false,
    value: '',
    onValueChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <div className="grid gap-3">
        <SignatureField
          {...args}
          error={args.error || undefined}
          value={value}
          onValueChange={setValue}
        />
        <p className="text-xs text-fg-subtle">
          {value ? `Valeur : ${value.slice(0, 40)}…` : 'Pas encore signé'}
        </p>
      </div>
    )
  },
})

/** Sent unsigned: the error is linked to the sheet and read with it. */
export const WithError = meta.story({
  render: function Render() {
    const [value, setValue] = useState('')
    return (
      <SignatureField
        label="Signature"
        signer="Thomas Bernard"
        error="Signez pour accepter le contrat."
        value={value}
        onValueChange={setValue}
      />
    )
  },
})

/** Draw, then switch to « Écrire mon nom »: each way keeps its own signature. */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render() {
    const [value, setValue] = useState('')
    return (
      <SignatureField
        label="Signature"
        signer="Sarah Petit"
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
