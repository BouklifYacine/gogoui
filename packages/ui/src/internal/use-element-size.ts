import { useCallback, useState } from 'react'

type Size = { width: number; height: number }

/**
 * An element's size, read when it shows and again each time it changes (a
 * font that arrives late, a longer word). Give the returned ref to the
 * element; null until it is measured. A callback ref: it starts with the
 * element and stops with it.
 */
export function useElementSize<T extends HTMLElement>(): [
  Size | null,
  (node: T | null) => (() => void) | undefined,
] {
  const [size, setSize] = useState<Size | null>(null)
  const ref = useCallback((node: T | null) => {
    if (!node || typeof ResizeObserver === 'undefined') {
      return undefined
    }
    const observer = new ResizeObserver(() => {
      const width = node.offsetWidth
      const height = node.offsetHeight
      // The same size again changes nothing: no new render.
      setSize((before) =>
        before?.width === width && before.height === height
          ? before
          : { width, height },
      )
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return [size, ref]
}
