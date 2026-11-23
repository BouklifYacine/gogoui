/*
 * Drawn « photos » for the block stories: a sky, a sun and three hills in
 * an SVG data URL, so the stories need no network and no image file.
 */

type Scene = {
  /** Top and bottom of the sky. */
  sky: [string, string]
  sun: string
  /** Far, middle and near hills. */
  hills: [string, string, string]
}

const scenes = {
  dawn: {
    sky: ['#fde2c8', '#f7b7a3'],
    sun: '#fff4e0',
    hills: ['#d99a8b', '#b8786f', '#8d5a55'],
  },
  meadow: {
    sky: ['#dcebf5', '#f4f1e6'],
    sun: '#fffbea',
    hills: ['#b9cfa8', '#8fb07f', '#5f8457'],
  },
  dusk: {
    sky: ['#2f3a5f', '#c9837a'],
    sun: '#f6d29b',
    hills: ['#5a4d6b', '#3f3a56', '#262438'],
  },
  vineyard: {
    sky: ['#f3e7c9', '#e8c99a'],
    sun: '#fff7e3',
    hills: ['#c9b27c', '#9c8a55', '#6e6540'],
  },
  lake: {
    sky: ['#cfe3ea', '#e9f1ef'],
    sun: '#ffffff',
    hills: ['#9fb9c2', '#6f929c', '#47666f'],
  },
  garden: {
    sky: ['#eef3e2', '#f9efe3'],
    sun: '#fffdf4',
    hills: ['#c4d3a6', '#a2b97f', '#7b9761'],
  },
} satisfies Record<string, Scene>

export type DemoScene = keyof typeof scenes

/** A drawn landscape as an image URL, 1600 × 1000. */
export function demoImage(name: DemoScene): string {
  const { sky, sun, hills } = scenes[name]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs><rect width="1600" height="1000" fill="url(#s)"/><circle cx="1120" cy="380" r="120" fill="${sun}" opacity=".9"/><path d="M0 640 C300 520 560 600 820 560 S1320 470 1600 560 V1000 H0Z" fill="${hills[0]}"/><path d="M0 760 C260 660 600 740 900 690 S1400 640 1600 700 V1000 H0Z" fill="${hills[1]}"/><path d="M0 880 C340 800 700 860 1000 830 S1460 800 1600 840 V1000 H0Z" fill="${hills[2]}"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
