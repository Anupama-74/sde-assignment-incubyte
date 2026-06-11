import Link from "next/link"

import { buildEmployeeExportHref } from "@/lib/filter-query"
import { COUNTRIES, DEPARTMENTS, LEVELS } from "@/lib/reference-data"
import type { ListEmployeesInput } from "@/lib/validation"

type EmployeeFiltersProps = {
  filters: ListEmployeesInput
}

export function EmployeeFilters({ filters }: EmployeeFiltersProps) {
  return (
    <form className="filterBar card" action="/" method="get">
      <div className="filterField filterFieldWide">
        <label htmlFor="search">Search</label>
        <input
          id="search"
          name="search"
          defaultValue={filters.search}
          placeholder="Name, employee code, or email"
        />
      </div>

      <div className="filterField">
        <label htmlFor="country">Country</label>
        <select id="country" name="country" defaultValue={filters.country}>
          <option value="">All countries</option>
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filterField">
        <label htmlFor="department">Department</label>
        <select
          id="department"
          name="department"
          defaultValue={filters.department}
        >
          <option value="">All departments</option>
          {DEPARTMENTS.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
      </div>

      <div className="filterField">
        <label htmlFor="level">Level</label>
        <select id="level" name="level" defaultValue={filters.level}>
          <option value="">All levels</option>
          {LEVELS.map((level) => (
            <option key={level.name} value={level.name}>
              {level.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filterField">
        <label htmlFor="sort">Sort by</label>
        <select id="sort" name="sort" defaultValue={filters.sort}>
          <option value="updated_desc">Recently updated</option>
          <option value="compensation_desc">Highest compensation</option>
          <option value="compensation_asc">Lowest compensation</option>
          <option value="name_asc">Name A-Z</option>
          <option value="country_asc">Country</option>
        </select>
      </div>

      <div className="filterField">
        <label htmlFor="pageSize">Rows</label>
        <select id="pageSize" name="pageSize" defaultValue={String(filters.pageSize)}>
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </select>
      </div>

      <div className="filterActions">
        <button className="button buttonPrimary" type="submit">
          Apply filters
        </button>
        <Link className="button buttonGhost" href={buildEmployeeExportHref(filters)}>
          Export CSV
        </Link>
        <Link className="button buttonGhost" href="/">
          Reset
        </Link>
      </div>
    </form>
  )
}
