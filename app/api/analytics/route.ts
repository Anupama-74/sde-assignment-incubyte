import { NextResponse } from "next/server"

import { getDashboardAnalytics } from "@/lib/analytics"
import { getBootstrappedDatabase } from "@/lib/bootstrap"

export const dynamic = "force-dynamic"

export async function GET() {
  const db = getBootstrappedDatabase()
  return NextResponse.json(getDashboardAnalytics(db))
}
