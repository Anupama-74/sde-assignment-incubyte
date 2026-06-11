import { describe, expect, it, vi } from "vitest"

const prepareMock = vi.fn((sql: string) => ({
  get: () =>
    sql.includes("salary_revisions") ? { count: 5497 } : { count: 10_000 },
}))

vi.mock("@/lib/bootstrap", () => ({
  getBootstrappedDatabase: () => ({
    prepare: prepareMock,
  }),
}))

import { GET } from "@/app/api/health/route"

describe("health route", () => {
  it("returns a deployment-friendly status payload", async () => {
    const response = await GET()
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.status).toBe("ok")
    expect(payload.app).toBe("CompLens")
    expect(payload.employeeCount).toBe(10_000)
    expect(payload.revisionCount).toBe(5497)
    expect(payload.databaseFile).toContain("salary-management.sqlite")
    expect(prepareMock).toHaveBeenCalledTimes(2)
  })
})
