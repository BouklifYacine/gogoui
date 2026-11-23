import type { ComponentProps, ReactElement } from 'react'
import { useRender } from '@base-ui/react/use-render'

/**
 * An `<a>`, or the router's link given as `render` (Base UI style:
 * `render={<Link to="/tarifs" />}`), the props merged onto it. For links
 * outside a Base UI part, such as SiteHeader's phone menu.
 *
 * @summary Internal: a link that can be the router's.
 */
export function RenderLink({
  render,
  ...props
}: ComponentProps<'a'> & { render?: ReactElement }) {
  return useRender({ defaultTagName: 'a', render, props })
}
