// The springs GoGoUI's hand-drawn charts share, after Arc UI's charts
// (https://uiarc.dev, MIT licence, Elia Kuratli). A chart's first drawing
// is a larger reveal than interface motion, so it keeps a longer settle;
// every spring here stops without overshoot.

/**
 * A time-defined spring as stiffness and damping, so it can carry a
 * `restDelta` (when a moving number counts as arrived) and keep the
 * velocity it starts with.
 */
export function physicalSpring(visualDuration: number, restDelta = 0.0005) {
  const root = (2 * Math.PI) / (visualDuration * 1.2)
  return {
    type: 'spring' as const,
    stiffness: root * root,
    damping: 2 * root,
    restDelta,
    restSpeed: restDelta * 2,
  }
}

/** A chart drawing itself the first time it is seen. */
export const chartReveal = physicalSpring(0.9)

/** New data, a hidden series, a zoom: the shapes on screen morph to the new ones. */
export const chartMorph = physicalSpring(0.3)

/** A crosshair or a tooltip following the pointer or the arrows. */
export const chartFollow = physicalSpring(0.2, 0.01)
