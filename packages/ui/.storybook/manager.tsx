import { createElement } from 'react'
import { addons } from 'storybook/manager-api'

/*
 * A « Beta » badge in the sidebar beside every component tagged `beta`
 * (the ones adapted from Arc UI in November 2026), and beside each of their
 * stories, until their API is settled. createElement, not JSX: the manager
 * compiles JSX to React.createElement without importing React.
 */
const badge = {
  fontSize: 10,
  fontWeight: 600,
  lineHeight: '16px',
  padding: '0 6px',
  borderRadius: 999,
  background: 'rgb(142 81 255 / 0.14)',
  color: '#6d28d9',
}

addons.setConfig({
  sidebar: {
    renderLabel: (item) => {
      const tags = 'tags' in item ? (item.tags ?? []) : []
      if (!tags.includes('beta') || item.type === 'docs') {
        return item.name
      }
      return createElement(
        'span',
        { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } },
        item.name,
        createElement('span', { style: badge }, 'Beta'),
      )
    },
  },
})
