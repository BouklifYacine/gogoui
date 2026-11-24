import { useState } from 'react'
import { DownloadSimpleIcon, PlusIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { ExpandingSearch } from './expanding-search.tsx'
import { FilterChips } from './filter-chips.tsx'
import { TableToolbar } from './table-toolbar.tsx'

const meta = preview.meta({
  title: 'Listes et tableaux/TableToolbar',
  component: TableToolbar,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="max-w-3xl">{Story()}</div>],
})

/**
 * The line above a table: what is shown on the left, the search and the
 * list's buttons on the right; on a phone they wrap.
 */
export const Basic = meta.story({
  render: function Render() {
    const [query, setQuery] = useState('')
    return (
      <TableToolbar
        start={<h2 className="text-lg font-medium">Commandes</h2>}
        filters={
          <ExpandingSearch
            id="toolbar-search"
            label="Rechercher une commande"
            value={query}
            onValueChange={setQuery}
          />
        }
        actions={
          <>
            <Button variant="outline" size="sm">
              <DownloadSimpleIcon aria-hidden="true" />
              Exporter
            </Button>
            <Button size="sm">
              <PlusIcon aria-hidden="true" />
              Ajouter
            </Button>
          </>
        }
      />
    )
  },
})

const firstChips = [
  { id: 'status', label: 'Statut : en cours' },
  { id: 'month', label: 'Mois : mars' },
]

/**
 * A second line under it (children) for the active filters.
 */
export const WithActiveFilters = meta.story({
  render: function Render() {
    const [chips, setChips] = useState(firstChips)
    const remove = (id: string) =>
      setChips((all) => all.filter((chip) => chip.id !== id))
    return (
      <TableToolbar
        start={<h2 className="text-lg font-medium">Commandes</h2>}
        actions={<Button size="sm">Ajouter</Button>}
      >
        <FilterChips
          chips={chips.map((chip) => ({
            ...chip,
            onRemove: () => remove(chip.id),
          }))}
          onReset={() => setChips([])}
        />
      </TableToolbar>
    )
  },
})
