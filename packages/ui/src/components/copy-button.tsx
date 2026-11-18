import { useRef, useState } from 'react'
import { MotionConfig, motion } from 'motion/react'
import { CheckIcon, CopyIcon } from '@phosphor-icons/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useElementSize } from '../internal/use-element-size.ts'
import { cn } from '../lib/cn.ts'
import { Button } from './button.tsx'

// How long « Copié » stays before the button says « Copier » again.
const COPIED_MS = 3000

// The word rolls with a small bounce; the icons pop a little faster; the
// button's width springs to the new word.
const roll = { type: 'spring', stiffness: 260, damping: 20 } as const
const pop = { type: 'spring', stiffness: 420, damping: 18 } as const
const grow = { type: 'spring', stiffness: 300, damping: 24 } as const

type CopyButtonProps = {
  /** What lands on the clipboard. */
  text: string
  /** The button's word, « Copier » by default (« Copier le lien »). */
  label?: string
  /** The word once copied, « Copié » by default. */
  copiedLabel?: string
  /**
   * Told whether the copy worked: announce it, or offer another way when
   * the browser refuses the clipboard.
   */
  onResult?: (copied: boolean) => void
  className?: string
}

/**
 * A button that copies a text: the copy icon turns away while a green
 * check pops in, the word rolls up to « Copié » and the button grows to
 * fit it, then rolls back. It says nothing to a screen reader itself:
 * `onResult` lets the screen announce the copy. Motion follows the
 * visitor's reduced-motion setting.
 *
 * @summary A button that copies a text and says « Copié ».
 */
function CopyButton({
  text,
  label,
  copiedLabel,
  onResult,
  className,
}: CopyButtonProps) {
  const messages = useGoGoUIMessages()
  const idleWord = label ?? messages.copy
  const copiedWord = copiedLabel ?? messages.copied
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  // Each word's width as laid out: the window springs between them.
  const [idleSize, measureIdle] = useElementSize<HTMLSpanElement>()
  const [copiedSize, measureCopied] = useElementSize<HTMLSpanElement>()
  const shownSize = copied ? copiedSize : idleSize

  async function copy() {
    clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      timer.current = setTimeout(() => setCopied(false), COPIED_MS)
      onResult?.(true)
    } catch {
      setCopied(false)
      onResult?.(false)
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <Button
        variant="outline"
        data-slot="copy-button"
        className={cn('shrink-0 overflow-hidden', className)}
        onClick={() => void copy()}
      >
        <span aria-hidden="true" className="relative size-3.5">
          <motion.span
            className="absolute inset-0"
            initial={false}
            animate={
              copied
                ? { opacity: 0, scale: 0.5, rotate: -40 }
                : { opacity: 1, scale: 1, rotate: 0 }
            }
            transition={pop}
          >
            <CopyIcon className="size-3.5" />
          </motion.span>
          <motion.span
            className="absolute inset-0 text-success-fg"
            initial={false}
            animate={
              copied ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }
            }
            transition={pop}
          >
            <CheckIcon weight="bold" className="size-3.5 text-success-fg!" />
          </motion.span>
        </span>
        {/* Both words stacked in a one-line window that takes the shown
            word's width. Screen readers read the shown one only. */}
        <motion.span
          className="relative block h-5 overflow-hidden"
          initial={false}
          animate={shownSize ? { width: shownSize.width } : undefined}
          transition={grow}
        >
          <motion.span
            className="flex flex-col"
            initial={false}
            animate={{ y: copied ? '-50%' : '0%' }}
            transition={roll}
          >
            <span
              ref={measureIdle}
              aria-hidden={copied}
              className="block w-max leading-5"
            >
              {idleWord}
            </span>
            <span
              ref={measureCopied}
              aria-hidden={!copied}
              className="block w-max leading-5 text-success-fg"
            >
              {copiedWord}
            </span>
          </motion.span>
        </motion.span>
      </Button>
    </MotionConfig>
  )
}

export { CopyButton }
export type { CopyButtonProps }
