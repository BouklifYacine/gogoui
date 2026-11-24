import { useId, useState } from 'react'
import { CalendarDotsIcon } from '@phosphor-icons/react'
import { m } from 'motion/react'
import type { DateRange, Matcher } from 'react-day-picker'
import { fr } from 'react-day-picker/locale'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import type { Color } from '../internal/colors.ts'
import { DatePopup } from '../internal/date-popup.tsx'
import { formatTypedDay, parseDay, toDay } from '../internal/days.ts'
import { spring } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { RollingWords } from '../internal/rolling-words.tsx'
import { useIsMobile } from '../internal/use-is-mobile.ts'
import { cn } from '../lib/cn.ts'
import { Button } from './button.tsx'
import { Calendar } from './calendar.tsx'
import { Popover, PopoverTrigger } from './popover.tsx'

/** A ready-made period: « 7 derniers jours ». */
type DateRangePreset = { label: string; from: string; to: string }

/** The words DateRangePicker writes, to change on one DateRangePicker only. */
type DateRangePickerLabels = Partial<
  Pick<
    GoGoUIMessages,
    | 'dateRange'
    | 'dayCount'
    | 'pickEndDate'
    | 'presets'
    | 'clearDates'
    | 'confirm'
    | 'todayLabel'
    | 'today'
    | 'calendarDayRest'
  >
>

type DateRangePickerProps = {
  id?: string
  /** "YYYY-MM-DD", or absent. */
  from: string | undefined
  to: string | undefined
  onChange: (range: { from?: string; to?: string }) => void
  placeholder?: string
  /** Shortcuts beside the months (`useDateRangePresets()` gives the usual ones). */
  presets?: readonly DateRangePreset[]
  /** Days that cannot be chosen; a period cannot cross them. */
  disabledDates?: Matcher | Matcher[]
  /** The shortest and longest period, in days (a stay of 2 to 14 nights). */
  minDays?: number
  maxDays?: number
  /** The chosen days' colour; the primary by default. */
  color?: Color
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: DateRangePickerLabels
}

const monthsApart = (a: Date, b: Date) =>
  (a.getFullYear() - b.getFullYear()) * 12 + a.getMonth() - b.getMonth()
const firstOfMonth = (date: Date, shift = 0) =>
  new Date(date.getFullYear(), date.getMonth() + shift, 1)
const capitalize = (text: string) =>
  text.charAt(0).toLocaleUpperCase() + text.slice(1)

/**
 * The usual period shortcuts, counted from today: today, the last 7 and 30
 * days, this month, last month, the next 30 days.
 *
 * **Use it for** `<DateRangePicker presets={useDateRangePresets()} />`.
 *
 * @summary The usual period shortcuts, from today.
 */
function useDateRangePresets(): DateRangePreset[] {
  const messages = useGoGoUIMessages()
  // Read once: the shortcuts do not move while the page is open.
  const [today] = useState(() => new Date())
  const day = (offset: number) => {
    const date = new Date(today)
    date.setDate(date.getDate() + offset)
    return toDay(date)
  }
  const year = today.getFullYear()
  const month = today.getMonth()
  return [
    { label: messages.presetToday, from: day(0), to: day(0) },
    { label: messages.presetLast7Days, from: day(-6), to: day(0) },
    { label: messages.presetLast30Days, from: day(-29), to: day(0) },
    {
      label: messages.presetThisMonth,
      from: toDay(new Date(year, month, 1)),
      to: toDay(new Date(year, month + 1, 0)),
    },
    {
      label: messages.presetLastMonth,
      from: toDay(new Date(year, month - 1, 1)),
      to: toDay(new Date(year, month, 0)),
    },
    { label: messages.presetNext30Days, from: day(0), to: day(29) },
  ]
}

/**
 * Remembers which way a value moved in time, so words roll that way:
 * up when it moves later, down when it moves earlier.
 */
function useTimeDirection(time: number | null) {
  const [seen, setSeen] = useState(time)
  const [direction, setDirection] = useState(1)
  if (time !== seen) {
    setSeen(time)
    setDirection(time === null || seen === null || time >= seen ? 1 : -1)
  }
  return direction
}

/**
 * A period picked in a two-month calendar, with shortcuts, and Arc UI's
 * motion (https://uiarc.dev, MIT): the panel grows out of its button, the
 * range is a bar per week that stretches under the pointer once the first
 * day is picked, its two ends glide from day to day, months slide, the
 * chosen shortcut's highlight glides, and the button's words roll.
 *
 * **Use it for** a report's period, a stay, a filter on dates. **Prefer**
 * `DateField` for one day.
 *
 * **Where**: above a report, in a filter bar, in a booking form.
 *
 * **States**: empty, start chosen (the range follows the pointer), full
 * range (its length in days under the months), a shortcut chosen,
 * disabled days, too short or too long.
 *
 * **On a phone** (under 48rem): one month instead of two, 44 px days, the
 * shortcuts in a row above the month. The button looks the same on every
 * screen; the count of months is chosen when the panel opens (never on
 * the server's page), since the calendar's arrows must walk real months.
 *
 * **Key props**: `from`, `to`, `onChange`, `placeholder`, `presets`
 * (`useDateRangePresets()` gives the usual ones: 7 days, this month…),
 * `minDays`, `maxDays`, `disabledDates`, `color`, `labels` to change its words.
 *
 * **Accessibility**: the button says the chosen period in words; the
 * calendar opens on the period (arrows work at once); the length, or the
 * call to pick an end, is read aloud as it changes. From the keyboard the
 * range lands without gliding; with reduced motion nothing travels.
 *
 * @summary A period picked in a two-month calendar.
 */
function DateRangePicker({
  id,
  from,
  to,
  onChange,
  placeholder,
  presets,
  disabledDates,
  minDays,
  maxDays,
  color,
  className,
  labels,
}: DateRangePickerProps) {
  const messages = useGoGoUIMessages(labels)
  // Read for the panel only, which exists once opened: the server's « no »
  // never shows. Two months hidden by CSS would not do: the arrows would
  // walk into a month nobody sees.
  const isMobile = useIsMobile()
  const highlightId = useId()
  const [open, setOpen] = useState(false)
  const count = isMobile ? 1 : 2
  const selected: DateRange | undefined =
    from || to ? { from: parseDay(from), to: parseDay(to) } : undefined
  const [month, setMonth] = useState(() =>
    firstOfMonth(selected?.from ?? selected?.to ?? new Date()),
  )
  const typed = (day: string | undefined) =>
    day ? formatTypedDay(day, messages.dayOrder) : undefined
  const label = messages.dateRange(typed(from), typed(to))
  const words = capitalize(label ?? placeholder ?? messages.pickDates)
  const direction = useTimeDirection(
    selected
      ? (selected.from?.getTime() ?? 0) * 2 + (selected.to?.getTime() ?? 0)
      : null,
  )

  const days =
    selected?.from && selected.to
      ? Math.round(
          (Date.UTC(
            selected.to.getFullYear(),
            selected.to.getMonth(),
            selected.to.getDate(),
          ) -
            Date.UTC(
              selected.from.getFullYear(),
              selected.from.getMonth(),
              selected.from.getDate(),
            )) /
            864e5,
        ) + 1
      : 0
  const summary = days
    ? messages.dayCount(days)
    : selected?.from
      ? messages.pickEndDate
      : ''

  /** Keeps a period on screen: nothing moves when it already shows, else its last month lands on the right. */
  function reveal(start: Date, end: Date) {
    const last = firstOfMonth(month, count - 1)
    if (monthsApart(start, month) >= 0 && monthsApart(end, last) <= 0) {
      return
    }
    setMonth(firstOfMonth(end, -(count - 1)))
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        // Opens on the chosen period, or on this month.
        if (next) {
          setMonth(
            firstOfMonth(
              selected?.to && count === 1
                ? selected.to
                : (selected?.from ?? selected?.to ?? new Date()),
            ),
          )
        }
        setOpen(next)
      }}
    >
      <PopoverTrigger
        id={id}
        render={
          <Button
            variant="outline"
            className={cn('w-full justify-start font-normal', className)}
          />
        }
      >
        <CalendarDotsIcon aria-hidden="true" />
        <span className="sr-only">{words}</span>
        <RollingWords
          text={words}
          direction={direction}
          className={cn('min-w-0 overflow-hidden', !label && 'text-fg-subtle')}
        />
      </PopoverTrigger>
      <DatePopup>
        <div className="flex flex-col md:flex-row">
          {presets && presets.length > 0 && (
            <div
              role="group"
              aria-label={messages.presets}
              className="flex gap-0.5 overflow-x-auto border-b border-line-subtle p-2 [scrollbar-width:none] md:w-40 md:flex-col md:overflow-visible md:border-e md:border-b-0"
            >
              <MotionScope>
                {presets.map((preset) => {
                  const chosen = preset.from === from && preset.to === to
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      aria-pressed={chosen}
                      className="relative isolate flex h-8 shrink-0 items-center rounded-xl px-3 text-start text-sm whitespace-nowrap text-fg-muted transition-[color,background-color] duration-(--motion-fast) ease-standard hover:text-fg focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus aria-pressed:font-medium aria-pressed:text-fg not-aria-pressed:hover:bg-hover motion-reduce:transition-none"
                      onClick={() => {
                        onChange({ from: preset.from, to: preset.to })
                        const start = parseDay(preset.from)
                        const end = parseDay(preset.to)
                        if (start && end) {
                          reveal(start, end)
                        }
                      }}
                    >
                      {/* One highlight for the rail: it glides to the
                          shortcut chosen. */}
                      {chosen && (
                        <m.span
                          layoutId={highlightId}
                          aria-hidden="true"
                          className="absolute inset-0 -z-10 rounded-xl bg-selected"
                          transition={spring.morph}
                        />
                      )}
                      {preset.label}
                    </button>
                  )
                })}
              </MotionScope>
            </div>
          )}
          <Calendar
            mode="range"
            labels={labels}
            numberOfMonths={count}
            selected={selected}
            month={month}
            onMonthChange={setMonth}
            onSelect={(range: DateRange | undefined) =>
              onChange({
                from: range?.from ? toDay(range.from) : undefined,
                to: range?.to ? toDay(range.to) : undefined,
              })
            }
            disabled={disabledDates}
            excludeDisabled={disabledDates !== undefined}
            min={minDays}
            max={maxDays}
            color={color}
            locale={messages.intlLocale.startsWith('fr') ? fr : undefined}
            // Days of 40px side by side, 44px (a thumb's target) on a phone.
            className="[--cell-size:--spacing(10)] max-md:[--cell-size:--spacing(11)]"
          />
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line-subtle py-2.5 ps-4 pe-3">
          <p
            aria-live="polite"
            className="min-w-0 text-xs text-fg-muted tabular-nums"
          >
            <span className="sr-only">{summary}</span>
            <RollingWords text={summary} direction={direction} />
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              disabled={!from && !to}
              onClick={() => onChange({})}
            >
              {messages.clearDates}
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              {messages.confirm}
            </Button>
          </div>
        </div>
      </DatePopup>
    </Popover>
  )
}

export { DateRangePicker, useDateRangePresets }
export type { DateRangePickerProps, DateRangePreset, DateRangePickerLabels }
