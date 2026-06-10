import { getDatabase } from "./db.ts"
import { seedDatabase } from "./seed-data.ts"

let hasBootstrapped = false

export function getBootstrappedDatabase() {
  const db = getDatabase()

  if (!hasBootstrapped) {
    const countRow = db
      .prepare("SELECT COUNT(*) as count FROM employees")
      .get() as { count?: number } | undefined
    const count = Number(countRow?.count ?? 0)

    if (count === 0) {
      seedDatabase(db, { employeeCount: 10_000, reset: false })
    }

    hasBootstrapped = true
  }

  return db
}
