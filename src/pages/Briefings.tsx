import { useBriefings } from '../hooks/useData'
import BriefingCard from '../components/ui/BriefingCard'
import { ErrorState } from '../components/ui/EmptyState'

export default function Briefings() {
  const { data, loading, error } = useBriefings()

  if (error) return <div className="p-4"><ErrorState message={error} /></div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-text-primary">Briefings</h1>
          <p className="text-xs text-text-muted mt-0.5">AI-generated summaries across fixed time windows, refreshed hourly.</p>
        </div>
      </div>

      {loading
        ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface-1 border border-border-default rounded-xl h-48 animate-pulse" />
          ))
        : data?.briefings.map((b) => <BriefingCard key={b.id} briefing={b} />)}
    </div>
  )
}
