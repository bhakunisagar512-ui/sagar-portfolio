import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";

/* Tiny looping animations that act out what each project does. Illustrative, not real output.
   Each renders in the accent --c set on its project card, so every demo glows its own color. */

// Steps 0..frames-1 on a timer, only while on screen. Reduced motion shows the final frame.
function useLoop(frames, ms = 1000) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-10%" });
  const reduce = useReducedMotion();
  const [i, setI] = useState(frames - 1);
  useEffect(() => {
    if (!inView || reduce) return;
    setI(0);
    const t = setInterval(() => setI((x) => (x + 1) % frames), ms);
    return () => clearInterval(t);
  }, [inView, reduce, frames, ms]);
  return [ref, reduce ? frames - 1 : i];
}

const Frame = ({ label, alt, innerRef, children, foot }) => (
  <div ref={innerRef} role="img" aria-label={alt} className="screen mb-5 min-w-0 overflow-hidden rounded-lg border border-(--c)/35 font-mono text-xs">
    <div className="flex items-center gap-2 border-b border-(--c)/20 px-3 py-1.5 text-dim" aria-hidden="true">
      <span className="flex gap-1"><i className="size-2 rounded-full bg-line" /><i className="size-2 rounded-full bg-line" /><i className="size-2 rounded-full bg-line" /></span>
      <span className="truncate">{label}</span>
      <span className="ml-auto flex items-center gap-1.5 text-(--c)"><i className="size-1.5 animate-pulse rounded-full bg-(--c) shadow-[0_0_6px_var(--c)]" />live</span>
    </div>
    <div className="relative h-40 px-3 py-2.5" aria-hidden="true">{children}</div>
    {foot && <div className="border-t border-(--c)/20 px-3 py-1.5 text-dim" aria-hidden="true">{foot}</div>}
  </div>
);
const fade = { initial: { opacity: 0, x: -8 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, transition: { duration: 0.1 } }, transition: { duration: 0.25 } };

/* ---- Self-Healing AI Agent: tool call fails, pipeline retries with context ---- */
const AGENT = [
  ["$", "user: \"refund order #1042\"", ""],
  ["→", "tool get_order(1042)", "✓ 184ms"],
  ["→", "tool issue_refund()", "✕ timeout"],
  ["⟳", "detect → retry with context", ""],
  ["→", "tool issue_refund()", "✓ 212ms"],
  ["✓", "reply streamed over WebSocket", ""],
];
export function AgentDemo() {
  const [ref, i] = useLoop(AGENT.length + 2, 900);
  return (
    <Frame innerRef={ref} label="agent.log" alt="Animated log: a tool call times out, the agent detects it, retries with context, and succeeds."
      foot="detect → retry → escalate">
      <ul className="space-y-1.5">
        <AnimatePresence>
          {AGENT.slice(0, i + 1).map(([g, t, r]) => (
            <motion.li key={t + r} {...fade} className="flex gap-2 whitespace-nowrap">
              <span className="text-(--c)">{g}</span><span className="min-w-0 truncate text-paper/85">{t}</span>
              <span className={`ml-auto ${r.startsWith("✕") ? "text-red-400" : "text-(--c)"}`}>{r}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </Frame>
  );
}

/* ---- Task Scheduler: a worker dies, its task is reclaimed by another ---- */
// Each frame: per worker [state, task, reclaimed?]
const SCHED = [
  [["run", 41], ["run", 42], ["run", 43], ["idle"]],
  [["ok", 41], ["run", 42], ["run", 43], ["run", 44]],
  [["run", 45], ["ok", 42], ["dead", 43], ["run", 44]],
  [["run", 45], ["run", 46], ["dead", 43], ["ok", 44]],
  [["ok", 45], ["run", 46], ["dead", 43], ["run", 43, true]],
  [["run", 47], ["ok", 46], ["dead", 43], ["ok", 43, true]],
  [["run", 47], ["ok", 46], ["dead", 43], ["ok", 43, true]],
];
export function SchedulerDemo() {
  const [ref, i] = useLoop(SCHED.length, 1000);
  return (
    <Frame innerRef={ref} label="scheduler — 4 of 500+ workers" alt="Animated workers pull tasks; one worker loses its heartbeat and another worker reclaims its task, so no task is lost."
      foot={<>row-level locks · <span className="text-(--c)">0 tasks lost</span></>}>
      <ul className="space-y-2.5">
        {SCHED[i].map(([s, t, re], w) => (
          <li key={w} className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${s === "dead" ? "bg-red-400" : s === "idle" ? "bg-line" : "bg-(--c)"}`} />
            <span className="w-6 text-dim">W{w + 1}</span>
            {s === "dead" ? <span className="text-red-400">✕ heartbeat lost</span> : s === "idle" ? <span className="text-dim">idle</span> : (
              <>
                <span className="w-16 text-paper/85">task#{t}</span>
                <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                  <motion.span key={`${t}${s}`} className="absolute inset-y-0 left-0 rounded-full bg-(--c) shadow-[0_0_8px_var(--c)]"
                    initial={{ width: s === "ok" ? "100%" : "0%" }} animate={{ width: s === "ok" ? "100%" : "85%" }} transition={{ duration: 0.9, ease: "linear" }} />
                </span>
                <span className="w-20 text-right text-(--c)">{re ? "reclaimed " : ""}{s === "ok" ? "✓" : ""}</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </Frame>
  );
}

/* ---- Spend-Track: transactions arrive, Gemini tags them ---- */
const TXNS = [["Swiggy", "₹340", "Food"], ["Uber", "₹212", "Transport"], ["Netflix", "₹649", "Subscriptions"]];
export function SpendDemo() {
  const [ref, i] = useLoop(TXNS.length * 2 + 2, 800);
  return (
    <Frame innerRef={ref} label="transactions" alt="Animated list: transactions arrive and Gemini assigns each one a category."
      foot="Gemini auto-categorization">
      <ul className="space-y-2">
        <AnimatePresence>
          {TXNS.filter((_, k) => i >= k * 2).map(([m, amt, cat], k) => (
            <motion.li key={m} {...fade} className="flex items-center gap-2 rounded-md border border-line bg-panel px-2.5 py-1.5">
              <span className="text-paper">{m}</span><span className="text-dim">{amt}</span>
              <span className="ml-auto">
                {i >= k * 2 + 1
                  ? <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded bg-(--c)/15 px-1.5 py-0.5 text-(--c)">✦ {cat}</motion.span>
                  : <span className="animate-pulse text-dim">categorizing…</span>}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </Frame>
  );
}

/* ---- Job Tracker: an application moves through the 6-stage pipeline ---- */
const STAGES = ["Saved", "Applied", "Screen", "Interview", "Offer", "Accepted"];
export function JobsDemo() {
  const [ref, i] = useLoop(STAGES.length + 1, 900);
  const at = Math.min(i, STAGES.length - 1);
  return (
    <Frame innerRef={ref} label="pipeline" alt="Animated pipeline: an application moves through six stages from Saved to Accepted."
      foot={<>status: <span className="text-(--c)">{STAGES[at]}</span></>}>
      <div className="flex h-full flex-col justify-center">
        <div className="relative mx-2">
          <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-line" />
          <motion.div className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-(--c) shadow-[0_0_8px_var(--c)]" animate={{ width: `${(at / (STAGES.length - 1)) * 100}%` }} transition={{ duration: 0.5 }} />
          <ol className="relative flex justify-between">
            {STAGES.map((s, k) => (
              <li key={s} className={`size-3 rounded-full border-2 ${k <= at ? "border-(--c) bg-(--c) shadow-[0_0_8px_var(--c)]" : "border-line bg-ink"}`} />
            ))}
          </ol>
        </div>
        <p className="mt-2 text-center text-dim">stage {at + 1} of {STAGES.length}</p>
        <motion.div key={at} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-5 self-center rounded-md border border-line bg-panel px-3 py-1.5 text-paper/90">
          SDE Intern · moved to <span className="text-(--c)">{STAGES[at]}</span>
        </motion.div>
      </div>
    </Frame>
  );
}

/* ---- AI Spend Audit: scan line items, flag the outlier ---- */
const ITEMS = [["Cloud compute", 72], ["API usage", 58], ["SaaS seats", 91, true], ["Subscriptions", 34]];
export function AuditDemo() {
  const [ref, i] = useLoop(ITEMS.length + 2, 850);
  return (
    <Frame innerRef={ref} label="audit" alt="Animated audit: spend line items are scanned one by one and an outlier is flagged."
      foot={i >= ITEMS.length ? <span className="text-(--c)">⚠ 1 anomaly flagged</span> : "scanning…"}>
      <ul className="space-y-3 pt-1">
        {ITEMS.map(([n, v, bad], k) => (
          <li key={n} className="flex items-center gap-2">
            <span className={`w-24 truncate ${k === i ? "text-paper" : "text-dim"}`}>{n}</span>
            <span className="relative h-2 flex-1 rounded-full bg-line">
              <motion.span className={`absolute inset-y-0 left-0 rounded-full ${bad && i > k ? "bg-red-400" : "bg-(--c)/70"}`}
                animate={{ width: i >= k ? `${v}%` : "0%" }} transition={{ duration: 0.5 }} />
            </span>
            <span className="w-4 text-red-400">{bad && i > k ? "⚠" : ""}</span>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

/* ---- Prepare AI: a generated question gets answered ---- */
const OPTS = ["FCFS", "Round Robin", "Priority", "SJF (non-preemptive)"];
export function PrepareDemo() {
  const [ref, i] = useLoop(5, 900);
  return (
    <Frame innerRef={ref} label="practice session" alt="Animated quiz: a generated exam question is answered and marked correct."
      foot={<>Q3/10 · score <span className="text-(--c)">{i >= 3 ? 3 : 2}</span></>}>
      <p className="text-paper/90">Which scheduling algorithm can cause starvation?</p>
      <ul className="mt-2 grid grid-cols-2 gap-1.5">
        {OPTS.map((o, k) => {
          const pick = k === 2 && i >= 2, right = pick && i >= 3;
          return (
            <li key={o} className={`truncate rounded border px-2 py-1 transition-colors ${right ? "border-(--c) bg-(--c)/15 text-(--c)" : pick ? "border-(--c)/60 text-paper" : "border-line text-dim"}`}>
              {right ? "✓ " : ""}{o}
            </li>
          );
        })}
      </ul>
    </Frame>
  );
}

/* ---- Urban Heat Env: greedy agent cools the hottest block each step ---- */
const W = 10, H = 5, STEPS = 10;
const HEAT = (() => {
  let g = Array.from({ length: W * H }, (_, k) => {
    const x = k % W, y = Math.floor(k / W);
    return Math.max(0.15, 1 - Math.hypot(x - 4.5, y - 2) / 5.5 + ((k * 37) % 11) / 40);
  });
  const frames = [g];
  for (let s = 0; s < STEPS; s++) {
    const hot = g.indexOf(Math.max(...g)), hx = hot % W, hy = Math.floor(hot / W);
    g = g.map((v, k) => {
      const d = Math.abs((k % W) - hx) + Math.abs(Math.floor(k / W) - hy);
      return d === 0 ? v * 0.25 : d === 1 ? v * 0.6 : d === 2 ? v * 0.85 : v;
    });
    frames.push(g);
  }
  return frames;
})();
const avg = (g) => g.reduce((a, b) => a + b, 0) / g.length;
export function HeatDemo() {
  const [ref, i] = useLoop(HEAT.length + 2, 600);
  const s = Math.min(i, HEAT.length - 1), g = HEAT[s];
  const drop = ((1 - avg(g) / avg(HEAT[0])) * 100).toFixed(0);
  return (
    <Frame innerRef={ref} label={`city grid · step ${s}/${STEPS}`} alt="Animated heat map: each step the agent cools the hottest block and the city's average heat falls."
      foot={<>avg heat <span className="text-(--c)">−{drop}%</span></>}>
      <div className="grid h-full gap-1" style={{ gridTemplateColumns: `repeat(${W}, 1fr)`, gridTemplateRows: `repeat(${H}, 1fr)` }}>
        {g.map((v, k) => (
          <motion.span key={k} className="rounded-sm" animate={{ backgroundColor: `hsla(${Math.round(205 - 200 * Math.min(v, 1))}, 90%, 55%, ${(0.3 + 0.6 * Math.min(v, 1)).toFixed(2)})` }} transition={{ duration: 0.5 }} />
        ))}
      </div>
    </Frame>
  );
}
