import type { EmployeeDetail } from "@/lib/employees"
import { formatCurrencyFromCents, formatDate } from "@/lib/format"

import { SalaryRevisionForm } from "@/components/salary-revision-form"

type EmployeeDetailPanelProps = {
  employee: EmployeeDetail | null
}

export function EmployeeDetailPanel({ employee }: EmployeeDetailPanelProps) {
  if (!employee) {
    return (
      <aside className="card detailCard">
        <p className="eyebrow">Employee details</p>
        <h2>Select an employee</h2>
        <p className="muted">
          Pick a row from the table to inspect compensation details and record a revision.
        </p>
      </aside>
    )
  }

  return (
    <aside className="card detailCard">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">Employee details</p>
          <h2>{employee.fullName}</h2>
        </div>
        <span className="statusPill">{employee.status}</span>
      </div>

      <div className="detailMeta">
        <p>
          <strong>{employee.employeeCode}</strong> · {employee.department} · {employee.level}
        </p>
        <p className="muted">{employee.email}</p>
        <p className="muted">
          {employee.countryName} · {employee.employmentType} · Manager {employee.managerName}
        </p>
        <p className="muted">Joined {formatDate(employee.hireDate)}</p>
      </div>

      <div className="compCardGrid">
        <article className="miniCard">
          <p className="eyebrow">Base</p>
          <h3>{formatCurrencyFromCents(employee.baseSalaryCents, employee.currencyCode)}</h3>
        </article>
        <article className="miniCard">
          <p className="eyebrow">Bonus</p>
          <h3>{formatCurrencyFromCents(employee.bonusCents, employee.currencyCode)}</h3>
        </article>
        <article className="miniCard">
          <p className="eyebrow">Allowance</p>
          <h3>{formatCurrencyFromCents(employee.allowanceCents, employee.currencyCode)}</h3>
        </article>
      </div>

      <article className="highlightCard">
        <p className="eyebrow">Annual total compensation</p>
        <h3>{formatCurrencyFromCents(employee.totalCompCents, employee.currencyCode)}</h3>
        <p className="muted">
          Normalized as {formatCurrencyFromCents(employee.totalCompUsdCents, "USD")} for cross-country reporting
        </p>
      </article>

      <section>
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">Update compensation</p>
            <h3>Record a salary change</h3>
          </div>
        </div>
        <SalaryRevisionForm
          allowance={employee.allowanceCents / 100}
          baseSalary={employee.baseSalaryCents / 100}
          bonus={employee.bonusCents / 100}
          employeeId={employee.id}
        />
      </section>

      <section>
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">Revision history</p>
            <h3>Change log</h3>
          </div>
        </div>

        <div className="timeline">
          {employee.revisionHistory.length === 0 ? (
            <p className="muted">No revisions recorded yet.</p>
          ) : (
            employee.revisionHistory.map((revision) => (
              <article className="timelineItem" key={revision.id}>
                <div className="timelineTopline">
                  <strong>{formatDate(revision.effectiveDate)}</strong>
                  <span className="muted">{revision.changedBy}</span>
                </div>
                <p>{revision.reason}</p>
                <p className="muted">
                  Base {formatCurrencyFromCents(revision.previousBaseSalaryCents, employee.currencyCode)}
                  {" → "}
                  {formatCurrencyFromCents(revision.newBaseSalaryCents, employee.currencyCode)}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </aside>
  )
}
