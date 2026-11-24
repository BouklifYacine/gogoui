// Shortcut keys, after Arc UI (https://uiarc.dev, MIT licence, Elia
// Kuratli), drawn with GoGoUI's Kbd.
import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import type { Color } from '../internal/colors.ts'
import { capPressed, capSize } from '../internal/shortcut-caps.ts'
import { shortcutTokens, usePlatform } from '../internal/shortcut-model.ts'
import type { Platform } from '../internal/shortcut-model.ts'
import { cn } from '../lib/cn.ts'
import { Kbd } from './kbd.tsx'

/** The words ShortcutKeys writes, to change on one ShortcutKeys only. */
type ShortcutKeysLabels = Partial<
  Pick<GoGoUIMessages, 'shortcutCaps' | 'shortcutSpoken'>
>

type ShortcutKeysProps = {
  /** « mod+shift+k »: `mod` is ⌘ on a Mac, Ctrl elsewhere. */
  shortcut: string
  /** Forces the drawing; the visitor's own by default. */
  platform?: Platform
  /** Key ids held right now (« meta », « shift », « k »): their caps light up. */
  pressed?: ReadonlySet<string>
  size?: 'sm' | 'default'
  /** The colour of a held cap. */
  color?: Color
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: ShortcutKeysLabels
}

/**
 * A keyboard shortcut drawn as key caps, the platform's way: ⌘⇧K on a
 * Mac, Ctrl Maj K elsewhere.
 *
 * **Use it for** a shortcut in help, a settings list or a menu's footer.
 * **Not for** one key in a sentence (`Kbd`), or changing a shortcut
 * (`ShortcutRecorder`).
 *
 * **States**: at rest; caps held (`pressed`) sink and light up.
 *
 * **Key props**: `shortcut`, `platform`, `pressed`, `size` (sm, default),
 * `color`, `labels` to change its words.
 *
 * **Accessibility**: read once, in full (« Commande Majuscule K »), not
 * cap by cap.
 *
 * @summary A keyboard shortcut drawn as key caps.
 */
function ShortcutKeys({
  shortcut,
  platform: platformProp,
  pressed,
  size = 'default',
  color = 'primary',
  className,
  labels,
}: ShortcutKeysProps) {
  const messages = useGoGoUIMessages(labels)
  const platform = usePlatform(platformProp)
  const tokens = shortcutTokens(shortcut, platform, {
    caps: messages.shortcutCaps,
    spoken: messages.shortcutSpoken,
  })

  return (
    <span
      data-slot="shortcut-keys"
      role="img"
      aria-label={tokens.map((token) => token.spoken).join(' ')}
      className={cn('inline-flex shrink-0 items-center gap-1', className)}
    >
      {tokens.map((token, index) => (
        <Kbd
          key={`${index}-${token.id}`}
          aria-hidden="true"
          data-pressed={pressed?.has(token.id) ? '' : undefined}
          className={cn(capSize[size], capPressed[color])}
        >
          {token.label}
        </Kbd>
      ))}
    </span>
  )
}

export { ShortcutKeys }
export type { ShortcutKeysProps, ShortcutKeysLabels }
