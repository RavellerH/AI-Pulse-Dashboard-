interface KpiCardProps {
  label: string
  value: number | string
  sub?: string
  accent?: boolean
}

export default function KpiCard({ label, value, sub, accent }: KpiCardProps) {
  return (
    <div className="bg-surface-1 border border-border-default rounded-lg px-4 py-3">
      <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-semibold tabular-nums ${accent ? 'text-accent' : 'text-text-primary'}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
    </div>
  )
}
