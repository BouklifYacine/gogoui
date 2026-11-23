import { createContext } from 'react'

import type { Color } from './colors.ts'

/** What a BillingToggleItem reads from its BillingToggle. */
export type BillingToggleState = {
  value: string
  size: 'sm' | 'default' | 'lg'
  color: Color
  /** The thumb is measured: until then the chosen item paints its own. */
  placed: boolean
}

export const BillingToggleContext = createContext<BillingToggleState>({
  value: '',
  size: 'default',
  color: 'success',
  placed: false,
})
