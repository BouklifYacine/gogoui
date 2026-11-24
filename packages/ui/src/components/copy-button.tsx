import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { CheckStroke } from '../internal/check-stroke.tsx'
import type { Color } from '../internal/colors.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { MotionScope } from '../internal/motion-scope.tsx'
import { duration, ease, spring } from '../internal/motion.ts'
import { writeClipboard } from '../internal/write-clipboard.ts'
import { cn } from '../lib/cn.ts'
import { Button } from './button.tsx'
import type { ButtonProps } from './button.tsx'

// How long « Copié » (or « Échec ») stays before the button reads as before.
const SHOWN_MS = 3000

type CopyState = 'idle' | 'copied' | 'failed'

// Icons pop on a short spring that never overshoots; the old one leaves
// quickly. Only HTML spans move: Safari scales SVG groups around the wrong
// point.
const iconMotion = {
  initial: { opacity: 0, scale: 0.7 },
  animate: { opacity: 1, scale: 1 },
  exit: {
    opacity: 0,
    scale: 0.7,
    transition: { duration: duration.instant, ease: ease.standard },
  },
  transition: {
    ...spring.snappy,
    opacity: { duration: duration.instant, ease: ease.standard },
  },
}
const wordMotion = {
  initial: { opacity: 0, y: 3 },
  animate: { opacity: 1, y: 0 },
  exit: {
    opacity: 0,
    y: -3,
    transition: { duration: duration.instant, ease: ease.standard },
  },
  transition: { duration: duration.standard, ease: ease.standard, delay: 0.04 },
}
const stillMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0 } },
  transition: { duration: 0 },
}

type CopyButtonProps = {
  /** What lands on the clipboard. */
  text: string
  /** The button's word, « Copier » by default (« Copier le lien »); its name always. */
  label?: string
  /** The word once copied, « Copié » by default. */
  copiedLabel?: string
  /** The word when the browser refused, « Échec » by default. */
  failedLabel?: string
  /**
   * Told whether the copy worked: offer another way when the browser
   * refuses the clipboard.
   */
  onResult?: (copied: boolean) => void
  /**
   * Reads the result aloud from its own live region (true by default). Set
   * false where the page already says it (a toast, a field's own status),
   * so a screen reader does not hear it twice.
   */
  announce?: boolean
  /** Button's shape: `outline` by default, `ghost` bare. */
  variant?: ButtonProps['variant']
  /** Button's sizes; the `icon` ones show the icon alone. */
  size?: ButtonProps['size']
  color?: Color
  disabled?: boolean
  className?: string
}

/**
 * A button that copies a text and says « Copié », after Arc UI
 * (https://uiarc.dev, MIT).
 *
 * **Use it for** a link, a code, a key, an address to paste elsewhere.
 * **Prefer** `CopyLinkField` when the text must be seen too.
 *
 * **Where**: beside the text it copies.
 *
 * **States**: idle; copied (a tick draws itself, again on each copy, 3 s);
 * failed (red alert and « Échec », 3 s). Its words are stacked, so it never
 * changes width and nothing around it moves.
 *
 * **Key props**: `text`, `label` / `copiedLabel` / `failedLabel`,
 * `onResult`, `announce`, `variant`, `size` (an `icon` size for the icon
 * alone), `color`.
 *
 * **Accessibility**: named by `label` whatever it shows; the result is
 * read by its own live region. Where the Clipboard API is refused (an
 * iframe, Safari in a preview) it copies the old way.
 *
 * @summary A button that copies a text and says « Copié ».
 */
function CopyButton({
  text,
  label,
  copiedLabel,
  failedLabel,
  onResult,
  announce = true,
  variant = 'outline',
  size = 'default',
  color,
  disabled,
  className,
}: CopyButtonProps) {
  const messages = useGoGoUIMessages()
  const reduce = useReduceMotion()
  const idleWord = label ?? messages.copy
  const copiedWord = copiedLabel ?? messages.copied
  const failedWord = failedLabel ?? messages.copyFailed
  const [state, setState] = useState<CopyState>('idle')
  // Each copy draws the tick again.
  const [pulse, setPulse] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const iconOnly = size?.startsWith('icon') ?? false
  const shown =
    state === 'copied' ? copiedWord : state === 'failed' ? failedWord : idleWord
  const icons = reduce ? stillMotion : iconMotion
  const words = reduce ? stillMotion : wordMotion

  async function copy() {
    clearTimeout(timer.current)
    let copied = true
    try {
      await writeClipboard(text)
    } catch {
      copied = false
    }
    setState(copied ? 'copied' : 'failed')
    if (copied) setPulse((count) => count + 1)
    timer.current = setTimeout(() => setState('idle'), SHOWN_MS)
    onResult?.(copied)
  }

  return (
    <MotionScope>
      <Button
        variant={variant}
        size={size}
        color={color}
        disabled={disabled}
        data-slot="copy-button"
        data-state={state}
        aria-label={idleWord}
        className={cn('shrink-0', className)}
        onClick={() => void copy()}
      >
        <span
          aria-hidden="true"
          className={cn(
            'grid size-3.5 flex-none place-items-center transition-colors duration-150 ease-standard',
            state === 'copied' && 'text-success-fg',
            state === 'failed' && 'text-danger-fg',
          )}
        >
          <AnimatePresence initial={false}>
            <motion.span
              key={state === 'copied' ? `copied-${pulse}` : state}
              className="col-start-1 row-start-1 grid place-items-center [&_svg]:size-3.5 [&_svg]:text-current!"
              {...icons}
            >
              {state === 'copied' ? (
                <CheckStroke />
              ) : state === 'failed' ? (
                <GoGoIcon name="danger" />
              ) : (
                <GoGoIcon name="copy" />
              )}
            </motion.span>
          </AnimatePresence>
        </span>
        {/* The three words in one cell: the longest holds the width, the
            shown one crossfades on top. */}
        {!iconOnly && (
          <span
            aria-hidden="true"
            className="inline-grid min-w-0 items-center justify-items-center whitespace-nowrap"
          >
            {[idleWord, copiedWord, failedWord].map((word, index) => (
              <span key={index} className="invisible col-start-1 row-start-1">
                {word}
              </span>
            ))}
            <AnimatePresence initial={false}>
              <motion.span
                key={shown}
                className={cn(
                  'col-start-1 row-start-1 block',
                  state === 'failed' && 'text-danger-fg',
                )}
                {...words}
              >
                {shown}
              </motion.span>
            </AnimatePresence>
          </span>
        )}
      </Button>
      <span
        role={announce ? 'status' : undefined}
        aria-live={announce ? 'polite' : undefined}
        hidden={!announce}
        className="sr-only"
      >
        {/* A zero-width space every other copy, so « Copié » is read again. */}
        {state === 'copied'
          ? `${copiedWord}${pulse % 2 ? '' : '\u200B'}`
          : state === 'failed'
            ? messages.copyRefused
            : ''}
      </span>
    </MotionScope>
  )
}

export { CopyButton }
export type { CopyButtonProps }
