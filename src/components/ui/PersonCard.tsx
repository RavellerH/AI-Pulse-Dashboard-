import { Link } from 'react-router-dom'
import type { Person } from '../../types'
import TagPill from './TagPill'

interface PersonCardProps {
  person: Person
}

export default function PersonCard({ person }: PersonCardProps) {
  const initials = person.displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  const hue = [...person.displayName].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360

  return (
    <Link
      to={`/people/${person.handle.replace('@', '')}`}
      className="block bg-surface-1 border border-border-default rounded-xl p-4 hover:border-surface-3 hover:bg-surface-2/20 transition-all duration-150"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
          style={{ backgroundColor: `hsl(${hue}, 30%, 22%)`, color: `hsl(${hue}, 70%, 72%)` }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate leading-snug">{person.displayName}</p>
              <p className="text-xs font-mono text-text-muted mt-0.5">{person.handle}</p>
            </div>
            <TagPill label={person.group} variant="group" />
          </div>
        </div>
      </div>

      {/* Focus */}
      <p className="text-xs text-text-secondary leading-relaxed mb-3 line-clamp-2">{person.currentFocus}</p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1 min-w-0">
          {person.topTopics.slice(0, 2).map((t) => (
            <TagPill key={t} label={t} variant="muted" />
          ))}
        </div>
        <div className="text-xs font-mono text-text-muted shrink-0">
          <span className="text-text-secondary font-medium">{person.posts7d}</span>
          <span className="ml-0.5">/ 7d</span>
        </div>
      </div>
    </Link>
  )
}
