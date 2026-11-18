import { useState } from 'react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { StepProgress } from './step-progress.tsx'

const meta = preview.meta({
  title: 'Mise en page/StepProgress',
  component: StepProgress,
  decorators: [(Story) => <div className="w-[28rem]">{Story()}</div>],
})

const steps = ['Fichier', 'Colonnes', 'Vérification', 'Import']

/**
 * An import in four steps: go forward to watch a step turn green.
 *
 * @summary Numbered steps on a line.
 */
export const Basic = meta.story({
  render: function Render() {
    const [current, setCurrent] = useState(2)
    return (
      <div className="flex flex-col gap-6">
        <StepProgress steps={steps} current={current} />
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={current === 1}
            onClick={() => setCurrent((step) => step - 1)}
          >
            Précédent
          </Button>
          <Button
            disabled={current === steps.length}
            onClick={() => setCurrent((step) => step + 1)}
          >
            Suivant
          </Button>
        </div>
      </div>
    )
  },
})
