import { useState } from 'react'
import {
  BookOpenIcon,
  CalendarDotsIcon,
  LifebuoyIcon,
  ReceiptIcon,
  RocketLaunchIcon,
  SignatureIcon,
  SparkleIcon,
  TrayIcon,
} from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { Button } from '../components/button.tsx'
import { PillTabsList } from '../components/pill-tabs-list.tsx'
import { SiteHeader } from '../components/site-header.tsx'
import type { SiteHeaderItem } from '../components/site-header.tsx'
import { Tabs } from '../components/tabs.tsx'
import { demoImage } from './demo-images.ts'

const items: SiteHeaderItem[] = [
  {
    value: 'fonctionnalites',
    label: 'Fonctionnalités',
    href: '#fonctionnalites',
    links: [
      {
        label: 'Demandes',
        href: '#demandes',
        description: 'Toutes les demandes des couples au même endroit',
        icon: <TrayIcon />,
      },
      {
        label: 'Calendrier',
        href: '#calendrier',
        description: 'Vos dates et vos espaces, d’un coup d’œil',
        icon: <CalendarDotsIcon />,
      },
      {
        label: 'Devis et factures',
        href: '#devis',
        description: 'Acomptes, soldes et cautions suivis',
        icon: <ReceiptIcon />,
      },
      {
        label: 'Contrats',
        href: '#contrats',
        description: 'Signés en ligne depuis un téléphone',
        icon: <SignatureIcon />,
      },
    ],
    feature: {
      title: 'Nouveau : le formulaire pour votre site',
      href: '#nouveautes',
      description: 'Les couples vous écrivent sans quitter votre site.',
      image: {
        src: demoImage('garden'),
        alt: 'Illustration : jardin au printemps',
      },
    },
  },
  {
    value: 'ressources',
    label: 'Ressources',
    href: '#ressources',
    links: [
      {
        label: 'Blog',
        href: '#blog',
        description: 'Facturation, visites, relances',
        icon: <BookOpenIcon />,
      },
      {
        label: 'Nouveautés',
        href: '#nouveautes',
        description: 'Ce qui a changé, mois par mois',
        icon: <SparkleIcon />,
      },
      {
        label: 'Bien démarrer',
        href: '#demarrer',
        description: 'Votre lieu prêt en une soirée',
        icon: <RocketLaunchIcon />,
      },
      {
        label: 'Aide',
        href: '#aide',
        description: 'Les réponses aux questions fréquentes',
        icon: <LifebuoyIcon />,
      },
    ],
  },
  { value: 'tarifs', label: 'Tarifs', href: '#tarifs' },
  { value: 'lieux', label: 'Pour quels lieux', href: '#lieux' },
]

const brand = (
  <a
    href="#accueil"
    className="inline-flex items-center gap-2 rounded-lg py-2 pr-2 text-base font-medium text-fg outline-none focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-solid"
  >
    <span
      aria-hidden="true"
      className="grid size-7 place-items-center rounded-lg bg-inverse text-sm font-semibold text-fg-inverse"
    >
      T
    </span>
    Talyra
  </a>
)

const actions = (
  <>
    <Button variant="ghost">Se connecter</Button>
    <Button>Essai gratuit</Button>
  </>
)

const meta = preview.meta({
  title: 'Blocs/SiteHeader',
  component: SiteHeader,
  parameters: { layout: 'padded' },
  args: {
    variant: 'mega',
    brand,
    items,
    defaultCurrent: 'fonctionnalites',
    actions,
    mobileAction: <Button size="sm">Essai gratuit</Button>,
    sticky: true,
    scrollThreshold: 8,
  },
  // A small page that scrolls under the header.
  render: (args) => (
    <div className="mx-auto h-130 w-full max-w-300 overflow-y-auto overscroll-contain rounded-3xl bg-canvas ring-1 ring-line">
      <SiteHeader {...args} />
      <div className="grid justify-items-center gap-3 px-6 pt-20 pb-16 text-center">
        <h2 className="font-heading text-3xl font-medium text-fg">
          Le logiciel des lieux de réception
        </h2>
        <p className="max-w-105 text-sm text-fg-muted">
          Demandes, calendrier, devis et contrats : tout votre domaine au même
          endroit. Faites défiler : la barre se remplit.
        </p>
      </div>
      <div aria-hidden="true" className="grid gap-3 px-6 pb-6">
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
            <span className="h-30 rounded-2xl bg-tray" />
            <span className="h-30 rounded-2xl bg-tray max-sm:hidden" />
            <span className="h-30 rounded-2xl bg-tray max-sm:hidden" />
          </div>
        ))}
      </div>
    </div>
  ),
})

/**
 * A wedding venue software's site header: point at « Fonctionnalités » for
 * its panel, scroll the page and the bar fills.
 */
export const Basic = meta.story({})

/**
 * On a phone (what the landing page needs most): the brand, « Essai
 * gratuit » and ☰. The menu comes from the top, the focus stays inside,
 * Escape closes it; « Fonctionnalités » and « Ressources » open like an
 * accordion.
 */
export const Phone = meta.story({
  globals: { viewport: { value: 'phone' } },
})

/**
 * The three layouts: `simple` (links beside the brand), `centered` (links
 * on a tray), `mega` (panels of links). Choose a page: its mark glides to
 * it.
 */
export const Variants = meta.story({
  render: function Render(args) {
    const [variant, setVariant] = useState<'simple' | 'centered' | 'mega'>(
      'mega',
    )
    const [current, setCurrent] = useState('tarifs')
    return (
      <div className="grid justify-items-center gap-4">
        <Tabs
          value={variant}
          onValueChange={(value) =>
            setVariant(value as 'simple' | 'centered' | 'mega')
          }
        >
          <PillTabsList
            label="Disposition de l’en-tête"
            value={variant}
            tabs={[
              { value: 'mega', label: 'Panneaux' },
              { value: 'simple', label: 'Simple' },
              { value: 'centered', label: 'Centrée' },
            ]}
          />
        </Tabs>
        <div className="h-105 w-full max-w-300 overflow-y-auto overscroll-contain rounded-3xl bg-canvas ring-1 ring-line">
          <SiteHeader
            {...args}
            variant={variant}
            current={current}
            onCurrentChange={setCurrent}
          />
          <div className="grid justify-items-center gap-3 px-6 pt-20 pb-60 text-center">
            <h2 className="font-heading text-3xl font-medium text-fg">
              {items.find((item) => item.value === current)?.label}
            </h2>
          </div>
        </div>
      </div>
    )
  },
})

/**
 * Choose another page: the line glides under it. Scroll: the bar fills
 * past 8 px and clears again under 4 px. On a phone, open the menu: the ×
 * turns in, the rows drop in one after the other, a group unfolds on a
 * spring.
 */
export const Animations = meta.story({
  tags: ['animated'],
})
