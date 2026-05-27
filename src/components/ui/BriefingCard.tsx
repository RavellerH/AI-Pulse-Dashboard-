import type { Briefing } from '../../types'

interface BriefingCardProps {
  briefing: Briefing
}

const WINDOW_LABEL: Record<string, string> = {
  '1h': 'Hourly Pulse',
  '24h': 'Daily Brief',
  '7d': 'Weekly Digest',
}

const WINDOW_COLOR: Record<string, string> = {
  '1h': 'text-accent border-accent/30 bg-accent/5',
  '24h': 'text-blue-400 border-blue-800/50 bg-blue-900/10',
  '7d': 'text-purple-400 border-purple-800/50 bg-purple-900/10',
}

export default function BriefingCard({ briefing }: BriefingCardProps) {
  const windowClass = WINDOW_COLOR[briefing.window] ?? 'text-text-muted border-border-default bg-surface-2'

  return (
    <div className="bg-surface-1 border border-border-default rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border-default flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded border ${windowClass}`}>
            {WINDOW_LABEL[briefing.window] ?? briefing.window}
          </span>
          <h3 className="text-sm font-semibold text-text-primary">{briefing.title}</h3>
        </div>
        <p className="text-xs font-mono text-text-muted">{formatRelative(briefing.generatedAt)}</p>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-sm text-text-secondary leading-relaxed">{briefing.summary}</p>

        {briefing.highlights.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Highlights</p>
            <ul className="space-y-1.5">
              {briefing.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="text-accent shrink-0 mt-0.5">→</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {briefing.topEntities.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Most Discussed</p>
            <div className="flex flex-wrap gap-1.5">
              {briefing.topEntities.map((e) => (
                <span key={e} className="text-xs bg-surface-2 border border-border-default text-text-secondary px-2 py-0.5 rounded">
                  {e}
                </span>
              ))}
            </div>
          </div>
        )}

        {briefing.debates.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Debates</p>
            <ul className="space-y-1">
              {briefing.debates.map((d, i) => (
                <li key={i} className="text-xs text-text-muted flex items-start gap-1.5">
                  <span className="text-delayed shrink-0">⚡</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
