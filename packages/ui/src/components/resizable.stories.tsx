import preview from '#.storybook/preview'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './resizable.tsx'

const meta = preview.meta({
  title: 'Mise en page/Resizable',
  component: ResizablePanelGroup,
  subcomponents: { ResizablePanel, ResizableHandle },
})

/**
 * A list and its details: drag the line, or focus it and use the arrows.
 */
export const Basic = meta.story({
  render: () => (
    <div className="h-64 w-[36rem] overflow-hidden rounded-2xl border border-line">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize="35%" minSize="20%">
          <div className="flex h-full items-center justify-center text-sm text-fg-muted">
            Demandes
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="65%" minSize="30%">
          <div className="flex h-full items-center justify-center text-sm text-fg-muted">
            Détails
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
})

/**
 * Point at the line: its grip forms on a spring. Drag the list past its
 * minimum and let go: it folds away on a spring and a tab with a chevron
 * shows on the line; click it (or focus the line and press Enter) and the
 * list comes back. The drag itself follows the pointer to the pixel.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: () => (
    <div className="h-64 w-[40rem] overflow-hidden rounded-2xl border border-line">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel
          label="Demandes"
          defaultSize="32%"
          minSize="22%"
          collapsible
          collapsedSize="0%"
        >
          <div className="flex h-full flex-col gap-2 p-4 text-sm">
            <p className="font-medium text-fg">Demandes</p>
            <p className="text-fg-muted">Julie et Thomas, 12 juin</p>
            <p className="text-fg-muted">Sarah et Léo, 3 juillet</p>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="68%" minSize="40%">
          <div className="flex h-full items-center justify-center text-sm text-fg-muted">
            Détails de la demande
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
})

/**
 * Stacked panels: the line lies flat and its grip turns with it; the
 * preview below folds down and comes back the same way.
 */
export const Vertical = meta.story({
  render: () => (
    <div className="h-80 w-[28rem] overflow-hidden rounded-2xl border border-line">
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel defaultSize="60%" minSize="30%">
          <div className="flex h-full items-center justify-center text-sm text-fg-muted">
            Formulaire
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          label="Aperçu"
          defaultSize="40%"
          minSize="25%"
          collapsible
          collapsedSize="0%"
        >
          <div className="flex h-full items-center justify-center text-sm text-fg-muted">
            Aperçu
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
})
