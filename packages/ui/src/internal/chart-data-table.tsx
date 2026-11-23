/**
 * A chart's figures as a table only screen readers see, after Arc UI's
 * charts (https://uiarc.dev, MIT): the text alternative of a drawing. The
 * first cell of each row is its header (the day, the segment).
 *
 * @summary Internal: a chart's figures as a visually hidden table.
 */
export function ChartDataTable({
  caption,
  head,
  rows,
}: {
  caption: string
  /** The columns' names, the row header's first. */
  head: readonly string[]
  rows: readonly { key: string; cells: readonly string[] }[]
}) {
  if (rows.length === 0) {
    return null
  }
  return (
    <div className="sr-only">
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {head.map((name) => (
              <th key={name} scope="col">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              {row.cells.map((cell, index) =>
                index === 0 ? (
                  <th key={index} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={index}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
