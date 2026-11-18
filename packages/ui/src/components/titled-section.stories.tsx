import preview from '#.storybook/preview'

import { DetailsList } from './details-list.tsx'
import { InfoTip } from './info-tip.tsx'
import { SkeletonText } from './skeleton.tsx'
import { TitledSection } from './titled-section.tsx'
import { TitledSectionSkeleton } from './titled-section-skeleton.tsx'

const meta = preview.meta({
  title: 'Mise en page/TitledSection',
  component: TitledSection,
  decorators: [(Story) => <div className="w-[32rem]">{Story()}</div>],
})

/**
 * A part of a record's page under its title, an info tip beside it.
 *
 * @summary A titled part of a page.
 */
export const Basic = meta.story({
  render: () => (
    <TitledSection
      id="event"
      title="Événement"
      aside={<InfoTip text="Ce que le couple a demandé dans son message." />}
    >
      <DetailsList
        rows={[
          ['Date souhaitée', 'samedi 12 juin 2027'],
          ['Invités', '120'],
          ['E-mail', 'marie.durand@exemple.fr'],
        ]}
      />
    </TitledSection>
  ),
})

/**
 * The same part while the page loads.
 *
 * @summary A titled part while it loads.
 */
export const Loading = meta.story({
  render: () => (
    <TitledSectionSkeleton title="Événement">
      <p>
        <SkeletonText>Date souhaitée samedi 12 juin 2027</SkeletonText>
      </p>
      <p>
        <SkeletonText>Invités 120</SkeletonText>
      </p>
    </TitledSectionSkeleton>
  ),
})
