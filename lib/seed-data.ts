import type Database from "better-sqlite3"

import {
  COUNTRIES,
  DEPARTMENTS,
  EMPLOYMENT_TYPES,
  LEVELS,
} from "./reference-data.ts"

type SeedOptions = {
  employeeCount?: number
  reset?: boolean
}

const firstNames = [
  "Aarav",
  "Aanya",
  "Aisha",
  "Amelia",
  "Arjun",
  "Camila",
  "Daniel",
  "Emma",
  "Ethan",
  "Fatima",
  "Harper",
  "Isha",
  "Jules",
  "Kabir",
  "Liam",
  "Lucas",
  "Maya",
  "Mia",
  "Noah",
  "Olivia",
  "Rafael",
  "Riya",
  "Saanvi",
  "Sophia",
  "Vihaan",
]

const lastNames = [
  "Anderson",
  "Banerjee",
  "Brown",
  "Chen",
  "Clark",
  "Costa",
  "Garcia",
  "Ghosh",
  "Gupta",
  "Iyer",
  "Johnson",
  "Khan",
  "Lee",
  "Mehta",
  "Miller",
  "Morris",
  "Patel",
  "Rao",
  "Silva",
  "Singh",
  "Smith",
  "Taylor",
  "Williams",
  "Wilson",
  "Wright",
]

const departmentPremiums: Record<string, number> = {
  Engineering: 1.16,
  Product: 1.12,
  Design: 1.02,
  Sales: 1.1,
  Marketing: 1,
  Finance: 1.04,
  "People Operations": 0.94,
  "Customer Success": 0.92,
  Operations: 0.9,
}

export type SeedResult = {
  employeesInserted: number
  revisionsInserted: number
}

type GeneratedEmployee = {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  email: string
  department: string
  level: string
  managerName: string
  countryCode: string
  countryName: string
  currencyCode: string
  employmentType: string
  baseSalaryCents: number
  bonusCents: number
  allowanceCents: number
  totalCompCents: number
  totalCompUsdCents: number
  hireDate: string
  status: string
  updatedAt: string
}

type GeneratedRevision = {
  id: string
  employeeId: string
  effectiveDate: string
  reason: string
  changedBy: string
  changedAt: string
  previousBaseSalaryCents: number
  previousBonusCents: number
  previousAllowanceCents: number
  newBaseSalaryCents: number
  newBonusCents: number
  newAllowanceCents: number
}

export function seedDatabase(
  db: Database.Database,
  options: SeedOptions = {},
): SeedResult {
  const employeeCount = options.employeeCount ?? 10_000
  const reset = options.reset ?? true
  const rng = createSeededRandom(42)

  if (reset) {
    db.exec("DELETE FROM salary_revisions; DELETE FROM employees;")
  }

  const employees: GeneratedEmployee[] = []
  const revisions: GeneratedRevision[] = []

  for (let index = 1; index <= employeeCount; index += 1) {
    const employee = buildEmployee(index, rng)
    employees.push(employee)
    revisions.push(...buildRevisionHistory(employee, rng))
  }

  const insertEmployees = db.prepare(`
    INSERT INTO employees (
      id, employee_code, first_name, last_name, email, department, level,
      manager_name, country_code, country_name, currency_code, employment_type,
      base_salary_cents, bonus_cents, allowance_cents, total_comp_cents,
      total_comp_usd_cents, hire_date, status, updated_at
    ) VALUES (
      @id, @employeeCode, @firstName, @lastName, @email, @department, @level,
      @managerName, @countryCode, @countryName, @currencyCode, @employmentType,
      @baseSalaryCents, @bonusCents, @allowanceCents, @totalCompCents,
      @totalCompUsdCents, @hireDate, @status, @updatedAt
    )
  `)

  const insertRevisions = db.prepare(`
    INSERT INTO salary_revisions (
      id, employee_id, effective_date, reason, changed_by, changed_at,
      previous_base_salary_cents, previous_bonus_cents, previous_allowance_cents,
      new_base_salary_cents, new_bonus_cents, new_allowance_cents
    ) VALUES (
      @id, @employeeId, @effectiveDate, @reason, @changedBy, @changedAt,
      @previousBaseSalaryCents, @previousBonusCents, @previousAllowanceCents,
      @newBaseSalaryCents, @newBonusCents, @newAllowanceCents
    )
  `)

  const transaction = db.transaction(() => {
    for (const employee of employees) {
      insertEmployees.run(employee)
    }
    for (const revision of revisions) {
      insertRevisions.run(revision)
    }
  })

  transaction()

  return {
    employeesInserted: employees.length,
    revisionsInserted: revisions.length,
  }
}

function buildEmployee(
  index: number,
  rng: () => number,
): GeneratedEmployee {
  const country = pick(COUNTRIES, rng)
  const department = pick(DEPARTMENTS, rng)
  const level = pick(LEVELS, rng)
  const employmentType = pick(EMPLOYMENT_TYPES, rng)
  const firstName = pick(firstNames, rng)
  const lastName = pick(lastNames, rng)
  const managerName = `${pick(firstNames, rng)} ${pick(lastNames, rng)}`

  const baseSalary =
    interpolate(country.baseSalaryRange, rng) *
    level.multiplier *
    departmentPremiums[department]
  const roundedBaseSalary = Math.round(baseSalary / 500) * 500
  const allowance = Math.round(interpolate(country.allowanceRange, rng) / 100) * 100
  const bonusRate = interpolate(country.bonusRateRange, rng)
  const bonus = Math.round(roundedBaseSalary * bonusRate)
  const totalComp = roundedBaseSalary + allowance + bonus
  const totalCompUsd = Math.round(totalComp * country.fxToUsd)
  const employeeCode = `ACME-${String(index).padStart(5, "0")}`
  const email = `${firstName}.${lastName}.${index}@acme.example`.toLowerCase()
  const hireDate = randomDate(rng, new Date("2016-01-01"), new Date("2025-03-31"))
  const updatedAt = randomDateTime(rng, new Date("2025-01-01"), new Date("2026-04-30"))

  return {
    id: `emp-${String(index).padStart(5, "0")}`,
    employeeCode,
    firstName,
    lastName,
    email,
    department,
    level: level.name,
    managerName,
    countryCode: country.code,
    countryName: country.name,
    currencyCode: country.currency,
    employmentType,
    baseSalaryCents: roundedBaseSalary * 100,
    bonusCents: bonus * 100,
    allowanceCents: allowance * 100,
    totalCompCents: totalComp * 100,
    totalCompUsdCents: totalCompUsd * 100,
    hireDate,
    status: rng() > 0.03 ? "active" : "leave",
    updatedAt,
  }
}

function buildRevisionHistory(
  employee: GeneratedEmployee,
  rng: () => number,
): GeneratedRevision[] {
  const revisionCount = rng() > 0.45 ? 1 : 0
  if (revisionCount === 0) {
    return []
  }

  const previousBaseSalaryCents = Math.round(employee.baseSalaryCents * 0.91)
  const previousBonusCents = Math.round(employee.bonusCents * 0.88)
  const previousAllowanceCents = Math.round(employee.allowanceCents * 0.96)

  return [
    {
      id: `${employee.id}-rev-1`,
      employeeId: employee.id,
      effectiveDate: randomDate(
        rng,
        new Date("2025-04-01"),
        new Date("2026-04-15"),
      ),
      reason:
        rng() > 0.6 ? "Annual compensation review" : "Market correction and retention",
      changedBy: "Compensation Partner",
      changedAt: randomDateTime(
        rng,
        new Date("2025-04-01"),
        new Date("2026-04-20"),
      ),
      previousBaseSalaryCents,
      previousBonusCents,
      previousAllowanceCents,
      newBaseSalaryCents: employee.baseSalaryCents,
      newBonusCents: employee.bonusCents,
      newAllowanceCents: employee.allowanceCents,
    },
  ]
}

function pick<T>(list: readonly T[], rng: () => number): T {
  return list[Math.floor(rng() * list.length)]!
}

function interpolate(
  [min, max]: [number, number],
  rng: () => number,
): number {
  return min + (max - min) * rng()
}

function randomDate(rng: () => number, from: Date, to: Date) {
  const timestamp = from.getTime() + (to.getTime() - from.getTime()) * rng()
  return new Date(timestamp).toISOString().slice(0, 10)
}

function randomDateTime(rng: () => number, from: Date, to: Date) {
  const timestamp = from.getTime() + (to.getTime() - from.getTime()) * rng()
  return new Date(timestamp).toISOString()
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 4294967296
  }
}
