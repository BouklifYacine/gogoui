import { useState } from 'react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { ListTabs } from './list-tabs.tsx'

const meta = preview.meta({
  title: 'Mise en page/ListTabs',
  component: ListTabs,
  parameters: { layout: 'padded' },
})

/**
 * Two sets of rows of one list, a tool on the tabs' line.
 */
export const Basic = meta.story({
  render: function Render() {
    const [tab, setTab] = useState<'active' | 'archived'>('active')
    return (
      <ListTabs
        label="Clients à afficher"
        value={tab}
        onValueChange={setTab}
        tabs={[
          { value: 'active', label: 'Clients', count: 42 },
          { value: 'archived', label: 'Archivés', count: 7 },
        ]}
        toolbar={
          <Button variant="outline" size="sm" className="ms-auto">
            Exporter
          </Button>
        }
      >
        <p className="text-fg-muted">
          {tab === 'active'
            ? 'Les 42 clients en cours.'
            : 'Les 7 clients archivés.'}
        </p>
      </ListTabs>
    )
  },
})
