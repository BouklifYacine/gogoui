import { createElement } from 'react'
import { addons } from 'storybook/manager-api'

/*
 * Badges in the sidebar: « Beta » beside every component tagged `beta`
 * (adapted from Arc UI in November 2026, API not settled yet), « Dépréciée »
 * beside every component tagged `deprecated` (removed in 0.4.0).
 * createElement, not JSX: the manager compiles JSX to React.createElement
 * without importing React.
 */
const beta = {
  fontSize: 10,
  fontWeight: 600,
  lineHeight: '16px',
  padding: '0 6px',
  borderRadius: 999,
  background: 'rgb(142 81 255 / 0.14)',
  color: '#6d28d9',
}

const deprecated = {
  ...beta,
  background: 'rgb(220 38 38 / 0.12)',
  color: '#b91c1c',
}

addons.setConfig({
  sidebar: {
    renderLabel: (item) => {
      const tags = 'tags' in item ? (item.tags ?? []) : []
      const badges = [
        tags.includes('deprecated') &&
          createElement('span', { key: 'd', style: deprecated }, 'Dépréciée'),
        tags.includes('beta') &&
          !tags.includes('deprecated') &&
          createElement('span', { key: 'b', style: beta }, 'Beta'),
      ].filter(Boolean)
      if (badges.length === 0 || item.type === 'docs') {
        return item.name
      }
      return createElement(
        'span',
        { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } },
        item.name,
        ...badges,
      )
    },
  },
})
