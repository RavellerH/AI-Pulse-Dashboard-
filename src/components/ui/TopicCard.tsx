import { Link } from 'react-router-dom'
import type { Topic } from '../../types'

interface TopicCardProps {
  topic: Topic
}

const TOPIC_ICONS: Record<string, string> = {
  llms: '🧠',
  agents: '🤖',
  'research-papers': '📄',
  'frontier-models': '🚀',
  'open-source': '⚡',
  'startup-ideas': '💡',
  monetization: '💰',
  prompting: '✍️',
  'images-video': '🎨',
  'developer-workflows': '⚙️',
}

export default function TopicCard({ topic }: TopicCardProps) {
  const icon = TOPIC_ICONS[topic.slug] ?? '📌'

  return (
    <Link
      to={`/topics#${topic.slug}`}
      className="block bg-surface-1 border border-border-default rounded-lg p-4 hover:border-surface-3 transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{icon}</span>
          <span className="text-sm font-semibold text-text-primary">{topic.label}</span>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-accent tabular-nums">{topic.postCount24h}</p>
          <p className="text-2xs text-text-muted">posts/24h</p>
        </div>
      </div>

      <p className="text-xs text-text-secondary leading-relaxed mb-3 line-clamp-2">{topic.summary}</p>

      <div className="flex flex-wrap gap-1">
        {topic.topHandles.slice(0, 4).map((h) => (
          <span key={h} className="text-2xs font-mono text-text-muted bg-surface-2 border border-border-default px-1.5 py-0.5 rounded">
            {h}
          </span>
        ))}
      </div>
    </Link>
  )
}
