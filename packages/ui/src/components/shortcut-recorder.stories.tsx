import { useState } from 'react'

import preview from '#.storybook/preview'

import { ShortcutRecorder } from './shortcut-recorder.tsx'

const meta = preview.meta({
  title: 'Composants/ShortcutRecorder',
  tags: ['beta'],
  component: ShortcutRecorder,
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

/**
 * Press it, then a combination: ⌘ or Ctrl, with a key. Escape cancels,
 * Backspace clears, the arrow brings the default back.
 */
export const Basic = meta.story({
  args: {
    'aria-label': 'Ouvrir la recherche',
    defaultValue: 'mod+k',
  },
})

/**
 * A shortcut already bound, or kept by the browser (⌘W, ⌘C…), asks before
 * it is taken. Try ⌘S or ⌘W.
 */
export const Conflicts = meta.story({
  render: function Render() {
    const [value, setValue] = useState<string | null>('mod+shift+n')
    const [note, setNote] = useState('')
    return (
      <div className="flex flex-col gap-2">
        <ShortcutRecorder
          aria-label="Nouvelle demande"
          value={value}
          resetValue="mod+shift+n"
          bindings={[
            { shortcut: 'mod+s', label: 'Enregistrer' },
            { shortcut: 'mod+k', label: 'Recherche' },
          ]}
          onValueChange={(next, { replaced }) => {
            setValue(next)
            setNote(replaced ? `Retiré de « ${replaced.label} »` : '')
          }}
        />
        <p className="text-xs text-fg-subtle">{note}</p>
      </div>
    )
  },
})

/**
 * Drawn the Mac's way (⌘ ⌥ ⇧), whatever the visitor's computer.
 */
export const Mac = meta.story({
  args: {
    'aria-label': 'Basculer la barre latérale',
    defaultValue: 'mod+shift+b',
    platform: 'mac',
  },
})

/**
 * Three sizes; empty, then disabled.
 */
export const States = meta.story({
  render: () => (
    <div className="flex flex-col gap-3">
      <ShortcutRecorder aria-label="Petit" size="sm" defaultValue="mod+1" />
      <ShortcutRecorder aria-label="Moyen" defaultValue="mod+2" />
      <ShortcutRecorder aria-label="Grand" size="lg" defaultValue="mod+3" />
      <ShortcutRecorder aria-label="Vide" />
      <ShortcutRecorder aria-label="Désactivé" defaultValue="mod+4" disabled />
    </div>
  ),
})

/**
 * Listening: the edge takes the colour and a dot breathes; held modifiers
 * light up as caps; the shortcut's caps arrive one after another and stay
 * lit a moment; the reset and clear buttons pop in; a message opens in
 * height.
 */
export const Animations = meta.story({
  tags: ['animated'],
  args: {
    'aria-label': 'Ouvrir la recherche',
    defaultValue: 'mod+k',
    bindings: [{ shortcut: 'mod+s', label: 'Enregistrer' }],
  },
})
