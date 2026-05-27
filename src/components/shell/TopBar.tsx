import { useState, useEffect } from 'react'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const label = ROUTE_LABELS[location.pathname] ?? 'AI Pulse'
  const freshness = manifest ? getFreshnessState(manifest.generatedAt) : null

  const freshnessColor = {
    fresh: 'text-fresh',
    delayed: 'text-delayed',
    stale: 'text-stale',
  }

  const freshnessLabel = {
    fresh: 'Live',
    delayed: 'Delayed',
    stale: 'Stale',
  }

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-20 h-12 flex items-center px-4 gap-3 bg-surface-1/90 backdrop-blur border-b border-border-default shrink-0">
      <button
        className="md:hidden p-1 text-text-secondary hover:text-text-primary"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>

      <span className="text-sm font-semibold text-text-primary">{label}</span>

      <div className="flex-1" />

      {manifest && freshness && (
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-text-muted hidden sm:block">
            {manifest.sourceCount} sources
          </span>
          <span className="text-text-muted hidden sm:block">
            {formatRelative(manifest.generatedAt)}
          </span>
          <span className={`flex items-center gap-1 ${freshnessColor[freshness]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${freshness === 'fresh' ? 'bg-fresh animate-pulse' : freshness === 'delayed' ? 'bg-delayed' : 'bg-stale'}`} />
            {freshnessLabel[freshness]}
          </span>
        </div>
      )}

      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-surface-1 border-b border-border-default md:hidden">
          <MobileNav />
        </div>
      )}
    </header>
  )
}

function MobileNav() {
  const NAV = [
    { to: '#/', label: 'Overview' },
    { to: '#/feed', label: 'Feed' },
    { to: '#/people', label: 'People' },
    { to: '#/topics', label: 'Topics' },
    { to: '#/briefings', label: 'Briefings' },
    { to: '#/about', label: 'About' },
  ]
  return (
    <nav className="flex flex-col py-2">
      {NAV.map(({ to, label }) => (
        <a
          key={to}
          href={to}
          className="px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2"
        >
          {label}
        </a>
      ))}
    </nav>
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
