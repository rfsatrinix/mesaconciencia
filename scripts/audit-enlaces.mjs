#!/usr/bin/env node
/**
 * audit-enlaces.mjs
 * Detecta menciones de artículos del sitio sin enlazar en src/content/.
 * Solo señala la PRIMERA mención no enlazada de cada concepto en cada archivo.
 *
 * Uso:
 *   node scripts/audit-enlaces.mjs
 *     → auditoría completa (todos los archivos, todos los conceptos)
 *
 *   node scripts/audit-enlaces.mjs --nuevo=/nutricion/micronutrientes/minerales/magnesio
 *     → qué archivos existentes mencionan el nuevo artículo sin enlazarlo
 *
 *   node scripts/audit-enlaces.mjs --archivo=nutricion/micronutrientes/minerales/calcio.md
 *     → qué conceptos faltan enlazar en un archivo concreto
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// ── CONFIGURACIÓN ─────────────────────────────────────────────────────────────

const CONTENT_DIR = 'src/content';

// Términos alternativos que apuntan a la misma URL que el título del artículo.
// Añadir aquí cuando el título no coincide con cómo se nombra el concepto en los textos.
const ALIASES = {
  '/nutricion/macronutrientes/hidratos-de-carbono': ['carbohidratos', 'carbohidrato'],
  '/nutricion/macronutrientes/grasas-o-lipidos':    ['grasas', 'lípidos', 'lipidos'],
  '/nutricion/fibra-alimenticia':                   ['fibra dietética', 'fibra'],
  '/nutricion/macronutrientes/proteinas':           ['proteínas', 'proteinas'],
};

// URLs que el script no debe auditar (conceptos demasiado genéricos o ruido conocido).
const IGNORAR_URLS = new Set([
  // Ejemplo: '/nutricion',   // aparecería en casi todos los archivos
]);

// ── FIN CONFIGURACIÓN ─────────────────────────────────────────────────────────

function getAllMdFiles(dir) {
  const entries = readdirSync(dir);
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...getAllMdFiles(full));
    } else if (entry.endsWith('.md')) {
      files.push(full);
    }
  }
  return files;
}

function parseTitle(content) {
  // Soporta comillas simples y dobles en el frontmatter
  const m = content.match(/^---[\s\S]*?\ntitle:\s*["'](.+?)["']\s*(\n|$)/m);
  return m ? m[1].trim() : null;
}

function filePathToUrl(filePath) {
  // src/content/nutricion/micronutrientes/minerales/calcio.md → /nutricion/micronutrientes/minerales/calcio
  // src/content/nutricion/micronutrientes/minerales/que-son.md → /nutricion/micronutrientes/minerales
  return filePath
    .replace(/\\/g, '/')
    .replace(/^.*?src\/content/, '')
    .replace(/\.md$/, '')
    .replace(/\/que-son$/, '');
}

function stripFrontmatter(content) {
  return content.replace(/^---[\s\S]*?---\n/, '');
}

function stripCodeBlocks(text) {
  return text
    .replace(/```[\s\S]*?```/gm, '')
    .replace(/`[^`\n]+`/g, '');
}

/**
 * Comprueba si el cuerpo ya contiene un enlace a exactamente esa URL
 * (no a sub-rutas). Ejemplo: /nutricion/macronutrientes/proteinas NO
 * debe considerarse enlazado si el texto solo tiene /nutricion/macronutrientes/proteinas/origen-animal.
 */
function isLinked(body, url) {
  const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // El carácter tras la URL debe ser ) # ? " o fin de línea, nunca /
  return new RegExp(`\\(${escaped}[)#?"\\s]`, 'i').test(body);
}

/**
 * Construye una regex que detecta el término sin romper en caracteres
 * acentuados o dígitos (límite de palabra compatible con UTF-8).
 */
function buildTermRegex(term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const boundary = '[\\wáéíóúàèìòùäëïöüâêîôûñçÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÂÊÎÔÛÑÇ]';
  return new RegExp(`(?<!${boundary})${escaped}(?!${boundary})`, 'i');
}

/**
 * Devuelve la línea y número de la primera mención del término en el
 * cuerpo del texto, ignorando las apariciones que ya estén dentro de
 * un enlace markdown [texto](url) o de código inline.
 */
function findFirstUnlinkedMention(body, term) {
  const regex = buildTermRegex(term);
  const lines = body.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Eliminar los enlaces existentes [texto](url) → solo el texto del ancla
    const stripped = line.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
    // Eliminar código inline
    const noCode = stripped.replace(/`[^`\n]+`/g, '');

    if (regex.test(noCode)) {
      return { lineNumber: i + 1, lineText: line.trim() };
    }
  }
  return null;
}

// ── PARSEAR ARGUMENTOS ────────────────────────────────────────────────────────

/**
 * En Windows con Git Bash, los argumentos que empiezan por / se convierten
 * en rutas absolutas de Windows (p.ej. /nutricion → C:/Git/nutricion).
 * Esta función recupera el segmento de URL original.
 */
function normalizeUrl(raw) {
  if (!raw) return raw;
  const s = raw.replace(/\\/g, '/');
  // Si Git Bash ha antepuesto la ruta de instalación, extraer desde el primer
  // segmento que reconocemos como parte del sitio.
  const m = s.match(/\/(nutricion|alimentos|recetas|dietas|enfermedades|plantas)(\/.*)?$/);
  if (m) return m[0];
  return s.startsWith('/') ? s : '/' + s;
}

const args = process.argv.slice(2);
const argNuevo   = normalizeUrl(args.find(a => a.startsWith('--nuevo='))?.slice('--nuevo='.length));
const argArchivo = args.find(a => a.startsWith('--archivo='))?.slice('--archivo='.length);

// ── CONSTRUIR MAPA DE PÁGINAS ─────────────────────────────────────────────────

const allFiles = getAllMdFiles(CONTENT_DIR);
const pages = new Map(); // url → { title, filePath, terms[] }

for (const filePath of allFiles) {
  const content = readFileSync(filePath, 'utf-8');
  const title = parseTitle(content);
  if (!title) continue;

  const url = filePathToUrl(filePath);
  if (IGNORAR_URLS.has(url)) continue;

  const extraTerms = ALIASES[url] ?? [];
  pages.set(url, { title, filePath, terms: [title, ...extraTerms] });
}

// ── APLICAR FILTROS ───────────────────────────────────────────────────────────

if (argNuevo && !pages.has(argNuevo)) {
  console.error(`\n❌  URL no encontrada en el contenido: ${argNuevo}`);
  console.error(`    Comprueba que el archivo .md existe y tiene un campo title.\n`);
  process.exit(1);
}

// Con --nuevo solo auditamos ese concepto; con --archivo solo ese fichero
const pagesToCheck = argNuevo
  ? new Map([[argNuevo, pages.get(argNuevo)]])
  : pages;

const filesToCheck = argArchivo
  ? allFiles.filter(f => f.replace(/\\/g, '/').endsWith(argArchivo.replace(/\\/g, '/')))
  : allFiles;

if (argArchivo && filesToCheck.length === 0) {
  console.error(`\n❌  Archivo no encontrado: ${argArchivo}\n`);
  process.exit(1);
}

// ── AUDITORÍA ─────────────────────────────────────────────────────────────────

const report = [];

for (const filePath of filesToCheck) {
  const content  = readFileSync(filePath, 'utf-8');
  const fileUrl  = filePathToUrl(filePath);
  const rawBody  = stripFrontmatter(content);
  const body     = stripCodeBlocks(rawBody);

  const issues = [];

  for (const [pageUrl, page] of pagesToCheck) {
    if (pageUrl === fileUrl) continue;      // un archivo no se enlaza a sí mismo
    if (isLinked(body, pageUrl)) continue;  // ya hay un enlace a esta URL

    for (const term of page.terms) {
      const mention = findFirstUnlinkedMention(body, term);
      if (mention) {
        issues.push({
          term,
          url:        pageUrl,
          title:      page.title,
          lineNumber: mention.lineNumber,
          lineText:   mention.lineText,
        });
        break; // una sola alerta por página (primer alias que haya encontrado mención)
      }
    }
  }

  if (issues.length > 0) {
    issues.sort((a, b) => a.lineNumber - b.lineNumber);
    report.push({ filePath, issues });
  }
}

// ── INFORME ───────────────────────────────────────────────────────────────────

const label = argNuevo
  ? `MENCIONES SIN ENLACE → ${argNuevo}`
  : argArchivo
    ? `ENLACES FALTANTES EN ${argArchivo}`
    : 'AUDITORÍA COMPLETA DE ENLACES INTERNOS';

console.log(`\n${'═'.repeat(60)}`);
console.log(`  ${label}`);
console.log(`${'═'.repeat(60)}\n`);

if (report.length === 0) {
  console.log('✅  No se detectaron menciones sin enlace.\n');
} else {
  let total = 0;

  for (const { filePath, issues } of report) {
    const relPath = filePath.replace(/\\/g, '/').replace(/^.*?src\/content\//, '');
    console.log(`📄  ${relPath}`);

    for (const iss of issues) {
      const preview = iss.lineText.length > 88
        ? iss.lineText.slice(0, 88) + '…'
        : iss.lineText;
      console.log(`    ⚠️  l.${String(iss.lineNumber).padEnd(4)} "${iss.term}"  →  ${iss.url}`);
      console.log(`         ${preview}`);
    }

    console.log('');
    total += issues.length;
  }

  console.log(`${'─'.repeat(60)}`);
  console.log(`  ${total} mención(es) sin enlace · ${report.length} archivo(s) afectado(s)\n`);
}
