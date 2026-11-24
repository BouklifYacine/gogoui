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
import { TableSelectRow } from './table-select-row.tsx'

const members = [
  { id: 'a', name: 'Julie Martin', role: 'Administratrice', locked: true },
  { id: 'b', name: 'Paul Durand', role: 'Membre', locked: false },
  { id: 'c', name: 'Sara Benali', role: 'Membre', locked: false },
]

const meta = preview.meta({
  title: 'Listes et tableaux/TableSelectRow',
  component: TableSelectRow,
  parameters: { layout: 'padded' },
})

/**
 * Each row's box, named by its row (« Sélectionner Paul Durand »). A row no
 * bulk action applies to stays `disabled`.
 */
export const Basic = meta.story({
  render: function Render() {
    const [ticked, setTicked] = useState<string[]>(['b'])
    return (
      <div className="max-w-2xl overflow-hidden rounded-2xl bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <span className="sr-only">Sélection</span>
              </TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Rôle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow
                key={member.id}
                data-state={ticked.includes(member.id) ? 'selected' : undefined}
              >
                <TableSelectRow
                  name={member.name}
                  disabled={member.locked}
                  checked={ticked.includes(member.id)}
                  onCheckedChange={(tick) =>
                    setTicked((ids) =>
                      tick
                        ? [...ids, member.id]
                        : ids.filter((id) => id !== member.id),
                    )
                  }
                />
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  },
})
