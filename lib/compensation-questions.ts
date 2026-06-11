import type Database from "better-sqlite3"

import {
  getCompensationSnapshots,
  getDashboardAnalytics,
} from "./analytics.ts"
import { COUNTRIES, DEPARTMENTS } from "./reference-data.ts"

export type CompensationQuestionAnswer = {
  title: string
  answer: string
  evidence: string[]
  matchedIntent:
    | "highest_payroll_department"
    | "average_salary_country"
    | "top_paid_employees"
    | "count_above_threshold"
    | "payroll_by_country"
    | "median_department_salary"
    | "band_compliance"
    | "unknown"
}

export function answerCompensationQuestion(
  db: Database.Database,
  question: string,
): CompensationQuestionAnswer {
  const normalized = normalizeQuestion(question)
  const analytics = getDashboardAnalytics(db)
  const snapshots = getCompensationSnapshots(db)

  if (
    normalized.includes("highest payroll") &&
    normalized.includes("department")
  ) {
    const topDepartment = analytics.payrollByDepartment[0]

    if (!topDepartment) {
      return emptyAnswer()
    }

    return {
      title: "Department with the highest payroll",
      answer: `${topDepartment.label} carries the highest annual payroll at ${formatUsd(topDepartment.annualPayrollUsdCents)}.`,
      evidence: [
        `${topDepartment.employeeCount.toLocaleString()} employees in ${topDepartment.label}`,
        `Average compensation ${formatUsd(topDepartment.averageCompUsdCents)}`,
      ],
      matchedIntent: "highest_payroll_department",
    }
  }

  const matchedCountry = COUNTRIES.find((country) =>
    normalized.includes(country.name.toLowerCase()),
  )

  if (normalized.includes("average salary") && matchedCountry) {
    const countryBreakdown = analytics.payrollByCountry.find(
      (item) => item.label === matchedCountry.name,
    )

    if (!countryBreakdown) {
      return emptyAnswer()
    }

    return {
      title: `Average salary in ${matchedCountry.name}`,
      answer: `The average annual compensation in ${matchedCountry.name} is ${formatUsd(countryBreakdown.averageCompUsdCents)}.`,
      evidence: [
        `${countryBreakdown.employeeCount.toLocaleString()} employees included`,
        `Total payroll ${formatUsd(countryBreakdown.annualPayrollUsdCents, true)}`,
      ],
      matchedIntent: "average_salary_country",
    }
  }

  const topEmployeesMatch = normalized.match(/top\s+(\d+)\s+(highest|highest paid|paid)/)
  if (
    normalized.includes("highest paid employees") ||
    normalized.includes("top paid employees") ||
    topEmployeesMatch
  ) {
    const limit = clamp(
      Number(topEmployeesMatch?.[1] ?? (normalized.includes("top 10") ? 10 : 5)),
      3,
      10,
    )
    const topEmployees = snapshots
      .slice()
      .sort((left, right) => right.totalCompUsdCents - left.totalCompUsdCents)
      .slice(0, limit)

    return {
      title: `Top ${limit} highest paid employees`,
      answer: `The highest-paid employee in the current dataset earns ${formatUsd(topEmployees[0]?.totalCompUsdCents ?? 0)} annually.`,
      evidence: topEmployees.map(
        (employee) =>
          `${employee.fullName} · ${employee.department} · ${formatUsd(employee.totalCompUsdCents)}`,
      ),
      matchedIntent: "top_paid_employees",
    }
  }

  const thresholdMatch = normalized.match(
    /(above|over|greater than)\s+\$?(\d+(?:[.,]\d+)?)\s*(k|m)?/,
  )
  if (
    (normalized.includes("how many employees") || normalized.includes("count")) &&
    thresholdMatch
  ) {
    const thresholdUsd = parseHumanAmountToUsdCents(
      thresholdMatch[2] ?? "0",
      thresholdMatch[3],
    )
    const matchingEmployees = snapshots.filter(
      (employee) => employee.totalCompUsdCents > thresholdUsd,
    )

    return {
      title: "Employees above compensation threshold",
      answer: `${matchingEmployees.length.toLocaleString()} employees earn above ${formatUsd(thresholdUsd)} annually.`,
      evidence: [
        `${Math.round((matchingEmployees.length / Math.max(snapshots.length, 1)) * 100)}% of the workforce`,
        `Highest qualifying compensation ${formatUsd(
          matchingEmployees[0]?.totalCompUsdCents ??
            snapshots
              .slice()
              .sort((left, right) => right.totalCompUsdCents - left.totalCompUsdCents)[0]
              ?.totalCompUsdCents ??
            0,
        )}`,
      ],
      matchedIntent: "count_above_threshold",
    }
  }

  if (
    normalized.includes("band") &&
    (normalized.includes("outside") ||
      normalized.includes("under") ||
      normalized.includes("over") ||
      normalized.includes("compa"))
  ) {
    const outsideBandCount =
      analytics.bandCompliance.underBandCount + analytics.bandCompliance.overBandCount

    return {
      title: "Salary band compliance",
      answer: `${outsideBandCount.toLocaleString()} employees sit outside their reference salary band, with ${analytics.bandCompliance.underBandCount.toLocaleString()} under band and ${analytics.bandCompliance.overBandCount.toLocaleString()} over band.`,
      evidence: [
        `${analytics.bandCompliance.withinBandCount.toLocaleString()} employees remain within band`,
        `Average compa-ratio ${formatRatio(analytics.bandCompliance.averageCompaRatio)}`,
        `Median compa-ratio ${formatRatio(analytics.bandCompliance.medianCompaRatio)}`,
        ...analytics.bandAlerts.slice(0, 3).map(
          (employee) =>
            `${employee.fullName} · ${employee.department} · ${formatRatio(employee.compaRatio)} · ${employee.bandPosition.replace("_", " ")}`,
        ),
      ],
      matchedIntent: "band_compliance",
    }
  }

  if (normalized.includes("payroll") && normalized.includes("country")) {
    const topCountries = analytics.payrollByCountry.slice(0, 4)

    return {
      title: "Payroll cost by country",
      answer: `${topCountries[0]?.label ?? "No country"} leads the payroll view at ${formatUsd(topCountries[0]?.annualPayrollUsdCents ?? 0, true)}.`,
      evidence: topCountries.map(
        (country) =>
          `${country.label} · ${formatUsd(country.annualPayrollUsdCents, true)} · ${country.employeeCount.toLocaleString()} employees`,
      ),
      matchedIntent: "payroll_by_country",
    }
  }

  const matchedDepartment = DEPARTMENTS.find((department) =>
    normalized.includes(department.toLowerCase()),
  )
  if (normalized.includes("median") && normalized.includes("salary") && matchedDepartment) {
    const departmentEquity = analytics.departmentEquity.find(
      (item) => item.label === matchedDepartment,
    )

    if (!departmentEquity) {
      return emptyAnswer()
    }

    return {
      title: `Median salary in ${matchedDepartment}`,
      answer: `The median annual compensation in ${matchedDepartment} is ${formatUsd(departmentEquity.medianCompUsdCents)}.`,
      evidence: [
        `Average compensation ${formatUsd(departmentEquity.averageCompUsdCents)}`,
        `Range ${formatUsd(departmentEquity.lowestCompUsdCents)} to ${formatUsd(departmentEquity.highestCompUsdCents)}`,
      ],
      matchedIntent: "median_department_salary",
    }
  }

  return {
    title: "Suggested compensation questions",
    answer:
      "Try asking about payroll by department, salary averages by country, pay-band exceptions, or top earners.",
    evidence: [
      "Which department has the highest payroll?",
      "Average salary in India",
      "How many employees earn above 100k?",
      "How many employees are outside their pay band?",
      "Median Engineering salary",
    ],
    matchedIntent: "unknown",
  }
}

function emptyAnswer(): CompensationQuestionAnswer {
  return {
    title: "No matching compensation insight",
    answer: "The question could not be matched against the current analytics model.",
    evidence: [],
    matchedIntent: "unknown",
  }
}

function normalizeQuestion(question: string) {
  return question.trim().toLowerCase().replace(/\s+/g, " ")
}

function parseHumanAmountToUsdCents(value: string, suffix?: string) {
  const numeric = Number(value.replace(/,/g, ""))
  if (suffix === "m") {
    return Math.round(numeric * 1_000_000 * 100)
  }
  if (suffix === "k") {
    return Math.round(numeric * 1_000 * 100)
  }
  return Math.round(numeric * 100)
}

function formatUsd(cents: number, compact = false) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(cents / 100)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function formatRatio(value: number) {
  return `${Math.round(value * 100)}%`
}
