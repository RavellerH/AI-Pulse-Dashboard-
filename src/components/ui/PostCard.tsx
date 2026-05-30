import { Link } from 'react-router-dom'
import type { FeedPost, Platform } from '../../types'
import TagPill from './TagPill'

interface PostCardProps {
  post: FeedPost
  compact?: boolean
}

const INTENT_BADGE: Record<string, { label: string; color: string }> = {
  research:  { label: 'Research',  color: 'text-blue-400 bg-blue-950/60 border-blue-800/50' },
  education: { label: 'Education', color: 'text-sky-400 bg-sky-950/60 border-sky-800/50' },
  product:   { label: 'Product',   color: 'text-accent bg-accent/10 border-accent/30' },
  demo:      { label: 'Demo',      color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50' },
  opinion:   { label: 'Opinion',   color: 'text-amber-400 bg-amber-950/60 border-amber-800/50' },
  vision:    { label: 'Vision',    color: 'text-violet-400 bg-violet-950/60 border-violet-800/50' },
  startup:   { label: 'Startup',   color: 'text-orange-400 bg-orange-950/60 border-orange-800/50' },
  policy:    { label: 'Policy',    color: 'text-rose-400 bg-rose-950/60 border-rose-800/50' },
  prompting: { label: 'Prompting', color: 'text-purple-400 bg-purple-950/60 border-purple-800/50' },
  creative:  { label: 'Creative',  color: 'text-pink-400 bg-pink-950/60 border-pink-800/50' },
}

const PLATFORM_META: Partial<Record<Platform, { label: string; color: string }>> = {
  x:           { label: 'X',          color: 'text-sky-400 bg-sky-400/10' },
  rss:         { label: 'RSS',        color: 'text-orange-400 bg-orange-400/10' },
  bluesky:     { label: 'Bluesky',    color: 'text-blue-400 bg-blue-400/10' },
  arxiv:       { label: 'arXiv',      color: 'text-rose-400 bg-rose-400/10' },
  hackernews:  { label: 'HN',         color: 'text-orange-500 bg-orange-500/10' },
  reddit:      { label: 'Reddit',     color: 'text-orange-400 bg-orange-400/10' },
  youtube:     { label: 'YouTube',    color: 'text-red-500 bg-red-500/10' },
  producthunt: { label: 'PH',         color: 'text-orange-400 bg-orange-400/10' },
  devto:       { label: 'dev.to',     color: 'text-indigo-400 bg-indigo-400/10' },
}

export default function PostCard({ post, compact = false }: PostCardProps) {
  const badge = INTENT_BADGE[post.intent] ?? { label: post.intent, color: 'text-text-muted bg-surface-3 border-border-default' }
  const score = Math.round(post.importanceScore * 100)
  const platform = PLATFORM_META[post.platform] ?? { label: post.platform, color: 'text-text-muted bg-surface-2' }

  return (
    <article className="bg-surface-1 border border-border-default rounded-xl p-4 hover:border-surface-3 hover:bg-surface-1/80 transition-all duration-150">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar name={post.displayName} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  to={`/people/${post.handle.replace('@', '')}`}
                  className="text-sm font-semibold text-text-primary hover:text-accent transition-colors"
                >
                  {post.displayName}
                </Link>
                <TagPill label={post.group} variant="group" />
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-xs text-text-muted font-mono">{post.handle}</span>
                <span className="text-text-muted/40 text-xs">·</span>
                <span className="text-xs text-text-muted">{formatTime(post.postedAt)}</span>
                {post.platform !== 'x' && (
                  <>
                    <span className="text-text-muted/40 text-xs">·</span>
                    <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md ${platform.color}`}>
                      {platform.label}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Intent + Score */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded border leading-tight ${badge.color}`}>
                {badge.label}
              </span>
              <ScoreBar score={score} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {!compact && post.text && (
        <p className="text-xs text-text-muted leading-relaxed mb-2 line-clamp-2 ml-10">
          {post.text}
        </p>
      )}

      <p className="text-sm text-text-secondary leading-relaxed mb-2.5 ml-10">
        {post.summary}
      </p>

      {post.whyItMatters && !compact && (
        <div className="ml-10 mb-2.5 pl-3 border-l-2 border-accent/30">
          <p className="text-xs text-text-muted/80 italic leading-relaxed">
            {post.whyItMatters}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 ml-10 flex-wrap">
        <div className="flex flex-wrap gap-1">
          {post.topics.slice(0, 3).map((t) => (
            <TagPill key={t} label={t} />
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-text-muted font-mono shrink-0">
          {post.engagement.likes > 0 && (
            <span title="Likes" className="flex items-center gap-1">
              <span className="text-rose-400/70">♥</span>{fmtNum(post.engagement.likes)}
            </span>
          )}
          {post.engagement.replies > 0 && (
            <span title="Replies" className="flex items-center gap-1">
              <span className="opacity-60">💬</span>{fmtNum(post.engagement.replies)}
            </span>
          )}
          {isRealUrl(post.platform, post.url) ? (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover font-medium transition-colors"
            >
              View →
            </a>
          ) : (
            <span className="text-text-muted/40 line-through text-xs" title="Live link available after sync">
              View →
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5"
      style={{ backgroundColor: `hsl(${hue}, 30%, 22%)`, color: `hsl(${hue}, 70%, 72%)` }}
    >
      {initials}
    </div>
  )
}

function ScoreBar({ score }: { score: number }) {
  const barColor = score >= 85 ? 'bg-fresh' : score >= 70 ? 'bg-accent' : score >= 50 ? 'bg-delayed' : 'bg-surface-3'
  const textColor = score >= 85 ? 'text-fresh' : score >= 70 ? 'text-accent' : 'text-text-muted'
  return (
    <div className="flex items-center gap-1" title={`Importance: ${score}/100`}>
      <div className="w-10 h-1 bg-surface-3 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-[10px] font-mono tabular-nums ${textColor}`}>{score}</span>
    </div>
  )
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function fmtNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function isRealUrl(platform: Platform, url: string): boolean {
  if (platform !== 'x') return true
  const match = url.match(/\/status\/(\d+)$/)
  return match !== null && match[1].length >= 10
}
