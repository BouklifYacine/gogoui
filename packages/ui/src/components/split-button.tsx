import { isValidElement } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, m } from 'motion/react'
import type { TargetAndTransition, Transition } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import type { Color } from '../internal/colors.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { MorphText } from '../internal/morph-text.tsx'
import { blur, duration, ease, spring } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { useMorphWidth } from '../internal/use-morph-width.ts'
import { cn } from '../lib/cn.ts'
import { Button } from './button.tsx'
import { ButtonGroup } from './button-group.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu.tsx'

/** Names an icon by its component, so Copy → Check morphs while a re-render of the same icon stays still. */
function iconKey(node: ReactNode): string {
  if (!isValidElement(node)) {
    return node == null || typeof node === 'boolean' ? '' : String(node)
  }
  const type = node.type as string | { displayName?: string; name?: string }
  return typeof type === 'string'
    ? type
    : (type?.displayName ?? type?.name ?? 'icon')
}

const rest: TargetAndTransition = { opacity: 1, scale: 1, filter: 'blur(0px)' }
const iconIn: TargetAndTransition = {
  opacity: 0,
  scale: 0.6,
  filter: `blur(${blur.subtle}px)`,
}
const iconOut: TargetAndTransition = {
  ...iconIn,
  transition: { duration: duration.fast, ease: ease.standard },
}
// The scale rides the spring; opacity and blur tween, so the blur never
// dips below zero.
const iconEnter: Transition = {
  ...spring.snappy,
  opacity: { duration: duration.fast, ease: ease.enter },
  filter: { duration: duration.fast, ease: ease.enter },
}
const fadeIn: TargetAndTransition = { ...rest, opacity: 0 }
const fadeOut: TargetAndTransition = {
  opacity: 0,
  transition: { duration: duration.instant },
}

const chevronSize = {
  sm: 'icon-sm',
  default: 'icon',
  lg: 'icon-lg',
} as const

type SplitButtonProps = {
  /** On the main action's button: to find it, or send the focus back to it. */
  id?: string
  /** The main action's words (« Envoyer »); a change morphs letter by letter. */
  children: ReactNode
  /** Runs the main action. */
  onClick?: () => void
  /** An icon before the words; another icon morphs in its place. */
  iconStart?: ReactNode
  /** The other actions: `DropdownMenuItem`s (and separators, labels…). */
  menu: ReactNode
  /** The chevron's name, « Plus d’actions » by default. */
  menuLabel?: string
  /** `default`: filled (the main action of a view). `outline`: the white button. */
  variant?: 'default' | 'outline'
  /** The colour of the whole pill, as on Button. */
  color?: Color
  size?: 'sm' | 'default' | 'lg'
  /** Blocks both halves. */
  disabled?: boolean
  /** Spinner on the main action, which keeps its focus. */
  loading?: boolean
  className?: string
}

/**
 * A main action and a menu of its variants in one pill, after Arc UI
 * (https://uiarc.dev, MIT): « Envoyer | ▾ » (Programmer, Envoyer un test).
 *
 * **Use it for** one action that most people take as it is, and a few
 * close variants of it. **Not for** unrelated actions (a `ButtonGroup`, or
 * a « … » `DropdownMenu`), nor a choice that changes what the button does
 * (a `Select`).
 *
 * **Where**: where the action's plain Button would be: a dialog's footer,
 * a page header.
 *
 * **States**: default, hover (each half), pressed (the whole pill
 * squeezes; the chevron alone does not), menu open (chevron turned over),
 * loading, disabled. A new label morphs letter by letter while the width
 * follows.
 *
 * **Compose**: built from `ButtonGroup`, two `Button`s and a
 * `DropdownMenu`; `menu` takes `DropdownMenuItem`s
 * (`variant="destructive"` for a red one).
 *
 * **Key props**: `children` (the words), `onClick`, `id`, `iconStart`, `menu`,
 * `variant` (default, outline), `color`, `size` (sm, default, lg),
 * `loading`, `disabled`.
 *
 * **Accessibility**: two buttons, two Tab stops; the chevron is named
 * « Plus d’actions » (`menuLabel`), the menu works with the arrows and
 * Escape. A new label is read by a live region.
 *
 * @summary A main action and a menu of its variants in one pill.
 */
function SplitButton({
  id,
  children,
  onClick,
  iconStart,
  menu,
  menuLabel,
  variant = 'default',
  color,
  size = 'default',
  disabled,
  loading,
  className,
}: SplitButtonProps) {
  const messages = useGoGoUIMessages()
  const reduce = useReduceMotion()
  const words = typeof children === 'string' ? children : null
  const glyph = iconKey(iconStart)
  const [width, measure] = useMorphWidth(reduce)

  return (
    <MotionScope>
      <DropdownMenu>
        <ButtonGroup
          data-slot="split-button"
          className={cn(
            // The whole pill squeezes for the main action; the chevron
            // stays still, its menu placed against it.
            'transition-[scale] duration-(--motion-spring) ease-spring has-[>[data-split-action]:active:not(:disabled)]:scale-[0.97] has-[>[data-split-action]:active:not(:disabled)]:duration-100 has-[>[data-split-action]:active:not(:disabled)]:ease-standard motion-reduce:scale-100! motion-reduce:transition-none',
            className,
          )}
        >
          <Button
            id={id}
            data-split-action=""
            variant={variant}
            color={color}
            size={size}
            disabled={disabled}
            loading={loading}
            onClick={onClick}
            className="active:scale-100!"
          >
            {words === null ? (
              <>
                {iconStart && (
                  <span
                    data-icon="inline-start"
                    aria-hidden="true"
                    className="contents"
                  >
                    {iconStart}
                  </span>
                )}
                {children}
              </>
            ) : (
              <>
                {/* The words morph inside a window whose width springs to them. */}
                <m.span
                  aria-hidden="true"
                  style={{ width }}
                  className="inline-flex min-w-0 items-center data-morphing:[clip-path:inset(-50%_-0.5rem)]"
                >
                  <span
                    ref={measure}
                    data-morph-key={`${glyph}|${words}`}
                    className="inline-flex flex-none items-center gap-2"
                  >
                    {iconStart && !loading && (
                      <span data-icon="inline-start" className="inline-grid">
                        <AnimatePresence initial={false}>
                          <m.span
                            key={glyph}
                            className="col-start-1 row-start-1 inline-flex items-center justify-center"
                            initial={reduce ? fadeIn : iconIn}
                            animate={rest}
                            exit={reduce ? fadeOut : iconOut}
                            transition={
                              reduce
                                ? { duration: duration.instant }
                                : iconEnter
                            }
                          >
                            {iconStart}
                          </m.span>
                        </AnimatePresence>
                      </span>
                    )}
                    <MorphText text={words} />
                  </span>
                </m.span>
                <span className="sr-only" aria-live="polite">
                  {words}
                </span>
              </>
            )}
          </Button>
          <DropdownMenuTrigger
            disabled={disabled}
            render={
              <Button
                variant={variant}
                color={color}
                size={chevronSize[size]}
                aria-label={menuLabel ?? messages.moreActions}
                // A hairline between the halves, in the words' colour.
                className="relative before:pointer-events-none before:absolute before:inset-y-2 before:left-0 before:w-px before:bg-current/20 before:content-['']"
              />
            }
          >
            <GoGoIcon
              name="chevronDown"
              aria-hidden="true"
              className="size-4 transition-[rotate] duration-(--motion-spring) ease-spring group-data-popup-open/button:rotate-180 motion-reduce:transition-none"
            />
          </DropdownMenuTrigger>
        </ButtonGroup>
        <DropdownMenuContent align="end" className="w-auto min-w-48">
          {menu}
        </DropdownMenuContent>
      </DropdownMenu>
    </MotionScope>
  )
}

export { SplitButton }
export type { SplitButtonProps }
