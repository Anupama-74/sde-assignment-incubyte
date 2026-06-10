export const schemaSql = `
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  employee_code TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  level TEXT NOT NULL,
  manager_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  base_salary_cents INTEGER NOT NULL,
  bonus_cents INTEGER NOT NULL,
  allowance_cents INTEGER NOT NULL,
  total_comp_cents INTEGER NOT NULL,
  total_comp_usd_cents INTEGER NOT NULL,
  hire_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS salary_revisions (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  effective_date TEXT NOT NULL,
  reason TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  changed_at TEXT NOT NULL,
  previous_base_salary_cents INTEGER NOT NULL,
  previous_bonus_cents INTEGER NOT NULL,
  previous_allowance_cents INTEGER NOT NULL,
  new_base_salary_cents INTEGER NOT NULL,
  new_bonus_cents INTEGER NOT NULL,
  new_allowance_cents INTEGER NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE INDEX IF NOT EXISTS idx_employees_country ON employees(country_code);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_total_comp_usd ON employees(total_comp_usd_cents);
CREATE INDEX IF NOT EXISTS idx_salary_revisions_employee ON salary_revisions(employee_id, effective_date DESC);
`
