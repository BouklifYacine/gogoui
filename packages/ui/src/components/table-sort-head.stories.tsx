import { useState } from 'react'

import preview from '#.storybook/preview'

import { Table, TableBody, TableCell, TableHeader, TableRow } from './table.tsx'
import { TableSortHead } from './table-sort-head.tsx'

type Product = { name: string; stock: number }
type Sort = { key: keyof Product; dir: 'asc' | 'desc' }

const products: Product[] = [
  { name: 'Carnet', stock: 120 },
  { name: 'Agenda', stock: 35 },
  { name: 'Stylo', stock: 480 },
  { name: 'Classeur', stock: 64 },
]

function sortProducts(sort: Sort): Product[] {
  return [...products].sort((a, b) => {
    const order =
      sort.key === 'name'
        ? a.name.localeCompare(b.name, 'fr')
        : a.stock - b.stock
    return sort.dir === 'asc' ? order : -order
  })
}

const meta = preview.meta({
  title: 'Listes et tableaux/TableSortHead',
  component: TableSortHead,
  parameters: { layout: 'padded' },
})

/**
 * Click a header: your code decides the order, the header shows it (its
 * arrow and `aria-sort`). A number column is aligned right (`align="end"`).
 */
export const Basic = meta.story({
  render: function Render() {
    const [sort, setSort] = useState<Sort>({ key: 'name', dir: 'asc' })
    const toggle = (key: Sort['key']) =>
      setSort((current) => ({
        key,
        dir: current.key === key && current.dir === 'asc' ? 'desc' : 'asc',
      }))
    return (
      <div className="max-w-md overflow-hidden rounded-2xl bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableSortHead
                sort={sort.key === 'name' && sort.dir}
                onSort={() => toggle('name')}
              >
                Produit
              </TableSortHead>
              <TableSortHead
                align="end"
                sort={sort.key === 'stock' && sort.dir}
                onSort={() => toggle('stock')}
              >
                Stock
              </TableSortHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortProducts(sort).map((product) => (
              <TableRow key={product.name}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {product.stock}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  },
})
