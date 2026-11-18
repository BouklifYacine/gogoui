import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowsDownUpIcon,
  CalendarDotsIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretUpIcon,
  CheckCircleIcon,
  CheckIcon,
  CircleNotchIcon,
  DotsThreeIcon,
  FunnelSimpleIcon,
  InfoIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PlusIcon,
  WarningCircleIcon,
  WarningIcon,
  XIcon,
} from '@phosphor-icons/react'
import type { ComponentType } from 'react'

/**
 * An icon GoGoUI can draw: any component taking a `className` (Phosphor,
 * Lucide, Heroicons, your own SVG). Its size comes from the className.
 */
export type GoGoUIIcon = ComponentType<{
  className?: string
  'aria-hidden'?: boolean | 'true' | 'false'
}>

/** Every icon GoGoUI draws on its own; replace any in GoGoUIProvider. */
export type GoGoUIIcons = {
  /** The × of a dialog, a sheet, a chip, a search. */
  close: GoGoUIIcon
  /** A ticked box, a chosen option. */
  check: GoGoUIIcon
  /** A half-ticked box, a number field's −. */
  minus: GoGoUIIcon
  /** A number field's +. */
  plus: GoGoUIIcon
  chevronDown: GoGoUIIcon
  chevronUp: GoGoUIIcon
  chevronLeft: GoGoUIIcon
  chevronRight: GoGoUIIcon
  /** A « … » menu. */
  more: GoGoUIIcon
  search: GoGoUIIcon
  /** A spinner, turned by GoGoUI. */
  loading: GoGoUIIcon
  calendar: GoGoUIIcon
  filter: GoGoUIIcon
  sortAscending: GoGoUIIcon
  sortDescending: GoGoUIIcon
  sortNone: GoGoUIIcon
  info: GoGoUIIcon
  success: GoGoUIIcon
  warning: GoGoUIIcon
  danger: GoGoUIIcon
}

export const defaultIcons: GoGoUIIcons = {
  close: XIcon,
  check: CheckIcon,
  minus: MinusIcon,
  plus: PlusIcon,
  chevronDown: CaretDownIcon,
  chevronUp: CaretUpIcon,
  chevronLeft: CaretLeftIcon,
  chevronRight: CaretRightIcon,
  more: DotsThreeIcon,
  search: MagnifyingGlassIcon,
  loading: CircleNotchIcon,
  calendar: CalendarDotsIcon,
  filter: FunnelSimpleIcon,
  sortAscending: ArrowUpIcon,
  sortDescending: ArrowDownIcon,
  sortNone: ArrowsDownUpIcon,
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: WarningIcon,
  danger: WarningCircleIcon,
}
