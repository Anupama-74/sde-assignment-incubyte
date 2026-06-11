import { randomUUID } from "node:crypto"

import type Database from "better-sqlite3"

import {
  type BandPosition,
  type PayBand,
  getBandPosition,
  getCompaRatio,
  getPayBand,
} from "./pay-bands.ts"
import { SORT_OPTIONS } from "./reference-data.ts"
import type { ListEmployeesInput, SalaryRevisionInput } from "./validation.ts"

export type EmployeeListItem = {
  id: string
  employeeCode: string
  fullName: string
  email: string
  department: string
  level: string
  countryCode: string
  countryName: string
  currencyCode: string
  employmentType: string
  baseSalaryCents: number
  bonusCents: number
  allowanceCents: number
  stockGrantCents: number
  totalCompCents: number
  totalCompUsdCents: number
  payBand: PayBand
  bandPosition: BandPosition
  compaRatio: number
  updatedAt: string
  status: string
}

export type SalaryRevisionRecord = {
  id: string
  effectiveDate: string
  reason: string
  changedBy: string
  changedAt: string
  previousBaseSalaryCents: number
  previousBonusCents: number
  previousAllowanceCents: number
  previousStockGrantCents: number
  newBaseSalaryCents: number
  newBonusCents: number
  newAllowanceCents: number
  newStockGrantCents: number
}

export type EmployeeDetail = EmployeeListItem & {
  hireDate: string
  managerName: string
  revisionHistory: SalaryRevisionRecord[]
}

export type EmployeeListResult = {
  items: EmployeeListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

type SalaryRevisionRow = {
  id: string
  effective_date: string
  reason: string
  changed_by: string
  changed_at: string
  previous_base_salary_cents: number
  previous_bonus_cents: number
  previous_allowance_cents: number
  previous_stock_grant_cents: number
  new_base_salary_cents: number
  new_bonus_cents: number
  new_allowance_cents: number
  new_stock_grant_cents: number
}

export function listEmployees(
  db: Database.Database,
  filters: ListEmployeesInput,
): EmployeeListResult {
  const whereClauses = ["1 = 1"]
  const params: Record<string, string | number> = {
    limit: filters.pageSize,
    offset: (filters.page - 1) * filters.pageSize,
  }

  if (filters.search) {
    whereClauses.push(
      "(employee_code LIKE @search OR first_name LIKE @search OR last_name LIKE @search OR email LIKE @search)",
    )
    params.search = `%${filters.search}%`
  }

  if (filters.country) {
    whereClauses.push("country_code = @country")
    params.country = filters.country
  }

  if (filters.department) {
    whereClauses.push("department = @department")
    params.department = filters.department
  }

  if (filters.level) {
    whereClauses.push("level = @level")
    params.level = filters.level
  }

  const whereStatement = whereClauses.join(" AND ")
  const orderBy = SORT_OPTIONS[filters.sort]

  const totalRow = db
    .prepare(`SELECT COUNT(*) as count FROM employees WHERE ${whereStatement}`)
    .get(params) as { count?: number } | undefined
  const total = Number(totalRow?.count ?? 0)
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize))
  const page = Math.min(filters.page, totalPages)
  params.offset = (page - 1) * filters.pageSize

  const rows = db
    .prepare(
      `
        SELECT
          id,
          employee_code,
          first_name,
          last_name,
          email,
          department,
          level,
          country_code,
          country_name,
          currency_code,
          employment_type,
          base_salary_cents,
          bonus_cents,
          allowance_cents,
          stock_grant_cents,
          total_comp_cents,
          total_comp_usd_cents,
          updated_at,
          status
        FROM employees
        WHERE ${whereStatement}
        ORDER BY ${orderBy}
        LIMIT @limit OFFSET @offset
      `,
    )
    .all(params)
    .map((row) => row as EmployeeRow)

  const items = rows.map(mapEmployeeListItem)
  return {
    items,
    total,
    page,
    pageSize: filters.pageSize,
    totalPages,
  }
}

export function getEmployeeById(
  db: Database.Database,
  employeeId: string,
): EmployeeDetail | null {
  const row = db
    .prepare(
      `
        SELECT
          id,
          employee_code,
          first_name,
          last_name,
          email,
          department,
          level,
          manager_name,
          country_code,
          country_name,
          currency_code,
          employment_type,
          base_salary_cents,
          bonus_cents,
          allowance_cents,
          stock_grant_cents,
          total_comp_cents,
          total_comp_usd_cents,
          hire_date,
          updated_at,
          status
        FROM employees
        WHERE id = ?
      `,
    )
    .get(employeeId) as EmployeeRow | undefined

  if (!row) {
    return null
  }

  const revisionHistory = db
    .prepare(
      `
        SELECT
          id,
          effective_date,
          reason,
          changed_by,
          changed_at,
          previous_base_salary_cents,
          previous_bonus_cents,
          previous_allowance_cents,
          previous_stock_grant_cents,
          new_base_salary_cents,
          new_bonus_cents,
          new_allowance_cents,
          new_stock_grant_cents
        FROM salary_revisions
        WHERE employee_id = ?
        ORDER BY effective_date DESC, changed_at DESC
      `,
    )
    .all(employeeId)
    .map((row) => row as SalaryRevisionRow)
    .map(mapRevision)

  return {
    ...mapEmployeeListItem(row),
    hireDate: row.hire_date,
    managerName: row.manager_name,
    revisionHistory,
  }
}

export function applySalaryRevision(
  db: Database.Database,
  employeeId: string,
  input: SalaryRevisionInput,
) {
  const employee = db
    .prepare(
      `
        SELECT *
        FROM employees
        WHERE id = ?
      `,
    )
    .get(employeeId) as EmployeeRow | undefined

  if (!employee) {
    throw new Error("Employee not found")
  }

  const nextBaseSalaryCents = toCents(input.baseSalary)
  const nextBonusCents = toCents(input.bonus)
  const nextAllowanceCents = toCents(input.allowance)
  const nextStockGrantCents = toCents(input.stockGrant)

  const unchanged =
    employee.base_salary_cents === nextBaseSalaryCents &&
    employee.bonus_cents === nextBonusCents &&
    employee.allowance_cents === nextAllowanceCents &&
    employee.stock_grant_cents === nextStockGrantCents

  if (unchanged) {
    throw new Error("Compensation is unchanged")
  }

  const totalCompCents =
    nextBaseSalaryCents +
    nextBonusCents +
    nextAllowanceCents +
    nextStockGrantCents
  const fxToUsd =
    employee.total_comp_cents === 0
      ? 1
      : employee.total_comp_usd_cents / employee.total_comp_cents
  const totalCompUsdCents = Math.round(totalCompCents * fxToUsd)
  const changedAt = new Date().toISOString()

  const transaction = db.transaction(() => {
    db.prepare(
      `
        INSERT INTO salary_revisions (
          id,
          employee_id,
          effective_date,
          reason,
          changed_by,
          changed_at,
          previous_base_salary_cents,
          previous_bonus_cents,
          previous_allowance_cents,
          previous_stock_grant_cents,
          new_base_salary_cents,
          new_bonus_cents,
          new_allowance_cents,
          new_stock_grant_cents
        ) VALUES (
          @id,
          @employeeId,
          @effectiveDate,
          @reason,
          @changedBy,
          @changedAt,
          @previousBaseSalaryCents,
          @previousBonusCents,
          @previousAllowanceCents,
          @previousStockGrantCents,
          @newBaseSalaryCents,
          @newBonusCents,
          @newAllowanceCents,
          @newStockGrantCents
        )
      `,
    ).run({
      id: randomUUID(),
      employeeId,
      effectiveDate: input.effectiveDate,
      reason: input.reason,
      changedBy: input.changedBy,
      changedAt,
      previousBaseSalaryCents: employee.base_salary_cents,
      previousBonusCents: employee.bonus_cents,
      previousAllowanceCents: employee.allowance_cents,
      previousStockGrantCents: employee.stock_grant_cents,
      newBaseSalaryCents: nextBaseSalaryCents,
      newBonusCents: nextBonusCents,
      newAllowanceCents: nextAllowanceCents,
      newStockGrantCents: nextStockGrantCents,
    })

    db.prepare(
      `
        UPDATE employees
        SET
          base_salary_cents = @baseSalaryCents,
          bonus_cents = @bonusCents,
          allowance_cents = @allowanceCents,
          stock_grant_cents = @stockGrantCents,
          total_comp_cents = @totalCompCents,
          total_comp_usd_cents = @totalCompUsdCents,
          updated_at = @updatedAt
        WHERE id = @employeeId
      `,
    ).run({
      employeeId,
      baseSalaryCents: nextBaseSalaryCents,
      bonusCents: nextBonusCents,
      allowanceCents: nextAllowanceCents,
      stockGrantCents: nextStockGrantCents,
      totalCompCents,
      totalCompUsdCents,
      updatedAt: changedAt,
    })
  })

  transaction()
  return getEmployeeById(db, employeeId)
}

type EmployeeRow = {
  id: string
  employee_code: string
  first_name: string
  last_name: string
  email: string
  department: string
  level: string
  manager_name: string
  country_code: string
  country_name: string
  currency_code: string
  employment_type: string
  base_salary_cents: number
  bonus_cents: number
  allowance_cents: number
  stock_grant_cents: number
  total_comp_cents: number
  total_comp_usd_cents: number
  hire_date: string
  updated_at: string
  status: string
}

function mapEmployeeListItem(row: EmployeeRow): EmployeeListItem {
  const payBand = getPayBand(row.country_code, row.level)

  return {
    id: row.id,
    employeeCode: row.employee_code,
    fullName: `${row.first_name} ${row.last_name}`,
    email: row.email,
    department: row.department,
    level: row.level,
    countryCode: row.country_code,
    countryName: row.country_name,
    currencyCode: row.currency_code,
    employmentType: row.employment_type,
    baseSalaryCents: row.base_salary_cents,
    bonusCents: row.bonus_cents,
    allowanceCents: row.allowance_cents,
    stockGrantCents: row.stock_grant_cents,
    totalCompCents: row.total_comp_cents,
    totalCompUsdCents: row.total_comp_usd_cents,
    payBand,
    bandPosition: getBandPosition(row.base_salary_cents, payBand),
    compaRatio: getCompaRatio(row.base_salary_cents, payBand),
    updatedAt: row.updated_at,
    status: row.status,
  }
}

function mapRevision(row: SalaryRevisionRow): SalaryRevisionRecord {
  return {
    id: String(row.id),
    effectiveDate: String(row.effective_date),
    reason: String(row.reason),
    changedBy: String(row.changed_by),
    changedAt: String(row.changed_at),
    previousBaseSalaryCents: Number(row.previous_base_salary_cents),
    previousBonusCents: Number(row.previous_bonus_cents),
    previousAllowanceCents: Number(row.previous_allowance_cents),
    previousStockGrantCents: Number(row.previous_stock_grant_cents),
    newBaseSalaryCents: Number(row.new_base_salary_cents),
    newBonusCents: Number(row.new_bonus_cents),
    newAllowanceCents: Number(row.new_allowance_cents),
    newStockGrantCents: Number(row.new_stock_grant_cents),
  }
}

function toCents(value: number) {
  return Math.round(value * 100)
}
