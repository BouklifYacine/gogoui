import { useState } from 'react'

import preview from '#.storybook/preview'

import { FieldShell } from './field-shell.tsx'
import { RichTextEditor } from './rich-text-editor.tsx'

const meta = preview.meta({
  title: 'Formulaires/RichTextEditor',
  component: RichTextEditor,
  decorators: [(Story) => <div className="w-[32rem]">{Story()}</div>],
})

/**
 * An e-mail template: bold, a title, lists; the HTML comes out under it.
 */
export const Basic = meta.story({
  args: {
    placeholder: 'Écrivez votre message…',
    disabled: false,
    defaultValue:
      '<p>Bonjour <strong>Marie et Lucas</strong>,</p><p>Voici ce que comprend la location :</p><ul><li>la grange</li><li>le jardin</li></ul>',
  },
  render: function Render(args) {
    const [html, setHtml] = useState(args.defaultValue ?? '')
    return (
      <div className="flex flex-col gap-3">
        <FieldShell name="template" label="Message au couple">
          {(control, fieldLabel) => (
            <RichTextEditor
              {...args}
              id={control.id}
              aria-labelledby={fieldLabel.id}
              aria-describedby={control['aria-describedby']}
              onValueChange={setHtml}
            />
          )}
        </FieldShell>
        <pre className="rounded-lg bg-tray p-3 text-xs break-all whitespace-pre-wrap text-fg-muted">
          {html}
        </pre>
      </div>
    )
  },
})
