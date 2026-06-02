// sections.jsx — section components for portfolio
const { useState, useEffect, useRef, useMemo } = React;

// ─────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current || seen) return;
    // Seed: if element is already on/near screen at mount, flip immediately.
    const r = ref.current.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (r.top < vh * 0.9 && r.bottom > 0) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } });
    }, { threshold });
    io.observe(ref.current);
    // Safety fallback if IO never fires
    const fallback = setTimeout(() => setSeen(true), 2500);
    return () => { io.disconnect(); clearTimeout(fallback); };
  }, [seen, threshold]);
  return [ref, seen];
}

function useCountUp(target, start, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.max(0, Math.min(1, (t - t0) / duration));
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);
  return val;
}

// ─────────────────────────────────────────────────────────────
// Ambient background (orbs + grid)
// ─────────────────────────────────────────────────────────────
function Ambient() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient-grid"></div>
      <div className="ambient-orb a"></div>
      <div className="ambient-orb b"></div>
      <div className="ambient-orb c"></div>
    </div>
  );
}

// generic reveal wrapper
function Reveal({ children, delay = 0, as: As = 'div', className = '', ...rest }) {
  const [ref, seen] = useInView(0.12);
  const cls = `reveal ${seen ? 'in' : ''} ${className}`.trim();
  return <As ref={ref} className={cls} style={{ transitionDelay: `${delay}s` }} {...rest}>{children}</As>;
}

// mouse-tracked glow
function useMouseGlow() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);
  return ref;
}

// ─────────────────────────────────────────────────────────────
// Nav
// ─────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav className="nav" data-screen-label="00 Nav">
      <div className="nav-inner">
        <a href="#" className="nav-brand" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }}>
          <span className="caret">{">"}</span>
          <span>alejandro</span>
          <span className="blink">_</span>
        </a>
        <div className="nav-links">
          <a href="#rag" onClick={(e) => { e.preventDefault(); window.location.hash = 'rag'; }}>RAG</a>
          <a href="#lab" onClick={(e) => { e.preventDefault(); window.location.hash = 'lab'; }}>lab</a>
          <a href="#osint" onClick={(e) => { e.preventDefault(); window.location.hash = 'osint'; }}>OSINT</a>
          <a href="#stack" onClick={(e) => { e.preventDefault(); window.location.hash = 'stack'; }}>stack</a>
          <a href="#career" onClick={(e) => { e.preventDefault(); window.location.hash = 'career'; }}>trayectoria</a>
        </div>
        <a href="#contact" className="nav-cta" onClick={(e) => { e.preventDefault(); window.location.hash = 'contact'; }}>contactar →</a>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────
// Hero with typewriter terminal
// ─────────────────────────────────────────────────────────────
const TERMINAL_SCRIPT = [
  { type: "cmd", text: "whoami --verbose" },
  { type: "out", html: '<span class="val">alejandro.congil</span> <span class="cmt">// 21 años · Bilbao, ES</span>' },
  { type: "out", html: '<span class="key">role:</span>     <span class="val">SOC Analyst L2 · Bullhost</span>' },
  { type: "out", html: '<span class="key">since:</span>    <span class="val">Feb 2026</span>' },
  { type: "out", html: '<span class="key">studying:</span> <span class="val">MSc Ciberseguridad · Evolve</span>' },
  { type: "cmd", text: "cat ~/objective.md" },
  { type: "out", html: '<span class="val">→ convertirme en Red Teamer de élite</span>' },
  { type: "out", html: '<span class="val">→ construyendo</span> <span class="ok">inteligencia táctica con IA</span>' },
  { type: "cmd", text: "ls ~/projects/" },
  { type: "out", html: '<span class="ok">cybersec-rag/</span>   <span class="cmt">4146 fragmentos · 22 sesiones</span>' },
  { type: "out", html: '<span class="ok">cybersec-lab/</span>   <span class="cmt">OSINT phase 1 · 9 grupos</span>' },
  { type: "out", html: '<span class="ok">osint-framework/</span> <span class="cmt">1169 tools · 33 categorías</span>' },
  { type: "cmd", text: "./run --portfolio" },
  { type: "out", html: '<span class="ok">●</span> portfolio ready — scroll para continuar' }
];

function Terminal() {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [done, setDone] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (done) return;
    if (lineIdx >= TERMINAL_SCRIPT.length) { setDone(true); return; }
    const line = TERMINAL_SCRIPT[lineIdx];
    const text = line.type === "cmd" ? line.text : null;
    const isInstant = line.type === "out";
    const delay = isInstant
      ? 90
      : (charIdx === 0 ? 320 : 28 + Math.random() * 30);

    const t = setTimeout(() => {
      if (isInstant || (text && charIdx >= text.length)) {
        setLineIdx(i => i + 1);
        setCharIdx(0);
      } else {
        setCharIdx(c => c + 1);
      }
    }, delay);

    return () => clearTimeout(t);
  }, [lineIdx, charIdx, done]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [lineIdx, charIdx]);

  return (
    <div className="terminal">
      <div className="terminal-hd">
        <div className="t-dots"><span></span><span></span><span></span></div>
        <div className="t-title">alejandro@cybersec ~ /portfolio · zsh</div>
      </div>
      <div className="terminal-body" ref={bodyRef}>
        {TERMINAL_SCRIPT.slice(0, lineIdx).map((l, i) => (
          <TermLine key={i} line={l} />
        ))}
        {lineIdx < TERMINAL_SCRIPT.length && (() => {
          const l = TERMINAL_SCRIPT[lineIdx];
          if (l.type === "cmd") {
            return <TermLine line={{ type: "cmd", text: l.text.slice(0, charIdx) }} cursor />;
          }
          return null;
        })()}
        {done && (
          <div className="t-line">
            <span className="prompt">$</span>
            <span><span className="cursor"></span></span>
          </div>
        )}
      </div>
    </div>
  );
}

function TermLine({ line, cursor }) {
  if (line.type === "cmd") {
    return (
      <div className="t-line">
        <span className="prompt">$</span>
        <span><span className="val">{line.text}</span>{cursor && <span className="cursor"></span>}</span>
      </div>
    );
  }
  return (
    <div className="t-line">
      <span className="prompt" style={{ visibility: "hidden" }}>$</span>
      <span dangerouslySetInnerHTML={{ __html: line.html }} />
    </div>
  );
}

function Hero({ data }) {
  const heroRef = useRef(null);
  const termRef = useRef(null);
  useEffect(() => {
    const onMove = (e) => {
      if (!heroRef.current) return;
      const r = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      if (termRef.current) {
        termRef.current.style.transform = `translate3d(${-x * 10}px, ${-y * 8}px, 0)`;
      }
    };
    const el = heroRef.current;
    if (el) el.addEventListener('mousemove', onMove);
    return () => { if (el) el.removeEventListener('mousemove', onMove); };
  }, []);
  return (
    <section className="hero container" id="hero" data-screen-label="01 Hero" ref={heroRef}>
      <div className="hero-grid">
        <div>
          <Reveal delay={0.05}><span className="hero-prompt">
            <span className="dot"></span>
            <span className="mono">~/portfolio · whoami</span>
          </span></Reveal>
          <Reveal delay={0.12}><h1 className="hero-title">
            Alejandro<br/>Congil <em>Sainz</em>
          </h1></Reveal>
          <Reveal delay={0.22}><p className="hero-sub">
            <strong>2 años en telecomunicaciones</strong> · <strong>SOC Analyst L2</strong> desde febrero de 2026.
            Mi objetivo: convertirme en <strong>Red Teamer de élite</strong> — construyo inteligencia táctica con IA para dominar cada fase del ataque.
          </p></Reveal>
          <Reveal delay={0.32}><div className="hero-meta">
            <span className="chip"><span className="ic">◉</span> País Vasco, España</span>
            <span className="chip"><span className="ic">▣</span> SOC L2 · Bullhost</span>
            <span className="chip"><span className="ic">◈</span> MSc Ciberseguridad · Evolve</span>
          </div></Reveal>
          <Reveal delay={0.42}><div className="hero-cta">
            <a href="#ecosystem" className="btn btn-pri" onClick={(e) => { e.preventDefault(); document.querySelector('#ecosystem')?.scrollIntoView({behavior:'smooth'}); }}>Explorar ecosistema <span className="arrow">→</span></a>
            <a href="#contact" className="btn btn-sec" onClick={(e)=>{e.preventDefault(); window.location.hash = 'contact';}}>Contactar</a>
          </div></Reveal>
        </div>
        <div ref={termRef} className="hero-parallax">
          <Terminal />
        </div>
      </div>
      <StatsRow stats={data.heroStats} />
    </section>
  );
}

// ── Word rotator à la Aceternity ──
function WordRotate({ words, interval = 2400 }) {
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState('in');
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('out'), interval - 500);
    const t2 = setTimeout(() => {
      setI(x => (x + 1) % words.length);
      setPhase('in');
    }, interval);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [i, words.length, interval]);
  return (
    <span className="word-rotate" style={{ minWidth: `${Math.max(...words.map(w=>w.length))}ch` }}>
      <span className={phase}>{words[i]}</span>
    </span>
  );
}

// ── Magnetic CTA à la Aceternity ──
function MagneticButton({ children, className = '', href, onClick, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width/2)) * 0.25;
      const y = (e.clientY - (r.top + r.height/2)) * 0.35;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };
    const onLeave = () => { el.style.transform = ''; };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, []);
  return (
    <a ref={ref} className={`magnetic ${className}`} href={href} onClick={onClick} {...rest}>{children}</a>
  );
}

const TOOL_STREAM = [
  'nmap', 'wireshark', 'burp suite', 'metasploit', 'shodan', 'maltego', 'theHarvester',
  'sherlock', 'recon-ng', 'splunk', 'sigma', 'mitre att&ck', 'sysmon', 'volatility',
  'ghidra', 'kali linux', 'fastapi', 'chromadb', 'claude api', 'whisper', 'cisco ios',
  'docker', 'azure', 'active directory', 'powershell', 'hydra'
];

function Marquee() {
  const items = [...TOOL_STREAM, ...TOOL_STREAM];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {items.map((t, i) => (
          <span key={i} className="marquee-item"><span className="dot">▪</span>{t}</span>
        ))}
      </div>
    </div>
  );
}

function StatsRow({ stats }) {
  const [ref, seen] = useInView(0.2);
  return (
    <div className="stats" ref={ref}>
      {stats.map((s, i) => <StatCell key={i} s={s} start={seen} dur={1500 + (i * 220)} />)}
    </div>
  );
}
function StatCell({ s, start, dur }) {
  const v = useCountUp(s.n, start, dur);
  return (
    <div className="stat">
      <div className="stat-n">{v.toLocaleString('es-ES')}<span className="unit">{s.suffix}</span></div>
      <div className="stat-l">{s.l}</div>
      <div className="stat-sub">{s.sub}</div>
    </div>
  );
}

// reusable animated bar — width animates from 0 to target when in view
function AnimatedBar({ pct, parentSeen }) {
  const w = parentSeen ? `${pct}%` : '0%';
  return <span className="skill-bar"><span className="fill" style={{ width: w }}></span></span>;
}

// ─────────────────────────────────────────────────────────────
// About
// ─────────────────────────────────────────────────────────────
function About() {
  return (
    <section className="block container" id="about" data-screen-label="02 About">
      <span className="eyebrow">about</span>
      <h2 className="section-title"><span className="glitch" data-text="Quién soy">Quién soy</span></h2>
      <p className="section-lede">Analista de seguridad apasionado por la defensa, la automatización y la ciberinteligencia.</p>
      <div className="about-grid" style={{ marginTop: 50 }}>
        <div className="about-copy">
          <p>Soy <strong>Alejandro Congil Sainz</strong>, Técnico Superior en Sistemas de Telecomunicaciones e Informáticos, actualmente cursando el <strong>Máster en Ciberseguridad de Evolve Academy</strong>.</p>
          <p>Trabajo como <strong>SOC Analyst L2 en Bullhost</strong> (desde febrero de 2026), donde me encargo de la detección, análisis y respuesta a incidentes. Paralelamente, soy <strong>Técnico de Redes en Ausarta</strong>, manteniendo infraestructura corporativa.</p>
          <p>Mi proyecto más ambicioso es un <strong>sistema RAG de ciberseguridad</strong> construido con Python, ChromaDB y la API de Claude — una base de inteligencia táctica que aprende de cada clase, ejercicio y análisis de amenazas.</p>
          <p>Mi objetivo es claro: <span className="acc">dominar el Red Team</span>. El repositorio es el vehículo — cada fase completada me acerca a operar con el nivel de un Red Teamer profesional. Trabajo desde Windows 11 con un entorno <strong>Kali Linux VM</strong> para prácticas ofensivas controladas.</p>
        </div>
        <ProfileJson />
      </div>
    </section>
  );
}

function ProfileJson() {
  return (
    <div className="profile-card">
      <div className="profile-hd">
        <div className="t-dots"><span></span><span></span><span></span></div>
        <span className="t-title" style={{ flex: 1 }}>profile.json</span>
        <span className="lang">json</span>
      </div>
      <div className="profile-body">
        <div className="json-l"><span className="p">{"{"}</span></div>
        <div className="json-l json-indent"><span className="k">"name"</span>: <span className="s">"Alejandro Congil Sainz"</span>,</div>
        <div className="json-l json-indent"><span className="k">"role"</span>: <span className="s">"Telecom · SOC Analyst L2"</span>,</div>
        <div className="json-l json-indent"><span className="k">"location"</span>: <span className="s">"País Vasco, ES"</span>,</div>
        <div className="json-l json-indent"><span className="k">"available"</span>: <span className="b">true</span>,</div>
        <div className="json-l json-indent"><span className="k">"current"</span>: <span className="p">[</span></div>
        <div className="json-l json-indent" style={{ paddingLeft: 32 }}><span className="s">"Bullhost · SOC L2"</span>,</div>
        <div className="json-l json-indent" style={{ paddingLeft: 32 }}><span className="s">"Ausarta · Networks"</span>,</div>
        <div className="json-l json-indent" style={{ paddingLeft: 32 }}><span className="s">"Evolve Academy · MSc"</span></div>
        <div className="json-l json-indent"><span className="p">]</span>,</div>
        <div className="json-l json-indent"><span className="k">"focus"</span>: <span className="p">[</span></div>
        <div className="json-l json-indent" style={{ paddingLeft: 32 }}><span className="s">"Threat Detection"</span>,</div>
        <div className="json-l json-indent" style={{ paddingLeft: 32 }}><span className="s">"OSINT & Recon"</span>,</div>
        <div className="json-l json-indent" style={{ paddingLeft: 32 }}><span className="s">"AI-powered Defense"</span></div>
        <div className="json-l json-indent"><span className="p">]</span>,</div>
        <div className="json-l json-indent"><span className="k">"north_star"</span>: <span className="s">"Red Team élite"</span></div>
        <div className="json-l"><span className="p">{"}"}</span></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Experience + Education
// ─────────────────────────────────────────────────────────────
function Experience({ data }) {
  return (
    <section className="block container" id="experience" data-screen-label="03 Experience">
      <span className="eyebrow">experiencia</span>
      <h2 className="section-title"><span className="glitch" data-text="Trayectoria profesional">Trayectoria profesional</span></h2>
      <p className="section-lede">Roles en defensa activa, infraestructura de red y formación continua.</p>
      <div className="timeline">
        {data.experience.map((e, i) => (
          <div key={i} className="tl-row">
            <div className="tl-date">{e.dateLabel}</div>
            <div className="tl-dot"></div>
            <div className="tl-card">
              <div className="tl-role">
                <h3>{e.role}</h3>
                <span className={`status-pill ${e.status}`}>{e.status === "live" ? "● activo" : "completado"}</span>
              </div>
              <div className="tl-org"><span className="org">{e.org}</span><span className="sep">·</span>{e.location}<span className="sep">·</span><span className="mono">{e.period}</span></div>
              <p className="tl-desc">{e.desc}</p>
              <div className="tl-tags">
                {e.tags.map((t, j) => <span key={j} className="tag">{t}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Education({ data }) {
  return (
    <section className="block container" id="education" data-screen-label="04 Education">
      <span className="eyebrow">formación</span>
      <h2 className="section-title"><span className="glitch" data-text="Educación">Educación</span></h2>
      <p className="section-lede">Formación técnica especializada en ciberseguridad y sistemas.</p>
      <div className="timeline">
        {data.education.map((e, i) => (
          <div key={i} className={`tl-row ${e.statusKind === "done" ? "past" : ""}`}>
            <div className="tl-date">{e.dateLabel}</div>
            <div className="tl-dot"></div>
            <div className="tl-card">
              <div className="tl-role">
                <h3>{e.title}</h3>
                <span className={`status-pill ${e.statusKind}`}>{e.status}</span>
              </div>
              <div className="tl-org"><span className="org">{e.org}</span><span className="sep">·</span><span className="mono">{e.period}</span></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Projects: CyberSec RAG with arch + demo + osint
// ─────────────────────────────────────────────────────────────
function Project({ data }) {
  return (
    <section className="block container" id="projects" data-screen-label="05 Projects">
      <span className="eyebrow">proyectos</span>
      <h2 className="section-title"><span className="glitch" data-text="Proyecto destacado">Proyecto destacado</span></h2>
      <p className="section-lede">Sistema RAG personal construido para potenciar el aprendizaje y operaciones en ciberseguridad.</p>

      <NodeGraph />

      <div className="project-card" data-glow>
        <div className="proj-hd">
          <div>
            <div className="proj-sub mono">~/cybersec-rag · python · chromadb · claude</div>
            <h3>CyberSec RAG</h3>
            <div className="proj-sub">Sistema de inteligencia táctica personal · en desarrollo activo</div>
          </div>
          <span className="status-pill live" style={{ alignSelf: "center" }}>● en producción</span>
        </div>
        <p className="proj-desc">
          Sistema RAG personal que indexa <strong>sesiones de clase, vídeos y ejercicios</strong> de ciberseguridad para construir una base de conocimiento táctica consultable en lenguaje natural. El objetivo final: convertirme en un <strong>Red Teamer de élite</strong> apoyado por inteligencia artificial.
        </p>
        <div className="proj-tags">
          {["Python", "ChromaDB", "Claude API", "Whisper", "FastAPI", "ffmpeg", "ONNX"].map((t,i)=><span key={i} className="tag">{t}</span>)}
        </div>

        <div className="arch">
          <div className="arch-title">Pipeline · build log funcionando hoy</div>
          <div className="arch-flow">
            {data.archSteps.map((s, i) => (
              <div key={i} className="arch-step">
                <div className="num">{s.num}</div>
                <div className="name">{s.name}</div>
                <div className="det">{s.det}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="metric-grid">
          {data.projectMetrics.map((m, i) => (
            <div key={i} className="metric">
              <div className="n">{m.n}</div>
              <div className="l">{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      <RagDemo demos={data.ragDemo} />
      <OsintBlock data={data} />
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// RAG demo interactive
// ─────────────────────────────────────────────────────────────
function RagDemo({ demos }) {
  const [idx, setIdx] = useState(0);
  const [streaming, setStreaming] = useState(0); // chars revealed
  const [streamLineIdx, setStreamLineIdx] = useState(0);

  const demo = demos[idx];

  useEffect(() => {
    setStreaming(0);
    setStreamLineIdx(0);
  }, [idx]);

  useEffect(() => {
    if (streamLineIdx >= demo.body.length) return;
    const t = setTimeout(() => setStreamLineIdx(i => Math.min(demo.body.length, i + 1)), 220);
    return () => clearTimeout(t);
  }, [streamLineIdx, demo.body.length]);

  return (
    <div className="demo">
      <div className="demo-hd">
        <span>cybersec-rag · interfaz principal · <span style={{ color: "var(--fg-1)" }}>FastAPI + SSE</span></span>
        <span className="badge">retrieval activo</span>
      </div>
      <div className="demo-body">
        <div className="demo-left">
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-3)", letterSpacing: ".08em", textTransform: "uppercase" }}>Consultas de ejemplo</div>
          <div className="q-suggestions">
            {demos.map((d, i) => (
              <button
                key={i}
                className={`q-sug ${i === idx ? 'active' : ''}`}
                onClick={() => setIdx(i)}
              >{i === idx ? '▶ ' : '$ '}{d.q}</button>
            ))}
          </div>
          <div className="demo-q" style={{ marginTop: 14 }}>
            <span className="prompt">{">"}</span>{demo.q}<span className="cursor" style={{ marginLeft: 4 }}></span>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-3)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>Fuentes recuperadas</div>
            <div className="sources">
              {demo.sources.map((s, i) => (
                <span key={i} className="source-chip"><span className="d"></span>{s}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="demo-right">
          <h4>{demo.title}</h4>
          {demo.body.slice(0, streamLineIdx).map((b, i) => {
            if (b[0] === "h5") return <h5 key={i}>{b[1]}</h5>;
            if (b[0] === "src") return <div key={i} className="src">↳ {b[1]}</div>;
            if (b[0] === "p") return <p key={i} dangerouslySetInnerHTML={{ __html: formatMD(b[1]) }} />;
            return null;
          })}
          {streamLineIdx < demo.body.length && (
            <span className="cursor" style={{ display: "inline-block", marginTop: 4 }}></span>
          )}
        </div>
      </div>
    </div>
  );
}
function formatMD(s) {
  return s.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--fg-0)">$1</strong>')
          .replace(/`(.+?)`/g, '<code>$1</code>');
}

// ─────────────────────────────────────────────────────────────
// OSINT phase + framework progress
// ─────────────────────────────────────────────────────────────
function OsintBlock({ data }) {
  return (
    <div className="osint">
      <div className="phase-list">
        <div className="osint-hd">
          <span>cybersec-lab · metodología ofensiva</span>
          <span style={{ color: "var(--acc)" }}>1/6 activa</span>
        </div>
        {data.phases.map((p, i) => (
          <div key={i} className={`phase-row ${p.state}`}>
            <div className="phase-num">{p.num}</div>
            <div className="phase-name">
              {p.state === "locked" && <span className="lock">🔒</span>}
              {p.name}
            </div>
            <div className="phase-progress">{p.progress}</div>
          </div>
        ))}
      </div>
      <div className="osint-tree">
        <div className="osint-hd">
          <span>osint framework · tracker</span>
          <span><span style={{ color: "var(--fg-0)" }}>0%</span> · 0 / 1169 · <span className="mono" style={{ color: "var(--fg-3)" }}>33 categorías</span></span>
        </div>
        <OsintCats cats={data.osintCats} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Skills
// ─────────────────────────────────────────────────────────────
function OsintCats({ cats }) {
  const [ref, seen] = useInView(0.15);
  // animate fake "radar sweep" — slight bar pulses
  return (
    <div ref={ref} className="osint-cats">
      {cats.map((c, i) => {
        const pct = (c.done / c.count) * 100;
        // give visual idea of scale even when 0% — soft pulsing bar
        return (
          <div key={i} className={`osint-cat reveal ${seen ? 'in' : ''}`} style={{ transitionDelay: `${i * 0.05}s` }}>
            <div className="osint-bar-row">
              <span>{c.name}</span>
              <span className="n">{c.done} / {c.count}</span>
            </div>
            <div className="bar">
              <div className="fill" style={{ width: seen ? `${Math.max(pct, 2)}%` : '0%' }}></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Skills({ data }) {
  return (
    <section className="block container" id="skills" data-screen-label="06 Skills">
      <span className="eyebrow">habilidades</span>
      <h2 className="section-title"><span className="glitch" data-text="Stack técnico">Stack técnico</span></h2>
      <p className="section-lede">Competencias construidas en entornos reales de producción y laboratorio.</p>
      <SkillMatrix skills={data.skills} />
      <div className="skills-grid">
        {data.skills.map((cat, i) => (
          <SkillCard key={i} cat={cat} idx={i} />
        ))}
      </div>
    </section>
  );
}

function SkillCard({ cat, idx }) {
  const [ref, seen] = useInView(0.2);
  return (
    <div ref={ref} className={`skill-card reveal ${seen ? 'in' : ''}`} style={{ transitionDelay: `${idx * 0.06}s` }}>
      <div className="skill-head">
        <span className="skill-cat">{cat.cat}</span>
        <span className="skill-ic">{cat.ic}</span>
      </div>
      <div className="skill-list">
        {cat.items.map(([name, level], j) => (
          <div key={j} className="skill-row">
            <span>{name}</span>
            <AnimatedBar pct={(level/5)*100} parentSeen={seen} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Contact
// ─────────────────────────────────────────────────────────────
function Contact({ data }) {
  return (
    <section className="block container" id="contact" data-screen-label="07 Contact">
      <span className="eyebrow">contacto</span>
      <div className="contact-card" data-glow>
        <div className="contact-grid">
          <div>
            <div className="contact-status"><span className="pulse"></span>Disponible para nuevas oportunidades</div>
            <h2 className="contact-title">¿Hablamos?<br/><em>Construyamos algo.</em></h2>
            <p className="contact-sub">Abierto a oportunidades en <strong style={{ color: "var(--fg-1)" }}>Blue Team</strong>, análisis de amenazas y proyectos de ciberseguridad con IA.</p>
            <a href={`mailto:${data.email}`} className="btn btn-pri">Enviar email <span className="arrow">→</span></a>
          </div>
          <div className="contact-list">
            <a href={`mailto:${data.email}`} className="contact-row">
              <span className="l">email</span><span className="v">{data.email}</span><span className="arrow">↗</span>
            </a>
            <a href={data.linkedin} target="_blank" rel="noreferrer" className="contact-row">
              <span className="l">linkedin</span><span className="v">/in/alejandro-congil-sainz</span><span className="arrow">↗</span>
            </a>
            <a href={data.github} target="_blank" rel="noreferrer" className="contact-row">
              <span className="l">github</span><span className="v">@Alexc-projects</span><span className="arrow">↗</span>
            </a>
            <a href={data.phoneHref} className="contact-row">
              <span className="l">teléfono</span><span className="v">{data.phone}</span><span className="arrow">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────
function Footer({ data }) {
  return (
    <footer className="footer container" data-screen-label="08 Footer">
      <div className="footer-grid">
        <div>
          <h6>Ecosistema</h6>
          <p style={{ fontSize: 14, color: "var(--fg-2)", maxWidth: "42ch", margin: "0 0 16px" }}>
            Proyecto en evolución continua, conectado con publicaciones técnicas y repositorios abiertos.
          </p>
          <div className="contact-status"><span className="pulse"></span>SOC L2 · Bullhost · 2026</div>
        </div>
        <div>
          <h6>Escritos</h6>
          <GradientMenu vertical withText items={[
            { kind: 'devto',    href: data.devto,        title: 'Dev.to · sobre el RAG',         description: 'cómo construí este proyecto' },
            { kind: 'medium',   href: data.medium,       title: 'Medium · IA como ventaja',      description: 'reflexión técnica del proyecto' },
            { kind: 'linkedin', href: data.linkedinPost, title: 'LinkedIn · al Red Team',        description: 'el RAG como vehículo', label: 'LinkedIn' }
          ]} />
        </div>
        <div>
          <h6>Código</h6>
          <GradientMenu vertical withText items={[
            { kind: 'github',   href: data.github,    title: 'GitHub',    description: 'proyecto principal' },
            { kind: 'linkedin', href: data.linkedin,  title: 'LinkedIn',  description: 'perfil profesional' }
          ]} />
        </div>
      </div>
      <div className="footer-bottom">
        <span>alejandro@cybersec · construido con Python, Claude API y demasiado café</span>
        <span>© 2026 · Alejandro Congil Sainz</span>
      </div>
    </footer>
  );
}

// Expose to window so app.jsx can use them across babel scopes
Object.assign(window, {
  Ambient, Nav, Hero, About, Experience, Education, Project, Skills, Contact, Footer, Marquee, Reveal, useMouseGlow, WordRotate, MagneticButton
});
