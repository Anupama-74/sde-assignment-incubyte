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
  highestCompUsdCents: number
  lowestCompUsdCents: number
  revisedLast90Days: number
  outlierCount: number
}

export type PayrollBreakdownItem = {
  label: string
  employeeCount: number
  annualPayrollUsdCents: number
  averageCompUsdCents: number
}

export type SalaryDistributionBucket = {
  label: string
  employeeCount: number
  annualPayrollUsdCents: number
}

export type EquityBreakdownItem = {
  label: string
  employeeCount: number
  averageCompUsdCents: number
  medianCompUsdCents: number
  highestCompUsdCents: number
  lowestCompUsdCents: number
}

export type TopEarner = {
  id: string
  employeeCode: string
  fullName: string
  department: string
  countryName: string
  totalCompUsdCents: number
}

export type CompensationOutlier = {
  id: string
  employeeCode: string
  fullName: string
  department: string
  countryName: string
  level: string
  totalCompUsdCents: number
  departmentAverageUsdCents: number
  zScore: number
}

export type CompensationSnapshot = {
  id: string
  employeeCode: string
  fullName: string
  department: string
  countryCode: string
  countryName: string
  level: string
  totalCompUsdCents: number
}

export type DashboardAnalytics = {
  summary: DashboardSummary
  payrollByCountry: PayrollBreakdownItem[]
  payrollByDepartment: PayrollBreakdownItem[]
  salaryDistribution: SalaryDistributionBucket[]
  departmentEquity: EquityBreakdownItem[]
  countryEquity: EquityBreakdownItem[]
  topEarners: TopEarner[]
  outliers: CompensationOutlier[]
}

type BreakdownRow = {
  label: string
  employee_count: number
  annual_payroll_usd_cents: number
  average_comp_usd_cents: number
}

type SummaryRow = {
  employee_count?: number
  active_count?: number
  country_count?: number
  department_count?: number
  annual_payroll_usd_cents?: number
  average_comp_usd_cents?: number
  highest_comp_usd_cents?: number
  lowest_comp_usd_cents?: number
}

type CompensationRow = {
  id: string
  employee_code: string
  first_name: string
  last_name: string
  department: string
  country_code: string
  country_name: string
  level: string
  total_comp_usd_cents: number
}

const DISTRIBUTION_BUCKETS = [
  { label: "Under $50k", min: 0, maxExclusive: 5_000_000 },
  { label: "$50k-$100k", min: 5_000_000, maxExclusive: 10_000_000 },
  { label: "$100k-$150k", min: 10_000_000, maxExclusive: 15_000_000 },
  { label: "$150k-$250k", min: 15_000_000, maxExclusive: 25_000_000 },
  { label: "$250k+", min: 25_000_000, maxExclusive: Number.POSITIVE_INFINITY },
] as const

export function getDashboardAnalytics(
  db: Database.Database,
): DashboardAnalytics {
  const summaryRow = db
    .prepare(
      `
        SELECT
          COUNT(*) as employee_count,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
          COUNT(DISTINCT country_code) as country_count,
          COUNT(DISTINCT department) as department_count,
          SUM(total_comp_usd_cents) as annual_payroll_usd_cents,
          AVG(total_comp_usd_cents) as average_comp_usd_cents,
          MAX(total_comp_usd_cents) as highest_comp_usd_cents,
          MIN(total_comp_usd_cents) as lowest_comp_usd_cents
        FROM employees
      `,
    )
    .get() as SummaryRow | undefined

  const revisedLast90DaysRow = db
    .prepare(
      `
        SELECT COUNT(DISTINCT employee_id) as count
        FROM salary_revisions
        WHERE effective_date >= date('now', '-90 day')
      `,
    )
    .get() as { count?: number } | undefined

  const snapshots = getCompensationSnapshots(db)
  const outliers = detectCompensationOutliers(snapshots)

  const annualPayrollUsdCents = Number(summaryRow?.annual_payroll_usd_cents ?? 0)
  const averageCompUsdCents = Number(summaryRow?.average_comp_usd_cents ?? 0)

  return {
    summary: {
      employeeCount: Number(summaryRow?.employee_count ?? 0),
      activeCount: Number(summaryRow?.active_count ?? 0),
      countryCount: Number(summaryRow?.country_count ?? 0),
      departmentCount: Number(summaryRow?.department_count ?? 0),
      annualPayrollUsdCents,
      monthlyPayrollUsdCents: Math.round(annualPayrollUsdCents / 12),
      averageCompUsdCents,
      medianCompUsdCents: computeMedian(
        snapshots.map((employee) => employee.totalCompUsdCents),
      ),
      highestCompUsdCents: Number(summaryRow?.highest_comp_usd_cents ?? 0),
      lowestCompUsdCents: Number(summaryRow?.lowest_comp_usd_cents ?? 0),
      revisedLast90Days: Number(revisedLast90DaysRow?.count ?? 0),
      outlierCount: outliers.length,
    },
    payrollByCountry: queryPayrollBreakdown(db, "country_name"),
    payrollByDepartment: queryPayrollBreakdown(db, "department"),
    salaryDistribution: buildSalaryDistribution(snapshots),
    departmentEquity: buildEquityBreakdown(snapshots, "department"),
    countryEquity: buildEquityBreakdown(snapshots, "countryName"),
    topEarners: snapshots
      .slice()
      .sort((left, right) => right.totalCompUsdCents - left.totalCompUsdCents)
      .slice(0, 5)
      .map((employee) => ({
        id: employee.id,
        employeeCode: employee.employeeCode,
        fullName: employee.fullName,
        department: employee.department,
        countryName: employee.countryName,
        totalCompUsdCents: employee.totalCompUsdCents,
      })),
    outliers,
  }
}

export function getCompensationSnapshots(db: Database.Database): CompensationSnapshot[] {
  return db
    .prepare(
      `
        SELECT
          id,
          employee_code,
          first_name,
          last_name,
          department,
          country_code,
          country_name,
          level,
          total_comp_usd_cents
        FROM employees
      `,
    )
    .all()
    .map((row) => row as CompensationRow)
    .map((row) => ({
      id: row.id,
      employeeCode: row.employee_code,
      fullName: `${row.first_name} ${row.last_name}`,
      department: row.department,
      countryCode: row.country_code,
      countryName: row.country_name,
      level: row.level,
      totalCompUsdCents: row.total_comp_usd_cents,
    }))
}

export function detectCompensationOutliers(
  snapshots: CompensationSnapshot[],
): CompensationOutlier[] {
  const grouped = groupBy(snapshots, (employee) => employee.department)

  return [...grouped.entries()]
    .flatMap(([department, employees]) => {
      if (employees.length < 8) {
        return []
      }

      const values = employees.map((employee) => employee.totalCompUsdCents)
      const average = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
      const variance =
        values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length
      const stdDeviation = Math.sqrt(variance)

      if (stdDeviation === 0) {
        return []
      }

      return employees
        .map((employee) => ({
          ...employee,
          zScore: Number(
            ((employee.totalCompUsdCents - average) / stdDeviation).toFixed(2),
          ),
          departmentAverageUsdCents: average,
        }))
        .filter((employee) => employee.zScore >= 2.1)
        .map((employee) => ({
          id: employee.id,
          employeeCode: employee.employeeCode,
          fullName: employee.fullName,
          department,
          countryName: employee.countryName,
          level: employee.level,
          totalCompUsdCents: employee.totalCompUsdCents,
          departmentAverageUsdCents: employee.departmentAverageUsdCents,
          zScore: employee.zScore,
        }))
    })
    .sort((left, right) => right.zScore - left.zScore)
    .slice(0, 8)
}

function queryPayrollBreakdown(
  db: Database.Database,
  column: "country_name" | "department",
): PayrollBreakdownItem[] {
  return db
    .prepare(
      `
        SELECT
          ${column} as label,
          COUNT(*) as employee_count,
          SUM(total_comp_usd_cents) as annual_payroll_usd_cents,
          AVG(total_comp_usd_cents) as average_comp_usd_cents
        FROM employees
        GROUP BY ${column}
        ORDER BY annual_payroll_usd_cents DESC
      `,
    )
    .all()
    .map((row) => row as BreakdownRow)
    .map((row) => ({
      label: row.label,
      employeeCount: row.employee_count,
      annualPayrollUsdCents: row.annual_payroll_usd_cents,
      averageCompUsdCents: row.average_comp_usd_cents,
    }))
}

function buildSalaryDistribution(
  snapshots: CompensationSnapshot[],
): SalaryDistributionBucket[] {
  return DISTRIBUTION_BUCKETS.map((bucket) => {
    const employees = snapshots.filter(
      (employee) =>
        employee.totalCompUsdCents >= bucket.min &&
        employee.totalCompUsdCents < bucket.maxExclusive,
    )

    return {
      label: bucket.label,
      employeeCount: employees.length,
      annualPayrollUsdCents: employees.reduce(
        (sum, employee) => sum + employee.totalCompUsdCents,
        0,
      ),
    }
  })
}

function buildEquityBreakdown(
  snapshots: CompensationSnapshot[],
  groupKey: "department" | "countryName",
): EquityBreakdownItem[] {
  const grouped = groupBy(snapshots, (employee) => employee[groupKey])

  return [...grouped.entries()]
    .map(([label, employees]) => {
      const values = employees
        .map((employee) => employee.totalCompUsdCents)
        .sort((left, right) => left - right)

      return {
        label,
        employeeCount: employees.length,
        averageCompUsdCents: Math.round(
          values.reduce((sum, value) => sum + value, 0) / values.length,
        ),
        medianCompUsdCents: computeMedian(values),
        highestCompUsdCents: values.at(-1) ?? 0,
        lowestCompUsdCents: values[0] ?? 0,
      }
    })
    .sort((left, right) => right.averageCompUsdCents - left.averageCompUsdCents)
}

function computeMedian(values: number[]) {
  if (values.length === 0) {
    return 0
  }

  const sorted = values.slice().sort((left, right) => left - right)
  const midpoint = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 1) {
    return sorted[midpoint] ?? 0
  }

  const low = sorted[midpoint - 1] ?? 0
  const high = sorted[midpoint] ?? 0
  return Math.round((low + high) / 2)
}

function groupBy<T>(
  items: T[],
  getKey: (item: T) => string,
) {
  const grouped = new Map<string, T[]>()

  for (const item of items) {
    const key = getKey(item)
    const existing = grouped.get(key)

    if (existing) {
      existing.push(item)
      continue
    }

    grouped.set(key, [item])
  }

  return grouped
}
