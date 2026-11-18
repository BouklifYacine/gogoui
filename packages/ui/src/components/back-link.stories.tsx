import preview from '#.storybook/preview'

import { BackLink } from './back-link.tsx'

const meta = preview.meta({
  title: 'Mise en page/BackLink',
  component: BackLink,
})

/**
 * Back to the list. With a router, pass its link to `render`.
 *
 * @summary The way back to a list.
 */
export const Basic = meta.story({
  args: { label: 'Clients', href: '#clients' },
})

/**
 * A button back in history, to find the list as it was left.
 *
 * @summary Back in history.
 */
export const HistoryBack = meta.story({
  args: {
    label: 'Demandes',
    render: <button type="button" onClick={() => history.back()} />,
  },
})
