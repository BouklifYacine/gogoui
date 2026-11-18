import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  createTableHook,
  filterFn_includesString,
  globalFilteringFeature,
  metaHelper,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_basic,
  tableFeatures,
} from '@tanstack/react-table'
import type { SortFn } from '@tanstack/react-table'

/**
 * What a column says about itself beyond its data: DataTable reads it to
 * lay the cell out, in the table and on the phone rows.
 */
export type DataColumnMeta = {
  /** The row's name: bold, first on a phone row, carries its main link. */
  title?: boolean
  /** A supporting detail, in the secondary colour. */
  muted?: boolean
  /** A count or an amount: right-aligned, figures in columns. */
  amount?: boolean
  /** Left out of the phone rows. */
  phoneHidden?: boolean
  /** On a phone row, on the right of the name (a state, a price). */
  phoneTrailing?: boolean
  /** The row's buttons: no header read, last on a phone row. */
  actions?: boolean
  /** The row's buttons are one « … » menu: beside the name on a phone. */
  phoneInline?: boolean
  /** The header's width class (`w-36`); `w-auto` takes what is left. */
  width?: string
  /** Shown from that screen width only (xl 1280, 2xl 1536, wide 1680 px). */
  hideBelow?: 'xl' | '2xl' | 'wide'
}

/** The classes that hide a column's header and cells below its width. */
export const hideBelowClasses = {
  xl: 'hidden xl:table-cell',
  '2xl': 'hidden 2xl:table-cell',
  wide: 'hidden min-[1680px]:table-cell',
} as const

// Sorts text as a reader expects: accents and case ignored, so « Élise »
// comes before « Zoé ». TanStack's sort functions are invariant in their
// types: like its own sortFn_basic, this one serves every table.
// oxlint-disable-next-line typescript/no-explicit-any
const sortFn_text: SortFn<any, any> = (rowA, rowB, columnId) =>
  String(rowA.getValue(columnId) ?? '').localeCompare(
    String(rowB.getValue(columnId) ?? ''),
    undefined,
    { sensitivity: 'base' },
  )

/**
 * The features every list uses: sorting, a text filter across the
 * columns, columns to hide, rows to tick, and pages. A list the API sends
 * whole is cut into pages here; a list the API pages itself sets
 * `manualPagination` and `manualSorting` and passes the page with its
 * total.
 */
export const dataTableFeatures = tableFeatures({
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowSelectionFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  columnVisibilityFeature,
  // 'text' for names and labels, 'basic' for numbers and ISO dates.
  sortFns: { text: sortFn_text, basic: sortFn_basic },
  filterFns: { includesString: filterFn_includesString },
  columnMeta: metaHelper<DataColumnMeta>(),
})

const tableHook = createTableHook({
  features: dataTableFeatures,
  // The row's key is the record's id: a sort or a reload keeps each row.
  getRowId: (row: { id: string }) => row.id,
  globalFilterFn: 'includesString',
  // A column is sorted one way or the other, never « not sorted » on a
  // third click: nobody could tell that state from the first.
  enableSortingRemoval: false,
})

/** Column definitions bound to the features above: `createDataColumns<Row>()`. */
export const createDataColumns = tableHook.createAppColumnHelper

/** The table of a list: `useDataTable({ data, columns, initialState })`. */
export const useDataTable = tableHook.useAppTable

/** What `useDataTable` returns. */
export type DataTableInstance<TData extends { id: string }> = ReturnType<
  typeof useDataTable<TData>
>
