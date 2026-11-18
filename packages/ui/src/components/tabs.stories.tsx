import preview from '#.storybook/preview'

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs.tsx'

const meta = preview.meta({
  title: 'Composants/Tabs',
  component: Tabs,
})

/**
 * Views of one request side by side, one shown at a time; the arrows move
 * between tabs.
 *
 * @summary Switch between views of the same subject.
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
})

/**
 * Tabs drawn as an underline, for the top of a page.
 *
 * @summary Underlined tabs for a page.
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
