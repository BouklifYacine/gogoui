import preview from '#.storybook/preview'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table.tsx'

const invoices = [
  { number: 'F-041', client: 'Léa et Hugo', amount: '1 500 €' },
  { number: 'F-042', client: 'Camille Martin', amount: '3 200 €' },
  { number: 'F-043', client: 'Jules et Anna', amount: '980 €' },
]

const meta = preview.meta({
  title: 'Composants/Table',
  component: Table,
})

/**
 * Invoices in rows: a header naming each column, amounts aligned right in
 * columns, a caption saying what the table is.
 *
 * @summary A data table with amounts aligned right.
 */
export const Basic = meta.story({
  render: () => (
    <Table className="w-[28rem]">
      <TableCaption>Factures du mois</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>N°</TableHead>
          <TableHead>Client</TableHead>
          <TableHead className="text-right">Montant</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.number}>
            <TableCell>{invoice.number}</TableCell>
            <TableCell>{invoice.client}</TableCell>
            <TableCell className="amount text-right">
              {invoice.amount}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
})
