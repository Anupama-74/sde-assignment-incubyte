import Link from "next/link"

import type { EmployeeListResult } from "@/lib/employees"
import { formatCurrencyFromCents, formatDate } from "@/lib/format"
import type { ListEmployeesInput } from "@/lib/validation"

type EmployeeTableProps = {
  employees: EmployeeListResult
  filters: ListEmployeesInput
  selectedEmployeeId?: string
}

export function EmployeeTable({
  employees,
  filters,
  selectedEmployeeId,
}: EmployeeTableProps) {
  const pageStart = employees.total === 0 ? 0 : (employees.page - 1) * employees.pageSize + 1
  const pageEnd = Math.min(employees.page * employees.pageSize, employees.total)

  return (
    <section className="card tableCard">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">Employee directory</p>
          <h2>Compensation at workforce scale</h2>
        </div>
        <p className="muted">
          Showing {pageStart}-{pageEnd} of {employees.total}
        </p>
      </div>

      <div className="tableWrap">
        <table className="dataTable">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Country</th>
              <th>Annual local</th>
              <th>Annual USD</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {employees.items.map((employee) => {
              const href = buildHref(filters, {
                employeeId: employee.id,
                page: employees.page,
              })

              return (
                <tr
                  key={employee.id}
                  className={
                    selectedEmployeeId === employee.id ? "rowSelected" : undefined
                  }
                >
                  <td>
                    <Link className="tableLink" href={href}>
                      <span className="tablePrimary">{employee.fullName}</span>
                      <span className="tableSecondary">
                        {employee.employeeCode} · {employee.level}
                      </span>
                    </Link>
                  </td>
                  <td>{employee.department}</td>
                  <td>{employee.countryName}</td>
                  <td>
                    {formatCurrencyFromCents(
                      employee.totalCompCents,
                      employee.currencyCode,
                    )}
                  </td>
                  <td>{formatCurrencyFromCents(employee.totalCompUsdCents, "USD")}</td>
                  <td>{formatDate(employee.updatedAt)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <Link
          aria-disabled={employees.page <= 1}
          className="button buttonGhost"
          href={buildHref(filters, { page: Math.max(1, employees.page - 1) })}
        >
          Previous
        </Link>
        <p className="muted">
          Page {employees.page} of {employees.totalPages}
        </p>
        <Link
          aria-disabled={employees.page >= employees.totalPages}
          className="button buttonGhost"
          href={buildHref(filters, {
            page: Math.min(employees.totalPages, employees.page + 1),
          })}
        >
          Next
        </Link>
      </div>
    </section>
  )
}

function buildHref(
  filters: ListEmployeesInput,
  overrides: Record<string, string | number | undefined>,
) {
  const params = new URLSearchParams()
  const merged = { ...filters, ...overrides }

  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined || value === null || value === "") {
      continue
    }
    params.set(key, String(value))
  }

  return `/?${params.toString()}`
}
