// A menu's panel and rows, after Arc UI (https://uiarc.dev, MIT), shared by
// DropdownMenu, ContextMenu and Menubar. 20px panel, rows 14px round at 6px
// in, 10px between the icon and the words, words in full colour and icons a
// step quieter. The highlight is MenuHighlight; the entrance and exit live
// in styles.css (`menu-content`).

export const menuPanel =
  'relative z-50 max-h-(--available-height) overflow-x-hidden overflow-y-auto rounded-parent-menu bg-floating p-1.5 text-fg shadow-menu outline-none'

export const menuRow =
  "relative flex min-h-9 cursor-default items-center gap-2.5 rounded-concentric-1.5 px-2.5 py-2 text-sm text-fg outline-hidden select-none max-md:min-h-11 data-inset:pl-9 data-disabled:pointer-events-none data-disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-fg-muted [&_svg:not([class*='size-'])]:size-4"
