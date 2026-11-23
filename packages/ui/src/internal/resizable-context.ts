import { createContext } from 'react'

/** What a ResizableHandle needs to know of the panels on either side. */
export type ResizablePanelEntry = {
  /** Brings the panel back to its last size. */
  expand: () => void
  /** Its name, said by the restore tab (« Afficher Dossiers »). */
  label?: string
}

export type ResizableContextValue = {
  /** The DOM ids of the panels folded to their collapsed size. */
  collapsed: ReadonlySet<string>
  /** A panel says whether it is folded, after each resize. */
  report: (id: string, collapsed: boolean) => void
  /** Each panel's way back, by DOM id. */
  panels: Map<string, ResizablePanelEntry>
}

/** Shared by ResizablePanelGroup, its panels and its handles. */
export const ResizableContext = createContext<ResizableContextValue | null>(
  null,
)
