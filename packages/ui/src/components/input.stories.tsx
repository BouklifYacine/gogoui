import preview from '#.storybook/preview'

import { Input } from './input.tsx'

const meta = preview.meta({
  title: 'Formulaires/Saisie/Input',
  component: Input,
  render: (args) => (
    <div className="grid w-72 gap-2">
      <label htmlFor="story-input" className="text-sm font-medium">
        Nom du couple
      </label>
      <Input id="story-input" {...args} />
    </div>
  ),
})

/**
 * A text field always under its visible label, linked by `id`/`htmlFor`.
 * The placeholder is an example, never the label.
 */
export const Basic = meta.story({
  args: { placeholder: 'Léa et Hugo' },
})

/**
 * An error: `aria-invalid` turns the edge red; the message under the field
 * says what to fix, linked with `aria-describedby`.
 */
export const Invalid = meta.story({
  render: () => (
    <div className="grid w-72 gap-2">
      <label htmlFor="story-email" className="text-sm font-medium">
        E-mail
      </label>
      <Input
        id="story-email"
        type="email"
        defaultValue="lea@"
        aria-invalid
        aria-describedby="story-email-error"
      />
      <p id="story-email-error" className="text-sm text-destructive">
        Il manque la fin de l'adresse, par exemple lea@gmail.com.
      </p>
    </div>
  ),
})

/**
 * A field that cannot be changed here: greyed, out of the tab order.
 */
export const Disabled = meta.story({
  args: { disabled: true, defaultValue: 'Domaine des Tilleuls' },
})
