// GoGoUI's phone sheet, shared by DropdownMenu, Select and Popover: under
// 48rem (breakpoint.ts) a popup leaves its trigger and rises from the
// screen's bottom edge, full width over a veil, within the thumb's reach.
// All of it in CSS (`max-md:`, `md:`), so the server's first paint is
// already right. Its movement lives in styles.css (`[data-phone-sheet]`).

/** The veil under a sheet; nothing from 48rem up. A drag on it never scrolls the page. */
export const phoneSheetBackdrop =
  'fixed inset-0 z-50 touch-none bg-overlay transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 md:hidden'

/** On the positioner: its inline place gives way to the bottom edge. */
export const phoneSheetPositioner =
  'max-md:fixed! max-md:inset-x-0! max-md:top-auto! max-md:bottom-0! max-md:left-0! max-md:w-auto! max-md:transform-none!'

/** On the popup: full width, rounded on top only, its height kept in reach. */
export const phoneSheetPanel =
  'max-md:max-h-[85dvh] max-md:w-full max-md:max-w-none max-md:rounded-t-2xl max-md:rounded-b-none max-md:overscroll-contain'

/** On the popup, before the caller's className: room above the home bar. */
export const phoneSheetSafeArea =
  'max-md:pb-[calc(0.75rem+env(safe-area-inset-bottom))]'
