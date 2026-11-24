import { createElement } from 'react'
import type { ComponentProps, ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { GoGoUIProvider } from './gogoui-provider.tsx'
import { en } from './locales/en.ts'
import { fr } from './locales/fr.ts'
import { mergeMessages } from './merge-messages.ts'
import { messages } from './messages.ts'
import type { GoGoUIMessages } from './messages.ts'
import { useGoGoUIMessages } from './messages-context.ts'

/** Writes the word a component would write for `close`, with its labels. */
function CloseWord({ labels }: { labels?: Partial<GoGoUIMessages> }) {
  return useGoGoUIMessages(labels).close
}

type ProviderProps = ComponentProps<typeof GoGoUIProvider>

/** The `close` word drawn inside the given providers, outermost first. */
function closeWordIn(
  providers: Omit<ProviderProps, 'children'>[],
  labels?: Partial<GoGoUIMessages>,
) {
  let tree: ReactElement = createElement(CloseWord, { labels })
  for (const props of [...providers].reverse()) {
    tree = createElement(GoGoUIProvider, props as ProviderProps, tree)
  }
  return renderToStaticMarkup(tree)
}

// A project's own language: every key, its own intlLocale.
const es: GoGoUIMessages = {
  ...en,
  intlLocale: 'es-ES',
  close: 'Cerrar',
  loading: 'Cargando',
}

describe('the order of the words', () => {
  it('speaks French with no provider', () => {
    expect(closeWordIn([])).toBe('Fermer')
  })

  it('takes the language of locale', () => {
    expect(closeWordIn([{ locale: 'en' }])).toBe('Close')
  })

  it('puts the provider’s messages over the language', () => {
    expect(closeWordIn([{ locale: 'en', messages: { close: 'Back' } }])).toBe(
      'Back',
    )
  })

  it('puts a component’s labels over the provider’s messages', () => {
    expect(
      closeWordIn([{ messages: { close: 'Retour' } }], {
        close: 'Quitter',
      }),
    ).toBe('Quitter')
  })

  it('keeps the language of the provider around when locale is left out', () => {
    expect(
      closeWordIn([{ locale: 'en' }, { messages: { loading: 'Wait' } }]),
    ).toBe('Close')
  })
})

describe('mergeMessages', () => {
  it('changes only the words given', () => {
    const words = mergeMessages(fr, { close: 'Retour' })
    expect(words.close).toBe('Retour')
    expect(words.loading).toBe(fr.loading)
    expect(Object.keys(words)).toEqual(Object.keys(fr))
  })

  it('keeps the base word when a label is undefined', () => {
    expect(mergeMessages(fr, { close: undefined }).close).toBe('Fermer')
  })

  it('gives the base itself back without labels', () => {
    expect(mergeMessages(fr)).toBe(fr)
  })

  it('takes a whole language over another', () => {
    expect(mergeMessages(fr, es)).toEqual(es)
  })
})

describe('a project’s own language', () => {
  it('reaches every component through the provider', () => {
    expect(closeWordIn([{ messages: es }])).toBe('Cerrar')
  })

  it('keeps the old messages record', () => {
    expect(messages.fr).toBe(fr)
    expect(messages.en).toBe(en)
  })

  it('has every key in both shipped languages', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(fr).sort())
  })
})
