import { SettingsSection } from './settings-section.tsx'
import type { SettingsSectionProps } from './settings-section.tsx'

/** @deprecated Use `SettingsSectionProps`: the same props. */
type MobileSettingsSectionProps = SettingsSectionProps

/**
 * A long settings form folded by part on a phone, always open from 48rem.
 *
 * **Use it for** nothing new: it is `SettingsSection` under its old name,
 * same props, same output (folded on a phone, open from 48rem, in CSS).
 *
 * @deprecated Use `SettingsSection` from `@gogoui/ui/settings-section`: the
 * same component, named for what it is on every screen, not on a phone.
 *
 * @summary Old name of SettingsSection.
 */
function MobileSettingsSection(props: MobileSettingsSectionProps) {
  return <SettingsSection {...props} />
}

export { MobileSettingsSection }
export type { MobileSettingsSectionProps }
