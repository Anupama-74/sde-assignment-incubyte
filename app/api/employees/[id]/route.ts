import { NextResponse } from "next/server"

import { getBootstrappedDatabase } from "@/lib/bootstrap"
import { getEmployeeById } from "@/lib/employees"

export const dynamic = "force-dynamic"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params
  const db = getBootstrappedDatabase()
  const employee = getEmployeeById(db, id)

  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 })
  }

  return NextResponse.json(employee)
}
