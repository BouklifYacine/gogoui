import { useState } from 'react'
import type { ComponentProps } from 'react'
import { EyeIcon, EyeSlashIcon, LockSimpleIcon } from '@phosphor-icons/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { cn } from '../lib/cn.ts'
import { Input } from './input.tsx'

type PasswordInputProps = Omit<ComponentProps<typeof Input>, 'type'> & {
  /** Required: the eye button points at the field it reveals. */
  id: string
}

/**
 * A password field with a button to show what was typed.
 *
 * **Prefer** `PasswordField` in a form (label, strength and error).
 *
 * **Accessibility**: the button is named « Afficher le mot de passe » and
 * pressed while shown.
 *
 * @summary A password field with a button to show what was typed.
 */
function PasswordInput({ className, id, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const { showPassword } = useGoGoUIMessages()

  return (
    <div data-slot="password-input" className="relative">
      <LockSimpleIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-fg-subtle"
      />
      <Input
        id={id}
        type={visible ? 'text' : 'password'}
        className={cn('pr-11 pl-10', className)}
        {...props}
      />
      <button
        type="button"
        aria-label={showPassword}
        aria-pressed={visible}
        aria-controls={id}
        onClick={() => setVisible((shown) => !shown)}
        className="absolute top-0 right-0 flex size-9 items-center justify-center rounded-lg text-fg-subtle outline-none hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-line-focus max-md:size-11"
      >
        {visible ? (
          <EyeSlashIcon aria-hidden="true" className="size-4.5" />
        ) : (
          <EyeIcon aria-hidden="true" className="size-4.5" />
        )}
      </button>
    </div>
  )
}

export { PasswordInput }
export type { PasswordInputProps }
