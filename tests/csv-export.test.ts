import { describe, expect, it } from "vitest"

import { buildEmployeesCsv } from "@/lib/csv-export"

describe("csv export", () => {
  it("includes compensation and pay-band columns for exported employees", () => {
    const csv = buildEmployeesCsv([
      {
        id: "emp-1",
        employeeCode: "ACME-00001",
        fullName: "Maya Patel",
        email: "maya@acme.example",
        department: "Engineering",
        level: "L4",
        countryCode: "US",
        countryName: "United States",
        currencyCode: "USD",
        employmentType: "Full-time",
        baseSalaryCents: 15_000_000,
        bonusCents: 1_500_000,
        allowanceCents: 250_000,
        stockGrantCents: 2_000_000,
        totalCompCents: 18_750_000,
        totalCompUsdCents: 18_750_000,
        payBand: {
          countryCode: "US",
          currencyCode: "USD",
          level: "L4",
          minCents: 9_300_000,
          midpointCents: 18_910_000,
          maxCents: 28_520_000,
          minUsdCents: 9_300_000,
          midpointUsdCents: 18_910_000,
          maxUsdCents: 28_520_000,
        },
        bandPosition: "within_band",
        compaRatio: 0.793,
        updatedAt: "2026-06-01T00:00:00.000Z",
        status: "active",
      },
    ])

    expect(csv).toContain("compa_ratio_percent")
    expect(csv).toContain("band_position")
    expect(csv).toContain("79.30")
    expect(csv).toContain("Within band")
  })
})
