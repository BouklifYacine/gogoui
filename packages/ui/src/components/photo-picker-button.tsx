import { useRef } from 'react'
import type { ReactNode } from 'react'
import { ImageIcon } from '@phosphor-icons/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { Button } from './button.tsx'

type PhotoPickerButtonProps = {
  children: ReactNode
  /** True while the photo is sent. */
  loading: boolean
  /** On the button while sending, « Envoi de l'image… » by default. */
  loadingText?: string
  disabled?: boolean
  /** A tile of a photo grid rather than a button in a row. */
  className?: string
  onPick: (file: File) => void
}

/**
 * A button that opens the computer's files or the phone's photos. The
 * file input is hidden: it cannot be styled, and a real button is easier
 * to reach and to read. JPEG, PNG or WebP.
 *
 * @summary A button that picks a photo.
 */
function PhotoPickerButton({
  children,
  loading,
  loadingText,
  disabled,
  className,
  onPick,
}: PhotoPickerButtonProps) {
  const { sendingImage } = useGoGoUIMessages()
  const input = useRef<HTMLInputElement>(null)
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const file = event.target.files?.[0]
          // Emptied, so picking the same file again still sends it.
          event.target.value = ''
          if (file) {
            onPick(file)
          }
        }}
      />
      <Button
        variant="outline"
        loading={loading}
        loadingText={loadingText ?? sendingImage}
        disabled={disabled}
        className={className}
        onClick={() => input.current?.click()}
      >
        <ImageIcon aria-hidden="true" />
        {children}
      </Button>
    </>
  )
}

export { PhotoPickerButton }
export type { PhotoPickerButtonProps }
