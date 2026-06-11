import { NextResponse } from "next/server"

import { getBootstrappedDatabase } from "@/lib/bootstrap"

export const dynamic = "force-dynamic"

export async function GET() {
  const db = getBootstrappedDatabase()
  const employeesRow = db
    .prepare("SELECT COUNT(*) as count FROM employees")
    .get() as { count?: number } | undefined
  const revisionsRow = db
    .prepare("SELECT COUNT(*) as count FROM salary_revisions")
    .get() as { count?: number } | undefined

  return NextResponse.json({
    app: "CompLens",
    status: "ok",
    employeeCount: Number(employeesRow?.count ?? 0),
    revisionCount: Number(revisionsRow?.count ?? 0),
    databaseFile:
      process.env.DATABASE_FILE ?? `${process.cwd()}/data/salary-management.sqlite`,
    generatedAt: new Date().toISOString(),
  })
}
