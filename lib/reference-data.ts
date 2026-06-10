export type CountryConfig = {
  code: string
  name: string
  currency: string
  fxToUsd: number
  baseSalaryRange: [number, number]
  allowanceRange: [number, number]
  bonusRateRange: [number, number]
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: "IN",
    name: "India",
    currency: "INR",
    fxToUsd: 0.012,
    baseSalaryRange: [1_000_000, 3_500_000],
    allowanceRange: [75_000, 300_000],
    bonusRateRange: [0.06, 0.18],
  },
  {
    code: "US",
    name: "United States",
    currency: "USD",
    fxToUsd: 1,
    baseSalaryRange: [75_000, 230_000],
    allowanceRange: [3_000, 15_000],
    bonusRateRange: [0.08, 0.22],
  },
  {
    code: "GB",
    name: "United Kingdom",
    currency: "GBP",
    fxToUsd: 1.27,
    baseSalaryRange: [45_000, 140_000],
    allowanceRange: [2_000, 12_000],
    bonusRateRange: [0.08, 0.2],
  },
  {
    code: "DE",
    name: "Germany",
    currency: "EUR",
    fxToUsd: 1.09,
    baseSalaryRange: [55_000, 150_000],
    allowanceRange: [2_500, 10_000],
    bonusRateRange: [0.07, 0.18],
  },
  {
    code: "SG",
    name: "Singapore",
    currency: "SGD",
    fxToUsd: 0.74,
    baseSalaryRange: [55_000, 190_000],
    allowanceRange: [2_000, 10_000],
    bonusRateRange: [0.09, 0.2],
  },
  {
    code: "BR",
    name: "Brazil",
    currency: "BRL",
    fxToUsd: 0.18,
    baseSalaryRange: [120_000, 420_000],
    allowanceRange: [6_000, 35_000],
    bonusRateRange: [0.05, 0.16],
  },
]

export const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "Sales",
  "Marketing",
  "Finance",
  "People Operations",
  "Customer Success",
  "Operations",
] as const

export const LEVELS = [
  { name: "L1", multiplier: 0.82 },
  { name: "L2", multiplier: 0.95 },
  { name: "L3", multiplier: 1.08 },
  { name: "L4", multiplier: 1.24 },
  { name: "L5", multiplier: 1.42 },
  { name: "L6", multiplier: 1.7 },
  { name: "L7", multiplier: 2.02 },
] as const

export const EMPLOYMENT_TYPES = [
  "Full-time",
  "Contractor",
  "Part-time",
] as const

export const SORT_OPTIONS = {
  updated_desc: "updated_at DESC, employee_code ASC",
  compensation_desc: "total_comp_usd_cents DESC, employee_code ASC",
  compensation_asc: "total_comp_usd_cents ASC, employee_code ASC",
  name_asc: "last_name ASC, first_name ASC",
  country_asc: "country_name ASC, total_comp_usd_cents DESC",
} as const

export type EmployeeSort = keyof typeof SORT_OPTIONS

export function getCountryByCode(code: string) {
  return COUNTRIES.find((country) => country.code === code)
}
