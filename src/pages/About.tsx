const SOURCES = [
  { group: 'Research', handles: ['@karpathy', '@demishassabis', '@ylecun', '@AndrewYNg', '@drfeifei', '@jeremyphoward', '@rasbt', '@dair_ai'] },
  { group: 'Frontier / Product', handles: ['@sama', '@gdb', '@OfficialLoganK'] },
  { group: 'Media / Conversation', handles: ['@lexfridman'] },
  { group: 'Business / Operators', handles: ['@alliekmiller', '@gregisenberg', '@levelsio', '@marclou', '@eptwts'] },
  { group: 'Builders / Agents / Tools', handles: ['@mattshumer_', '@steipete', '@rileybrown', '@jackfriks', '@EXM7777', '@vasuman', '@godofprompt', '@MengTo', '@AmirMushich', '@0xROAS', '@egeberkina'] },
]

const PLATFORMS = [
  { name: 'X / Twitter', color: 'text-sky-400 bg-sky-400/10 border-sky-400/20', desc: '28 curated AI accounts' },
  { name: 'Reddit', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20', desc: 'r/MachineLearning, r/artificial, r/LocalLLaMA, r/ChatGPT' },
  { name: 'YouTube', color: 'text-red-500 bg-red-500/10 border-red-500/20', desc: 'Two Minute Papers, Yannic Kilcher, AI Explained, Lex Fridman' },
  { name: 'Product Hunt', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20', desc: 'AI product launches' },
  { name: 'Dev.to', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20', desc: 'AI/ML community articles' },
]

const TECH = [
  { label: 'Frontend', value: 'React 18 + TypeScript + Vite' },
  { label: 'Styling', value: 'Tailwind CSS (dark theme)' },
  { label: 'Hosting', value: 'GitHub Pages (static)' },
  { label: 'Data pipeline', value: 'GitHub Actions (hourly)' },
  { label: 'Enrichment', value: 'Claude (Anthropic)' },
  { label: 'Auth required', value: 'None — fully public' },
]

export default function About() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

      {/* Hero */}
      <div className="bg-surface-1 border border-border-default rounded-xl p-5">
        <h1 className="text-base font-semibold text-text-primary mb-2">About AI Pulse</h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          A public, read-only signal monitor for high-signal AI content across X, Reddit, YouTube, Product Hunt, and Dev.to.
          Posts are ingested hourly, enriched with AI-generated summaries, topic tags, intent labels, and importance scores,
          then published as static JSON consumed by this frontend.
        </p>
      </div>

      {/* Data sources */}
      <div className="bg-surface-1 border border-border-default rounded-xl p-5 space-y-3">
        <h2 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Data Sources</h2>
        <div className="space-y-2">
          {PLATFORMS.map(({ name, color, desc }) => (
            <div key={name} className="flex items-center gap-3">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md border shrink-0 ${color}`}>{name}</span>
              <span className="text-xs text-text-muted">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Source groups */}
      <div className="bg-surface-1 border border-border-default rounded-xl p-5 space-y-3">
        <h2 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">X Account Groups</h2>
        <div className="space-y-3">
          {SOURCES.map(({ group, handles }) => (
            <div key={group}>
              <p className="text-xs font-semibold text-accent mb-1.5">{group}</p>
              <div className="flex flex-wrap gap-1.5">
                {handles.map((h) => (
                  <span key={h} className="text-[11px] font-mono text-text-muted bg-surface-2 border border-border-default px-2 py-0.5 rounded-md">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data freshness */}
      <div className="bg-surface-1 border border-border-default rounded-xl p-5 space-y-3">
        <h2 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Data Freshness</h2>
        <div className="space-y-2">
          {[
            { dot: 'bg-fresh', label: 'Live', desc: 'Updated within the last 90 minutes' },
            { dot: 'bg-delayed', label: 'Delayed', desc: '90 minutes to 4 hours since last refresh' },
            { dot: 'bg-stale', label: 'Stale', desc: 'More than 4 hours since last refresh' },
          ].map(({ dot, label, desc }) => (
            <div key={label} className="flex items-center gap-2.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
              <span className="text-sm font-medium text-text-primary">{label}</span>
              <span className="text-sm text-text-muted">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI enrichment */}
      <div className="bg-surface-1 border border-border-default rounded-xl p-5 space-y-2">
        <h2 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">AI Enrichment</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          Each post receives a one-sentence summary, controlled-vocabulary topic tags, an intent classification
          (research, education, product, demo, opinion, startup, policy, prompting, creative), an importance
          score (0–1), and optional "why it matters" context. Enrichment is bounded to post content only.
        </p>
      </div>

      {/* Tech stack */}
      <div className="bg-surface-1 border border-border-default rounded-xl p-5 space-y-3">
        <h2 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Technical Stack</h2>
        <div className="space-y-2">
          {TECH.map(({ label, value }) => (
            <div key={label} className="flex items-baseline gap-3">
              <span className="text-xs text-text-muted w-28 shrink-0">{label}</span>
              <span className="text-sm text-text-secondary">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Caveats */}
      <div className="bg-surface-1 border border-border-default rounded-xl p-5 space-y-2">
        <h2 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Caveats</h2>
        <ul className="space-y-1.5">
          {[
            'Importance scores are approximate and may reflect AI biases.',
            'Topic classification uses a fixed taxonomy; edge cases may be miscategorized.',
            'Some handles may change, become inactive, or post in other languages.',
            'This dashboard does not write to or interact with any platform on your behalf.',
            'All data is sourced from public APIs.',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-text-muted">
              <span className="text-accent shrink-0 mt-0.5">·</span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  )
}
