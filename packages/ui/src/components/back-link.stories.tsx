import preview from '#.storybook/preview'

import { BackLink } from './back-link.tsx'

const meta = preview.meta({
  title: 'Navigation/BackLink',
  component: BackLink,
})

/**
 * Back to the list. With a router, pass its link to `render`.
 */
export const Basic = meta.story({
  args: { label: 'Clients', href: '#clients' },
})

/**
 * A button back in history, to find the list as it was left.
 */
export const HistoryBack = meta.story({
  args: {
    label: 'Demandes',
    render: <button type="button" onClick={() => history.back()} />,
  },
})
