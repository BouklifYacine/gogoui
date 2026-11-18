import { useState } from 'react'
import { BellIcon, FlagIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { FilterCheckbox } from './filter-checkbox.tsx'
import { FilterCheckboxGroup } from './filter-checkbox-group.tsx'
import { FilterChips } from './filter-chips.tsx'
import { FilterDateRange } from './filter-date-range.tsx'
import { FilterMenu } from './filter-menu.tsx'
import { FilterNumberRange } from './filter-number-range.tsx'
import { FilterSection } from './filter-section.tsx'

const meta = preview.meta({
  title: 'Listes/FilterMenu',
  component: FilterMenu,
  parameters: { layout: 'padded' },
})

const stages = [
  { value: 'new', label: 'Nouvelle' },
  { value: 'visit', label: 'Visite' },
  { value: 'quote', label: 'Devis' },
  { value: 'won', label: 'Gagnée' },
] as const

type Stage = (typeof stages)[number]['value']

/**
 * Four groups behind « Filtrer »: a choice, a period, a budget and a few
 * on/off filters. The chips under it say what is on. On a phone, the
 * groups open one at a time in a drawer.
 *
 * @summary A list's filters with their chips.
 */
export const Basic = meta.story({
  render: function Render() {
    const [stage, setStage] = useState<Stage | undefined>('new')
    const [period, setPeriod] = useState<{ from?: string; to?: string }>({})
    const [budget, setBudget] = useState<{ min?: number; max?: number }>({})
    const [unread, setUnread] = useState(false)
    const reset = () => {
      setStage(undefined)
      setPeriod({})
      setBudget({})
      setUnread(false)
    }
    const activeCount =
      Number(stage !== undefined) +
      Number(Boolean(period.from || period.to)) +
      Number(budget.min !== undefined || budget.max !== undefined) +
      Number(unread)
    return (
      <div className="flex flex-col items-end gap-3">
        <FilterMenu
          title="Filtrer les demandes"
          activeCount={activeCount}
          onReset={reset}
        >
          <FilterCheckboxGroup
            legend="Étape"
            icon={FlagIcon}
            options={stages}
            checked={stage}
            onCheckedChange={setStage}
          />
          <FilterDateRange
            id="event-date"
            legend="Date de l'événement"
            from={period.from}
            to={period.to}
            onChange={setPeriod}
          />
          <FilterNumberRange
            id="budget"
            legend="Budget"
            unit={{ kind: 'money', currency: 'EUR' }}
            scale={{ max: 50_000, step: 500 }}
            min={budget.min}
            max={budget.max}
            onChange={setBudget}
          />
          <FilterSection
            legend="Suivi"
            icon={BellIcon}
            summary={unread ? 'Non lues' : null}
          >
            <FilterCheckbox
              label="Non lues seulement"
              checked={unread}
              onCheckedChange={setUnread}
            />
          </FilterSection>
        </FilterMenu>
        <FilterChips
          chips={[
            ...(stage
              ? [
                  {
                    id: 'stage',
                    label: `Étape : ${stages.find((s) => s.value === stage)?.label ?? ''}`,
                    onRemove: () => setStage(undefined),
                  },
                ]
              : []),
            ...(unread
              ? [
                  {
                    id: 'unread',
                    label: 'Non lues',
                    onRemove: () => setUnread(false),
                  },
                ]
              : []),
          ]}
          onReset={reset}
        />
      </div>
    )
  },
})

/**
 * A single group opens alone, without a sidebar.
 *
 * @summary One filter group.
 */
export const SingleGroup = meta.story({
  render: function Render() {
    const [guests, setGuests] = useState<{ min?: number; max?: number }>({})
    return (
      <FilterMenu
        title="Filtrer les lieux"
        activeCount={
          guests.min !== undefined || guests.max !== undefined ? 1 : 0
        }
        onReset={() => setGuests({})}
      >
        <FilterNumberRange
          id="guests"
          legend="Invités"
          unit={{ kind: 'count' }}
          scale={{ max: 300, step: 10 }}
          min={guests.min}
          max={guests.max}
          onChange={setGuests}
        />
      </FilterMenu>
    )
  },
})
