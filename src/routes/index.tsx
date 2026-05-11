import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

const WEBHOOK_URL = "https://yashrajaipm.app.n8n.cloud/webhook/reel-engine";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Un-Reel Engine — AI Reel Script Generator" },
      { name: "description", content: "Research viral angles, plan your day, and generate full reel content packages — all in one engine." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Syne:wght@600;800&family=DM+Mono:wght@400;500&display=swap" },
    ],
  }),
});

const NICHES = [
  { key: "motivation", emoji: "🔥", label: "Motivation" },
  { key: "finance", emoji: "💰", label: "Finance" },
  { key: "health", emoji: "💪", label: "Health" },
  { key: "ai_tools", emoji: "🤖", label: "AI Tools" },
  { key: "relationships", emoji: "💗", label: "Relationships" },
  { key: "business", emoji: "🚀", label: "Business" },
];

const TONES = ["Bold & direct", "Educational", "Storytelling", "Controversial", "Listicle / tips", "Raw & honest"];

const RESEARCH_STEPS = [
  "Scanning viral content in niche...",
  "Scoring engagement patterns...",
  "Shortlisting top angles...",
  "Ranking by virality score...",
];
const GEN_STEPS = [
  "Researching niche...",
  "Crafting hook...",
  "Writing script...",
  "Finalising package...",
];
const STEP_DELAY = 1000;

type Idea = {
  title: string;
  hook: number;
  emotion: number;
  relevancy: number;
  virality: number;
};

type Slot = { id: string; time: string; tone: string };

type Pack = {
  hook: string;
  script: string;
  caption: string;
  cta: string;
  hashtags: string;
  wordCount?: number;
  estDuration?: string;
};

function Index() {
  const [nicheKey, setNicheKey] = useState(NICHES[0].key);
  const [tone, setTone] = useState(TONES[0]);
  const [showToneInfo, setShowToneInfo] = useState(false);
  const [topic, setTopic] = useState("");
  const [weekly, setWeekly] = useState(false);
  const [weeklyTopic, setWeeklyTopic] = useState("");

  const [researching, setResearching] = useState(false);
  const [researchStep, setResearchStep] = useState(0);
  const [ideas, setIdeas] = useState<Idea[] | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  const [slots, setSlots] = useState<Slot[]>([
    { id: "s1", time: "09:00", tone: TONES[0] },
    { id: "s2", time: "18:00", tone: TONES[1] },
  ]);

  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [packs, setPacks] = useState<Pack[] | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const [scheduled, setScheduled] = useState(false);

  const scheduleRef = useRef<HTMLDivElement | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  const niche = NICHES.find((n) => n.key === nicheKey)!;
  const suggestedTone = useMemo(() => (nicheKey === "health" ? "Educational" : null), [nicheKey]);

  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  function runSteps(count: number, setter: (i: number) => void): Promise<void> {
    setter(0);
    clearTimers();
    for (let i = 1; i < count; i++) {
      timersRef.current.push(setTimeout(() => setter(i), STEP_DELAY * i));
    }
    return new Promise<void>((res) =>
      timersRef.current.push(setTimeout(res, STEP_DELAY * count))
    );
  }

  async function researchAngles() {
    setIdeas(null);
    setSelectedIdea(null);
    setPacks(null);
    setScheduled(false);
    setResearching(true);
    await runSteps(RESEARCH_STEPS.length, setResearchStep);
    const baseTopic = weekly ? (weeklyTopic || "weekly summary") : (topic || niche.label);
    const generated: Idea[] = [
      { title: `Why everyone is wrong about ${baseTopic}`, hook: 5, emotion: 4, relevancy: 4, virality: 5 },
      { title: `The 3-step ${baseTopic} system nobody talks about`, hook: 4, emotion: 4, relevancy: 5, virality: 4 },
      { title: `I tried ${baseTopic} for 30 days — here's what happened`, hook: 5, emotion: 5, relevancy: 4, virality: 4 },
      { title: `${baseTopic}: the brutal truth in 60 seconds`, hook: 4, emotion: 5, relevancy: 4, virality: 5 },
    ];
    setIdeas(generated);
    setResearching(false);
  }

  function addSlot() {
    if (slots.length >= 4) return;
    setSlots([...slots, { id: `s${Date.now()}`, time: "12:00", tone: TONES[0] }]);
  }
  function removeSlot(id: string) {
    setSlots(slots.filter((s) => s.id !== id));
  }
  function updateSlot(id: string, patch: Partial<Slot>) {
    setSlots(slots.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function generateAll() {
    if (!selectedIdea) return;
    setGenError(null);
    setPacks(null);
    setScheduled(false);
    setGenerating(true);
    const stepsDone = runSteps(GEN_STEPS.length, setGenStep);

    try {
      const requests = slots.map((slot) =>
        fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            niche: nicheKey,
            tone: slot.tone,
            topic: `${selectedIdea.title}${topic ? ` — ${topic}` : ""}`,
            duration: "60s",
            timeSlot: slot.time,
            angle: selectedIdea.title,
            weeklySummary: weekly ? weeklyTopic : undefined,
          }),
        }).then(async (res) => {
          if (!res.ok) throw new Error(`Request failed: ${res.status}`);
          return (await res.json()) as Pack;
        })
      );
      const [results] = await Promise.all([Promise.all(requests), stepsDone]);
      setPacks(results);
    } catch (e) {
      await stepsDone.catch(() => {});
      console.error(e);
      setGenError("Generation failed — check your connection.");
    } finally {
      setGenerating(false);
    }
  }

  function copy(text: string) { navigator.clipboard.writeText(text); }

  return (
    <div className="grain min-h-screen" style={{ backgroundColor: "#0a0a0a" }}>
      <div className="mx-auto max-w-5xl px-5 py-10">
        <header className="flex items-start justify-between gap-4 mb-12">
          <div>
            <div className="font-display text-primary uppercase text-sm tracking-wider">Un-Reel Engine</div>
            <div className="text-muted-foreground text-xs mt-1">v0.3 prototype — full content workflow</div>
          </div>
          <div className="flex items-center gap-2 border border-border px-3 py-1.5 rounded-full text-xs">
            <span className="pulse-dot inline-block w-2 h-2 rounded-full" style={{ backgroundColor: "#3dff9a" }} />
            <span className="text-muted-foreground">Claude API · <span className="text-foreground">live</span></span>
          </div>
        </header>

        <section className="mb-10">
          <h1 className="font-display text-4xl md:text-6xl leading-[0.95]">
            Research. Plan. <span className="text-primary">Ship.</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl text-sm">
            From viral angle research to a full day's reel schedule — one engine.
          </p>
        </section>

        {/* STEP 1 — Niche */}
        <Step n={1} title="Pick your niche">
          <div className="flex flex-wrap gap-2">
            {NICHES.map((n) => {
              const active = n.key === nicheKey;
              return (
                <button
                  key={n.key}
                  type="button"
                  onClick={() => setNicheKey(n.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 border text-sm transition ${active ? "border-primary text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
                  style={active ? { backgroundColor: "color-mix(in oklab, var(--primary) 12%, transparent)" } : {}}
                >
                  <span>{n.emoji}</span>
                  <span>{n.label}</span>
                </button>
              );
            })}
            <div className="relative group">
              <button
                disabled
                className="flex items-center gap-2 px-4 py-2.5 border border-border text-sm text-muted-foreground/60 cursor-not-allowed"
              >
                <span>🔗</span>
                <span>Cross-Niche</span>
                <span>🔒</span>
              </button>
              <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 text-xs bg-card border border-border p-3 opacity-0 group-hover:opacity-100 transition z-10">
                Phase 2 — cross-niche trend blending. Coming soon.
              </div>
            </div>
          </div>
        </Step>

        {/* STEP 2 — Tone */}
        <Step n={2} title="Choose your tone">
          <div className="flex flex-wrap gap-2 items-center">
            {TONES.map((t) => {
              const active = t === tone;
              const suggested = suggestedTone === t;
              return (
                <div key={t} className="relative">
                  <button
                    type="button"
                    onClick={() => setTone(t)}
                    className={`px-3 py-2 text-xs border transition ${active ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                    style={active ? { backgroundColor: "color-mix(in oklab, var(--primary) 12%, transparent)" } : {}}
                  >
                    {t}
                    {suggested && (
                      <span
                        className="ml-2 px-1.5 py-0.5 text-[10px] uppercase tracking-wider"
                        style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                      >
                        Suggested
                      </span>
                    )}
                  </button>
                  {suggested && (
                    <span className="inline-flex items-center ml-1 align-middle">
                      <button
                        type="button"
                        onClick={() => setShowToneInfo((v) => !v)}
                        className="w-5 h-5 inline-flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-primary text-[11px]"
                        aria-label="Why suggested?"
                      >
                        ⓘ
                      </button>
                      {showToneInfo && (
                        <div className="absolute left-0 top-full mt-2 w-72 text-xs bg-card border border-border p-3 z-10">
                          Your last Health post used a Controversial tone. We suggest balancing with Educational to build trust with your audience.
                        </div>
                      )}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Step>

        {/* STEP 3 — Topic + Weekly */}
        <Step n={3} title="Topic & weekly summary">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Optional topic / angle (e.g. why most morning routines fail)"
            className="input"
          />
          <label className="mt-4 flex items-center gap-3 cursor-pointer select-none">
            <span
              onClick={() => setWeekly(!weekly)}
              className="relative inline-block w-10 h-5 rounded-full transition"
              style={{ backgroundColor: weekly ? "var(--primary)" : "var(--color-border)" }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-4 h-4 bg-background rounded-full transition"
                style={{ transform: weekly ? "translateX(20px)" : "translateX(0)" }}
              />
            </span>
            <span className="text-sm">📋 Weekly Summary Reel</span>
          </label>
          {weekly && (
            <input
              value={weeklyTopic}
              onChange={(e) => setWeeklyTopic(e.target.value)}
              placeholder="What topic to summarise? (e.g. biggest AI news this week)"
              className="input mt-3"
            />
          )}
        </Step>

        {/* STEP 4 — Research */}
        <div className="mb-8">
          {!researching ? (
            <button
              onClick={researchAngles}
              className="w-full py-4 font-display uppercase tracking-wider text-sm bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              🔍 Research Viral Angles
            </button>
          ) : (
            <StepTracker steps={RESEARCH_STEPS} active={researchStep} />
          )}
        </div>

        {ideas && (
          <Step n={4} title="Top viral angles">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ideas.map((idea, i) => {
                const avg = ((idea.hook + idea.emotion + idea.relevancy + idea.virality) / 4).toFixed(1);
                const isSelected = selectedIdea?.title === idea.title;
                return (
                  <div
                    key={idea.title}
                    className="card-in border bg-card p-5"
                    style={{
                      animationDelay: `${i * 80}ms`,
                      borderColor: isSelected ? "var(--primary)" : "var(--color-border)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <h3 className="font-display text-lg leading-tight">{idea.title}</h3>
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-display text-primary leading-none">{avg}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">/ 5</div>
                      </div>
                    </div>
                    <div className="space-y-1.5 mb-4 text-xs">
                      <Rating icon="⚡" label="Hook Strength" value={idea.hook} />
                      <Rating icon="❤️" label="Emotional Engagement" value={idea.emotion} />
                      <Rating icon="🎯" label="Relevancy" value={idea.relevancy} />
                      <Rating icon="📈" label="Virality Potential" value={idea.virality} />
                    </div>
                    <button
                      onClick={() => { setSelectedIdea(idea); setPacks(null); setScheduled(false); }}
                      className={`w-full py-2 text-xs uppercase tracking-wider border transition ${isSelected ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary hover:text-primary"}`}
                    >
                      {isSelected ? "✓ Selected" : "Select This Angle"}
                    </button>
                  </div>
                );
              })}
            </div>
          </Step>
        )}

        {/* STEP 5 — Schedule */}
        {selectedIdea && (
          <Step n={5} title="Plan your day">
            <div className="space-y-3">
              {slots.map((slot, i) => (
                <div key={slot.id} className="border border-border bg-card p-4 flex flex-col md:flex-row gap-3 md:items-center">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground md:w-20">Post {i + 1}</div>
                  <input
                    type="time"
                    value={slot.time}
                    onChange={(e) => updateSlot(slot.id, { time: e.target.value })}
                    className="input md:w-32"
                  />
                  <select
                    value={slot.tone}
                    onChange={(e) => updateSlot(slot.id, { tone: e.target.value })}
                    className="input flex-1"
                  >
                    {TONES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  {slots.length > 1 && (
                    <button onClick={() => removeSlot(slot.id)} className="text-xs text-muted-foreground hover:text-destructive transition px-2">✕</button>
                  )}
                </div>
              ))}
            </div>
            {slots.length < 4 && (
              <button onClick={addSlot} className="mt-3 text-xs border border-border px-3 py-2 hover:border-primary hover:text-primary transition">
                + Add Time Slot
              </button>
            )}
            <div className="mt-6">
              {!generating ? (
                <button
                  onClick={generateAll}
                  className="w-full py-4 font-display uppercase tracking-wider text-sm bg-primary text-primary-foreground hover:opacity-90 transition"
                >
                  ⚡ Generate All Scripts
                </button>
              ) : (
                <StepTracker steps={GEN_STEPS} active={genStep} />
              )}
              {genError && <p className="text-destructive text-xs mt-3">{genError}</p>}
            </div>
          </Step>
        )}

        {/* STEP 6 — Output */}
        {packs && (
          <Step n={6} title="Generated content packages">
            <div className="space-y-6">
              {packs.map((p, i) => {
                const slot = slots[i];
                return (
                  <div key={i} className="card-in border border-border bg-card p-5" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <div className="font-display uppercase text-sm tracking-wider">Post {i + 1} · {slot?.time}</div>
                      <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3">
                        <span>{niche.emoji} {niche.label}</span>
                        <span>·</span>
                        <span>{slot?.tone}</span>
                        <span>·</span>
                        <span>{slot?.time}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Section label="Hook" color="#e8ff47" content={p.hook} onCopy={() => copy(p.hook)} />
                      <Section label="Script" color="#ff6b35" content={p.script} onCopy={() => copy(p.script)} />
                      <Section label="Caption" color="#47d4ff" content={p.caption} onCopy={() => copy(p.caption)} />
                      <Section label="CTA" color="#b266ff" content={p.cta} onCopy={() => copy(p.cta)} />
                      <Section label="Hashtags" color="#3dff9a" content={p.hashtags} onCopy={() => copy(p.hashtags)} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* STEP 7 — Schedule all */}
            {!scheduled ? (
              <button
                onClick={() => setScheduled(true)}
                className="mt-6 w-full py-4 font-display uppercase tracking-wider text-sm bg-primary text-primary-foreground hover:opacity-90 transition"
              >
                🗓 Schedule All Posts
              </button>
            ) : (
              <div className="mt-6 border border-primary bg-card p-6 card-in">
                <div className="font-display text-xl text-primary mb-2">✅ All {packs.length} posts scheduled for today.</div>
                <div className="text-sm text-muted-foreground mb-4">Your content machine is running.</div>
                <ul className="space-y-2 text-sm">
                  {slots.slice(0, packs.length).map((s, i) => (
                    <li key={s.id} className="flex justify-between border-b border-border py-2">
                      <span>Post {i + 1} · {s.tone}</span>
                      <span className="text-primary font-mono">{s.time}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-4">Auto-posting via Metricool API — Phase 2</p>
              </div>
            )}
          </Step>
        )}

        <footer className="mt-20 text-xs text-muted-foreground">
          un-reel engine // v0.3 prototype
        </footer>
      </div>

      <style>{`
        .input {
          width: 100%;
          background: #0a0a0a;
          border: 1px solid var(--color-border);
          color: var(--color-foreground);
          padding: 0.65rem 0.8rem;
          font-family: var(--font-mono);
          font-size: 0.85rem;
          outline: none;
        }
        .input:focus { border-color: var(--color-primary); }
        select.input { appearance: none; cursor: pointer; }
        .card-in {
          opacity: 0;
          transform: translateY(16px);
          animation: cardIn 0.45s ease-out forwards;
        }
        @keyframes cardIn { to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-7 h-7 inline-flex items-center justify-center text-xs font-display border border-primary text-primary">
          {n}
        </span>
        <h2 className="font-display uppercase text-sm tracking-wider">{title}</h2>
      </div>
      <div className="border border-border bg-card p-5">{children}</div>
    </section>
  );
}

function StepTracker({ steps, active }: { steps: string[]; active: number }) {
  return (
    <div className="border border-border bg-card p-5 space-y-3">
      {steps.map((label, i) => {
        const visible = i <= active;
        const isActive = i === active;
        const done = i < active;
        return (
          <div key={label} className="flex items-center gap-3 text-sm transition-opacity duration-300" style={{ opacity: visible ? 1 : 0.25 }}>
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${isActive ? "pulse-dot" : ""}`}
              style={{ backgroundColor: visible ? "var(--primary)" : "transparent", border: "1px solid var(--primary)", opacity: done ? 0.55 : 1 }}
            />
            <span className={done ? "text-muted-foreground" : "text-foreground"}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function Rating({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground"><span className="mr-1.5">{icon}</span>{label}</span>
      <span className="font-mono">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} style={{ color: i < value ? "var(--primary)" : "var(--color-border)" }}>★</span>
        ))}
      </span>
    </div>
  );
}

function Section({ label, color, content, onCopy }: { label: string; color: string; content: string; onCopy: () => void }) {
  return (
    <div className="border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2" style={{ backgroundColor: color }} />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        </div>
        <button onClick={onCopy} className="text-xs text-muted-foreground hover:text-foreground transition">Copy</button>
      </div>
      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{content}</pre>
    </div>
  );
}
