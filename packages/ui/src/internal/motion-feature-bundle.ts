// Everything `m` elements need to animate (animations, exit, gestures,
// layout and drag): MotionFeatures loads this file on demand, once per
// page, so no component bundles it. `domMax`, not `domAnimation`: some
// components use `layout`, `layoutId` and `drag`.
export { domMax as default } from 'motion/react'
