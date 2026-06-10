import { getDashboardAnalytics } from "@/lib/analytics"
import { getBootstrappedDatabase } from "@/lib/bootstrap"
import { answerCompensationQuestion } from "@/lib/compensation-questions"
import { getEmployeeById, listEmployees } from "@/lib/employees"
import {
  formatCurrencyFromCents,
  formatNumber,
  formatZScore,
} from "@/lib/format"
import {
  parseCompensationQuestionInput,
  parseListEmployeesInput,
} from "@/lib/validation"

import { CompensationQuestionPanel } from "@/components/compensation-question-panel"
import { DistributionChart } from "@/components/distribution-chart"
import { EmployeeDetailPanel } from "@/components/employee-detail-panel"
import { EmployeeFilters } from "@/components/employee-filters"
import { EmployeeTable } from "@/components/employee-table"
import { EquityTable } from "@/components/equity-table"
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
  const question = String(normalizedSearchParams.question ?? "").trim()
  const db = getBootstrappedDatabase()
  const analytics = getDashboardAnalytics(db)
  const employees = listEmployees(db, filters)
  const selectedEmployeeId = filters.employeeId || employees.items[0]?.id || ""
  const selectedEmployee = selectedEmployeeId
    ? getEmployeeById(db, selectedEmployeeId)
    : null
  let parsedQuestion = ""
  try {
    parsedQuestion = question
      ? parseCompensationQuestionInput({ question }).question
      : ""
  } catch {
    parsedQuestion = ""
  }
  const questionAnswer = parsedQuestion
    ? answerCompensationQuestion(db, parsedQuestion)
    : null

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Incubyte SDE Assessment</p>
          <h1>CompLens turns salary records into compensation intelligence.</h1>
          <p className="heroCopy">
            The product is designed for the real HR job behind the assignment: keep compensation data reliable, then answer how a 10,000-person multinational organization actually pays people.
          </p>
        </div>
        <div className="heroPanel">
          <p className="eyebrow">What stands out here</p>
          <ul className="heroList">
            <li>Versioned compensation with timeline-friendly history</li>
            <li>Distribution, equity, and outlier analysis for HR decisions</li>
            <li>Smart compensation Q&amp;A without relying on an LLM</li>
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
        <StatCard
          caption="Highest annual total compensation in the current dataset"
          label="Highest salary"
          value={formatCurrencyFromCents(analytics.summary.highestCompUsdCents, "USD")}
        />
        <StatCard
          caption="Potential pay anomalies flagged via department z-scores"
          label="Outliers"
          value={formatNumber(analytics.summary.outlierCount)}
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

      <section className="insightsGrid">
        <DistributionChart buckets={analytics.salaryDistribution} />
        <CompensationQuestionPanel answer={questionAnswer} initialQuestion={question} />
      </section>

      <section className="insightsGrid">
        <EquityTable
          eyebrow="Pay equity by department"
          items={analytics.departmentEquity}
          title="Where pay bands diverge"
        />
        <EquityTable
          eyebrow="Pay equity by country"
          items={analytics.countryEquity}
          title="Cross-country compensation posture"
        />
      </section>

      <section className="insightsGrid">
        <article className="card">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Compensation outliers</p>
              <h2>Who deserves a closer pay review</h2>
            </div>
          </div>

          <div className="stack">
            {analytics.outliers.length === 0 ? (
              <p className="muted">No strong outliers were detected in the current seed set.</p>
            ) : (
              analytics.outliers.map((employee) => (
                <div className="breakdownRow" key={employee.id}>
                  <div>
                    <strong>{employee.fullName}</strong>
                    <p className="muted">
                      {employee.department} · {employee.countryName} · {employee.level}
                    </p>
                  </div>
                  <div className="breakdownValue">
                    <div>{formatCurrencyFromCents(employee.totalCompUsdCents, "USD")}</div>
                    <p className="muted">
                      {formatZScore(employee.zScore)} vs avg{" "}
                      {formatCurrencyFromCents(employee.departmentAverageUsdCents, "USD", true)}
                    </p>
                  </div>
                </div>
              ))
            )}
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
