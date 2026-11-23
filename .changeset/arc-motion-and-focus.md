---
'@gogoui/ui': minor
'@gogoui/tokens': minor
---

Keyboard focus now shows on every control: a softened 2px outline at 2px, and fields darken their edge without a halo (the outline used to stay invisible on buttons, tabs, toggles and links). Menus (DropdownMenu, its sub-menus, ContextMenu, Menubar) grow from their button, their rows following one after another; one highlight glides from row to row under the pointer; panels are rounder, rows airier, separators quieter, and the floating shadow is softer and wider. A button squeezes quickly when pressed and its words crossfade when they change. GoGoUIProvider takes `motion="off"` to still every animation for everyone. New tokens: motion durations and curves (`--motion-*`, `ease-enter`, `ease-standard`, `ease-spring`), `--focus-outline`, `--menu-highlight`, `--line-subtle` and `--radius-menu`. The focus shadows `shadow-focus`, `shadow-focus-primary` and `shadow-focus-danger` are gone.
