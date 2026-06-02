// main-hub.jsx — "Operations terminal" layout: 4 distinct stations with mini-previews
const { useState: useMHS } = React;

function MainHubSection({ data }) {
  return (
    <section className="eco-section container" id="ecosystem" data-screen-label="01 Ecosystem">
      <EcoHeader
        num="01"
        label="estaciones · ecosistema"
        title="Conéctate a una estación"
        lede="Mi trabajo se articula en cuatro proyectos. Cada estación tiene un dominio operativo distinto. Click en cualquiera para conectar."
        centered
      />
      <OpsTerminal />
    </section>
  );
}

const STATIONS = [
  {
    id: 'rag',
    code: 'STN-01',
    title: 'CyberSec RAG',
    role: 'inteligencia · pipeline',
    desc: 'Sistema RAG que indexa vídeos, PDFs e imágenes del máster en una base de conocimiento consultable.',
    accent: '#5ae39b',
    metrics: [
      { v: '4 146', l: 'chunks' },
      { v: '22', l: 'sesiones' },
      { v: '7', l: 'pasos' }
    ],
    layout: 'wide'
  },
  {
    id: 'lab',
    code: 'STN-02',
    title: 'CyberSec Lab',
    role: 'táctica · ofensiva',
    desc: 'Kill chain del operador en 6 fases. Cada fase se desbloquea al dominar la anterior.',
    accent: '#e8a554',
    layout: 'wide'
  },
  {
    id: 'osint',
    code: 'STN-03',
    title: 'OSINT Framework',
    role: 'reconocimiento',
    desc: 'Tracker del framework completo. 1 169 herramientas en 33 categorías mapeadas.',
    accent: '#5ed4e8',
    metrics: [
      { v: '1 169', l: 'tools' },
      { v: '33', l: 'cats' }
    ],
    layout: 'wide'
  },
  {
    id: 'stack',
    code: 'STN-04',
    title: 'Stack operativo',
    role: 'capacidades',
    desc: 'Stack como espectro Blue ↔ Red con herramientas dual-use bridgeando ambos mundos.',
    accent: '#b58cf2',
    layout: 'wide'
  }
];

function OpsTerminal() {
  const [active, setActive] = useMHS(null);
  const go = (id) => { window.location.hash = id; };

  return (
    <div className="ops">
      <div className="ops-meta">
        <div className="ops-meta-l">
          <span className="ops-tag">// OPS PANEL</span>
          <span className="ops-stat">
            <span className="ops-dot"></span>
            <span>4 stations · online</span>
          </span>
        </div>
        <div className="ops-meta-r">
          <span>operator: <strong>alejandro.congil</strong></span>
          <span className="sep">·</span>
          <span>SOC L2 · Bullhost</span>
        </div>
      </div>

      <div className="ops-grid">
        {STATIONS.map(s => (
          <StationCard
            key={s.id}
            station={s}
            isActive={active === s.id}
            isDim={active && active !== s.id}
            onEnter={() => setActive(s.id)}
            onLeave={() => setActive(null)}
            onClick={() => go(s.id)}
          />
        ))}
      </div>
    </div>
  );
}

function StationCard({ station, isActive, isDim, onEnter, onLeave, onClick }) {
  const Preview = STATION_PREVIEWS[station.id] || (() => null);
  return (
    <button
      className={`ops-card ops-card-${station.layout} ${isActive ? 'on' : ''} ${isDim ? 'dim' : ''}`}
      style={{ '--st': station.accent }}
      data-id={station.id}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      <span className="ops-card-bg"></span>
      <div className="ops-card-chrome">
        <div className="ops-card-dots">
          <span></span><span></span><span></span>
        </div>
        <div className="ops-card-id">
          <span className="ops-card-code">{station.code}</span>
          <span className="ops-card-role">{station.role}</span>
        </div>
        <div className="ops-card-live">
          <span className="ops-card-pulse"></span>
          live
        </div>
      </div>
      <div className="ops-card-body">
        <div className="ops-card-l">
          <h3 className="ops-card-title">{station.title}</h3>
          <p className="ops-card-desc">{station.desc}</p>
          {station.metrics && (
            <div className="ops-card-metrics">
              {station.metrics.map((m, i) => (
                <div key={i} className="ops-card-metric">
                  <div className="ops-card-metric-v">{m.v}</div>
                  <div className="ops-card-metric-l">{m.l}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="ops-card-r">
          <Preview accent={station.accent} />
        </div>
      </div>
      <div className="ops-card-foot">
        <span className="ops-card-cmd">$ connect --station={station.id}</span>
        <span className="ops-card-go">conectar <span className="arr">→</span></span>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Per-station mini previews (decorative, unique to each)
// ─────────────────────────────────────────────────────────────

/* RAG: chunk grid that pulses (suggests semantic retrieval over 4146 chunks) */
function RagPreview({ accent }) {
  const cols = 14, rows = 10;
  const cells = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      cells.push({ x, y, key: `${x}-${y}` });
    }
  }
  // Pre-pick a set of "hot" cells (currently being retrieved)
  const hotSet = new Set();
  const hotCount = 18;
  for (let i = 0; i < hotCount; i++) {
    hotSet.add(`${Math.floor(Math.random() * cols)}-${Math.floor(Math.random() * rows)}`);
  }

  const cw = 12, ch = 12, gap = 2;
  const W = cols * (cw + gap) - gap;
  const H = rows * (ch + gap) - gap;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="ops-preview ops-preview-wide" aria-hidden="true">
      {cells.map((c, i) => {
        const isHot = hotSet.has(c.key);
        const cx = c.x * (cw + gap);
        const cy = c.y * (ch + gap);
        return (
          <rect
            key={c.key}
            x={cx} y={cy}
            width={cw} height={ch}
            rx="2"
            fill={isHot ? accent : 'var(--bg-2)'}
            opacity={isHot ? 0.85 : 0.35}
            stroke={isHot ? accent : 'transparent'}
            strokeWidth="0.5"
          >
            {isHot && (
              <animate
                attributeName="opacity"
                values="0.3;0.95;0.3"
                dur={`${1.4 + (i % 5) * 0.3}s`}
                begin={`${(i % 7) * 0.18}s`}
                repeatCount="indefinite"
              />
            )}
          </rect>
        );
      })}
    </svg>
  );
}

// LAB: 6 progress dots, only #1 lit
const LAB_PREVIEW_GLYPHS = ['search', 'crosshair', 'bug', 'bolt', 'ghost', 'report'];
function LabPreview({ accent }) {
  return (
    <svg viewBox="0 0 360 120" className="ops-preview ops-preview-wide" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map(i => {
        const x = 30 + i * 60;
        const y = 60;
        const isActive = i === 0;
        const glyph = LAB_PREVIEW_GLYPHS[i];
        const iconSize = 14;
        return (
          <g key={i}>
            {i < 5 && <line x1={x + 18} y1={y} x2={x + 42} y2={y} stroke={isActive ? accent : 'var(--line)'} strokeWidth="1.5" strokeDasharray="3 4" opacity={isActive ? 0.8 : 0.45}/>}
            <circle cx={x} cy={y} r="18" fill="var(--bg-2)" stroke={isActive ? accent : 'var(--line)'} strokeWidth={isActive ? 2 : 1}/>
            <g transform={`translate(${x - iconSize/2}, ${y - iconSize/2}) scale(${iconSize/24})`}
               opacity={isActive ? 1 : 0.4}>
              <NodeIcon name={glyph} color={isActive ? accent : 'var(--fg-3)'}/>
            </g>
            <text x={x} y={y + 32} textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono, monospace"
                  fill={isActive ? accent : 'var(--fg-3)'} letterSpacing="0.04em">
              {`0${i+1}`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// OSINT: orbiting nodes
function OsintPreview({ accent }) {
  const nodes = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI/2;
    nodes.push({ x: 100 + 70 * Math.cos(a), y: 100 + 70 * Math.sin(a) });
  }
  return (
    <svg viewBox="0 0 200 200" className="ops-preview" aria-hidden="true">
      <circle cx="100" cy="100" r="70" fill="none" stroke={accent} strokeWidth="0.8" strokeDasharray="2 4" opacity="0.4"/>
      <circle cx="100" cy="100" r="18" fill="var(--bg-2)" stroke={accent} strokeWidth="1.6"/>
      <text x="100" y="100" textAnchor="middle" dominantBaseline="central" fontSize="9" fontFamily="JetBrains Mono, monospace" fill={accent} fontWeight="600" letterSpacing="0.08em">OS</text>
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r="6" fill="var(--bg-1)" stroke={accent} strokeWidth="1.2">
          <animate attributeName="opacity" values="0.4;1;0.4" dur={`${2 + i * 0.3}s`} repeatCount="indefinite"/>
        </circle>
      ))}
    </svg>
  );
}

// STACK: blue-to-red gradient bars
function StackPreview({ accent }) {
  const items = [
    { x: 20,  h: 60, c: '#5ed4e8' },
    { x: 50,  h: 80, c: '#5ed4e8' },
    { x: 80,  h: 50, c: '#5ed4e8' },
    { x: 110, h: 90, c: '#e8a554' },
    { x: 140, h: 70, c: '#e8a554' },
    { x: 170, h: 95, c: '#e26a52' },
    { x: 200, h: 75, c: '#e26a52' },
    { x: 230, h: 55, c: '#e26a52' },
    { x: 260, h: 85, c: '#e26a52' }
  ];
  return (
    <svg viewBox="0 0 300 130" className="ops-preview ops-preview-wide" aria-hidden="true">
      {items.map((b, i) => (
        <rect key={i}
          x={b.x} y={120 - b.h}
          width="18" height={b.h}
          fill={b.c} opacity="0.35"
          rx="2">
          <animate attributeName="opacity" values="0.35;0.9;0.35" dur={`${1.6 + i * 0.15}s`} repeatCount="indefinite"/>
        </rect>
      ))}
      <text x="20"  y="20" fontSize="9" fontFamily="JetBrains Mono, monospace" fill="#5ed4e8" letterSpacing="0.08em">BT</text>
      <text x="110" y="20" fontSize="9" fontFamily="JetBrains Mono, monospace" fill="#e8a554" letterSpacing="0.08em">DUAL</text>
      <text x="220" y="20" fontSize="9" fontFamily="JetBrains Mono, monospace" fill="#e26a52" letterSpacing="0.08em">RT</text>
    </svg>
  );
}

const STATION_PREVIEWS = {
  rag: RagPreview,
  lab: LabPreview,
  osint: OsintPreview,
  stack: StackPreview
};

Object.assign(window, { MainHubSection, OpsTerminal });
