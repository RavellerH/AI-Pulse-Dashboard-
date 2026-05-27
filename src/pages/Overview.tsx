import { Link } from 'react-router-dom'
import { useOverview } from '../hooks/useData'
import KpiCard from '../components/ui/KpiCard'
import PostCard from '../components/ui/PostCard'
import PersonCard from '../components/ui/PersonCard'
import TopicCard from '../components/ui/TopicCard'
import { KpiSkeleton, PostCardSkeleton, PersonCardSkeleton } from '../components/ui/LoadingSkeleton'
import { ErrorState } from '../components/ui/EmptyState'
import type { FeedPost } from '../types'

export default function Overview() {
  const { data, loading, error } = useOverview()

  if (error) return <div className="p-6"><ErrorState message={error} /></div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading ? (
          <>
            <KpiSkeleton /><KpiSkeleton /><KpiSkeleton /><KpiSkeleton />
          </>
        ) : data ? (
          <>
            <KpiCard label="Tracked Accounts" value={data.stats.trackedAccounts} />
            <KpiCard label="Posts / 24h" value={data.stats.posts24h} />
            <KpiCard label="Active Topics" value={data.stats.activeTopics} />
            <KpiCard label="Important / 1h" value={data.stats.importantPosts1h} accent />
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-3">
          <SectionHeader title="Top Signals Now" sub="Highest importance in last hour" link="/feed" />
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <PostCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="space-y-3">
              {(data?.topSignals ?? []).map((p: FeedPost) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-3">
          <SectionHeader title="Most Active" sub="Posting momentum this week" link="/people" />
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => <PersonCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="space-y-2">
              {(data?.activePeople ?? []).slice(0, 6).map((p) => (
                <PersonCard key={p.handle} person={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <SectionHeader title="Topic Clusters" sub="Rising themes across tracked accounts" link="/topics" />
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-surface-1 border border-border-default rounded-lg p-4 h-24 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {(data?.topicLeaders ?? []).map((t) => (
              <TopicCard key={t.slug} topic={{ ...t, summary: '', posts: [] }} />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <SectionHeader title="Latest Feed" sub="Most recent across all accounts" link="/feed" />
        <div className="space-y-2">
          {loading ? (
            [1, 2, 3].map((i) => <PostCardSkeleton key={i} />)
          ) : (
            (data?.latestFeed ?? []).slice(0, 5).map((p: FeedPost) => (
              <PostCard key={p.id} post={p} compact />
            ))
          )}
        </div>
        {!loading && (
          <Link to="/feed" className="block text-center py-2 text-sm text-accent hover:text-accent-hover transition-colors">
            View full feed →
          </Link>
        )}
      </div>
    </div>
  )
}

function SectionHeader({ title, sub, link }: { title: string; sub: string; link: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <div>
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        <p className="text-xs text-text-muted">{sub}</p>
      </div>
      <Link to={link} className="text-xs text-accent hover:text-accent-hover transition-colors shrink-0">
        See all →
      </Link>
    </div>
  )
}
