import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"

import { getBootstrappedDatabase } from "@/lib/bootstrap"
import { listEmployees } from "@/lib/employees"
import { parseListEmployeesInput } from "@/lib/validation"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const input = parseListEmployeesInput(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    )
    const db = getBootstrappedDatabase()
    return NextResponse.json(listEmployees(db, input))
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
