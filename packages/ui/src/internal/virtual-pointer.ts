/**
 * Whether a pointer press comes from a screen reader rather than a finger
 * or a mouse. VoiceOver on iOS sends its double tap as a press with no
 * contact area (0 × 0); TalkBack sometimes sends a 1 × 1 « mouse » press
 * with no pressure. The same test as React Aria's `isVirtualPointerEvent`.
 */
export function isVirtualPointer(event: PointerEvent): boolean {
  const android =
    typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)
  return (
    (!android && event.width === 0 && event.height === 0) ||
    (event.width === 1 &&
      event.height === 1 &&
      event.pressure === 0 &&
      event.detail === 0 &&
      event.pointerType === 'mouse')
  )
}
