import { useTopics } from '../hooks/useData'
import TopicCard from '../components/ui/TopicCard'
import PostCard from '../components/ui/PostCard'
import { ErrorState } from '../components/ui/EmptyState'
import type { Topic } from '../types'

export default function Topics() {
  const { data, loading, error } = useTopics()

  if (error) return <div className="p-6"><ErrorState message={error} /></div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-surface-1 border border-border-default rounded-lg p-4 h-28 animate-pulse" />
            ))
          : data?.topics.map((t) => <TopicCard key={t.slug} topic={t} />)}
      </div>

      <div className="space-y-8">
        {loading
          ? null
          : data?.topics.map((t: Topic) => (
              <TopicSection key={t.slug} topic={t} />
            ))}
      </div>
    </div>
  )
}

function TopicSection({ topic }: { topic: Topic }) {
  if (!topic.posts.length) return null

  return (
    <div id={topic.slug} className="scroll-mt-16 space-y-3">
      <div className="flex items-baseline justify-between border-b border-border-default pb-2">
        <h2 className="text-base font-semibold text-text-primary">{topic.label}</h2>
        <span className="text-xs font-mono text-text-muted">{topic.postCount24h} posts / 24h</span>
      </div>
      <p className="text-sm text-text-secondary">{topic.summary}</p>
      <div className="space-y-2">
        {topic.posts.slice(0, 5).map((p) => (
          <PostCard key={p.id} post={p} compact />
        ))}
      </div>
    </div>
  )
}
