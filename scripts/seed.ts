import path from "node:path"

import { createDatabase } from "../lib/db.ts"
import { seedDatabase } from "../lib/seed-data.ts"

const databaseFile =
  process.env.DATABASE_FILE ??
  path.join(process.cwd(), "data", "salary-management.sqlite")

const db = createDatabase(databaseFile)
const result = seedDatabase(db, { employeeCount: 10_000, reset: true })

console.log(
  `Seeded ${result.employeesInserted} employees and ${result.revisionsInserted} salary revisions into ${databaseFile}`,
)
