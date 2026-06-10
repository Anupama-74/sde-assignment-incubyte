import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { getBootstrappedDatabase } from "@/lib/bootstrap"
import { applySalaryRevision } from "@/lib/employees"
import { parseSalaryRevisionInput } from "@/lib/validation"

export const dynamic = "force-dynamic"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const payload = parseSalaryRevisionInput(await request.json())
    const { id } = await context.params
    const db = getBootstrappedDatabase()
    const employee = applySalaryRevision(db, id, payload)

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid revision input" },
        { status: 400 },
      )
    }

    if (error instanceof Error) {
      if (error.message === "Employee not found") {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }

      if (error.message === "Compensation is unchanged") {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }

      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}
