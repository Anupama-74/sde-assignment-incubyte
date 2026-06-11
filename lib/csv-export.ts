import type { EmployeeListItem } from "./employees.ts"
import { formatBandPositionLabel } from "./pay-bands.ts"

export function buildEmployeesCsv(items: EmployeeListItem[]) {
  const headers = [
    "employee_code",
    "full_name",
    "email",
    "department",
    "country",
    "level",
    "currency",
    "base_salary",
    "bonus",
    "allowance",
    "stock_grant",
    "total_compensation",
    "total_compensation_usd",
    "band_min",
    "band_midpoint",
    "band_max",
    "compa_ratio_percent",
    "band_position",
    "updated_at",
  ]

  const rows = items.map((employee) => [
    employee.employeeCode,
    employee.fullName,
    employee.email,
    employee.department,
    employee.countryName,
    employee.level,
    employee.currencyCode,
    toMoney(employee.baseSalaryCents),
    toMoney(employee.bonusCents),
    toMoney(employee.allowanceCents),
    toMoney(employee.stockGrantCents),
    toMoney(employee.totalCompCents),
    toMoney(employee.totalCompUsdCents),
    toMoney(employee.payBand.minCents),
    toMoney(employee.payBand.midpointCents),
    toMoney(employee.payBand.maxCents),
    (employee.compaRatio * 100).toFixed(2),
    formatBandPositionLabel(employee.bandPosition),
    employee.updatedAt,
  ])

  return [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n")
}

function toMoney(cents: number) {
  return (cents / 100).toFixed(2)
}

function escapeCsvValue(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }

  return value
}
