import { z } from "zod"

import type { EmployeeSort } from "@/lib/reference-data"

const datePattern = /^\d{4}-\d{2}-\d{2}$/

export const listEmployeesSchema = z.object({
  search: z.string().trim().optional().default(""),
  country: z.string().trim().optional().default(""),
  department: z.string().trim().optional().default(""),
  level: z.string().trim().optional().default(""),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(5).max(100).optional().default(25),
  sort: z
    .enum([
      "updated_desc",
      "compensation_desc",
      "compensation_asc",
      "name_asc",
      "country_asc",
    ])
    .optional()
    .default("updated_desc"),
  employeeId: z.string().trim().optional().default(""),
})

export const salaryRevisionSchema = z
  .object({
    baseSalary: z.coerce.number().min(0, "Base salary must be non-negative"),
    bonus: z.coerce.number().min(0, "Bonus must be non-negative"),
    allowance: z.coerce.number().min(0, "Allowance must be non-negative"),
    effectiveDate: z
      .string()
      .trim()
      .regex(datePattern, "Effective date must be in YYYY-MM-DD format"),
    reason: z.string().trim().min(8, "Reason must be at least 8 characters"),
    changedBy: z.string().trim().min(2).default("HR Manager"),
  })
  .refine(
    (value) => value.baseSalary + value.bonus + value.allowance > 0,
    "Total compensation must be greater than zero",
  )

export type ListEmployeesInput = z.infer<typeof listEmployeesSchema>
export type SalaryRevisionInput = z.infer<typeof salaryRevisionSchema>
export type ValidatedEmployeeSort = EmployeeSort

export function parseListEmployeesInput(input: unknown) {
  return listEmployeesSchema.parse(input)
}

export function parseSalaryRevisionInput(input: unknown) {
  return salaryRevisionSchema.parse(input)
}
