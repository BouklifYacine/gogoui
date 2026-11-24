import preview from '#.storybook/preview'

import { ErrorSummary } from './error-summary.tsx'

const meta = preview.meta({
  title: 'Formulaires/Structure/ErrorSummary',
  component: ErrorSummary,
  decorators: [(Story) => <div className="w-96">{Story()}</div>],
})

/**
 * At the top of a long form after a refused submit; each line leads to
 * its field.
 */
export const Basic = meta.story({
  args: {
    errors: [
      { fieldId: 'email', message: "Saisissez l'e-mail du couple." },
      { fieldId: 'date', message: "Choisissez la date de l'événement." },
    ],
  },
})
