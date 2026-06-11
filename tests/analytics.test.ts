import { describe, expect, it } from "vitest"

import {
  detectCompensationOutliers,
  getCompensationSnapshots,
  getDashboardAnalytics,
} from "@/lib/analytics"
import { createInMemoryDatabase } from "@/lib/db"

describe("analytics service", () => {
  it("computes payroll summary and breakdowns", () => {
    const db = createInMemoryDatabase()
    db.exec(`
      INSERT INTO employees (
        id, employee_code, first_name, last_name, email, department, level,
        manager_name, country_code, country_name, currency_code, employment_type,
        base_salary_cents, bonus_cents, allowance_cents, stock_grant_cents, total_comp_cents,
        total_comp_usd_cents, hire_date, status, updated_at
      ) VALUES
      (
        '1', 'ACME-00001', 'Aarav', 'Patel', 'aarav@acme.example', 'Engineering', 'L4',
        'Manager One', 'IN', 'India', 'INR', 'Full-time',
        100000000, 10000000, 5000000, 7000000, 122000000, 1464000, '2022-01-01', 'active', '2026-01-01T00:00:00.000Z'
      ),
      (
        '2', 'ACME-00002', 'Emma', 'Brown', 'emma@acme.example', 'Finance', 'L3',
        'Manager Two', 'US', 'United States', 'USD', 'Full-time',
        8000000, 1000000, 400000, 1000000, 10400000, 10400000, '2021-01-01', 'active', '2026-01-01T00:00:00.000Z'
      );

      INSERT INTO salary_revisions (
        id, employee_id, effective_date, reason, changed_by, changed_at,
        previous_base_salary_cents, previous_bonus_cents, previous_allowance_cents, previous_stock_grant_cents,
        new_base_salary_cents, new_bonus_cents, new_allowance_cents, new_stock_grant_cents
      ) VALUES (
        'rev-1', '1', date('now', '-20 day'), 'Annual review', 'HR',
        '2026-05-01T00:00:00.000Z', 90000000, 9000000, 4000000, 5000000, 100000000, 10000000, 5000000, 7000000
      );
    `)

    const analytics = getDashboardAnalytics(db)

    expect(analytics.summary.employeeCount).toBe(2)
    expect(analytics.summary.countryCount).toBe(2)
    expect(analytics.summary.revisedLast90Days).toBe(1)
    expect(analytics.payrollByCountry[0]?.label).toBe("United States")
    expect(analytics.topEarners[0]?.employeeCode).toBe("ACME-00002")
    expect(analytics.salaryDistribution.some((bucket) => bucket.employeeCount > 0)).toBe(true)
    expect(analytics.departmentEquity).toHaveLength(2)
    expect(analytics.summary.bandExceptionCount).toBe(2)
    expect(analytics.bandCompliance.underBandCount).toBe(2)
    expect(analytics.bandAlerts).toHaveLength(2)
  })

  it("flags department-level compensation outliers", () => {
    const db = createInMemoryDatabase()

    const insert = db.prepare(`
      INSERT INTO employees (
        id, employee_code, first_name, last_name, email, department, level,
        manager_name, country_code, country_name, currency_code, employment_type,
        base_salary_cents, bonus_cents, allowance_cents, stock_grant_cents, total_comp_cents,
        total_comp_usd_cents, hire_date, status, updated_at
      ) VALUES (
        @id, @employee_code, @first_name, @last_name, @email, @department, @level,
        @manager_name, @country_code, @country_name, @currency_code, @employment_type,
        @base_salary_cents, @bonus_cents, @allowance_cents, @stock_grant_cents, @total_comp_cents,
        @total_comp_usd_cents, @hire_date, @status, @updated_at
      )
    `)

    for (let index = 1; index <= 7; index += 1) {
      insert.run({
        id: `${index}`,
        employee_code: `ACME-00${index}`,
        first_name: `Employee${index}`,
        last_name: "Engineering",
        email: `eng${index}@acme.example`,
        department: "Engineering",
        level: "L4",
        manager_name: "Manager One",
        country_code: "US",
        country_name: "United States",
        currency_code: "USD",
        employment_type: "Full-time",
        base_salary_cents: 10_000_000,
        bonus_cents: 500_000,
        allowance_cents: 250_000,
        stock_grant_cents: 750_000,
        total_comp_cents: 11_500_000,
        total_comp_usd_cents: 11_500_000,
        hire_date: "2021-01-01",
        status: "active",
        updated_at: "2026-01-01T00:00:00.000Z",
      })
    }

    insert.run({
      id: "8",
      employee_code: "ACME-008",
      first_name: "Outlier",
      last_name: "Engineering",
      email: "outlier@acme.example",
      department: "Engineering",
      level: "L7",
      manager_name: "Manager One",
      country_code: "US",
      country_name: "United States",
      currency_code: "USD",
      employment_type: "Full-time",
      base_salary_cents: 28_000_000,
      bonus_cents: 4_000_000,
      allowance_cents: 1_000_000,
      stock_grant_cents: 10_000_000,
      total_comp_cents: 43_000_000,
      total_comp_usd_cents: 43_000_000,
      hire_date: "2021-01-01",
      status: "active",
      updated_at: "2026-01-01T00:00:00.000Z",
    })

    const outliers = detectCompensationOutliers(getCompensationSnapshots(db))

    expect(outliers).toHaveLength(1)
    expect(outliers[0]?.employeeCode).toBe("ACME-008")
    expect(outliers[0]?.zScore).toBeGreaterThan(2)
  })
})
