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
  'ai-safety': '🛡️',
  'ai-impact': '🌍',
  multimodal: '🎭',
  education: '🎓',
  startups: '🚀',
  'computer-vision': '👁️',
  'ai-agents': '🤖',
  'ai-policy': '📋',
}

export default function TopicCard({ topic }: TopicCardProps) {
  const icon = TOPIC_ICONS[topic.slug] ?? '📌'

  return (
    <Link
      to={`/topics#${topic.slug}`}
      className="block bg-surface-1 border border-border-default rounded-xl p-4 hover:border-surface-3 hover:bg-surface-2/20 transition-all duration-150"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl leading-none shrink-0">{icon}</span>
          <span className="text-sm font-semibold text-text-primary leading-snug">{topic.label}</span>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-semibold text-accent tabular-nums leading-none">{topic.postCount24h}</p>
          <p className="text-[10px] text-text-muted mt-0.5">/ 24h</p>
        </div>
      </div>

      {topic.summary && (
        <p className="text-xs text-text-muted leading-relaxed mb-2.5 line-clamp-2">{topic.summary}</p>
      )}

      <div className="flex flex-wrap gap-1">
        {topic.topHandles.slice(0, 3).map((h) => (
          <span key={h} className="text-[10px] font-mono text-text-muted/70 bg-surface-2 border border-border-subtle px-1.5 py-0.5 rounded-md">
            {h}
          </span>
        ))}
      </div>
    </Link>
  )
}
