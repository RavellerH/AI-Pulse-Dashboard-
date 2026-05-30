import { useLocation } from 'react-router-dom'
import { useManifest, getFreshnessState } from '../../hooks/useData'

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Overview',
  '/feed': 'Feed',
  '/people': 'People',
  '/topics': 'Topics',
  '/briefings': 'Briefings',
  '/about': 'About',
}

export default function TopBar() {
  const location = useLocation()
  const { data: manifest } = useManifest()

  const label = ROUTE_LABELS[location.pathname] ?? 'AI Pulse'
  const freshness = manifest ? getFreshnessState(manifest.generatedAt) : null

  const dotColor = freshness === 'fresh' ? 'bg-fresh animate-pulse'
    : freshness === 'delayed' ? 'bg-delayed'
    : freshness === 'stale' ? 'bg-stale'
    : 'bg-surface-3'

  const freshnessText = freshness === 'fresh' ? 'text-fresh'
    : freshness === 'delayed' ? 'text-delayed'
    : freshness === 'stale' ? 'text-stale'
    : 'text-text-muted'

  const freshnessLabel = { fresh: 'Live', delayed: 'Delayed', stale: 'Stale' }

  return (
    <header className="sticky top-0 z-20 h-12 flex items-center px-4 gap-3 bg-surface-1/90 backdrop-blur-md border-b border-border-default shrink-0">
      {/* Brand — shown on mobile (sidebar hidden), hidden on desktop */}
      <div className="flex items-center gap-2 md:hidden">
        <span className="w-6 h-6 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-accent" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="2.5" fill="currentColor" />
            <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </span>
        <span className="text-sm font-semibold text-text-primary tracking-tight">AI Pulse</span>
      </div>

      {/* Page label — desktop only (mobile shows brand above) */}
      <span className="hidden md:block text-sm font-semibold text-text-primary">{label}</span>

      <div className="flex-1" />

      {manifest && freshness && (
        <div className="flex items-center gap-2.5 text-xs font-mono">
          <span className="text-text-muted hidden sm:block">
            {manifest.sourceCount} sources
          </span>
          <span className="text-text-muted hidden sm:block">
            {formatRelative(manifest.generatedAt)}
          </span>
          <span className={`flex items-center gap-1.5 ${freshnessText}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
            {freshnessLabel[freshness]}
          </span>
        </div>
      )}
    </header>
  )
}

function formatRelative(iso: string): string {
  const ageMs = Date.now() - new Date(iso).getTime()
  const m = Math.floor(ageMs / 60000)
  if (m < 2) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
