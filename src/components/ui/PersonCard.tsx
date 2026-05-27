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
      className="block bg-surface-1 border border-border-default rounded-lg p-4 hover:border-surface-3 hover:bg-surface-2/30 transition-colors"
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
          style={{ backgroundColor: `hsl(${hue}, 35%, 25%)`, color: `hsl(${hue}, 70%, 70%)` }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">{person.displayName}</p>
              <p className="text-xs font-mono text-text-muted">{person.handle}</p>
            </div>
            <TagPill label={person.group} variant="group" />
          </div>
        </div>
      </div>

      <p className="text-xs text-text-secondary leading-relaxed mb-3 line-clamp-2">{person.currentFocus}</p>

      <div className="flex items-center justify-between text-2xs text-text-muted">
        <div className="flex flex-wrap gap-1">
          {person.topTopics.slice(0, 3).map((t) => (
            <TagPill key={t} label={t} variant="muted" />
          ))}
        </div>
        <div className="flex items-center gap-2 font-mono shrink-0">
          <span>{person.posts7d} posts/7d</span>
          <span>·</span>
          <span>{formatRelative(person.lastPostedAt)}</span>
        </div>
      </div>
    </Link>
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
