import { useState } from 'react'

import preview from '#.storybook/preview'

import { SubmitButton } from './submit-button.tsx'

const meta = preview.meta({
  title: 'Formulaires/SubmitButton',
  component: SubmitButton,
})

/**
 * Busy while the form submits, saying so.
 *
 * @summary A submit button busy while it submits.
 */
export const Basic = meta.story({
  render: function Render() {
    const [submitting, setSubmitting] = useState(false)
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault()
          setSubmitting(true)
          setTimeout(() => setSubmitting(false), 1500)
        }}
      >
        <SubmitButton submitting={submitting} loadingText="Envoi…">
          Envoyer le devis
        </SubmitButton>
      </form>
    )
  },
})

/**
 * On a form that stays in sight: it closes into a spinner, then opens into
 * a green « Enregistré ».
 *
 * @summary A submit button that says it saved.
 */
export const Saved = meta.story({
  render: function Render() {
    const [submitting, setSubmitting] = useState(false)
    const [saved, setSaved] = useState(false)
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault()
          setSaved(false)
          setSubmitting(true)
          setTimeout(() => {
            setSubmitting(false)
            setSaved(true)
          }, 1200)
        }}
      >
        <SubmitButton
          submitting={submitting}
          saved={saved}
          loadingText="Enregistrement…"
        >
          Enregistrer
        </SubmitButton>
      </form>
    )
  },
})
