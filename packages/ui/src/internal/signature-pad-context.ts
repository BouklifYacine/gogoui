import { createContext, useContext } from 'react'

import type {
  SignatureInk,
  SignatureStroke,
  SignatureWidth,
} from './signature-ink.ts'

/** A replay in progress: where it is, in ms, and when each stroke starts. */
export type SignatureReplay = { at: number; offsets: number[] }

/** What SignaturePad shares with its surface and its buttons. */
export type SignaturePadContextValue = {
  strokes: SignatureStroke[]
  /** The stroke just drawn: already on screen, it shows without a fade. */
  fresh: string | null
  ink: SignatureInk
  width: SignatureWidth
  disabled: boolean
  /** The pad's name, read first by a screen reader. */
  label: string
  /** Printed under the baseline. */
  signer?: string
  /** On the baseline until the first stroke. */
  hint: string
  canUndo: boolean
  canRedo: boolean
  wiping: boolean
  replay: SignatureReplay | null
  reduce: boolean
  /** The layer of ink, which the clearing sweep cuts away. */
  registerInk: (node: HTMLDivElement | null) => void
  nextStrokeId: () => string
  addStroke: (stroke: SignatureStroke) => void
  undo: () => void
  redo: () => void
  clear: () => void
  toggleReplay: () => void
  stopReplay: () => void
  /** A sweep in flight ends at once, so what comes next starts on a clean sheet. */
  settleWipe: () => void
}

export const SignaturePadContext =
  createContext<SignaturePadContextValue | null>(null)

/** The pad around a part; a part alone has no pad to draw on. */
export function useSignaturePad(): SignaturePadContextValue {
  const context = useContext(SignaturePadContext)
  if (!context) {
    throw new Error('SignaturePad parts go inside <SignaturePad>.')
  }
  return context
}
