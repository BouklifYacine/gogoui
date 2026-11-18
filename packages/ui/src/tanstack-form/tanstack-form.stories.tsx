import preview from '#.storybook/preview'

import { useAppForm } from './index.ts'

const meta = preview.meta({
  title: 'Formulaires/TanStack Form',
  decorators: [(Story) => <div className="w-96">{Story()}</div>],
})

/**
 * `useAppForm` from `@gogoui/ui/tanstack-form`: each field reads its value
 * and errors from the form. Submit it empty: the summary lists what to
 * fix and takes the focus.
 *
 * @summary A whole form with TanStack Form.
 */
export const RequestForm = meta.story({
  render: function Render() {
    const form = useAppForm({
      defaultValues: { name: '', email: '', date: null as string | null },
      validators: {
        onSubmit: ({ value }) => ({
          fields: {
            name: value.name ? undefined : 'Saisissez le nom du couple.',
            email: value.email.includes('@')
              ? undefined
              : "Saisissez l'e-mail du couple.",
            date: value.date ? undefined : "Choisissez la date de l'événement.",
          },
        }),
      },
      onSubmit: () => new Promise((resolve) => setTimeout(resolve, 1000)),
    })
    return (
      <form.AppForm>
        <form.Form className="flex flex-col gap-6">
          <form.ErrorSummary />
          <form.AppField name="name">
            {(field) => <field.TextField label="Couple" autoComplete="off" />}
          </form.AppField>
          <form.AppField name="email">
            {(field) => (
              <field.TextField label="E-mail" type="email" autoComplete="off" />
            )}
          </form.AppField>
          <form.AppField name="date">
            {(field) => <field.DateField label="Date de l'événement" />}
          </form.AppField>
          <div>
            <form.SubmitButton loadingText="Création…">
              Créer la demande
            </form.SubmitButton>
          </div>
        </form.Form>
      </form.AppForm>
    )
  },
})
