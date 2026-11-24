/**
 * GoGoUI's one phone threshold: under 48rem (768px, Tailwind's `md`) a
 * screen is a phone's. CSS says it with `max-md:` / `md:`; the few places
 * that must decide in JavaScript (what a popup does once it is opened,
 * never the first paint) read this query, so both agree.
 */
export const PHONE_QUERY = '(width < 48rem)'
