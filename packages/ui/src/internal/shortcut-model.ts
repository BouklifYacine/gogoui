// The shortcut model, after Arc UI (https://uiarc.dev, MIT licence, Elia
// Kuratli). A shortcut is a string such as « mod+shift+k »: `mod` is ⌘ on
// an Apple device and Ctrl elsewhere, so one binding reads right
// everywhere. Keys come from the physical key where it matters, so ⌥K
// records as « alt+k », not « ˚ ».
import { useSyncExternalStore } from 'react'

/** Where the keys are drawn: ⌘ ⌥ ⇧ on a Mac, Ctrl Alt Shift elsewhere. */
export type Platform = 'mac' | 'other'

/** One key cap: what it shows, its key id, its name read aloud. */
export type ShortcutToken = { label: string; id: string; spoken: string }

/** The words a cap or a name takes, from the messages. */
export type ShortcutWords = {
  caps: Readonly<Record<string, string>>
  spoken: Readonly<Record<string, string>>
}

/** Without the messages' words, caps and names fall back to English. */
const NO_WORDS: ShortcutWords = { caps: {}, spoken: {} }

type KeyEvent = Pick<
  KeyboardEvent,
  'key' | 'code' | 'metaKey' | 'ctrlKey' | 'altKey' | 'shiftKey'
>

const MODIFIER_ORDER = ['mod', 'ctrl', 'alt', 'shift', 'meta'] as const
type Modifier = (typeof MODIFIER_ORDER)[number]
const isModifier = (part: string): part is Modifier =>
  (MODIFIER_ORDER as readonly string[]).includes(part)

const CODE_KEYS: Record<string, string> = {
  Comma: ',',
  Period: '.',
  Slash: '/',
  Semicolon: ';',
  Quote: "'",
  BracketLeft: '[',
  BracketRight: ']',
  Backslash: '\\',
  Minus: '-',
  Equal: '=',
  Backquote: '`',
  Space: 'space',
  Enter: 'enter',
  NumpadEnter: 'enter',
  Escape: 'escape',
  Backspace: 'backspace',
  Delete: 'delete',
  Tab: 'tab',
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  Home: 'home',
  End: 'end',
  PageUp: 'pageup',
  PageDown: 'pagedown',
}
const MODIFIER_KEYS: Record<string, string> = {
  Meta: 'meta',
  OS: 'meta',
  Control: 'ctrl',
  Alt: 'alt',
  AltGraph: 'alt',
  Shift: 'shift',
}
/** Keys drawn the same everywhere. */
const SYMBOLS: Record<string, string> = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
}
/** Keys a Mac draws as symbols. */
const MAC_SYMBOLS: Record<string, string> = {
  enter: '↩',
  backspace: '⌫',
  delete: '⌦',
  tab: '⇥',
  escape: 'esc',
}

/** The physical key of an event (« k », « 1 », « enter », « shift »), or null for one that never makes a shortcut (Caps Lock). */
export function keyId(event: Pick<KeyboardEvent, 'key' | 'code'>) {
  const { code, key } = event
  if (MODIFIER_KEYS[key]) {
    return MODIFIER_KEYS[key]
  }
  if (/^Key[A-Z]$/.test(code)) {
    return code.slice(3).toLowerCase()
  }
  if (/^Digit\d$/.test(code)) {
    return code.slice(5)
  }
  if (/^Numpad\d$/.test(code)) {
    return code.slice(6)
  }
  if (CODE_KEYS[code]) {
    return CODE_KEYS[code]
  }
  if (/^F\d{1,2}$/.test(key)) {
    return key.toLowerCase()
  }
  if (['CapsLock', 'Fn', 'Dead', 'Unidentified', 'Process'].includes(key)) {
    return null
  }
  return key.length === 1 ? key.toLowerCase() : null
}

/** A shortcut's modifiers and its key. */
export function splitShortcut(shortcut: string) {
  const parts = shortcut
    .toLowerCase()
    .split('+')
    .map((part) => part.trim())
    .filter(Boolean)
  const key = parts.filter((part) => !isModifier(part)).pop() ?? ''
  return { mods: new Set(parts.filter(isModifier)), key }
}

/**
 * One spelling per combination: on a Mac, Command is `mod`; elsewhere,
 * Ctrl is. Modifiers come in a fixed order.
 */
export function normalizeShortcut(shortcut: string, platform: Platform) {
  const { mods, key } = splitShortcut(shortcut)
  if (platform === 'mac' && mods.delete('meta')) {
    mods.add('mod')
  }
  if (platform === 'other' && mods.delete('ctrl')) {
    mods.add('mod')
  }
  return [...MODIFIER_ORDER.filter((mod) => mods.has(mod)), key]
    .filter(Boolean)
    .join('+')
}

/** The modifiers held during an event, in the model's words. */
export function heldModifiers(event: KeyEvent, platform: Platform) {
  const mods: string[] = []
  if (platform === 'mac' ? event.metaKey : event.ctrlKey) {
    mods.push('mod')
  }
  if (platform === 'mac' && event.ctrlKey) {
    mods.push('ctrl')
  }
  if (event.altKey) {
    mods.push('alt')
  }
  if (event.shiftKey) {
    mods.push('shift')
  }
  if (platform === 'other' && event.metaKey) {
    mods.push('meta')
  }
  return mods
}

/** A keydown as a shortcut, or null while only modifiers are down. */
export function shortcutFromEvent(event: KeyEvent, platform: Platform) {
  const key = keyId(event)
  if (!key || ['meta', 'ctrl', 'alt', 'shift'].includes(key)) {
    return null
  }
  return normalizeShortcut(
    [...heldModifiers(event, platform), key].join('+'),
    platform,
  )
}

/** True when a keydown is this shortcut: run what it is bound to. */
export function matchesShortcut(
  event: KeyEvent,
  shortcut: string,
  platform: Platform,
) {
  const pressed = shortcutFromEvent(event, platform)
  return !!pressed && pressed === normalizeShortcut(shortcut, platform)
}

/** The caps of a shortcut in the platform's order: ⌃ ⌥ ⇧ ⌘ on a Mac, Ctrl Alt Shift Win elsewhere. */
export function shortcutTokens(
  shortcut: string,
  platform: Platform,
  words: ShortcutWords = NO_WORDS,
): ShortcutToken[] {
  const { caps, spoken } = words
  const { mods, key } = splitShortcut(normalizeShortcut(shortcut, platform))
  const tokens: ShortcutToken[] = []
  const name = (id: string, fallback: string) => spoken[id] ?? fallback
  if (platform === 'mac') {
    if (mods.has('ctrl')) {
      tokens.push({ label: '⌃', id: 'ctrl', spoken: name('ctrl', 'Control') })
    }
    if (mods.has('alt')) {
      tokens.push({ label: '⌥', id: 'alt', spoken: name('option', 'Option') })
    }
    if (mods.has('shift')) {
      tokens.push({ label: '⇧', id: 'shift', spoken: name('shift', 'Shift') })
    }
    if (mods.has('mod') || mods.has('meta')) {
      tokens.push({
        label: '⌘',
        id: 'meta',
        spoken: name('command', 'Command'),
      })
    }
  } else {
    if (mods.has('mod') || mods.has('ctrl')) {
      tokens.push({
        label: caps.ctrl ?? 'Ctrl',
        id: 'ctrl',
        spoken: name('ctrl', 'Control'),
      })
    }
    if (mods.has('alt')) {
      tokens.push({
        label: caps.alt ?? 'Alt',
        id: 'alt',
        spoken: name('alt', 'Alt'),
      })
    }
    if (mods.has('shift')) {
      tokens.push({
        label: caps.shift ?? 'Shift',
        id: 'shift',
        spoken: name('shift', 'Shift'),
      })
    }
    if (mods.has('meta')) {
      tokens.push({
        label: caps.win ?? 'Win',
        id: 'meta',
        spoken: name('win', 'Windows'),
      })
    }
  }
  if (key) {
    const label =
      (platform === 'mac' ? MAC_SYMBOLS[key] : undefined) ??
      SYMBOLS[key] ??
      caps[key] ??
      key.toUpperCase()
    tokens.push({ label, id: key, spoken: name(key, caps[key] ?? label) })
  }
  return tokens
}

/** « ⌘⇧K » on a Mac, « Ctrl+Maj+K » elsewhere, and its name read aloud. */
export function formatShortcut(
  shortcut: string,
  platform: Platform,
  words: ShortcutWords = NO_WORDS,
) {
  const tokens = shortcutTokens(shortcut, platform, words)
  return {
    text: tokens
      .map((token) => token.label)
      .join(platform === 'mac' ? '' : '+'),
    spoken: tokens.map((token) => token.spoken).join(' '),
  }
}

const subscribeNothing = () => () => undefined

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') {
    return 'other'
  }
  const hint =
    (navigator as Navigator & { userAgentData?: { platform?: string } })
      .userAgentData?.platform ??
    navigator.platform ??
    navigator.userAgent
  return /mac|iphone|ipad|ipod/i.test(hint) ? 'mac' : 'other'
}

/** The visitor's platform; a server render draws Ctrl and settles once in the browser. */
export function usePlatform(override?: Platform): Platform {
  const detected = useSyncExternalStore(
    subscribeNothing,
    detectPlatform,
    () => 'other' as Platform,
  )
  return override ?? detected
}
