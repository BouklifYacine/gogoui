import preview from '#.storybook/preview'

import { ErrorAlert } from './error-alert.tsx'

const meta = preview.meta({
  title: 'Composants/ErrorAlert',
  component: ErrorAlert,
})

/**
 * What failed, and what to do now, in one or two sentences. Shown where
 * the person is (in the form, in the dialog), never as a toast.
 */
export const Basic = meta.story({
  args: {
    children:
      "Le devis n'a pas pu être envoyé. Vérifiez l'adresse du couple, puis réessayez.",
    className: 'max-w-md',
  },
})
