import type { Group } from '../../types'

const GROUPS: Group[] = ['Research', 'Frontier', 'Builders', 'Business', 'Media', 'Creative']

const TOPICS = [
  'llms', 'agents', 'research-papers', 'frontier-models', 'open-source',
  'startup-ideas', 'monetization', 'prompting', 'images-video', 'developer-workflows',
  'ai-safety', 'ai-impact', 'multimodal', 'education', 'startups', 'computer-vision',
]

const DATE_WINDOWS = [
  { label: '1h', value: 60 },
  { label: '6h', value: 360 },
  { label: '24h', value: 1440 },
  { label: '7d', value: 10080 },
]

export interface FeedFilterState {
  group: Group | null
  topic: string | null
  windowMinutes: number
  minImportance: number
}

interface FeedFiltersProps {
  filters: FeedFilterState
  onChange: (f: FeedFilterState) => void
  totalCount: number
  filteredCount: number
}

const btn = (active: boolean) =>
  `text-xs px-3 py-1.5 rounded-lg border whitespace-nowrap transition-colors shrink-0 ${
    active
      ? 'bg-accent/10 border-accent/30 text-accent font-medium'
      : 'border-border-default text-text-muted hover:text-text-primary hover:border-surface-3'
  }`

export default function FeedFilters({ filters, onChange, totalCount, filteredCount }: FeedFiltersProps) {
  const set = (partial: Partial<FeedFilterState>) => onChange({ ...filters, ...partial })

  return (
    <div className="bg-surface-1 border-b border-border-default shrink-0">
      {/* Row 1: Groups + Window */}
      <div className="scroll-x-hidden px-4 py-2.5 flex items-center gap-2 border-b border-border-default/50">
        <span className="text-[11px] font-medium text-text-muted shrink-0 uppercase tracking-wide">Group</span>
        <button onClick={() => set({ group: null })} className={btn(filters.group === null)}>All</button>
        {GROUPS.map((g) => (
          <button key={g} onClick={() => set({ group: filters.group === g ? null : g })} className={btn(filters.group === g)}>
            {g}
          </button>
        ))}
        <div className="w-px h-4 bg-border-default mx-1 shrink-0" />
        <span className="text-[11px] font-medium text-text-muted shrink-0 uppercase tracking-wide">Window</span>
        {DATE_WINDOWS.map(({ label, value }) => (
          <button key={label} onClick={() => set({ windowMinutes: value })} className={btn(filters.windowMinutes === value)}>
            {label}
          </button>
        ))}
      </div>

      {/* Row 2: Topic + Score + Count */}
      <div className="px-4 py-2 flex items-center gap-3 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] font-medium text-text-muted shrink-0 uppercase tracking-wide">Topic</span>
          <select
            value={filters.topic ?? ''}
            onChange={(e) => set({ topic: e.target.value || null })}
            className="text-xs bg-surface-2 border border-border-default text-text-secondary rounded-lg px-2.5 py-1.5 outline-none hover:border-surface-3 focus:border-accent/50 transition-colors min-w-[120px]"
          >
            <option value="">All topics</option>
            {TOPICS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-text-muted shrink-0 uppercase tracking-wide">Score ≥</span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={filters.minImportance}
            onChange={(e) => set({ minImportance: Number(e.target.value) })}
            className="w-20 accent-accent"
          />
          <span className="text-xs font-mono text-text-secondary w-7 tabular-nums">{filters.minImportance}</span>
        </div>

        <div className="flex-1 text-right">
          <span className="text-xs font-mono text-text-muted">
            <span className="text-text-secondary font-medium">{filteredCount}</span>
            <span className="text-text-muted">/{totalCount}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
