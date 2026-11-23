import { useCallback } from 'react'
import { animate, useMotionValue } from 'motion/react'

import { duration, ease, spring } from './motion.ts'

// A group's buttons and links: its segments.
const SEGMENTS = ':scope > :is(button, a)'

// A label that changes this long after its segment was pressed (« Copié »)
// is announced; a later change (back to « Copier ») is not.
const ANNOUNCE_WITHIN_MS = 1000

const inert = (node: HTMLElement) =>
  node.matches(':disabled') || node.getAttribute('aria-disabled') === 'true'

const isOpen = (node: HTMLElement) =>
  node.getAttribute('aria-expanded') === 'true' ||
  node.hasAttribute('data-popup-open')

/**
 * One highlight for a whole group of buttons, after Arc UI
 * (https://uiarc.dev, MIT). It sits on the segment under the pointer, else
 * the one pressed (touch), else the one whose menu is open, else the one
 * the keyboard is on. It glides from segment to segment under the pointer
 * and jumps with the keyboard, where a glide would only lag behind. It
 * hides over a disabled segment, and the separators beside it step aside
 * (`data-quiet`). A label that changes right after a press (« Copié ») is
 * read once in the group's live region.
 *
 * Give `attach` to the group: it finds its segments
 * (`:scope > :is(button, a)`), its highlight
 * (`[data-slot=button-group-highlight]`) and its live region
 * (`[data-slot=button-group-status]`), and listens until the group goes.
 * All of it outside React: moving the highlight never renders anything.
 */
export function useGlideHighlight(reduce: boolean) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const width = useMotionValue(0)
  const height = useMotionValue(0)
  const opacity = useMotionValue(0)

  const attach = useCallback(
    (group: HTMLElement | null) => {
      if (!group) {
        return undefined
      }
      const highlight = group.querySelector<HTMLElement>(
        ':scope > [data-slot=button-group-highlight]',
      )
      const status = group.querySelector<HTMLElement>(
        ':scope > [data-slot=button-group-status]',
      )
      const segments = () =>
        Array.from(group.querySelectorAll<HTMLElement>(SEGMENTS))
      const fade = {
        duration: reduce ? duration.instant : duration.fast,
        ease: ease.standard,
      }

      let hover: HTMLElement | null = null
      let pressed: HTMLElement | null = null
      let focused: HTMLElement | null = null
      let shown: HTMLElement | null = null
      // Keyboard moves land at once; only pointer moves glide.
      let keyboard = false

      // The segment's box in the group. offset* ignore a press's scale.
      const place = (node: HTMLElement, glide: boolean) => {
        const target = [
          node.offsetLeft,
          node.offsetTop,
          node.offsetWidth,
          node.offsetHeight,
        ]
        ;[x, y, width, height].forEach((value, index) => {
          const to = target[index] ?? 0
          if (glide) {
            animate(value, to, spring.snappy)
          } else {
            value.jump(to)
          }
        })
      }

      const update = () => {
        const list = segments()
        const open = list.find(isOpen) ?? null
        const active = hover ?? pressed ?? open ?? focused
        // Hovering a disabled segment shows nothing; the keyboard on one
        // still shows where it is.
        const visible =
          active &&
          list.includes(active) &&
          (!inert(active) || active === focused)
            ? active
            : null
        const at = visible ? list.indexOf(visible) : -1
        list.forEach((node, index) => {
          if (at >= 0 && (index === at || index === at + 1)) {
            node.dataset.quiet = ''
          } else {
            delete node.dataset.quiet
          }
        })
        if (highlight) {
          if (visible && visible === pressed) {
            highlight.dataset.pressed = ''
          } else {
            delete highlight.dataset.pressed
          }
        }
        if (!visible) {
          if (shown) {
            animate(opacity, 0, fade)
          }
          shown = null
          return
        }
        if (visible === shown) {
          return
        }
        // From nowhere, or moved by the keyboard, it appears in place.
        place(visible, Boolean(shown) && !reduce && !keyboard)
        animate(opacity, 1, fade)
        shown = visible
      }

      const hit = (event: PointerEvent) => {
        for (const node of segments()) {
          const box = node.getBoundingClientRect()
          if (
            event.clientX >= box.left &&
            event.clientX < box.right &&
            event.clientY >= box.top &&
            event.clientY < box.bottom
          ) {
            return inert(node) ? null : node
          }
        }
        return null
      }

      // What was pressed, and its words then: announced if they change.
      let activated: { node: HTMLElement; text: string; at: number } | null =
        null
      const remember = (node: HTMLElement | null) => {
        if (node) {
          activated = {
            node,
            text: node.textContent ?? '',
            at: performance.now(),
          }
        }
      }
      let reading: ReturnType<typeof setTimeout> | undefined
      const announce = () => {
        clearTimeout(reading)
        // After the old words have left (100ms), the new ones read alone.
        reading = setTimeout(() => {
          const last = activated
          if (
            !status ||
            !last ||
            performance.now() - last.at > ANNOUNCE_WITHIN_MS + 200
          ) {
            return
          }
          const text = last.node.textContent ?? ''
          if (text && text !== last.text) {
            status.textContent = text
            last.text = text
          }
        }, 160)
      }

      const release = () => {
        pressed = null
        update()
        window.removeEventListener('pointerup', release)
        window.removeEventListener('pointercancel', release)
      }

      const onPointerMove = (event: PointerEvent) => {
        keyboard = false
        if (event.pointerType !== 'touch') {
          hover = hit(event)
          update()
        }
      }
      const onPointerLeave = () => {
        hover = null
        update()
      }
      const onPointerDown = (event: PointerEvent) => {
        keyboard = false
        if (event.button !== 0) {
          return
        }
        pressed = hit(event)
        remember(pressed)
        update()
        window.addEventListener('pointerup', release)
        window.addEventListener('pointercancel', release)
      }
      // The keyboard's focus shows the highlight; a click focuses without
      // it, so nothing stays lit once the pointer has left.
      const onFocusIn = (event: FocusEvent) => {
        const target = event.target as HTMLElement
        if (!segments().includes(target)) {
          return
        }
        let visible = true
        try {
          visible = target.matches(':focus-visible')
        } catch {
          // An older engine: show it.
        }
        focused = visible ? target : null
        update()
      }
      const onFocusOut = (event: FocusEvent) => {
        if (!group.contains(event.relatedTarget as Node | null)) {
          focused = null
          update()
        }
      }
      // Tab visits every segment; the arrows along the group, Home and End
      // move between them too.
      const onKeyDown = (event: KeyboardEvent) => {
        keyboard = true
        if (event.key === 'Enter' || event.key === ' ') {
          remember(document.activeElement as HTMLElement | null)
        }
        if (event.defaultPrevented) {
          return
        }
        const list = segments().filter((node) => !node.matches(':disabled'))
        const index = list.findIndex((node) => node === document.activeElement)
        if (index < 0) {
          return
        }
        const vertical = group.dataset.orientation === 'vertical'
        const rtl = !vertical && getComputedStyle(group).direction === 'rtl'
        const forward = vertical
          ? 'ArrowDown'
          : rtl
            ? 'ArrowLeft'
            : 'ArrowRight'
        const backward = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft'
        const last = list.length - 1
        const next =
          event.key === forward
            ? index === last
              ? 0
              : index + 1
            : event.key === backward
              ? index === 0
                ? last
                : index - 1
              : event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? last
                  : -1
        if (next < 0) {
          return
        }
        event.preventDefault()
        list[next]?.focus()
      }

      group.addEventListener('pointermove', onPointerMove)
      group.addEventListener('pointerleave', onPointerLeave)
      group.addEventListener('pointerdown', onPointerDown)
      group.addEventListener('focusin', onFocusIn)
      group.addEventListener('focusout', onFocusOut)
      group.addEventListener('keydown', onKeyDown)

      // A menu that opens or closes, a segment turning disabled under a
      // still pointer, new words: placed again.
      const mutations = new MutationObserver((records) => {
        if (records.some((record) => record.type !== 'attributes')) {
          announce()
        }
        update()
      })
      mutations.observe(group, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: [
          'aria-expanded',
          'data-popup-open',
          'disabled',
          'aria-disabled',
        ],
      })

      // Segments resize when their words change or labels fold: the
      // highlight stays on its segment.
      const resizes =
        typeof ResizeObserver === 'undefined'
          ? null
          : new ResizeObserver(() => {
              if (shown) {
                place(shown, !reduce && x.isAnimating())
              }
            })
      resizes?.observe(group)
      for (const node of segments()) resizes?.observe(node)

      return () => {
        clearTimeout(reading)
        group.removeEventListener('pointermove', onPointerMove)
        group.removeEventListener('pointerleave', onPointerLeave)
        group.removeEventListener('pointerdown', onPointerDown)
        group.removeEventListener('focusin', onFocusIn)
        group.removeEventListener('focusout', onFocusOut)
        group.removeEventListener('keydown', onKeyDown)
        window.removeEventListener('pointerup', release)
        window.removeEventListener('pointercancel', release)
        mutations.disconnect()
        resizes?.disconnect()
      }
    },
    [reduce, x, y, width, height, opacity],
  )

  return { attach, x, y, width, height, opacity }
}
