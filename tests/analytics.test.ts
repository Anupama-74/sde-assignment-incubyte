import { describe, expect, it } from "vitest"

import { getDashboardAnalytics } from "@/lib/analytics"
import { createInMemoryDatabase } from "@/lib/db"

describe("analytics service", () => {
  it("computes payroll summary and breakdowns", () => {
    const db = createInMemoryDatabase()
    db.exec(`
      INSERT INTO employees (
        id, employee_code, first_name, last_name, email, department, level,
        manager_name, country_code, country_name, currency_code, employment_type,
        base_salary_cents, bonus_cents, allowance_cents, total_comp_cents,
        total_comp_usd_cents, hire_date, status, updated_at
      ) VALUES
      (
        '1', 'ACME-00001', 'Aarav', 'Patel', 'aarav@acme.example', 'Engineering', 'L4',
        'Manager One', 'IN', 'India', 'INR', 'Full-time',
        100000000, 10000000, 5000000, 115000000, 1380000, '2022-01-01', 'active', '2026-01-01T00:00:00.000Z'
      ),
      (
        '2', 'ACME-00002', 'Emma', 'Brown', 'emma@acme.example', 'Finance', 'L3',
        'Manager Two', 'US', 'United States', 'USD', 'Full-time',
        8000000, 1000000, 400000, 9400000, 9400000, '2021-01-01', 'active', '2026-01-01T00:00:00.000Z'
      );

      INSERT INTO salary_revisions (
        id, employee_id, effective_date, reason, changed_by, changed_at,
        previous_base_salary_cents, previous_bonus_cents, previous_allowance_cents,
        new_base_salary_cents, new_bonus_cents, new_allowance_cents
      ) VALUES (
        'rev-1', '1', date('now', '-20 day'), 'Annual review', 'HR',
        '2026-05-01T00:00:00.000Z', 90000000, 9000000, 4000000, 100000000, 10000000, 5000000
      );
    `)

    const analytics = getDashboardAnalytics(db)

    expect(analytics.summary.employeeCount).toBe(2)
    expect(analytics.summary.countryCount).toBe(2)
    expect(analytics.summary.revisedLast90Days).toBe(1)
    expect(analytics.payrollByCountry[0]?.label).toBe("United States")
    expect(analytics.topEarners[0]?.employeeCode).toBe("ACME-00002")
  })
})
