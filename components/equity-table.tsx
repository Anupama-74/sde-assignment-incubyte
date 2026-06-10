import type { EquityBreakdownItem } from "@/lib/analytics"
import { formatCurrencyFromCents } from "@/lib/format"

type EquityTableProps = {
  title: string
  eyebrow: string
  items: EquityBreakdownItem[]
}

export function EquityTable({ title, eyebrow, items }: EquityTableProps) {
  return (
    <article className="card">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
      </div>

      <div className="tableWrap">
        <table className="dataTable compactTable">
          <thead>
            <tr>
              <th>Group</th>
              <th>Average</th>
              <th>Median</th>
              <th>Range</th>
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 6).map((item) => (
              <tr key={item.label}>
                <td>
                  <span className="tablePrimary">{item.label}</span>
                  <span className="tableSecondary">
                    {item.employeeCount.toLocaleString()} employees
                  </span>
                </td>
                <td>{formatCurrencyFromCents(item.averageCompUsdCents, "USD", true)}</td>
                <td>{formatCurrencyFromCents(item.medianCompUsdCents, "USD", true)}</td>
                <td>
                  {formatCurrencyFromCents(item.lowestCompUsdCents, "USD", true)} -{" "}
                  {formatCurrencyFromCents(item.highestCompUsdCents, "USD", true)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}
