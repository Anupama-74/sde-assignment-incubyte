import { describe, expect, it } from "vitest"

import {
  getBandPosition,
  getCompaRatio,
  getPayBand,
} from "@/lib/pay-bands"

describe("pay band helpers", () => {
  it("classifies band position and compa-ratio from the midpoint", () => {
    const payBand = getPayBand("US", "L4")

    expect(getBandPosition(payBand.minCents - 1, payBand)).toBe("under_band")
    expect(getBandPosition(payBand.midpointCents, payBand)).toBe("within_band")
    expect(getBandPosition(payBand.maxCents + 1, payBand)).toBe("over_band")
    expect(getCompaRatio(payBand.midpointCents, payBand)).toBe(1)
  })
})
