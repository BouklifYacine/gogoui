import { useState } from 'react'

import preview from '#.storybook/preview'

import { FilterMenu } from './filter-menu.tsx'
import { FilterNumberRange } from './filter-number-range.tsx'

type Range = { min?: number; max?: number }

const meta = preview.meta({
  title: 'Filtres et recherche/FilterNumberRange',
  component: FilterNumberRange,
  decorators: [
    (Story) => <div className="w-[28rem] max-w-full">{Story()}</div>,
  ],
})

/**
 * An amount, from and to: the slider for a rough range, the two fields
 * for an exact one.
 */
export const Money = meta.story({
  render: function Render() {
    const [price, setPrice] = useState<Range>({ min: 20, max: 150 })
    return (
      <FilterNumberRange
        id="price"
        legend="Prix"
        unit={{ kind: 'money', currency: 'EUR' }}
        scale={{ max: 500, step: 10 }}
        min={price.min}
        max={price.max}
        onChange={setPrice}
      />
    )
  },
})

/**
 * A count (`unit={{ kind: 'count' }}`): whole numbers, a people icon.
 */
export const Count = meta.story({
  render: function Render() {
    const [seats, setSeats] = useState<Range>({})
    return (
      <FilterNumberRange
        id="seats"
        legend="Places"
        unit={{ kind: 'count' }}
        scale={{ max: 200, step: 5 }}
        min={seats.min}
        max={seats.max}
        onChange={setSeats}
      />
    )
  },
})

/**
 * In a `FilterMenu`: the group's line says the chosen range.
 */
export const InFilterMenu = meta.story({
  render: function Render() {
    const [price, setPrice] = useState<Range>({})
    return (
      <FilterMenu
        title="Filtrer les produits"
        activeCount={price.min !== undefined || price.max !== undefined ? 1 : 0}
        onReset={() => setPrice({})}
      >
        <FilterNumberRange
          id="product-price"
          legend="Prix"
          unit={{ kind: 'money', currency: 'EUR' }}
          scale={{ max: 500, step: 10 }}
          min={price.min}
          max={price.max}
          onChange={setPrice}
        />
      </FilterMenu>
    )
  },
})
