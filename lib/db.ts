import fs from "node:fs"
import path from "node:path"

import Database from "better-sqlite3"

import { schemaSql } from "./schema.ts"

let database: Database.Database | null = null

export function getDatabase(filePath?: string) {
  if (filePath) {
    return createDatabase(filePath)
  }

  if (!database) {
    const defaultPath =
      process.env.DATABASE_FILE ??
      path.join(process.cwd(), "data", "salary-management.sqlite")
    database = createDatabase(defaultPath)
  }

  return database
}

export function createDatabase(filePath: string) {
  const directory = path.dirname(filePath)
  fs.mkdirSync(directory, { recursive: true })
  const db = new Database(filePath)
  db.pragma("journal_mode = WAL")
  db.pragma("foreign_keys = ON")
  initializeDatabase(db)
  return db
}

export function createInMemoryDatabase() {
  const db = new Database(":memory:")
  db.pragma("foreign_keys = ON")
  initializeDatabase(db)
  return db
}

export function initializeDatabase(db: Database.Database) {
  db.exec(schemaSql)
}
