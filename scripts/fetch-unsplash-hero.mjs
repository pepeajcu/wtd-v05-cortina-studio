/**
 * Busca 3 candidatas de imagen de hero por producto en Unsplash y las
 * imprime en consola para que el operador elija. NO modifica el JSON.
 *
 *   node scripts/fetch-unsplash-hero.mjs           # preview (default)
 *   node scripts/fetch-unsplash-hero.mjs --slug cenefas   # un solo producto
 *
 * La key se lee de .env.local -> UNSPLASH_ACCESS_KEY.
 *
 * Query policy:
 *   - Combina keywords en INGLES (mejor indice) + nombre del producto en espanol.
 *   - orientation=landscape, content_filter=high, per_page=3.
 *
 * Output por producto:
 *   slug, query usado, y 3 candidatas con:
 *     idx, id, alt, author, profile, regular_url, thumb_url
 */
import { readFileSync, existsSync } from 'fs';

function loadEnv(file) {
  if (!existsSync(file)) return {};
  const out = {};
  for (const line of readFileSync(file, 'utf-8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

const env = { ...loadEnv('.env.local'), ...process.env };
const KEY = env.UNSPLASH_ACCESS_KEY;

if (!KEY || KEY === 'pega-aqui-tu-access-key') {
  console.error('[unsplash-hero] Falta UNSPLASH_ACCESS_KEY en .env.local');
  process.exit(1);
}

const PRODUCTOS_PATH = 'content/productos.json';
const productos = JSON.parse(readFileSync(PRODUCTOS_PATH, 'utf-8'));

// Mapa slug -> keywords (ingles primero, espanol de refuerzo).
// Editar libremente; el query final es: `${en} ${es_name}`
const KEYWORDS = {
  'cenefas':                       { en: 'window valance cornice crown molding interior', es: 'cenefa cortina' },
  'cojines':                       { en: 'decorative throw pillows sofa living room',     es: 'cojin almohadon decoracion' },
  'ojetes':                        { en: 'grommet curtain window rod modern',             es: 'cortina con ojetes tubo' },
  'enrollables-dia-noche':        { en: 'day night roller blind window double',          es: 'cortina enrollable doble screen blackout' },
  'enrollables':                   { en: 'roller shade pulled down window texture',       es: 'persiana enrollable tela' },
  'pliegue-frances':               { en: 'pinch pleat drapery formal living room',       es: 'cortina pliegue frances tradicional' },
  'ripplefold':                    { en: 'wave sheer curtain modern living room',         es: 'cortina onda perfecta' },
  'calor':                         { en: 'sunbeam streaming through window rays',         es: 'rayo sol ventana radiante' },
  'privacidad':                    { en: 'sheer linen curtain privacy window',            es: 'cortina privacidad' },
  'acustica':                      { en: 'heavy velvet drapery soundproof window',        es: 'cortina acustica termica' },
  'decorativo':                    { en: 'luxury curtain interior design living room',    es: 'cortina diseno decoracion' },
  'mantenimiento-y-reparaciones':  { en: 'folded fabric stack clean textile care',         es: 'tela doblada cuidado limpieza' },
};

const args = process.argv.slice(2);
const onlySlug = (() => {
  const i = args.indexOf('--slug');
  return i >= 0 ? args[i + 1] : null;
})();

const target = onlySlug
  ? productos.filter((p) => p.slug === onlySlug)
  : productos;

if (target.length === 0) {
  console.error(`[unsplash-hero] slug no encontrado: ${onlySlug}`);
  process.exit(1);
}

async function searchOne(query) {
  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', '3');
  url.searchParams.set('orientation', 'landscape');
  url.searchParams.set('content_filter', 'high');
  url.searchParams.set('lang', 'en');

  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${KEY}`, 'Accept-Version': 'v1' },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
  }

  const json = await res.json();
  return (json.results || []).map((p) => ({
    id: p.id,
    alt: p.alt_description || p.description || '',
    author: p.user?.name || 'unknown',
    profile: p.user?.links?.html || '',
    regular: p.urls?.regular || '',
    thumb: p.urls?.thumb || '',
    width: p.width,
    height: p.height,
  }));
}

async function searchWithFallbacks(queries) {
  const seen = new Set();
  const all = [];
  for (const q of queries) {
    let results;
    try {
      results = await searchOne(q);
    } catch (err) {
      console.log(`   !! query "${q}" -> ${err.message}`);
      continue;
    }
    for (const r of results) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      all.push({ ...r, query: q });
      if (all.length >= 3) return all;
    }
  }
  return all;
}

console.log(`[unsplash-hero] ${target.length} producto(s) - 3 candidatas c/u\n`);

for (const p of target) {
  const kw = KEYWORDS[p.slug];
  if (!kw) {
    console.log(`## ${p.slug} -> sin keywords definidas, saltando`);
    continue;
  }
  const fullQuery = `${kw.en} ${kw.es}`;
  process.stdout.write(`## ${p.slug} (${p.name})\n   queries: ["${fullQuery}", "${kw.en}", "${kw.es}"]\n`);

  const results = await searchWithFallbacks([fullQuery, kw.en, kw.es]);

  if (results.length === 0) {
    console.log('   (sin resultados en ninguno de los fallbacks)\n');
    continue;
  }

  results.forEach((r, i) => {
    console.log(`   [${i + 1}] id=${r.id}  via="${r.query}"`);
    console.log(`       alt:     ${r.alt}`);
    console.log(`       author:  ${r.author}`);
    console.log(`       size:    ${r.width}x${r.height}`);
    console.log(`       regular: ${r.regular}`);
    console.log(`       thumb:   ${r.thumb}`);
    console.log(`       profile: ${r.profile}`);
  });
  console.log('');

  // Respetar rate limit (demo app: 50 req/hr, plenty of headroom)
  await new Promise((r) => setTimeout(r, 200));
}

console.log('[unsplash-hero] listo. Elegi candidatas y avisame para escribir el JSON.');
