/** A file's size as people read it: « 2,4 Mo », « 180 kB ». */
export function fileSize(bytes: number, locale: string): string {
  const megabytes = bytes >= 1e6
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: megabytes ? 'megabyte' : 'kilobyte',
    unitDisplay: 'short',
    maximumFractionDigits: megabytes ? 1 : 0,
  }).format(megabytes ? bytes / 1e6 : Math.max(1, bytes / 1e3))
}

/** A long file name kept on one line: « brief-de-ma…final.xlsx ». */
export function shortName(name: string): string {
  return name.length > 28 ? `${name.slice(0, 14)}…${name.slice(-10)}` : name
}
