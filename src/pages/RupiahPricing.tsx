import { useState, useEffect, useRef } from 'react'

// ── types ──────────────────────────────────────────────────────────────────
type RatePoint = { date: string; rate: number }

// ── constants ─────────────────────────────────────────────────────────────
const BASELINE_RATE = 15500 // Jan 2024 opening (~15,439–15,550 per historical data)
const FALLBACK_RATE = 17863  // May 30 2026 observed
const THRESHOLD_20K = 20000  // worst-case watch level

const PLANS = [
  { service: 'GitHub Copilot',  provider: 'GitHub',     usd: 10,    badge: 'Dev',      bc: 'text-slate-300 bg-slate-500/15 border-slate-500/30' },
  { service: 'Midjourney Basic',provider: 'Midjourney', usd: 10,    badge: 'Creative', bc: 'text-pink-300 bg-pink-500/15 border-pink-500/30' },
  { service: 'Gemini Advanced', provider: 'Google',     usd: 19.99, badge: 'Consumer', bc: 'text-blue-300 bg-blue-500/15 border-blue-500/30' },
  { service: 'Claude Pro',      provider: 'Anthropic',  usd: 20,    badge: 'Consumer', bc: 'text-orange-300 bg-orange-500/15 border-orange-500/30' },
  { service: 'ChatGPT Plus',    provider: 'OpenAI',     usd: 20,    badge: 'Consumer', bc: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30' },
  { service: 'Cursor Pro',      provider: 'Cursor',     usd: 20,    badge: 'Dev',      bc: 'text-sky-300 bg-sky-500/15 border-sky-500/30' },
  { service: 'Perplexity Pro',  provider: 'Perplexity', usd: 20,    badge: 'Consumer', bc: 'text-purple-300 bg-purple-500/15 border-purple-500/30' },
  { service: 'Claude Max',      provider: 'Anthropic',  usd: 100,   badge: 'Power',    bc: 'text-orange-300 bg-orange-500/15 border-orange-500/30' },
  { service: 'ChatGPT Pro',     provider: 'OpenAI',     usd: 200,   badge: 'Power',    bc: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30' },
]

const API_MODELS = [
  { model: 'GPT-4o',           provider: 'OpenAI',    inp: 2.50,  out: 10.00 },
  { model: 'GPT-4o mini',      provider: 'OpenAI',    inp: 0.15,  out: 0.60  },
  { model: 'o1 (reasoning)',   provider: 'OpenAI',    inp: 15.00, out: 60.00 },
  { model: 'Claude Sonnet',    provider: 'Anthropic', inp: 3.00,  out: 15.00 },
  { model: 'Claude Haiku 4.5', provider: 'Anthropic', inp: 0.80,  out: 4.00  },
  { model: 'Gemini 1.5 Pro',   provider: 'Google',    inp: 1.25,  out: 5.00  },
  { model: 'Gemini 1.5 Flash', provider: 'Google',    inp: 0.075, out: 0.30  },
  { model: 'DeepSeek V3',      provider: 'DeepSeek',  inp: 0.27,  out: 1.10  },
  { model: 'DeepSeek R1',      provider: 'DeepSeek',  inp: 0.55,  out: 2.19  },
]

const FREE_LIST = [
  { service: 'Claude.ai',        provider: 'Anthropic', what: 'Limited daily messages using Claude Haiku — no card needed' },
  { service: 'ChatGPT',          provider: 'OpenAI',    what: 'GPT-4o mini unlimited; limited GPT-4o daily' },
  { service: 'Gemini',           provider: 'Google',    what: 'Full Gemini app free; Flash API has a generous free tier' },
  { service: 'Perplexity',       provider: 'Perplexity',what: '5 Pro searches/day; unlimited standard AI search' },
  { service: 'DeepSeek Chat',    provider: 'DeepSeek',  what: 'Free web app; API gives $5 free credits on signup' },
  { service: 'Microsoft Copilot',provider: 'Microsoft', what: 'Free in Windows / Edge / Bing — GPT-4o powered' },
  { service: 'Llama (local)',    provider: 'Meta',      what: 'Run locally for free — no monthly fee ever' },
]

const INCOME_TIERS = [
  { label: 'UMP Nasional',  monthly: 3500000,  note: 'Avg national min wage 2025' },
  { label: 'UMK Jakarta',   monthly: 5396761,  note: 'Jakarta minimum wage 2025' },
  { label: 'Lower Middle',  monthly: 8000000,  note: 'Rp 8 jt/bln gross' },
  { label: 'Middle Class',  monthly: 15000000, note: 'Rp 15 jt/bln gross' },
  { label: 'Upper Middle',  monthly: 25000000, note: 'Rp 25 jt/bln gross' },
]

const AFFORD_USD = [10, 20, 100, 200]

const PEER_META: Record<string, { name: string; flag: string }> = {
  IDR: { name: 'Indonesian Rupiah', flag: '🇮🇩' },
  MYR: { name: 'Malaysian Ringgit',  flag: '🇲🇾' },
  THB: { name: 'Thai Baht',          flag: '🇹🇭' },
  PHP: { name: 'Philippine Peso',    flag: '🇵🇭' },
  SGD: { name: 'Singapore Dollar',   flag: '🇸🇬' },
}

const CONTEXT_ITEMS = [
  {
    title: 'Payment Barriers',
    accent: 'border-red-500/50 bg-red-900/10',
    body: 'Most AI subscriptions require an international Visa/Mastercard. Indonesian local debit cards (BCA, BNI, Mandiri) often fail for international billing. Practical workarounds: Jenius or Blu virtual cards, CIMB Niaga World Mastercard, PayPal (adds ~4% conversion fee).',
  },
  {
    title: 'No Regional Pricing (Yet)',
    accent: 'border-orange-500/50 bg-orange-900/10',
    body: 'Unlike Netflix or Spotify, Claude, ChatGPT, and Cursor charge full USD globally. Google One (Gemini Advanced) offers some regional adjustment. There is no official Indonesian pricing tier for most AI services.',
  },
  {
    title: 'Cumulative Subscription Shock',
    accent: 'border-yellow-500/50 bg-yellow-900/10',
    body: 'A developer using GitHub Copilot ($10) + Cursor Pro ($20) + Claude Pro ($20) pays $50/mo = ~Rp 890rb at current rates. For someone on UMK Jakarta (Rp 5.4 jt), that is 16.5% of gross salary before food, transport, or rent.',
  },
  {
    title: 'Why the Rupiah Keeps Weakening',
    accent: 'border-red-500/50 bg-red-900/10',
    body: "Trump's 32% tariffs on Indonesian exports (effective Q4 2026) are widening the trade deficit. Combined with Fed rate-hold driving capital outflows from EM markets, BI's limited FX reserves, and a current account deficit, the structural pressure toward Rp 20,000 is real. Analysts (LongForecast, ING) model a 17,816–20,646 range for 2026.",
  },
  {
    title: 'Strategic Recommendation',
    accent: 'border-emerald-500/50 bg-emerald-900/10',
    body: 'Use free tiers first. For API access, DeepSeek V3 is ~90% cheaper than GPT-4o with comparable quality. Reserve paid subscriptions only for tools that directly generate income. If buying annual plans, consider paying when the rupiah is seasonally strongest (see Cheapest Month section).',
  },
]

// ── helpers ────────────────────────────────────────────────────────────────
function toIDR(usd: number, rate: number) { return Math.round(usd * rate) }
function fmtShort(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000) return `Rp ${Math.round(n / 1_000)}rb`
  return `Rp ${n}`
}
function fmtFull(n: number) { return 'Rp ' + Math.round(n).toLocaleString('id-ID') }
function fmtTokenPrice(p: number) { return p < 1 ? `$${p.toFixed(3)}` : `$${p.toFixed(2)}` }
function pctBadge(pct: number): [string, string] {
  if (pct < 2)  return ['text-emerald-400', 'fine']
  if (pct < 5)  return ['text-green-400',   'ok']
  if (pct < 10) return ['text-yellow-400',  'notable']
  if (pct < 20) return ['text-orange-400',  'heavy']
  return ['text-red-400', 'crushing']
}
function speedColor(annPct: number) {
  if (annPct < 3)  return 'text-emerald-400'
  if (annPct < 6)  return 'text-yellow-400'
  if (annPct < 10) return 'text-orange-400'
  return 'text-red-400'
}
function speedLabel(annPct: number) {
  if (annPct < 0)  return 'Strengthening'
  if (annPct < 3)  return 'Mild'
  if (annPct < 6)  return 'Moderate'
  if (annPct < 10) return 'Fast'
  return 'Severe'
}
function dispDate(iso: string) {
  const [y, m, d] = iso.split('-')
  const mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${d} ${mo[+m-1]} ${y}`
}
function monthKey(iso: string) { return iso.substring(0, 7) }
function monthLabel(iso: string) {
  const [y, m] = iso.split('-')
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1] + ' ' + y.slice(2)
}
function annualizedRate(start: number, end: number, days: number): number {
  return (Math.pow(end / start, 365 / days) - 1) * 100
}

// ── SVG line chart ─────────────────────────────────────────────────────────
function RateLineChart({ data, baseline }: { data: RatePoint[]; baseline: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(600)
  const [tip, setTip] = useState<{ idx: number; x: number; y: number } | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setW(el.clientWidth))
    ro.observe(el)
    setW(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  if (data.length < 2) {
    return (
      <div className="h-44 flex flex-col items-center justify-center gap-2">
        <p className="text-sm text-text-muted">Chart data unavailable</p>
        <p className="text-xs text-text-muted opacity-60">
          Historical rates could not be fetched — live rate still active above
        </p>
      </div>
    )
  }

  const H = 172
  const PL = 56, PR = 12, PT = 10, PB = 28
  const cW = w - PL - PR
  const cH = H - PT - PB

  const vals = data.map(d => d.rate)
  const rawMin = Math.min(...vals, baseline)
  const rawMax = Math.max(...vals, baseline)
  const pad = (rawMax - rawMin) * 0.08
  const minV = rawMin - pad
  const maxV = rawMax + pad

  const xp = (i: number) => PL + (i / (data.length - 1)) * cW
  const yp = (v: number) => PT + cH - ((v - minV) / (maxV - minV)) * cH

  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xp(i).toFixed(1)},${yp(d.rate).toFixed(1)}`).join(' ')
  const fill = `${line} L${(PL + cW).toFixed(1)},${(PT + cH).toFixed(1)} L${PL},${(PT + cH).toFixed(1)}Z`

  // Y ticks: 4 evenly spaced
  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((minV + ((maxV - minV) / 4) * i) / 500) * 500)

  // X labels: first occurrence of each month, show every 2nd
  const xLabels: { label: string; x: number }[] = []
  let lastMo = ''
  data.forEach((d, i) => {
    const mk = monthKey(d.date)
    if (mk !== lastMo) { xLabels.push({ label: monthLabel(d.date), x: xp(i) }); lastMo = mk }
  })
  const shown = xLabels.filter((_, i) => i % 2 === 0)

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mx = e.clientX - rect.left - PL
    const idx = Math.max(0, Math.min(data.length - 1, Math.round((mx / cW) * (data.length - 1))))
    setTip({ idx, x: xp(idx), y: yp(data[idx].rate) })
  }

  return (
    <div ref={containerRef} className="relative w-full select-none">
      <svg width={w} height={H} onMouseMove={handleMove} onMouseLeave={() => setTip(null)} className="cursor-crosshair">
        <defs>
          <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f87171" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#f87171" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {yTicks.map(t => (
          <g key={t}>
            <line x1={PL} y1={yp(t)} x2={PL + cW} y2={yp(t)} stroke="#ffffff0c" strokeWidth="1" />
            <text x={PL - 4} y={yp(t) + 4} textAnchor="end" fontSize="10" fill="#4b5563">{(t/1000).toFixed(0)}k</text>
          </g>
        ))}

        {/* Baseline reference */}
        <line x1={PL} y1={yp(baseline)} x2={PL + cW} y2={yp(baseline)} stroke="#6b728060" strokeWidth="1" strokeDasharray="4,3" />
        <text x={PL + 4} y={yp(baseline) - 3} fontSize="9" fill="#6b728099">
          Jan'24 {(baseline/1000).toFixed(1)}k
        </text>

        <path d={fill} fill="url(#rg)" />
        <path d={line} fill="none" stroke="#f87171" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />

        {shown.map(({ label, x }) => (
          <text key={label} x={x} y={H - 6} textAnchor="middle" fontSize="10" fill="#4b5563">{label}</text>
        ))}

        {tip && (
          <>
            <line x1={tip.x} y1={PT} x2={tip.x} y2={PT + cH} stroke="#ffffff25" strokeWidth="1" />
            <circle cx={tip.x} cy={tip.y} r="4" fill="#f87171" stroke="#0f172a" strokeWidth="2" />
          </>
        )}
      </svg>

      {tip && (
        <div
          className="absolute pointer-events-none bg-surface-1 border border-border-default rounded-lg px-2.5 py-1.5 text-xs shadow-xl z-10"
          style={{ left: Math.min(tip.x + 10, w - 130), top: Math.max(tip.y - 44, 0) }}
        >
          <p className="font-semibold text-text-primary tabular-nums">{data[tip.idx].rate.toLocaleString('id-ID')}</p>
          <p className="text-text-muted">{dispDate(data[tip.idx].date)}</p>
        </div>
      )}
    </div>
  )
}

// ── Monthly bar chart ──────────────────────────────────────────────────────
function MonthlyBars({ entries }: { entries: { label: string; avg: number }[] }) {
  if (!entries.length) return null
  const maxAvg = Math.max(...entries.map(e => e.avg))
  const minAvg = Math.min(...entries.map(e => e.avg))
  const span = maxAvg - minAvg || 1
  return (
    <div className="space-y-1.5">
      {entries.map(e => {
        const isMin = e.avg === minAvg
        const pct = 10 + ((e.avg - minAvg) / span) * 85
        return (
          <div key={e.label} className="flex items-center gap-2">
            <span className="text-xs text-text-muted w-12 shrink-0 font-mono">{e.label}</span>
            <div className="flex-1 h-4 bg-surface-3 rounded overflow-hidden">
              <div
                className={`h-full rounded transition-all ${isMin ? 'bg-emerald-500/60' : 'bg-red-400/30'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={`text-xs tabular-nums w-14 text-right shrink-0 ${isMin ? 'text-emerald-400 font-semibold' : 'text-text-muted'}`}>
              {e.avg.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
            </span>
            {isMin && <span className="text-[10px] text-emerald-400 font-medium shrink-0">← best</span>}
          </div>
        )
      })}
    </div>
  )
}

// ── main page ──────────────────────────────────────────────────────────────
export default function RupiahPricing() {
  const [rate, setRate]         = useState<number | null>(null)
  const [rateDate, setRateDate] = useState<string | null>(null)
  const [rateError, setRateError] = useState(false)
  const [historical, setHistorical] = useState<RatePoint[]>([])
  const [histLoading, setHistLoading] = useState(true)
  const [histError, setHistError] = useState(false)
  const [peers, setPeers] = useState<Record<string, { now: number; then: number }>>({})
  const [peersLoading, setPeersLoading] = useState(true)
  const [peersError, setPeersError] = useState(false)

  // break-even slider
  const [income, setIncome] = useState(5396761)
  // cumulative plan selector
  const [cumulPlan, setCumulPlan] = useState(20)

  useEffect(() => {
    fetch('https://api.frankfurter.app/latest?from=USD&to=IDR')
      .then(r => r.json())
      .then(d => { setRate(Math.round(d.rates.IDR)); setRateDate(d.date) })
      .catch(() => { setRate(FALLBACK_RATE); setRateError(true) })
  }, [])

  useEffect(() => {
    const CACHE_KEY = 'idr_hist_v2'
    const todayStr = new Date().toISOString().split('T')[0]

    // Serve from localStorage cache if data was fetched today
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { date, pts } = JSON.parse(cached) as { date: string; pts: RatePoint[] }
        if (date === todayStr && pts.length > 1) {
          setHistorical(pts)
          setHistLoading(false)
          return
        }
      }
    } catch { /* ignore */ }

    const ctrl = new AbortController()
    let done = false

    const save = (pts: RatePoint[]) => {
      setHistorical(pts)
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ date: todayStr, pts })) } catch { /* ignore */ }
    }

    // --- Strategy 1: Frankfurter 1-year daily series ---
    const yr = new Date(); yr.setFullYear(yr.getFullYear() - 1)
    const startStr = yr.toISOString().split('T')[0]
    const timeout1 = setTimeout(() => { if (!done) ctrl.abort() }, 7000)

    fetch(`https://api.frankfurter.app/${startStr}..${todayStr}?from=USD&to=IDR`, { signal: ctrl.signal })
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => {
        if (!d.rates || typeof d.rates !== 'object') throw new Error()
        const pts: RatePoint[] = (Object.entries(d.rates) as [string, { IDR: number }][])
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, v]) => ({ date, rate: Math.round(v.IDR) }))
          .filter(p => Number.isFinite(p.rate))
        if (pts.length < 2) throw new Error()
        done = true
        save(pts)
        setHistLoading(false)
      })
      .catch(() => {
        // --- Strategy 2: jsDelivr currency CDN, one point per month ---
        // Free CDN, no auth, IDR guaranteed, returns fast from edge cache
        const months: string[] = []
        for (let i = 11; i >= 0; i--) {
          const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i)
          months.push(d.toISOString().split('T')[0])
        }
        const ctrl2 = new AbortController()
        const timeout2 = setTimeout(() => ctrl2.abort(), 10000)

        Promise.allSettled(
          months.map(date =>
            fetch(
              `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/usd.min.json`,
              { signal: ctrl2.signal },
            )
              .then(r => r.json())
              .then((j: { usd: Record<string, number> }) => ({
                date,
                rate: Math.round(j.usd.idr),
              }))
          )
        ).then(results => {
          clearTimeout(timeout2)
          const pts: RatePoint[] = results
            .filter((r): r is PromiseFulfilledResult<RatePoint> => r.status === 'fulfilled')
            .map(r => r.value)
            .filter(p => Number.isFinite(p.rate))
          if (pts.length >= 2) {
            done = true
            save(pts)
          } else {
            setHistError(true)
          }
        }).catch(() => setHistError(true))
          .finally(() => setHistLoading(false))
      })
      .finally(() => clearTimeout(timeout1))

    return () => { ctrl.abort() }
  }, [])

  useEffect(() => {
    // jsDelivr currency CDN: free, no auth, all ASEAN currencies guaranteed
    // Codes are lowercase in this API (idr, myr, thb, php, sgd)
    const CODES = ['idr', 'myr', 'thb', 'php', 'sgd']
    const yr = new Date(); yr.setFullYear(yr.getFullYear() - 1)
    const startStr = yr.toISOString().split('T')[0]
    const ctrl = new AbortController()
    const timeout = setTimeout(() => ctrl.abort(), 10000)

    Promise.all([
      fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json', { signal: ctrl.signal }).then(r => r.json()),
      fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${startStr}/v1/currencies/usd.min.json`, { signal: ctrl.signal }).then(r => r.json()),
    ])
      .then(([nowData, thenData]: [{ usd: Record<string, number> }, { usd: Record<string, number> }]) => {
        const result: Record<string, { now: number; then: number }> = {}
        for (const code of CODES) {
          const nowVal  = nowData?.usd?.[code]
          const thenVal = thenData?.usd?.[code]
          if (nowVal && thenVal) {
            result[code.toUpperCase()] = { now: nowVal, then: thenVal }
          }
        }
        if (Object.keys(result).length >= 2) setPeers(result)
        else setPeersError(true)
      })
      .catch(() => setPeersError(true))
      .finally(() => { clearTimeout(timeout); setPeersLoading(false) })

    return () => { ctrl.abort(); clearTimeout(timeout) }
  }, [])

  // ── derived values ────────────────────────────────────────────────────────
  const liveRate = rate ?? FALLBACK_RATE
  const firstRate = historical.length > 0 ? historical[0].rate : BASELINE_RATE
  // annDep: trailing 12-month depreciation (used for projections and compound forecasting)
  const annDep = (liveRate / firstRate - 1) * 100
  // vsBaselinePct: change since fixed Jan 2024 baseline (used for the "vs Jan 2024" stat card only)
  const vsBaselinePct = (liveRate / BASELINE_RATE - 1) * 100
  const moRate = Math.pow(1 + annDep / 100, 1 / 12) - 1

  const proj6m  = Math.round(liveRate * Math.pow(1 + moRate, 6))
  const proj12m = Math.round(liveRate * Math.pow(1 + moRate, 12))
  const proj24m = Math.round(liveRate * Math.pow(1 + moRate, 24))

  // depreciation speed over 30/90 days
  const rateNDaysAgo = (days: number): number | null => {
    if (!historical.length) return null
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days)
    const target = cutoff.toISOString().split('T')[0]
    const pt = historical.findLast(p => p.date <= target)
    return pt?.rate ?? null
  }
  const r30 = rateNDaysAgo(30)
  const r90 = rateNDaysAgo(90)
  const speed30  = r30  ? annualizedRate(r30, liveRate, 30) : null
  const speed90  = r90  ? annualizedRate(r90, liveRate, 90) : null
  const speedAnn = annDep

  // 20k threshold calculations
  const distanceTo20k = ((THRESHOLD_20K / liveRate) - 1) * 100
  const monthsTo20k = moRate > 0 && liveRate < THRESHOLD_20K
    ? Math.ceil(Math.log(THRESHOLD_20K / liveRate) / Math.log(1 + moRate))
    : null
  const fast10MonthsTo20k = liveRate < THRESHOLD_20K
    ? Math.ceil(Math.log(THRESHOLD_20K / liveRate) / Math.log(Math.pow(1.10, 1 / 12)))
    : null
  const severe15MonthsTo20k = liveRate < THRESHOLD_20K
    ? Math.ceil(Math.log(THRESHOLD_20K / liveRate) / Math.log(Math.pow(1.15, 1 / 12)))
    : null

  // monthly averages for "best month to pay"
  const monthlyAvgMap: Record<string, { sum: number; count: number }> = {}
  historical.forEach(p => {
    const mk = monthKey(p.date)
    if (!monthlyAvgMap[mk]) monthlyAvgMap[mk] = { sum: 0, count: 0 }
    monthlyAvgMap[mk].sum += p.rate
    monthlyAvgMap[mk].count += 1
  })
  const monthlyEntries = Object.entries(monthlyAvgMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mk, { sum, count }]) => ({
      label: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+mk.split('-')[1]-1],
      avg: Math.round(sum / count),
    }))

  // cumulative spend (geometric series: sum of monthly IDR payments as rate compounds)
  const cumulSpend = (months: number, flat = false) => {
    if (flat) return Math.round(cumulPlan * liveRate * months)
    // Σ(i=0..months-1) cumulPlan * liveRate * (1+moRate)^i  = cumulPlan * liveRate * ((1+r)^n - 1) / r
    if (Math.abs(moRate) < 1e-9) return Math.round(cumulPlan * liveRate * months)
    return Math.round(cumulPlan * liveRate * ((Math.pow(1 + moRate, months) - 1) / moRate))
  }

  // purchasing power: Rp 1,000,000 → USD
  const pp1m = (r: number) => (1_000_000 / r).toFixed(2)
  const ppBaseline = +(1_000_000 / BASELINE_RATE).toFixed(2)
  const ppNow      = +(1_000_000 / liveRate).toFixed(2)
  const ppLoss     = ((ppNow / ppBaseline - 1) * 100).toFixed(1)

  // break-even: at what USD/IDR would $20 = threshold% of income
  const breakEvenRate = (usd: number, pct: number) => Math.round(income * (pct / 100) / usd)

  // period stats from historical
  const histMin = historical.length ? Math.min(...historical.map(p => p.rate)) : null
  const histMax = historical.length ? Math.max(...historical.map(p => p.rate)) : null
  const histMinDate = histMin ? historical.find(p => p.rate === histMin)?.date ?? '' : ''
  const histMaxDate = histMax ? historical.find(p => p.rate === histMax)?.date ?? '' : ''

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 space-y-5">

      {/* ── header ── */}
      <div>
        <h1 className="text-base font-semibold text-text-primary">AI Costs in Indonesian Rupiah</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Live USD/IDR · 1-year chart · projections · affordability for Indonesian earners
        </p>
      </div>

      {/* ── live rate + chart ── */}
      <div className="bg-surface-1 border border-border-default rounded-xl overflow-hidden">
        <div className="px-4 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-border-default">
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">USD / IDR</p>
            {rate === null ? (
              <div className="h-8 w-24 bg-surface-3 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-text-primary tabular-nums">{liveRate.toLocaleString('id-ID')}</p>
            )}
            <p className="text-[11px] text-text-muted mt-1">
              {rateDate ?? (rateError ? 'cached' : '…')}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">vs Jan 2024</p>
            <p className={`text-2xl font-bold tabular-nums ${vsBaselinePct > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {vsBaselinePct > 0 ? '+' : ''}{vsBaselinePct.toFixed(1)}%
            </p>
            <p className="text-[11px] text-text-muted mt-1">baseline {BASELINE_RATE.toLocaleString('id-ID')}</p>
          </div>
          {histMin && (
            <div>
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">1-yr Low</p>
              <p className="text-2xl font-bold text-emerald-400 tabular-nums">{histMin.toLocaleString('id-ID')}</p>
              <p className="text-[11px] text-text-muted mt-1">{dispDate(histMinDate)}</p>
            </div>
          )}
          {histMax && (
            <div>
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">1-yr High</p>
              <p className="text-2xl font-bold text-red-400 tabular-nums">{histMax.toLocaleString('id-ID')}</p>
              <p className="text-[11px] text-text-muted mt-1">{dispDate(histMaxDate)}</p>
            </div>
          )}
        </div>

        <div className="px-4 pt-3 pb-2">
          {histLoading
            ? (
              <div className="h-44 bg-surface-3 rounded-lg animate-pulse flex items-center justify-center">
                <p className="text-xs text-text-muted animate-pulse">Fetching rate history…</p>
              </div>
            )
            : histError
              ? (
                <div className="h-44 flex flex-col items-center justify-center gap-2 border border-dashed border-border-default rounded-lg">
                  <p className="text-sm text-text-muted">Chart unavailable</p>
                  <p className="text-xs text-text-muted opacity-60">Could not reach Frankfurter API — live rate above is still accurate</p>
                </div>
              )
              : <RateLineChart data={historical} baseline={BASELINE_RATE} />
          }
        </div>
        <p className="px-4 pb-3 text-[11px] text-text-muted">
          Hover for daily rate · Jan 2024 baseline dashed · cached daily · source: Frankfurter API
        </p>
      </div>

      {/* ── 20k threshold watch ── */}
      <div className="bg-surface-1 border border-red-500/40 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-red-500/20 bg-red-900/15 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-red-400 font-bold text-sm">⚠</span>
              <p className="text-sm font-semibold text-text-primary">Rp 20,000 Threshold Watch</p>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              1-year high: ~17,889 (May 29, 2026) · Analysts model 19,000+ by Oct–Nov 2026 · worst-case range up to 20,646
            </p>
          </div>
          <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded border border-red-500/40 text-red-400 bg-red-900/20">WATCH</span>
        </div>

        {/* Distance + timelines */}
        <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-border-default">
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">Distance to 20k</p>
            <p className="text-2xl font-bold text-orange-400 tabular-nums">+{distanceTo20k.toFixed(1)}%</p>
            <p className="text-[11px] text-text-muted mt-1">from {liveRate.toLocaleString('id-ID')} now</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">At current pace</p>
            {monthsTo20k !== null
              ? <><p className="text-2xl font-bold text-red-400 tabular-nums">{monthsTo20k}mo</p>
                  <p className="text-[11px] text-text-muted mt-1">{annDep.toFixed(1)}% ann. trailing</p></>
              : <p className="text-sm text-emerald-400">Rate stable</p>
            }
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">Fast (10%/yr)</p>
            {fast10MonthsTo20k !== null
              ? <><p className="text-2xl font-bold text-red-400 tabular-nums">{fast10MonthsTo20k}mo</p>
                  <p className="text-[11px] text-text-muted mt-1">10% annual</p></>
              : <p className="text-sm text-text-muted">—</p>
            }
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">Severe (15%/yr)</p>
            {severe15MonthsTo20k !== null
              ? <><p className="text-2xl font-bold text-red-500 tabular-nums">{severe15MonthsTo20k}mo</p>
                  <p className="text-[11px] text-text-muted mt-1">15% annual</p></>
              : <p className="text-sm text-text-muted">—</p>
            }
          </div>
        </div>

        {/* Cost at 20k */}
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2.5">AI Subscription Cost If Rate Hits 20,000</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([10, 20, 100, 200] as const).map(usd => {
              const atTarget = toIDR(usd, THRESHOLD_20K)
              const now      = toIDR(usd, liveRate)
              const vsBase   = toIDR(usd, BASELINE_RATE)
              return (
                <div key={usd} className="bg-red-900/10 border border-red-500/15 rounded-lg p-3 text-center">
                  <p className="text-[11px] text-text-muted mb-1 font-medium">${usd}/mo</p>
                  <p className="text-lg font-bold text-red-400 tabular-nums">{fmtShort(atTarget)}</p>
                  <p className="text-[11px] text-orange-400 mt-0.5">+{fmtShort(atTarget - now)} vs now</p>
                  <p className="text-[11px] text-text-muted mt-0.5">+{fmtShort(atTarget - vsBase)} vs Jan'24</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Drivers */}
        <div className="px-4 py-3">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">Structural Drivers Behind the 20k Risk</p>
          <div className="space-y-1.5 text-xs text-text-secondary leading-relaxed">
            <p>· <span className="text-text-primary font-medium">Trump tariffs 32%</span> on Indonesian exports effective Q4 2026 — widens trade deficit, pressures rupiah directly</p>
            <p>· <span className="text-text-primary font-medium">Fed rate hold</span> — elevated USD rates trigger EM capital outflows; investors repatriate to USD assets</p>
            <p>· <span className="text-text-primary font-medium">BI limited firepower</span> — Bank Indonesia FX reserves constrained; each intervention is temporary</p>
            <p>· <span className="text-text-primary font-medium">Current account deficit</span> + import costs rising with weaker rupiah (self-reinforcing loop)</p>
          </div>
          <p className="text-[11px] text-text-muted mt-2.5 border-t border-border-default pt-2">
            Rp 20,000 is not guaranteed — BI rate hikes, commodity export recovery, or dollar weakness could reverse trend.
            Sources: LongForecast, ING Think, The Diplomat (May 2026).
          </p>
        </div>
      </div>

      {/* ── projections ── */}
      <div className="bg-surface-1 border border-border-default rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-sm font-semibold text-text-primary">Future Value Projections</p>
          <p className="text-xs text-text-muted mt-0.5">
            Based on {annDep.toFixed(1)}% annual depreciation rate (trailing 12m) — compounding monthly
          </p>
        </div>

        {/* Rate forecast */}
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2.5">Exchange Rate Forecast</p>
          <div className="grid grid-cols-3 gap-3">
            {([['6 months', proj6m], ['12 months', proj12m], ['24 months', proj24m]] as [string, number][]).map(([label, proj]) => {
              const chg = ((proj / liveRate - 1) * 100).toFixed(1)
              return (
                <div key={label} className="bg-surface-2 rounded-lg p-3 text-center">
                  <p className="text-[11px] text-text-muted mb-1">{label}</p>
                  <p className="text-lg font-bold text-red-400 tabular-nums">{(proj/1000).toFixed(0)}k</p>
                  <p className="text-[11px] text-text-muted">+{chg}%</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Subscription cost at projected rates */}
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2.5">Subscription Cost in IDR (Projected)</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] text-sm">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="text-left pb-2 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Plan</th>
                  <th className="text-right pb-2 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Now</th>
                  <th className="text-right pb-2 text-[11px] font-semibold text-text-muted uppercase tracking-wider">+6m</th>
                  <th className="text-right pb-2 text-[11px] font-semibold text-text-muted uppercase tracking-wider">+12m</th>
                  <th className="text-right pb-2 text-[11px] font-semibold text-text-muted uppercase tracking-wider">+24m</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {[10, 20, 100, 200].map(usd => (
                  <tr key={usd}>
                    <td className="py-2 font-medium text-text-primary">${usd}/mo</td>
                    <td className="py-2 text-right tabular-nums text-text-secondary">{fmtShort(toIDR(usd, liveRate))}</td>
                    <td className="py-2 text-right tabular-nums text-orange-300">{fmtShort(toIDR(usd, proj6m))}</td>
                    <td className="py-2 text-right tabular-nums text-orange-400">{fmtShort(toIDR(usd, proj12m))}</td>
                    <td className="py-2 text-right tabular-nums text-red-400 font-semibold">{fmtShort(toIDR(usd, proj24m))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cumulative spend */}
        <div className="px-4 py-3 border-b border-border-default">
          <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Cumulative Spend</p>
            <div className="flex gap-1.5">
              {[10, 20, 100, 200].map(u => (
                <button
                  key={u}
                  onClick={() => setCumulPlan(u)}
                  className={`text-xs px-2 py-0.5 rounded border transition-colors ${cumulPlan === u ? 'bg-accent/15 text-accent border-accent/30' : 'text-text-muted border-border-default hover:text-text-primary'}`}
                >
                  ${u}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {([12, 24, 36] as const).map(months => {
              const flat    = cumulSpend(months, true)
              const proj    = cumulSpend(months, false)
              const extra   = proj - flat
              return (
                <div key={months} className="bg-surface-2 rounded-lg p-3">
                  <p className="text-[11px] text-text-muted mb-1">{months/12} year{months > 12 ? 's' : ''}</p>
                  <p className="text-base font-bold text-red-400 tabular-nums">{fmtShort(proj)}</p>
                  <p className="text-[11px] text-text-muted">at projected rate</p>
                  <p className="text-[11px] text-orange-400 mt-1 font-medium">+{fmtShort(extra)} extra vs flat</p>
                </div>
              )
            })}
          </div>
          <p className="text-[11px] text-text-muted mt-2">
            "Extra vs flat" = additional IDR paid purely from rupiah depreciation, assuming current {annDep.toFixed(1)}% annual pace continues.
          </p>
        </div>

        {/* Purchasing power */}
        <div className="px-4 py-3">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2.5">Purchasing Power Loss (Rp 1,000,000)</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
              ['Jan 2024', pp1m(BASELINE_RATE), 'baseline', 'text-text-muted'],
              ['Today',    pp1m(liveRate),       ppLoss + '%', 'text-red-400'],
              ['+12 months', pp1m(proj12m),      ((+pp1m(proj12m)/ppBaseline-1)*100).toFixed(1) + '%', 'text-orange-400'],
              ['+24 months', pp1m(proj24m),      ((+pp1m(proj24m)/ppBaseline-1)*100).toFixed(1) + '%', 'text-red-400'],
            ] as [string, string, string, string][]).map(([label, val, note, nc]) => (
              <div key={label} className="bg-surface-2 rounded-lg p-3 text-center">
                <p className="text-[11px] text-text-muted mb-1">{label}</p>
                <p className="text-base font-bold text-text-primary tabular-nums">${val}</p>
                <p className={`text-[11px] font-medium ${nc}`}>{note}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-text-muted mt-2">
            How much USD of AI services your Rp 1,000,000 can buy over time. Projected assuming current depreciation pace.
          </p>
        </div>
      </div>

      {/* ── analytics ── */}
      <div className="bg-surface-1 border border-border-default rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-sm font-semibold text-text-primary">Analytics</p>
        </div>

        {/* Depreciation speed meter */}
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2.5">Depreciation Speed</p>
          <div className="grid grid-cols-3 gap-3">
            {([
              ['30-day (ann.)', speed30,  'trailing 30d'],
              ['90-day (ann.)', speed90,  'trailing 90d'],
              ['1-year',        speedAnn, 'trailing 1y'],
            ] as [string, number | null, string][]).map(([label, spd, sub]) => (
              <div key={label} className="bg-surface-2 rounded-lg p-3">
                <p className="text-[11px] text-text-muted">{label}</p>
                {spd === null
                  ? <p className="text-sm text-text-muted">—</p>
                  : <>
                    <p className={`text-xl font-bold tabular-nums ${speedColor(spd)}`}>
                      {spd > 0 ? '+' : ''}{spd.toFixed(1)}%
                    </p>
                    <p className={`text-[11px] font-semibold ${speedColor(spd)}`}>{speedLabel(spd)}</p>
                    <p className="text-[11px] text-text-muted">{sub}</p>
                  </>
                }
              </div>
            ))}
          </div>
        </div>

        {/* Break-even calculator */}
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2.5">Break-Even Calculator</p>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-text-secondary">Monthly income (IDR)</label>
                <span className="text-xs font-mono text-accent">{fmtFull(income)}</span>
              </div>
              <input
                type="range"
                min={1500000}
                max={30000000}
                step={100000}
                value={income}
                onChange={e => setIncome(+e.target.value)}
                className="w-full accent-accent"
              />
              <div className="flex justify-between text-[10px] text-text-muted mt-0.5">
                <span>Rp 1.5jt</span>
                <span>Rp 30jt</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[380px] text-sm">
                <thead>
                  <tr className="border-b border-border-default">
                    <th className="text-left pb-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Plan</th>
                    <th className="text-right pb-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">% salary</th>
                    <th className="text-right pb-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">IDR/mo</th>
                    <th className="text-right pb-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Rate for &lt;5%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {[10, 20, 100, 200].map(usd => {
                    const idrCost = toIDR(usd, liveRate)
                    const pct = (idrCost / income) * 100
                    const [col] = pctBadge(pct)
                    const safeRate = breakEvenRate(usd, 5)
                    return (
                      <tr key={usd}>
                        <td className="py-2 font-medium text-text-primary">${usd}/mo</td>
                        <td className={`py-2 text-right font-bold tabular-nums ${col}`}>{pct.toFixed(1)}%</td>
                        <td className="py-2 text-right tabular-nums text-text-secondary">{fmtShort(idrCost)}</td>
                        <td className="py-2 text-right tabular-nums text-emerald-400 text-xs">
                          {safeRate.toLocaleString('id-ID')}
                          {safeRate < liveRate
                            ? ' ✓'
                            : <span className="text-text-muted"> (needs {fmtShort(Math.abs(safeRate - liveRate))} stronger)</span>
                          }
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-text-muted">
              "Rate for &lt;5%" = USD/IDR rate at which that subscription costs less than 5% of your selected income.
            </p>
          </div>
        </div>

        {/* Best month to pay */}
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2.5">
            Historically Cheapest Month to Pay
            <span className="normal-case font-normal text-text-muted ml-1">(lower USD/IDR = stronger rupiah)</span>
          </p>
          {monthlyEntries.length === 0
            ? <div className="h-20 bg-surface-3 rounded animate-pulse" />
            : <MonthlyBars entries={monthlyEntries} />
          }
          {monthlyEntries.length > 0 && (() => {
            const best = monthlyEntries.reduce((a, b) => a.avg < b.avg ? a : b)
            return (
              <p className="text-xs text-text-muted mt-2">
                <span className="text-emerald-400 font-medium">{best.label}</span> had the lowest average rate ({best.avg.toLocaleString('id-ID')}) in the past year —
                consider paying for annual plans during this period to minimize IDR cost.
                Note: 1-year sample; multi-year trends may differ.
              </p>
            )
          })()}
        </div>

        {/* Peer currency comparison */}
        <div className="px-4 py-3">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2.5">
            ASEAN Peer Currency Comparison (1-year vs USD)
          </p>
          {peersLoading
            ? <div className="h-28 bg-surface-3 rounded animate-pulse flex items-center justify-center"><p className="text-xs text-text-muted animate-pulse">Fetching peer rates…</p></div>
            : peersError || Object.keys(peers).length < 2
              ? <p className="text-xs text-text-muted py-4">Peer comparison unavailable — could not reach currency API</p>
              : (
              <div className="space-y-2">
                {Object.entries(peers)
                  .map(([c, { now, then }]) => ({
                    c,
                    chg: ((now / then - 1) * 100),
                    meta: PEER_META[c],
                  }))
                  .sort((a, b) => b.chg - a.chg)
                  .map(({ c, chg, meta }) => {
                    const isWorst = Object.values(peers).every(p => p.now / p.then <= peers[c]!.now / peers[c]!.then) || false
                    const isBest  = Object.values(peers).every(p => p.now / p.then >= peers[c]!.now / peers[c]!.then) || false
                    const barPct  = Math.abs(chg)
                    const isIdr   = c === 'IDR'
                    return (
                      <div key={c} className="flex items-center gap-2.5">
                        <span className="text-base w-6 shrink-0">{meta?.flag}</span>
                        <span className={`text-xs font-mono w-8 shrink-0 ${isIdr ? 'text-text-primary font-semibold' : 'text-text-muted'}`}>{c}</span>
                        <div className="flex-1 h-4 bg-surface-3 rounded overflow-hidden">
                          <div
                            className={`h-full rounded ${chg > 0 ? (isIdr ? 'bg-red-500/60' : 'bg-red-400/35') : 'bg-emerald-500/50'}`}
                            style={{ width: `${Math.min(100, 5 + barPct * 6)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold tabular-nums w-14 text-right shrink-0 ${chg > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {chg > 0 ? '+' : ''}{chg.toFixed(1)}%
                        </span>
                        {isWorst && <span className="text-[10px] text-red-400 shrink-0">worst</span>}
                        {isBest  && <span className="text-[10px] text-emerald-400 shrink-0">best</span>}
                      </div>
                    )
                  })
                }
              </div>
            )
          }
          <p className="text-[11px] text-text-muted mt-2">
            Positive % = currency weakened vs USD (AI subscriptions got more expensive). Source: fawazahmed0/currency-api via jsDelivr.
          </p>
        </div>
      </div>

      {/* ── subscription pricing ── */}
      <div className="bg-surface-1 border border-border-default rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-sm font-semibold text-text-primary">Subscription Plans</p>
          <p className="text-xs text-text-muted mt-0.5">Monthly cost in IDR — now vs Jan 2024 baseline</p>
        </div>
        <div className="hidden sm:grid grid-cols-[1fr_70px_130px_130px_80px] px-4 py-2 border-b border-border-default">
          {['Service','USD/mo','IDR now','IDR Jan\'24','Δ/mo'].map((h, i) => (
            <span key={h} className={`text-[11px] font-semibold text-text-muted uppercase tracking-wider ${i > 0 ? 'text-right' : ''}`}>{h}</span>
          ))}
        </div>
        <div className="divide-y divide-border-default">
          {PLANS.map(plan => {
            const now  = toIDR(plan.usd, liveRate)
            const base = toIDR(plan.usd, BASELINE_RATE)
            return (
              <div key={plan.service} className="px-4 py-3">
                <div className="sm:hidden flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <span className="text-sm font-medium text-text-primary">{plan.service}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${plan.bc}`}>{plan.provider}</span>
                    </div>
                    <p className="text-xs text-text-muted">{fmtFull(now)}/mo <span className="text-red-400 ml-1">+{fmtShort(now-base)}</span></p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold text-accent tabular-nums">${plan.usd}</p>
                    <p className="text-[10px] text-text-muted">USD/mo</p>
                  </div>
                </div>
                <div className="hidden sm:grid grid-cols-[1fr_70px_130px_130px_80px] items-center">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-text-primary">{plan.service}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${plan.bc}`}>{plan.provider}</span>
                  </div>
                  <span className="text-sm font-bold text-accent tabular-nums text-right">${plan.usd}</span>
                  <span className="text-sm text-text-primary tabular-nums text-right">{fmtFull(now)}</span>
                  <span className="text-sm text-text-muted tabular-nums text-right">{fmtFull(base)}</span>
                  <span className="text-sm text-red-400 tabular-nums text-right font-medium">+{fmtShort(now-base)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── affordability table ── */}
      <div className="bg-surface-1 border border-border-default rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-sm font-semibold text-text-primary">Affordability by Income Level</p>
          <p className="text-xs text-text-muted mt-0.5">% of monthly income consumed by each price point</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="border-b border-border-default">
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Income</th>
                {AFFORD_USD.map(u => (
                  <th key={u} className="text-right px-3 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">${u}/mo</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {INCOME_TIERS.map(tier => (
                <tr key={tier.label}>
                  <td className="px-4 py-3 align-top">
                    <p className="font-medium text-text-primary">{tier.label}</p>
                    <p className="text-xs text-text-muted mt-0.5">{tier.note}</p>
                    <p className="text-[11px] font-mono text-text-muted">{fmtFull(tier.monthly)}/bln</p>
                  </td>
                  {AFFORD_USD.map(usdAmt => {
                    const cost = toIDR(usdAmt, liveRate)
                    const pct = (cost / tier.monthly) * 100
                    const [col, lbl] = pctBadge(pct)
                    return (
                      <td key={usdAmt} className="px-3 py-3 text-right align-top">
                        <p className={`text-lg font-bold tabular-nums ${col}`}>{pct.toFixed(1)}%</p>
                        <p className="text-[11px] text-text-muted mt-0.5">{fmtShort(cost)}</p>
                        <p className={`text-[10px] font-semibold mt-0.5 ${col}`}>{lbl}</p>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border-default bg-surface-2/30 flex flex-wrap gap-x-4 gap-y-1">
          {[['text-emerald-400','< 2% fine'],['text-green-400','2–5% ok'],['text-yellow-400','5–10% notable'],['text-orange-400','10–20% heavy'],['text-red-400','> 20% crushing']].map(([c,l]) => (
            <span key={l} className={`text-xs font-medium ${c}`}>{l}</span>
          ))}
        </div>
      </div>

      {/* ── API pricing ── */}
      <div className="bg-surface-1 border border-border-default rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-sm font-semibold text-text-primary">API Pricing for Developers</p>
          <p className="text-xs text-text-muted mt-0.5">Per 1M tokens — input / output at current IDR rate</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-border-default">
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider w-44">Model</th>
                <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">In /1M</th>
                <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Out /1M</th>
                <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Out IDR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {API_MODELS.map(m => {
                const isDS = m.provider === 'DeepSeek'
                return (
                  <tr key={m.model} className={isDS ? 'bg-emerald-900/5' : ''}>
                    <td className="px-4 py-3">
                      <p className={`font-medium ${isDS ? 'text-emerald-300' : 'text-text-primary'}`}>{m.model}</p>
                      <p className="text-xs text-text-muted">{m.provider}</p>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-text-secondary">{fmtTokenPrice(m.inp)}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-text-secondary">{fmtTokenPrice(m.out)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <span className={isDS ? 'text-emerald-400 font-semibold' : 'text-accent'}>{fmtShort(toIDR(m.out, liveRate))}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── free tiers ── */}
      <div className="bg-surface-1 border border-border-default rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-sm font-semibold text-text-primary">Free Tiers — No Payment Required</p>
        </div>
        <div className="divide-y divide-border-default">
          {FREE_LIST.map(t => (
            <div key={t.service} className="px-4 py-3 flex items-start gap-3">
              <span className="text-accent shrink-0 mt-0.5 font-bold">✓</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-medium text-text-primary">{t.service}</span>
                  <span className="text-xs text-text-muted">· {t.provider}</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed mt-0.5">{t.what}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── context ── */}
      <div className="bg-surface-1 border border-border-default rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-sm font-semibold text-text-primary">Indonesian Context</p>
        </div>
        <div className="p-4 space-y-3">
          {CONTEXT_ITEMS.map(({ title, accent, body }) => (
            <div key={title} className={`p-3.5 rounded-lg border-l-2 ${accent}`}>
              <p className="text-xs font-semibold text-text-primary mb-1.5">{title}</p>
              <p className="text-xs text-text-secondary leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
