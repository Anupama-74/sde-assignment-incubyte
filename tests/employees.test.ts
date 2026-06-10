import { describe, expect, it } from "vitest"

import { createInMemoryDatabase } from "@/lib/db"
import {
  applySalaryRevision,
  getEmployeeById,
  listEmployees,
} from "@/lib/employees"

describe("employees service", () => {
  it("supports search, filter, sort, and pagination", () => {
    const db = createInMemoryDatabase()
    db.exec(`
      INSERT INTO employees (
        id, employee_code, first_name, last_name, email, department, level,
        manager_name, country_code, country_name, currency_code, employment_type,
        base_salary_cents, bonus_cents, allowance_cents, total_comp_cents,
        total_comp_usd_cents, hire_date, status, updated_at
      ) VALUES
      (
        '1', 'ACME-00001', 'Maya', 'Patel', 'maya@acme.example', 'Engineering', 'L4',
        'Aarav Singh', 'IN', 'India', 'INR', 'Full-time',
        120000000, 15000000, 5000000, 140000000, 1680000, '2022-01-10', 'active', '2026-05-01T10:00:00.000Z'
      ),
      (
        '2', 'ACME-00002', 'Liam', 'Smith', 'liam@acme.example', 'Finance', 'L3',
        'Emma Brown', 'US', 'United States', 'USD', 'Full-time',
        9000000, 1000000, 500000, 10500000, 10500000, '2021-04-10', 'active', '2026-05-02T10:00:00.000Z'
      ),
      (
        '3', 'ACME-00003', 'Riya', 'Gupta', 'riya@acme.example', 'Engineering', 'L5',
        'Noah Lee', 'IN', 'India', 'INR', 'Full-time',
        150000000, 25000000, 7500000, 182500000, 2190000, '2020-07-21', 'leave', '2026-05-03T10:00:00.000Z'
      );
    `)

    const result = listEmployees(db, {
      search: "ACME-0000",
      country: "IN",
      department: "Engineering",
      level: "",
      page: 1,
      pageSize: 1,
      sort: "compensation_desc",
      employeeId: "",
    })

    expect(result.total).toBe(2)
    expect(result.items).toHaveLength(1)
    expect(result.items[0]?.employeeCode).toBe("ACME-00003")
  })

  it("creates revision history and updates the employee snapshot", () => {
    const db = createInMemoryDatabase()
    db.exec(`
      INSERT INTO employees (
        id, employee_code, first_name, last_name, email, department, level,
        manager_name, country_code, country_name, currency_code, employment_type,
        base_salary_cents, bonus_cents, allowance_cents, total_comp_cents,
        total_comp_usd_cents, hire_date, status, updated_at
      ) VALUES (
        'emp-1', 'ACME-00010', 'Aisha', 'Khan', 'aisha@acme.example', 'Product', 'L4',
        'Sophia Chen', 'US', 'United States', 'USD', 'Full-time',
        12000000, 1200000, 300000, 13500000, 13500000, '2022-03-11', 'active', '2026-04-01T10:00:00.000Z'
      );
    `)

    const updated = applySalaryRevision(db, "emp-1", {
      baseSalary: 140000,
      bonus: 18000,
      allowance: 5000,
      effectiveDate: "2026-06-01",
      reason: "Annual compensation refresh",
      changedBy: "HR Manager",
    })

    expect(updated?.totalCompUsdCents).toBe(16300000)
    expect(updated?.revisionHistory).toHaveLength(1)
    expect(updated?.revisionHistory[0]?.previousBaseSalaryCents).toBe(12000000)

    const detail = getEmployeeById(db, "emp-1")
    expect(detail?.baseSalaryCents).toBe(14000000)
    expect(detail?.bonusCents).toBe(1800000)
    expect(detail?.allowanceCents).toBe(500000)
  })
})
