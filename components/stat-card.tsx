type StatCardProps = {
  label: string
  value: string
  caption: string
}

export function StatCard({ label, value, caption }: StatCardProps) {
  return (
    <article className="statCard">
      <p className="eyebrow">{label}</p>
      <h3>{value}</h3>
      <p className="muted">{caption}</p>
    </article>
  )
}
