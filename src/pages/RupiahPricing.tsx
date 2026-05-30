import { useState, useEffect } from 'react'

// ── constants ─────────────────────────────────────────────────────────────

const BASELINE_RATE = 15866   // USD/IDR Jan 2024 (reference)
const FALLBACK_RATE = 17805   // cached fallback if API unavailable

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

const CONTEXT_ITEMS = [
  {
    title: 'Payment Barriers',
    accent: 'border-red-500/50 bg-red-900/10',
    body: 'Most AI subscriptions require an international Visa/Mastercard. Indonesian local debit cards (BCA, BNI, Mandiri) often fail for international billing. Practical workarounds: Jenius or Blu virtual cards, CIMB Niaga World Mastercard, PayPal (adds ~4% conversion fee). GoPay international is limited to select merchants.',
  },
  {
    title: 'No Regional Pricing (Yet)',
    accent: 'border-orange-500/50 bg-orange-900/10',
    body: 'Unlike Netflix or Spotify, Claude, ChatGPT, and Cursor charge full USD globally. Google One (Gemini Advanced) offers some regional adjustment. There is currently no official Indonesian pricing tier for most AI services — you pay the same as a US user.',
  },
  {
    title: 'Cumulative Subscription Shock',
    accent: 'border-yellow-500/50 bg-yellow-900/10',
    body: 'A developer using GitHub Copilot ($10) + Cursor Pro ($20) + Claude Pro ($20) pays $50/mo = ~Rp 890rb at current rates. For someone on UMK Jakarta (Rp 5.4 jt), that is 16.5% of gross salary — before food, transport, or rent. Stack multiple subscriptions and the burden compounds fast.',
  },
  {
    title: 'DeepSeek Changes the Calculus',
    accent: 'border-blue-500/50 bg-blue-900/10',
    body: 'DeepSeek V3 API at $0.27/1M tokens is ~90% cheaper than GPT-4o. For developers building applications, switching API providers alone can reduce costs dramatically. The model quality is comparable on most coding and reasoning tasks. DeepSeek also offers a fully free web chat.',
  },
  {
    title: 'Strategic Recommendation',
    accent: 'border-emerald-500/50 bg-emerald-900/10',
    body: 'Start with free tiers. For API work, use DeepSeek V3 or Gemini Flash first. Reserve paid subscriptions only for tools that directly generate income. For personal productivity, free Claude + free ChatGPT + free Gemini in rotation covers most use cases at zero cost.',
  },
]

// ── helpers ────────────────────────────────────────────────────────────────

function toIDR(usd: number, rate: number) { return Math.round(usd * rate) }

function fmtShort(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000) return `Rp ${Math.round(n / 1_000)}rb`
  return `Rp ${n}`
}

function fmtFull(n: number) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID')
}

function fmtTokenPrice(p: number) {
  return p < 1 ? `$${p.toFixed(3)}` : `$${p.toFixed(2)}`
}

function pctBadge(pct: number) {
  if (pct < 2)  return ['text-emerald-400', 'fine']
  if (pct < 5)  return ['text-green-400',   'ok']
  if (pct < 10) return ['text-yellow-400',  'notable']
  if (pct < 20) return ['text-orange-400',  'heavy']
  return ['text-red-400', 'crushing']
}

// ── page ──────────────────────────────────────────────────────────────────

export default function RupiahPricing() {
  const [rate, setRate]       = useState<number | null>(null)
  const [rateDate, setRateDate] = useState<string | null>(null)
  const [rateError, setRateError] = useState(false)

  useEffect(() => {
    fetch('https://api.frankfurter.app/latest?from=USD&to=IDR')
      .then(r => r.json())
      .then(d => { setRate(Math.round(d.rates.IDR)); setRateDate(d.date) })
      .catch(() => { setRate(FALLBACK_RATE); setRateError(true) })
  }, [])

  const liveRate = rate ?? FALLBACK_RATE
  const changePct = ((liveRate / BASELINE_RATE - 1) * 100)
  const sign = changePct >= 0 ? '+' : ''

  const perPlanDiff20 = toIDR(20, liveRate) - toIDR(20, BASELINE_RATE)
  const cumulative16mo = perPlanDiff20 * 16

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-base font-semibold text-text-primary">AI Costs in Indonesian Rupiah</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Live USD/IDR rate · subscription pricing · affordability for Indonesian earners
        </p>
      </div>

      {/* ── Live rate ────────────────────────────────────────────────── */}
      <div className="bg-surface-1 border border-border-default rounded-xl overflow-hidden">
        <div className="px-4 py-4 grid grid-cols-2 gap-4 border-b border-border-default">
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">USD / IDR Live</p>
            {rate === null ? (
              <div className="h-9 w-32 bg-surface-3 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-text-primary tabular-nums leading-none">
                {liveRate.toLocaleString('id-ID')}
              </p>
            )}
            <p className="text-xs text-text-muted mt-1.5">
              {rateDate
                ? `Frankfurter API · ${rateDate}`
                : rateError
                  ? 'Cached fallback rate'
                  : 'Fetching…'}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Since Jan 2024</p>
            <p className={`text-3xl font-bold tabular-nums leading-none ${changePct > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {sign}{changePct.toFixed(1)}%
            </p>
            <p className="text-xs text-text-muted mt-1.5">
              Baseline {BASELINE_RATE.toLocaleString('id-ID')} IDR
            </p>
          </div>
        </div>

        <div className="px-4 py-3.5 bg-surface-2/40">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">Impact</p>
          <p className="text-sm text-text-secondary leading-relaxed">
            The rupiah has weakened <span className="text-red-400 font-medium">{sign}{changePct.toFixed(1)}%</span> against the dollar since Jan 2024.
            A $20/mo plan (Claude Pro, ChatGPT Plus) now costs{' '}
            <span className="text-text-primary font-semibold">{fmtFull(toIDR(20, liveRate))}/mo</span>,
            up from <span className="text-text-muted">{fmtFull(toIDR(20, BASELINE_RATE))}</span> in 2024
            — an extra <span className="text-red-400 font-semibold">{fmtShort(perPlanDiff20)}/mo</span> you
            never agreed to. Over 16 months that's{' '}
            <span className="text-orange-400 font-semibold">{fmtShort(cumulative16mo)}</span> in silent cost growth.
          </p>
        </div>
      </div>

      {/* ── Subscription pricing ─────────────────────────────────────── */}
      <div className="bg-surface-1 border border-border-default rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-sm font-semibold text-text-primary">Subscription Plans</p>
          <p className="text-xs text-text-muted mt-0.5">Monthly cost in IDR — now vs Jan 2024 baseline</p>
        </div>

        {/* Desktop column headers */}
        <div className="hidden sm:grid grid-cols-[1fr_70px_130px_130px_80px] px-4 py-2 border-b border-border-default">
          {['Service', 'USD/mo', 'IDR now', 'IDR Jan\'24', 'Δ/mo'].map((h, i) => (
            <span key={h} className={`text-[11px] font-semibold text-text-muted uppercase tracking-wider ${i > 0 ? 'text-right' : ''}`}>{h}</span>
          ))}
        </div>

        <div className="divide-y divide-border-default">
          {PLANS.map(plan => {
            const now   = toIDR(plan.usd, liveRate)
            const base  = toIDR(plan.usd, BASELINE_RATE)
            const diff  = now - base
            return (
              <div key={plan.service} className="px-4 py-3">
                {/* Mobile */}
                <div className="sm:hidden flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <span className="text-sm font-medium text-text-primary">{plan.service}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${plan.bc}`}>{plan.provider}</span>
                    </div>
                    <p className="text-xs text-text-muted">
                      {fmtFull(now)}/mo
                      <span className="text-red-400 ml-1.5">+{fmtShort(diff)}</span>
                      <span className="text-text-muted"> vs 2024</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold text-accent tabular-nums">${plan.usd}</p>
                    <p className="text-[10px] text-text-muted">USD/mo</p>
                  </div>
                </div>
                {/* Desktop */}
                <div className="hidden sm:grid grid-cols-[1fr_70px_130px_130px_80px] items-center">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-text-primary">{plan.service}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${plan.bc}`}>{plan.provider}</span>
                  </div>
                  <span className="text-sm font-bold text-accent tabular-nums text-right">${plan.usd}</span>
                  <span className="text-sm text-text-primary tabular-nums text-right">{fmtFull(now)}</span>
                  <span className="text-sm text-text-muted tabular-nums text-right">{fmtFull(base)}</span>
                  <span className="text-sm text-red-400 tabular-nums text-right font-medium">+{fmtShort(diff)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Affordability analysis ───────────────────────────────────── */}
      <div className="bg-surface-1 border border-border-default rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-sm font-semibold text-text-primary">Affordability by Income Level</p>
          <p className="text-xs text-text-muted mt-0.5">What % of monthly salary does each price point consume?</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="border-b border-border-default">
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Income Level</th>
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
                    <p className="text-[11px] font-mono text-text-muted mt-0.5">{fmtFull(tier.monthly)}/bln</p>
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
          {[
            ['text-emerald-400', '< 2% — Fine'],
            ['text-green-400',   '2–5% — Manageable'],
            ['text-yellow-400',  '5–10% — Notable'],
            ['text-orange-400',  '10–20% — Heavy'],
            ['text-red-400',     '> 20% — Crushing'],
          ].map(([c, l]) => (
            <span key={l} className={`text-xs font-medium ${c}`}>{l}</span>
          ))}
        </div>
      </div>

      {/* ── API pricing for developers ───────────────────────────────── */}
      <div className="bg-surface-1 border border-border-default rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-sm font-semibold text-text-primary">API Pricing for Developers</p>
          <p className="text-xs text-text-muted mt-0.5">Per 1 million tokens — input / output at current IDR rate</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-border-default">
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Model</th>
                <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">In /1M</th>
                <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Out /1M</th>
                <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Out IDR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {API_MODELS.map(m => {
                const outIDR = toIDR(m.out, liveRate)
                const isDeepSeek = m.provider === 'DeepSeek'
                return (
                  <tr key={m.model} className={isDeepSeek ? 'bg-emerald-900/5' : ''}>
                    <td className="px-4 py-3">
                      <p className={`font-medium ${isDeepSeek ? 'text-emerald-300' : 'text-text-primary'}`}>{m.model}</p>
                      <p className="text-xs text-text-muted">{m.provider}</p>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-text-secondary">{fmtTokenPrice(m.inp)}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-text-secondary">{fmtTokenPrice(m.out)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <span className={isDeepSeek ? 'text-emerald-400 font-semibold' : 'text-accent'}>{fmtShort(outIDR)}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-border-default bg-surface-2/30">
          <p className="text-xs text-text-secondary leading-relaxed">
            <span className="text-emerald-400 font-semibold">DeepSeek V3</span> at $0.27/1M input is ~90% cheaper than GPT-4o and
            delivers comparable results on most coding and analysis tasks.
            <span className="text-blue-400 font-medium ml-1">Gemini 1.5 Flash</span> is the cheapest major-lab model
            at $0.075/1M input. Self-hosting <span className="text-text-primary font-medium">Llama 3.x</span> locally costs nothing.
          </p>
        </div>
      </div>

      {/* ── Free tiers ───────────────────────────────────────────────── */}
      <div className="bg-surface-1 border border-border-default rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-sm font-semibold text-text-primary">Free Tiers — No Payment Required</p>
          <p className="text-xs text-text-muted mt-0.5">Usable without a credit card or rupiah</p>
        </div>
        <div className="divide-y divide-border-default">
          {FREE_LIST.map(t => (
            <div key={t.service} className="px-4 py-3 flex items-start gap-3">
              <span className="text-accent shrink-0 mt-0.5 font-bold text-sm">✓</span>
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

      {/* ── Indonesian context ───────────────────────────────────────── */}
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
