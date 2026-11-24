import type { ComponentProps } from 'react'
import { DayPicker, getDefaultClassNames } from 'react-day-picker'

import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { CalendarChevron } from '../internal/calendar-chevron.tsx'
import { CalendarMonth } from '../internal/calendar-month.tsx'
import { CalendarMonths } from '../internal/calendar-months.tsx'
import { CalendarNav } from '../internal/calendar-nav.tsx'
import { CalendarLookContext } from '../internal/calendar-state.ts'
import { CalendarWeeks } from '../internal/calendar-weeks.tsx'
import type { Color } from '../internal/colors.ts'
import { LabelsScope } from '../internal/labels-scope.tsx'
import { MotionScope } from '../internal/motion-scope.tsx'
import { cn } from '../lib/cn.ts'
import { buttonVariants } from './button.tsx'
import type { Button } from './button.tsx'
import { CalendarDayButton } from './calendar-day-button.tsx'

// Months travel on one strip, a gap of 1rem between them, the one leaving
// dimmed to 40 %; the title slides 12px and crossfades. react-day-picker
// puts the leaving month back for the time of the slide and takes it away
// when its title is done, so the title's exit lasts as long as the slide.
// react-day-picker adds and removes each of these with classList, so each
// is ONE class; the keyframes live in styles.css (`calendar-…`).
/**
 * The words Calendar writes, to change on one Calendar only. They go in
 * the same `labels` as react-day-picker's own (`labelNext`…).
 */
type CalendarLabels = Partial<
  Pick<GoGoUIMessages, 'todayLabel' | 'today' | 'calendarDayRest'>
>

const animations = {
  weeks_after_enter: 'calendar-weeks-after-enter',
  weeks_before_enter: 'calendar-weeks-before-enter',
  weeks_before_exit: 'calendar-weeks-before-exit',
  weeks_after_exit: 'calendar-weeks-after-exit',
  caption_after_enter: 'calendar-caption-after-enter',
  caption_before_enter: 'calendar-caption-before-enter',
  caption_before_exit: 'calendar-caption-before-exit',
  caption_after_exit: 'calendar-caption-after-exit',
}

/**
 * A month grid to pick a day, several days or a range (react-day-picker),
 * with Arc UI's look and motion (https://uiarc.dev, MIT): the chosen day's
 * disc glides from day to day, months slide on a strip, a range stretches
 * under the pointer, a small dot marks today.
 *
 * **Use it for** a visible calendar on a page or in a popover. **Prefer**
 * `DateField` for one date in a form, `DateRangePicker` for a period.
 *
 * **Where**: in a popover, a side panel, a booking page.
 *
 * **States**: today (a dot), chosen (a disc), range ends (discs) and the
 * days between (a tinted bar), pointed at, pressed, disabled, outside the
 * month, marked days (`modifiers`).
 *
 * **Compose**: `components.DayButton` with `CalendarDayButton` to add
 * something under each number (a price, a resource's dots).
 *
 * **Key props**: `mode` (single, multiple, range), `selected` + `onSelect`,
 * `color`, `numberOfMonths`, `captionLayout="dropdown"` with `startMonth` /
 * `endMonth`, `showWeekNumber`, `weekStartsOn`, `disabled` (dates or rules),
 * `min` / `max` (range length), `modifiers` + `modifiersClassNames`,
 * `locale` (from react-day-picker/locale), `showToday` (a « Today »
 * button), `fixedWeeks` (six weeks, on by default: the height never
 * jumps), `labels` to change its words (react-day-picker's and
 * GoGoUI's). The days' size is `--cell-size` (44px by default).
 *
 * **Accessibility**: arrows move between days, Page up / down between
 * months; the new month is read aloud; the disc, bars and dot are drawn,
 * never read (each day says if it is chosen). With reduced motion,
 * everything lands at once. Marked days need a legend in words.
 *
 * @summary Pick a day or a range in a month grid (needs react-day-picker).
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  fixedWeeks = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  formatters,
  components,
  color = 'primary',
  showToday = false,
  animate,
  labels,
  ...props
}: ComponentProps<typeof DayPicker> & {
  /** The arrows' look, a Button variant; quiet (ghost) by default. */
  buttonVariant?: ComponentProps<typeof Button>['variant']
  /** The chosen day's colour, and a range's; the primary by default. */
  color?: Color
  /** A « Today » button beside the arrows: back to today's month, and today chosen in single mode. */
  showToday?: boolean
  /**
   * Its words on this one only, over GoGoUIProvider's `messages`, beside
   * react-day-picker's own labels.
   */
  labels?: ComponentProps<typeof DayPicker>['labels'] & CalendarLabels
}) {
  const reduce = useReduceMotion()
  const d = getDefaultClassNames()
  const navButton = cn(
    buttonVariants({ variant: buttonVariant }),
    'size-8 rounded-full p-0 select-none max-md:size-8 aria-disabled:pointer-events-none aria-disabled:opacity-35',
  )

  return (
    <MotionScope>
      <LabelsScope labels={labels}>
        <CalendarLookContext value={{ color, showToday }}>
          <DayPicker
            labels={labels}
            data-slot="calendar"
            data-show-today={showToday || undefined}
            showOutsideDays={showOutsideDays}
            fixedWeeks={fixedWeeks}
            // Months slide; with reduced motion they swap in place.
            animate={animate ?? !reduce}
            className={cn(
              'group/calendar p-3 text-fg [--cell-size:--spacing(11)]',
              String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
              String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
              className,
            )}
            captionLayout={captionLayout}
            formatters={{
              formatMonthDropdown: (date) =>
                date.toLocaleString(props.locale?.code, { month: 'short' }),
              ...formatters,
            }}
            classNames={{
              root: cn('w-fit', d.root),
              months: cn('relative flex flex-col gap-6 md:flex-row', d.months),
              month: cn('flex w-full flex-col gap-3', d.month),
              nav: cn(
                'absolute end-0 top-0 z-10 -me-1.5 flex items-center gap-0.5',
                d.nav,
              ),
              button_previous: cn(navButton, d.button_previous),
              button_next: cn(navButton, d.button_next),
              month_caption: cn(
                'flex h-8 w-full items-center ps-1 pe-20 group-data-show-today/calendar:pe-40',
                d.month_caption,
              ),
              dropdowns: cn(
                'flex h-8 items-center gap-1.5 text-sm font-medium',
                d.dropdowns,
              ),
              dropdown_root: cn(
                'relative rounded-lg has-focus-visible:outline-2 has-focus-visible:outline-solid has-focus-visible:outline-focus',
                d.dropdown_root,
              ),
              dropdown: cn(
                'absolute inset-0 bg-floating opacity-0',
                d.dropdown,
              ),
              caption_label: cn(
                'font-medium whitespace-nowrap tabular-nums select-none',
                captionLayout === 'label'
                  ? 'text-base'
                  : 'flex items-center gap-1 rounded-lg text-sm [&>svg]:size-3.5 [&>svg]:text-fg-muted',
                d.caption_label,
              ),
              month_grid: cn('flex w-full flex-col', d.month_grid),
              weekdays: cn('mb-1.5 flex', d.weekdays),
              weekday: cn(
                'h-6 flex-1 text-xs leading-6 font-medium text-fg-subtle select-none',
                d.weekday,
              ),
              weeks: cn('group/weeks relative flex flex-col', d.weeks),
              week: cn('flex w-full', d.week),
              week_number_header: cn(
                'w-(--cell-size) select-none',
                d.week_number_header,
              ),
              week_number: cn(
                'flex size-(--cell-size) items-center justify-center text-xs text-fg-subtle select-none',
                d.week_number,
              ),
              day: cn('flex-1 p-0 text-center select-none', d.day),
              range_start: d.range_start,
              range_middle: d.range_middle,
              range_end: d.range_end,
              today: d.today,
              outside: d.outside,
              disabled: d.disabled,
              hidden: cn('invisible', d.hidden),
              ...animations,
              ...classNames,
            }}
            components={{
              Chevron: CalendarChevron,
              DayButton: CalendarDayButton,
              Month: CalendarMonth,
              Months: CalendarMonths,
              Nav: CalendarNav,
              Weeks: CalendarWeeks,
              ...components,
            }}
            {...props}
          />
        </CalendarLookContext>
      </LabelsScope>
    </MotionScope>
  )
}

export { Calendar, CalendarDayButton }
export type { CalendarLabels }
