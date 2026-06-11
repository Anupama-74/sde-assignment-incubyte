# AI Collaboration Notes

## How I used AI

I used AI as an accelerator for:

- structuring the product scope
- comparing architecture options
- generating first drafts for repetitive scaffolding
- identifying edge cases to test

I did not treat AI output as correct by default. I used it as a pair-programming aid and manually reviewed the resulting design and code.

## Example prompts

1. "Given an HR salary management brief for 10,000 employees, what are the highest-value MVP workflows if the evaluator cares about product thinking and code quality more than breadth?"
2. "Suggest a schema for salary revisions that keeps current reads fast but preserves history."
3. "List deterministic unit tests that would catch bugs in salary update logic and payroll analytics."
4. "What product features would make a salary management assignment feel like compensation intelligence rather than CRUD?"
5. "What is the simplest way to express pay-band compliance and compa-ratio without introducing a full compensation-planning module?"
6. "Which tests would best protect CSV export and salary-band calculations from regression?"

## Where human judgment mattered most

- choosing analytics over extra CRUD features
- deciding to add an intent-based compensation question interface without pulling in an LLM
- deciding to keep the system single-app instead of over-engineering a distributed backend
- deciding to keep SQLite for deterministic review while still adding a deployment path that fits a writable volume
- limiting scope to salary management rather than trying to build a full HRMS
- shaping the seeded dataset so it felt realistic enough for the UI and analytics
- adding pay-band logic as a shared domain rule instead of embedding it separately in UI and analytics
- choosing filtered CSV export over bulk import because export is valuable to the HR persona and cheaper to validate reliably
