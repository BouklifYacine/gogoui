import { MagnifyingGlassIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { EmptyState } from './empty-state.tsx'
import { Table, TableBody, TableHead, TableHeader, TableRow } from './table.tsx'
import { TableEmpty } from './table-empty.tsx'

const meta = preview.meta({
  title: 'Listes et tableaux/TableEmpty',
  component: TableEmpty,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-2xl overflow-hidden rounded-2xl bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Montant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{Story()}</TableBody>
        </Table>
      </div>
    ),
  ],
})

/**
 * No row to show: one sentence across every column (`colSpan`), under
 * the real header.
 */
export const Basic = meta.story({
  args: {
    colSpan: 3,
    children: 'Aucune commande pour le moment.',
  },
})

/**
 * An `EmptyState` inside, with its way out: after a search that finds
 * nothing, the button clears it.
 */
export const WithEmptyState = meta.story({
  args: {
    colSpan: 3,
    children: (
      <EmptyState
        icon={<MagnifyingGlassIcon />}
        title="Aucun résultat"
        description="Aucune commande ne contient « lampe »."
        action={
          <Button variant="outline" size="sm">
            Effacer la recherche
          </Button>
        }
      />
    ),
  },
})
