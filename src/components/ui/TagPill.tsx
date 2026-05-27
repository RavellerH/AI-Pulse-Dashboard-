interface TagPillProps {
  label: string
  variant?: 'default' | 'accent' | 'muted' | 'group'
  onClick?: () => void
}

const GROUP_COLORS: Record<string, string> = {
  Research: 'bg-blue-900/40 text-blue-300 border-blue-800/50',
  Frontier: 'bg-purple-900/40 text-purple-300 border-purple-800/50',
  Builders: 'bg-emerald-900/40 text-emerald-300 border-emerald-800/50',
  Business: 'bg-amber-900/40 text-amber-300 border-amber-800/50',
  Media: 'bg-rose-900/40 text-rose-300 border-rose-800/50',
  Creative: 'bg-pink-900/40 text-pink-300 border-pink-800/50',
}

export default function TagPill({ label, variant = 'default', onClick }: TagPillProps) {
  const base = 'inline-flex items-center text-2xs font-medium px-1.5 py-0.5 rounded border leading-tight'

  const classes = {
    default: 'bg-surface-3 text-text-secondary border-border-default',
    accent: 'bg-accent/10 text-accent border-accent/30',
    muted: 'bg-surface-2 text-text-muted border-border-subtle',
    group: GROUP_COLORS[label] ?? 'bg-surface-3 text-text-secondary border-border-default',
  }

  return (
    <span
      className={`${base} ${classes[variant]} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {label}
    </span>
  )
}
