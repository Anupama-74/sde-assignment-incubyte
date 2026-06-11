import type { ListEmployeesInput } from "./validation.ts"

export function buildEmployeeListQuery(
  filters: ListEmployeesInput,
  overrides: Record<string, string | number | undefined> = {},
) {
  const params = new URLSearchParams()
  const merged = { ...filters, ...overrides }

  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined || value === null || value === "") {
      continue
    }

    params.set(key, String(value))
  }

  return params.toString()
}

export function buildEmployeeListHref(
  filters: ListEmployeesInput,
  overrides: Record<string, string | number | undefined> = {},
) {
  const query = buildEmployeeListQuery(filters, overrides)
  return query ? `/?${query}` : "/"
}

export function buildEmployeeExportHref(filters: ListEmployeesInput) {
  const query = buildEmployeeListQuery(filters, {
    employeeId: "",
    page: 1,
    pageSize: 10_000,
  })
  return query ? `/api/employees/export?${query}` : "/api/employees/export"
}
