import { PlusIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { Alert, AlertTitle } from '../components/alert.tsx'
import { Button } from '../components/button.tsx'
import { Checkbox } from '../components/checkbox.tsx'
import { FilterChips } from '../components/filter-chips.tsx'
import { GoGoUIProvider } from './gogoui-provider.tsx'

const meta = preview.meta({
  title: 'Options/Icons',
  component: GoGoUIProvider,
})

// Your own icon: any component taking a className.
function Cross({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

const sample = (
  <div className="flex w-96 flex-col gap-4">
    <Alert color="success">
      <AlertTitle>Votre agenda est connecté</AlertTitle>
    </Alert>
    <div className="flex items-center gap-3">
      <Checkbox defaultChecked aria-label="Exemple" />
      <Button iconStart={<PlusIcon />}>Ajouter</Button>
    </div>
    <FilterChips
      chips={[{ id: 'stage', label: 'Étape : Nouvelle', onRemove: () => {} }]}
      onReset={() => {}}
    />
  </div>
)

/**
 * `iconWeight` changes every Phosphor icon at once; `icons` replaces one
 * of GoGoUI's own (here the ×) by yours, from any library. Change the
 * weight in the controls.
 */
export const Override = meta.story({
  args: {
    iconWeight: 'bold',
    icons: { close: Cross },
    children: sample,
  },
})
