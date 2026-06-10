import { describe, expect, it } from "vitest"

import {
  parseListEmployeesInput,
  parseSalaryRevisionInput,
} from "@/lib/validation"

describe("validation", () => {
  it("applies sensible defaults to list filters", () => {
    expect(parseListEmployeesInput({})).toEqual({
      search: "",
      country: "",
      department: "",
      level: "",
      page: 1,
      pageSize: 25,
      sort: "updated_desc",
      employeeId: "",
    })
  })

  it("rejects an all-zero compensation package", () => {
    expect(() =>
      parseSalaryRevisionInput({
        baseSalary: 0,
        bonus: 0,
        allowance: 0,
        stockGrant: 0,
        effectiveDate: "2026-06-01",
        reason: "No-op pay change",
        changedBy: "HR",
      }),
    ).toThrow("Total compensation must be greater than zero")
  })
})
