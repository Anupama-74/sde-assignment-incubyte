"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type SalaryRevisionFormProps = {
  employeeId: string
  baseSalary: number
  bonus: number
  allowance: number
}

export function SalaryRevisionForm({
  employeeId,
  baseSalary,
  bonus,
  allowance,
}: SalaryRevisionFormProps) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError("")
    setIsSaving(true)

    const payload = {
      baseSalary: Number(formData.get("baseSalary")),
      bonus: Number(formData.get("bonus")),
      allowance: Number(formData.get("allowance")),
      effectiveDate: String(formData.get("effectiveDate")),
      reason: String(formData.get("reason")),
      changedBy: "HR Manager",
    }

    const response = await fetch(`/api/employees/${employeeId}/salary-revisions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const data = (await response.json()) as { error?: string }
      setError(data.error ?? "Could not save salary change")
      setIsSaving(false)
      return
    }

    router.refresh()
    setIsSaving(false)
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <form
      className="revisionForm"
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        void handleSubmit(formData)
      }}
    >
      <div className="formGrid">
        <div className="filterField">
          <label htmlFor="baseSalary">Base salary</label>
          <input
            defaultValue={baseSalary}
            id="baseSalary"
            min="0"
            name="baseSalary"
            step="100"
            type="number"
          />
        </div>

        <div className="filterField">
          <label htmlFor="bonus">Bonus</label>
          <input
            defaultValue={bonus}
            id="bonus"
            min="0"
            name="bonus"
            step="100"
            type="number"
          />
        </div>

        <div className="filterField">
          <label htmlFor="allowance">Allowance</label>
          <input
            defaultValue={allowance}
            id="allowance"
            min="0"
            name="allowance"
            step="100"
            type="number"
          />
        </div>
      </div>

      <div className="formGrid">
        <div className="filterField">
          <label htmlFor="effectiveDate">Effective date</label>
          <input defaultValue={today} id="effectiveDate" name="effectiveDate" type="date" />
        </div>

        <div className="filterField filterFieldWide">
          <label htmlFor="reason">Reason</label>
          <input
            defaultValue="Annual compensation review"
            id="reason"
            name="reason"
            placeholder="Why is compensation changing?"
          />
        </div>
      </div>

      {error ? <p className="formError">{error}</p> : null}

      <button className="button buttonPrimary" disabled={isSaving} type="submit">
        {isSaving ? "Saving..." : "Save salary revision"}
      </button>
    </form>
  )
}
