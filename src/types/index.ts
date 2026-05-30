export type Platform = 'x' | 'rss' | 'bluesky' | 'arxiv' | 'hackernews' | 'reddit' | 'youtube' | 'producthunt' | 'devto'

export type Group =
  | 'Research'
  | 'Frontier'
  | 'Builders'
  | 'Business'
  | 'Media'
  | 'Creative'

export type Intent =
  | 'research'
  | 'education'
  | 'product'
  | 'demo'
  | 'opinion'
  | 'startup'
  | 'policy'
  | 'prompting'
  | 'creative'

export type Stance = 'positive' | 'neutral' | 'critical' | 'mixed'

export type FreshnessState = 'fresh' | 'delayed' | 'stale'

export interface Manifest {
  generatedAt: string
  sourcePlatform: Platform
  sourceCount: number
  postWindowHours: number
  dataVersion: string
}

export interface FeedPost {
  id: string
  platform: Platform
  handle: string
  displayName: string
  group: Group
  postedAt: string
  text: string
  summary: string
  topics: string[]
  intent: Intent
  importanceScore: number
  stance?: Stance
  whyItMatters?: string
  engagement: {
    likes: number
    reposts: number
    replies: number
    quotes: number
  }
  url: string
}

export interface Person {
  handle: string
  displayName: string
  group: Group
  lastPostedAt: string
  posts7d: number
  topTopics: string[]
  currentFocus: string
  avatarInitials?: string
}

export interface Topic {
  slug: string
  label: string
  postCount24h: number
  summary: string
  topHandles: string[]
  posts: FeedPost[]
}

export interface Briefing {
  id: string
  window: '1h' | '24h' | '7d'
  title: string
  generatedAt: string
  summary: string
  highlights: string[]
  topEntities: string[]
  debates: string[]
  recommendedPostIds: string[]
}

export interface OverviewData {
  generatedAt: string
  stats: {
    trackedAccounts: number
    posts24h: number
    importantPosts1h: number
    activeTopics: number
  }
  topSignals: FeedPost[]
  topicLeaders: { slug: string; label: string; postCount24h: number; topHandles: string[] }[]
  activePeople: Person[]
  latestFeed: FeedPost[]
}

export interface PeopleData {
  generatedAt: string
  people: Person[]
}

export interface TopicsData {
  generatedAt: string
  topics: Topic[]
}

export interface BriefingsData {
  generatedAt: string
  briefings: Briefing[]
}

export interface FeedData {
  generatedAt: string
  posts: FeedPost[]
}
