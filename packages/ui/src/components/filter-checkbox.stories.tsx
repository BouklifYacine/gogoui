import { useState } from 'react'
import { SlidersHorizontalIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { FilterCheckbox } from './filter-checkbox.tsx'
import { FilterMenu } from './filter-menu.tsx'
import { FilterSection } from './filter-section.tsx'

const meta = preview.meta({
  title: 'Filtres et recherche/FilterCheckbox',
  component: FilterCheckbox,
  decorators: [(Story) => <div className="w-72">{Story()}</div>],
})

/**
 * One on / off filter, its whole line clickable.
 */
export const Basic = meta.story({
  render: function Render() {
    const [inStock, setInStock] = useState(true)
    return (
      <FilterCheckbox
        label="En stock seulement"
        checked={inStock}
        onCheckedChange={setInStock}
      />
    )
  },
})

/**
 * Its place: in a `FilterSection` of a `FilterMenu`, with the other on /
 * off filters of the same group.
 */
export const InFilterMenu = meta.story({
  render: function Render() {
    const [inStock, setInStock] = useState(false)
    const [onSale, setOnSale] = useState(false)
    const chosen = [inStock && 'En stock', onSale && 'En promotion'].filter(
      Boolean,
    )
    return (
      <FilterMenu
        title="Filtrer les produits"
        activeCount={chosen.length}
        onReset={() => {
          setInStock(false)
          setOnSale(false)
        }}
      >
        <FilterSection
          legend="Disponibilité"
          icon={SlidersHorizontalIcon}
          summary={chosen.length > 0 ? chosen.join(', ') : null}
        >
          <FilterCheckbox
            label="En stock seulement"
            checked={inStock}
            onCheckedChange={setInStock}
          />
          <FilterCheckbox
            label="En promotion"
            checked={onSale}
            onCheckedChange={setOnSale}
          />
        </FilterSection>
      </FilterMenu>
    )
  },
})
