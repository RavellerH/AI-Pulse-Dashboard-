import { useBriefings } from '../hooks/useData'
import BriefingCard from '../components/ui/BriefingCard'
import { ErrorState } from '../components/ui/EmptyState'

export default function Briefings() {
  const { data, loading, error } = useBriefings()

  if (error) return <div className="p-6"><ErrorState message={error} /></div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <p className="text-xs text-text-muted">
        AI-generated summaries across fixed time windows. Refreshed hourly.
      </p>

      {loading
        ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface-1 border border-border-default rounded-lg h-48 animate-pulse" />
          ))
        : data?.briefings.map((b) => <BriefingCard key={b.id} briefing={b} />)}
    </div>
  )
}
