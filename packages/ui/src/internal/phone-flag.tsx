import {
  AE,
  AR,
  AT,
  AU,
  BE,
  BR,
  CA,
  CH,
  CL,
  CN,
  CO,
  CZ,
  DE,
  DK,
  EG,
  ES,
  FI,
  FR,
  GB,
  GR,
  HK,
  ID,
  IE,
  IL,
  IN,
  IT,
  JP,
  KE,
  KR,
  MX,
  NG,
  NL,
  NO,
  NZ,
  PE,
  PH,
  PK,
  PL,
  PT,
  SA,
  SE,
  SG,
  TH,
  TR,
  TW,
  UA,
  US,
  VN,
  ZA,
} from 'country-flag-icons/react/3x2'

// The PhoneField's countries only (phone-countries.ts): a few KB, not the
// whole world's flags.
const flags: Record<string, typeof FR> = {
  AE,
  AR,
  AT,
  AU,
  BE,
  BR,
  CA,
  CH,
  CL,
  CN,
  CO,
  CZ,
  DE,
  DK,
  EG,
  ES,
  FI,
  FR,
  GB,
  GR,
  HK,
  ID,
  IE,
  IL,
  IN,
  IT,
  JP,
  KE,
  KR,
  MX,
  NG,
  NL,
  NO,
  NZ,
  PE,
  PH,
  PK,
  PL,
  PT,
  SA,
  SE,
  SG,
  TH,
  TR,
  TW,
  UA,
  US,
  VN,
  ZA,
}

/**
 * A country's flag as a small picture (country-flag-icons, MIT), 20 × 14 px
 * with rounded corners and a hairline edge so a white flag still shows on a
 * white field. Not an emoji: Windows has no flag emoji and draws two letters
 * instead (« FR »), off the line of the dialling code beside it. A country
 * without a picture shows its ISO code.
 */
function PhoneFlag({ iso }: { iso: string }) {
  const Flag = flags[iso.toUpperCase()]
  return (
    <span
      aria-hidden="true"
      className="relative inline-flex h-3.5 w-5 shrink-0 overflow-hidden rounded-[3px] after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-line after:ring-inset"
    >
      {Flag ? (
        <Flag className="block size-full" />
      ) : (
        <span className="m-auto text-[9px] leading-none font-semibold text-fg-muted">
          {iso.toUpperCase()}
        </span>
      )}
    </span>
  )
}

export { PhoneFlag }
