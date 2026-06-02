# -*- coding: utf-8 -*-
"""
Descarga el JSON de OSINT Framework y genera documento exhaustivo por fases.
Usa solo ASCII en las cadenas del script para evitar problemas de encoding.
"""
import sys, json, re, urllib.request

URL = "https://raw.githubusercontent.com/lockfale/OSINT-Framework/master/public/arf.json"
print("[->] Descargando " + URL)
with urllib.request.urlopen(URL, timeout=30) as r:
    raw = r.read().decode('utf-8')
data = json.loads(raw)
print("[OK] JSON descargado (%d KB)" % (len(raw)//1024))

# ---------------------------------------------------------------------------
# Phase assignment
# ---------------------------------------------------------------------------
PHASE_MAP = {
    "Username":                             1,
    "Email Address":                        1,
    "Domain Name":                          1,
    "People Search Engines":               1,
    "Social Networks":                      1,
    "Telephone Numbers":                    1,
    "Search Engines":                       1,
    "Online Communities":                   1,
    "Language Translation":                 1,
    "Encoding / Decoding":                  1,
    "OpSec":                                1,
    "AI Tools":                             1,
    "Documentation / Evidence Capture":    1,
    "Training":                             1,
    "IP & MAC Address":                     2,
    "Business Records":                     2,
    "Public Records":                       2,
    "Compliance & Risk Intelligence":       2,
    "Images / Videos / Docs":              2,
    "Archives":                             2,
    "Instant Messaging":                    2,
    "Dating":                               2,
    "Classifieds":                          2,
    "Cloud Infrastructure":                 3,
    "Geolocation Tools / Maps":            3,
    "Transportation":                       3,
    "Cyber Threat Intelligence":            4,
    "Malicious File Analysis":             4,
    "Dark Web":                             4,
    "Blockchain & Cryptocurrency":         4,
    "Disinformation & Media Verification": 4,
    "Mobile OSINT":                         5,
    "Tools":                                5,
}

PHASE_META = {
    1: (
        "FASE 1 -- RECONOCIMIENTO PASIVO & IDENTIDAD DIGITAL",
        "Mayo 2026 (ahora mismo)",
        "Solo herramientas web, sin instalacion. NO generan trafico hacia el objetivo.\n"
        "Perfectas para practicar mientras el master cubre Bash y Linux basico.\n"
        "PREREQUISITO DEL MASTER: ninguno -- empezar ya.",
    ),
    2: (
        "FASE 2 -- RECONOCIMIENTO ACTIVO, REDES & MEDIOS",
        "Junio 2026",
        "Herramientas que pueden generar trafico o requieren contexto tecnico.\n"
        "PREREQUISITO DEL MASTER: modulos de redes, auditoria web y escaneo.",
    ),
    3: (
        "FASE 3 -- INFRAESTRUCTURA, CLOUD & GEOLOCALIZACION",
        "Julio -- Agosto 2026",
        "Requieren entender networking y cloud.\n"
        "PREREQUISITO DEL MASTER: modulo de infraestructura y cloud.",
    ),
    4: (
        "FASE 4 -- AMENAZAS, DARK WEB & CRIPTOMONEDAS",
        "Septiembre -- Octubre 2026",
        "Nivel avanzado. Requieren entender malware, criptografia y dark web.\n"
        "PREREQUISITO DEL MASTER: modulo CTI, analisis de malware, dark web.",
    ),
    5: (
        "FASE 5 -- ESPECIALIZACION & HERRAMIENTAS AVANZADAS",
        "Noviembre 2026+",
        "Nivel experto. Forense movil, reversing, frameworks complejos.\n"
        "PREREQUISITO DEL MASTER: modulos finales del master.",
    ),
}

CAT_DESC = {
    "Username": (
        "Dado un alias/nickname, descubrir en que plataformas existe ese usuario.\n"
        "Primer paso en investigacion de personas. Cruza con Email y Social Networks."
    ),
    "Email Address": (
        "Dado un correo, extraer identidad, plataformas de registro, filtraciones y passwords expuestos.\n"
        "Flujo: dominio -> Hunter.io -> correos -> HIBP -> leaks -> reutilizacion de passwords."
    ),
    "Domain Name": (
        "Mapear infraestructura de un dominio: subdominios, IPs, tecnologias, historial DNS, certs SSL.\n"
        "En auditoria web, el primer paso SIEMPRE es enumerar el dominio objetivo."
    ),
    "People Search Engines": (
        "Buscar personas por nombre, telefono o direccion en bases de datos publicas compiladas.\n"
        "Util en ingenieria social para validar identidad. Combinar con Username y Email."
    ),
    "Social Networks": (
        "Extraer info de perfiles: posts, relaciones, geolocalizacion implicita, metadatos.\n"
        "LinkedIn->correo->Hunter; Instagram foto->EXIF->GPS; Twitter->historial->intereses."
    ),
    "Telephone Numbers": (
        "Identificar propietario de un numero, operadora y geolocalizacion aproximada.\n"
        "TrueCaller ya lo usas en clase. NumSpy automatiza el proceso desde terminal."
    ),
    "Search Engines": (
        "Busqueda avanzada: Google Dorks, motores especializados en codigo, FTP, papers.\n"
        "Los Dorks son la tecnica OSINT mas potente sin instalar nada."
    ),
    "Online Communities": (
        "Investigar en foros, IRC, Discord y Reddit. Encontrar actores, fugas y coordinacion.\n"
        "Clave para identificar personas por estilo de escritura o alias en foros."
    ),
    "Language Translation": (
        "Investigar fuentes en otros idiomas: foros rusos, chinos, dark web arabe.\n"
        "DeepL es significativamente mejor que Google Translate para contextos tecnicos."
    ),
    "Encoding / Decoding": (
        "Decodificar datos ofuscados en malware, exploits y trafico de red.\n"
        "CyberChef es la navaja suiza: Base64, hex, XOR, AES, rot13, todo en uno."
    ),
    "OpSec": (
        "Protegerte durante investigaciones: no dejar rastro, no revelar identidad real.\n"
        "REGLA: siempre VPN activa + verificar IP con miip() antes de cualquier operacion."
    ),
    "AI Tools": (
        "IA para acelerar analisis, detectar contenido IA-generado y automatizar correlaciones.\n"
        "Claude API ya esta integrada en tu RAG para analisis de informes."
    ),
    "Documentation / Evidence Capture": (
        "Capturar evidencias de forma integra y legalmente valida durante investigaciones.\n"
        "Siempre hashear screenshots para probar integridad: sha256sum screenshot.png."
    ),
    "Training": (
        "Recursos de formacion OSINT: guias, juegos, libros de referencia.\n"
        "Bellingcat y Michael Bazzell son los referentes mundiales del sector."
    ),
    "IP & MAC Address": (
        "Dado una IP: propietario ASN, puertos abiertos, servicios, reputacion, historial.\n"
        "Despues de encontrar dominio -> IP -> Shodan -> ver servicios expuestos -> vectores de ataque."
    ),
    "Business Records": (
        "Informacion corporativa: sede, filiales, empleados, finanzas, inversores.\n"
        "LinkedIn + OpenCorporates + Crunchbase = perfil completo de cualquier empresa."
    ),
    "Public Records": (
        "Registros gubernamentales: propiedades, antecedentes, patentes, votantes.\n"
        "En Espana: BORME (mercantil), Registro de la Propiedad, BOE."
    ),
    "Compliance & Risk Intelligence": (
        "Screening de sanciones, KYC/AML, beneficiarios reales de empresas opacas.\n"
        "Usado en investigacion de crimen organizado y blanqueo de capitales."
    ),
    "Images / Videos / Docs": (
        "Busqueda inversa de imagenes, extraccion de metadatos, analisis de documentos.\n"
        "FOCA extrae metadatos de PDFs/Word: autor, software, rutas de red internas."
    ),
    "Archives": (
        "Versiones antiguas de sitios, datasets filtrados, contenido borrado.\n"
        "Wayback Machine revela como era un sitio antes de que 'limpiaran' informacion."
    ),
    "Instant Messaging": (
        "Investigar cuentas en WhatsApp, Telegram, Signal, Discord, Slack.\n"
        "TrueCaller ya lo usas. Telegram OSINT permite ver grupos publicos y miembros."
    ),
    "Dating": (
        "Encontrar perfiles en apps de citas para identificar personas por foto o datos.\n"
        "Cruzar con otras redes sociales para confirmar identidad. Util en ingenieria social."
    ),
    "Classifieds": (
        "Investigar en anuncios clasificados: rastrear personas por patrones de venta.\n"
        "Buscar email o telefono en Wallapop/Milanuncios revela actividad historica."
    ),
    "Cloud Infrastructure": (
        "Enumerar recursos cloud: buckets S3 publicos, instancias expuestas, configs erroneas.\n"
        "GrayhatWarfare encuentra buckets S3 sin autenticar con datos sensibles."
    ),
    "Geolocation Tools / Maps": (
        "Geolocalizar imagenes, dispositivos y personas por pistas visuales o metadatos.\n"
        "Foto sin EXIF -> pistas visuales (edificios, senales) -> confirmar con Street View."
    ),
    "Transportation": (
        "Rastrear vehiculos, vuelos, barcos en tiempo real o historico.\n"
        "FlightRadar24 rastrea jets privados de objetivos de alto perfil."
    ),
    "Cyber Threat Intelligence": (
        "Analizar amenazas activas: IOCs, exploits, campanas de malware, TTPs de actores.\n"
        "MITRE ATT&CK es el marco de referencia: tacticas y tecnicas de todos los grupos APT."
    ),
    "Malicious File Analysis": (
        "Analizar malware: comportamiento, ofuscacion, comunicaciones C2, persistencia.\n"
        "Any.run permite ejecutar malware en sandbox interactivo y ver el comportamiento en vivo."
    ),
    "Dark Web": (
        "Investigar en red Tor: foros de hackers, marketplaces, filtraciones, infra criminal.\n"
        "REGLA: siempre VM aislada + Tor + VPN. Nunca desde el host principal."
    ),
    "Blockchain & Cryptocurrency": (
        "Rastrear transacciones crypto: wallets de ransomware, lavado de dinero, mixers.\n"
        "Bitcoin es pseudoanonimo: con blockchain explorers se pueden rastrear fondos."
    ),
    "Disinformation & Media Verification": (
        "Detectar deepfakes, verificar autenticidad de imagenes/videos/noticias.\n"
        "FotoForensics usa analisis ELA (Error Level Analysis) para detectar manipulacion."
    ),
    "Mobile OSINT": (
        "Analizar apps moviles, extraer metadatos de APKs, forense de dispositivos.\n"
        "MobSF hace analisis estatico y dinamico de APKs en busca de vulnerabilidades."
    ),
    "Tools": (
        "Frameworks y herramientas de automatizacion OSINT, VMs especializadas, wordlists.\n"
        "Maltego ya lo usas. Recon-ng es el framework OSINT mas completo para terminal."
    ),
}

# ---------------------------------------------------------------------------
# Tree traversal helpers
# ---------------------------------------------------------------------------
def children(node):    return node.get("children", [])
def name(node):        return node.get("name", "").strip()
def url(node):         return node.get("url", "").strip()
def is_folder(node):   return bool(children(node)) or not url(node)

FLAGS = ["(T)", "(D)", "(R$)", "(R)", "(M)", "($)"]

def extract_flags(n):
    found = [f for f in FLAGS if f in n]
    clean = n
    for f in FLAGS:
        clean = clean.replace(f, "")
    return clean.strip(), found

# ---------------------------------------------------------------------------
# Build phase buckets: phases[n] = list of (cat_name, sub_name, tools_list)
# tools_list = list of (clean_name, flags, url_str)
# ---------------------------------------------------------------------------
phases = {1: [], 2: [], 3: [], 4: [], 5: []}

for cat_node in children(data):
    cat_name = name(cat_node)
    phase = PHASE_MAP.get(cat_name, 5)
    cat_kids = children(cat_node)

    if not cat_kids:
        clean, flags = extract_flags(cat_name)
        phases[phase].append((cat_name, "_root_", [(clean, flags, url(cat_node))]))
        continue

    has_subs = any(is_folder(c) for c in cat_kids)

    if has_subs:
        for sub_node in cat_kids:
            sub_name = name(sub_node)
            sub_kids = children(sub_node)
            if sub_kids:
                tools = []
                for t in sub_kids:
                    t_n, t_u = name(t), url(t)
                    cl, fl = extract_flags(t_n)
                    t_kids = children(t)
                    if t_kids:
                        for t2 in t_kids:
                            c2, f2 = extract_flags(name(t2))
                            tools.append((c2, f2, url(t2)))
                    else:
                        tools.append((cl, fl, t_u))
                phases[phase].append((cat_name, sub_name, tools))
            else:
                cl, fl = extract_flags(sub_name)
                phases[phase].append((cat_name, "General", [(cl, fl, url(sub_node))]))
    else:
        tools = []
        for t in cat_kids:
            cl, fl = extract_flags(name(t))
            tools.append((cl, fl, url(t)))
        phases[phase].append((cat_name, "General", tools))

# ---------------------------------------------------------------------------
# Known tools (mark with [*])
# ---------------------------------------------------------------------------
KNOWN = {
    "hunter", "hunter.io", "have i been pwned", "haveibeenpwned",
    "maltego", "virustotal", "truecaller", "true caller",
    "phishguard", "sherlock", "osint industries",
}

def is_known(n):
    nl = n.lower()
    return any(k in nl for k in KNOWN)

# ---------------------------------------------------------------------------
# Render
# ---------------------------------------------------------------------------
SEP70 = "=" * 70
SEP40 = "-" * 40

lines = []
A = lines.append

A("# OSINT FRAMEWORK -- DOCUMENTO EXHAUSTIVO COMPLETO")
A("**Fuente:** https://osintframework.com/ (40 categorias, 1.000+ herramientas)")
A("**Generado:** 2026-05-02  |  **Estudiante:** Master Ciberseguridad -- Evolve Academy")
A("")
A("---")
A("")
A("## LEYENDA")
A("```")
A("[T]  = Requiere instalacion local en Kali Linux")
A("[D]  = Google Dork (busqueda avanzada en Google)")
A("[R]  = Requiere registro gratuito")
A("[$]  = De pago (suele tener tier gratuito)")
A("[R$] = Requiere registro + es de pago")
A("[M]  = URL que debes editar manualmente con el objetivo")
A("[*]  = Ya conocida / usada en clase de Evolve Academy")
A("[->] = Herramienta recomendada para empezar primero")
A("```")
A("")
A("---")
A("")
A("## TABLA DE FASES (ajustar segun avance del master)")
A("```")
A("FASE 1  Mayo 2026        Pasivo, identidad, sin instalacion -- EMPEZAR YA")
A("FASE 2  Junio 2026       Activo, redes, medios -- cuando el master cubra redes")
A("FASE 3  Jul-Ago 2026     Cloud, infraestructura, geo -- modulo cloud del master")
A("FASE 4  Sep-Oct 2026     CTI, dark web, crypto -- modulo amenazas del master")
A("FASE 5  Nov 2026+        Especializacion avanzada -- modulos finales")
A("```")
A("")
A("---")
A("")

rendered_cats = set()

for phase_num in [1, 2, 3, 4, 5]:
    title, date, desc = PHASE_META[phase_num]
    A(SEP70)
    A("# " + title)
    A("# FECHA: " + date)
    A(SEP70)
    A("")
    for dl in desc.split("\n"):
        A("> " + dl)
    A("")
    A("---")
    A("")

    # Group by category
    cat_groups = {}
    for (cat_name, sub_name, tools) in phases[phase_num]:
        if cat_name not in cat_groups:
            cat_groups[cat_name] = []
        cat_groups[cat_name].append((sub_name, tools))

    for cat_name, subcats in cat_groups.items():
        if cat_name in rendered_cats:
            continue
        rendered_cats.add(cat_name)

        A("## " + cat_name)
        desc_txt = CAT_DESC.get(cat_name, "")
        if desc_txt:
            for dl in desc_txt.split("\n"):
                A("> " + dl)
        A("")

        for (sub_name, tools) in subcats:
            if sub_name and sub_name not in ("_root_", "General"):
                A("### " + sub_name)
            A("")

            for (t_name, flags, t_url) in tools:
                flag_str = (" " + " ".join(flags)) if flags else ""
                known_mark = " [*]" if is_known(t_name) else ""
                if t_url:
                    A("- **" + t_name + "**" + known_mark + flag_str)
                    A("  URL: " + t_url)
                else:
                    A("- **" + t_name + "**" + known_mark + flag_str)
            A("")

        A(SEP40)
        A("")

# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------
total_tools = sum(
    len(tools)
    for p in phases.values()
    for (_, _, tools) in p
)
print("[OK] Categorias procesadas: %d" % len(rendered_cats))
print("[OK] Herramientas totales indexadas: %d" % total_tools)

out_path = "data/osint_framework_exhaustivo.md"
content = "\n".join(lines)
with open(out_path, "w", encoding="utf-8") as f:
    f.write(content)

kb = len(content.encode("utf-8")) // 1024
print("[OK] Guardado: %s (%d KB, %d lineas)" % (out_path, kb, len(lines)))
