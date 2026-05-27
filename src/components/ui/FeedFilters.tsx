import type { Group } from '../../types'

const GROUPS: Group[] = ['Research', 'Frontier', 'Builders', 'Business', 'Media', 'Creative']

const TOPICS = [
  'llms', 'agents', 'research-papers', 'frontier-models', 'open-source',
  'startup-ideas', 'monetization', 'prompting', 'images-video', 'developer-workflows',
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

export default function FeedFilters({ filters, onChange, totalCount, filteredCount }: FeedFiltersProps) {
  const set = (partial: Partial<FeedFilterState>) => onChange({ ...filters, ...partial })

  return (
    <div className="bg-surface-1 border-b border-border-default px-4 py-3 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-2xs text-text-muted mr-1">Group</span>
        <button
          onClick={() => set({ group: null })}
          className={`text-2xs px-2 py-1 rounded border transition-colors ${
            filters.group === null
              ? 'bg-accent/10 border-accent/30 text-accent'
              : 'border-border-default text-text-muted hover:text-text-primary'
          }`}
        >
          All
        </button>
        {GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => set({ group: filters.group === g ? null : g })}
            className={`text-2xs px-2 py-1 rounded border transition-colors ${
              filters.group === g
                ? 'bg-accent/10 border-accent/30 text-accent'
                : 'border-border-default text-text-muted hover:text-text-primary'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-border-default hidden sm:block" />

      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-2xs text-text-muted mr-1">Topic</span>
        <select
          value={filters.topic ?? ''}
          onChange={(e) => set({ topic: e.target.value || null })}
          className="text-2xs bg-surface-2 border border-border-default text-text-secondary rounded px-2 py-1 outline-none hover:border-surface-3"
        >
          <option value="">All topics</option>
          {TOPICS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="w-px h-5 bg-border-default hidden sm:block" />

      <div className="flex items-center gap-1">
        <span className="text-2xs text-text-muted mr-1">Window</span>
        {DATE_WINDOWS.map(({ label, value }) => (
          <button
            key={label}
            onClick={() => set({ windowMinutes: value })}
            className={`text-2xs px-2 py-1 rounded border transition-colors ${
              filters.windowMinutes === value
                ? 'bg-accent/10 border-accent/30 text-accent'
                : 'border-border-default text-text-muted hover:text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-border-default hidden sm:block" />

      <div className="flex items-center gap-2">
        <span className="text-2xs text-text-muted">Min score</span>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={filters.minImportance}
          onChange={(e) => set({ minImportance: Number(e.target.value) })}
          className="w-20 accent-accent"
        />
        <span className="text-2xs font-mono text-text-muted w-6">{filters.minImportance}</span>
      </div>

      <div className="flex-1" />

      <span className="text-2xs font-mono text-text-muted">
        {filteredCount}/{totalCount}
      </span>
    </div>
  )
}
