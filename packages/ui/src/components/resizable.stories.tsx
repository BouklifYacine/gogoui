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
