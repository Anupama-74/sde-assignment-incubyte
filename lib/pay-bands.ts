import { COUNTRIES, LEVELS } from "./reference-data.ts"

export type BandPosition = "under_band" | "within_band" | "over_band"

export type PayBand = {
  countryCode: string
  currencyCode: string
  level: string
  minCents: number
  midpointCents: number
  maxCents: number
  minUsdCents: number
  midpointUsdCents: number
  maxUsdCents: number
}

export function getPayBand(countryCode: string, levelName: string): PayBand {
  const country = COUNTRIES.find((item) => item.code === countryCode)
  const level = LEVELS.find((item) => item.name === levelName)

  if (!country || !level) {
    throw new Error(`Unknown pay band for ${countryCode}/${levelName}`)
  }

  const min = Math.round(country.baseSalaryRange[0] * level.multiplier * 100)
  const max = Math.round(country.baseSalaryRange[1] * level.multiplier * 100)
  const midpoint = Math.round((min + max) / 2)

  return {
    countryCode,
    currencyCode: country.currency,
    level: levelName,
    minCents: min,
    midpointCents: midpoint,
    maxCents: max,
    minUsdCents: Math.round(min * country.fxToUsd),
    midpointUsdCents: Math.round(midpoint * country.fxToUsd),
    maxUsdCents: Math.round(max * country.fxToUsd),
  }
}

export function getBandPosition(
  baseSalaryCents: number,
  payBand: PayBand,
): BandPosition {
  if (baseSalaryCents < payBand.minCents) {
    return "under_band"
  }

  if (baseSalaryCents > payBand.maxCents) {
    return "over_band"
  }

  return "within_band"
}

export function getCompaRatio(baseSalaryCents: number, payBand: PayBand) {
  if (payBand.midpointCents === 0) {
    return 0
  }

  return baseSalaryCents / payBand.midpointCents
}

export function formatBandPositionLabel(position: BandPosition) {
  switch (position) {
    case "under_band":
      return "Under band"
    case "over_band":
      return "Over band"
    default:
      return "Within band"
  }
}
