import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

const WEBHOOK_URL = "/api/public/reel-proxy";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Un-reel Engine — AI Reel Script Generator" },
      { name: "description", content: "Generate viral reel scripts in seconds with AI. Hooks, scripts, captions, CTAs and hashtags tailored to your niche." },
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
  { key: "ai_tools", emoji: "🤖", label: "AI tools" },
  { key: "relationships", emoji: "❤️", label: "Relationships" },
  { key: "business", emoji: "🚀", label: "Business" },
];
const DURATIONS = ["30s", "45s", "60s", "90s"];
const TONES = ["Bold & direct", "Educational", "Storytelling", "Controversial", "Listicle / tips", "Raw & honest"];

const STEPS = [
  "Researching niche...",
  "Crafting hook...",
  "Writing script...",
  "Finalising package...",
];
const STEP_DELAY = 1200;

type Output = {
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
  const [duration, setDuration] = useState(DURATIONS[2]);
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [output, setOutput] = useState<Output | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const niche = NICHES.find((n) => n.key === nicheKey) ?? NICHES[0];

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  async function generate() {
    setError(null);
    setOutput(null);
    setLoading(true);
    setActiveStep(0);

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    for (let i = 1; i < STEPS.length; i++) {
      timersRef.current.push(setTimeout(() => setActiveStep(i), STEP_DELAY * i));
    }
    const stepsDonePromise = new Promise<void>((res) =>
      timersRef.current.push(setTimeout(res, STEP_DELAY * STEPS.length))
    );

    try {
      const fetchPromise = fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: nicheKey, tone, topic, duration }),
      }).then(async (res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return (await res.json()) as Output;
      });

      const [data] = await Promise.all([fetchPromise, stepsDonePromise]);
      setOutput(data);
    } catch (e) {
      await stepsDonePromise.catch(() => {});
      setError("Generation failed — check your connection.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  function copyAll() {
    if (!output) return;
    const text = [
      `HOOK\n${output.hook}`,
      `SCRIPT\n${output.script}`,
      `CAPTION\n${output.caption}`,
      `CTA\n${output.cta}`,
      `HASHTAGS\n${output.hashtags}`,
    ].join("\n\n---\n\n");
    copy(text);
  }

  const cards = output
    ? [
        { label: "Hook", color: "#e8ff47", content: output.hook },
        { label: "Script", color: "#ff6b35", content: output.script, isScript: true },
        { label: "Caption", color: "#47d4ff", content: output.caption },
        { label: "CTA", color: "#b266ff", content: output.cta },
        { label: "Hashtags", color: "#3dff9a", content: output.hashtags },
      ]
    : [];

  return (
    <div className="grain min-h-screen" style={{ backgroundColor: "#0a0a0b" }}>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="flex items-start justify-between gap-4 mb-16">
          <div>
            <div className="font-display text-primary uppercase text-sm tracking-wider">Un-reel Engine</div>
            <div className="text-muted-foreground text-xs mt-1">Part 2 prototype — AI script generation system</div>
          </div>
          <div className="flex items-center gap-2 border border-border px-3 py-1.5 rounded-full text-xs">
            <span className="pulse-dot inline-block w-2 h-2 rounded-full" style={{ backgroundColor: "#3dff9a", color: "#3dff9a" }} />
            <span className="text-muted-foreground">Claude API · <span className="text-foreground">live</span></span>
          </div>
        </header>

        <section className="mb-12">
          <h1 className="font-display text-5xl md:text-7xl leading-[0.95]">
            Script any reel.<br />
            <span className="text-primary">In seconds.</span>
          </h1>
          <p className="text-muted-foreground mt-6 max-w-xl text-sm">
            Drop your niche, pick a tone, and let the engine deliver hook, script, caption, CTA and hashtags — formatted to ship straight into your editor.
          </p>
        </section>

        <section className="border border-border bg-card p-6 md:p-8 mb-10">
          {/* Niche pill row */}
          <div className="mb-6">
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Niche / Channel type</label>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 niche-scroll">
              {NICHES.map((n) => {
                const active = n.key === nicheKey;
                return (
                  <button
                    key={n.key}
                    type="button"
                    onClick={() => setNicheKey(n.key)}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2.5 border transition text-sm ${active ? "border-primary text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
                    style={active ? { backgroundColor: "color-mix(in oklab, var(--primary) 10%, transparent)" } : {}}
                  >
                    <span className="text-base leading-none">{n.emoji}</span>
                    <span className="whitespace-nowrap">{n.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Reel duration target">
              <select value={duration} onChange={(e) => setDuration(e.target.value)} className="input">
                {DURATIONS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Topic / Angle (optional)">
              <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. why most morning routines fail" className="input" />
            </Field>
            <Field label="Content tone" full>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => {
                  const active = t === tone;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`px-3 py-1.5 text-xs border transition ${active ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                      style={active ? { backgroundColor: "color-mix(in oklab, var(--primary) 12%, transparent)" } : {}}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>

          {!loading ? (
            <button
              onClick={generate}
              className="mt-8 w-full py-4 font-display uppercase tracking-wider text-sm bg-primary text-primary-foreground hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              ⚡ Generate Reel Script
            </button>
          ) : (
            <div className="mt-8 border border-border p-5 space-y-3">
              {STEPS.map((label, i) => {
                const visible = i <= activeStep;
                const active = i === activeStep;
                const done = i < activeStep;
                return (
                  <div
                    key={label}
                    className="flex items-center gap-3 text-sm transition-opacity duration-300"
                    style={{ opacity: visible ? 1 : 0 }}
                  >
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${active ? "pulse-dot" : ""}`}
                      style={{
                        backgroundColor: visible ? "#e8ff47" : "transparent",
                        border: "1px solid #e8ff47",
                        opacity: done ? 0.55 : 1,
                      }}
                    />
                    <span className={done ? "text-muted-foreground" : "text-foreground"}>{label}</span>
                  </div>
                );
              })}
            </div>
          )}
          {error && <p className="text-destructive text-xs mt-3">{error}</p>}
        </section>

        {output && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display uppercase text-sm tracking-wider text-muted-foreground">Generated output</h2>
              <button onClick={copyAll} className="text-xs border border-border px-3 py-1.5 hover:border-primary hover:text-primary transition">Copy all</button>
            </div>

            <div className="space-y-3">
              {cards.map((c, i) => (
                <div
                  key={c.label}
                  className="card-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <OutputCard label={c.label} color={c.color} content={c.content} onCopy={() => copy(c.content)}>
                    {c.isScript && (
                      <div className="border-t border-border mt-4 pt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                        <span>words: <span className="text-foreground">{output.wordCount ?? "—"}</span></span>
                        <span>est. duration: <span className="text-foreground">{output.estDuration ?? duration}</span></span>
                        <span>niche: <span className="text-foreground">{niche.label}</span></span>
                        <span>tone: <span className="text-foreground">{tone}</span></span>
                      </div>
                    )}
                  </OutputCard>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border border-border p-3 text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-x-4">
                <span>{niche.emoji} {niche.label}</span>
                <span>·</span>
                <span>{tone}</span>
                <span>·</span>
                <span>{duration}</span>
              </div>
              <button onClick={generate} className="text-foreground hover:text-primary transition">↻ Regenerate</button>
            </div>
          </section>
        )}

        <footer className="mt-20 text-xs text-muted-foreground">
          un-reel engine // v0.2 prototype
        </footer>
      </div>

      <style>{`
        .input {
          width: 100%;
          background: #0a0a0b;
          border: 1px solid var(--color-border);
          color: var(--color-foreground);
          padding: 0.65rem 0.8rem;
          font-family: var(--font-mono);
          font-size: 0.85rem;
          outline: none;
        }
        .input:focus { border-color: var(--color-primary); }
        select.input { appearance: none; cursor: pointer; }
        .niche-scroll::-webkit-scrollbar { height: 6px; }
        .niche-scroll::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
        .card-in {
          opacity: 0;
          transform: translateY(20px);
          animation: cardIn 0.45s ease-out forwards;
        }
        @keyframes cardIn {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">{label}</label>
      {children}
    </div>
  );
}

function OutputCard({
  label,
  color,
  content,
  onCopy,
  children,
}: {
  label: string;
  color: string;
  content: string;
  onCopy: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5" style={{ backgroundColor: color }} />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        </div>
        <button onClick={onCopy} className="text-xs text-muted-foreground hover:text-foreground transition">Copy</button>
      </div>
      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground">{content}</pre>
      {children}
    </div>
  );
}
