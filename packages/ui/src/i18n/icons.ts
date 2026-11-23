import {
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  ArrowDownIcon,
  ArrowUUpLeftIcon,
  ArrowUUpRightIcon,
  ArrowUpIcon,
  EraserIcon,
  EyedropperIcon,
  FileIcon,
  FileImageIcon,
  FileTextIcon,
  FileVideoIcon,
  FileZipIcon,
  PlayIcon,
  StopIcon,
  ArrowsDownUpIcon,
  CalendarDotsIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretUpIcon,
  CheckCircleIcon,
  CheckIcon,
  CircleNotchIcon,
  CopyIcon,
  DesktopIcon,
  DotsThreeIcon,
  FunnelSimpleIcon,
  InfoIcon,
  ListIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  MoonIcon,
  PlusIcon,
  SignOutIcon,
  StarIcon,
  SunIcon,
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
  // UserMenu and ShortcutRecorder (after Arc UI).
  /** The account menu's way out. */
  signOut: GoGoUIIcon
  /** The themes: light, dark, the device's. */
  themeLight: GoGoUIIcon
  themeDark: GoGoUIIcon
  themeSystem: GoGoUIIcon
  /** Brings a default value back. */
  reset: GoGoUIIcon
  // SiteHeader (after Arc UI).
  /** The ☰ that opens a site's menu on a phone. */
  menu: GoGoUIIcon
  // CopyButton (after Arc UI).
  /** A copy button at rest. */
  copy: GoGoUIIcon
  // Rating (after Arc UI).
  /** A rating's star, drawn filled (Phosphor weight « fill ») and outlined. */
  star: GoGoUIIcon
  // SignaturePad and FileUpload (after Arc UI).
  /** Takes the last stroke back, and gives it again. */
  undo: GoGoUIIcon
  redo: GoGoUIIcon
  /** Replays a signature, and stops it. */
  play: GoGoUIIcon
  stop: GoGoUIIcon
  /** Clears a signature. */
  eraser: GoGoUIIcon
  /** The arrow on an upload zone's sheet. */
  upload: GoGoUIIcon
  /** Tries an upload again. */
  retry: GoGoUIIcon
  /** A file without a thumbnail, by its type. */
  file: GoGoUIIcon
  fileImage: GoGoUIIcon
  fileVideo: GoGoUIIcon
  fileArchive: GoGoUIIcon
  fileText: GoGoUIIcon
  // ColorPicker (after Arc UI).
  /** Picks a colour from the screen. */
  eyedropper: GoGoUIIcon
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
  // UserMenu and ShortcutRecorder (after Arc UI).
  signOut: SignOutIcon,
  themeLight: SunIcon,
  themeDark: MoonIcon,
  themeSystem: DesktopIcon,
  reset: ArrowCounterClockwiseIcon,
  // SiteHeader (after Arc UI).
  menu: ListIcon,
  // CopyButton (after Arc UI).
  copy: CopyIcon,
  // Rating (after Arc UI).
  star: StarIcon,
  // SignaturePad and FileUpload (after Arc UI).
  undo: ArrowUUpLeftIcon,
  redo: ArrowUUpRightIcon,
  play: PlayIcon,
  stop: StopIcon,
  eraser: EraserIcon,
  upload: ArrowUpIcon,
  retry: ArrowClockwiseIcon,
  file: FileIcon,
  fileImage: FileImageIcon,
  fileVideo: FileVideoIcon,
  fileArchive: FileZipIcon,
  fileText: FileTextIcon,
  // ColorPicker (after Arc UI).
  eyedropper: EyedropperIcon,
}
