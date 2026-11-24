import { createContext, use } from 'react'
import type { ReactNode } from 'react'
import { LazyMotion } from 'motion/react'
import type { FeatureBundle } from 'motion/react'

// True under a MotionFeatures that already gives `m` elements their features.
const FeaturesAboveContext = createContext(false)

// The bundle once it has arrived: later MotionFeatures hand it over at once.
let loadedBundle: FeatureBundle | undefined
let loadingBundle: Promise<FeatureBundle> | undefined

function loadBundle() {
  loadingBundle ??= import('./motion-feature-bundle.ts').then((bundle) => {
    loadedBundle = bundle.default
    return bundle.default
  })
  return loadingBundle
}

// Fetched as soon as a page holds a GoGoUI component, not at its first
// render: until it arrives, `m` elements hold their `initial` look.
if (typeof window !== 'undefined') {
  void loadBundle()
}

/**
 * Gives the `m` elements inside it what they need to animate, loaded once
 * per page in its own file, so no component bundles it. Only the first one
 * from the top renders a `LazyMotion`; the ones inside it cost a context
 * read. GoGoUIProvider and MotionScope already sit in one: use it only
 * around `m` elements that may render outside both.
 *
 * @summary Internal: loads motion's features for the `m` elements inside it.
 */
export function MotionFeatures({ children }: { children: ReactNode }) {
  const featuresAbove = use(FeaturesAboveContext)
  if (featuresAbove) return children
  return (
    <LazyMotion features={loadedBundle ?? loadBundle}>
      <FeaturesAboveContext value>{children}</FeaturesAboveContext>
    </LazyMotion>
  )
}
