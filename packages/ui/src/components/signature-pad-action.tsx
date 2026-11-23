import type { ComponentProps } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { duration, spring } from '../internal/motion.ts'
import { useSignaturePad } from '../internal/signature-pad-context.ts'
import { Button } from './button.tsx'

type SignaturePadActionProps = Omit<
  ComponentProps<typeof Button>,
  'children' | 'onClick' | 'aria-label'
> & {
  /** Undo the last stroke, redo it, replay the signature, or clear it. */
  action: 'undo' | 'redo' | 'replay' | 'clear'
}

/**
 * One of a `SignaturePad`'s tools: a round ghost button with its icon and
 * its name (a tooltip and a screen reader's word). Disabled when it has
 * nothing to do. `replay` turns into « Arrêter » while it plays.
 *
 * @summary A signature pad's undo, redo, replay or clear button.
 */
function SignaturePadAction({
  action,
  variant = 'ghost',
  size = 'icon-sm',
  disabled,
  ...props
}: SignaturePadActionProps) {
  const pad = useSignaturePad()
  const messages = useGoGoUIMessages()
  const empty = pad.strokes.length === 0
  const playing = pad.replay !== null

  const label = {
    undo: messages.signatureUndo,
    redo: messages.signatureRedo,
    replay: playing ? messages.signatureStopReplay : messages.signatureReplay,
    clear: messages.signatureClear,
  }[action]
  const idle = {
    undo: !pad.canUndo,
    redo: !pad.canRedo,
    replay: empty,
    clear: empty,
  }[action]
  const run = {
    undo: pad.undo,
    redo: pad.redo,
    replay: pad.toggleReplay,
    clear: pad.clear,
  }[action]

  return (
    <Button
      data-slot="signature-pad-action"
      data-action={action}
      type="button"
      variant={variant}
      size={size}
      aria-label={label}
      title={label}
      aria-pressed={action === 'replay' ? playing : undefined}
      disabled={disabled || pad.disabled || pad.wiping || idle}
      onClick={run}
      {...props}
    >
      {action === 'replay' ? (
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={playing ? 'stop' : 'play'}
            className="grid place-items-center"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={
              pad.reduce ? { duration: duration.instant } : spring.snappy
            }
          >
            <GoGoIcon name={playing ? 'stop' : 'play'} className="size-4" />
          </motion.span>
        </AnimatePresence>
      ) : (
        <GoGoIcon
          name={action === 'clear' ? 'eraser' : action}
          className="size-4"
        />
      )}
    </Button>
  )
}

export { SignaturePadAction }
export type { SignaturePadActionProps }
