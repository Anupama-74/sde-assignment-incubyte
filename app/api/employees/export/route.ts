import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"

import { getBootstrappedDatabase } from "@/lib/bootstrap"
import { buildEmployeesCsv } from "@/lib/csv-export"
import { listEmployees } from "@/lib/employees"
import { parseListEmployeesInput } from "@/lib/validation"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const input = parseListEmployeesInput(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    )
    const db = getBootstrappedDatabase()
    const employees = listEmployees(db, {
      ...input,
      employeeId: "",
      page: 1,
      pageSize: 10_000,
    })
    const csv = buildEmployeesCsv(employees.items)

    return new NextResponse(csv, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="employees-${new Date()
          .toISOString()
          .slice(0, 10)}.csv"`,
        "Content-Type": "text/csv; charset=utf-8",
      },
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid filters" },
        { status: 400 },
      )
    }

    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}
