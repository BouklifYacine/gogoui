import { useState } from 'react'

import preview from '#.storybook/preview'

import { TablePagination } from './table-pagination.tsx'

const meta = preview.meta({
  title: 'Listes et tableaux/TablePagination',
  component: TablePagination,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="max-w-3xl">{Story()}</div>],
})

/**
 * The pages and the page size of a list your code pages itself (an API, a
 * server): the range is read aloud when the page changes.
 */
export const Basic = meta.story({
  render: function Render() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(25)
    return (
      <TablePagination
        page={page}
        pageSize={pageSize}
        total={257}
        rowsLabel={(count) => `${count} commandes`}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />
    )
  },
})

/**
 * Without `onPageSizeChange`, the pages alone: change `page`, `pageSize`
 * and `total` in the controls.
 */
export const PagesOnly = meta.story({
  args: {
    page: 3,
    pageSize: 10,
    total: 84,
    onPageChange: () => {},
  },
})
