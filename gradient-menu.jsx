// gradient-menu.jsx — circular icons that expand on hover to reveal label + brand gradient
// Inspired by 21st.dev gradient-menu component.

const PLATFORM_PRESETS = {
  github:   { label: 'GitHub',   from: '#6e7681', to: '#1f2328' },
  linkedin: { label: 'LinkedIn', from: '#0a66c2', to: '#00a0dc' },
  devto:    { label: 'Dev.to',   from: '#0a0a0a', to: '#525252' },
  medium:   { label: 'Medium',   from: '#1a8917', to: '#0d5d0a' },
  twitter:  { label: 'X',        from: '#1d9bf0', to: '#0f1419' },
  email:    { label: 'Email',    from: '#ea4335', to: '#fbbc04' },
  phone:    { label: 'Teléfono', from: '#25d366', to: '#128c7e' },
  website:  { label: 'Web',      from: '#5ae39b', to: '#3aa674' },
  pdf:      { label: 'PDF',      from: '#e26a52', to: '#a64a3a' }
};

// Inline SVG icons (24px viewbox)
const PLATFORM_ICONS = {
  github: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.4 3.6 1 .1-.8.4-1.4.8-1.7-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.3-3.2-.1-.3-.6-1.6.1-3.3 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 3 .1 3.3.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.4 5.9.4.4.8 1.1.8 2.3v3.4c0 .3.2.7.8.6A12 12 0 0 0 12 0z"/></svg>
  ),
  linkedin: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.4 20.4h-3.5v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9v5.7H9.4V9h3.4v1.6h.1c.5-.9 1.6-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.5a2 2 0 1 1 0-4.1 2 2 0 0 1 0 4.1zM7 20.4H3.5V9H7v11.4zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 1 .8 1.7 1.8 1.7h20.4c1 0 1.8-.7 1.8-1.7V1.7c0-1-.8-1.7-1.8-1.7z"/></svg>
  ),
  devto: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M7.4 7.7c-.2-.2-.5-.3-1-.3h-.6v3.6h.6c.5 0 .8-.1 1-.3.2-.2.3-.6.3-1.5s-.1-1.3-.3-1.5zM18 0H6a6 6 0 0 0-6 6v12a6 6 0 0 0 6 6h12a6 6 0 0 0 6-6V6a6 6 0 0 0-6-6zM9 13c-.4.5-1.1.8-2 .8H4.6V6h2.5c.8 0 1.5.3 1.9.8.5.5.6 1.2.6 2.6 0 1.5-.1 2.2-.6 2.6zm5.6-5h-2.5v1.7H14v1.3h-1.9v1.7h2.5v1.3H11V6h3.6v1.3zm5.4 5.5c-.4.7-.8 1.1-1.3 1.1h-.1c-.5 0-1-.4-1.4-1.1l-1.6-7.4h1.5L17.7 13l1.7-6.9H21l-1.6 7.4z"/></svg>
  ),
  medium: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 12a6.7 6.7 0 1 1-13.4 0 6.7 6.7 0 0 1 13.4 0zm7.4 0c0 3.5-1.5 6.3-3.4 6.3s-3.4-2.8-3.4-6.3 1.5-6.3 3.4-6.3 3.4 2.8 3.4 6.3zm3.1 0c0 3.1-.5 5.6-1.2 5.6s-1.2-2.5-1.2-5.6.5-5.6 1.2-5.6 1.2 2.5 1.2 5.6z"/></svg>
  ),
  twitter: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.2 2H21l-7 8 8.2 12h-7L10 14l-6 8H1l7.5-9.7L0 2h7l5 7 6-7zM17 20l-2-3-7-10H6L17 20z"/></svg>
  ),
  email: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
  ),
  phone: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M22 16.9V20a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-17.6-17.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 2.4a2 2 0 0 1-.5 1.9L7.7 9.3a16 16 0 0 0 7 7l1.3-1.4a2 2 0 0 1 1.9-.5l2.4.5a2 2 0 0 1 1.7 2z"/></svg>
  ),
  website: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>
  ),
  pdf: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
  )
};

function GradientMenu({ items, size = 'md', align = 'flex-start', vertical = false, withText = false }) {
  return (
    <ul
      className={`gmenu gmenu-${size} ${vertical ? 'gmenu-vertical' : ''} ${withText ? 'gmenu-with-text' : ''}`}
      style={{ justifyContent: align }}
    >
      {items.map((it, i) => {
        const preset = PLATFORM_PRESETS[it.kind] || {};
        const icon = it.icon || PLATFORM_ICONS[it.kind];
        const label = it.label || preset.label || it.kind;
        const from = it.from || preset.from || 'var(--acc)';
        const to = it.to || preset.to || 'var(--acc-2)';
        const isExt = it.href && /^https?:/.test(it.href);
        const linkProps = {
          href: it.href,
          target: isExt ? '_blank' : undefined,
          rel: isExt ? 'noreferrer' : undefined,
          onClick: it.onClick,
          'aria-label': label
        };
        const linkContent = (
          <React.Fragment>
            <span className="gmenu-grad"></span>
            <span className="gmenu-glow"></span>
            <span className="gmenu-ic">{icon}</span>
            <span className="gmenu-lbl">{label}</span>
          </React.Fragment>
        );
        return (
          <li
            key={i}
            className="gmenu-item"
            style={{ '--gf': from, '--gt': to }}
            title={label}
          >
            <a {...linkProps}>{linkContent}</a>
            {withText && (
              <a {...linkProps} className="gmenu-cap">
                <span className="gmenu-cap-t">{it.title || label}</span>
                {it.description && <span className="gmenu-cap-d">{it.description}</span>}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

Object.assign(window, { GradientMenu, PLATFORM_ICONS, PLATFORM_PRESETS });
