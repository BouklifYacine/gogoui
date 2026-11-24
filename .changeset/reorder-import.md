---
'@gogoui/ui': patch
---

Fixed: 0.3.0 broke any app importing the bound fields (`@gogoui/ui/tanstack-form`) or ColorPicker, with « motion/react-m does not provide an export named Reorder ». ColorPicker takes `Reorder` from motion/react again, and the package check now imports every built file in Node, so such an import cannot ship again.
