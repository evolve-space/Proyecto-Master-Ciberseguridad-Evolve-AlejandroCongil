// ecosystems.jsx — landing-only sections (Career + Contact). Hub & details are in their own files.
const { useState: useEcS2 } = React;

// Shared header used by hub-mini and others
function EcoHeader({ num, label, title, lede, centered = false }) {
  return (
    <div className={`eco-header ${centered ? 'eco-header-centered' : ''}`}>
      <div className="eco-num">/ {num}</div>
      <span className="eco-label">{label}</span>
      <h2 className="eco-title">{title}</h2>
      {lede && <p className="eco-lede">{lede}</p>}
    </div>
  );
}

function CareerSection({ data }) {
  const [tab, setTab] = React.useState('pro');
  const tabs = [
    { id: 'pro', label: 'Recorrido profesional', count: data.experience.length, accent: 'var(--acc)' },
    { id: 'edu', label: 'Recorrido académico',  count: data.education.length,  accent: '#5ed4e8' }
  ];

  return (
    <section className="eco-section container" id="career" data-screen-label="02 Career">
      <EcoHeader
        num="02"
        label="trayectoria"
        title="Experiencia y formación"
        lede="Dos años en telecomunicaciones que se convirtieron en la base para la transición a ciberseguridad."
        centered
      />
      <div className="career-tabs" role="tablist">
        {tabs.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`career-tab ${tab === t.id ? 'on' : ''} career-tab-${t.id}`}
            onClick={() => setTab(t.id)}
          >
            <span className="career-tab-dot"></span>
            <span className="career-tab-label">{t.label}</span>
            <span className="career-tab-count">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="career-stage">
        {tab === 'pro' && (
          <div className="timeline career-anim">
            {data.experience.map((e, i) => (
              <div key={i} className="tl-row">
                <div className="tl-date">{e.dateLabel}</div>
                <div className="tl-dot"></div>
                <div className="tl-card">
                  <div className="tl-role">
                    <h3>{e.role}</h3>
                    <span className={`status-pill ${e.status}`}>{e.status === "live" ? "● activo" : "completado"}</span>
                  </div>
                  <div className="tl-org">
                    <span className="org">{e.org}</span><span className="sep">·</span>{e.location}<span className="sep">·</span>
                    <span className="mono">{e.period}</span>
                  </div>
                  <p className="tl-desc">{e.desc}</p>
                  <div className="tl-tags">
                    {e.tags.map((t, j) => <span key={j} className="tag">{t}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'edu' && (
          <div className="timeline timeline-edu career-anim">
            {data.education.map((e, i) => (
              <div key={`edu-${i}`} className={`tl-row ${e.statusKind === "done" ? "past" : ""}`}>
                <div className="tl-date">{e.dateLabel}</div>
                <div className="tl-dot"></div>
                <div className="tl-card">
                  <div className="tl-role">
                    <h3>{e.title}</h3>
                    <span className={`status-pill ${e.statusKind}`}>{e.status}</span>
                  </div>
                  <div className="tl-org">
                    <span className="org">{e.org}</span><span className="sep">·</span>
                    <span className="mono">{e.period}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ContactSection({ data }) {
  return (
    <section className="eco-section container" id="contact" data-screen-label="03 Contact">
      <EcoHeader
        num="03"
        label="contacto"
        title="¿Hablamos?"
        lede="Abierto a oportunidades en Blue Team, análisis de amenazas y proyectos de ciberseguridad con IA."
        centered
      />
      <div className="contact-card">
        <div className="contact-grid">
          <div>
            <div className="contact-status"><span className="pulse"></span>Disponible para nuevas oportunidades</div>
            <p style={{ fontSize: 16.5, color: 'var(--fg-2)', margin: '20px 0 24px', maxWidth: '46ch' }}>
              La mejor forma de empezar una conversación: <strong style={{ color: 'var(--fg-1)' }}>un email</strong> con el contexto del proyecto.
            </p>
            <a href={`mailto:${data.email}`} className="btn btn-pri">Enviar email <span className="arrow">→</span></a>
            <div style={{ marginTop: 32 }}>
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fg-3)', margin: '0 0 14px', fontWeight: 500 }}>
                donde encontrarme
              </h4>
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
      </div>
    </section>
  );
}

Object.assign(window, { EcoHeader, CareerSection, ContactSection });
