import { Link } from 'react-router-dom'
import type { FeedPost, Platform } from '../../types'
import TagPill from './TagPill'

interface PostCardProps {
  post: FeedPost
  compact?: boolean
}

const INTENT_BADGE: Record<string, { label: string; color: string }> = {
  research: { label: 'Research', color: 'text-blue-400 bg-blue-900/30 border-blue-800/40' },
  education: { label: 'Education', color: 'text-sky-400 bg-sky-900/30 border-sky-800/40' },
  product: { label: 'Product', color: 'text-accent bg-accent/10 border-accent/30' },
  demo: { label: 'Demo', color: 'text-emerald-400 bg-emerald-900/30 border-emerald-800/40' },
  opinion: { label: 'Opinion', color: 'text-amber-400 bg-amber-900/30 border-amber-800/40' },
  startup: { label: 'Startup', color: 'text-orange-400 bg-orange-900/30 border-orange-800/40' },
  policy: { label: 'Policy', color: 'text-rose-400 bg-rose-900/30 border-rose-800/40' },
  prompting: { label: 'Prompting', color: 'text-purple-400 bg-purple-900/30 border-purple-800/40' },
  creative: { label: 'Creative', color: 'text-pink-400 bg-pink-900/30 border-pink-800/40' },
}

const PLATFORM_LABEL: Partial<Record<Platform, string>> = {
  x: 'X',
  rss: 'RSS',
  bluesky: 'Bluesky',
  arxiv: 'arXiv',
  hackernews: 'HN',
}

export default function PostCard({ post, compact = false }: PostCardProps) {
  const badge = INTENT_BADGE[post.intent] ?? { label: post.intent, color: 'text-text-muted bg-surface-3 border-border-default' }
  const score = Math.round(post.importanceScore * 100)
  const platformLabel = PLATFORM_LABEL[post.platform] ?? post.platform

  return (
    <div className="bg-surface-1 border border-border-default rounded-lg p-4 hover:border-surface-3 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar name={post.displayName} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                to={`/people/${post.handle.replace('@', '')}`}
                className="text-sm font-semibold text-text-primary hover:text-accent transition-colors truncate"
              >
                {post.displayName}
              </Link>
              <span className="text-xs text-text-muted font-mono">{post.handle}</span>
              <TagPill label={post.group} variant="group" />
            </div>
            <p className="text-2xs text-text-muted font-mono mt-0.5">
              {formatTime(post.postedAt)}
              {post.platform !== 'x' && (
                <span className="ml-1.5 opacity-60">· {platformLabel}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-2xs font-medium px-1.5 py-0.5 rounded border ${badge.color}`}>
            {badge.label}
          </span>
          <ScoreBar score={score} />
        </div>
      </div>

      {!compact && (
        <p className="text-xs text-text-muted leading-relaxed mb-2 line-clamp-2">{post.text}</p>
      )}

      <p className="text-sm text-text-secondary leading-relaxed mb-3">{post.summary}</p>

      {post.whyItMatters && !compact && (
        <p className="text-xs text-text-muted italic mb-2 border-l-2 border-accent/30 pl-2">{post.whyItMatters}</p>
      )}

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex flex-wrap gap-1">
          {post.topics.slice(0, 4).map((t) => (
            <TagPill key={t} label={t} />
          ))}
        </div>

        <div className="flex items-center gap-3 text-2xs text-text-muted font-mono">
          {post.engagement.likes > 0 && (
            <span title="Likes">♥ {fmtNum(post.engagement.likes)}</span>
          )}
          {post.engagement.reposts > 0 && (
            <span title="Reposts">↺ {fmtNum(post.engagement.reposts)}</span>
          )}
          {isRealUrl(post.platform, post.url) ? (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover"
            >
              View →
            </a>
          ) : (
            <span className="text-text-muted line-through" title="Live link available after sync">View →</span>
          )}
        </div>
      </div>
    </div>
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
      className="w-7 h-7 rounded-full flex items-center justify-center text-2xs font-semibold shrink-0"
      style={{ backgroundColor: `hsl(${hue}, 35%, 25%)`, color: `hsl(${hue}, 70%, 70%)` }}
    >
      {initials}
    </div>
  )
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? 'bg-fresh' : score >= 70 ? 'bg-accent' : score >= 50 ? 'bg-delayed' : 'bg-surface-3'
  return (
    <div className="flex items-center gap-1" title={`Importance: ${score}/100`}>
      <div className="w-12 h-1.5 bg-surface-3 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-2xs font-mono text-text-muted">{score}</span>
    </div>
  )
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = Date.now()
  const diff = now - d.getTime()
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

// X tweet URLs need a real status ID (≥10 digits).
// All other platforms (RSS, Bluesky, arXiv, HN) always have valid URLs.
function isRealUrl(platform: Platform, url: string): boolean {
  if (platform !== 'x') return true
  const match = url.match(/\/status\/(\d+)$/)
  return match !== null && match[1].length >= 10
}
