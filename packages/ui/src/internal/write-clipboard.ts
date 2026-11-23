/**
 * Puts a text on the clipboard, after Arc UI (https://uiarc.dev, MIT). The
 * Clipboard API first; where it is missing or refused (an iframe, Safari in
 * an embedded preview, a page without https), a hidden textarea and
 * `execCommand('copy')`. Call it from a click. Rejects only when both fail.
 */
export async function writeClipboard(text: string): Promise<void> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return
    }
  } catch {
    // Refused: the old way below.
  }
  const active = document.activeElement as HTMLElement | null
  const selection = document.getSelection()
  const ranges = selection
    ? Array.from({ length: selection.rangeCount }, (_, index) =>
        selection.getRangeAt(index),
      )
    : []
  const area = document.createElement('textarea')
  area.value = text
  // Off screen but drawn (iOS selects nothing invisible), where the page is
  // scrolled so nothing jumps, and 16px so iOS never zooms.
  area.style.cssText = `position:absolute;left:-9999px;top:${window.scrollY || document.documentElement.scrollTop}px;width:1px;height:1px;font-size:16px;border:0;padding:0;margin:0;`
  document.body.append(area)
  // iOS ignores select() on a textarea: a range over a node editable for
  // this instant only, so the keyboard never opens.
  area.contentEditable = 'true'
  area.readOnly = false
  const range = document.createRange()
  range.selectNodeContents(area)
  selection?.removeAllRanges()
  selection?.addRange(range)
  area.select()
  area.setSelectionRange(0, text.length)
  area.contentEditable = 'false'
  area.readOnly = true
  let copied = false
  try {
    copied = document.execCommand('copy')
  } catch {
    copied = false
  }
  area.remove()
  if (selection) {
    selection.removeAllRanges()
    for (const kept of ranges) selection.addRange(kept)
  }
  active?.focus?.({ preventScroll: true })
  if (!copied) {
    throw new Error('Copy refused')
  }
}
