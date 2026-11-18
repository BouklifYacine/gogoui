import preview from '#.storybook/preview'

import { Heading } from './heading.tsx'
import { Stack } from './stack.tsx'
import { Text } from './text.tsx'

const meta = preview.meta({
  title: 'Mise en page/Heading',
  component: Heading,
  subcomponents: { Text },
})

/**
 * Change its level and its size apart in the controls.
 *
 * @summary A title.
 */
export const Basic = meta.story({
  args: { level: 2, size: 'xl', children: 'Vos demandes de la semaine' },
})

/**
 * The type scale: titles, then body text in its tones and a state's colour.
 *
 * @summary Titles and body text.
 */
export const Scale = meta.story({
  render: () => (
    <Stack gap={3} className="w-[32rem]">
      <Heading level={1} size="3xl">
        Domaine des Chênes
      </Heading>
      <Heading level={2} size="xl">
        Demandes
      </Heading>
      <Text>Le texte courant, en 16 px.</Text>
      <Text size="sm" tone="muted">
        Une précision, plus discrète.
      </Text>
      <Text size="sm" color="danger" numeric weight="medium">
        Reste dû : 3 500 €
      </Text>
    </Stack>
  ),
})
