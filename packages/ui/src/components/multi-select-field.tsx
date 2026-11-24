import { AnimatePresence, motion } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import type { FieldValueProps } from '../internal/field-props.ts'
import { useControllableState } from '../internal/use-controllable-state.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { MotionScope } from '../internal/motion-scope.tsx'
import { blur, duration, ease, spring } from '../internal/motion.ts'
import { cn } from '../lib/cn.ts'
import { FieldShell } from './field-shell.tsx'
import {
  Select,
  SelectChips,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from './select.tsx'

/** The words MultiSelectField writes, to change on one MultiSelectField only. */
type MultiSelectFieldLabels = Partial<Pick<GoGoUIMessages, 'clearAll'>>

type MultiSelectFieldProps<TValue extends string> = FieldValueProps<
  TValue[]
> & {
  label: string
  options: readonly { value: TValue; label: string; disabled?: boolean }[]
  /** Shown while nothing is chosen: an example, never the label. */
  placeholder?: string
  /** Chips shown before the rest fold into « +N »; 2 by default. */
  maxVisible?: number
  /** Said to screen readers; the look stays the same. */
  required?: boolean
  disabled?: boolean
  /** The trigger's height: sm, default or lg. */
  size?: 'sm' | 'default' | 'lg'
}

/**
 * A labelled list to pick several choices from, after Arc UI's
 * multi-select (https://uiarc.dev, MIT).
 *
 * **Use it for** a few values from a short known list in a form: the spaces
 * of a date, the stages a filter keeps. **Not for** a long list people
 * search (`Combobox multiple`), a single value (`SelectField`), on / off
 * filters always in view (`ToggleGroup variant="chips"`).
 *
 * **Where**: in a form or a filter panel.
 *
 * **States**: placeholder, chosen (chips, then « +N »), open, disabled,
 * invalid.
 *
 * **Compose**: built on `Select multiple` + `SelectChips`; use those
 * directly for a list of your own.
 *
 * **Key props**: `label`, `options` (`{ value, label }[]`), `value` +
 * `onValueChange` (an array, controlled) or `defaultValue` (uncontrolled),
 * `maxVisible`, `placeholder`, `error`, `description`, `size`,
 * `labels` to change its words.
 *
 * **Motion**: chips open their place on a spring, « +N » rolls, a tick
 * draws itself and retracts, the × pops in. Still with reduced motion.
 *
 * **Accessibility**: label and error wired; the trigger reads every chosen
 * value; the list stays open while you pick; the × empties it and gives
 * the focus back to the trigger.
 *
 * @summary A labelled list to pick several choices from.
 */
function MultiSelectField<TValue extends string>({
  id,
  name,
  label,
  description,
  error,
  value: valueProp,
  defaultValue = [],
  onValueChange,
  onBlur,
  options,
  placeholder,
  maxVisible = 2,
  required,
  disabled,
  size,
  labels,
}: MultiSelectFieldProps<TValue> & {
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: MultiSelectFieldLabels
}) {
  const { choose, clearAll } = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  const clearable = value.length > 0 && !disabled

  return (
    <FieldShell
      id={id}
      name={name}
      label={label}
      description={description}
      error={error}
    >
      {(control) => (
        <div className="relative w-full">
          <Select
            multiple
            items={options}
            name={name}
            value={value}
            onValueChange={(next) => setValue(next as TValue[])}
            required={required}
            disabled={disabled}
          >
            <SelectTrigger
              {...control}
              size={size}
              onBlur={onBlur}
              // Room for the × beside the chevron, so the chevron never moves.
              className={cn(
                'w-full',
                clearable &&
                  '*:data-[slot=select-icon]:ml-7 max-md:*:data-[slot=select-icon]:ml-9',
              )}
            >
              <SelectChips
                placeholder={placeholder ?? choose}
                maxVisible={maxVisible}
              />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <MotionScope>
            <AnimatePresence initial={false}>
              {clearable && (
                <motion.button
                  key="clear"
                  type="button"
                  aria-label={clearAll}
                  onClick={() => {
                    setValue([])
                    document.getElementById(control.id)?.focus()
                  }}
                  initial={
                    reduce
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          scale: 0.7,
                          filter: `blur(${blur.subtle}px)`,
                        }
                  }
                  animate={{
                    opacity: 1,
                    scale: 1,
                    filter: 'blur(0px)',
                    transition: reduce
                      ? { duration: duration.instant }
                      : {
                          ...spring.snappy,
                          opacity: { duration: duration.fast },
                        },
                  }}
                  exit={{
                    opacity: 0,
                    ...(reduce
                      ? {}
                      : { scale: 0.7, filter: `blur(${blur.subtle}px)` }),
                    transition: {
                      duration: duration.instant,
                      ease: ease.standard,
                    },
                  }}
                  whileTap={reduce ? undefined : { scale: 0.96 }}
                  className="absolute inset-y-0 right-8 my-auto flex size-6 items-center justify-center rounded-full text-fg-subtle outline-none hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus max-md:size-8 [&_svg]:size-3.5"
                >
                  <GoGoIcon name="close" aria-hidden="true" />
                </motion.button>
              )}
            </AnimatePresence>
          </MotionScope>
        </div>
      )}
    </FieldShell>
  )
}

export { MultiSelectField }
export type { MultiSelectFieldProps, MultiSelectFieldLabels }
