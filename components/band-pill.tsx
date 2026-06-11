import type { BandPosition } from "@/lib/pay-bands"
import { formatBandPositionLabel } from "@/lib/pay-bands"

type BandPillProps = {
  position: BandPosition
}

export function BandPill({ position }: BandPillProps) {
  return (
    <span className={`bandPill ${getBandPillModifier(position)}`}>
      {formatBandPositionLabel(position)}
    </span>
  )
}

function getBandPillModifier(position: BandPosition) {
  switch (position) {
    case "under_band":
      return "bandPillUnder"
    case "over_band":
      return "bandPillOver"
    default:
      return "bandPillWithin"
  }
}
