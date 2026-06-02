// app.jsx — main shell with hash-based view routing
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "green",
  "density": "regular"
}/*EDITMODE-END*/;

const ACCENT_MAP = {
  green:  { acc: "#5ae39b", dim: "#3aa674", bg: "rgba(90,227,155,.12)",  oacc: "oklch(0.84 0.17 150)", odim: "oklch(0.65 0.12 150)", obg: "oklch(0.84 0.17 150 / .12)" },
  cyan:   { acc: "#5ed4e8", dim: "#3da3b8", bg: "rgba(94,212,232,.12)",  oacc: "oklch(0.84 0.13 215)", odim: "oklch(0.65 0.10 215)", obg: "oklch(0.84 0.13 215 / .12)" },
  amber:  { acc: "#e8a554", dim: "#b67c38", bg: "rgba(232,165,84,.12)",  oacc: "oklch(0.84 0.16 75)",  odim: "oklch(0.65 0.12 75)",  obg: "oklch(0.84 0.16 75 / .12)" },
  violet: { acc: "#b58cf2", dim: "#8366c2", bg: "rgba(181,140,242,.12)", oacc: "oklch(0.78 0.16 305)", odim: "oklch(0.60 0.12 305)", obg: "oklch(0.78 0.16 305 / .12)" }
};

const __supportsOklch = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('color', 'oklch(0.5 0.1 150)');
const DETAIL_VIEWS = ['rag', 'lab', 'osint', 'stack'];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const data = window.PORTFOLIO_DATA;

  const [cpOpen, setCpOpen] = React.useState(false);
  const [view, setView] = React.useState(() => {
    const h = window.location.hash.replace('#', '');
    return DETAIL_VIEWS.includes(h) ? h : 'landing';
  });
  const [direction, setDirection] = React.useState('forward');
  const prevViewRef = React.useRef(view);

  // hash → view
  React.useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace('#', '');
      const prev = prevViewRef.current;
      if (DETAIL_VIEWS.includes(h)) {
        // compute direction relative to previous
        const prevIdx = DETAIL_VIEWS.indexOf(prev);
        const nextIdx = DETAIL_VIEWS.indexOf(h);
        if (prevIdx >= 0 && nextIdx >= 0) {
          setDirection(nextIdx >= prevIdx ? 'forward' : 'backward');
        } else {
          setDirection('forward');
        }
        prevViewRef.current = h;
        setView(h);
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        const wasDetail = DETAIL_VIEWS.includes(prev);
        prevViewRef.current = 'landing';
        setView('landing');
        // Smooth scroll to section anchors on landing
        if (!wasDetail && h) {
          setTimeout(() => {
            const el = document.querySelector(`#${h}`);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        } else if (wasDetail) {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      }
    };
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
    // eslint-disable-next-line
  }, []);

  React.useEffect(() => {
    const a = ACCENT_MAP[t.accent] || ACCENT_MAP.green;
    const root = document.documentElement.style;
    root.setProperty('--acc', __supportsOklch ? a.oacc : a.acc);
    root.setProperty('--acc-dim', __supportsOklch ? a.odim : a.dim);
    root.setProperty('--acc-bg', __supportsOklch ? a.obg : a.bg);
  }, [t.accent]);

  React.useEffect(() => {
    const map = { compact: '78px', regular: '110px', comfy: '140px' };
    document.querySelectorAll('section.block').forEach(s => {
      s.style.paddingTop = map[t.density];
      s.style.paddingBottom = map[t.density];
    });
  }, [t.density]);

  // command palette items
  const cpItems = React.useMemo(() => [
    { id: 'nav-hero',     ic: '~',   label: 'Inicio',                sub: 'volver al hero',            kind: 'land', to: '' },
    { id: 'nav-eco',      ic: '◎',   label: 'Ecosistema',            sub: 'mapa principal',            kind: 'land', to: 'ecosystem' },
    { id: 'sec-rag',      ic: 'RAG', label: '01 · CyberSec RAG',     sub: 'pipeline · 4 146 chunks',   kind: 'detail', to: 'rag' },
    { id: 'sec-lab',      ic: 'LAB', label: '02 · CyberSec Lab',     sub: 'kill chain · 6 fases',      kind: 'detail', to: 'lab' },
    { id: 'sec-osint',    ic: 'OS',  label: '03 · OSINT Framework',  sub: '1 169 herramientas',        kind: 'detail', to: 'osint' },
    { id: 'sec-stack',    ic: 'STK', label: '04 · Stack operativo',  sub: 'blue ↔ red',                kind: 'detail', to: 'stack' },
    { id: 'sec-career',   ic: '⏵',   label: 'Trayectoria',           sub: 'Bullhost · Ausarta · Evolve', kind: 'land', to: 'career' },
    { id: 'sec-contact',  ic: '@',   label: 'Contacto',              sub: 'email · linkedin · github', kind: 'land', to: 'contact' },
    { id: 'go-github',    ic: '↗',   label: 'GitHub · cybersec-rag', sub: data.github,                 kind: 'ext',  to: data.github },
    { id: 'go-linkedin',  ic: '↗',   label: 'LinkedIn',              sub: 'profesional',               kind: 'ext',  to: data.linkedin },
    { id: 'go-devto',     ic: '↗',   label: 'Dev.to · RAG breakdown',sub: 'cómo lo construí',          kind: 'ext',  to: data.devto },
    { id: 'mail',         ic: '@',   label: 'Enviar email',          sub: data.email,                  kind: 'ext',  to: `mailto:${data.email}` }
  ], [data]);

  const runCp = React.useCallback((it) => {
    if (it.kind === 'land') {
      setCpOpen(false);
      window.location.hash = it.to || '';
    } else if (it.kind === 'detail') {
      setCpOpen(false);
      window.location.hash = it.to;
    } else if (it.kind === 'ext') {
      window.open(it.to, '_blank', 'noopener');
      setCpOpen(false);
    }
  }, []);

  // global hotkeys
  React.useEffect(() => {
    const onKey = (e) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === 'k') { e.preventDefault(); setCpOpen(o => !o); }
      else if (e.key === '/' && !cpOpen && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault(); setCpOpen(true);
      } else if (e.key === 'Escape' && DETAIL_VIEWS.includes(view)) {
        window.location.hash = '';
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cpOpen, view]);

  const isDetail = DETAIL_VIEWS.includes(view);

  return (
    <React.Fragment>
      <Nav />
      {isDetail ? (
        <div key={view} className={`detail-transition detail-transition-${direction}`}>
          <DetailView id={view} data={data} />
        </div>
      ) : (
        <React.Fragment>
          <Hero data={data} />
          <MainHubSection data={data} />
          <CareerSection data={data} />
          <ContactSection data={data} />
          <Footer data={data} />
        </React.Fragment>
      )}

      <button className="cp-hint" onClick={() => setCpOpen(true)} title="Command palette">
        <span>command palette</span>
        <kbd>⌘</kbd><kbd>K</kbd>
      </button>

      <CommandPalette open={cpOpen} onClose={() => setCpOpen(false)} items={cpItems} onRun={runCp} />

      <TweaksPanel>
        <TweakSection label="Apariencia" />
        <TweakRadio
          label="Acento"
          value={t.accent}
          options={['green', 'cyan', 'amber', 'violet']}
          onChange={(v) => setTweak('accent', v)}
        />
        <TweakRadio
          label="Densidad"
          value={t.density}
          options={['compact', 'regular', 'comfy']}
          onChange={(v) => setTweak('density', v)}
        />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
