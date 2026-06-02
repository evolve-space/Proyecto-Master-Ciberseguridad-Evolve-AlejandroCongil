// node-graphs.jsx — reusable MiniMap + per-section ecosystems
const { useState: useMS, useEffect: useME, useRef: useMR, useMemo: useMM } = React;

// ─────────────────────────────────────────────────────────────
// Icon library — Phosphor-style thin-stroke line icons (24x24 viewbox).
// All paths use stroke="currentColor", fill="none". The wrapper sets size/color.
// ─────────────────────────────────────────────────────────────
const ICONS = {
  // RAG
  video:    'M3 6 a2 2 0 0 1 2-2 h10 a2 2 0 0 1 2 2 v12 a2 2 0 0 1-2 2 H5 a2 2 0 0 1-2-2 z M17 9 l4-2 v10 l-4-2 z',
  doc:      'M14 3 H6 a2 2 0 0 0-2 2 v14 a2 2 0 0 0 2 2 h12 a2 2 0 0 0 2-2 V9 z M14 3 v6 h6 M8 13 h8 M8 17 h5',
  image:    'M4 5 a2 2 0 0 1 2-2 h12 a2 2 0 0 1 2 2 v14 a2 2 0 0 1-2 2 H6 a2 2 0 0 1-2-2 z M4 16 l4-4 4 4 6-6 2 2 M9 9 a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0 z',
  waveform: 'M3 12 h2 M7 8 v8 M11 4 v16 M15 7 v10 M19 10 v4 M21 12 h0',
  scan:     'M3 7 V5 a2 2 0 0 1 2-2 h2 M17 3 h2 a2 2 0 0 1 2 2 v2 M21 17 v2 a2 2 0 0 1-2 2 h-2 M7 21 H5 a2 2 0 0 1-2-2 v-2 M3 12 h18',
  eye:      'M1 12 s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8 z M12 15 a3 3 0 1 0 0-6 3 3 0 0 0 0 6 z',
  chunk:    'M4 4 h6 v6 H4 z M14 4 h6 v6 h-6 z M4 14 h6 v6 H4 z M14 14 h6 v6 h-6 z',
  vector:   'M12 2 v6 M12 16 v6 M2 12 h6 M16 12 h6 M5 5 l4 4 M15 15 l4 4 M19 5 l-4 4 M9 15 l-4 4',
  db:       'M4 6 c0-1.7 3.6-3 8-3 s8 1.3 8 3 v12 c0 1.7-3.6 3-8 3 s-8-1.3-8-3 z M4 6 c0 1.7 3.6 3 8 3 s8-1.3 8-3 M4 12 c0 1.7 3.6 3 8 3 s8-1.3 8-3',
  ai:       'M12 2 a8 8 0 0 0-8 8 c0 2.5 1 4.7 3 6 v3 a2 2 0 0 0 2 2 h6 a2 2 0 0 0 2-2 v-3 c2-1.3 3-3.5 3-6 a8 8 0 0 0-8-8 z M9 12 a3 3 0 1 0 6 0 a3 3 0 1 0-6 0 z M9 21 h6',
  // OSINT
  at:       'M16 12 a4 4 0 1 1-8 0 4 4 0 0 1 8 0 z M16 8 v5 c0 1.7 1.3 3 3 3 s3-1.3 3-3 v-1 c0-5.5-4.5-10-10-10 S2 6.5 2 12 s4.5 10 10 10 c2.5 0 4.8-.9 6.6-2.4',
  mail:     'M3 7 a2 2 0 0 1 2-2 h14 a2 2 0 0 1 2 2 v10 a2 2 0 0 1-2 2 H5 a2 2 0 0 1-2-2 z M3 7 l9 6 9-6',
  globe:    'M12 2 a10 10 0 1 0 0 20 10 10 0 0 0 0-20 z M2 12 h20 M12 2 a15 15 0 0 1 0 20 M12 2 a15 15 0 0 0 0 20',
  network:  'M5 9 a3 3 0 1 0 0-6 3 3 0 0 0 0 6 z M19 9 a3 3 0 1 0 0-6 3 3 0 0 0 0 6 z M12 21 a3 3 0 1 0 0-6 3 3 0 0 0 0 6 z M7 7 l3 8 M17 7 l-3 8',
  cloud:    'M7 18 a4 4 0 0 1 0-8 6 6 0 0 1 11.5 2 A3.5 3.5 0 0 1 18 18 z',
  chat:     'M3 7 a2 2 0 0 1 2-2 h14 a2 2 0 0 1 2 2 v8 a2 2 0 0 1-2 2 H8 l-4 4 z M8 10 h8 M8 13 h5',
  hash:     'M4 9 h16 M4 15 h16 M9 4 l-2 16 M17 4 l-2 16',
  users:    'M9 11 a4 4 0 1 0 0-8 4 4 0 0 0 0 8 z M2 21 a7 7 0 0 1 14 0 M17 11 a3 3 0 1 0 0-6 M22 21 a6 6 0 0 0-5-6',
  // LAB phases
  shield:   'M12 2 l8 4 v6 c0 5-4 9-8 10 -4-1-8-5-8-10 V6 z M9 12 l2 2 4-4',
  search:   'M11 19 a8 8 0 1 0 0-16 8 8 0 0 0 0 16 z M21 21 l-5-5',
  bug:      'M9 8 V6 a3 3 0 0 1 6 0 v2 M5 11 h14 M5 15 h14 M12 8 v13 M5 11 a4 4 0 0 1 4-4 h6 a4 4 0 0 1 4 4 v6 a7 7 0 0 1-14 0 z M3 12 h2 M19 12 h2 M3 18 l3-2 M21 18 l-3-2',
  bolt:     'M13 2 L4 14 h7 l-1 8 9-12 h-7 z',
  ghost:    'M5 21 V8 a7 7 0 0 1 14 0 v13 l-2-2-2 2-2-2-2 2-2-2-2 2 z M9 11 v1 M15 11 v1',
  report:   'M14 3 H6 a2 2 0 0 0-2 2 v14 a2 2 0 0 0 2 2 h12 a2 2 0 0 0 2-2 V9 z M14 3 v6 h6 M8 13 h6 M8 17 h4 M16 17 h.01',
  // STACK
  badge:    'M12 2 l8 4 v6 c0 5-4 9-8 10 -4-1-8-5-8-10 V6 z',
  terminal: 'M3 5 a2 2 0 0 1 2-2 h14 a2 2 0 0 1 2 2 v14 a2 2 0 0 1-2 2 H5 a2 2 0 0 1-2-2 z M7 9 l3 3-3 3 M13 15 h4',
  crosshair:'M12 22 a10 10 0 1 0 0-20 10 10 0 0 0 0 20 z M12 4 v6 M12 14 v6 M2 12 h6 M16 12 h6',
  // Generic fallback
  dot:      'M12 12 m-2 0 a2 2 0 1 0 4 0 2 2 0 1 0-4 0 z'
};

function NodeIcon({ name, size = 16, color = 'currentColor' }) {
  const path = ICONS[name] || ICONS.dot;
  // Render as a translated <g> so caller positions us
  return (
    <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
  );
}

// helper to compute edge endpoint on circle edge + curved bezier control
function edgePath(A, B, rA, rB, fanOffsetA = 0, fanOffsetB = 0) {
  const dx = B.x - A.x, dy = B.y - A.y;
  const L = Math.sqrt(dx*dx + dy*dy) || 1;
  const nx = dx / L, ny = dy / L;
  // Perpendicular vector for fan-out
  const px = -ny, py = nx;
  // Start/end points pushed along the perpendicular for fan distribution at each node's edge
  // angle along perimeter:
  const angA = (fanOffsetA / Math.max(1, rA)); // in radians
  const angB = (fanOffsetB / Math.max(1, rB));
  // start
  const sCosA = Math.cos(angA), sSinA = Math.sin(angA);
  const sx = A.x + rA * (nx * sCosA + px * sSinA);
  const sy = A.y + rA * (ny * sCosA + py * sSinA);
  // end (rotated opposite direction to face back toward A)
  const sCosB = Math.cos(angB), sSinB = Math.sin(angB);
  const ex = B.x - rB * (nx * sCosB - px * sSinB);
  const ey = B.y - rB * (ny * sCosB - py * sSinB);
  // Control points: along the line, with slight perpendicular curve based on fan
  const ctrlOffset = (fanOffsetA + fanOffsetB) * 0.5;
  const mx = (sx + ex) / 2 + px * ctrlOffset * 1.5;
  const my = (sy + ey) / 2 + py * ctrlOffset * 1.5;
  return { sx, sy, ex, ey, mx, my, path: `M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}` };
}
// ─────────────────────────────────────────────────────────────
// Reusable MiniMap
// ─────────────────────────────────────────────────────────────
function MiniMap({
  nodes, edges, center,
  details = {},
  height = 380,
  emptyHint = 'Click cualquier nodo para inspeccionar',
  initialSelection = null,
  kindAccents = {}, // map kind -> color
  zones = null,     // optional [{ kind, x, y, w, h, color, label }]
  baseRadius = 20,  // default node radius
  centerRadius = 32 // center node radius
}) {
  const [hovered, setHovered] = useMS(null);
  const [selected, setSelected] = useMS(initialSelection);
  const W = 1000, H = 562;
  const focusId = selected || hovered;

  const adjacency = useMM(() => {
    const a = {};
    for (const [x, y] of edges) {
      (a[x] = a[x] || new Set()).add(y);
      (a[y] = a[y] || new Set()).add(x);
    }
    return a;
  }, [edges]);

  const nodeMap = useMM(() => Object.fromEntries(nodes.map(n => [n.id, n])), [nodes]);
  const selectedDetail = selected && details[selected];

  const colorFor = (n, isSelected, isLocked) => {
    if (isLocked) return 'var(--fg-3)';
    if (n.kind && kindAccents[n.kind]) return kindAccents[n.kind];
    if (n.id === center) return 'var(--acc)';
    return 'var(--acc)';
  };

  return (
    <div className="mm-wrap" style={{ minHeight: height }}>
      <div className="mm-svg-wrap" style={{ height }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id={`mmHalo-${center || 'na'}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--acc)" stopOpacity="0.45"/>
              <stop offset="100%" stopColor="var(--acc)" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="mmSelHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--acc)" stopOpacity="0.55"/>
              <stop offset="100%" stopColor="var(--acc)" stopOpacity="0"/>
            </radialGradient>
            <linearGradient id="mmBeam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"  stopColor="var(--acc)" stopOpacity="0"/>
              <stop offset="40%" stopColor="var(--acc)" stopOpacity="1"/>
              <stop offset="60%" stopColor="var(--acc)" stopOpacity="1"/>
              <stop offset="100%" stopColor="var(--acc)" stopOpacity="0"/>
              <animate attributeName="x1" values="-100%;100%" dur="2.6s" repeatCount="indefinite"/>
              <animate attributeName="x2" values="0%;200%" dur="2.6s" repeatCount="indefinite"/>
            </linearGradient>
            <pattern id="mmDots" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="var(--line)"/>
            </pattern>
            <filter id="mmGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <marker id="mmArrow" viewBox="0 0 10 10" refX="9" refY="5"
                    markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--acc)" opacity="0.85"/>
            </marker>
          </defs>

          <rect width={W} height={H} fill="url(#mmDots)" opacity="0.22"/>

          {/* optional zones (e.g. blue/dual/red bands) */}
          {zones && zones.map((z, i) => (
            <g key={i}>
              <rect x={(z.x/100)*W} y={(z.y/100)*H}
                    width={(z.w/100)*W} height={(z.h/100)*H}
                    rx="14"
                    fill={z.color} opacity="0.06"
                    stroke={z.color} strokeWidth="1" strokeOpacity="0.18" strokeDasharray="3 5"/>
              {z.label && (
                <text x={(z.x/100)*W + (z.w/100)*W/2} y={(z.y/100)*H + 22}
                      textAnchor="middle"
                      fontSize="10.5" fontFamily="JetBrains Mono, monospace"
                      fill={z.color} opacity="0.7"
                      letterSpacing="0.14em">{z.label.toUpperCase()}</text>
              )}
            </g>
          ))}

          {/* edges — drawn BEFORE nodes so circles sit on top */}
          {(() => {
            // Build fan distribution for each node: how many edges connect to it
            const fanCounters = {};
            const edgeMeta = edges.map(([a, b, opts = {}]) => {
              fanCounters[a] = (fanCounters[a] || 0) + 1;
              fanCounters[b] = (fanCounters[b] || 0) + 1;
              return { a, b, opts };
            });
            // Assign each edge an index per node for fan spread
            const fanIndices = {};
            const edgesWithFan = edgeMeta.map(e => {
              fanIndices[e.a] = (fanIndices[e.a] || 0);
              fanIndices[e.b] = (fanIndices[e.b] || 0);
              const ia = fanIndices[e.a]++;
              const ib = fanIndices[e.b]++;
              return { ...e, ia, ib, totalA: fanCounters[e.a], totalB: fanCounters[e.b] };
            });
            return edgesWithFan.map((e, i) => {
              const A = nodeMap[e.a], B = nodeMap[e.b];
              if (!A || !B) return null;
              const isCenterA = A.id === center;
              const isCenterB = B.id === center;
              const rA = (isCenterA ? centerRadius : baseRadius) + 2;
              const rB = (isCenterB ? centerRadius : baseRadius) + 2;
              const Ap = { x: (A.x/100)*W, y: (A.y/100)*H };
              const Bp = { x: (B.x/100)*W, y: (B.y/100)*H };
              // Fan offset: how many pixels along perimeter to spread
              const fanA = e.totalA > 1 ? (e.ia - (e.totalA - 1) / 2) * 6 : 0;
              const fanB = e.totalB > 1 ? (e.ib - (e.totalB - 1) / 2) * 6 : 0;
              const isActive = focusId && (e.a === focusId || e.b === focusId);
              const isDim = focusId && !isActive;
              const ep = edgePath(Ap, Bp, rA, rB, fanA, fanB);
              return (
                <g key={i}>
                  <path d={ep.path}
                    stroke={isDim ? 'var(--line-soft)' : 'var(--line)'}
                    strokeWidth="1"
                    fill="none"
                    opacity={isDim ? 0.18 : (isActive ? 0.5 : 0.55)}
                  />
                  {isActive && (
                    <path d={ep.path}
                      stroke="url(#mmBeam)"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      markerEnd={e.opts.arrow ? 'url(#mmArrow)' : undefined}
                      opacity="0.85"
                    />
                  )}
                  {!isActive && e.opts.arrow && (
                    <path d={ep.path}
                      stroke="transparent" strokeWidth="1"
                      fill="none"
                      markerEnd="url(#mmArrow)" opacity="0.5"
                    />
                  )}
                </g>
              );
            });
          })()}

          {/* center halo */}
          {center && nodeMap[center] && (
            <circle cx={(nodeMap[center].x/100)*W} cy={(nodeMap[center].y/100)*H} r="100" fill={`url(#mmHalo-${center})`}>
              <animate attributeName="r" values="80;115;80" dur="3.4s" repeatCount="indefinite"/>
            </circle>
          )}

          {/* selected halo */}
          {selected && selected !== center && nodeMap[selected] && (
            <circle cx={(nodeMap[selected].x/100)*W} cy={(nodeMap[selected].y/100)*H} r="60" fill="url(#mmSelHalo)">
              <animate attributeName="r" values="42;68;42" dur="2s" repeatCount="indefinite"/>
            </circle>
          )}

          {/* nodes — drawn LAST so they sit above edges */}
          {nodes.map(n => {
            const cx = (n.x/100)*W, cy = (n.y/100)*H;
            const isCenter = n.id === center;
            const isSelected = selected === n.id;
            const isHovered = hovered === n.id;
            const isLocked = n.state === 'locked';
            const isActive = n.state === 'active';
            const isDim = focusId && focusId !== n.id && !adjacency[focusId]?.has(n.id) && focusId !== n.id;
            const r = isCenter ? centerRadius : (isSelected ? baseRadius + 4 : (isHovered ? baseRadius + 2 : baseRadius));
            const stroke = colorFor(n, isSelected, isLocked);
            const accent = stroke;
            const iconSize = r * 0.85;

            return (
              <g key={n.id}
                onMouseEnter={() => setHovered(n.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(prev => prev === n.id ? null : n.id)}
                style={{ cursor: isLocked ? 'not-allowed' : 'pointer', opacity: isDim ? 0.32 : 1, transition: 'opacity .25s' }}>
                {/* solid bg disc to mask edges that pass behind */}
                <circle cx={cx} cy={cy} r={r+2} fill="var(--bg-0)"/>
                {/* idle pulse ring */}
                {!isLocked && !isSelected && (
                  <circle cx={cx} cy={cy} r={r+4}
                          fill="none"
                          stroke={stroke}
                          strokeWidth="1.2"
                          opacity="0">
                    <animate attributeName="r" values={`${r+4};${r+14};${r+4}`} dur="2.6s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.45;0;0.45" dur="2.6s" repeatCount="indefinite"/>
                  </circle>
                )}
                {/* outer halo ring */}
                <circle cx={cx} cy={cy} r={r+10}
                        fill="none"
                        stroke={stroke}
                        strokeWidth="1"
                        opacity={isSelected ? 0.65 : (isHovered ? 0.4 : 0.22)}
                        style={{ transition: 'opacity .2s' }}/>
                {/* button-style body with double border */}
                <circle cx={cx} cy={cy} r={r+1}
                        fill="none"
                        stroke={stroke}
                        strokeWidth="0.6"
                        opacity={isSelected || isHovered ? 0.6 : 0.25}/>
                <circle cx={cx} cy={cy} r={r}
                        fill={isSelected ? 'rgba(255,255,255,0.04)' : 'var(--bg-1)'}
                        stroke={stroke}
                        strokeWidth={isCenter ? 2.6 : (isSelected || isHovered ? 2.4 : 1.8)}
                        filter={isSelected || isActive ? 'url(#mmGlow)' : undefined}
                        style={{ transition: 'stroke-width .2s' }}/>
                {/* click affordance — small caret on hover */}
                {!isLocked && isHovered && !isSelected && (
                  <text x={cx + r - 4} y={cy - r + 6}
                        textAnchor="middle" dominantBaseline="central"
                        fontSize="8" fontFamily="JetBrains Mono, monospace"
                        fill={accent} opacity="0.85">↗</text>
                )}
                {isLocked && (
                  <g style={{ pointerEvents: 'none' }}>
                    {/* small lock badge in top-right corner */}
                    <circle cx={cx + r * 0.7} cy={cy - r * 0.7} r="7"
                            fill="var(--bg-0)" stroke="var(--fg-3)" strokeWidth="1"/>
                    <g transform={`translate(${cx + r * 0.7 - 4}, ${cy - r * 0.7 - 4}) scale(${8/24})`}>
                      <path d="M7 11 V7 a5 5 0 0 1 10 0 v4 M5 11 h14 a2 2 0 0 1 2 2 v7 a2 2 0 0 1-2 2 H5 a2 2 0 0 1-2-2 v-7 a2 2 0 0 1 2-2 z"
                            fill="none" stroke="var(--fg-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                  </g>
                )}
                {/* dashed ring around locked nodes */}
                {isLocked && (
                  <circle cx={cx} cy={cy} r={r+5}
                          fill="none"
                          stroke="var(--fg-3)"
                          strokeWidth="1"
                          strokeDasharray="3 4"
                          opacity="0.4"/>
                )}
                {isActive && (
                  <circle cx={cx} cy={cy} r="6" fill={accent}>
                    <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite"/>
                  </circle>
                )}
                {/* icon: prefer glyph (line-icon), fallback to legacy icon text */}
                {!isActive && n.glyph && (
                  <g transform={`translate(${cx - iconSize/2}, ${cy - iconSize/2}) scale(${iconSize / 24})`}
                     opacity={isLocked ? 0.35 : 1}>
                    <NodeIcon name={n.glyph} color={isLocked ? 'var(--fg-3)' : stroke}/>
                  </g>
                )}
                {!isActive && !n.glyph && n.icon && (
                  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
                        fontSize={isCenter ? 13 : 11}
                        fontFamily="JetBrains Mono, monospace"
                        fill={isLocked ? 'var(--fg-3)' : stroke}
                        opacity={isLocked ? 0.35 : 1}
                        letterSpacing="0.06em"
                        fontWeight="700">{n.icon}</text>
                )}
                <text x={cx} y={cy + r + 22} textAnchor="middle"
                      fontSize={isCenter ? 14 : 13}
                      fontFamily="Geist, sans-serif"
                      fontWeight={isSelected || isCenter ? 600 : 500}
                      fill={isLocked ? 'var(--fg-3)' : (isDim ? 'var(--fg-3)' : 'var(--fg-0)')}
                      letterSpacing="-0.005em">{n.label}</text>
                {n.sub && (
                  <text x={cx} y={cy + r + 38} textAnchor="middle"
                        fontSize="10.5"
                        fontFamily="JetBrains Mono, monospace"
                        fill={isSelected || isHovered ? accent : 'var(--fg-3)'}
                        opacity={isSelected || isHovered ? 0.85 : 1}
                        letterSpacing="0.02em"
                        style={{ transition: 'fill .2s' }}>{n.sub}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mm-detail">
        {selectedDetail ? (
          <div className="mm-d-card">
            <div className="mm-d-hd">
              <span className="mm-d-kind">{selectedDetail.kind || 'detalle'}</span>
              <button className="mm-d-x" onClick={() => setSelected(null)}>✕</button>
            </div>
            <h5 className="mm-d-title">{selectedDetail.title}</h5>
            {selectedDetail.sub && <div className="mm-d-sub">{selectedDetail.sub}</div>}
            {selectedDetail.body && <div className="mm-d-body" dangerouslySetInnerHTML={{__html: selectedDetail.body}} />}
            {selectedDetail.tags && (
              <div className="np-tags" style={{ marginTop: 12 }}>
                {selectedDetail.tags.map((t,i) => <span key={i} className="np-tag">{t}</span>)}
              </div>
            )}
          </div>
        ) : (
          <div className="mm-empty">
            <span className="mm-empty-dot"></span>
            <span>{emptyHint}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1) OSINT — 9 categorías orbitando
// ─────────────────────────────────────────────────────────────
const OSINT_GRAPH = {
  center: 'osint',
  nodes: [
    { id: 'osint',    x: 50, y: 50, label: 'OSINT',       sub: '1 169 tools', glyph: 'crosshair' },
    { id: 'username', x: 50, y: 12, label: 'Username',    sub: '19 tools',    glyph: 'at' },
    { id: 'email',    x: 78, y: 22, label: 'Email',       sub: '30 tools',    glyph: 'mail' },
    { id: 'domain',   x: 92, y: 50, label: 'Domain',      sub: '146 tools',   glyph: 'globe' },
    { id: 'ip',       x: 78, y: 78, label: 'IP / MAC',    sub: '56 tools',    glyph: 'network' },
    { id: 'images',   x: 50, y: 88, label: 'Imágenes',    sub: '94 tools',    glyph: 'image' },
    { id: 'social',   x: 22, y: 78, label: 'Social',      sub: '70 tools',    glyph: 'hash' },
    { id: 'cloud',    x: 8,  y: 50, label: 'Cloud',       sub: '23 tools',    glyph: 'cloud' },
    { id: 'msg',      x: 22, y: 22, label: 'Mensajería',  sub: '21 tools',    glyph: 'chat' }
  ],
  edges: [
    ['osint','username'],['osint','email'],['osint','domain'],
    ['osint','ip'],['osint','images'],['osint','social'],
    ['osint','cloud'],['osint','msg']
  ],
  details: {
    osint:    { kind: 'núcleo',    title: 'OSINT Framework',   sub: 'Justin Nordine · 33 categorías · 1 169 herramientas', body: 'El árbol completo. Cada nodo orbitando representa un grupo de herramientas que estoy mapeando.' },
    username: { kind: 'categoría', title: '19 herramientas',   sub: 'Username discovery',     body: 'Búsqueda de un mismo username en redes y dominios. <strong>Sherlock</strong> automatiza 400+ sitios, <strong>WhatsMyName</strong> mantiene una BD comunitaria, <strong>Namechk</strong> verifica disponibilidad.', tags: ['Sherlock','WhatsMyName','Namechk','KnowEm','Maigret'] },
    email:    { kind: 'categoría', title: '30 herramientas',   sub: 'Email intelligence',     body: 'Validación, leaks históricos y footprinting por email. <strong>HaveIBeenPwned</strong>, <strong>EmailRep</strong>, <strong>theHarvester</strong> son referencia obligada.', tags: ['HaveIBeenPwned','EmailRep','Hunter','theHarvester','EmailHippo'] },
    domain:   { kind: 'categoría', title: '146 herramientas',  sub: 'la categoría más densa', body: 'Whois, DNS, certificados, subdominios, archive. Aquí es donde más herramientas convergen — el hub real del recon.', tags: ['crt.sh','Whois','dnsdumpster','Subfinder','SecurityTrails','Censys'] },
    ip:       { kind: 'categoría', title: '56 herramientas',   sub: 'IP & MAC',               body: 'Geolocalización, ASN, port scanning pasivo, IoT mapping. <strong>Shodan</strong> y <strong>Censys</strong> son los pilares.', tags: ['Shodan','Censys','GreyNoise','ipinfo','BinaryEdge'] },
    images:   { kind: 'categoría', title: '94 herramientas',   sub: 'Images / Videos / Docs', body: 'Reverse image search, EXIF, geolocalización, metadata extraction. <strong>FOCA</strong> sigue siendo brutal para docs corporativos.', tags: ['FOCA','TinEye','Yandex','EXIF.tools','ExifTool'] },
    social:   { kind: 'categoría', title: '70 herramientas',   sub: 'Social Networks',        body: 'Análisis de perfiles, scraping, relaciones, sentiment. Cada red tiene sus tools específicas.', tags: ['Maltego','SocialSearcher','OSINT.industries','Twint'] },
    cloud:    { kind: 'categoría', title: '23 herramientas',   sub: 'Cloud Infrastructure',   body: 'Buckets expuestos, configuraciones públicas, claves filtradas en S3/Azure/GCP. Zona de hallazgos críticos.', tags: ['BucketCat','GrayHatWarfare','S3Scanner','Cloudfox'] },
    msg:      { kind: 'categoría', title: '21 herramientas',   sub: 'Instant Messaging',      body: 'Telegram, Discord, WhatsApp. Identificar grupos públicos, miembros, contenido scrapable.', tags: ['Telepathy','DiscordIntel','TGStat'] }
  }
};

// ─────────────────────────────────────────────────────────────
// 2) RAG — pipeline de datos (izquierda → derecha, 3 columnas)
// ─────────────────────────────────────────────────────────────
const RAG_GRAPH = {
  nodes: [
    // INGEST (left column)
    { id: 'src1', x: 12, y: 18, label: 'Vídeos',     sub: 'MP4',        glyph: 'video', kind: 'src' },
    { id: 'src2', x: 12, y: 50, label: 'Documentos', sub: 'PDF · MD',   glyph: 'doc',   kind: 'src' },
    { id: 'src3', x: 12, y: 82, label: 'Imágenes',   sub: 'PNG',        glyph: 'image', kind: 'src' },
    // PROCESS (col 2)
    { id: 'whisper', x: 34, y: 18, label: 'Whisper',       sub: 'speech-to-text', glyph: 'waveform', kind: 'proc' },
    { id: 'parse',   x: 34, y: 50, label: 'Parse / OCR',   sub: 'extract',        glyph: 'scan',     kind: 'proc' },
    { id: 'vision',  x: 34, y: 82, label: 'Claude Vision', sub: 'describe',       glyph: 'eye',      kind: 'proc' },
    // INDEX (col 3, vertical core)
    { id: 'chunk', x: 56, y: 35, label: 'Chunking',  sub: '1 500c · ov 200', glyph: 'chunk',  kind: 'core' },
    { id: 'embed', x: 56, y: 65, label: 'ONNX Embed',sub: 'local · 0 $',     glyph: 'vector', kind: 'core' },
    // OUTPUT (right)
    { id: 'store', x: 80, y: 35, label: 'ChromaDB',     sub: 'vector store', glyph: 'db', kind: 'out' },
    { id: 'llm',   x: 80, y: 65, label: 'Claude Sonnet',sub: 'SSE stream',   glyph: 'ai', kind: 'out' }
  ],
  edges: [
    ['src1','whisper',{arrow:true}], ['src2','parse',{arrow:true}], ['src3','vision',{arrow:true}],
    ['whisper','chunk',{arrow:true}], ['parse','chunk',{arrow:true}], ['vision','chunk',{arrow:true}],
    ['chunk','embed',{arrow:true}],
    ['embed','store',{arrow:true}], ['embed','llm',{arrow:true}],
    ['store','llm',{arrow:true}]
  ],
  zones: [
    { x: 2,  y: 6, w: 20, h: 90, color: '#5ae39b', label: 'fuentes' },
    { x: 24, y: 6, w: 20, h: 90, color: '#5ed4e8', label: 'proceso' },
    { x: 46, y: 22, w: 20, h: 60, color: '#e8a554', label: 'index' },
    { x: 68, y: 22, w: 20, h: 60, color: '#b58cf2', label: 'output' }
  ],
  details: {
    src1:    { kind: 'fuente',      title: 'Vídeos · MP4',         sub: 'sesiones de clase grabadas', body: 'Las clases del máster en MP4. <strong>ffmpeg</strong> extrae audio limpio para Whisper y stills clave para Claude Vision.' },
    src2:    { kind: 'fuente',      title: 'Documentos · PDF · MD', sub: 'apuntes y writeups',         body: 'PDFs del máster, mis writeups propios en Markdown, transcripciones de ponentes. Texto plano o estructurado.' },
    src3:    { kind: 'fuente',      title: 'Imágenes · PNG · ZIP', sub: 'screenshots y diagramas',    body: 'Capturas de las clases, diagramas de arquitectura, screenshots de laboratorios. Empaquetadas en ZIPs por sesión.' },
    whisper: { kind: 'procesado',   title: 'Whisper',              sub: 'speech-to-text de OpenAI',   body: 'Modelo local de transcripción. Convierte cada minuto de vídeo en texto con timestamps. Mejor calidad que cualquier alternativa cloud para español técnico.' },
    parse:   { kind: 'procesado',   title: 'Parse / OCR',          sub: 'PDF + Tesseract',            body: 'PyMuPDF para PDFs nativos, <strong>Tesseract</strong> para escaneados. Output: texto normalizado, sin headers ni footers basura.' },
    vision:  { kind: 'procesado',   title: 'Claude Vision',        sub: 'descripción de imagen',      body: 'Cada PNG se envía a Claude con prompt específico ("describe esta diapositiva de cybersec en detalle"). El texto descriptivo entra al pipeline.' },
    chunk:   { kind: 'storage',     title: 'Chunking',             sub: '1 500 caracteres · overlap 200', body: 'Fragmentación con overlap para no perder contexto en los cortes. El número clave es <strong>4 146</strong> chunks finales — eso es mi base de conocimiento.' },
    embed:   { kind: 'storage',     title: 'ONNX Embed',           sub: 'all-MiniLM local',           body: 'Embeddings 100% locales con ONNX Runtime. <strong>Cero coste de API</strong> y privacidad total. ~30ms por chunk en CPU.' },
    store:   { kind: 'salida',      title: 'ChromaDB',             sub: 'vector store local',         body: 'Base vectorial sobre disco. Búsqueda por similitud coseno. Persistente entre runs, indexada incrementalmente.' },
    llm:     { kind: 'salida',      title: 'Claude Sonnet',        sub: 'respuesta con citas',        body: 'Top-K chunks → contexto → Claude Sonnet. Respuesta streamed por SSE. Cada respuesta cita las sesiones específicas de origen.' }
  }
};

// ─────────────────────────────────────────────────────────────
// 3) Lab — 6 fases secuenciales (kill chain)
// ─────────────────────────────────────────────────────────────
const LAB_GRAPH = {
  nodes: [
    { id: 'p1', x: 8,  y: 42, label: '01 OSINT',         sub: 'activa',     glyph: 'search',    state: 'active' },
    { id: 'p2', x: 24.8, y: 42, label: '02 Recon activo',  sub: 'bloqueada',  glyph: 'crosshair', state: 'locked' },
    { id: 'p3', x: 41.6, y: 42, label: '03 Vuln scan',     sub: 'bloqueada',  glyph: 'bug',       state: 'locked' },
    { id: 'p4', x: 58.4, y: 42, label: '04 Explotación',   sub: 'bloqueada',  glyph: 'bolt',      state: 'locked' },
    { id: 'p5', x: 75.2, y: 42, label: '05 Post-exploit',  sub: 'bloqueada',  glyph: 'ghost',     state: 'locked' },
    { id: 'p6', x: 92,  y: 42, label: '06 Reporting',     sub: 'bloqueada',  glyph: 'report',    state: 'locked' }
  ],
  edges: [
    ['p1','p2',{arrow:true,dashed:true}],
    ['p2','p3',{arrow:true,dashed:true}],
    ['p3','p4',{arrow:true,dashed:true}],
    ['p4','p5',{arrow:true,dashed:true}],
    ['p5','p6',{arrow:true,dashed:true}]
  ],
  details: {
    p1: { kind: 'fase activa',   title: 'Fase 01 · Reconocimiento pasivo / OSINT', sub: 'sin tocar al objetivo', body: 'Mapeo exhaustivo de los <strong>1 169 herramientas</strong> del OSINT Framework. Cada herramienta probada genera un writeup que alimenta el RAG. <strong>9 categorías activas</strong> · 0% completado.', tags: ['Sherlock','Shodan','theHarvester','Maltego','FOCA'] },
    p2: { kind: 'fase bloqueada', title: 'Fase 02 · Reconocimiento activo',         sub: 'requiere completar 01', body: 'Port scanning, banner grabbing, fingerprinting. Aquí ya hay tráfico hacia el objetivo. <strong>Nmap</strong> en todas sus variantes, scripts NSE personalizados.', tags: ['Nmap','Masscan','dirsearch','Nikto'] },
    p3: { kind: 'fase bloqueada', title: 'Fase 03 · Análisis de vulnerabilidades',  sub: 'requiere completar 02', body: 'Scanners automáticos (Nessus, OpenVAS) cruzados con análisis manual. Validación de hallazgos contra contexto del recon.', tags: ['Nessus','OpenVAS','Nuclei','wpscan'] },
    p4: { kind: 'fase bloqueada', title: 'Fase 04 · Explotación',                    sub: 'requiere completar 03', body: 'Metasploit, payloads custom, técnicas evasivas. CVE específicas validadas en lab antes de uso real.', tags: ['Metasploit','msfvenom','SQLmap','Hydra'] },
    p5: { kind: 'fase bloqueada', title: 'Fase 05 · Post-explotación',               sub: 'requiere completar 04', body: 'Persistencia, escalada, lateral movement. Aquí es donde el operador demuestra su nivel — no en el shell inicial.', tags: ['Mimikatz','BloodHound','PowerShell','LinPEAS'] },
    p6: { kind: 'fase bloqueada', title: 'Fase 06 · Reporting & cleanup',            sub: 'requiere completar 05', body: 'Documentación ejecutiva, evidencias, narrativa técnica, recomendaciones. El entregable que justifica todo el engagement.', tags: ['markdown','severidad CVSS','MITRE ATT&CK'] }
  }
};

// ─────────────────────────────────────────────────────────────
// 4) Stack — Blue ↔ Red operator spectrum
// ─────────────────────────────────────────────────────────────
const STACK_GRAPH = {
  nodes: [
    // Blue Team
    { id: 'siem',      x: 18, y: 22, label: 'SIEM',         sub: 'Splunk',     glyph: 'shield',    kind: 'blue' },
    { id: 'edr',       x: 8,  y: 50, label: 'EDR',          sub: 'agentes',    glyph: 'badge',     kind: 'blue' },
    { id: 'sigma',     x: 18, y: 78, label: 'Sigma',        sub: 'detection',  glyph: 'scan',      kind: 'blue' },
    { id: 'hunt',      x: 30, y: 35, label: 'Threat Hunt',  sub: 'proactivo',  glyph: 'search',    kind: 'blue' },
    { id: 'forensics', x: 30, y: 65, label: 'Forensia',     sub: 'IR',         glyph: 'doc',       kind: 'blue' },
    // Dual-use core
    { id: 'wireshark', x: 50, y: 22, label: 'Wireshark',    sub: 'PCAP',       glyph: 'waveform',  kind: 'dual' },
    { id: 'kali',      x: 50, y: 50, label: 'Kali Linux',   sub: 'distro',     glyph: 'terminal',  kind: 'dual' },
    { id: 'python',    x: 50, y: 78, label: 'Python',       sub: 'glue',       glyph: 'chunk',     kind: 'dual' },
    // Red Team
    { id: 'nmap',      x: 70, y: 35, label: 'Nmap',         sub: 'recon',      glyph: 'crosshair', kind: 'red' },
    { id: 'burp',      x: 70, y: 65, label: 'Burp',         sub: 'web pen',    glyph: 'globe',     kind: 'red' },
    { id: 'meta',      x: 82, y: 22, label: 'Metasploit',   sub: 'exploit',    glyph: 'bolt',      kind: 'red' },
    { id: 'osintR',    x: 92, y: 50, label: 'OSINT',        sub: 'recon pas.', glyph: 'search',    kind: 'red' },
    { id: 'hydra',     x: 82, y: 78, label: 'Hydra',        sub: 'creds',      glyph: 'ghost',     kind: 'red' }
  ],
  edges: [
    // blue cluster
    ['siem','hunt'],['edr','hunt'],['sigma','hunt'],
    ['siem','forensics'],['edr','forensics'],
    ['hunt','wireshark'],['forensics','wireshark'],
    // dual bridges
    ['wireshark','kali'],['kali','python'],
    ['kali','nmap'],['kali','burp'],['python','meta'],['python','hydra'],
    // red cluster
    ['nmap','meta'],['burp','meta'],['osintR','nmap'],['hydra','meta']
  ],
  details: {
    siem:      { kind: 'Blue Team', title: 'SIEM · Splunk',        sub: 'detección y correlación',   body: 'Mi herramienta diaria en Bullhost. Reglas de correlación, dashboards de detección, queries SPL para threat hunting.' },
    edr:       { kind: 'Blue Team', title: 'EDR',                  sub: 'agentes en endpoints',      body: 'Visibilidad granular del comportamiento de procesos. Telemetría que alimenta hunting y forensia.' },
    sigma:     { kind: 'Blue Team', title: 'Sigma Rules',          sub: 'detection-as-code',         body: 'Escribir reglas portables. Una vez escritas en Sigma, se transforman a Splunk SPL, Elastic, KQL...' },
    hunt:      { kind: 'Blue Team', title: 'Threat Hunting',       sub: 'proactivo · hypothesis-driven', body: 'Más allá de las alertas. Hipótesis basadas en MITRE ATT&CK y CTI, cazadas con queries específicas.' },
    forensics: { kind: 'Blue Team', title: 'Forensia digital',     sub: 'IR profundo',               body: 'Cuando el incidente escala, hay que reconstruir línea de tiempo, identificar paciente cero y entender el alcance.' },
    wireshark: { kind: 'dual-use',  title: 'Wireshark',            sub: 'inspección de paquetes',    body: 'Herramienta puente. <strong>Blue</strong>: detectar exfil, anomalías de protocolo. <strong>Red</strong>: identificar servicios, validar covert channels.' },
    kali:      { kind: 'dual-use',  title: 'Kali Linux',           sub: 'sistema operativo',         body: 'Mi VM principal. Arsenal preconfigurado para ofensiva — pero igualmente útil en defensa para validar reglas y simular ataques.' },
    python:    { kind: 'dual-use',  title: 'Python',               sub: 'automatización',            body: 'El idioma común entre los dos lados. Scripts de parseo de logs en blue, exploits y tooling propio en red.' },
    nmap:      { kind: 'Red Team',  title: 'Nmap',                 sub: 'reconocimiento activo',     body: 'El bisturí del recon. Scripts NSE, fingerprinting fino, evasión de detección.' },
    burp:      { kind: 'Red Team',  title: 'Burp Suite',           sub: 'web app testing',           body: 'Proxy + repeater + intruder + scanner. Si la app es web, Burp es obligatorio.' },
    meta:      { kind: 'Red Team',  title: 'Metasploit',           sub: 'exploitation framework',    body: 'Para validar CVEs y montar payloads. msfvenom para custom shellcode.' },
    osintR:    { kind: 'Red Team',  title: 'OSINT',                sub: 'phase 01',                  body: 'Recon pasivo, footprinting, employee enumeration. El input de toda operación seria.' },
    hydra:     { kind: 'Red Team',  title: 'Hydra',                sub: 'credential attacks',        body: 'Brute force, password spray, dictionary attacks contra servicios.' }
  },
  kindAccents: {
    blue: '#5ed4e8',
    dual: '#e8a554',
    red:  '#e26a52'
  },
  zones: [
    { x: 2,  y: 6, w: 30, h: 90, color: '#5ed4e8', label: 'blue team' },
    { x: 34, y: 6, w: 32, h: 90, color: '#e8a554', label: 'dual-use' },
    { x: 68, y: 6, w: 30, h: 90, color: '#e26a52', label: 'red team' }
  ]
};

Object.assign(window, { MiniMap, OSINT_GRAPH, RAG_GRAPH, LAB_GRAPH, STACK_GRAPH, ICONS, NodeIcon });
