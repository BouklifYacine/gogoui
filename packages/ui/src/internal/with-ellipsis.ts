/**
 * A label that is still running, « Suppression » → « Suppression… ». A label
 * that already ends with « … » or « ... » keeps its own dots, so a caller
 * who wrote « Retrait… » does not get « Retrait…… ».
 */
export function withEllipsis(label: string): string {
  const trimmed = label.trimEnd()
  return /(…|\.\.\.)$/.test(trimmed) ? trimmed : `${trimmed}…`
}
