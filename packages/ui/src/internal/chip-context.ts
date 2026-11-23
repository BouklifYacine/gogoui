import { createContext } from 'react'

/** Set by ToggleGroup variant="chips": its items draw themselves as chips. */
export const ChipContext = createContext<{ size: 'sm' | 'default' } | null>(
  null,
)
