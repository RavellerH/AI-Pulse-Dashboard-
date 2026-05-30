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
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border-default bg-surface-1 h-full">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-border-default">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-accent" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="2.5" fill="currentColor" />
              <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-text-primary leading-none tracking-tight">AI Pulse</p>
            <p className="text-[10px] text-text-muted mt-0.5">Signal Monitor</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent'
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

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border-default">
        <p className="text-[10px] font-mono text-text-muted">public · read-only · open source</p>
      </div>
    </aside>
  )
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.2" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.2" />
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.2" />
      <rect x="9" y="9" width="5.5" height="5.5" rx="1.2" />
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
      <path d="M8 2L14 8L8 14L2 8L8 2Z" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function BriefingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="1.5" width="12" height="13" rx="1.5" />
      <path d="M5 5.5h6M5 8.5h6M5 11.5h4" strokeLinecap="round" />
    </svg>
  )
}

function AboutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 7.5v4.5" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}
