import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { FixedActionBar } from './fixed-action-bar.tsx'

const meta = preview.meta({
  title: 'Mise en page/FixedActionBar',
  component: FixedActionBar,
  parameters: { layout: 'fullscreen' },
  globals: { viewport: { value: 'phone' } },
})

/**
 * On a phone, the total and the next step stay under the thumb. Hidden
 * from 768 px.
 *
 * @summary A phone's bottom action band.
 */
export const Basic = meta.story({
  render: () => (
    <div className="p-4">
      <p className="text-fg-muted">
        Le devis du couple, ligne par ligne, descend sous la bande.
      </p>
      <FixedActionBar label="Actions du devis">
        <p className="flex-1 font-medium tabular-nums">18 000 €</p>
        <Button>Envoyer le devis</Button>
      </FixedActionBar>
    </div>
  ),
})
