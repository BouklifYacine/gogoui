import { useState } from 'react'
import { ArchiveIcon, PlusIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { Badge } from './badge.tsx'
import { BulkActionsBar } from './bulk-actions-bar.tsx'
import { Button } from './button.tsx'
import { ExpandingSearch } from './expanding-search.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table.tsx'
import { TableEmpty } from './table-empty.tsx'
import { TableLoading } from './table-loading.tsx'
import { TablePagination } from './table-pagination.tsx'
import { TableSelectAll } from './table-select-all.tsx'
import { TableSelectRow } from './table-select-row.tsx'
import { TableSortHead } from './table-sort-head.tsx'
import { TableToolbar } from './table-toolbar.tsx'

const meta = preview.meta({
  title: 'Listes/Table sans logique',
  component: TablePagination,
  subcomponents: {
    TableSortHead,
    TableSelectAll,
    TableSelectRow,
    TableToolbar,
    TableEmpty,
    TableLoading,
  },
  parameters: { layout: 'padded' },
})

type Client = { id: string; name: string; stage: string; budget: number }

const clients: Client[] = Array.from({ length: 23 }, (_, index) => ({
  id: String(index + 1),
  name: [
    'Marie et Lucas',
    'Élise et Tom',
    'Zoé et Hugo',
    'Inès et Karim',
    'Camille et Léa',
  ][index % 5] as string,
  stage: ['Nouvelle', 'Visite', 'Devis', 'Gagnée'][index % 4] as string,
  budget: 8000 + index * 900,
}))

const euros = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

/**
 * Every piece together, the sorting, ticking, search and pages done by
 * the story itself: GoGoUI only draws them. Your app does the same with
 * its own data, or its API.
 */
export const Composed = meta.story({
  render: function Render() {
    const [query, setQuery] = useState('')
    const [sort, setSort] = useState<{
      key: 'name' | 'budget'
      dir: 'asc' | 'desc'
    }>({ key: 'name', dir: 'asc' })
    const [ticked, setTicked] = useState<string[]>([])
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const kept = clients
      .filter((client) =>
        client.name.toLowerCase().includes(query.trim().toLowerCase()),
      )
      .sort((a, b) => {
        const order =
          sort.key === 'name'
            ? a.name.localeCompare(b.name, 'fr')
            : a.budget - b.budget
        return sort.dir === 'asc' ? order : -order
      })
    const shown = kept.slice((page - 1) * pageSize, page * pageSize)
    const pageIds = shown.map((client) => client.id)
    const pageTicked = pageIds.filter((id) => ticked.includes(id)).length
    const toggleSort = (key: 'name' | 'budget') => {
      setSort((current) => ({
        key,
        dir: current.key === key && current.dir === 'asc' ? 'desc' : 'asc',
      }))
      setPage(1)
    }

    return (
      <div className="flex max-w-3xl flex-col gap-4">
        <TableToolbar
          start={<h2 className="text-lg font-medium">Clients</h2>}
          filters={
            <ExpandingSearch
              id="kit-search"
              label="Rechercher un client"
              value={query}
              onValueChange={(text) => {
                setQuery(text)
                setPage(1)
              }}
            />
          }
          actions={
            <Button size="sm">
              <PlusIcon aria-hidden="true" />
              Ajouter
            </Button>
          }
        />
        <div className="@container relative overflow-hidden rounded-2xl bg-card shadow-sm">
          {ticked.length > 0 && (
            <BulkActionsBar
              label={`${ticked.length} sélectionné${ticked.length > 1 ? 's' : ''}`}
              actions={
                <Button variant="outline" size="sm">
                  <ArchiveIcon aria-hidden="true" />
                  Archiver
                </Button>
              }
            />
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableSelectAll
                  checked={
                    pageTicked === 0
                      ? ticked.length > 0
                        ? 'some'
                        : false
                      : pageTicked === pageIds.length
                        ? true
                        : 'some'
                  }
                  onCheckedChange={(all) => setTicked(all ? pageIds : [])}
                />
                <TableSortHead
                  sort={sort.key === 'name' && sort.dir}
                  onSort={() => toggleSort('name')}
                >
                  Couple
                </TableSortHead>
                <TableHead>Étape</TableHead>
                <TableSortHead
                  align="end"
                  sort={sort.key === 'budget' && sort.dir}
                  onSort={() => toggleSort('budget')}
                >
                  Budget
                </TableSortHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.length === 0 ? (
                <TableEmpty colSpan={4}>
                  Aucun client pour « {query} »
                </TableEmpty>
              ) : (
                shown.map((client) => {
                  const isTicked = ticked.includes(client.id)
                  return (
                    <TableRow
                      key={client.id}
                      data-state={isTicked ? 'selected' : undefined}
                    >
                      <TableSelectRow
                        name={client.name}
                        checked={isTicked}
                        onCheckedChange={(tick) =>
                          setTicked((ids) =>
                            tick
                              ? [...ids, client.id]
                              : ids.filter((id) => id !== client.id),
                          )
                        }
                      />
                      <TableCell className="font-medium">
                        {client.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="subtle" color="info">
                          {client.stage}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {euros.format(client.budget)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          page={page}
          pageSize={pageSize}
          total={kept.length}
          rowsLabel={(count) => `${count} client${count > 1 ? 's' : ''}`}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      </div>
    )
  },
})

/**
 * The pages alone: change `page`, `pageSize` and `total` in the controls.
 */
export const Pagination = meta.story({
  args: {
    page: 3,
    pageSize: 10,
    total: 257,
    onPageChange: () => {},
    onPageSizeChange: () => {},
  },
})

/**
 * The body while the rows load, under the real header.
 */
export const Loading = meta.story({
  render: () => (
    <div className="max-w-3xl overflow-hidden rounded-2xl bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableSelectAll checked={false} onCheckedChange={() => {}} />
            <TableHead>Couple</TableHead>
            <TableHead>Étape</TableHead>
            <TableHead className="text-right">Budget</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableLoading columns={3} selectable />
        </TableBody>
      </Table>
    </div>
  ),
})
