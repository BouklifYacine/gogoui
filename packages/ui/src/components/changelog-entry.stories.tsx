import preview from '#.storybook/preview'
import { AnimatePresence } from 'motion/react'

import { ChangelogEntry } from './changelog-entry.tsx'

const meta = preview.meta({
  title: 'Blocs marketing/ChangelogEntry',
  tags: ['beta'],
  component: ChangelogEntry,
  parameters: { layout: 'padded' },
  // Rows enter still on the first render, as in ChangelogFeed; only rows
  // added later fade in.
  args: {
    date: '2026-11-12',
    version: '0.32.0',
    kind: 'fixed',
    title: 'Les acomptes ne sont plus comptés deux fois',
    summary:
      'Un acompte reçu par virement puis confirmé à la main n’apparaît plus en double dans le total.',
    defaultOpen: false,
  },
  render: (args) => (
    <ul className="mx-auto w-full max-w-180 overflow-hidden rounded-3xl bg-surface shadow-sm">
      <AnimatePresence initial={false}>
        <ChangelogEntry {...args}>
          <ul className="grid max-w-[62ch] gap-1.5">
            <li>Les totaux concernés ont été corrigés le 12 novembre.</li>
            <li>Les reçus déjà envoyés aux couples restent valables.</li>
          </ul>
        </ChangelogEntry>
      </AnimatePresence>
    </ul>
  ),
})

/**
 * One release note: click it to read its details.
 */
export const Basic = meta.story({})

/**
 * The three kinds, each in its colour and in words: new, improved, fixed.
 * Without details, a row does not open.
 */
export const Kinds = meta.story({
  render: () => (
    <ul className="mx-auto w-full max-w-180 overflow-hidden rounded-3xl bg-surface shadow-sm">
      <AnimatePresence initial={false}>
        <ChangelogEntry
          date="2026-11-18"
          version="0.33.0"
          kind="new"
          title="Le formulaire de demande sur votre propre site"
          summary="Les couples vous écrivent sans quitter votre site."
        />
        <ChangelogEntry
          date="2026-11-18"
          version="0.33.0"
          kind="improved"
          title="L’aperçu de la page publique suit vos réglages"
        />
        <ChangelogEntry
          date="2026-11-12"
          version="0.32.0"
          kind="fixed"
          title="Les acomptes ne sont plus comptés deux fois"
        />
      </AnimatePresence>
    </ul>
  ),
})

/**
 * Open and close it: the row unfolds on a spring, its details rise in with
 * a light blur, the chevron turns.
 */
export const Animations = meta.story({
  tags: ['animated'],
})
