import { useState } from 'react'
import type { ComponentProps, MouseEvent } from 'react'
import { animate } from 'motion/react'
import { LockSimpleIcon } from '@phosphor-icons/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { duration, ease } from '../internal/motion.ts'
import { PasswordEye } from '../internal/password-eye.tsx'
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
 * **States**: hidden, shown. After Arc UI (https://uiarc.dev, MIT): a
 * slash draws itself across the eye and cuts its outline, and the text
 * resolves from a light blur as dots and letters swap.
 *
 * **Key props**: `id` (required), `size`, `autoComplete`, plus Input's.
 *
 * **Accessibility**: the button is named « Afficher le mot de passe » and
 * pressed while shown (its name stays the same). With reduced motion the
 * eye and the text change at once.
 *
 * @summary A password field with a button to show what was typed.
 */
function PasswordInput({ className, id, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const { showPassword } = useGoGoUIMessages()
  const reduce = useReduceMotion()

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    setVisible((shown) => !shown)
    const input = event.currentTarget.parentElement?.querySelector('input')
    if (input && !reduce) {
      // Dots and letters resolve into each other instead of snapping.
      animate(
        input,
        { opacity: [0.35, 1], filter: ['blur(2px)', 'blur(0px)'] },
        { duration: duration.standard, ease: ease.enter },
      )
    }
  }

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
        disabled={props.disabled}
        onClick={toggle}
        className="absolute top-1/2 right-1 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-fg-subtle outline-none transition-[color,background-color,scale] duration-150 ease-standard hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-2 focus-visible:outline-focus active:scale-[0.96] active:duration-100 disabled:pointer-events-none aria-pressed:text-fg motion-reduce:transition-none motion-reduce:active:scale-100 max-md:right-0 max-md:size-11"
      >
        <PasswordEye slashed={visible} />
      </button>
    </div>
  )
}

export { PasswordInput }
export type { PasswordInputProps }
