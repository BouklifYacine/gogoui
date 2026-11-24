import { expect, userEvent, within } from 'storybook/test'

import preview from '#.storybook/preview'

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs.tsx'

const meta = preview.meta({
  title: 'Navigation/Tabs',
  component: Tabs,
  subcomponents: {
    TabsList,
    TabsTrigger,
    TabsContent,
  },
})

/**
 * Views of one request side by side, one shown at a time; the arrows move
 * between tabs.
 */
export const Basic = meta.story({
  render: () => (
    <Tabs defaultValue="infos" className="w-96">
      <TabsList>
        <TabsTrigger value="infos">Infos</TabsTrigger>
        <TabsTrigger value="payments">Paiements</TabsTrigger>
        <TabsTrigger value="messages">Échanges</TabsTrigger>
      </TabsList>
      <TabsContent value="infos" className="pt-3 text-sm">
        Samedi 12 juin, 120 invités.
      </TabsContent>
      <TabsContent value="payments" className="pt-3 text-sm">
        Acompte reçu, solde le 12 mai.
      </TabsContent>
      <TabsContent value="messages" className="pt-3 text-sm">
        3 messages.
      </TabsContent>
    </Tabs>
  ),
  // A click shows the tab's panel; the arrow moves to the next tab.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const payments = canvas.getByRole('tab', { name: 'Paiements' })
    await userEvent.click(payments)
    await expect(payments).toHaveAttribute('aria-selected', 'true')
    // The panel that leaves stays a moment: find the new one by its tab.
    await expect(
      canvas.getByRole('tabpanel', { name: 'Paiements' }),
    ).toHaveTextContent('Acompte reçu')
    await userEvent.keyboard('{ArrowRight}')
    await expect(canvas.getByRole('tab', { name: 'Échanges' })).toHaveFocus()
  },
})

/**
 * Tabs drawn as an underline, for the top of a page.
 */
export const Line = meta.story({
  render: () => (
    <Tabs defaultValue="all" className="w-96">
      <TabsList variant="line">
        <TabsTrigger value="all">Toutes</TabsTrigger>
        <TabsTrigger value="new">Nouvelles</TabsTrigger>
        <TabsTrigger value="won">Gagnées</TabsTrigger>
      </TabsList>
    </Tabs>
  ),
})
