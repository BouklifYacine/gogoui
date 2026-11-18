import { describe, expect, test } from 'vitest'

import { passwordScore } from '../components/password-strength.tsx'
import { pageWindow } from './page-window.ts'
import { formatTypedDay, parseDay, parseTypedDay, toDay } from './days.ts'
import { parseTypedNumber } from './numbers.ts'
import { maskTime, timeMatches, typedTime } from './times.ts'

describe('days', () => {
  test('a day reads back as itself', () => {
    const date = parseDay('2027-06-12')
    expect(date && toDay(date)).toBe('2027-06-12')
  })

  test('a day that does not exist is refused', () => {
    expect(parseDay('2027-02-30')).toBeUndefined()
  })

  test('a typed day follows the language order', () => {
    expect(parseTypedDay('12/06/2027', 'dmy')).toBe('2027-06-12')
    expect(parseTypedDay('06/12/2027', 'mdy')).toBe('2027-06-12')
    expect(parseTypedDay('12.6.27', 'dmy')).toBe('2027-06-12')
    expect(parseTypedDay('31/02/2027', 'dmy')).toBeNull()
    expect(formatTypedDay('2027-06-12', 'dmy')).toBe('12/06/2027')
  })
})

describe('times', () => {
  test('a time typed by hand', () => {
    expect(typedTime('14h')).toBe('14:00')
    expect(typedTime('1410')).toBe('14:10')
    expect(typedTime('9:5')).toBe('09:05')
    expect(typedTime('25:00')).toBeNull()
  })

  test('the list narrows by digits', () => {
    expect(timeMatches('22:15', '22')).toBe(true)
    expect(timeMatches('09:00', '9')).toBe(true)
    expect(timeMatches('14:00', '22')).toBe(false)
  })

  test('the colon comes in, not while erasing', () => {
    expect(maskTime('22', false)).toBe('22:')
    expect(maskTime('22', true)).toBe('22')
    expect(maskTime('2210', false)).toBe('22:10')
  })
})

describe('numbers', () => {
  test('a number typed as people write it', () => {
    expect(parseTypedNumber('1 500')).toBe(1500)
    expect(parseTypedNumber('1 500,50')).toBe(1500.5)
    expect(parseTypedNumber('1,500.50')).toBe(1500.5)
    expect(parseTypedNumber('abc')).toBeNull()
  })
})

describe('pages', () => {
  test('the first, the last and the ones around the current page', () => {
    expect(pageWindow(5, 26)).toEqual([1, 'gap', 4, 5, 6, 'gap', 26])
    expect(pageWindow(2, 5)).toEqual([1, 2, 3, 4, 5])
  })
})

describe('password strength', () => {
  test('length counts most', () => {
    expect(passwordScore('court')).toBe(0)
    expect(passwordScore('motdepasse')).toBe(1)
    expect(passwordScore('Le-domaine-des-Chenes-2027')).toBe(4)
  })
})
