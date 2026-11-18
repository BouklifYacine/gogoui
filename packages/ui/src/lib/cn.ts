import { createCn } from 'cn/config'

/**
 * Merges class names, the last Tailwind class of a group winning
 * (`cn('px-2', 'px-4')` gives `px-4`).
 *
 * GoGoUI's own names are taught to the merger: without it, `shadow-button`
 * reads as a shadow *colour* and `rounded-button` as nothing at all, so
 * `cn('shadow-button', 'shadow-none')` would keep both.
 *
 * @summary Merge class names, GoGoUI's shadow and radius names included.
 */
export const cn = createCn({
  extend: {
    theme: {
      shadow: [
        'field',
        'control',
        'button',
        'primary',
        'inverse',
        'danger',
        'badge',
        'menu',
        'focus',
        'focus-primary',
        'focus-danger',
      ],
      radius: ['button', 'button-sm'],
    },
  },
})
