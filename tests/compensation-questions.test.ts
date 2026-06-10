import { describe, expect, it } from "vitest"

import { answerCompensationQuestion } from "@/lib/compensation-questions"
import { createInMemoryDatabase } from "@/lib/db"

describe("compensation questions", () => {
  it("answers highest payroll and threshold questions from deterministic analytics", () => {
    const db = createInMemoryDatabase()
    db.exec(`
      INSERT INTO employees (
        id, employee_code, first_name, last_name, email, department, level,
        manager_name, country_code, country_name, currency_code, employment_type,
        base_salary_cents, bonus_cents, allowance_cents, stock_grant_cents, total_comp_cents,
        total_comp_usd_cents, hire_date, status, updated_at
      ) VALUES
      (
        '1', 'ACME-00001', 'Maya', 'Patel', 'maya@acme.example', 'Engineering', 'L5',
        'Manager One', 'US', 'United States', 'USD', 'Full-time',
        18000000, 2000000, 500000, 2500000, 23000000, 23000000, '2021-01-01', 'active', '2026-01-01T00:00:00.000Z'
      ),
      (
        '2', 'ACME-00002', 'Aisha', 'Khan', 'aisha@acme.example', 'Engineering', 'L4',
        'Manager One', 'US', 'United States', 'USD', 'Full-time',
        15000000, 1000000, 300000, 1200000, 17500000, 17500000, '2022-01-01', 'active', '2026-01-01T00:00:00.000Z'
      ),
      (
        '3', 'ACME-00003', 'Liam', 'Brown', 'liam@acme.example', 'Finance', 'L3',
        'Manager Two', 'IN', 'India', 'INR', 'Full-time',
        9000000, 500000, 250000, 0, 9750000, 9750000, '2023-01-01', 'active', '2026-01-01T00:00:00.000Z'
      );
    `)

    const highestPayroll = answerCompensationQuestion(
      db,
      "Which department has the highest payroll?",
    )
    const aboveThreshold = answerCompensationQuestion(
      db,
      "How many employees earn above 100k?",
    )

    expect(highestPayroll.matchedIntent).toBe("highest_payroll_department")
    expect(highestPayroll.answer).toContain("Engineering")
    expect(aboveThreshold.matchedIntent).toBe("count_above_threshold")
    expect(aboveThreshold.answer).toContain("2 employees")
  })
})
