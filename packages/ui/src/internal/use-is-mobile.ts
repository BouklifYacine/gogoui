import { useSyncExternalStore } from 'react'

import { PHONE_QUERY } from './breakpoint.ts'

// The screen crossing the phone's width, as the browser tells it.
function subscribe(onChange: () => void) {
  const query = window.matchMedia(PHONE_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/**
 * Whether the screen is a phone's (under 48rem, breakpoint.ts), read from
 * the browser without an effect: the server, which has no screen, says no.
 * For what a popup does once opened only: a component's first paint follows
 * the screen in CSS (`max-md:`), so the server's « no » never shows.
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(PHONE_QUERY).matches,
    () => false,
  )
}
