import type { SalaryDistributionBucket } from "@/lib/analytics"
import { formatCurrencyFromCents, formatNumber } from "@/lib/format"

type DistributionChartProps = {
  buckets: SalaryDistributionBucket[]
}

export function DistributionChart({ buckets }: DistributionChartProps) {
  const maxCount = Math.max(...buckets.map((bucket) => bucket.employeeCount), 1)

  return (
    <article className="card">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">Salary distribution</p>
          <h2>How compensation is spread</h2>
        </div>
      </div>

      <div className="stack">
        {buckets.map((bucket) => (
          <div className="distributionRow" key={bucket.label}>
            <div className="distributionMeta">
              <strong>{bucket.label}</strong>
              <p className="muted">{formatNumber(bucket.employeeCount)} employees</p>
            </div>
            <div className="distributionBarTrack">
              <div
                className="distributionBarFill"
                style={{ width: `${Math.max((bucket.employeeCount / maxCount) * 100, 6)}%` }}
              />
            </div>
            <div className="distributionValue">
              {formatCurrencyFromCents(bucket.annualPayrollUsdCents, "USD", true)}
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}
