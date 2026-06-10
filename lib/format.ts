export function formatCurrencyFromCents(
  cents: number,
  currency: string,
  compact = false,
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(cents / 100)
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}
