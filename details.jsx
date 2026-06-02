// details.jsx — Dedicated detail pages, one per sub-ecosystem. Each has its own visual style.
const { useState: useDS, useEffect: useDE, useRef: useDR } = React;

// ─────────────────────────────────────────────────────────────
// Detail wrapper with back button
// ─────────────────────────────────────────────────────────────
const DETAIL_ORDER = [
  { id: 'rag',   label: 'CyberSec RAG' },
  { id: 'lab',   label: 'CyberSec Lab' },
  { id: 'osint', label: 'OSINT Framework' },
  { id: 'stack', label: 'Stack operativo' }
];

function DetailView({ id, data }) {
  const map = { rag: RagDetailPage, lab: LabDetailPage, osint: OsintDetailPage, stack: StackDetailPage };
  const Comp = map[id];
  if (!Comp) return null;
  const idx = DETAIL_ORDER.findIndex(d => d.id === id);
  const prev = idx > 0 ? DETAIL_ORDER[idx - 1] : null;
  const next = idx >= 0 && idx < DETAIL_ORDER.length - 1 ? DETAIL_ORDER[idx + 1] : null;
  return (
    <div className={`detail-view detail-${id}`}>
      <BackBar id={id} />
      <Comp data={data} />
      <DetailNav prev={prev} next={next} />
    </div>
  );
}

function DetailNav({ prev, next }) {
  if (!prev && !next) return null;
  return (
    <nav className="detail-nav container" aria-label="Navegación entre subapartados">
      <div className="detail-nav-inner">
        {prev ? (
          <a href={`#${prev.id}`}
             className="detail-nav-btn detail-nav-prev"
             onClick={(e) => { e.preventDefault(); window.location.hash = prev.id; }}>
            <span className="dn-arr">←</span>
            <span className="dn-meta">
              <span className="dn-label">anterior</span>
              <span className="dn-name">{prev.label}</span>
            </span>
          </a>
        ) : <span className="detail-nav-spacer" />}
        {next ? (
          <a href={`#${next.id}`}
             className="detail-nav-btn detail-nav-next"
             onClick={(e) => { e.preventDefault(); window.location.hash = next.id; }}>
            <span className="dn-meta dn-meta-right">
              <span className="dn-label">siguiente</span>
              <span className="dn-name">{next.label}</span>
            </span>
            <span className="dn-arr">→</span>
          </a>
        ) : <span className="detail-nav-spacer" />}
      </div>
    </nav>
  );
}

function BackBar({ id }) {
  const labels = {
    rag:   'CyberSec RAG',
    lab:   'CyberSec Lab',
    osint: 'OSINT Framework',
    stack: 'Stack operativo'
  };
  return (
    <div className="detail-back">
      <div className="container detail-back-inner">
        <a href="#" className="back-btn" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }}>
          <span className="arr">←</span><span>volver al ecosistema</span>
        </a>
        <div className="detail-breadcrumb">
          <span className="dim">~/ecosystem</span>
          <span className="sep">/</span>
          <span className="here">{labels[id]}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1) RAG — Blueprint / project doc style
// ─────────────────────────────────────────────────────────────
function RagDetailPage({ data }) {
  const buildSteps = [
    { num: '01', name: 'Ingesta',     det: 'ZIPs · MP4 · PDF · MD · PNG · auto-discovery por timestamps de sesión',                                  tech: 'fs + manifest.yml' },
    { num: '02', name: 'Parseo',      det: 'MP4 → audio → Whisper. PDF → PyMuPDF. PNG → Claude Vision. Texto normalizado de cualquier fuente.',     tech: 'whisper + pymupdf + claude-vision' },
    { num: '03', name: 'Chunking',    det: 'Trozos de 1 500 chars con overlap 200 para no perder contexto en los cortes.',                            tech: 'recursive char splitter' },
    { num: '04', name: 'Embeddings',  det: 'all-MiniLM en ONNX local. ~30 ms por chunk en CPU, cero coste de API, privacidad total.',                tech: 'onnxruntime + sentence-transformers' },
    { num: '05', name: 'Vector store',det: 'ChromaDB sobre disco. Persistente, indexado incremental, búsqueda coseno top-K.',                         tech: 'chromadb' },
    { num: '06', name: 'LLM',         det: 'Top-K chunks → contexto → Claude Sonnet. Respuestas streamed por SSE con citas a sesiones de origen.',    tech: 'anthropic + fastapi + sse' },
    { num: '07', name: 'Interfaces',  det: 'Tres vistas: chat RAG general, asistente de Lab, navegador de OSINT Framework.',                          tech: 'react + tailwind' }
  ];

  return (
    <article className="dp dp-rag container">
      <header className="dp-hero">
        <div className="dp-hero-l">
          <div className="dp-eyebrow">/ 01 · proyecto destacado</div>
          <h1 className="dp-title">CyberSec RAG</h1>
          <p className="dp-tag">Sistema de inteligencia táctica personal. Indexa todo el material del máster en una base de conocimiento consultable en lenguaje natural.</p>
          <div className="dp-badges">
            <span className="dp-badge dp-badge-live">● en producción</span>
            <span className="dp-badge">python 3.11</span>
            <span className="dp-badge">FastAPI</span>
            <span className="dp-badge">ChromaDB</span>
            <span className="dp-badge">Claude API</span>
          </div>
        </div>
        <div className="dp-hero-r">
          <div className="dp-callout">
            <div className="dp-callout-l">north star</div>
            <p>"Convertirme en <strong>Red Teamer de élite</strong> usando la IA como ventaja competitiva — no como sustituto del operador, sino como amplificador del que entiende sus fundamentos."</p>
            <div className="dp-callout-foot">alejandro · dev.to</div>
          </div>
        </div>
      </header>

      <section className="dp-section">
        <h2 className="dp-h2">Arquitectura del pipeline</h2>
        <p className="dp-lede">Diseñé el sistema para ser <strong>local-first</strong> en todo lo que no requiere modelos enormes. Solo el LLM final es cloud — el resto corre en mi máquina.</p>
        <MiniMap {...RAG_GRAPH} height={420} emptyHint="Click un nodo del pipeline para inspeccionarlo" />
      </section>

      <section className="dp-section">
        <h2 className="dp-h2">Métricas reales</h2>
        <div className="dp-metrics">
          {data.projectMetrics.map((m, i) => (
            <div key={i} className="dp-metric">
              <div className="dp-metric-n">{m.n}</div>
              <div className="dp-metric-l">{m.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="dp-section">
        <h2 className="dp-h2">7 pasos · cómo funciona</h2>
        <p className="dp-lede">Cada paso del pipeline es un módulo independiente con su propia interfaz. Puedo cambiar Whisper por otro STT sin tocar el resto.</p>
        <div className="dp-steps">
          {buildSteps.map((s, i) => (
            <div key={i} className="dp-step">
              <div className="dp-step-num">{s.num}</div>
              <div className="dp-step-body">
                <h3>{s.name}</h3>
                <p>{s.det}</p>
                <code className="dp-step-tech">$ {s.tech}</code>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="dp-section">
        <h2 className="dp-h2">Prueba el RAG · consultas reales</h2>
        <p className="dp-lede">Estas son tres preguntas que le he hecho al sistema y la respuesta que generó con las citas a las sesiones de origen.</p>
        <RagDemo demos={data.ragDemo} />
      </section>

      <section className="dp-section dp-links">
        <h2 className="dp-h2">Código y lectura</h2>
        <GradientMenu size="lg" items={[
          { kind: 'github', href: data.github,  title: 'GitHub', description: 'repositorio del proyecto' },
          { kind: 'devto',  href: data.devto,   title: 'Dev.to', description: 'cómo construí el sistema', label: 'Dev.to' },
          { kind: 'medium', href: data.medium,  title: 'Medium', description: 'ensayo sobre IA + cybersec' }
        ]} />
      </section>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────
// 2) Lab — Mission progress / vertical phase tracker
// ─────────────────────────────────────────────────────────────
const LAB_PHASES = [
  {
    id: 'p1', num: '01', name: 'Reconocimiento pasivo / OSINT', state: 'active', glyph: 'search',
    desc: 'Sin tocar al objetivo. Mapeo de superficie con fuentes públicas. Es donde un Red Teamer real gasta el 30-40% del tiempo del engagement.',
    activities: [
      'Inventario de subdominios, IPs, certificados, empleados',
      'Footprinting de tecnologías y versiones',
      'Análisis de leaks históricos en HaveIBeenPwned',
      'Mapeo de la huella digital del objetivo'
    ],
    tools: ['Sherlock', 'Shodan', 'theHarvester', 'Maltego', 'FOCA', 'crt.sh', 'Subfinder']
  },
  {
    id: 'p2', num: '02', name: 'Reconocimiento activo', state: 'locked', glyph: 'crosshair',
    desc: 'Tráfico hacia el objetivo. Port scanning, banner grabbing, fingerprinting fino. Aquí empieza la huella detectable.',
    tools: ['Nmap', 'Masscan', 'dirsearch', 'Nikto', 'wpscan']
  },
  {
    id: 'p3', num: '03', name: 'Análisis de vulnerabilidades', state: 'locked', glyph: 'bug',
    desc: 'Cruce entre scanners automáticos y análisis manual contextual. Validación de cada hallazgo contra el recon.',
    tools: ['Nessus', 'OpenVAS', 'Nuclei', 'wpscan']
  },
  {
    id: 'p4', num: '04', name: 'Explotación', state: 'locked', glyph: 'bolt',
    desc: 'Validación práctica de CVEs en lab. Payloads custom, técnicas evasivas, msfvenom.',
    tools: ['Metasploit', 'msfvenom', 'SQLmap', 'Hydra']
  },
  {
    id: 'p5', num: '05', name: 'Post-explotación', state: 'locked', glyph: 'ghost',
    desc: 'Persistencia, escalada, lateral movement. Aquí es donde el operador demuestra su nivel — no en el shell inicial.',
    tools: ['Mimikatz', 'BloodHound', 'PowerShell Empire', 'LinPEAS']
  },
  {
    id: 'p6', num: '06', name: 'Reporting & cleanup', state: 'locked', glyph: 'report',
    desc: 'Documentación ejecutiva, evidencias, narrativa técnica, recomendaciones. El entregable que justifica todo el engagement.',
    tools: ['Markdown', 'CVSS', 'MITRE ATT&CK mapping']
  }
];

function LabDetailPage() {
  const [opened, setOpened] = useDS('p1');

  return (
    <article className="dp dp-lab container">
      <header className="dp-hero">
        <div className="dp-hero-l">
          <div className="dp-eyebrow">/ 02 · laboratorio</div>
          <h1 className="dp-title">CyberSec Lab</h1>
          <p className="dp-tag">Donde aplico la teoría como un Red Teamer real. Una metodología completa en 6 fases — cada una se desbloquea al dominar la anterior.</p>
          <div className="dp-badges">
            <span className="dp-badge dp-badge-live">● fase 01 activa</span>
            <span className="dp-badge">Kali Linux VM</span>
            <span className="dp-badge">6 fases</span>
            <span className="dp-badge dp-badge-locked">5 bloqueadas</span>
          </div>
        </div>
        <div className="dp-hero-r">
          <div className="dp-callout">
            <div className="dp-callout-l">por qué fases bloqueadas</div>
            <p>Una fase no se desbloquea hasta documentar la anterior con un writeup que entre al RAG. <strong>El lab y el RAG se retroalimentan</strong> — cada técnica aprendida es consultable para siempre.</p>
            <div className="dp-callout-foot">metodología propia</div>
          </div>
        </div>
      </header>

      <section className="dp-section">
        <h2 className="dp-h2">El kill chain en un vistazo</h2>
        <MiniMap {...LAB_GRAPH} height={360} initialSelection="p1" baseRadius={34} centerRadius={34} emptyHint="Click una fase del kill chain" />
      </section>

      <section className="dp-section">
        <h2 className="dp-h2">Las 6 fases en detalle</h2>
        <div className="lab-tracker">
          {LAB_PHASES.map((p, i) => {
            const isOpen = opened === p.id;
            const isActive = p.state === 'active';
            const isLocked = p.state === 'locked';
            return (
              <div key={p.id} className={`lab-phase ${p.state} ${isOpen ? 'open' : ''}`}>
                <button className="lab-phase-hd" onClick={() => setOpened(prev => prev === p.id ? null : p.id)}>
                  <div className="lab-phase-l">
                    <div className="lab-phase-num">
                      <svg viewBox="0 0 24 24" width="22" height="22"
                           style={{ opacity: isLocked ? 0.4 : 1, color: 'currentColor', filter: isLocked ? 'grayscale(0.6)' : 'none' }}>
                        <NodeIcon name={p.glyph} color="currentColor"/>
                      </svg>
                      {isActive && <span className="lab-phase-pulse"></span>}
                      {isLocked && (
                        <svg className="lab-phase-lock-badge" viewBox="0 0 24 24" width="11" height="11">
                          <path d="M7 11 V7 a5 5 0 0 1 10 0 v4 M5 11 h14 a2 2 0 0 1 2 2 v7 a2 2 0 0 1-2 2 H5 a2 2 0 0 1-2-2 v-7 a2 2 0 0 1 2-2 z"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div className="lab-phase-info">
                      <span className="lab-phase-state">{isActive ? '● activa' : 'bloqueada'}</span>
                      <h3>{p.name}</h3>
                    </div>
                  </div>
                  <span className="lab-phase-toggle">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="lab-phase-body">
                    <p className="lab-phase-desc">{p.desc}</p>
                    {p.activities && (
                      <div className="lab-phase-activities">
                        <h4>actividades en curso</h4>
                        <ul>
                          {p.activities.map((a, j) => <li key={j}>{a}</li>)}
                        </ul>
                      </div>
                    )}
                    <div className="lab-phase-tools">
                      <h4>arsenal</h4>
                      <div className="np-tags">
                        {p.tools.map((t, j) => <span key={j} className="np-tag">{t}</span>)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────
// 3) OSINT — Bento grid showcase
// ─────────────────────────────────────────────────────────────
const OSINT_CATEGORIES = [
  { id: 'domain',   span: 'lg', name: 'Domain Name',          count: 146, icon: 'D',   color: '#5ae39b', desc: 'La categoría más densa. Whois, DNS, certificados, subdominios, archive.', tops: ['crt.sh', 'Whois', 'dnsdumpster', 'Subfinder', 'SecurityTrails', 'Censys'] },
  { id: 'username', span: 'sm', name: 'Username',             count: 19,  icon: '@',   color: '#5ed4e8', desc: 'Búsqueda de username en 400+ sitios.',                                       tops: ['Sherlock', 'WhatsMyName', 'Namechk'] },
  { id: 'email',    span: 'md', name: 'Email Address',        count: 30,  icon: '✉',   color: '#e8a554', desc: 'Validación, leaks, footprinting por email.',                                  tops: ['HaveIBeenPwned', 'EmailRep', 'Hunter', 'theHarvester'] },
  { id: 'ip',       span: 'md', name: 'IP & MAC',             count: 56,  icon: 'IP',  color: '#b58cf2', desc: 'Geolocalización, ASN, port scanning pasivo, IoT mapping.',                    tops: ['Shodan', 'Censys', 'GreyNoise', 'ipinfo'] },
  { id: 'images',   span: 'md', name: 'Images / Videos / Docs', count: 94, icon: '◉', color: '#e26a52', desc: 'Reverse image search, EXIF, geolocalización, metadata extraction.',          tops: ['FOCA', 'TinEye', 'Yandex', 'EXIF.tools'] },
  { id: 'social',   span: 'md', name: 'Social Networks',      count: 70,  icon: '#',   color: '#5ae39b', desc: 'Análisis de perfiles, scraping, relaciones, sentiment.',                      tops: ['Maltego', 'SocialSearcher', 'OSINT.industries'] },
  { id: 'cloud',    span: 'sm', name: 'Cloud Infrastructure', count: 23,  icon: '☁',   color: '#5ed4e8', desc: 'Buckets expuestos, S3/Azure/GCP.',                                            tops: ['BucketCat', 'GrayHatWarfare', 'S3Scanner'] },
  { id: 'msg',      span: 'sm', name: 'Instant Messaging',    count: 21,  icon: '✓',   color: '#e8a554', desc: 'Telegram, Discord, WhatsApp públicos.',                                       tops: ['Telepathy', 'DiscordIntel'] },
  { id: 'people',   span: 'md', name: 'People Search',        count: 38,  icon: '✦',   color: '#b58cf2', desc: 'Aggregators de información personal pública.',                                tops: ['Pipl', 'Spokeo', 'BeenVerified'] }
];

function OsintDetailPage() {
  return (
    <article className="dp dp-osint container">
      <header className="dp-hero">
        <div className="dp-hero-l">
          <div className="dp-eyebrow">/ 03 · framework tracker</div>
          <h1 className="dp-title">OSINT Framework</h1>
          <p className="dp-tag">Mapeo exhaustivo del framework completo de Justin Nordine. Cada herramienta probada genera un writeup que entra al RAG.</p>
          <div className="dp-badges">
            <span className="dp-badge dp-badge-live">● mapeo activo</span>
            <span className="dp-badge">1 169 herramientas</span>
            <span className="dp-badge">33 categorías</span>
            <span className="dp-badge">0% completado</span>
          </div>
        </div>
        <div className="dp-hero-r">
          <div className="dp-callout">
            <div className="dp-callout-l">lema del proyecto</div>
            <p>"No basta con conocer las herramientas — hay que construir <strong>intuición</strong> sobre cuál usar en cada situación. Solo mapeando una a una se llega ahí."</p>
            <div className="dp-callout-foot">Sobre el OSINT Framework de Justin Nordine</div>
          </div>
        </div>
      </header>

      <section className="dp-section">
        <h2 className="dp-h2">La constelación</h2>
        <p className="dp-lede">9 categorías principales orbitando el núcleo. Click cualquiera para inspeccionar el contexto.</p>
        <MiniMap {...OSINT_GRAPH} height={480} emptyHint="Click una categoría para ver herramientas top" />
      </section>

      <section className="dp-section">
        <h2 className="dp-h2">Categorías en detalle</h2>
        <p className="dp-lede">Cada card es una categoría con sus herramientas top. Las más grandes son las que más herramientas contienen.</p>
        <div className="osint-bento">
          {OSINT_CATEGORIES.map(c => (
            <div key={c.id} className={`osint-bento-card span-${c.span}`} style={{ '--card-accent': c.color }}>
              <div className="osint-bento-hd">
                <span className="osint-bento-ic">{c.icon}</span>
                <span className="osint-bento-count">{c.count}</span>
              </div>
              <h3>{c.name}</h3>
              <p>{c.desc}</p>
              <div className="osint-bento-tops">
                {c.tops.map((t, i) => <span key={i} className="osint-bento-tool">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────
// 4) Stack — Dual identity Blue ↔ Red
// ─────────────────────────────────────────────────────────────
const BLUE_TOOLS = [
  { name: 'SIEM · Splunk',    level: 4, use: 'Detección y correlación 24/7 en Bullhost' },
  { name: 'Threat Hunting',   level: 3, use: 'Hipótesis basadas en MITRE ATT&CK + CTI' },
  { name: 'EDR',              level: 4, use: 'Telemetría granular de endpoints' },
  { name: 'Sigma Rules',      level: 4, use: 'Detection-as-code portable' },
  { name: 'IR Playbooks',     level: 3, use: 'Procedimientos de respuesta documentados' },
  { name: 'Forensia digital', level: 3, use: 'Timeline reconstruction post-incidente' }
];
const DUAL_TOOLS = [
  { name: 'Wireshark', level: 4, use: 'Inspección de paquetes — usado en ambos lados' },
  { name: 'Kali Linux', level: 4, use: 'Mi VM principal, arsenal preconfigurado' },
  { name: 'Python',     level: 4, use: 'El idioma común. Scripts blue, exploits red' },
  { name: 'TCP/IP',     level: 5, use: 'Base de telecom — fundamento de todo lo demás' }
];
const RED_TOOLS = [
  { name: 'Nmap',         level: 4, use: 'Reconocimiento activo · scripts NSE' },
  { name: 'Burp Suite',   level: 3, use: 'Web app testing · proxy + intruder' },
  { name: 'Metasploit',   level: 3, use: 'Validación de CVEs y payloads' },
  { name: 'OSINT recon',  level: 4, use: 'Fase 01 del Lab · footprinting' },
  { name: 'Hydra',        level: 3, use: 'Brute force y password spray' },
  { name: 'theHarvester', level: 4, use: 'Email & subdomain enumeration' }
];

function StackDetailPage({ data }) {
  return (
    <article className="dp dp-stack container">
      <header className="dp-hero stack-hero">
        <div className="dp-hero-l">
          <div className="dp-eyebrow">/ 04 · stack operativo</div>
          <h1 className="dp-title">Blue Team <span className="stack-arrow">↔</span> Red Team</h1>
          <p className="dp-tag">Mis competencias técnicas no son una lista plana — es un espectro. A la izquierda mi día a día en SOC; a la derecha el arsenal ofensivo; en el centro lo que cabalga entre ambos mundos.</p>
        </div>
        <div className="stack-hero-split">
          <div className="stack-side blue">
            <div className="stack-side-label">defensiva</div>
            <div className="stack-side-icon">BT</div>
            <p>Detectar, correlar, contener, investigar.</p>
            <div className="stack-side-foot">SOC L2 · Bullhost</div>
          </div>
          <div className="stack-side red">
            <div className="stack-side-label">ofensiva</div>
            <div className="stack-side-icon">RT</div>
            <p>Reconocer, explotar, persistir, documentar.</p>
            <div className="stack-side-foot">Lab · objetivo</div>
          </div>
        </div>
      </header>

      <section className="dp-section">
        <h2 className="dp-h2">El espectro como mapa</h2>
        <p className="dp-lede">Las herramientas dual-use bridgean los dos mundos. Sin ese puente, la transición azul→rojo es mucho más lenta.</p>
        <MiniMap {...STACK_GRAPH} height={500} emptyHint="Click cualquier herramienta del espectro" />
      </section>

      <section className="dp-section">
        <h2 className="dp-h2">Inventario completo</h2>
        <p className="dp-lede">Cada nivel es real, no un check de CV. <strong>L5</strong> = enseñable; <strong>L3</strong> = competente en proyecto; <strong>L1</strong> = exploración inicial.</p>
        <div className="stack-cols">
          <div className="stack-col stack-col-blue">
            <div className="stack-col-hd">
              <span className="stack-col-label">Blue Team</span>
              <span className="stack-col-count">{BLUE_TOOLS.length}</span>
            </div>
            {BLUE_TOOLS.map((t, i) => <StackToolRow key={i} {...t} />)}
          </div>
          <div className="stack-col stack-col-dual">
            <div className="stack-col-hd">
              <span className="stack-col-label">Dual-use</span>
              <span className="stack-col-count">{DUAL_TOOLS.length}</span>
            </div>
            {DUAL_TOOLS.map((t, i) => <StackToolRow key={i} {...t} />)}
          </div>
          <div className="stack-col stack-col-red">
            <div className="stack-col-hd">
              <span className="stack-col-label">Red Team</span>
              <span className="stack-col-count">{RED_TOOLS.length}</span>
            </div>
            {RED_TOOLS.map((t, i) => <StackToolRow key={i} {...t} />)}
          </div>
        </div>
      </section>

      <section className="dp-section">
        <h2 className="dp-h2">Vista MITRE-style</h2>
        <SkillMatrix skills={data.skills} />
      </section>
    </article>
  );
}

function StackToolRow({ name, level, use }) {
  return (
    <div className="stack-tool">
      <div className="stack-tool-l">
        <div className="stack-tool-name">{name}</div>
        <div className="stack-tool-use">{use}</div>
      </div>
      <div className="stack-tool-r">
        <div className="stack-tool-level">L{level}</div>
        <div className="stack-tool-bar"><span style={{ width: `${(level/5)*100}%` }}></span></div>
      </div>
    </div>
  );
}

Object.assign(window, { DetailView, RagDetailPage, LabDetailPage, OsintDetailPage, StackDetailPage });
