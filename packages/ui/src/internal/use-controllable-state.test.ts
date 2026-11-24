import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'

import { shownValue, useControllableState } from './use-controllable-state.ts'
import type { ControllableStateOptions } from './use-controllable-state.ts'

/**
 * Renders a control that shows its value, after asking once for `next`
 * when one is given (a change made during the render, which React replays).
 */
function renderShown(
  options: ControllableStateOptions<string>,
  next?: string,
): string {
  let asked = false
  function Control() {
    const [value, setValue] = useControllableState(options)
    if (next !== undefined && !asked) {
      asked = true
      setValue(next)
    }
    return createElement('output', null, value)
  }
  return renderToString(createElement(Control))
}

describe('shownValue', () => {
  test("the parent's value wins when it gives one", () => {
    expect(shownValue('parent', 'own')).toBe('parent')
    expect(shownValue('', 'own')).toBe('')
    expect(shownValue(0, 5)).toBe(0)
    expect(shownValue(null, 'own')).toBeNull()
  })

  test('the control keeps its own value when the parent gives none', () => {
    expect(shownValue(undefined, 'own')).toBe('own')
  })
})

describe('useControllableState', () => {
  test('controlled: shows the value, asks for the change', () => {
    const onChange = vi.fn()
    const html = renderShown(
      { value: 'Paris', defaultValue: 'Lyon', onChange },
      'Nice',
    )
    expect(html).toBe('<output>Paris</output>')
    expect(onChange).toHaveBeenCalledWith('Nice')
  })

  test('uncontrolled: starts at the default value', () => {
    const html = renderShown({ value: undefined, defaultValue: 'Lyon' })
    expect(html).toBe('<output>Lyon</output>')
  })

  test('uncontrolled: keeps the change and still tells about it', () => {
    const onChange = vi.fn()
    const html = renderShown(
      { value: undefined, defaultValue: 'Lyon', onChange },
      'Nice',
    )
    expect(html).toBe('<output>Nice</output>')
    expect(onChange).toHaveBeenCalledWith('Nice')
  })

  test('uncontrolled without onChange: the change still shows', () => {
    const html = renderShown({ value: undefined, defaultValue: 'Lyon' }, 'Nice')
    expect(html).toBe('<output>Nice</output>')
  })
})
