/*
 * How every centred dialog (Dialog, AlertDialog, so ConfirmDialog and
 * SettingDialog too) comes and goes, after Arc UI (https://uiarc.dev, MIT
 * licence, Elia Kuratli).
 *
 * In CSS only, on Base UI's `data-starting-style` / `data-ending-style`:
 * transitions, not keyframes, so a close that interrupts the opening leaves
 * from where the window is. The veil fades in over 200ms; the window rises
 * 8px and grows from .96 on a spring that never overshoots, its opacity
 * quicker (150ms). The exit is shorter and quieter: 4px, .98, 150ms.
 *
 * Reduced motion: the global rule of styles.css (and GoGoUIProvider
 * motion="off") brings every transition to nothing, so it simply appears.
 */

/** The veil behind a dialog. */
export const dialogOverlayMotion =
  'transition-opacity duration-(--motion-standard) ease-enter data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-(--motion-fast) data-ending-style:ease-standard'

/**
 * The window, centred with translate -50%: the entrance only moves
 * translate's y and scale, so the centring stays.
 */
export const dialogPopupMotion =
  '[transition-property:opacity,translate,scale] [transition-duration:var(--motion-fast),var(--motion-spring),var(--motion-spring)] [transition-timing-function:var(--motion-ease-enter),var(--motion-ease-spring),var(--motion-ease-spring)] data-starting-style:translate-y-[calc(-50%+8px)] data-starting-style:scale-96 data-starting-style:opacity-0 data-ending-style:translate-y-[calc(-50%+4px)] data-ending-style:scale-98 data-ending-style:opacity-0 data-ending-style:duration-(--motion-fast) data-ending-style:ease-standard'
