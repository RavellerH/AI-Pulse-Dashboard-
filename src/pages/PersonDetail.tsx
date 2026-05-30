import { useParams, Link } from 'react-router-dom'
import { usePeople, useFeed } from '../hooks/useData'
import PostCard from '../components/ui/PostCard'
import TagPill from '../components/ui/TagPill'
import { ListSkeleton } from '../components/ui/LoadingSkeleton'
import EmptyState, { ErrorState } from '../components/ui/EmptyState'

export default function PersonDetail() {
  const { handle } = useParams<{ handle: string }>()
  const { data: peopleData, loading: loadingPeople, error: errorPeople } = usePeople()
  const { data: feedData, loading: loadingFeed, error: errorFeed } = useFeed()

  const person = peopleData?.people.find((p) => p.handle.replace('@', '') === handle)

  const posts = feedData?.posts
    .filter((p) => p.handle.replace('@', '') === handle)
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
    ?? []

  const topicCounts = posts.reduce<Record<string, number>>((acc, p) => {
    p.topics.forEach((t) => { acc[t] = (acc[t] ?? 0) + 1 })
    return acc
  }, {})

  const sortedTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)

  if (errorPeople || errorFeed) {
    return <div className="p-4"><ErrorState message={errorPeople ?? errorFeed ?? 'Unknown error'} /></div>
  }

  if (!loadingPeople && !person) {
    return (
      <div className="p-4 text-center">
        <EmptyState title={`@${handle} not found`} message="This account is not in the tracked source set." />
        <Link to="/people" className="mt-4 inline-block text-sm text-accent hover:text-accent-hover">← Back to People</Link>
      </div>
    )
  }

  const initials = person?.displayName.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() ?? '??'
  const hue = person ? [...person.displayName].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360 : 200

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 space-y-5">
      <Link to="/people" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors">
        ← People
      </Link>

      {/* Profile card */}
      <div className="bg-surface-1 border border-border-default rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-semibold shrink-0"
            style={{ backgroundColor: `hsl(${hue}, 30%, 22%)`, color: `hsl(${hue}, 70%, 72%)` }}
          >
            {loadingPeople ? '?' : initials}
          </div>
          <div className="flex-1 min-w-0">
            {loadingPeople ? (
              <div className="space-y-2">
                <div className="h-5 w-40 bg-surface-3 rounded animate-pulse" />
                <div className="h-3.5 w-24 bg-surface-3 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-semibold text-text-primary">{person?.displayName}</h1>
                  {person && <TagPill label={person.group} variant="group" />}
                </div>
                <p className="text-sm font-mono text-text-muted mt-0.5">{person?.handle}</p>
              </>
            )}
          </div>
          {person && (
            <div className="text-right shrink-0">
              <p className="text-2xl font-semibold text-accent tabular-nums">{person.posts7d}</p>
              <p className="text-xs text-text-muted">posts / 7d</p>
            </div>
          )}
        </div>

        {person && (
          <div className="mt-4 p-3 bg-surface-2 rounded-lg border-l-2 border-accent/40">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Current Focus</p>
            <p className="text-sm text-text-secondary leading-relaxed">{person.currentFocus}</p>
          </div>
        )}
      </div>

      {/* Topic distribution */}
      {sortedTopics.length > 0 && (
        <div className="bg-surface-1 border border-border-default rounded-xl p-4">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">Topic Distribution</p>
          <div className="space-y-2.5">
            {sortedTopics.map(([topic, count]) => (
              <div key={topic} className="flex items-center gap-3">
                <span className="text-xs text-text-secondary w-32 truncate shrink-0">{topic}</span>
                <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent/50 rounded-full"
                    style={{ width: `${(count / posts.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-text-muted w-5 text-right shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent posts */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-semibold text-text-primary">Recent Posts</h2>
          <span className="text-xs text-text-muted">{posts.length} in dataset</span>
        </div>
        {loadingFeed ? (
          <ListSkeleton count={4} />
        ) : posts.length === 0 ? (
          <EmptyState title="No posts found" message="No posts from this account in the current dataset." />
        ) : (
          <div className="space-y-3">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </section>
    </div>
  )
}
