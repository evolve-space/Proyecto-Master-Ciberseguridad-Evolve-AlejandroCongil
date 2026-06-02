// data.js — portfolio content data (global)
window.PORTFOLIO_DATA = {
  name: "Alejandro Congil Sainz",
  role: "Telecom · SOC Analyst L2 · Cybersecurity",
  location: "País Vasco, España",
  email: "alejandro.congil5@gmail.com",
  phone: "+34 671 32 83 52",
  phoneHref: "tel:+34671328352",
  linkedin: "https://www.linkedin.com/in/alejandro-congil-sainz-8ab231215/",
  github: "https://github.com/Alexc-projects/Proyecto-Master-Ciberseguridad-Evolve-AlejandroCongil",
  portfolio: "https://alexc-projects.github.io/Proyecto-Master-Ciberseguridad-Evolve-AlejandroCongil",
  devto: "https://dev.to/evolve-space/como-construi-un-sistema-rag-para-convertirme-en-red-teamer-con-ia-proyecto-en-evolve-4b2m",
  medium: "https://medium.com/@alejandro.congil5/de-t%C3%A9cnico-de-redes-a-red-teamer-la-ia-como-ventaja-competitiva-en-ciberseguridad-68975e56dd7d",
  linkedinPost: "https://www.linkedin.com/pulse/de-las-telecomunicaciones-al-red-team-c%C3%B3mo-uso-ia-mi-congil-sainz-z6h4e/",

  heroStats: [
    { n: 2, suffix: "", l: "Años en telecom", sub: "Ausarta · infraestructura" },
    { n: 4146, suffix: "", l: "Fragmentos RAG", sub: "22 sesiones indexadas" },
    { n: 1169, suffix: "", l: "Herramientas OSINT", sub: "33 categorías mapeadas" },
    { n: 2, suffix: "", l: "Nivel SOC", sub: "L2 · Bullhost desde 2026" }
  ],

  experience: [
    {
      role: "SOC Analyst L2",
      org: "Bullhost",
      location: "Bilbao, España",
      period: "Feb 2026 — Presente",
      dateLabel: "2026 — hoy",
      status: "live",
      desc: "Detección y análisis de incidentes en tiempo real. Correlación de eventos con SIEM, triage de alertas, gestión de vulnerabilidades y documentación de TTPs. Colaboración con L3 en análisis forense e investigación de amenazas avanzadas.",
      tags: ["SIEM", "Incident Response", "Threat Hunting", "MITRE ATT&CK", "Forensics"]
    },
    {
      role: "Técnico de Redes y Sistemas",
      org: "Ausarta Networks",
      location: "País Vasco, España",
      period: "Jun 2024 — Presente",
      dateLabel: "2024 — hoy",
      status: "live",
      desc: "Mantenimiento de infraestructura de red corporativa. Configuración de switches, routers y firewalls. Monitorización de servicios, resolución de incidencias y soporte técnico L1/L2.",
      tags: ["Cisco IOS", "Routing & Switching", "Firewalls", "VLANs", "Monitorización"]
    }
  ],

  education: [
    { period: "Feb 2026 — Presente", dateLabel: "2026 — hoy", title: "Máster en Ciberseguridad", org: "Evolve Academy", status: "En curso", statusKind: "live" },
    { period: "Sep 2025 — Presente", dateLabel: "2025 — hoy", title: "Especialización en Ciberseguridad en Entornos TI", org: "CIFP Tartanga", status: "En curso", statusKind: "live" },
    { period: "2023 — 2025", dateLabel: "2023 — 25", title: "TSSTI — Sistemas de Telecomunicaciones e Informáticos", org: "CIFP Tartanga", status: "Completado", statusKind: "done" },
    { period: "2021 — 2023", dateLabel: "2021 — 23", title: "Bachillerato de Ciencias y Tecnología", org: "IES Mungia", status: "Completado", statusKind: "done" }
  ],

  projectMetrics: [
    { n: "4 146", l: "Fragmentos indexados" },
    { n: "22", l: "Sesiones de clase" },
    { n: "1 169", l: "Herramientas OSINT" },
    { n: "33", l: "Categorías framework" }
  ],

  archSteps: [
    { num: "01", name: "Entrada", det: "ZIPs · MP4 · PDF · MD · PNG" },
    { num: "02", name: "Parseo", det: "OCR · Whisper · Claude Vision" },
    { num: "03", name: "Chunking", det: "1500 chars · overlap 200" },
    { num: "04", name: "Embeddings", det: "ONNX local · sin coste API" },
    { num: "05", name: "Vector store", det: "ChromaDB · local" },
    { num: "06", name: "LLM", det: "Claude Sonnet · SSE stream" },
    { num: "07", name: "Interfaces", det: "RAG · Lab · Framework" }
  ],

  phases: [
    { num: "01", name: "Recon. Pasivo / OSINT", state: "active", progress: "9 grupos · 35+ herramientas" },
    { num: "02", name: "Recon. Activo", state: "locked", progress: "Bloqueada" },
    { num: "03", name: "Análisis de Vulnerabilidades", state: "locked", progress: "Bloqueada" },
    { num: "04", name: "Explotación", state: "locked", progress: "Bloqueada" },
    { num: "05", name: "Post-Explotación", state: "locked", progress: "Bloqueada" },
    { num: "06", name: "Reporting & Cleanup", state: "locked", progress: "Bloqueada" }
  ],

  osintCats: [
    { name: "Username", count: 19, done: 0 },
    { name: "Email Address", count: 30, done: 0 },
    { name: "Domain Name", count: 146, done: 0 },
    { name: "Cloud Infrastructure", count: 23, done: 0 },
    { name: "IP & MAC Address", count: 56, done: 0 },
    { name: "Images / Videos / Docs", count: 94, done: 0 },
    { name: "Social Networks", count: 70, done: 0 },
    { name: "Instant Messaging", count: 21, done: 0 }
  ],

  skills: [
    {
      cat: "Blue Team / SOC", ic: "BT",
      items: [
        ["SIEM · Splunk", 4],
        ["Incident Response", 4],
        ["Threat Hunting", 3],
        ["MITRE ATT&CK", 4],
        ["Log Analysis", 4]
      ]
    },
    {
      cat: "OSINT & Recon", ic: "OS",
      items: [
        ["Shodan", 4],
        ["Maltego", 3],
        ["theHarvester", 4],
        ["Sherlock", 4],
        ["Recon-ng · FOCA", 3],
        ["Google Dorks", 4]
      ]
    },
    {
      cat: "Pentesting", ic: "PT",
      items: [
        ["Kali Linux", 4],
        ["Metasploit", 3],
        ["Nmap", 4],
        ["Burp Suite", 3],
        ["Nikto · Hydra", 3]
      ]
    },
    {
      cat: "Dev & Automatización", ic: "DV",
      items: [
        ["Python", 4],
        ["FastAPI", 4],
        ["ChromaDB", 4],
        ["Claude API", 5],
        ["Bash · PowerShell", 4]
      ]
    },
    {
      cat: "Redes & Infraestructura", ic: "NW",
      items: [
        ["TCP/IP", 5],
        ["Cisco IOS", 4],
        ["VLANs · Firewalls", 4],
        ["Wireshark", 4],
        ["DNS / DHCP", 5]
      ]
    },
    {
      cat: "Sistemas & Cloud", ic: "SY",
      items: [
        ["Linux", 5],
        ["Windows Server", 4],
        ["Active Directory", 4],
        ["Docker", 3],
        ["Azure · Virtualización", 3]
      ]
    }
  ],

  ragDemo: [
    {
      q: "Explícame qué es Bash con todo lo que has aprendido",
      sources: [
        "2026-04-27 · video_transcript",
        "2026-04-28 · video_transcript",
        "2026-04-24 · transcript",
        "2026-04-29 · transcript"
      ],
      title: "Bash: Explicación Técnica",
      body: [
        ["h5", "¿Qué es Bash?"],
        ["p", "Basándome en el material disponible, **Bash** (Bourne Again SHell) es un intérprete de comandos de sistemas Unix/Linux que actúa como interfaz entre el usuario y el sistema operativo."],
        ["h5", "Encadenamiento de comandos"],
        ["src", "Sesión 2026-04-24 · transcript"],
        ["p", "Bash permite encadenar comandos con `;` (siempre se ejecutan) y con `&&` (solo si el anterior tiene éxito). También soporta pipelines con `|` para encadenar la salida de un comando como entrada del siguiente."],
        ["h5", "Variables y entornos"],
        ["src", "Sesión 2026-04-27 · video_transcript"],
        ["p", "Las variables se declaran sin espacios (`VAR=valor`) y se expanden con `$VAR`. El entorno se gestiona con `export`, y los scripts heredan variables del shell padre. `env` y `printenv` permiten inspeccionar el contexto."]
      ]
    },
    {
      q: "¿Qué herramientas de OSINT he mapeado para username?",
      sources: ["framework · username", "transcript 2026-03-12", "writeup · sherlock"],
      title: "Username · 19 herramientas",
      body: [
        ["h5", "Categorías cubiertas"],
        ["p", "El nodo **Username** del OSINT Framework contiene **19 herramientas** en 2 subcategorías: `Search Engines` (12 herramientas) y `Specific Sites` (7 herramientas)."],
        ["h5", "Herramientas clave"],
        ["src", "writeup · sherlock"],
        ["p", "**Sherlock** automatiza la búsqueda de un username en 400+ sitios. **WhatsMyName** ofrece una base mantenida por la comunidad. **Namechk** verifica disponibilidad en redes sociales y dominios — útil tanto en blue team (impersonation) como en recon ofensivo."]
      ]
    },
    {
      q: "Resume las TTPs vistas en la última sesión de threat hunting",
      sources: ["2026-05-04 · transcript", "2026-05-04 · resumen", "MITRE ATT&CK"],
      title: "TTPs · sesión threat hunting",
      body: [
        ["h5", "Tácticas observadas"],
        ["p", "Se trabajaron 3 tácticas del framework MITRE: **Initial Access** (T1566 Phishing), **Execution** (T1059.001 PowerShell) y **Defense Evasion** (T1027 Obfuscated Files)."],
        ["h5", "Detección"],
        ["src", "Sesión 2026-05-04 · transcript"],
        ["p", "Para T1059.001 se discutió correlar `4104` (script block logging) con procesos hijos sospechosos vía Sysmon `EventID 1`. Las reglas Sigma asociadas se enlazaron al pipeline del SIEM."]
      ]
    }
  ]
};
