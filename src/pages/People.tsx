import { useState, useMemo } from 'react'
import { usePeople } from '../hooks/useData'
import PersonCard from '../components/ui/PersonCard'
import { PersonCardSkeleton } from '../components/ui/LoadingSkeleton'
import EmptyState, { ErrorState } from '../components/ui/EmptyState'
import type { Group } from '../types'

const GROUPS: Group[] = ['Research', 'Frontier', 'Builders', 'Business', 'Media', 'Creative']

export default function People() {
  const { data, loading, error } = usePeople()
  const [activeGroup, setActiveGroup] = useState<Group | null>(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!data) return []
    return data.people.filter((p) => {
      if (activeGroup && p.group !== activeGroup) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          p.displayName.toLowerCase().includes(q) ||
          p.handle.toLowerCase().includes(q) ||
          p.currentFocus.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [data, activeGroup, search])

  if (error) return <div className="p-6"><ErrorState message={error} /></div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveGroup(null)}
            className={`text-xs px-3 py-1.5 rounded border transition-colors ${
              activeGroup === null
                ? 'bg-accent/10 border-accent/30 text-accent'
                : 'border-border-default text-text-muted hover:text-text-primary'
            }`}
          >
            All ({data?.people.length ?? 0})
          </button>
          {GROUPS.map((g) => {
            const count = data?.people.filter((p) => p.group === g).length ?? 0
            if (!count) return null
            return (
              <button
                key={g}
                onClick={() => setActiveGroup(activeGroup === g ? null : g)}
                className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                  activeGroup === g
                    ? 'bg-accent/10 border-accent/30 text-accent'
                    : 'border-border-default text-text-muted hover:text-text-primary'
                }`}
              >
                {g} ({count})
              </button>
            )
          })}
        </div>

        <div className="flex-1 max-w-xs">
          <input
            type="search"
            placeholder="Search people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-2 border border-border-default rounded text-sm text-text-primary px-3 py-1.5 outline-none placeholder-text-muted focus:border-accent/50 transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => <PersonCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No people found" message="Try a different group or search term." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((p) => (
            <PersonCard key={p.handle} person={p} />
          ))}
        </div>
      )}
    </div>
  )
}
