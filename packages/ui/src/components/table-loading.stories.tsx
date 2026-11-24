import preview from '#.storybook/preview'

import { Table, TableBody, TableHead, TableHeader, TableRow } from './table.tsx'
import { TableLoading } from './table-loading.tsx'
import { TableSelectAll } from './table-select-all.tsx'

const meta = preview.meta({
  title: 'Listes et tableaux/TableLoading',
  component: TableLoading,
  parameters: { layout: 'padded' },
})

/**
 * The body while the rows load, under the real header: bars of different
 * lengths, so the rows read as text.
 */
export const Basic = meta.story({
  args: { columns: 3 },
  render: (args) => (
    <div className="max-w-2xl overflow-hidden rounded-2xl bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Montant</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableLoading {...args} />
        </TableBody>
      </Table>
    </div>
  ),
})

/**
 * Rows that can be ticked (`selectable`): a box column first, three rows
 * only (`rows`).
 */
export const Selectable = meta.story({
  render: () => (
    <div className="max-w-2xl overflow-hidden rounded-2xl bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableSelectAll checked={false} onCheckedChange={() => {}} />
            <TableHead>Nom</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Montant</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableLoading columns={3} rows={3} selectable />
        </TableBody>
      </Table>
    </div>
  ),
})
