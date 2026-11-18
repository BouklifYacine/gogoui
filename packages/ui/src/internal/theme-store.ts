/** The theme chosen: light, dark, or the device's own. */
export type Theme = 'light' | 'dark' | 'system'

const KEY = 'gogoui-theme'
const DARK = '(prefers-color-scheme: dark)'
const listeners = new Set<() => void>()

function stored(): Theme {
  try {
    const value = localStorage.getItem(KEY)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
}

/** Puts `.dark` on <html> for the theme, the device's when « system ». */
function apply(theme: Theme) {
  const dark =
    theme === 'dark' || (theme === 'system' && matchMedia(DARK).matches)
  document.documentElement.classList.toggle('dark', dark)
}

export function readTheme(): Theme {
  return typeof window === 'undefined' ? 'system' : stored()
}

/** Keeps the theme on this device and applies it at once. */
export function writeTheme(theme: Theme) {
  try {
    if (theme === 'system') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, theme)
  } catch {
    // Not kept: it still holds until the page is left.
  }
  apply(theme)
  for (const listener of listeners) listener()
}

/** Follows another tab's choice and the device's own switching. */
export function subscribeTheme(onChange: () => void) {
  listeners.add(onChange)
  const media = matchMedia(DARK)
  const follow = () => {
    apply(stored())
    onChange()
  }
  media.addEventListener('change', follow)
  window.addEventListener('storage', follow)
  return () => {
    listeners.delete(onChange)
    media.removeEventListener('change', follow)
    window.removeEventListener('storage', follow)
  }
}

/**
 * Put it in a `<script>` at the top of `<head>`: the page opens in its
 * theme, without a white flash before React.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem('${KEY}');var d=t==='dark'||(t!=='light'&&matchMedia('${DARK}').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()`
