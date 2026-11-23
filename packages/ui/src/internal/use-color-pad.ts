import { useRef } from 'react'
import type { PointerEvent } from 'react'

import { clamp } from './color-math.ts'

/**
 * A pointer drag over an element, read as fractions of its box (0 to 1
 * across, 0 to 1 down). One pointer at a time; the element keeps the
 * pointer while it drags.
 */
export function useColorPad(
  onMove: (x: number, y: number) => void,
  onDrag: (dragging: boolean) => void,
) {
  const pointer = useRef<number | null>(null)
  const read = (event: PointerEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    onMove(
      clamp((event.clientX - box.left) / box.width),
      clamp((event.clientY - box.top) / box.height),
    )
  }
  const stop = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerId !== pointer.current) {
      return
    }
    pointer.current = null
    onDrag(false)
  }
  return {
    onPointerDown(event: PointerEvent<HTMLElement>) {
      if (event.button !== 0 || pointer.current !== null) {
        return
      }
      pointer.current = event.pointerId
      event.currentTarget.setPointerCapture(event.pointerId)
      onDrag(true)
      read(event)
    },
    onPointerMove(event: PointerEvent<HTMLElement>) {
      if (event.pointerId === pointer.current) {
        read(event)
      }
    },
    onPointerUp: stop,
    onPointerCancel: stop,
  }
}
