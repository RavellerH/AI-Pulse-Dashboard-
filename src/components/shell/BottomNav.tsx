import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/', label: 'Overview', icon: GridIcon },
  { to: '/feed', label: 'Feed', icon: FeedIcon },
  { to: '/people', label: 'People', icon: PeopleIcon },
  { to: '/topics', label: 'Topics', icon: TopicsIcon },
  { to: '/briefings', label: 'Briefs', icon: BriefIcon },
  { to: '/rupiah',    label: 'IDR',    icon: RupiahIcon },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface-1/95 backdrop-blur-md border-t border-border-default">
      <div className="flex items-stretch h-14 safe-pb">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive ? 'text-accent' : 'text-text-muted active:text-text-primary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-[22px] h-[22px] transition-colors ${isActive ? 'text-accent' : 'text-text-muted'}`} />
                <span className="text-[10px] font-medium tracking-tight">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2" y="2" width="7" height="7" rx="1.5" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function FeedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 5h14M3 10h10M3 15h7" strokeLinecap="round" />
    </svg>
  )
}

function PeopleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="7.5" cy="6" r="3" />
      <path d="M1.5 17c0-3.314 2.686-6 6-6s6 2.686 6 6" strokeLinecap="round" />
      <circle cx="15" cy="6" r="2.5" />
      <path d="M18.5 17c0-2.485-1.567-4.5-3.5-4.5" strokeLinecap="round" />
    </svg>
  )
}

function TopicsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M10 3L17 10L10 17L3 10L10 3Z" />
      <circle cx="10" cy="10" r="2" fill="currentColor" stroke="none" />
    </svg>
  )
}

function RupiahIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 7h5.5a2 2 0 0 1 0 4H7M7 11h6M9 11L11 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BriefIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="2" width="14" height="16" rx="2" />
      <path d="M7 7h6M7 10.5h6M7 14h4" strokeLinecap="round" />
    </svg>
  )
}
