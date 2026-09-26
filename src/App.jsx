import { useEffect, useRef, useState } from "react";
import { motion, animate, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { AgentDemo, SchedulerDemo, SpendDemo, JobsDemo, AuditDemo, PrepareDemo, HeatDemo } from "./demos";

/* ---------- DATA ---------- */
const LINKS = {
  email: "mailto:bhakunisagar512@gmail.com",
  github: "https://github.com/bhakunisagar512-ui",
  linkedin: "https://linkedin.com/in/sagar-bhakuni-b23409328",
  leetcode: "https://leetcode.com/u/Stark718",
  gfg: "https://geeksforgeeks.org/user/bhakunisagar512",
};
const GH = (r) => `https://github.com/bhakunisagar512-ui/${r}`;
const TAGLINE = "MCA Student | Full-Stack & Backend Engineer | AI/LLM Systems";

const NAV = [
  ["summary", "Summary"], ["skills", "Technical Skills"], ["education", "Education"],
  ["experience", "Experience"], ["projects", "Projects"], ["contact", "Contact Me"],
];

const EDUCATION = [
  { deg: "MCA", org: "ABES Engineering College", when: "Aug 2025 – Jun 2027", pts: ["Ghaziabad", "CGPA 9.55/10"] },
  { deg: "BCA", org: "Manipal University Jaipur", when: "Dec 2021 – Apr 2025", pts: ["CGPA 8.78/10", "Dean's List (Top 5%)"] },
];

const EXPERIENCE = [
  { role: "Software Developer Intern", org: "Labmentix", when: "May 2026 – Aug 2026", pts: [
    "Built a Java/Spring Boot upload pipeline handling 10MB files across 500+ records.",
    "Shipped 8+ secure REST APIs with Spring Security + JWT, cutting auth latency 35%.",
    "Wrote 40+ JUnit tests (85%+ coverage) and resolved 15+ integration bugs." ] },
  { role: "Founder & Lead Engineer", org: "Kedara, E-Commerce Platform", when: "Oct 2025 – Present", pts: [
    "Took an ambiguous product brief to production, scaling to 50+ active users.",
    "Built 15+ concurrent REST APIs (Node.js/MongoDB); removed checkout race conditions via state isolation.",
    "Optimized MongoDB indexing, cutting endpoint latency 40%." ] },
];

const SKILLS = [
  { k: "Languages", span: "md:col-span-2", v: ["Java", "Python", "TypeScript", "JavaScript", "C++", "SQL"] },
  { k: "AI / LLM", span: "md:row-span-2", hot: true, v: ["OpenAI GPT-4o-mini tool-calling", "Gemini API", "Prompt Engineering", "faster-whisper STT"] },
  { k: "Backend", span: "md:col-span-2", v: ["Spring Boot", "Spring Security", "FastAPI", "Django REST Framework", "Node.js", "Express.js"] },
  { k: "Frontend", v: ["React.js (Vite)", "HTML5", "CSS3", "Bootstrap"] },
  { k: "Databases", v: ["PostgreSQL", "MySQL", "MongoDB", "Redis"] },
  { k: "DevOps / Tools", span: "md:col-span-2", v: ["Docker", "Git", "GitHub Actions CI/CD", "JUnit", "Postman", "AWS"] },
];

const PROJECTS = [
  { n: "Self-Healing AI Backend Agent", demo: AgentDemo, c: "#a78bfa", f: ["Python", "AI"], s: ["Python", "FastAPI", "OpenAI API", "PostgreSQL", "Redis", "WebSocket"],
    d: "GPT-4o-mini orchestrates 3 tool actions with live WebSocket streaming. A 3-stage recovery pipeline (detect, retry with context, escalate) keeps it running; Redis holds live state, PostgreSQL the audit log. Local faster-whisper speech-to-text and text-to-speech remove paid API dependencies." },
  { n: "Distributed Fault-Tolerant Task Scheduler", demo: SchedulerDemo, c: "#22d3ee", f: ["Java"], s: ["Java", "Spring Boot", "PostgreSQL", "Concurrency"],
    d: "Coordinator-free orchestrator using PostgreSQL row-level locks across 500+ concurrent worker threads with zero task loss. Heartbeat-based failure detection and automated recovery, backed by 25+ JUnit concurrency tests." },
  { n: "Spend-Track", demo: SpendDemo, c: "#34d399", f: ["MERN", "AI"], s: ["React", "Node.js", "PostgreSQL", "Gemini API"], gh: GH("spend-track"),
    d: "Expense tracker with Google Sign-In and Gemini auto-categorization of transactions. 12+ REST APIs, sub-250ms queries, fully Dockerized." },
  { n: "Job Application Tracker", demo: JobsDemo, c: "#60a5fa", f: ["Python"], s: ["React (Vite)", "Django REST", "PostgreSQL", "JWT"],
    d: "6-stage application pipeline with search, filters and a live status dashboard. One-command setup with Docker Compose." },
  { n: "AI Spend Audit", demo: AuditDemo, c: "#a3e635", f: ["AI"], s: ["TypeScript"], gh: GH("ai-spend-audit"), d: "AI-powered spend auditing tool." },
  { n: "Prepare AI", demo: PrepareDemo, c: "#f472b6", f: ["AI"], s: ["JavaScript"], gh: GH("prepare-ai"), d: "Hackathon project that helps users prepare for any exam." },
  { n: "Urban Heat Env", demo: HeatDemo, c: "#fb923c", f: ["Python", "AI"], s: ["Python", "Greedy optimization", "Reinforcement learning"], gh: GH("urban-heat-env"),
    d: "Environment simulation that models urban heat reduction using greedy optimization and reinforcement learning." },
];
const FILTERS = ["All", "Java", "Python", "MERN", "AI"];

/* ---------- HOOKS / SMALL PARTS ---------- */
function useTyping(text, speed = 38, start = 500) {
  const reduce = useReducedMotion();
  const [out, setOut] = useState(reduce ? text : "");
  useEffect(() => {
    if (reduce) return;
    let i = 0, iv;
    const t = setTimeout(() => {
      iv = setInterval(() => { i++; setOut(text.slice(0, i)); if (i >= text.length) clearInterval(iv); }, speed);
    }, start);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, [text, speed, start, reduce]);
  return out;
}

function CountUp({ to, format = (n) => Math.round(n).toLocaleString("en-US"), decimals }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView || reduce) return;
    const c = animate(0, to, { duration: 1.6, ease: "easeOut", onUpdate: setV });
    return () => c.stop();
  }, [inView, to, reduce]);
  const fmt = (n) => (decimals ? n.toFixed(decimals) : format(n));
  // Invisible final value reserves the width so counting doesn't reflow the page mid-scroll.
  return (
    <span ref={ref} className="inline-grid">
      <span className="invisible col-start-1 row-start-1">{fmt(to)}</span>
      <span className="col-start-1 row-start-1">{fmt(v)}</span>
    </span>
  );
}

const Heading = ({ file, children }) => (
  <div className="mb-8">
    <p className="font-mono text-sm text-amber">{file}</p>
    <h2 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{children}</h2>
  </div>
);
const Ext = ({ href, children, className = "" }) => (
  <a href={href} target="_blank" rel="noreferrer noopener" className={className}>{children}</a>
);

/* ---------- SECTIONS ---------- */
function Navbar({ active, onJump }) {
  const reduce = useReducedMotion();
  const bar = useRef(null);
  // Keep the active tab visible when the bar scrolls horizontally on mobile. Instant, and only
  // when needed: touching the bar's scroll during the page's smooth scroll cancels it in Chrome.
  const reveal = (id) => {
    const ul = bar.current, li = ul?.querySelector(`[data-id="${id}"]`);
    if (!li || (li.offsetLeft >= ul.scrollLeft && li.offsetLeft + li.offsetWidth <= ul.scrollLeft + ul.clientWidth)) return;
    ul.scrollLeft = li.offsetLeft - (ul.clientWidth - li.offsetWidth) / 2;
  };
  useEffect(() => reveal(active), [active]);
  // On click, reveal before the page scroll starts so the effect above is a no-op.
  const go = (e, id) => { reveal(id); onJump(e, id); };
  return (
    <nav aria-label="Sections" className="sticky top-0 z-30 border-b border-line bg-ink/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-2.5 sm:px-8">
        <a href="#summary" onClick={(e) => go(e, "summary")} className="shrink-0 font-mono text-sm font-semibold text-paper">
          sagar<span className="text-amber">.</span>dev
        </a>
        <ul ref={bar} className="relative ml-auto flex min-w-0 gap-1 overflow-x-auto rounded-full border border-line bg-panel/80 p-1 [scrollbar-width:none]">
          {NAV.map(([id, label]) => (
            <li key={id} data-id={id} className="relative shrink-0">
              <a href={`#${id}`} onClick={(e) => go(e, id)} aria-current={active === id ? "true" : undefined}
                className={`relative block whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${active === id ? "text-ink" : "text-dim hover:text-paper"}`}>
                {active === id && (
                  <motion.span layoutId="navPill" aria-hidden="true" className="absolute inset-0 rounded-full bg-amber"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }} />
                )}
                <span className="relative z-10">{label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function Hero() {
  const cmd = useTyping("whoami", 90, 300);
  const tag = useTyping(TAGLINE, 32, 1300);
  const done = tag.length === TAGLINE.length;
  return (
    <section id="summary" className="pt-12 sm:pt-16">
      <div className="overflow-hidden rounded-xl border border-line bg-panel shadow-2xl shadow-black/40">
        <div className="flex items-center border-b border-line bg-ink/60 text-sm">
          <div className="flex gap-1.5 px-4" aria-hidden="true">
            <i className="size-2.5 rounded-full bg-line" /><i className="size-2.5 rounded-full bg-line" /><i className="size-2.5 rounded-full bg-line" />
          </div>
          <span className="border-x border-t-2 border-x-line border-t-amber bg-panel px-4 py-2 font-mono text-paper">sagar.tsx</span>
        </div>
        <div className="p-6 font-mono text-[15px] leading-8 sm:p-10" aria-label={TAGLINE}>
          <p className="text-dim"><span className="text-amber">$</span> {cmd}{!done && <Cursor />}</p>
          <p className="mt-2 font-sans text-4xl font-extrabold leading-tight tracking-tight text-paper sm:text-6xl">Sagar Bhakuni</p>
          {/* Invisible full copy reserves the final height so the typing doesn't shift the page. */}
          <p className="grid min-h-[3.5rem] text-base text-amber sm:min-h-8 sm:text-lg" aria-hidden="true">
            <span className="invisible col-start-1 row-start-1">{TAGLINE}<Cursor /></span>
            <span className="col-start-1 row-start-1">{tag}{done && <Cursor blink />}</span>
          </p>
        </div>
      </div>
      <p className="mt-10 max-w-[62ch] text-lg leading-relaxed text-paper/90">
        I build backends that hold up under load and AI systems that recover when things break. Hands-on across Java/Spring Boot, Python/FastAPI and React/Node — from a lock-based distributed scheduler to an LLM agent that retries with context. Currently interning at Labmentix and open to Software Engineering internships and fresher roles.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href={LINKS.email} className="rounded-md bg-amber px-5 py-2.5 font-bold text-ink transition hover:brightness-110">Email me</a>
        <Ext href={LINKS.github} className="rounded-md border border-line px-5 py-2.5 font-semibold transition hover:border-amber">GitHub</Ext>
        <Ext href={LINKS.linkedin} className="rounded-md border border-line px-5 py-2.5 font-semibold transition hover:border-amber">LinkedIn</Ext>
      </div>
    </section>
  );
}
const Cursor = ({ blink }) => <span aria-hidden="true" className={`ml-0.5 inline-block h-5 w-2 translate-y-1 bg-amber ${blink ? "animate-pulse" : ""}`} />;

function Coding() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const card = "group rounded-xl border border-line bg-panel p-6 transition hover:-translate-y-1 hover:border-amber/70";
  return (
    <div className="mt-14">
      <div className="mb-6">
        <p className="font-mono text-sm text-amber">rank.stats</p>
        <h3 className="mt-1 text-2xl font-extrabold tracking-tight">Coding profile</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-3" ref={ref}>
        <Ext href={LINKS.leetcode} className={`${card} md:col-span-2`}>
          <p className="text-sm text-dim">LeetCode · Weekly Contest 500</p>
          <p className="mt-2 flex flex-wrap items-baseline gap-x-3 text-6xl font-extrabold tracking-tight text-amber sm:text-7xl">
            #<CountUp to={652} /><span className="text-xl font-semibold text-dim">of 27,274 globally</span>
          </p>
          <div className="mt-6" role="img" aria-label="Top 2.4 percent of participants">
            <div className="relative h-2.5 rounded-full bg-line">
              <motion.div className="absolute inset-y-0 left-0 rounded-full bg-amber" initial={{ width: 0 }} animate={{ width: inView ? "97.6%" : 0 }} transition={{ duration: 1.6, ease: "easeOut" }} />
            </div>
            <p className="mt-2 text-sm text-dim">Ahead of 97.6% of contestants — <span className="text-paper">Top 2.4%</span></p>
          </div>
          <p className="mt-4 font-semibold"><CountUp to={400} />+ problems solved</p>
        </Ext>
        <div className="grid gap-4">
          <Ext href={LINKS.gfg} className={card}>
            <p className="text-sm text-dim">GeeksforGeeks</p>
            <p className="mt-1 text-2xl font-bold">Active practice profile</p>
          </Ext>
          <div className={`${card} cursor-default`}>
            <p className="text-sm text-dim">HackerRank</p>
            <p className="mt-1 text-2xl font-bold">Problem Solving <span className="text-amber">Gold</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Education() {
  return (
    <section id="education" className="mt-28">
      <Heading file="education.log">Education</Heading>
      <ol className="relative space-y-10 border-l border-line pl-8">
        {EDUCATION.map((e) => (
          <li key={e.org} className="relative">
            <span className="absolute -left-[37px] top-2 size-2.5 rounded-full bg-amber ring-4 ring-ink" aria-hidden="true" />
            <p className="font-mono text-sm text-dim">{e.when}</p>
            <h3 className="text-xl font-bold">{e.deg} <span className="text-amber">@ {e.org}</span></h3>
            <ul className="mt-3 max-w-[70ch] list-disc space-y-1.5 pl-5 text-paper/85 marker:text-amber">
              {e.pts.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Experience() {
  return (
    <section id="experience" className="mt-28">
      <Heading file="experience.log">Where I've shipped</Heading>
      <ol className="relative space-y-10 border-l border-line pl-8">
        {EXPERIENCE.map((e) => (
          <li key={e.org} className="relative">
            <span className="absolute -left-[37px] top-2 size-2.5 rounded-full bg-amber ring-4 ring-ink" aria-hidden="true" />
            <p className="font-mono text-sm text-dim">{e.when}</p>
            <h3 className="text-xl font-bold">{e.role} <span className="text-amber">@ {e.org}</span></h3>
            <ul className="mt-3 max-w-[70ch] list-disc space-y-1.5 pl-5 text-paper/85 marker:text-amber">
              {e.pts.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Skills() {
  return (
    <section id="skills" className="mt-28">
      <Heading file="skills.json">Toolbox</Heading>
      <div className="grid auto-rows-fr gap-4 md:grid-cols-4">
        {SKILLS.map((g, i) => (
          <motion.div key={g.k} initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-8%" }} transition={{ delay: i * 0.05 }}
            className={`rounded-xl border p-5 ${g.span || ""} ${g.hot ? "border-amber/60 bg-amber/10" : "border-line bg-panel"}`}>
            <h3 className={`font-mono text-sm ${g.hot ? "text-amber" : "text-dim"}`}>{g.k}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {g.v.map((s) => <li key={s} className="rounded-md bg-ink/70 px-2.5 py-1 text-sm">{s}</li>)}
            </ul>
          </motion.div>
        ))}
      </div>
      <Coding />
    </section>
  );
}

function Projects() {
  const [f, setF] = useState("All");
  const list = PROJECTS.filter((p) => f === "All" || p.f.includes(f));
  return (
    <section id="projects" className="mt-28">
      <Heading file="projects/">Things I've built</Heading>
      <div role="group" aria-label="Filter projects by stack" className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((x) => (
          <button key={x} onClick={() => setF(x)} aria-pressed={f === x}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${f === x ? "border-amber bg-amber text-ink" : "border-line text-dim hover:border-amber hover:text-paper"}`}>{x}</button>
        ))}
      </div>
      <motion.ul layout className="grid gap-4 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {list.map((p) => (
            <motion.li layout key={p.n} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25 }}
              style={{ "--c": p.c }}
              className="group flex min-w-0 flex-col rounded-xl border border-line bg-panel p-6 transition duration-300 hover:-translate-y-1 hover:border-(--c)/60 hover:shadow-[0_10px_40px_-12px_var(--c)]">
              {p.demo && <p.demo />}
              <h3 className="text-xl font-bold transition-colors group-hover:text-(--c)">{p.n}</h3>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-paper/80">{p.d}</p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {p.s.map((t) => <li key={t} className="rounded bg-ink/70 px-2 py-0.5 font-mono text-xs text-amber">{t}</li>)}
              </ul>
              {p.gh && <Ext href={p.gh} className="mt-4 self-start text-sm font-semibold underline decoration-amber decoration-2 underline-offset-4">View on GitHub</Ext>}
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </section>
  );
}

function Achievements() {
  return (
    <section id="achievements" className="mt-28">
      <Heading file="awards.txt">Recognition</Heading>
      <ul className="grid gap-4 md:grid-cols-3">
        {[["2nd Runner-Up", "HACK36 8.0 and Code Utsava 9.0"], ["Event Lead", "Stark Coders Hackathon, 200+ participants"],
          ["Certified", "AWS Cloud Practitioner · Meta Backend Professional Certificate · HackerRank Problem Solving Gold"]].map(([a, b]) => (
          <li key={a} className="rounded-xl border border-line bg-panel p-5"><b className="text-lg text-amber">{a}</b><p className="mt-1 text-sm text-paper/80">{b}</p></li>
        ))}
      </ul>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="mb-24 mt-28">
      <Heading file="contact.sh">Let's talk</Heading>
      <p className="max-w-[55ch] text-lg text-paper/85">Hiring for a software engineering internship or fresher role? I reply fastest by email.</p>
      <a href={LINKS.email} className="mt-4 inline-block break-all text-2xl font-extrabold text-amber underline decoration-2 underline-offset-8 sm:text-4xl">bhakunisagar512@gmail.com</a>
      <div className="mt-8 flex flex-wrap gap-6 text-sm font-semibold">
        {[["GitHub", LINKS.github], ["LinkedIn", LINKS.linkedin], ["LeetCode", LINKS.leetcode], ["GeeksforGeeks", LINKS.gfg]].map(([n, h]) => (
          <Ext key={n} href={h} className="text-dim transition hover:text-amber">{n}</Ext>
        ))}
      </div>
    </section>
  );
}

/* ---------- APP ---------- */
const SPY_LINE = 0.4; // fraction of viewport height used as the "current section" line

export default function App() {
  const [active, setActive] = useState("summary");
  const reduce = useReducedMotion();
  const locked = useRef(false); // true while a tab click is smooth-scrolling
  const idle = useRef(0);

  useEffect(() => {
    // Only the navbar sections are tracked. The current tab is the last one whose top
    // has passed the spy line, so untracked sections (Achievements) keep the
    // tab of the tracked section above them. At the page bottom, Contact wins.
    const els = NAV.map(([id]) => document.getElementById(id)).filter(Boolean);
    let atBottom = false;
    const sync = () => {
      if (locked.current) return;
      const line = window.innerHeight * SPY_LINE;
      const cur = atBottom ? els[els.length - 1] : els.filter((el) => el.getBoundingClientRect().top <= line).pop() || els[0];
      setActive(cur.id);
    };
    const pct = SPY_LINE * 100;
    const io = new IntersectionObserver(sync, { rootMargin: `-${pct}% 0px -${100 - pct - 1}% 0px` });
    const end = new IntersectionObserver(([e]) => { atBottom = e.isIntersecting; sync(); });
    els.forEach((el) => io.observe(el));
    const sentinel = document.getElementById("page-end");
    sentinel && end.observe(sentinel);
    // Release the click lock once the smooth scroll has settled.
    const onScroll = () => {
      if (!locked.current) return;
      clearTimeout(idle.current);
      idle.current = setTimeout(() => { locked.current = false; sync(); }, 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { io.disconnect(); end.disconnect(); window.removeEventListener("scroll", onScroll); clearTimeout(idle.current); };
  }, []);

  const jump = (e, id) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    locked.current = true;
    setActive(id);
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    history.replaceState(null, "", `#${id}`);
    clearTimeout(idle.current);
    idle.current = setTimeout(() => { locked.current = false; }, 250); // in case no scroll happens
  };

  return (
    <>
      <a href="#summary" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-amber focus:px-3 focus:py-2 focus:text-ink">Skip to content</a>
      <Navbar active={active} onJump={jump} />
      <main className="mx-auto max-w-4xl px-5 pb-12 sm:px-8">
        <Hero /><Skills /><Education /><Experience /><Achievements /><Projects /><Contact />
        <div id="page-end" aria-hidden="true" />
      </main>
    </>
  );
}
