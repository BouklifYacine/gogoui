import { useState } from 'react'
import { ArchiveIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { Badge } from '../components/badge.tsx'
import { Button } from '../components/button.tsx'
import { EmptyState } from '../components/empty-state.tsx'
import { RowActionsMenu } from '../components/row-actions-menu.tsx'
import { DataTable } from './data-table.tsx'
import { DataTableColumnsMenu } from './data-table-columns-menu.tsx'
import { DataTableSkeleton } from './data-table-skeleton.tsx'
import { createDataColumns, useDataTable } from './table-hook.ts'
import { useRowSelection } from './use-row-selection.ts'

type Client = {
  id: string
  name: string
  email: string
  date: string
  stage: 'Nouvelle' | 'Visite' | 'Devis' | 'Gagnée'
  budget: number
}

const names = [
  'Marie et Lucas',
  'Élise et Tom',
  'Zoé et Hugo',
  'Inès et Karim',
  'Camille et Léa',
  'Sarah et Adam',
  'Julie et Paul',
  'Nina et Yanis',
  'Chloé et Sami',
  'Laura et Enzo',
  'Manon et Noah',
  'Anaïs et Louis',
]
const stages = ['Nouvelle', 'Visite', 'Devis', 'Gagnée'] as const
const clients: Client[] = names.map((name, index) => ({
  id: String(index + 1),
  name,
  email: `${name.split(' ')[0]?.toLowerCase()}@exemple.fr`,
  date: `2027-0${(index % 9) + 1}-1${index % 9}`,
  stage: stages[index % 4] ?? 'Nouvelle',
  budget: 8000 + index * 1250,
}))

const euros = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const column = createDataColumns<Client>()
const columns = column.columns([
  column.accessor('name', {
    header: 'Couple',
    sortFn: 'text',
    meta: { title: true },
  }),
  column.accessor('email', {
    header: 'E-mail',
    enableSorting: false,
    meta: { muted: true, phoneHidden: true },
  }),
  column.accessor('date', {
    header: 'Date',
    sortFn: 'basic',
    cell: (info) =>
      new Date(info.getValue()).toLocaleDateString('fr-FR', {
        dateStyle: 'medium',
      }),
  }),
  column.accessor('stage', {
    header: 'Étape',
    sortFn: 'text',
    cell: (info) => <Badge variant="secondary">{info.getValue()}</Badge>,
    meta: { phoneTrailing: true },
  }),
  column.accessor('budget', {
    header: 'Budget',
    sortFn: 'basic',
    cell: (info) => euros.format(info.getValue()),
    meta: { amount: true },
  }),
  column.display({
    id: 'actions',
    header: 'Actions',
    cell: (info) => (
      <RowActionsMenu
        name={info.row.original.name}
        actions={[
          { label: 'Modifier', icon: PencilSimpleIcon, onSelect: () => {} },
          { label: 'Archiver', icon: ArchiveIcon, onSelect: () => {} },
          {
            label: 'Supprimer',
            icon: TrashIcon,
            destructive: true,
            onSelect: () => {},
          },
        ]}
      />
    ),
    meta: { actions: true, phoneInline: true },
  }),
])

const meta = preview.meta({
  title: 'Listes et tableaux/DataTable',
  component: DataTable,
  subcomponents: { DataTableColumnsMenu, DataTableSkeleton },
  parameters: { layout: 'padded' },
})

/**
 * A whole list: search (« / »), sort by the headers, columns to hide, rows
 * to tick with their actions, pages. On a phone, dense rows and a sort
 * chip. Import from `@gogoui/ui/data-table`.
 */
export const Basic = meta.story({
  render: function Render() {
    const selection = useRowSelection('clients')
    const table = useDataTable({
      data: clients,
      columns,
      state: {
        rowSelection: selection.rowSelection,
      },
      onRowSelectionChange: selection.onRowSelectionChange,
      initialState: {
        sorting: [{ id: 'date', desc: false }],
        pagination: { pageIndex: 0, pageSize: 10 },
      },
    })
    return (
      <DataTable
        table={table}
        caption="Clients"
        filterLabel="Filtrer les clients"
        emptyState={<EmptyState title="Aucun client pour l'instant" />}
        pagination={{
          rowsLabel: (count) => `${count} client${count > 1 ? 's' : ''}`,
        }}
        selection={{
          label: (count) =>
            `${count} client${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''}`,
          actions: (
            <Button variant="outline" size="sm">
              <ArchiveIcon aria-hidden="true" />
              Archiver
            </Button>
          ),
        }}
      />
    )
  },
})

/**
 * No row yet: the list's own empty state, with its way out.
 */
export const Empty = meta.story({
  render: function Render() {
    const [data] = useState<Client[]>([])
    const table = useDataTable({ data, columns })
    return (
      <DataTable
        table={table}
        caption="Clients"
        emptyState={
          <EmptyState
            title="Aucun client pour l'instant"
            description="Vos clients arrivent avec leurs demandes."
            action={<Button>Ajouter un client</Button>}
          />
        }
      />
    )
  },
})

/**
 * While the rows load: the same columns, in grey.
 */
export const Loading = meta.story({
  render: () => (
    <DataTableSkeleton
      columns={columns}
      pagination="1 à 10 sur 40 clients"
      rows={Array.from({ length: 5 }, () => ({
        name: 'Marie et Lucas',
        email: 'marie@exemple.fr',
        date: '12 juin 2027',
        stage: 'Nouvelle',
        budget: '12 500 €',
      }))}
    />
  ),
})
