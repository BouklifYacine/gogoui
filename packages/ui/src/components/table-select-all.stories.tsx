import { useState } from 'react'

import preview from '#.storybook/preview'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table.tsx'
import { TableSelectAll } from './table-select-all.tsx'
import { TableSelectRow } from './table-select-row.tsx'

const files = [
  { id: 'a', name: 'Rapport annuel.pdf', size: '2,4 Mo' },
  { id: 'b', name: 'Budget 2027.xlsx', size: '310 Ko' },
  { id: 'c', name: 'Logo.svg', size: '18 Ko' },
]

const meta = preview.meta({
  title: 'Listes et tableaux/TableSelectAll',
  component: TableSelectAll,
  parameters: { layout: 'padded' },
})

/**
 * The head's box ticks the page; with some rows ticked it shows a dash
 * (`'some'`), and a click unticks everything.
 */
export const Basic = meta.story({
  render: function Render() {
    const [ticked, setTicked] = useState<string[]>(['b'])
    const all = files.map((file) => file.id)
    let state: boolean | 'some' = 'some'
    if (ticked.length === 0) state = false
    if (ticked.length === all.length) state = true
    return (
      <div className="max-w-2xl overflow-hidden rounded-2xl bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableSelectAll
                checked={state}
                onCheckedChange={(tick) => setTicked(tick ? all : [])}
              />
              <TableHead>Fichier</TableHead>
              <TableHead className="text-right">Taille</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow
                key={file.id}
                data-state={ticked.includes(file.id) ? 'selected' : undefined}
              >
                <TableSelectRow
                  name={file.name}
                  checked={ticked.includes(file.id)}
                  onCheckedChange={(tick) =>
                    setTicked((ids) =>
                      tick
                        ? [...ids, file.id]
                        : ids.filter((id) => id !== file.id),
                    )
                  }
                />
                <TableCell className="font-medium">{file.name}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {file.size}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  },
})
