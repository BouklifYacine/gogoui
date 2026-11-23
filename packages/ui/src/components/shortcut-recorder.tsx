// Shortcut recorder, after Arc UI (https://uiarc.dev, MIT licence, Elia
// Kuratli), on GoGoUI's Kbd, tokens and words.
import { useCallback, useId, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Variants } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import type { Color } from '../internal/colors.ts'
import { describedBy } from '../internal/field-props.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { MotionScope } from '../internal/motion-scope.tsx'
import { blur, duration, ease, spring, stagger } from '../internal/motion.ts'
import { capPressed, capSize } from '../internal/shortcut-caps.ts'
import {
  formatShortcut,
  heldModifiers,
  normalizeShortcut,
  shortcutFromEvent,
  shortcutTokens,
  splitShortcut,
  usePlatform,
} from '../internal/shortcut-model.ts'
import type { Platform } from '../internal/shortcut-model.ts'
import { cn } from '../lib/cn.ts'
import { Kbd } from './kbd.tsx'

/** A shortcut already bound, and what it does. */
type ShortcutBinding = { shortcut: string; label: string }

type ShortcutRecorderProps = {
  /** The shortcut (« mod+shift+k »), or null for none; controlled. */
  value?: string | null
  /** The first shortcut when not controlled. */
  defaultValue?: string | null
  /** `replaced`: the binding it was taken from after « Utiliser quand même », to unbind it. */
  onValueChange?: (
    value: string | null,
    details: { replaced?: ShortcutBinding },
  ) => void
  /** What the reset arrow brings back; `defaultValue` by default. */
  resetValue?: string | null
  /** Shortcuts already in use: recording one asks before taking it. */
  bindings?: ShortcutBinding[]
  /** Also warn about what the browser keeps (⌘W, ⌘C…). On by default. */
  warnReserved?: boolean
  /** Ask for ⌘, Ctrl or Alt (function keys always pass). On by default. */
  requireModifier?: boolean
  /** Forces the drawing; the visitor's own by default. */
  platform?: Platform
  /** The words while empty; « Enregistrer un raccourci » by default. */
  placeholder?: string
  disabled?: boolean
  size?: 'sm' | 'default' | 'lg'
  /** The listening state's colour. */
  color?: Color
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  onBlur?: () => void
  className?: string
}

type Pending = {
  shortcut: string
  conflict: ShortcutBinding
  reserved: boolean
}

const chip: Variants = {
  enter: { opacity: 0, scale: 0.72, y: 4, filter: `blur(${blur.subtle}px)` },
  rest: (index: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      ...spring.snappy,
      delay: index * stagger.item,
      opacity: { duration: duration.fast, delay: index * stagger.item },
      filter: { duration: duration.fast, delay: index * stagger.item },
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.8,
    filter: `blur(${blur.subtle}px)`,
    transition: { duration: duration.instant },
  },
}
const chipFade: Variants = {
  enter: { opacity: 0 },
  rest: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'none',
    transition: { duration: duration.instant },
  },
  exit: { opacity: 0, transition: { duration: duration.instant } },
}

const shellSize = {
  sm: 'h-8',
  default: 'h-9 max-md:h-11',
  lg: 'h-11',
} as const

/** The shell while it listens: the colour's edge and its pale fill. */
const listening: Record<Color, string> = {
  neutral: 'ring-neutral bg-neutral-subtle hover:ring-neutral',
  primary: 'ring-primary bg-primary-subtle hover:ring-primary',
  info: 'ring-info bg-info-subtle hover:ring-info',
  success: 'ring-success bg-success-subtle hover:ring-success',
  warning: 'ring-warning bg-warning-subtle hover:ring-warning',
  danger: 'ring-danger bg-danger-subtle hover:ring-danger',
}
const listeningDot: Record<Color, string> = {
  neutral: 'bg-neutral',
  primary: 'bg-primary',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

const smallButton =
  'grid size-8 shrink-0 cursor-pointer place-items-center rounded-md text-fg-muted transition-colors duration-150 ease-standard outline-none hover:bg-hover hover:text-fg focus-visible:bg-hover focus-visible:text-fg focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus motion-reduce:transition-none'

const textButton =
  'cursor-pointer rounded-sm font-medium text-fg underline decoration-line-strong underline-offset-3 outline-none transition-colors duration-150 ease-standard hover:decoration-current focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus'

/**
 * A field that records a keyboard shortcut: press it, then the
 * combination. Held modifiers light up as caps while the chord is built,
 * the shortcut settles into place, and one already taken asks before it is
 * used.
 *
 * **Use it for** a setting that binds an action to a shortcut. **Not for**
 * showing a shortcut (`ShortcutKeys`), or typing text.
 *
 * **Where**: in a settings form, in `ShortcutField` for its label, help
 * and error.
 *
 * **States**: empty, set, listening (coloured edge, breathing dot), a hint
 * (a modifier missing), a conflict (« Déjà utilisé par… », to use anyway
 * or cancel), disabled, invalid.
 *
 * **Key props**: `value` + `onValueChange` (or `defaultValue`),
 * `resetValue`, `bindings`, `warnReserved`, `requireModifier`, `platform`,
 * `size`, `color`.
 *
 * **Accessibility**: a button (`aria-pressed` while it listens) named by
 * its label and its shortcut read in full (« Commande Majuscule K »). Tab
 * leaves the listening, Escape cancels, Backspace clears; what happens is
 * announced. Caps follow the platform: ⌘ on a Mac, Ctrl elsewhere.
 *
 * @summary A field that records a keyboard shortcut.
 */
function ShortcutRecorder({
  value,
  defaultValue = null,
  onValueChange,
  resetValue,
  bindings = [],
  warnReserved = true,
  requireModifier = true,
  platform: platformProp,
  placeholder,
  disabled = false,
  size = 'default',
  color = 'primary',
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  onBlur,
  className,
}: ShortcutRecorderProps) {
  const messages = useGoGoUIMessages()
  const reduce = useReduceMotion()
  const platform = usePlatform(platformProp)
  const words = {
    caps: messages.shortcutCaps,
    spoken: messages.shortcutSpoken,
  }
  const uid = useId()
  const buttonId = id ?? `${uid}-button`
  const ownLabelId = `${uid}-label`
  const messageId = `${uid}-message`
  const labelledBy = ariaLabelledBy ?? (ariaLabel ? ownLabelId : undefined)

  const [inner, setInner] = useState<string | null>(defaultValue)
  const current = value !== undefined ? value : inner
  const restoreTo = resetValue !== undefined ? resetValue : defaultValue

  const [recording, setRecording] = useState(false)
  const [live, setLive] = useState<string[]>([])
  const [pending, setPending] = useState<Pending | null>(null)
  const [nudge, setNudge] = useState<string | null>(null)
  const [settled, setSettled] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const [messageHeight, setMessageHeight] = useState<number | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const settleTimer = useRef(0)

  const spoken = (shortcut: string | null) =>
    shortcut
      ? formatShortcut(shortcut, platform, words).spoken
      : messages.shortcutNone

  // The message's slot follows its height, so a longer message grows
  // instead of snapping.
  const measureMessage = useCallback((node: HTMLDivElement | null) => {
    if (!node || typeof ResizeObserver === 'undefined') {
      return undefined
    }
    const observer = new ResizeObserver(() =>
      setMessageHeight(node.getBoundingClientRect().height),
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
      setMessageHeight(null)
    }
  }, [])

  const commit = (next: string | null, replaced?: ShortcutBinding) => {
    setPending(null)
    setNudge(null)
    if (value === undefined) {
      setInner(next)
    }
    onValueChange?.(next, { replaced })
    // The caps stay lit a moment once set.
    setSettled(true)
    window.clearTimeout(settleTimer.current)
    settleTimer.current = window.setTimeout(() => setSettled(false), 700)
    setAnnouncement(
      next ? messages.shortcutSet(spoken(next)) : messages.shortcutCleared,
    )
  }

  const start = () => {
    if (disabled) {
      return
    }
    setPending(null)
    setNudge(null)
    setLive([])
    setRecording(true)
    setAnnouncement(messages.shortcutRecordingStarted)
  }

  const stop = () => {
    setRecording(false)
    setLive([])
  }

  const conflictFor = (shortcut: string): Pending | null => {
    const normal = normalizeShortcut(shortcut, platform)
    if (current && normalizeShortcut(current, platform) === normal) {
      return null
    }
    const taken = bindings.find(
      (binding) => normalizeShortcut(binding.shortcut, platform) === normal,
    )
    if (taken) {
      return { shortcut, conflict: taken, reserved: false }
    }
    if (!warnReserved) {
      return null
    }
    const reserved = Object.entries(messages.shortcutReserved).find(
      ([kept]) => normalizeShortcut(kept, platform) === normal,
    )
    return reserved
      ? {
          shortcut,
          conflict: { shortcut: reserved[0], label: reserved[1] },
          reserved: true,
        }
      : null
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!recording) {
      if ((event.key === 'Backspace' || event.key === 'Delete') && current) {
        event.preventDefault()
        commit(null)
      }
      return
    }
    const bare =
      !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey
    // Tab leaves, and the listening with it.
    if (event.key === 'Tab' && bare) {
      stop()
      return
    }
    // The chord belongs to the recorder, not to the page's own shortcuts
    // (a ⌘K palette).
    event.preventDefault()
    event.stopPropagation()
    if (bare && event.key === 'Escape') {
      stop()
      setAnnouncement(messages.shortcutCanceled)
      return
    }
    if (bare && (event.key === 'Backspace' || event.key === 'Delete')) {
      stop()
      commit(null)
      return
    }
    const shortcut = shortcutFromEvent(event.nativeEvent, platform)
    if (!shortcut) {
      setLive(heldModifiers(event.nativeEvent, platform))
      return
    }
    const { mods, key } = splitShortcut(shortcut)
    const strong =
      mods.has('mod') || mods.has('ctrl') || mods.has('alt') || mods.has('meta')
    if (requireModifier && !strong && !/^f\d+$/.test(key)) {
      const hint = messages.shortcutNeedsModifier(platform === 'mac')
      setNudge(hint)
      setAnnouncement(hint)
      setLive(heldModifiers(event.nativeEvent, platform))
      return
    }
    stop()
    const conflict = conflictFor(shortcut)
    if (conflict) {
      setPending(conflict)
      setAnnouncement(
        messages.shortcutConflict(
          spoken(shortcut),
          conflict.reserved,
          conflict.conflict.label,
        ),
      )
      return
    }
    commit(shortcut)
  }

  const onKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (recording) {
      setLive(heldModifiers(event.nativeEvent, platform))
    }
  }

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!recording) {
      start()
      return
    }
    // A press stops the listening; Enter or Space are recorded instead.
    if (event.detail !== 0) {
      stop()
      setAnnouncement(messages.shortcutCanceled)
    }
  }

  const shown = pending?.shortcut ?? current
  const tokens = recording
    ? shortcutTokens(live.join('+'), platform, words)
    : shown
      ? shortcutTokens(shown, platform, words)
      : []
  const state = recording ? 'recording' : pending ? 'conflict' : 'idle'
  const canReset =
    !recording &&
    (pending !== null || (current ?? null) !== (restoreTo ?? null))
  const canClear = !recording && !!current && !pending
  const message = pending
    ? { key: `c-${pending.shortcut}`, warning: true }
    : nudge
      ? { key: `n-${nudge}`, warning: false }
      : recording
        ? { key: 'recording', warning: false }
        : null

  const pop = {
    initial: { opacity: 0, scale: 0.7 },
    animate: { opacity: 1, scale: 1 },
    exit: {
      opacity: 0,
      scale: 0.7,
      transition: { duration: duration.instant },
    },
    transition: reduce ? { duration: 0 } : spring.snappy,
  }

  return (
    <MotionScope>
      <div
        data-slot="shortcut-recorder"
        data-disabled={disabled || undefined}
        className={cn('grid min-w-0', className)}
      >
        {ariaLabel && !ariaLabelledBy && (
          <span id={ownLabelId} hidden>
            {ariaLabel}
          </span>
        )}
        <div
          data-state={state}
          className={cn(
            'relative flex min-w-0 items-center rounded-lg bg-field shadow-field ring-1 ring-field-line ring-inset transition-[box-shadow,background-color] duration-150 ease-standard focus-within:ring-line-focus hover:ring-fg-subtle motion-reduce:transition-none',
            shellSize[size],
            recording && listening[color],
            pending && 'ring-warning hover:ring-warning',
            ariaInvalid && !recording && !pending && 'ring-danger',
            disabled && 'pointer-events-none bg-subtle opacity-60 shadow-none',
          )}
        >
          <button
            ref={buttonRef}
            id={buttonId}
            type="button"
            disabled={disabled}
            aria-labelledby={
              labelledBy ? `${labelledBy} ${buttonId}` : undefined
            }
            aria-describedby={describedBy(
              ariaDescribedBy,
              message && messageId,
            )}
            aria-pressed={recording}
            className="flex h-full min-w-0 flex-1 cursor-pointer items-center rounded-lg pr-1.5 pl-2.25 text-left outline-none [-webkit-tap-highlight-color:transparent] touch-manipulation disabled:cursor-not-allowed"
            onClick={onClick}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            onBlur={() => {
              if (recording) {
                stop()
                setNudge(null)
              }
              onBlur?.()
            }}
          >
            <span className="sr-only">
              {recording
                ? messages.shortcutRecording
                : shown
                  ? spoken(shown)
                  : (placeholder ?? messages.shortcutPlaceholder)}
            </span>
            <span
              aria-hidden="true"
              className="relative flex min-w-0 items-center gap-1"
            >
              {recording && (
                <span
                  className={cn(
                    'mr-1.5 ml-0.75 size-1.75 shrink-0 animate-pulse rounded-full [animation-duration:1.4s] motion-reduce:animate-none',
                    listeningDot[color],
                  )}
                />
              )}
              <AnimatePresence initial={false} mode="popLayout">
                {tokens.map((token, index) => (
                  <motion.span
                    key={token.id}
                    layout={reduce ? false : 'position'}
                    custom={recording ? 0 : index}
                    variants={reduce ? chipFade : chip}
                    initial="enter"
                    animate="rest"
                    exit="exit"
                    transition={
                      reduce ? { duration: 0 } : { layout: spring.snappy }
                    }
                    className="inline-flex"
                  >
                    <Kbd
                      data-pressed={
                        recording || (settled && !pending) ? '' : undefined
                      }
                      className={cn(
                        capSize.default,
                        capPressed[color],
                        pending &&
                          'border-warning-line bg-warning-subtle text-fg',
                      )}
                    >
                      {token.label}
                    </Kbd>
                  </motion.span>
                ))}
                {tokens.length === 0 && (
                  <motion.span
                    key={recording ? 'prompt' : 'placeholder'}
                    className={cn(
                      'pl-0.75 text-sm whitespace-nowrap',
                      recording ? 'text-fg-muted' : 'text-fg-subtle',
                    )}
                    initial={
                      reduce
                        ? { opacity: 0 }
                        : { opacity: 0, y: 4, filter: `blur(${blur.subtle}px)` }
                    }
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{
                      opacity: 0,
                      transition: { duration: duration.instant },
                    }}
                    transition={
                      reduce
                        ? { duration: duration.instant }
                        : { duration: duration.fast, ease: ease.enter }
                    }
                  >
                    {recording
                      ? messages.shortcutPressKeys
                      : (placeholder ?? messages.shortcutPlaceholder)}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </button>

          <span className="flex shrink-0 items-center gap-0.5 pr-0.5">
            <AnimatePresence initial={false}>
              {canReset && (
                <motion.button
                  key="reset"
                  type="button"
                  className={smallButton}
                  aria-label={messages.shortcutReset(spoken(restoreTo ?? null))}
                  onClick={() => {
                    commit(restoreTo ?? null)
                    buttonRef.current?.focus()
                  }}
                  {...pop}
                >
                  <GoGoIcon
                    name="reset"
                    aria-hidden="true"
                    className="size-4"
                  />
                </motion.button>
              )}
              {canClear && (
                <motion.button
                  key="clear"
                  type="button"
                  className={smallButton}
                  aria-label={messages.shortcutClear}
                  onClick={() => {
                    commit(null)
                    buttonRef.current?.focus()
                  }}
                  {...pop}
                >
                  <GoGoIcon
                    name="close"
                    aria-hidden="true"
                    className="size-4"
                  />
                </motion.button>
              )}
            </AnimatePresence>
          </span>
        </div>

        <AnimatePresence initial={false}>
          {message && (
            <motion.div
              key="slot"
              className="relative overflow-hidden"
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: messageHeight ?? 'auto', opacity: 1 }}
              exit={{
                height: 0,
                opacity: 0,
                transition: reduce
                  ? { duration: 0 }
                  : {
                      height: spring.smooth,
                      opacity: { duration: duration.instant },
                    },
              }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      height: spring.smooth,
                      opacity: { duration: duration.fast },
                    }
              }
            >
              <div ref={measureMessage}>
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.div
                    key={message.key}
                    id={messageId}
                    className={cn(
                      'flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 pt-2 text-xs leading-normal',
                      message.warning ? 'text-fg-muted' : 'text-fg-subtle',
                    )}
                    initial={
                      reduce
                        ? { opacity: 0 }
                        : {
                            opacity: 0,
                            y: '0.35em',
                            filter: `blur(${blur.soft}px)`,
                          }
                    }
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{
                      opacity: 0,
                      transition: { duration: duration.instant },
                    }}
                    transition={{
                      duration: reduce ? duration.instant : duration.standard,
                      ease: ease.enter,
                    }}
                  >
                    <span>
                      {pending ? (
                        <>
                          <span
                            aria-hidden="true"
                            className="mr-1.75 mb-px ml-px inline-block size-1.5 rounded-full bg-warning align-middle"
                          />
                          {pending.reserved
                            ? messages.shortcutReservedFor
                            : messages.shortcutUsedBy}{' '}
                          <strong className="font-medium text-fg">
                            {pending.conflict.label}
                          </strong>
                        </>
                      ) : nudge ? (
                        nudge
                      ) : (
                        messages.shortcutRecordingHint
                      )}
                    </span>
                    {pending && (
                      <span className="inline-flex gap-3">
                        <button
                          type="button"
                          className={textButton}
                          onClick={() => {
                            commit(
                              pending.shortcut,
                              pending.reserved ? undefined : pending.conflict,
                            )
                            buttonRef.current?.focus()
                          }}
                        >
                          {messages.shortcutUseAnyway}
                        </button>
                        <button
                          type="button"
                          className={cn(
                            textButton,
                            'font-normal text-fg-muted no-underline hover:text-fg',
                          )}
                          onClick={() => {
                            setPending(null)
                            setAnnouncement(messages.shortcutKeptPrevious)
                            buttonRef.current?.focus()
                          }}
                        >
                          {messages.cancel}
                        </button>
                      </span>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <span role="status" aria-live="polite" className="sr-only">
          {announcement}
        </span>
      </div>
    </MotionScope>
  )
}

export { ShortcutRecorder }
export {
  formatShortcut,
  matchesShortcut,
  normalizeShortcut,
} from '../internal/shortcut-model.ts'
export type { Platform, ShortcutWords } from '../internal/shortcut-model.ts'
export type { ShortcutBinding, ShortcutRecorderProps }
