import { useState } from 'react'
import {
  ArchiveIcon,
  EnvelopeOpenIcon,
  PushPinIcon,
  TrashIcon,
} from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { SwipeActions } from './swipe-actions.tsx'
import { SwipeActionsRow } from './swipe-actions-row.tsx'

const meta = preview.meta({
  title: 'Listes et tableaux/SwipeActions',
  tags: ['beta'],
  component: SwipeActions,
  decorators: [(Story) => <div className="w-full max-w-sm">{Story()}</div>],
})

const REQUESTS = [
  { id: 1, name: 'Mariage Durand', detail: '14 juin 2027 · 120 invités' },
  {
    id: 2,
    name: 'Séminaire Atelier Nord',
    detail: '3 mars 2027 · 40 personnes',
  },
  { id: 3, name: 'Anniversaire Leroy', detail: '22 mai 2027 · 60 invités' },
  { id: 4, name: 'Baptême Martin', detail: '9 avril 2027 · 35 invités' },
]

function Requests({ fullSwipe = true }: { fullSwipe?: boolean }) {
  const [items, setItems] = useState(REQUESTS)
  const [read, setRead] = useState<number[]>([])
  const remove = (id: number) =>
    setItems((current) => current.filter((item) => item.id !== id))

  return (
    <div className="flex flex-col gap-3">
      <SwipeActions aria-label="Demandes">
        {items.map((item) => (
          <SwipeActionsRow
            key={item.id}
            name={item.name}
            fullSwipe={fullSwipe}
            leading={[
              {
                label: read.includes(item.id) ? 'Non lu' : 'Lu',
                icon: EnvelopeOpenIcon,
                color: 'info',
                keepRow: true,
                onSelect: () =>
                  setRead((current) =>
                    current.includes(item.id)
                      ? current.filter((id) => id !== item.id)
                      : [...current, item.id],
                  ),
              },
            ]}
            trailing={[
              {
                label: 'Archiver',
                icon: ArchiveIcon,
                color: 'warning',
                onSelect: () => remove(item.id),
              },
              {
                label: 'Supprimer',
                icon: TrashIcon,
                destructive: true,
                onSelect: () => remove(item.id),
              },
            ]}
          >
            <p
              className={
                read.includes(item.id)
                  ? 'text-sm text-fg-muted'
                  : 'text-sm font-medium text-fg'
              }
            >
              {item.name}
            </p>
            <p className="text-xs text-fg-subtle">{item.detail}</p>
          </SwipeActionsRow>
        ))}
      </SwipeActions>
      {items.length < REQUESTS.length && (
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => setItems(REQUESTS)}
        >
          Tout remettre
        </Button>
      )}
    </div>
  )
}

/**
 * Swipe a row left to archive or delete, right to mark it read; a long
 * swipe runs the outermost action. The « … » menu holds the same actions
 * for a keyboard.
 */
export const Basic = meta.story({
  args: { 'aria-label': 'Demandes', children: null },
  render: () => <Requests />,
})

/**
 * `fullSwipe={false}`: a long swipe only opens the row, a tap runs the
 * action.
 */
export const WithoutFullSwipe = meta.story({
  args: { 'aria-label': 'Demandes', children: null },
  render: () => <Requests fullSwipe={false} />,
})

/**
 * An item kept after its action (`keepRow`) springs home, here pinned.
 */
export const KeepRow = meta.story({
  args: { 'aria-label': 'Ressources', children: null },
  render: function Render() {
    const [pinned, setPinned] = useState(false)
    return (
      <SwipeActions aria-label="Ressources">
        <SwipeActionsRow
          name="Grange"
          trailing={[
            {
              label: pinned ? 'Détacher' : 'Épingler',
              icon: PushPinIcon,
              color: 'primary',
              keepRow: true,
              onSelect: () => setPinned((value) => !value),
            },
          ]}
        >
          <p className="text-sm font-medium text-fg">
            Grange {pinned && '· épinglée'}
          </p>
          <p className="text-xs text-fg-subtle">Salle de réception · 180 m²</p>
        </SwipeActionsRow>
      </SwipeActions>
    )
  },
})

/**
 * The row follows the finger, stretches like elastic past its last stop,
 * springs open or home; on a long swipe the outermost action stretches
 * over the row, which slides away while the list closes the gap.
 */
export const Animations = meta.story({
  tags: ['animated'],
  args: { 'aria-label': 'Demandes', children: null },
  render: () => <Requests />,
})
