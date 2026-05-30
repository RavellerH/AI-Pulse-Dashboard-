interface KpiCardProps {
  label: string
  value: number | string
  sub?: string
  accent?: boolean
  icon?: string
}

export default function KpiCard({ label, value, sub, accent, icon }: KpiCardProps) {
  return (
    <div className="bg-surface-1 border border-border-default rounded-xl px-4 py-3.5 flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider leading-none">{label}</p>
        {icon && <span className="text-base leading-none opacity-60">{icon}</span>}
      </div>
      <p className={`text-2xl font-semibold tabular-nums leading-tight ${accent ? 'text-accent' : 'text-text-primary'}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {sub && <p className="text-xs text-text-muted">{sub}</p>}
    </div>
  )
}
