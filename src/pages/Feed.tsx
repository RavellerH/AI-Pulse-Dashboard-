import { useState, useMemo } from 'react'
import { useFeed } from '../hooks/useData'
import PostCard from '../components/ui/PostCard'
import FeedFilters, { type FeedFilterState } from '../components/ui/FeedFilters'
import { ListSkeleton } from '../components/ui/LoadingSkeleton'
import EmptyState, { ErrorState } from '../components/ui/EmptyState'

const DEFAULT_FILTERS: FeedFilterState = {
  group: null,
  topic: null,
  windowMinutes: 10080,
  minImportance: 0,
}

export default function Feed() {
  const { data, loading, error } = useFeed()
  const [filters, setFilters] = useState<FeedFilterState>(DEFAULT_FILTERS)

  const filtered = useMemo(() => {
    if (!data) return []
    const cutoff = Date.now() - filters.windowMinutes * 60 * 1000
    return data.posts.filter((p) => {
      if (filters.group && p.group !== filters.group) return false
      if (filters.topic && !p.topics.includes(filters.topic)) return false
      if (new Date(p.postedAt).getTime() < cutoff) return false
      if (Math.round(p.importanceScore * 100) < filters.minImportance) return false
      return true
    })
  }, [data, filters])

  if (error) return <div className="p-4"><ErrorState message={error} /></div>

  return (
    <div className="flex flex-col h-full">
      <FeedFilters
        filters={filters}
        onChange={setFilters}
        totalCount={data?.posts.length ?? 0}
        filteredCount={filtered.length}
      />
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="max-w-3xl space-y-3">
            <ListSkeleton count={8} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No posts match these filters"
            message="Try expanding the time window or removing group/topic filters."
          />
        ) : (
          <div className="max-w-3xl space-y-3 pb-4">
            {filtered.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
