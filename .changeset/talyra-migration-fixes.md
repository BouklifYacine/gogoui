---
'@gogoui/ui': patch
---

Fixed: an AlertDialog opened over a sheet or another dialog draws its veil again, so the panel under it no longer answers a tap. A TitledSection's aside goes under its title on a phone instead of squeezing it. PageHeading takes its parent's colour, so a title on a dark header stays legible. FixedActionBar no longer adds the home indicator's space twice when the project's offset already counts it (`--fixed-bar-safe-area: 0px`). New: `arrowClassName` on TooltipContent, and `announce={false}` on CopyButton where the page already says the result.
