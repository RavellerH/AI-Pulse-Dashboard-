const SOURCES = [
  { group: 'Research', handles: ['@karpathy', '@demishassabis', '@ylecun', '@AndrewYNg', '@drfeifei', '@jeremyphoward', '@rasbt', '@dair_ai'] },
  { group: 'Frontier / Product', handles: ['@sama', '@gdb', '@OfficialLoganK'] },
  { group: 'Media / Conversation', handles: ['@lexfridman'] },
  { group: 'Business / Operators', handles: ['@alliekmiller', '@gregisenberg', '@levelsio', '@marclou', '@eptwts'] },
  { group: 'Builders / Agents / Tools', handles: ['@mattshumer_', '@steipete', '@rileybrown', '@jackfriks', '@EXM7777', '@vasuman', '@godofprompt', '@MengTo', '@AmirMushich', '@0xROAS', '@egeberkina'] },
]

export default function About() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 text-sm text-text-secondary leading-relaxed">
      <div>
        <h1 className="text-base font-semibold text-text-primary mb-2">About AI Pulse</h1>
        <p>
          AI Pulse is a public, read-only signal monitor for a curated set of high-signal AI accounts on X. It
          ingests posts on an hourly schedule, runs AI enrichment to generate summaries, topic tags, intent labels,
          and importance scores, then publishes everything as static JSON artifacts consumed by this frontend.
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-2">What it tracks</h2>
        <p>
          28 accounts across researchers, frontier lab operators, builders, media personalities, and
          business-focused voices — chosen for consistent signal quality rather than follower count.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Source groups</h2>
        {SOURCES.map(({ group, handles }) => (
          <div key={group} className="bg-surface-1 border border-border-default rounded-lg p-3">
            <p className="text-xs font-semibold text-accent mb-2">{group}</p>
            <div className="flex flex-wrap gap-1.5">
              {handles.map((h) => (
                <span key={h} className="text-xs font-mono text-text-muted bg-surface-2 border border-border-default px-2 py-0.5 rounded">
                  {h}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-2">Data freshness</h2>
        <div className="space-y-1.5">
          {[
            { dot: 'bg-fresh', label: 'Live', desc: 'Updated within the last 90 minutes' },
            { dot: 'bg-delayed', label: 'Delayed', desc: '90 minutes to 4 hours since last refresh' },
            { dot: 'bg-stale', label: 'Stale', desc: 'More than 4 hours since last refresh' },
          ].map(({ dot, label, desc }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
              <span className="font-medium text-text-primary">{label}:</span>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-2">AI enrichment</h2>
        <p>
          Each post receives a one-sentence summary, controlled-vocabulary topic tags, an intent classification
          (research, education, product, demo, opinion, startup, policy, prompting, creative), an importance
          score (0–1), and optional "why it matters" context. Enrichment is bounded to post content only — the
          system does not invent facts or infer private intent beyond what the post text supports.
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-2">Caveats</h2>
        <ul className="space-y-1.5 list-disc list-inside">
          <li>Importance scores are approximate and may reflect AI biases.</li>
          <li>Topic classification uses a fixed taxonomy; edge cases may be miscategorized.</li>
          <li>Some handles may change, become inactive, or post in languages other than English.</li>
          <li>This dashboard does not write to or interact with X on your behalf.</li>
          <li>All data is public information sourced from the X API.</li>
        </ul>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-2">Technical stack</h2>
        <p>
          Static site on GitHub Pages. Frontend built with React + TypeScript + Vite. Data pipeline runs on a
          scheduled GitHub Actions workflow that fetches the X timeline API, enriches posts with Claude, and
          commits updated JSON artifacts. No backend. No login required.
        </p>
      </div>
    </div>
  )
}
