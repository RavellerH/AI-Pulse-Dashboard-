import { useState, useEffect } from 'react'
import type {
  Manifest,
  OverviewData,
  FeedData,
  PeopleData,
  TopicsData,
  BriefingsData,
  FreshnessState,
} from '../types'

const BASE = import.meta.env.BASE_URL

async function fetchData<T>(path: string): Promise<T> {
  const url = `${BASE}data/${path}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.json() as Promise<T>
}

export function getFreshnessState(generatedAt: string): FreshnessState {
  const ageMs = Date.now() - new Date(generatedAt).getTime()
  const ageMinutes = ageMs / 1000 / 60
  if (ageMinutes <= 90) return 'fresh'
  if (ageMinutes <= 240) return 'delayed'
  return 'stale'
}

export function useManifest() {
  return useJsonData<Manifest>('manifest.json')
}

export function useOverview() {
  return useJsonData<OverviewData>('overview.json')
}

export function useFeed() {
  return useJsonData<FeedData>('feed.json')
}

export function usePeople() {
  return useJsonData<PeopleData>('people.json')
}

export function useTopics() {
  return useJsonData<TopicsData>('topics.json')
}

export function useBriefings() {
  return useJsonData<BriefingsData>('briefings.json')
}

function useJsonData<T>(path: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchData<T>(path)
      .then((d) => {
        if (!cancelled) {
          setData(d)
          setLoading(false)
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Unknown error')
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [path])

  return { data, loading, error }
}
