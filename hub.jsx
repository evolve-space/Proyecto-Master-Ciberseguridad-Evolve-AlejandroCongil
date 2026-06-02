// hub.jsx — Ecosystem Hub as the primary navigation surface
const { useState: useS, useEffect: useE, useRef: useR, useMemo: useM, useCallback: useC } = React;

// ─────────────────────────────────────────────────────────────
// NODES — 1 center + 9 around (clock positions)
// ─────────────────────────────────────────────────────────────
// helper for clock placement around center
const _pos = (deg, r=32) => {
  const rad = (deg - 90) * Math.PI / 180; // start at top
  return { x: 50 + r * Math.cos(rad), y: 50 + r * Math.sin(rad) };
};

const HUB_NODES = [
  { id: 'me',      ...{ x: 50, y: 50 }, label: 'alejandro',         sub: 'operator',          kind: 'self',    icon: '◉' },
  { id: 'msc',     ..._pos(0),          label: 'Evolve MSc',        sub: 'MSc Cybersec',      kind: 'edu',     icon: 'EDU' },
  { id: 'rag',     ..._pos(40),         label: 'CyberSec RAG',      sub: '4 146 chunks',      kind: 'proj',    icon: 'RAG' },
  { id: 'lab',     ..._pos(80),         label: 'CyberSec Lab',      sub: 'recon ofensivo',    kind: 'proj',    icon: 'LAB' },
  { id: 'osint',   ..._pos(120),        label: 'OSINT Framework',   sub: '1 169 tools',       kind: 'proj',    icon: 'OS' },
  { id: 'skills',  ..._pos(160),        label: 'Stack',             sub: 'operator.matrix',   kind: 'cap',     icon: 'STK' },
  { id: 'contact', ..._pos(200),        label: 'Contacto',          sub: '@gmail · linkedin', kind: 'reach',   icon: '@' },
  { id: 'writes',  ..._pos(240),        label: 'Escritos',          sub: '3 artículos',       kind: 'content', icon: '✎' },
  { id: 'tel',     ..._pos(280),        label: 'Ausarta',           sub: 'Telecom · 2024→',   kind: 'work',    icon: 'NET' },
  { id: 'soc',     ..._pos(320),        label: 'Bullhost',          sub: 'SOC L2 · 2026→',    kind: 'work',    icon: 'SOC' }
];

const HUB_EDGES = [
  // alejandro connects to all
  ['me','msc'], ['me','rag'], ['me','lab'], ['me','osint'], ['me','skills'],
  ['me','contact'], ['me','writes'], ['me','tel'], ['me','soc'],
  // career progression
  ['tel','soc'],
  // education feeds projects
  ['msc','rag'], ['msc','lab'],
  // project cluster
  ['rag','lab'], ['lab','osint'],
  // stack powers projects
  ['skills','rag'], ['skills','lab'],
  // writings flow from rag
  ['rag','writes']
];

const NODE_KIND_LABEL = {
  self:    'operator',
  work:    'experiencia',
  edu:     'formación',
  proj:    'proyecto',
  cap:     'capacidades',
  reach:   'contacto',
  content: 'publicaciones'
};
const NODE_KIND_COLOR = {
  self:    'var(--acc)',
  work:    'var(--fg-2)',
  edu:     'var(--fg-1)',
  proj:    'var(--acc)',
  cap:     'var(--fg-1)',
  reach:   'var(--acc)',
  content: 'var(--fg-1)'
};

// adjacency map
const ADJACENCY = (() => {
  const a = {};
  for (const [x, y] of HUB_EDGES) {
    (a[x] = a[x] || new Set()).add(y);
    (a[y] = a[y] || new Set()).add(x);
  }
  return a;
})();

// node lookup
const NODE_MAP = Object.fromEntries(HUB_NODES.map(n => [n.id, n]));

// adjacent nodes (excluding "me"), used for jump suggestions
function suggestJumps(id) {
  const adj = [...(ADJACENCY[id] || [])].filter(x => x !== 'me');
  // pad with other interesting nodes if too few
  while (adj.length < 3) {
    const candidates = HUB_NODES.filter(n => n.id !== 'me' && n.id !== id && !adj.includes(n.id));
    if (!candidates.length) break;
    adj.push(candidates[Math.floor(Math.random() * candidates.length)].id);
  }
  return adj.slice(0, 3);
}

// ─────────────────────────────────────────────────────────────
// Main: EcosystemHub
// ─────────────────────────────────────────────────────────────
function EcosystemHub({ data }) {
  const [selected, setSelected] = useS(null);

  // restore from hash
  useE(() => {
    const fromHash = () => {
      const m = window.location.hash.match(/^#node\/([a-z]+)$/);
      if (m && NODE_MAP[m[1]]) setSelected(m[1]);
      else if (window.location.hash === '#hub') setSelected(null);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  const select = useC((id) => {
    setSelected(id);
    if (id) {
      try { history.replaceState(null, '', `#node/${id}`); } catch {}
    } else {
      try { history.replaceState(null, '', '#hub'); } catch {}
    }
    // scroll hub into view (so detail is visible)
    setTimeout(() => {
      const shell = document.querySelector('.hub-shell');
      if (shell) {
        const top = shell.getBoundingClientRect().top + window.scrollY - 24;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 50);
  }, []);

  // Esc closes
  useE(() => {
    if (!selected) return;
    const onKey = (e) => { if (e.key === 'Escape') select(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, select]);

  return (
    <section className="hub-section container" id="ecosystem" data-screen-label="02 Ecosystem">
      {selected ? (
        // Drilldown view (no scroll-animation wrapper, full surface)
        <React.Fragment>
          <span className="eyebrow">ecosistema</span>
          <h2 className="section-title">El mapa</h2>
          <p className="section-lede">Cada nodo es una dimensión de mi trabajo. Click para entrar.</p>
          <div className="hub-shell">
            <HubStatusbar selected={selected} onHome={() => select(null)} />
            <Drilldown selected={selected} onSelect={select} data={data} />
          </div>
        </React.Fragment>
      ) : (
        // Initial view: presented via scroll-driven container animation
        <ContainerScroll
          titleComponent={
            <React.Fragment>
              <span className="eyebrow" style={{justifyContent:'center'}}>ecosistema</span>
              <h2 className="section-title" style={{textAlign:'center'}}>El mapa</h2>
              <p className="section-lede" style={{margin:'0 auto', textAlign:'center'}}>Cada nodo es una dimensión de mi trabajo.<br/>Click en cualquiera para entrar.</p>
            </React.Fragment>
          }
        >
          <div className="hub-shell hub-shell-card">
            <HubStatusbar selected={null} onHome={() => {}} />
            <div className="hub-graph">
              <HubGraph selected={null} onSelect={select} interactive={true} />
            </div>
          </div>
        </ContainerScroll>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Meteors (Aceternity-style)
// ─────────────────────────────────────────────────────────────
function Meteors({ count = 12 }) {
  const meteors = useM(() => Array.from({length: count}, (_, i) => ({
    top: Math.random() * 60 + '%',
    left: Math.random() * 80 + 10 + '%',
    delay: (Math.random() * 6).toFixed(2) + 's',
    dur: (Math.random() * 4 + 4).toFixed(2) + 's'
  })), [count]);
  return (
    <div className="meteors" aria-hidden="true">
      {meteors.map((m, i) => (
        <span key={i} className="meteor" style={{
          top: m.top, left: m.left,
          animationDelay: m.delay,
          animationDuration: m.dur
        }} />
      ))}
    </div>
  );
}

function HubStatusbar({ selected, onHome }) {
  const node = selected ? NODE_MAP[selected] : null;
  const time = new Date().toTimeString().slice(0, 5);
  return (
    <div className="hub-statusbar">
      <span className="crumbs">
        <span style={{ cursor: 'pointer' }} onClick={onHome}>~/ecosystem</span>
        {node && <React.Fragment><span className="sep">/</span><span className="here">{node.id}</span></React.Fragment>}
      </span>
      <span className="sysline">
        {!selected && <React.Fragment><b>{HUB_NODES.length}</b> nodes · <b>{HUB_EDGES.length}</b> connections · live</React.Fragment>}
        {selected && <React.Fragment><b>{node.label}</b> · {NODE_KIND_LABEL[node.kind]}</React.Fragment>}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HubGraph: big SVG (when no selection) or compact mini-map
// ─────────────────────────────────────────────────────────────
function HubGraph({ selected, onSelect, interactive = true, compact = false }) {
  const [hovered, setHovered] = useS(null);
  const focusId = selected || hovered;
  const W = 1000, H = 720;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="haloMe" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--acc)" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="var(--acc)" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="haloSel" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--acc)" stopOpacity="0.55"/>
          <stop offset="100%" stopColor="var(--acc)" stopOpacity="0"/>
        </radialGradient>
        <pattern id="hubDots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="var(--line)" />
        </pattern>
        {/* Animated beam gradient (travels along edge length) */}
        <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"  stopColor="var(--acc)" stopOpacity="0"/>
          <stop offset="35%" stopColor="var(--acc)" stopOpacity="0.9"/>
          <stop offset="65%" stopColor="var(--acc-2)" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="var(--acc)" stopOpacity="0"/>
          <animate attributeName="x1" values="-100%; 100%" dur="3.6s" repeatCount="indefinite"/>
          <animate attributeName="x2" values="0%; 200%" dur="3.6s" repeatCount="indefinite"/>
        </linearGradient>
      </defs>
      {!compact && <rect width={W} height={H} fill="url(#hubDots)" opacity="0.4"/>}

      {/* edges */}
      {HUB_EDGES.map(([a, b], i) => {
        const A = NODE_MAP[a], B = NODE_MAP[b];
        const x1 = (A.x/100) * W, y1 = (A.y/100) * H;
        const x2 = (B.x/100) * W, y2 = (B.y/100) * H;
        const isActive = focusId && (a === focusId || b === focusId);
        const isDim = focusId && !isActive;
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="var(--line)"
                  strokeWidth="1"
                  opacity={isDim ? 0.15 : (isActive ? 0.4 : 0.55)} />
            {isActive && (
              <line x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="url(#beamGrad)"
                    strokeWidth="2.2"
                    strokeLinecap="round" />
            )}
          </g>
        );
      })}

      {/* halo center */}
      <circle cx={(NODE_MAP.me.x/100)*W} cy={(NODE_MAP.me.y/100)*H} r={compact ? 50 : 120} fill="url(#haloMe)">
        {!compact && <animate attributeName="r" values="110;140;110" dur="4s" repeatCount="indefinite" />}
      </circle>

      {/* selected halo */}
      {selected && selected !== 'me' && (() => {
        const n = NODE_MAP[selected];
        return (
          <circle cx={(n.x/100)*W} cy={(n.y/100)*H} r={compact ? 30 : 80} fill="url(#haloSel)">
            <animate attributeName="r" values={compact ? "22;36;22" : "60;90;60"} dur="2.4s" repeatCount="indefinite" />
          </circle>
        );
      })()}

      {/* nodes */}
      {HUB_NODES.map(n => {
        const cx = (n.x/100) * W, cy = (n.y/100) * H;
        const isMe = n.kind === 'self';
        const r = compact ? (isMe ? 14 : 9) : (isMe ? 34 : 22);
        const isSelected = selected === n.id;
        const isDim = focusId && focusId !== n.id && !ADJACENCY[focusId]?.has(n.id);
        const accent = NODE_KIND_COLOR[n.kind] || 'var(--fg-2)';
        const strokeW = isSelected ? 2.8 : (isMe ? 2.2 : 1.4);
        let cls = 'node-card';
        if (isSelected) cls += ' selected';
        if (isDim) cls += ' dim';
        return (
          <g key={n.id} className={cls}
             onMouseEnter={()=>interactive && setHovered(n.id)}
             onMouseLeave={()=>interactive && setHovered(null)}
             onClick={()=>interactive && onSelect(n.id)}>
            {!compact && <circle cx={cx} cy={cy} r={r + 8} fill="var(--bg-0)" stroke={accent} strokeWidth="1" opacity={isSelected ? 0.8 : 0.4}/>}
            <circle cx={cx} cy={cy} r={r} fill={isSelected ? 'rgba(90,227,155,.08)' : 'var(--bg-1)'} stroke={accent} strokeWidth={strokeW}/>
            {isMe && (
              <circle cx={cx} cy={cy} r={compact ? 4 : 7} fill="var(--acc)">
                <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite"/>
              </circle>
            )}
            {!isMe && !compact && (
              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="11"
                    fontFamily="JetBrains Mono, monospace" fill={isSelected ? 'var(--acc)' : 'var(--fg-2)'}
                    letterSpacing="0.04em" fontWeight="500">{n.icon}</text>
            )}
            {!compact && <React.Fragment>
              <text x={cx} y={cy + r + 24} textAnchor="middle" fontSize="14"
                    fontFamily="Geist, sans-serif" fontWeight="500"
                    fill={isDim ? 'var(--fg-3)' : 'var(--fg-0)'} letterSpacing="-0.01em">{n.label}</text>
              <text x={cx} y={cy + r + 40} textAnchor="middle" fontSize="11"
                    fontFamily="JetBrains Mono, monospace" fill="var(--fg-3)">{n.sub}</text>
            </React.Fragment>}
          </g>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Drilldown — wrapper that picks the right detail view
// ─────────────────────────────────────────────────────────────
function Drilldown({ selected, onSelect, data }) {
  if (!selected) return <div className="hub-drill" aria-hidden="true"></div>;
  const node = NODE_MAP[selected];
  const jumps = suggestJumps(selected);

  const Detail = DETAIL_VIEWS[selected] || DefaultDetail;

  return (
    <div className={`hub-drill ${selected ? 'in' : ''}`}>
      <div className="drill-hd">
        <div className="drill-hd-l">
          <span className="drill-kind">{NODE_KIND_LABEL[node.kind]} · {node.icon}</span>
          <h3 className="drill-title">{node.label}</h3>
          <div className="drill-sub">{node.sub}</div>
        </div>
        <div className="mini-map" onClick={() => onSelect(null)} title="volver al ecosistema">
          <button className="mm-back">← volver</button>
          <HubGraph selected={selected} onSelect={() => {}} interactive={false} compact={true} />
        </div>
      </div>
      <div className="drill-body">
        <Detail node={node} data={data} onSelect={onSelect} />
      </div>
      <div className="drill-foot">
        <h6>navega a otros nodos del ecosistema</h6>
        <div className="drill-jumps">
          {jumps.map(j => (
            <button key={j} className="drill-jump" onClick={() => onSelect(j)}>
              <span className="badge">{NODE_MAP[j].icon}</span>
              <span className="info">
                <div className="l">{NODE_KIND_LABEL[NODE_MAP[j].kind]}</div>
                <div className="n">{NODE_MAP[j].label}</div>
              </span>
              <span className="arr">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DETAIL VIEWS — one per node id
// ─────────────────────────────────────────────────────────────

function DefaultDetail({ node }) {
  return <div className="drill-prose"><p>Contenido para <strong>{node.label}</strong>.</p></div>;
}

function MeDetail({ data }) {
  return (
    <React.Fragment>
      <div className="bento">
        <div className="bento-cell span-4 row-2 headline">
          <div className="label"><span>~/about</span><span>operator</span></div>
          <div className="value" style={{ marginTop: 10 }}>
            21 años. Telecom de base.<br/>
            Mi north star: <em>Red Teamer de élite</em>.
          </div>
          <div className="sub" style={{ marginTop: 14 }}>
            Construyo inteligencia táctica con IA para acelerar cada fase del aprendizaje y la operación.
          </div>
        </div>
        <div className="bento-cell span-2 live">
          <div className="label">activo</div>
          <div className="value">SOC L2</div>
          <div className="sub">Bullhost · feb 2026 →</div>
        </div>
        <div className="bento-cell span-2">
          <div className="label">paralelo</div>
          <div className="value">Telecom</div>
          <div className="sub">Ausarta · 2024 →</div>
        </div>
        <div className="bento-cell span-3">
          <div className="label">formación</div>
          <div className="value">MSc Cybersec</div>
          <div className="sub">Evolve Academy · en curso</div>
        </div>
        <div className="bento-cell span-3">
          <div className="label">proyecto principal</div>
          <div className="value">CyberSec RAG</div>
          <div className="sub">4 146 fragmentos · 22 sesiones · python · chromadb</div>
        </div>
        <div className="bento-cell span-2">
          <div className="label">ubicación</div>
          <div className="value" style={{ fontSize: 22 }}>País Vasco</div>
          <div className="sub">España · disponible</div>
        </div>
        <div className="bento-cell span-2">
          <div className="label">edad</div>
          <div className="value">21</div>
          <div className="sub">años</div>
        </div>
        <div className="bento-cell span-2">
          <div className="label">stack</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 4 }}>
            {['Python','SIEM','Kali','OSINT','ChromaDB','Claude'].map((t,i)=>(
              <span key={i} className="bento-tag">{t}</span>
            ))}
          </div>
        </div>
        <div className="bento-cell span-3 ascii">
          <pre>{`     /\\__/\\
    ( o.o )
     > ^ <    `}<span className="art">{`alejandro@cybersec`}</span>{`
              ./run --portfolio`}</pre>
        </div>
        <div className="bento-cell span-3">
          <div className="label">filosofía</div>
          <div style={{ fontSize: 15, color: 'var(--fg-1)', lineHeight: 1.4, marginTop: 8 }}>
            "La IA bien usada no sustituye al operador — <span style={{color:'var(--acc)'}}>amplifica</span> al que entiende sus fundamentos."
          </div>
        </div>
      </div>
    </React.Fragment>
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
        <div className="json-l json-indent"><span className="k">"north_star"</span>: <span className="s">"Red Team élite"</span></div>
        <div className="json-l"><span className="p">{"}"}</span></div>
      </div>
    </div>
  );
}

function BullhostDetail() {
  return (
    <React.Fragment>
      <div className="row col-2">
        <div className="drill-prose">
          <p>Equipo de defensa con cobertura <strong>24/7</strong> que protege infraestructura crítica de clientes empresariales. Mi rol como <strong>L2</strong> es el punto donde las alertas dejan de ser ruido y se convierten en investigaciones.</p>
          <p>Trabajo con SIEM en triage profundo, correlaciono eventos en busca de patrones, persigo TTPs documentadas en <strong>MITRE ATT&CK</strong> y colaboro con L3 cuando un incidente escala a forensia.</p>
        </div>
        <div className="drill-section">
          <h4>responsabilidades</h4>
          <div className="np-list">
            <div className="np-list-item"><span className="b">▸</span>Detección y análisis en tiempo real</div>
            <div className="np-list-item"><span className="b">▸</span>Triage de alertas · reducción de falsos positivos</div>
            <div className="np-list-item"><span className="b">▸</span>Threat hunting con MITRE ATT&CK</div>
            <div className="np-list-item"><span className="b">▸</span>Gestión de vulnerabilidades</div>
            <div className="np-list-item"><span className="b">▸</span>Documentación de TTPs e indicadores</div>
            <div className="np-list-item"><span className="b">▸</span>Soporte forense con L3</div>
          </div>
        </div>
      </div>
      <div className="drill-section">
        <h4>stack en uso</h4>
        <div className="np-tags">
          {['SIEM · Splunk', 'Sysmon', 'Sigma Rules', 'EDR', 'IR Playbooks', 'MITRE ATT&CK', 'Wireshark', 'Threat Intel'].map((t,i)=>(<span key={i} className="np-tag">{t}</span>))}
        </div>
      </div>
    </React.Fragment>
  );
}

function AusartaDetail() {
  return (
    <React.Fragment>
      <div className="row col-2">
        <div className="drill-prose">
          <p><strong>Ausarta Networks</strong> es donde construí la base que ahora aprovecho en defensa. Dos años manteniendo <strong>infraestructura de red corporativa</strong> me enseñaron a leer el tráfico antes de leer alertas — entiendes el SOC mucho mejor cuando vienes de telecom.</p>
          <p>Configuro switches, routers, firewalls y segmentación con VLANs. Cuando un incidente de red pasa, soy quien interpreta el `traceroute`.</p>
        </div>
        <div className="drill-section">
          <h4>día a día</h4>
          <div className="np-list">
            <div className="np-list-item"><span className="b">▸</span>Configuración de switches y routers Cisco</div>
            <div className="np-list-item"><span className="b">▸</span>Firewalls perimetrales y reglas ACL</div>
            <div className="np-list-item"><span className="b">▸</span>Segmentación con VLANs</div>
            <div className="np-list-item"><span className="b">▸</span>Monitorización de servicios y SLAs</div>
            <div className="np-list-item"><span className="b">▸</span>Soporte L1/L2 a usuarios y resolución de incidencias</div>
          </div>
        </div>
      </div>
      <div className="drill-section">
        <h4>tecnologías</h4>
        <div className="np-tags">
          {['Cisco IOS', 'TCP/IP', 'VLANs', 'Firewalls', 'Wireshark', 'DNS / DHCP', 'Routing & Switching', 'Network Monitoring'].map((t,i)=>(<span key={i} className="np-tag">{t}</span>))}
        </div>
      </div>
    </React.Fragment>
  );
}

function EvolveDetail({ data }) {
  return (
    <React.Fragment>
      <div className="row col-2">
        <div className="drill-prose">
          <p>El <strong>Máster en Ciberseguridad de Evolve Academy</strong> es el catalizador. Cada sesión, ejercicio y writeup alimenta directamente mi base de conocimiento personal — el RAG indexa todo el material en cuanto sale del aula.</p>
          <p>El programa cubre <strong>ofensiva y defensiva</strong> con un enfoque práctico: laboratorios reales, herramientas estándar de la industria y mentorship con profesionales en activo.</p>
        </div>
        <div className="drill-section">
          <h4>áreas cubiertas</h4>
          <div className="np-list">
            <div className="np-list-item"><span className="b">◉</span>Hacking ético y pentesting</div>
            <div className="np-list-item"><span className="b">◉</span>Análisis forense digital</div>
            <div className="np-list-item"><span className="b">◉</span>Seguridad en sistemas y redes</div>
            <div className="np-list-item"><span className="b">◉</span>Threat intelligence</div>
            <div className="np-list-item"><span className="b">◉</span>Bash, Python y automatización ofensiva</div>
            <div className="np-list-item"><span className="b">◉</span>Cumplimiento y normativa</div>
          </div>
        </div>
      </div>
      <div className="drill-section">
        <h4>otros hitos formativos</h4>
        <div className="timeline" style={{ marginTop: 0 }}>
          {data.education.filter(e => e.title !== 'Máster en Ciberseguridad').map((e, i) => (
            <div key={i} className="tl-row past">
              <div className="tl-date">{e.dateLabel}</div>
              <div className="tl-dot"></div>
              <div className="tl-card">
                <div className="tl-role">
                  <h3>{e.title}</h3>
                  <span className="status-pill done">{e.status}</span>
                </div>
                <div className="tl-org"><span className="org">{e.org}</span><span className="sep">·</span><span className="mono">{e.period}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
}

function RagDetail({ data }) {
  return (
    <React.Fragment>
      <div className="drill-prose">
        <p>Sistema <strong>RAG personal</strong> que convierte todo el material del máster en una base de conocimiento consultable. Indexa <strong>vídeos, transcripciones, PDFs e imágenes</strong> con OCR y Whisper, los trocea con overlap, los embebe localmente con ONNX y los consulta con Claude Sonnet vía streaming.</p>
        <p>El objetivo es construir <strong>inteligencia táctica acumulativa</strong>: cada clase mejora el sistema, cada respuesta de Claude está fundamentada en mi propio material de estudio.</p>
      </div>
      <div className="drill-section">
        <h4>arquitectura interactiva</h4>
        <p style={{ color: 'var(--fg-2)', fontSize: 13.5, margin: '0 0 14px' }}>Click en cualquier componente del pipeline para entender su papel.</p>
        <MiniMap {...RAG_GRAPH} height={420} emptyHint="Click un nodo del pipeline para inspeccionarlo" />
      </div>
      <div className="drill-stats">
        {data.projectMetrics.map((m, i) => (
          <div key={i} className="drill-stat">
            <div className="n">{m.n}</div>
            <div className="l">{m.l}</div>
          </div>
        ))}
      </div>
      <div className="drill-section">
        <h4>demo · consulta una de mis preguntas reales</h4>
        <RagDemo demos={data.ragDemo} />
      </div>
      <div className="drill-section">
        <h4>código y artículos</h4>
        <GradientMenu items={[
          { kind: 'github', href: data.github },
          { kind: 'devto',  href: data.devto, label: 'Dev.to' }
        ]} />
      </div>
    </React.Fragment>
  );
}

function LabDetail({ data }) {
  return (
    <React.Fragment>
      <div className="drill-prose">
        <p>Laboratorio donde aplico la teoría como un Red Teamer. Estructurado en <strong>6 fases secuenciales</strong> — cada una se desbloquea al dominar la anterior. Ahora mismo trabajo el <strong>reconocimiento pasivo y OSINT</strong>.</p>
        <p>Todo el entorno corre en una <strong>Kali Linux VM</strong> aislada, con logs estructurados que retroalimentan el sistema RAG.</p>
      </div>
      <div className="drill-section">
        <h4>el kill chain como mapa</h4>
        <p style={{ color: 'var(--fg-2)', fontSize: 13.5, margin: '0 0 14px' }}>Click en cualquier fase para ver qué herramientas y técnicas incluye.</p>
        <MiniMap {...LAB_GRAPH} height={300} emptyHint="Click la fase 01 para empezar el recorrido" initialSelection="p1" />
      </div>
      <div className="drill-section">
        <h4>arsenal del laboratorio</h4>
        <div className="np-tags">
          {['Kali Linux VM', 'Nmap', 'Metasploit', 'Burp Suite', 'theHarvester', 'Maltego', 'Sherlock', 'Recon-ng', 'FOCA', 'Shodan', 'Hydra', 'Nikto'].map((t,i)=>(<span key={i} className="np-tag">{t}</span>))}
        </div>
      </div>
    </React.Fragment>
  );
}

function OsintDetail({ data }) {
  return (
    <React.Fragment>
      <div className="drill-prose">
        <p>Tracker personal del <strong>OSINT Framework</strong> completo de Justin Nordine. Cada herramienta probada se documenta con caso de uso, valor observado y ejemplo real. Es el pilar del módulo de reconocimiento pasivo del Lab.</p>
        <p>El objetivo no es solo conocerlas — es <strong>construir intuición</strong> sobre qué herramienta usar en cada situación.</p>
      </div>
      <div className="drill-section">
        <h4>constelación de categorías</h4>
        <p style={{ color: 'var(--fg-2)', fontSize: 13.5, margin: '0 0 14px' }}>Click en cualquier categoría para ver las herramientas top y el contexto de uso.</p>
        <MiniMap {...OSINT_GRAPH} height={460} emptyHint="Click una categoría para ver herramientas top" />
      </div>
      <div className="drill-stats">
        <div className="drill-stat"><div className="n">1 169</div><div className="l">herramientas</div><div className="sub">total framework</div></div>
        <div className="drill-stat"><div className="n">33</div><div className="l">categorías</div><div className="sub">organizadas</div></div>
        <div className="drill-stat"><div className="n">9</div><div className="l">grupos activos</div><div className="sub">en mapeo</div></div>
        <div className="drill-stat"><div className="n">0%</div><div className="l">progreso</div><div className="sub">empezando</div></div>
      </div>
    </React.Fragment>
  );
}

function StackDetail({ data }) {
  return (
    <React.Fragment>
      <div className="drill-prose">
        <p>Mi stack no es una lista plana — es un <strong>espectro</strong>. A la izquierda, las herramientas defensivas que uso a diario en el SOC. A la derecha, el arsenal ofensivo del laboratorio. En el centro, lo que cabalga entre ambos mundos.</p>
        <p>Click en cualquier herramienta para ver cómo encaja en mi flujo de trabajo.</p>
      </div>
      <div className="drill-section">
        <h4>espectro operativo · Blue ↔ Red</h4>
        <MiniMap {...STACK_GRAPH} height={460} emptyHint="Click cualquier herramienta del espectro" />
      </div>
      <SkillMatrix skills={data.skills} />
      <div className="drill-section">
        <h4>vista detallada por categoría</h4>
        <div className="skills-grid">
          {data.skills.map((cat, i) => (
            <div key={i} className="skill-card">
              <div className="skill-head">
                <span className="skill-cat">{cat.cat}</span>
                <span className="skill-ic">{cat.ic}</span>
              </div>
              <div className="skill-list">
                {cat.items.map(([name, level], j) => (
                  <div key={j} className="skill-row">
                    <span>{name}</span>
                    <span className="skill-bar"><span className="fill" style={{ width: `${(level/5)*100}%` }}></span></span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
}

function WritesDetail({ data }) {
  const articles = [
    {
      platform: 'Dev.to',
      title: 'Cómo construí un sistema RAG para convertirme en Red Teamer con IA',
      desc: 'Breakdown técnico del pipeline completo: ingesta, OCR, Whisper, chunking, embeddings ONNX, ChromaDB y Claude SSE streaming.',
      read: '18 min',
      url: data.devto
    },
    {
      platform: 'Medium',
      title: 'De técnico de redes a Red Teamer — La IA como ventaja competitiva',
      desc: 'Reflexión sobre el salto profesional desde telecomunicaciones a ciberseguridad ofensiva, y por qué la IA bien usada acelera todo.',
      read: '12 min',
      url: data.medium
    },
    {
      platform: 'LinkedIn Pulse',
      title: 'De las telecomunicaciones al Red Team — Cómo uso la IA',
      desc: 'Versión orientada a profesionales: el caso de uso de la IA en ciberseguridad personal, con métricas y ejemplos concretos.',
      read: '8 min',
      url: data.linkedinPost
    }
  ];
  return (
    <React.Fragment>
      <div className="drill-prose">
        <p>Tres artículos donde documento el por qué y el cómo del proyecto RAG, la transición profesional y el papel de la IA en cybersec. Tocan tanto la <strong>parte técnica</strong> como la <strong>narrativa de carrera</strong>.</p>
      </div>
      <div className="drill-section">
        <h4>acceso rápido</h4>
        <GradientMenu size="lg" items={[
          { kind: 'devto',    href: data.devto },
          { kind: 'medium',   href: data.medium },
          { kind: 'linkedin', href: data.linkedinPost, label: 'LinkedIn' }
        ]} />
      </div>
      <div className="writes-grid">
        {articles.map((a, i) => (
          <a key={i} className="write-card" href={a.url} target="_blank" rel="noreferrer">
            <span className="platform">{a.platform}</span>
            <div className="ttl">{a.title}</div>
            <p className="desc">{a.desc}</p>
            <div className="foot">
              <span>{a.read} de lectura</span>
              <span className="read">leer ↗</span>
            </div>
          </a>
        ))}
      </div>
    </React.Fragment>
  );
}

function ContactDetail({ data }) {
  return (
    <React.Fragment>
      <div className="row col-2">
        <div>
          <div className="contact-status"><span className="pulse"></span>Disponible para nuevas oportunidades</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,3.4vw,44px)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.05, color: 'var(--fg-0)', margin: '20px 0 14px' }}>
            ¿Hablamos?
          </h3>
          <p style={{ fontSize: 16.5, color: 'var(--fg-2)', marginBottom: 24, maxWidth: '46ch' }}>
            Abierto a oportunidades en <strong style={{ color: 'var(--fg-1)' }}>Blue Team</strong>, análisis de amenazas y proyectos de ciberseguridad con IA.
          </p>
          <a href={`mailto:${data.email}`} className="btn btn-pri">Enviar email <span className="arrow">→</span></a>
          <div style={{ marginTop: 32 }}>
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fg-3)', margin: '0 0 14px', fontWeight: 500 }}>donde encontrarme</h4>
            <GradientMenu size="lg" items={[
              { kind: 'email',    href: `mailto:${data.email}` },
              { kind: 'linkedin', href: data.linkedin },
              { kind: 'github',   href: data.github },
              { kind: 'phone',    href: data.phoneHref }
            ]} />
          </div>
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
    </React.Fragment>
  );
}

const DETAIL_VIEWS = {
  me:      MeDetail,
  soc:     BullhostDetail,
  tel:     AusartaDetail,
  msc:     EvolveDetail,
  rag:     RagDetail,
  lab:     LabDetail,
  osint:   OsintDetail,
  skills:  StackDetail,
  writes:  WritesDetail,
  contact: ContactDetail
};

Object.assign(window, { EcosystemHub, Meteors, RagDemo });
