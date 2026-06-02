# Alejandro Congil — Cybersecurity Portfolio

> Telecomunicaciones · SOC Analyst L2 · Cybersecurity Specialist. Construyendo inteligencia táctica con IA.

**Web publicada:** https://alexc-projects.github.io/Proyecto-Master-Ciberseguridad-Evolve-AlejandroCongil/

---

## Sobre este portfolio

Portfolio interactivo de un solo agente que reúne los proyectos del Máster en Ciberseguridad y la trayectoria profesional. Está pensado como una vista navegable rápida — sin scroll infinito, con paleta de comandos (`Ctrl/⌘ + K`), rutas por hash y vistas de detalle por sección.

### Secciones

- **01 · CyberSec RAG** — pipeline RAG con 4.146 chunks indexados sobre material del máster.
- **02 · CyberSec Lab** — kill chain en 6 fases con notas de ejecución.
- **03 · OSINT Framework** — catálogo navegable de 1.169 herramientas.
- **04 · Stack operativo** — herramientas blue team ↔ red team que uso a diario.
- **Trayectoria** — Bullhost · Ausarta · Evolve.
- **Contacto** — email, LinkedIn, GitHub, Dev.to.

### Atajos

- `Ctrl/⌘ + K` o `/` → abrir paleta de comandos.
- `Esc` → volver al hero desde una vista de detalle.
- Botón flotante inferior derecho → tweaks (acento de color y densidad).

---

## Tecnología

- **React 18** cargado por CDN (unpkg).
- **Babel Standalone** compilando los `.jsx` directamente en el navegador.
- **CSS plano** (`styles.css`), tipografías Geist y JetBrains Mono.
- **Sin build step**: no hay `npm install`, ni Vite, ni webpack. Los archivos se sirven tal cual desde GitHub Pages.

### Estructura

```
index.html              ← punto de entrada
styles.css              ← estilos globales
data.js                 ← contenido del portfolio (window.PORTFOLIO_DATA)
app.jsx                 ← shell principal y router por hash
main-hub.jsx            ← hub central del ecosistema
hub.jsx, ecosystems.jsx ← visualizaciones del ecosistema
sections.jsx            ← hero, trayectoria, contacto, footer
details.jsx             ← vistas de detalle (RAG · Lab · OSINT · Stack)
node-graphs.jsx         ← grafos de nodos animados
container-scroll.jsx    ← scroll suave / parallax
gradient-menu.jsx       ← menú de navegación
effects.jsx             ← efectos visuales reutilizables
tweaks-panel.jsx        ← panel de ajustes en tiempo real
```

---

## Despliegue

Este repositorio aloja dos cosas independientes:

| Rama | Contenido | Propósito |
| --- | --- | --- |
| `main` | Código del proyecto **CyberSec RAG** (Python, pipeline, ingest, etc.) | Trabajo en curso del proyecto. |
| `gh-pages` | Los 14 archivos estáticos de **este portfolio**. | Lo que sirve GitHub Pages. |

GitHub Pages está configurado en **Settings → Pages → Branch: `gh-pages` / `(root)`**. Cualquier push a `gh-pages` redespliega la web en 1-2 minutos.

### Actualizar el portfolio

```bash
git checkout gh-pages
# reemplazar/editar archivos
git add -A
git commit -m "Actualizar portfolio"
git push origin gh-pages
```

---

## Contacto

- **Email:** alejandro.congil5@gmail.com
- **LinkedIn:** https://www.linkedin.com/pulse/de-las-telecomunicaciones-al-red-team-cómo-uso-ia-mi-congil-sainz-z6h4e/
- **Medium:** https://medium.com/@alejandro.congil5/de-técnico-de-redes-a-red-teamer-la-ia-como-ventaja-competitiva-en-ciberseguridad-68975e56dd7d
- **Dev.to:** https://dev.to/evolve-space/como-construi-un-sistema-rag-para-convertirme-en-red-teamer-con-ia-proyecto-en-evolve-4b2m
