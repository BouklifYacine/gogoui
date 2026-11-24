import preview from '#.storybook/preview'

import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from './pagination.tsx'

const meta = preview.meta({
  title: 'Navigation/Pagination',
  component: Pagination,
  subcomponents: {
    PaginationContent,
    PaginationItem,
    PaginationButton,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
  },
})

/**
 * Page 2 of a long list: the current page outlined and announced as
 * current, the far pages folded.
 */
export const Basic = meta.story({
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious />
        </PaginationItem>
        <PaginationItem>
          <PaginationButton>1</PaginationButton>
        </PaginationItem>
        <PaginationItem>
          <PaginationButton isActive>2</PaginationButton>
        </PaginationItem>
        <PaginationItem>
          <PaginationButton>3</PaginationButton>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
})
