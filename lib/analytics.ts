import type Database from "better-sqlite3"

export type DashboardSummary = {
  employeeCount: number
  activeCount: number
  countryCount: number
  departmentCount: number
  annualPayrollUsdCents: number
  monthlyPayrollUsdCents: number
  averageCompUsdCents: number
  medianCompUsdCents: number
  revisedLast90Days: number
}

export type PayrollBreakdownItem = {
  label: string
  employeeCount: number
  annualPayrollUsdCents: number
  averageCompUsdCents: number
}

export type TopEarner = {
  id: string
  employeeCode: string
  fullName: string
  department: string
  countryName: string
  totalCompUsdCents: number
}

export type DashboardAnalytics = {
  summary: DashboardSummary
  payrollByCountry: PayrollBreakdownItem[]
  payrollByDepartment: PayrollBreakdownItem[]
  topEarners: TopEarner[]
}

type BreakdownRow = {
  label: string
  employee_count: number
  annual_payroll_usd_cents: number
  average_comp_usd_cents: number
}

type TopEarnerRow = {
  id: string
  employee_code: string
  first_name: string
  last_name: string
  department: string
  country_name: string
  total_comp_usd_cents: number
}

export function getDashboardAnalytics(
  db: Database.Database,
): DashboardAnalytics {
  const summary = db
    .prepare(
      `
        SELECT
          COUNT(*) as employee_count,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
          COUNT(DISTINCT country_code) as country_count,
          COUNT(DISTINCT department) as department_count,
          SUM(total_comp_usd_cents) as annual_payroll_usd_cents,
          AVG(total_comp_usd_cents) as average_comp_usd_cents
        FROM employees
      `,
    )
    .get() as Record<string, number>

  const revisedLast90DaysRow = db
    .prepare(
      `
        SELECT COUNT(DISTINCT employee_id) as count
        FROM salary_revisions
        WHERE effective_date >= date('now', '-90 day')
      `,
    )
    .get() as { count?: number } | undefined
  const revisedLast90DaysCount = Number(revisedLast90DaysRow?.count ?? 0)

  const annualPayrollUsdCents = Number(summary.annual_payroll_usd_cents ?? 0)
  const averageCompUsdCents = Number(summary.average_comp_usd_cents ?? 0)

  return {
    summary: {
      employeeCount: Number(summary.employee_count ?? 0),
      activeCount: Number(summary.active_count ?? 0),
      countryCount: Number(summary.country_count ?? 0),
      departmentCount: Number(summary.department_count ?? 0),
      annualPayrollUsdCents,
      monthlyPayrollUsdCents: Math.round(annualPayrollUsdCents / 12),
      averageCompUsdCents,
      medianCompUsdCents: getMedianCompensation(db),
      revisedLast90Days: revisedLast90DaysCount,
    },
    payrollByCountry: db
      .prepare(
        `
          SELECT
            country_name as label,
            COUNT(*) as employee_count,
            SUM(total_comp_usd_cents) as annual_payroll_usd_cents,
            AVG(total_comp_usd_cents) as average_comp_usd_cents
          FROM employees
          GROUP BY country_name
          ORDER BY annual_payroll_usd_cents DESC
        `,
      )
      .all()
      .map((row) => row as BreakdownRow)
      .map(mapBreakdown),
    payrollByDepartment: db
      .prepare(
        `
          SELECT
            department as label,
            COUNT(*) as employee_count,
            SUM(total_comp_usd_cents) as annual_payroll_usd_cents,
            AVG(total_comp_usd_cents) as average_comp_usd_cents
          FROM employees
          GROUP BY department
          ORDER BY annual_payroll_usd_cents DESC
        `,
      )
      .all()
      .map((row) => row as BreakdownRow)
      .map(mapBreakdown),
    topEarners: db
      .prepare(
        `
          SELECT
            id,
            employee_code,
            first_name,
            last_name,
            department,
            country_name,
            total_comp_usd_cents
          FROM employees
          ORDER BY total_comp_usd_cents DESC
          LIMIT 5
        `,
      )
      .all()
      .map((row) => row as TopEarnerRow)
      .map((row) => ({
        id: String(row.id),
        employeeCode: String(row.employee_code),
        fullName: `${String(row.first_name)} ${String(row.last_name)}`,
        department: String(row.department),
        countryName: String(row.country_name),
        totalCompUsdCents: Number(row.total_comp_usd_cents),
      })),
  }
}

function getMedianCompensation(db: Database.Database) {
  const countRow = db
    .prepare("SELECT COUNT(*) as count FROM employees")
    .get() as { count?: number } | undefined
  const count = Number(countRow?.count ?? 0)

  if (count === 0) {
    return 0
  }

  const offset = Math.floor((count - 1) / 2)
  const medianRows = db
    .prepare(
      `
        SELECT total_comp_usd_cents
        FROM employees
        ORDER BY total_comp_usd_cents
        LIMIT 2 OFFSET ?
      `,
    )
    .all(offset) as { total_comp_usd_cents: number }[]

  if (count % 2 === 1) {
    return Number(medianRows[0]?.total_comp_usd_cents ?? 0)
  }

  const low = Number(medianRows[0]?.total_comp_usd_cents ?? 0)
  const high = Number(medianRows[1]?.total_comp_usd_cents ?? low)
  return Math.round((low + high) / 2)
}

function mapBreakdown(row: BreakdownRow): PayrollBreakdownItem {
  return {
    label: String(row.label),
    employeeCount: Number(row.employee_count ?? 0),
    annualPayrollUsdCents: Number(row.annual_payroll_usd_cents ?? 0),
    averageCompUsdCents: Number(row.average_comp_usd_cents ?? 0),
  }
}
