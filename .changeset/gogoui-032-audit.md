---
'@gogoui/ui': patch
---

Menus (DropdownMenu, ContextMenu, Menubar, Select, Combobox, MentionInput): the row reached with the arrow keys wears a focus ring you can see; under the pointer the highlight stays light.
UserMenu: the theme choices show the focus outline from the keyboard, and are 44 px on a phone.
PasswordField: a new password is read with its list of conditions, after its help and its error.
ActionSwap: a screen reader hears « Envoi… » and « Envoyé » once each, the return to rest is silent, and the button keeps its name meanwhile; disabled while focused, it keeps the focus.
Carousel: with reduced motion the arrows jump to the slide; each slide is a « diapositive » named « 2 sur 5 »; at either end the disabled arrow keeps the focus.
PhoneField: the country list opens with the focus in its search (a phone's keyboard up), the arrows, Enter and a tap pick a country, Escape gives the focus back to the button, and a press outside closes it; its close and clear buttons are 44 px on a phone.
SlideToConfirm: a single tap or click on the thumb confirms too, so sliding is never the only way; a `confirmingLabel` ending with « … » no longer gets a second set of dots.
HoldToConfirm: new `srLabel` (or `aria-label`) to name each of several « Retirer » buttons; a `confirmingLabel` ending with « … » keeps its own dots; VoiceOver's double tap confirms instead of filling and emptying.
