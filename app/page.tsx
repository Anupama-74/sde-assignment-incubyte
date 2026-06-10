import { getDashboardAnalytics } from "@/lib/analytics"
import { getBootstrappedDatabase } from "@/lib/bootstrap"
import { getEmployeeById, listEmployees } from "@/lib/employees"
import { formatCurrencyFromCents } from "@/lib/format"
import { parseListEmployeesInput } from "@/lib/validation"

import { EmployeeDetailPanel } from "@/components/employee-detail-panel"
import { EmployeeFilters } from "@/components/employee-filters"
import { EmployeeTable } from "@/components/employee-table"
import { StatCard } from "@/components/stat-card"

export const dynamic = "force-dynamic"

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const rawSearchParams = (await searchParams) ?? {}
  const normalizedSearchParams = Object.fromEntries(
    Object.entries(rawSearchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] ?? "" : value ?? "",
    ]),
  )

  const filters = parseListEmployeesInput(normalizedSearchParams)
  const db = getBootstrappedDatabase()
  const analytics = getDashboardAnalytics(db)
  const employees = listEmployees(db, filters)
  const selectedEmployeeId = filters.employeeId || employees.items[0]?.id || ""
  const selectedEmployee = selectedEmployeeId
    ? getEmployeeById(db, selectedEmployeeId)
    : null

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Incubyte SDE Assessment</p>
          <h1>Salary management software for HR teams that have outgrown spreadsheets.</h1>
          <p className="heroCopy">
            ACME Pay Compass focuses on the two jobs that matter most for the brief:
            maintaining compensation safely and answering how the organization pays people across countries and teams.
          </p>
        </div>
        <div className="heroPanel">
          <p className="eyebrow">What stands out here</p>
          <ul className="heroList">
            <li>10,000 seeded employees across six countries</li>
            <li>Revision history for every salary change</li>
            <li>Analytics built for HR questions, not just CRUD</li>
          </ul>
        </div>
      </section>

      <section className="statsGrid">
        <StatCard
          caption={`${analytics.summary.activeCount.toLocaleString()} active employees tracked`}
          label="Headcount"
          value={analytics.summary.employeeCount.toLocaleString()}
        />
        <StatCard
          caption="Normalized into USD for global reporting"
          label="Annual payroll"
          value={formatCurrencyFromCents(
            analytics.summary.annualPayrollUsdCents,
            "USD",
            true,
          )}
        />
        <StatCard
          caption="Cross-country compensation midpoint"
          label="Median compensation"
          value={formatCurrencyFromCents(analytics.summary.medianCompUsdCents, "USD")}
        />
        <StatCard
          caption={`Across ${analytics.summary.countryCount.toLocaleString()} countries and ${analytics.summary.departmentCount.toLocaleString()} departments`}
          label="Recent changes"
          value={analytics.summary.revisedLast90Days.toLocaleString()}
        />
      </section>

      <section className="analyticsGrid">
        <article className="card">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Payroll by country</p>
              <h2>Where money is concentrated</h2>
            </div>
          </div>
          <div className="stack">
            {analytics.payrollByCountry.map((item) => (
              <div className="breakdownRow" key={item.label}>
                <div>
                  <strong>{item.label}</strong>
                  <p className="muted">{item.employeeCount.toLocaleString()} employees</p>
                </div>
                <div className="breakdownValue">
                  {formatCurrencyFromCents(item.annualPayrollUsdCents, "USD", true)}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Payroll by department</p>
              <h2>Which teams cost the most</h2>
            </div>
          </div>
          <div className="stack">
            {analytics.payrollByDepartment.slice(0, 6).map((item) => (
              <div className="breakdownRow" key={item.label}>
                <div>
                  <strong>{item.label}</strong>
                  <p className="muted">
                    Avg {formatCurrencyFromCents(item.averageCompUsdCents, "USD", true)}
                  </p>
                </div>
                <div className="breakdownValue">
                  {formatCurrencyFromCents(item.annualPayrollUsdCents, "USD", true)}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Top earners</p>
              <h2>Compensation outliers</h2>
            </div>
          </div>
          <div className="stack">
            {analytics.topEarners.map((employee) => (
              <div className="breakdownRow" key={employee.id}>
                <div>
                  <strong>{employee.fullName}</strong>
                  <p className="muted">
                    {employee.department} · {employee.countryName}
                  </p>
                </div>
                <div className="breakdownValue">
                  {formatCurrencyFromCents(employee.totalCompUsdCents, "USD")}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <EmployeeFilters filters={filters} />

      <section className="workspaceGrid">
        <EmployeeTable
          employees={employees}
          filters={filters}
          selectedEmployeeId={selectedEmployee?.id}
        />
        <EmployeeDetailPanel employee={selectedEmployee} />
      </section>
    </main>
  )
}
