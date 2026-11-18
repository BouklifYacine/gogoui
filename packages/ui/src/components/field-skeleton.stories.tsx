import preview from '#.storybook/preview'

import { FieldSkeleton } from './field-skeleton.tsx'

const meta = preview.meta({
  title: 'Formulaires/FieldSkeleton',
  component: FieldSkeleton,
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

/**
 * A form while it loads, each field as tall as the real one.
 *
 * @summary A form while it loads.
 */
export const Form = meta.story({
  render: () => (
    <div className="flex flex-col gap-6">
      <FieldSkeleton label="Nom du lieu" />
      <FieldSkeleton label="Notes" control="textarea" rows={4} />
      <FieldSkeleton
        label="Rappels automatiques"
        description="Un e-mail 7 jours avant"
        control="switch"
      />
    </div>
  ),
})
