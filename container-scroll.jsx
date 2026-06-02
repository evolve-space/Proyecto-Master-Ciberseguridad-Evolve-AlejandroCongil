// container-scroll.jsx — Aceternity-style scroll-driven reveal without framer-motion
const { useState: useSC, useEffect: useEC, useRef: useRC, useLayoutEffect: useLC } = React;

// Reads scroll progress 0..1 for a target element
function useScrollProgress(ref) {
  const [p, setP] = useSC(0);
  useEC(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = r.height - vh; // distance the section travels through viewport
      const offset = -r.top; // how much we have scrolled into the section
      const raw = total > 0 ? offset / total : 0;
      setP(Math.max(0, Math.min(1, raw)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ref]);
  return p;
}

function lerp(a, b, t) { return a + (b - a) * t; }
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

// Mimics the Aceternity ContainerScroll component
function ContainerScroll({ titleComponent, children, height = '130vh' }) {
  const ref = useRC(null);
  const [isMobile, setIsMobile] = useSC(false);
  useEC(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const pRaw = useScrollProgress(ref);
  const p = easeOutCubic(pRaw);

  // Map progress → values
  const rotate    = lerp(18, 0, p);
  const scale     = isMobile ? lerp(0.78, 0.92, p) : lerp(1.04, 1, p);
  const translate = lerp(0, -80, p);

  return (
    <div className="cs-wrap" ref={ref} style={{ height }}>
      <div className="cs-sticky">
        <div className="cs-perspective">
          <div className="cs-header" style={{ transform: `translateY(${translate}px)` }}>
            {titleComponent}
          </div>
          <div
            className="cs-card"
            style={{
              transform: `rotateX(${rotate}deg) scale(${scale})`,
            }}
          >
            <div className="cs-inner">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ContainerScroll, useScrollProgress });
