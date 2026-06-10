import type { CompensationQuestionAnswer } from "@/lib/compensation-questions"

type CompensationQuestionPanelProps = {
  initialQuestion: string
  answer: CompensationQuestionAnswer | null
}

export function CompensationQuestionPanel({
  initialQuestion,
  answer,
}: CompensationQuestionPanelProps) {
  return (
    <article className="card questionCard">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">Ask compensation questions</p>
          <h2>AI-shaped, deterministic answers</h2>
        </div>
      </div>

      <form action="/" className="questionForm" method="get">
        <label className="filterField questionField" htmlFor="question">
          <span>Ask about payroll, averages, or pay distribution</span>
          <input
            defaultValue={initialQuestion}
            id="question"
            name="question"
            placeholder="Which department has the highest payroll?"
          />
        </label>
        <button className="button buttonPrimary" type="submit">
          Ask
        </button>
      </form>

      {answer ? (
        <div className="questionAnswer">
          <p className="eyebrow">{answer.title}</p>
          <h3>{answer.answer}</h3>
          <div className="stack">
            {answer.evidence.map((line) => (
              <div className="breakdownRow" key={line}>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="muted">
          Try: <strong>Average salary in India</strong> or{" "}
          <strong>How many employees earn above 100k?</strong>
        </p>
      )}
    </article>
  )
}
