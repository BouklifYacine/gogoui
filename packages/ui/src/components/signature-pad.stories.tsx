import { useState } from 'react'

import preview from '#.storybook/preview'

import {
  SignaturePad,
  SignaturePadAction,
  SignaturePadSurface,
  signatureToPng,
} from './signature-pad.tsx'
import type { SignatureStroke } from './signature-pad.tsx'

const meta = preview.meta({
  title: 'Formulaires/Saisie/SignaturePad',
  tags: ['beta'],
  component: SignaturePad,
  subcomponents: {
    SignaturePadSurface,
    SignaturePadAction,
  },
  decorators: [
    (Story) => <div className="w-[34rem] max-w-full">{Story()}</div>,
  ],
})

/**
 * Sign with the mouse, a pen or a finger: the line thins when it goes
 * fast and the ends taper like a nib lifting. The sheet stays white in
 * dark mode.
 */
export const Basic = meta.story({
  args: {
    signer: 'Julie Martin',
    ink: 'black',
    width: 'default',
    disabled: false,
    children: null,
  },
  render: (args) => (
    <SignaturePad {...args}>
      <SignaturePadSurface />
      <div className="flex justify-end gap-1">
        <SignaturePadAction action="undo" />
        <SignaturePadAction action="redo" />
        <SignaturePadAction action="replay" />
        <SignaturePadAction action="clear" />
      </div>
    </SignaturePad>
  ),
})

/**
 * « Signez ici » leaves as the first stroke starts; a stroke undone fades
 * out, redone fades in; « Rejouer » redraws the signature at its own pace
 * with the nib riding it; « Effacer » sweeps the ink away like a squeegee.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: () => (
    <SignaturePad signer="Thomas Bernard" ink="blue">
      <SignaturePadSurface />
      <div className="flex justify-end gap-1">
        <SignaturePadAction action="undo" />
        <SignaturePadAction action="redo" />
        <SignaturePadAction action="replay" />
        <SignaturePadAction action="clear" />
      </div>
    </SignaturePad>
  ),
})

/** The strokes go out as a PNG cropped to the ink, ready for a contract. */
export const Export = meta.story({
  render: function Render() {
    const [strokes, setStrokes] = useState<SignatureStroke[]>([])
    const png = signatureToPng(strokes)
    return (
      <div className="grid gap-4">
        <SignaturePad onValueChange={setStrokes}>
          <SignaturePadSurface />
          <div className="flex justify-end gap-1">
            <SignaturePadAction action="undo" />
            <SignaturePadAction action="clear" />
          </div>
        </SignaturePad>
        {png && (
          <img
            src={png}
            alt="La signature exportée"
            className="h-20 w-fit rounded-lg bg-white p-2 ring-1 ring-line"
          />
        )}
      </div>
    )
  },
})

/** Disabled: the sheet greys and takes no stroke. */
export const Disabled = meta.story({
  render: () => (
    <SignaturePad disabled>
      <SignaturePadSurface />
    </SignaturePad>
  ),
})
