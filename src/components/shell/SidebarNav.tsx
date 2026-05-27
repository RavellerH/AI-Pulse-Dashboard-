import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: GridIcon },
  { to: '/feed', label: 'Feed', icon: FeedIcon },
  { to: '/people', label: 'People', icon: PeopleIcon },
  { to: '/topics', label: 'Topics', icon: TopicsIcon },
  { to: '/briefings', label: 'Briefings', icon: BriefingsIcon },
  { to: '/about', label: 'About', icon: AboutIcon },
]

export default function SidebarNav() {
  return (
    <aside className="hidden md:flex flex-col w-52 shrink-0 border-r border-border-default bg-surface-1 h-full">
      <div className="px-4 py-4 border-b border-border-default">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-accent/10 border border-accent/30 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="3" />
              <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </span>
          <span className="text-sm font-semibold text-text-primary tracking-tight">AI Pulse</span>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent' : 'text-text-muted'}`} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-border-default">
        <p className="text-2xs font-mono text-text-muted">public · read-only</p>
      </div>
    </aside>
  )
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  )
}

function FeedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h12M2 8h9M2 12h6" strokeLinecap="round" />
    </svg>
  )
}

function PeopleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6" cy="5" r="2.5" />
      <path d="M1 14c0-2.76 2.24-5 5-5s5 2.24 5 5" strokeLinecap="round" />
      <circle cx="12" cy="5" r="2" />
      <path d="M15 14c0-2.21-1.34-4-3-4" strokeLinecap="round" />
    </svg>
  )
}

function TopicsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 2l5 5M9 2l5 5M2 9l5 5M9 9l5 5" strokeLinecap="round" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  )
}

function BriefingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="1" width="12" height="14" rx="1.5" />
      <path d="M5 5h6M5 8h6M5 11h4" strokeLinecap="round" />
    </svg>
  )
}

function AboutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 7v5" strokeLinecap="round" />
      <circle cx="8" cy="4.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}
