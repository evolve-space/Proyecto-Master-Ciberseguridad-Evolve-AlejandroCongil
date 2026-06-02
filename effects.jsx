// effects.jsx — boot sequence, command palette, threat feed, skill matrix, node graph
const { useState: useStateE, useEffect: useEffectE, useRef: useRefE, useMemo: useMemoE, useCallback: useCallbackE } = React;

// ─────────────────────────────────────────────────────────────
// BOOT SEQUENCE
// ─────────────────────────────────────────────────────────────
const BOOT_LINES = [
  { lbl: "BIOS",        msg: "Aegis Secure Boot v6.2.4 (UEFI)", kind: "info" },
  { lbl: "CPU",         msg: "Intel® Threat-Aware i7 @ 3.4GHz · 8 cores · AES-NI ✓", kind: "info" },
  { lbl: "MEM",         msg: "32 GB ECC · self-test passed", kind: "ok" },
  { lbl: "DISK",        msg: "/dev/nvme0n1 · 1 TB · LUKS encrypted (XTS-AES-256)", kind: "ok" },
  { lbl: "NETWORK",     msg: "eth0 up · 1 Gb/s · MAC f4:9d:8a:**:**:** · MTU 1500", kind: "ok" },
  { lbl: "TPM",         msg: "TPM 2.0 attestation OK · PCR sealed", kind: "ok" },
  { lbl: "KERNEL",      msg: "linux-hardened 6.11.4 · KASLR ✓ SMEP ✓ SMAP ✓", kind: "info" },
  { lbl: "SECCOMP",     msg: "BPF profiles loaded · 14 rules active", kind: "info" },
  { lbl: "FIREWALL",    msg: "nftables · 47 rules · DROP default", kind: "ok" },
  { lbl: "OSQUERY",     msg: "scheduling 23 queries · interval 60s", kind: "info" },
  { lbl: "SIEM",        msg: "splunk-forwarder → soc.bullhost.io · TLS", kind: "ok" },
  { lbl: "EDR",         msg: "agent online · last sync 2s ago", kind: "ok" },
  { lbl: "VPN",         msg: "wg0 ↑ · peers: 1 · last handshake 4s", kind: "ok" },
  { lbl: "MODULES",     msg: "cybersec-rag · cybersec-lab · osint-framework", kind: "info" },
  { lbl: "INTEGRITY",   msg: "AIDE baseline match · 0 anomalies", kind: "ok" },
  { lbl: "IDENTITY",    msg: "alejandro.congil · uid=1000 · groups=soc,wheel", kind: "info" },
  { lbl: "BOOT",        msg: "READY — entering portfolio runtime", kind: "ok" }
];

function nowTs(start, addMs) {
  const t = new Date(start.getTime() + addMs);
  return t.toTimeString().slice(0,8) + "." + String(t.getMilliseconds()).padStart(3,'0');
}

function BootSequence({ onDone }) {
  const [idx, setIdx] = useStateE(0);
  const [fading, setFading] = useStateE(false);
  const startRef = useRefE(new Date());
  const finished = useRefE(false);

  useEffectE(() => {
    if (idx >= BOOT_LINES.length) {
      if (finished.current) return;
      finished.current = true;
      const t = setTimeout(() => setFading(true), 420);
      const t2 = setTimeout(() => onDone(), 920);
      return () => { clearTimeout(t); clearTimeout(t2); };
    }
    const base = 95;
    const jitter = Math.random() * 90;
    const t = setTimeout(() => setIdx(i => i + 1), base + jitter);
    return () => clearTimeout(t);
  }, [idx, onDone]);

  const skip = useCallbackE(() => {
    if (finished.current) return;
    finished.current = true;
    setFading(true);
    setTimeout(() => onDone(), 350);
  }, [onDone]);

  useEffectE(() => {
    const onKey = (e) => { if (e.key === "Escape" || e.key === "Enter" || e.key === " ") skip(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skip]);

  const progress = Math.min(100, (idx / BOOT_LINES.length) * 100);

  return (
    <div className={`boot ${fading ? 'fading' : ''}`}>
      <div className="boot-head">
        <div className="boot-brand"><b>aegis://</b> alejandro.congil — secure portfolio runtime</div>
        <button className="boot-skip" onClick={skip}>skip · esc</button>
      </div>
      <div className="boot-body">
        {BOOT_LINES.slice(0, idx).map((l, i) => (
          <div key={i} className="boot-line">
            <span className="ts">[{nowTs(startRef.current, i * 110)}]</span>
            <span className="lbl">{l.lbl}</span>
            <span className="arr">→</span>
            <span className={l.kind}>{l.msg}</span>
          </div>
        ))}
        <div className="boot-bar"><div className="b" style={{ width: `${progress}%` }}></div></div>
      </div>
      <div className="boot-foot">
        <span>secureboot ✓ · tpm-attested · kernel-hardened</span>
        <span>build 2026.05 — press <b style={{ color: 'var(--fg-1)' }}>any key</b> to skip</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// THREAT FEED — fake but plausible SIEM ticker
// ─────────────────────────────────────────────────────────────
const FEED_EVENTS = [
  { sev: 'lo', src: 'EDR',    msg: 'process tree resolved · explorer.exe → cmd.exe (legit)' },
  { sev: 'md', src: 'IDS',    msg: 'suspicious dns query: 9-char .top domain · queried once' },
  { sev: 'hi', src: 'AUTH',   msg: 'brute-force pattern · 47 failed logins from 185.220.x.x' },
  { sev: 'lo', src: 'FW',     msg: 'outbound tcp/443 to cdn.cloudflare.net · allowed' },
  { sev: 'md', src: 'SYSMON', msg: 'unsigned binary executed from %TEMP% · quarantined' },
  { sev: 'hi', src: 'CTI',    msg: 'IOC hit · sha256 4a8f… matches APT29 toolkit' },
  { sev: 'lo', src: 'DLP',    msg: '0 sensitive files leaving boundary · last 24h' },
  { sev: 'md', src: 'PROXY',  msg: 'tls fingerprint anomaly · ja3=e7d705… new asn' },
  { sev: 'hi', src: 'EDR',    msg: 'powershell -EncodedCommand observed · base64 length 1284' },
  { sev: 'lo', src: 'OSINT',  msg: 'shodan recheck · 0 new exposed services on perimeter' },
  { sev: 'md', src: 'AD',     msg: 'kerberoasting attempt · TGS for svc-sql · low entropy' },
  { sev: 'hi', src: 'NDR',    msg: 'lateral movement · smb/445 spike 12× baseline · vlan10→vlan20' },
  { sev: 'lo', src: 'VULN',   msg: 'CVE-2026-0413 patched cluster-wide · 14 hosts' },
  { sev: 'md', src: 'MAIL',   msg: 'phishing pattern · spoofed sender · DMARC=fail · DKIM=fail' },
  { sev: 'hi', src: 'HUNT',   msg: 'TTP T1059.001 (PowerShell) correlated to T1027 (obfuscation)' },
  { sev: 'lo', src: 'BACKUP', msg: 'immutable snapshot OK · 02:17 UTC · 1.4 TB · integrity ✓' }
];

function ThreatFeed() {
  const items = [...FEED_EVENTS, ...FEED_EVENTS];
  const now = new Date();
  return (
    <div className="feed">
      <span className="feed-label">LIVE · SOC FEED</span>
      <div className="feed-track">
        {items.map((e, i) => {
          const t = new Date(now.getTime() - i * 17 * 1000);
          const tstr = t.toTimeString().slice(0, 8);
          return (
            <span key={i} className="feed-item">
              <span className="ts">{tstr}</span>
              <span className={`sev ${e.sev}`}>{e.sev === 'lo' ? 'LOW' : e.sev === 'md' ? 'MED' : 'HIGH'}</span>
              <span className="src">{e.src}</span>
              <span>{e.msg}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SKILL MATRIX (MITRE-style)
// ─────────────────────────────────────────────────────────────
function SkillMatrix({ skills }) {
  return (
    <div className="matrix-wrap">
      <div className="matrix-hd">
        <span>operator.matrix · stack distribution</span>
        <span className="legend">
          <i className="l1">novato</i>
          <i className="l3">competente</i>
          <i className="l5">experto</i>
        </span>
      </div>
      <div className="matrix-grid">
        {skills.map((cat, i) => (
          <div key={i} className="mx-col">
            <div className="mx-cap">
              <span className="name">{cat.cat}</span>
              <span className="n">{cat.items.length} disciplinas</span>
            </div>
            {cat.items.map(([name, level], j) => (
              <div key={j} className={`mx-cell lv-${level}`} title={`${name} · nivel ${level}/5`}>
                <span>{name}</span>
                <span className="lv">L{level}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ECOSYSTEM NODE GRAPH — animated SVG with interactive details
// ─────────────────────────────────────────────────────────────
const GRAPH_NODES = [
  { id: 'me',    x: 50,   y: 50,  size: 'big', label: 'alejandro',     sub: 'operator',         kind: 'self' },
  { id: 'soc',   x: 20,   y: 24,  label: 'Bullhost',                  sub: 'SOC L2',           kind: 'work' },
  { id: 'tel',   x: 22,   y: 76,  label: 'Ausarta',                   sub: 'Telecom',          kind: 'work' },
  { id: 'msc',   x: 50,   y: 12,  label: 'Evolve MSc',                sub: 'cybersec',         kind: 'edu' },
  { id: 'rag',   x: 80,   y: 24,  label: 'CyberSec RAG',              sub: '4 146 chunks',     kind: 'proj' },
  { id: 'lab',   x: 82,   y: 76,  label: 'CyberSec Lab',              sub: 'recon ofensivo',   kind: 'proj' },
  { id: 'osint', x: 50,   y: 90,  label: 'OSINT Framework',           sub: '1 169 tools',      kind: 'proj' }
];
const GRAPH_EDGES = [
  ['me','soc'], ['me','tel'], ['me','msc'],
  ['me','rag'], ['me','lab'], ['me','osint'],
  ['msc','rag'], ['msc','lab'], ['lab','osint'], ['rag','lab']
];

const NODE_DETAILS = {
  me: {
    kindLabel: 'operator',
    title: 'Alejandro Congil Sainz',
    sub: '22 años · País Vasco, ES · disponible',
    body: [
      { type: 'p', text: 'Analista de seguridad con base en <strong>telecomunicaciones</strong>. Mi north star es convertirme en <strong>Red Teamer de élite</strong> — construyo herramientas con IA para acelerar cada fase del aprendizaje y la operación.' },
      { type: 'h', text: 'Currently' },
      { type: 'list', items: [
        ['◉', 'SOC Analyst L2 · Bullhost (Feb 2026 →)'],
        ['◉', 'Técnico de Redes · Ausarta (2024 →)'],
        ['◉', 'MSc Ciberseguridad · Evolve Academy']
      ]},
      { type: 'h', text: 'Stack' },
      { type: 'tags', items: ['Python', 'SIEM', 'OSINT', 'Kali', 'ChromaDB', 'Claude API', 'TCP/IP'] }
    ]
  },
  soc: {
    kindLabel: 'work · live',
    title: 'Bullhost',
    sub: 'SOC Analyst L2 · Bilbao · Feb 2026 — Presente',
    body: [
      { type: 'p', text: 'Equipo de defensa con cobertura 24/7. Mi rol como <strong>L2</strong> abarca triage profundo, correlación de eventos en SIEM, threat hunting proactivo y colaboración con L3 en respuesta a incidentes avanzados.' },
      { type: 'h', text: 'Responsabilidades' },
      { type: 'list', items: [
        ['▸', 'Detección y análisis de incidentes en tiempo real'],
        ['▸', 'Triage de alertas y reducción de falsos positivos'],
        ['▸', 'Threat hunting con MITRE ATT&CK'],
        ['▸', 'Gestión de vulnerabilidades y documentación de TTPs'],
        ['▸', 'Soporte forense con L3']
      ]},
      { type: 'h', text: 'Stack en uso' },
      { type: 'tags', items: ['SIEM', 'Splunk', 'Sysmon', 'Sigma', 'MITRE ATT&CK', 'EDR', 'IR'] }
    ]
  },
  tel: {
    kindLabel: 'work · live',
    title: 'Ausarta Networks',
    sub: 'Técnico de Redes y Sistemas · País Vasco · Jun 2024 — Presente',
    body: [
      { type: 'p', text: 'Mantenimiento de la <strong>infraestructura de red corporativa</strong> para clientes B2B. Aquí construí la base sólida en TCP/IP, routing y firewalls que ahora aprovecho en defensa.' },
      { type: 'h', text: 'Día a día' },
      { type: 'list', items: [
        ['▸', 'Configuración de switches, routers y firewalls'],
        ['▸', 'Segmentación con VLANs · ACLs'],
        ['▸', 'Monitorización de servicios y SLAs'],
        ['▸', 'Soporte técnico L1/L2 a usuarios'],
        ['▸', 'Resolución de incidencias de red críticas']
      ]},
      { type: 'h', text: 'Tecnologías' },
      { type: 'tags', items: ['Cisco IOS', 'VLANs', 'Firewalls', 'Wireshark', 'DNS/DHCP', 'Monitoring'] }
    ]
  },
  msc: {
    kindLabel: 'edu · en curso',
    title: 'Máster en Ciberseguridad',
    sub: 'Evolve Academy · 2025 — 2026',
    body: [
      { type: 'p', text: 'Formación intensiva en <strong>ciberseguridad ofensiva y defensiva</strong>. Combina teoría sólida con laboratorios prácticos. Es el catalizador del proyecto CyberSec RAG — todas las clases alimentan la base de conocimiento.' },
      { type: 'h', text: 'Áreas cubiertas' },
      { type: 'list', items: [
        ['◉', 'Hacking ético y pentesting'],
        ['◉', 'Análisis forense'],
        ['◉', 'Seguridad en sistemas y redes'],
        ['◉', 'Threat intelligence'],
        ['◉', 'Bash, Python y automatización ofensiva']
      ]},
      { type: 'h', text: 'Output' },
      { type: 'stats', items: [
        { n: '22', l: 'sesiones' },
        { n: '4146', l: 'chunks RAG' },
        { n: '∞', l: 'links a Lab' },
        { n: '1', l: 'objetivo' }
      ]}
    ]
  },
  rag: {
    kindLabel: 'proj · producción',
    title: 'CyberSec RAG',
    sub: 'Inteligencia táctica personal · python · chromadb · claude',
    body: [
      { type: 'p', text: 'Sistema RAG que indexa <strong>vídeos, transcripciones, PDFs e imágenes</strong> del máster. Búsqueda semántica en lenguaje natural sobre todo lo que he aprendido. Pipeline 100% local salvo el LLM final.' },
      { type: 'h', text: 'Pipeline' },
      { type: 'list', items: [
        ['01', 'Ingesta: ZIPs, MP4, PDF, MD, PNG'],
        ['02', 'Parseo: OCR + Whisper + Claude Vision'],
        ['03', 'Chunking 1500 chars · overlap 200'],
        ['04', 'Embeddings ONNX local (sin coste API)'],
        ['05', 'ChromaDB para retrieval'],
        ['06', 'Claude Sonnet con SSE streaming']
      ]},
      { type: 'h', text: 'Métricas' },
      { type: 'stats', items: [
        { n: '4 146', l: 'fragmentos' },
        { n: '22', l: 'sesiones' },
        { n: '7', l: 'pasos pipeline' },
        { n: '3', l: 'interfaces' }
      ]},
      { type: 'h', text: 'Stack' },
      { type: 'tags', items: ['Python', 'FastAPI', 'ChromaDB', 'Claude API', 'Whisper', 'ONNX', 'ffmpeg'] },
      { type: 'links', items: [
        { label: 'GitHub · proyecto principal', url: 'https://github.com/Alexc-projects/Proyecto-Master-Ciberseguridad-Evolve-AlejandroCongil' },
        { label: 'Dev.to · cómo lo construí', url: 'https://dev.to/evolve-space/como-construi-un-sistema-rag-para-convertirme-en-red-teamer-con-ia-proyecto-en-evolve-4b2m' }
      ]}
    ]
  },
  lab: {
    kindLabel: 'proj · fase 01 activa',
    title: 'CyberSec Lab',
    sub: 'Metodología ofensiva · 6 fases · Kali VM',
    body: [
      { type: 'p', text: 'Laboratorio donde aplico la teoría como un Red Teamer. <strong>6 fases secuenciales</strong>: cada una se desbloquea al dominar la anterior. Ahora mismo trabajo el <strong>reconocimiento pasivo / OSINT</strong>.' },
      { type: 'h', text: 'Fases' },
      { type: 'list', items: [
        ['01', 'Reconocimiento pasivo / OSINT — ACTIVA'],
        ['02', 'Reconocimiento activo — 🔒'],
        ['03', 'Análisis de vulnerabilidades — 🔒'],
        ['04', 'Explotación — 🔒'],
        ['05', 'Post-explotación — 🔒'],
        ['06', 'Reporting & cleanup — 🔒']
      ]},
      { type: 'h', text: 'Entorno' },
      { type: 'tags', items: ['Kali Linux VM', 'Nmap', 'Metasploit', 'Burp', 'theHarvester', 'Maltego'] }
    ]
  },
  osint: {
    kindLabel: 'proj · tracker',
    title: 'OSINT Framework',
    sub: 'Mapeo exhaustivo · 1 169 herramientas · 33 categorías',
    body: [
      { type: 'p', text: 'Tracker personal del <strong>OSINT Framework</strong> completo. Cada herramienta probada se documenta con caso de uso, valor y ejemplo. Es el pilar del módulo de reconocimiento pasivo del Lab.' },
      { type: 'h', text: 'Cobertura' },
      { type: 'stats', items: [
        { n: '1 169', l: 'herramientas' },
        { n: '33', l: 'categorías' },
        { n: '9', l: 'grupos activos' },
        { n: '0%', l: 'progreso' }
      ]},
      { type: 'h', text: 'Top categorías' },
      { type: 'list', items: [
        ['→', 'Domain Name · 146 herramientas'],
        ['→', 'Images / Videos / Docs · 94'],
        ['→', 'Social Networks · 70'],
        ['→', 'IP & MAC Address · 56'],
        ['→', 'Email Address · 30'],
        ['→', 'Cloud Infrastructure · 23']
      ]}
    ]
  }
};

function NodeGraph() {
  const [hovered, setHovered] = useStateE(null);
  const [selected, setSelected] = useStateE(null);
  const nodeMap = useMemoE(() => Object.fromEntries(GRAPH_NODES.map(n => [n.id, n])), []);
  const W = 1000, H = 562;

  // edge connectivity per node
  const adjacency = useMemoE(() => {
    const a = {};
    for (const [x, y] of GRAPH_EDGES) {
      (a[x] = a[x] || new Set()).add(y);
      (a[y] = a[y] || new Set()).add(x);
    }
    return a;
  }, []);

  const focusId = selected || hovered;

  // close on Esc
  useEffectE(() => {
    if (!selected) return;
    const onKey = (e) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const detail = selected ? NODE_DETAILS[selected] : null;

  // navigation helpers
  const nextNode = (dir) => {
    const order = GRAPH_NODES.map(n => n.id);
    if (!selected) { setSelected(order[0]); return; }
    const i = order.indexOf(selected);
    const j = (i + dir + order.length) % order.length;
    setSelected(order[j]);
  };

  return (
    <div className="graph">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="haloMe" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--acc)" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="var(--acc)" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="haloSel" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--acc)" stopOpacity="0.45"/>
            <stop offset="100%" stopColor="var(--acc)" stopOpacity="0"/>
          </radialGradient>
          <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="var(--line)" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#dots)" opacity="0.5"/>

        {/* edges */}
        {GRAPH_EDGES.map(([a, b], i) => {
          const A = nodeMap[a], B = nodeMap[b];
          const x1 = (A.x/100) * W, y1 = (A.y/100) * H;
          const x2 = (B.x/100) * W, y2 = (B.y/100) * H;
          const isActive = focusId && (a === focusId || b === focusId);
          const isDim = focusId && !isActive;
          let cls = 'node-line';
          if (isActive) cls += ' active';
          else if (isDim) cls += ' dim';
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className={cls} />;
        })}

        {/* halo for "me" */}
        <circle cx={(nodeMap.me.x/100)*W} cy={(nodeMap.me.y/100)*H} r="100" fill="url(#haloMe)">
          <animate attributeName="r" values="90;110;90" dur="4s" repeatCount="indefinite" />
        </circle>

        {/* selected halo */}
        {selected && selected !== 'me' && (() => {
          const n = nodeMap[selected];
          return (
            <circle cx={(n.x/100)*W} cy={(n.y/100)*H} r="70" fill="url(#haloSel)">
              <animate attributeName="r" values="55;75;55" dur="2.4s" repeatCount="indefinite" />
            </circle>
          );
        })()}

        {/* nodes */}
        {GRAPH_NODES.map(n => {
          const cx = (n.x/100) * W, cy = (n.y/100) * H;
          const isMe = n.kind === 'self';
          const r = isMe ? 28 : 18;
          const isSelected = selected === n.id;
          const isDim = focusId && focusId !== n.id && !adjacency[focusId]?.has(n.id);
          const accent = isMe ? 'var(--acc)' : n.kind === 'proj' ? 'var(--acc)' : 'var(--fg-2)';
          const strokeW = isSelected ? 2.4 : (isMe ? 2 : 1.2);
          let cls = 'node-card';
          if (isSelected) cls += ' selected';
          if (isDim) cls += ' dim';
          return (
            <g key={n.id} className={cls}
               onMouseEnter={()=>setHovered(n.id)}
               onMouseLeave={()=>setHovered(null)}
               onClick={()=>setSelected(n.id)}>
              <circle cx={cx} cy={cy} r={r + 6} fill="var(--bg-0)" stroke={accent} strokeWidth="1" opacity={isSelected ? 0.7 : 0.4}/>
              <circle cx={cx} cy={cy} r={r} fill="var(--bg-1)" stroke={accent} strokeWidth={strokeW}/>
              {isMe && (
                <circle cx={cx} cy={cy} r="6" fill="var(--acc)">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite"/>
                </circle>
              )}
              {!isMe && <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="11" fontFamily="JetBrains Mono, monospace" fill="var(--fg-2)" letterSpacing="0.04em">{n.kind.toUpperCase()}</text>}
              <text x={cx} y={cy + r + 22} textAnchor="middle" fontSize="14" fontFamily="Geist, sans-serif" fontWeight="500" fill="var(--fg-0)" letterSpacing="-0.01em">{n.label}</text>
              <text x={cx} y={cy + r + 38} textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono, monospace" fill="var(--fg-3)">{n.sub}</text>
            </g>
          );
        })}
      </svg>
      <div className="graph-overlay">
        <span className="lbl">~/ecosystem · <b>{GRAPH_NODES.length}</b> nodes · <b>{GRAPH_EDGES.length}</b> connections</span>
        <span className="lbl">{focusId ? `> ${nodeMap[focusId].label}` : 'click un nodo para inspeccionar'}</span>
      </div>
      {!selected && (
        <div className="graph-help">
          <span>tip:</span><kbd>click</kbd><span>en cualquier nodo para ver detalles</span>
        </div>
      )}

      <div
        className={`node-panel ${selected ? 'open' : ''}`}
        style={{
          opacity: selected ? 1 : 0,
          transform: selected ? 'translateX(0)' : 'translateX(20px)',
          pointerEvents: selected ? 'auto' : 'none'
        }}
      >
        {detail && (
          <React.Fragment>
            <div className="np-hd">
              <div>
                <span className="np-kind">{detail.kindLabel}</span>
                <div className="np-title">{detail.title}</div>
                <div className="np-sub">{detail.sub}</div>
              </div>
              <button className="np-x" onClick={() => setSelected(null)} aria-label="cerrar">✕</button>
            </div>
            <div className="np-body">
              {detail.body.map((b, i) => {
                if (b.type === 'p') return <div key={i} className="np-section"><p dangerouslySetInnerHTML={{ __html: b.text }} /></div>;
                if (b.type === 'h') return <div key={i} className="np-section"><h5>{b.text}</h5></div>;
                if (b.type === 'list') return (
                  <div key={i} className="np-list">
                    {b.items.map(([m, txt], j) => (
                      <div key={j} className="np-list-item"><span className="b">{m}</span><span>{txt}</span></div>
                    ))}
                  </div>
                );
                if (b.type === 'tags') return (
                  <div key={i} className="np-tags">
                    {b.items.map((t, j) => <span key={j} className="np-tag">{t}</span>)}
                  </div>
                );
                if (b.type === 'stats') return (
                  <div key={i} className="np-stats">
                    {b.items.map((s, j) => (
                      <div key={j} className="np-stat">
                        <div className="n">{s.n}</div>
                        <div className="l">{s.l}</div>
                      </div>
                    ))}
                  </div>
                );
                if (b.type === 'links') return (
                  <div key={i} className="np-links">
                    {b.items.map((l, j) => (
                      <a key={j} className="np-link" href={l.url} target="_blank" rel="noreferrer">
                        {l.label}<span className="arr">↗</span>
                      </a>
                    ))}
                  </div>
                );
                return null;
              })}
            </div>
            <div className="np-foot">
              <span>{GRAPH_NODES.findIndex(n => n.id === selected) + 1} / {GRAPH_NODES.length}</span>
              <div className="np-nav">
                <button onClick={() => nextNode(-1)} title="anterior">←</button>
                <button onClick={() => nextNode(+1)} title="siguiente">→</button>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMMAND PALETTE
// ─────────────────────────────────────────────────────────────
function CommandPalette({ open, onClose, items, onRun }) {
  const [q, setQ] = useStateE("");
  const [sel, setSel] = useStateE(0);
  const inputRef = useRefE(null);

  useEffectE(() => {
    if (!open) return;
    setQ(""); setSel(0);
    setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  const filtered = useMemoE(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(it =>
      it.label.toLowerCase().includes(needle) ||
      (it.sub || '').toLowerCase().includes(needle) ||
      (it.tags || []).some(t => t.toLowerCase().includes(needle))
    );
  }, [q, items]);

  useEffectE(() => { setSel(0); }, [q]);

  useEffectE(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(filtered.length - 1, s + 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
      else if (e.key === 'Enter') { e.preventDefault(); const it = filtered[sel]; if (it) onRun(it); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, sel, onClose, onRun]);

  if (!open) return null;
  return (
    <div className="cp-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cp">
        <input
          ref={inputRef}
          className="cp-input"
          placeholder="> escribe para buscar · prueba 'redteam' o 'contact'"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="cp-list">
          {filtered.length === 0 && <div className="cp-empty">$ no matching commands</div>}
          {filtered.map((it, i) => (
            <div
              key={it.id}
              className={`cp-row ${i === sel ? 'active' : ''}`}
              onMouseEnter={() => setSel(i)}
              onMouseDown={(e) => { e.preventDefault(); onRun(it); }}
            >
              <span className="ic">{it.ic}</span>
              <span className="lab">
                {it.label}
                {it.sub && <div className="sub">{it.sub}</div>}
              </span>
              <span className="arr">{it.kind === 'nav' ? '↗' : '↵'}</span>
            </div>
          ))}
        </div>
        <div className="cp-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> navegar <kbd>↵</kbd> ejecutar <kbd>esc</kbd> cerrar</span>
          <span>{filtered.length} resultados</span>
        </div>
      </div>
    </div>
  );
}

// expose
Object.assign(window, { BootSequence, ThreatFeed, SkillMatrix, NodeGraph, CommandPalette });
