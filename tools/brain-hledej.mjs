#!/usr/bin/env node
/**
 * brain-hledej.mjs: hledání v paměti workspace. Node bez závislostí, bez sítě a bez modelu. Je to knihovna pro hook `brain-pripomen`
 * (připomínač paměti) i příkaz pro dovednost `brain`.
 *
 * Tři vrstvy paměti, každá volitelná (chybí-li, vynechá se):
 *   wiki      stránky vaultu druhého mozku (`SECOND_BRAIN_VAULT`): všechny `.md` kromě raw/, attachments/, session-logs/, skrytých složek
 *             a servisních souborů (index.md, log.md, README.md, AGENTS.md, CLAUDE.md),
 *   learning  `docs/learnings/*.md` (bez INDEX, ROZCESTNIK a README); popis bere z řádku `INDEX.md`,
 *   session   záznamy sessions: `<vault>/session-logs/` a `docs/session-logs/`; když sessions ukládá Dashboard, také jeho složka `session-logs/desktop/`
 *             (`<zdroj>-<hash>.md`, jména nezačínají datem; vlastní je Dashboard, vyhledávač je jen čte). Cestu k jeho paměti si vezme z nastavení hostitele
 *             (`dashboardMemory`), nebo ji najde pod vaultem druhého mozku.
 * Bez vaultu se hledá jen v learningech a záznamech ve workspace.
 *
 * Hledání je slovní: slova od 4 písmen bez diakritiky, kmen = prvních 6 znaků (hrubá čeština bez stemmeru), skóre = podíl IDF váhy
 * dotazu, který dokument pokrývá, titulek má přednost. Synonyma a jiná slova pro totéž nenajde.
 *
 * Index leží ve složce stavu hooků (`<stav>/brain/<hash workspace>/index.json`, mimo workspace i vault) a drží zpracované dokumenty podle
 * cesty, času změny a velikosti: při změně zdrojů se znovu zpracují jen změněné soubory a čas jednoho běhu má strop. Nic se nemaže.
 *
 *   node tools/brain-hledej.mjs "jak jsme řešili cenu školení"     # nejlepší shody
 *   node tools/brain-hledej.mjs "…" --limit 10 | --json | --prebuduj
 */
import fs from 'node:fs';
import os from 'node:os';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KIT_ROOT, brainVault, recordsDirs, stateRoot, workspaceHash } from '../hooks/runtime.mjs';
import { redactSecrets } from '../hooks/secret-guard.mjs';
import { dashboardMemory } from '../hooks/kontext-prace.mjs';

export const VERZE_INDEXU = 2;
export const LIMITY = Object.freeze({ wiki: 5000, learning: 1000, session: 3000, cteni: 200 * 1024, text: 60_000, budgetMs: 1500 });
const KMENU_NA_DOKUMENT = { wiki: 600, learning: 400, session: 200 };
const SERVISNI = /^(?:index|log|README|AGENTS|CLAUDE)\.md$/i;
const MIMO_VAULT = new Set(['raw', 'attachments', 'session-logs', 'node_modules']);
const ENTITNI_TYPY = new Set(['tool', 'project', 'person', 'topic']);
const PREFIX_ENTITY = /^(Tool|Project|Person|Topic)-(.+)$/i;
// Záznam, který ukládá Dashboard: `<zdroj>-<sha256 nativního ID>.md` ve `session-logs/desktop/` jeho paměti (README.md a `.tombstones.json` tam jsou také, ale nejsou záznam).
export const DASHBOARD_ZAZNAM = /^(?:claude-code|codex)-[0-9a-f]{64}\.md$/;

// ---------------------------------------------------------------- slova

export const bezDiakritiky = (value) => String(value ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const SLOVO = /[\p{L}\p{N}]+/gu;
/** Slova bez obsahu (bez diakritiky, od 4 písmen): spojky, zájmena, pomocná slovesa a výplně z řeči o minulosti. */
const NEVYZNAMNA = new Set(`jsem jsme jste jsou bylo byla byli byly bude budu budes budeme budou tady tento tato toto tohle tomhle tenhle
takze proto protoze kdyz jaky jaka jake jakou jakym ktera ktery ktere kterou kterym jestli nebo jako take taky jeste potom tedy mezi
podle pres pred neco nejak nejaky nejaka nejake vsechno vsechny vsech cele cely celou mame mate chci chces chce potrebuju potrebuji
potrebujes udelej udelat mrkni prosim dobre takhle jejich jeho jich muzes muzeme muze mela melo meli bych bychom abych abys aby vlastne
prave spis hlavne docela opravdu treba jenom pouze porad zase znovu rekni napis delat dela delam delas stale nikdy vzdycky
neni nejsou nemam nemame nema nemusi musi musim musime mohl mohla mohli dalsi dalsich posledni prvni druhy
resili resil resila resit resime reseno delali delal delala udelali udelal stavu stav stavem naposledy minule minuly posledne
pamatujes vzpominas predtim drive driv vcera dneska dnes zitra tyden tydne podivej podivat zjisti zjistit vime vite mely ceka cekame
skoncili skoncil navaz pokracuj pokracovat tam jen pak ted tech temi jine jiny jina jinak sami sama samo svoje svuj svou nase vase jeji
this that with from have what when where will would should could there their them then than also just like make into your about been
were they which some more other only over such remember previously discussed decided talked
jak kde kdy proc pro pri bez ono oni ona ale ani ano jsi tak ten tam jen uz pak ted tim tom tomu teto kdo kam rad mam mas sem nas vas nic vse dal tez
the and for are but not you all can had her was one our out has his how its may new now old see two who way did get let put say she too use`.split(/\s+/).filter(Boolean));

/** {kmen: počet}: slova od 4 písmen bez diakritiky, kmen = prvních 6 znaků. Trojpísmenné slovo s velkým písmenem zůstane (zkratky a jména). */
export function kmeny(text, max = LIMITY.text) {
  const out = new Map();
  for (const match of String(text ?? '').slice(0, max).matchAll(SLOVO)) {
    const word = bezDiakritiky(match[0]);
    const name = word.length === 3 && /^\p{Lu}/u.test(match[0]);
    if ((word.length < 4 && !name) || NEVYZNAMNA.has(word) || /^\d+$/.test(word)) continue;
    const stem = word.slice(0, 6);
    out.set(stem, (out.get(stem) ?? 0) + 1);
  }
  return out;
}
/** Text jako slova bez diakritiky oddělená jednou mezerou, s mezerou na začátku i na konci: pro hledání jmen a frází. */
export const proFraze = (text) => ` ${bezDiakritiky(text).replace(/[^\p{L}\p{N}]+/gu, ' ').trim()} `;

// ---------------------------------------------------------------- zdroje a dokumenty

function frontmatter(text) {
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text); const fm = {};
  for (const line of (block?.[1] ?? '').split(/\r?\n/)) { const pair = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line); if (pair) fm[pair[1]] = pair[2].trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1'); }
  return { fm, body: block ? text.slice(block[0].length) : text };
}
function readHead(file, max = LIMITY.cteni) {
  const fd = fs.openSync(file, 'r');
  try { const buffer = Buffer.alloc(max); return buffer.subarray(0, fs.readSync(fd, buffer, 0, max, 0)).toString('utf8'); } finally { fs.closeSync(fd); }
}
const firstLine = (body) => String(body ?? '').split(/\r?\n/).map((line) => line.trim()).find((line) => line && !/^[#>]|^---/.test(line)) ?? '';
const shorten = (text, max) => { const clean = String(text ?? '').replace(/\s+/g, ' ').trim(); return clean.length > max ? clean.slice(0, max - 1) + '…' : clean; };
/** Sekce `## Název`, jejichž nadpis sedí na vzor (bez nadpisu). */
function sections(body, pattern) {
  const out = []; let take = false;
  for (const line of String(body).split(/\r?\n/)) { if (/^##\s/.test(line)) { take = pattern.test(line); continue; } if (take) out.push(line); }
  return out.join('\n');
}

function mdFiles(dir, { recursive = false, filter = () => true, skipDirs = new Set(), max = Infinity } = {}) {
  const out = [];
  let entries; try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const entry of entries.sort((a, b) => (a.name < b.name ? -1 : 1))) {
    if (out.length >= max) break;
    if (entry.name.startsWith('.')) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { if (recursive && !skipDirs.has(entry.name)) out.push(...mdFiles(file, { recursive, filter, skipDirs, max: max - out.length })); }
    else if (entry.isFile() && entry.name.endsWith('.md') && filter(entry.name)) out.push(file);
  }
  return out;
}

/**
 * Složky záznamů sessions, které ukládá Dashboard (`<paměť>/session-logs/desktop`, jen existující): ta pod vaultem druhého mozku (Dashboard ji může
 * sdílet) a paměti z nastavení hostitele (`home` je domovská složka uživatele; bez ní se nastavení nečte).
 */
export function dashboardSlozky({ env = process.env, home = null } = {}) {
  const dirs = new Set(); const vault = brainVault(env);
  if (vault) dirs.add(path.join(vault, 'session-logs', 'desktop'));
  if (home) for (const host of ['claude', 'codex']) for (const memory of dashboardMemory(host, { env, home })) dirs.add(path.join(memory, 'session-logs', 'desktop'));
  return [...dirs].filter((dir) => { try { return fs.statSync(dir).isDirectory(); } catch { return false; } });
}
/** Záznamy Dashboardu ve složce: jména nezačínají datem, proto se berou nejnovější podle času změny. */
function dashboardSoubory(dir) {
  const rows = [];
  for (const file of mdFiles(dir, { filter: (name) => DASHBOARD_ZAZNAM.test(name) })) { try { rows.push({ file, mt: fs.statSync(file).mtimeMs }); } catch { /* mezitím zmizel */ } }
  return rows.sort((a, b) => b.mt - a.mt).slice(0, LIMITY.session).map((row) => row.file);
}

/**
 * Zdroje indexu: [{ druh, cesta, mt, sz }] (čas změny a velikost při jednom stat). Záznamy sessions se berou nejnovější podle jména (začíná datem),
 * záznamy Dashboardu podle času změny. `home` zapíná čtení nastavení hostitele kvůli paměti Dashboardu (hook i příkaz ho předávají, knihovna bez něj nic nečte).
 */
export function zdroje({ root, env = process.env, home = null }) {
  const list = []; const seen = new Set();
  const add = (druh, files) => { for (const cesta of files) { if (seen.has(cesta)) continue; seen.add(cesta); try { const stat = fs.statSync(cesta); list.push({ druh, cesta, mt: Math.round(stat.mtimeMs), sz: stat.size }); } catch { /* mezitím zmizel */ } } };
  const vault = brainVault(env);
  if (vault) add('wiki', mdFiles(vault, { recursive: true, skipDirs: MIMO_VAULT, filter: (name) => !SERVISNI.test(name), max: LIMITY.wiki }));
  add('learning', mdFiles(path.join(root, 'docs', 'learnings'), { filter: (name) => !/^(?:INDEX|ROZCESTNIK|README)\.md$/i.test(name), max: LIMITY.learning }));
  for (const dir of recordsDirs(root, env)) add('session', mdFiles(dir, { filter: (name) => /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(name) }).sort().slice(-LIMITY.session));
  for (const dir of dashboardSlozky({ env, home })) add('session', dashboardSoubory(dir));
  return list;
}
/** Podpis zdrojů (počet, nejnovější čas změny, součet velikostí a otisk cest, ať ho změní i přejmenování): jiný podpis = přestavět index. */
export const podpis = (list) => `${list.length}:${list.reduce((max, item) => Math.max(max, item.mt), 0)}:${list.reduce((sum, item) => sum + item.sz, 0)}:${createHash('sha1').update(list.map((item) => item.cesta).join('\n')).digest('hex').slice(0, 12)}`;

/** Řádky `INDEX.md` learningů podle jména souboru: spouštěč („když děláš X“) je nejlepší popis pravidla. */
function indexRows(root) {
  const map = new Map(); let text = '';
  try { text = readHead(path.join(root, 'docs', 'learnings', 'INDEX.md'), 512 * 1024); } catch { return map; }
  for (const row of text.split(/\r?\n/)) {
    if (!row.trim().startsWith('|')) continue;
    for (const link of row.matchAll(/\]\(\s*<?([^)\s>]+\.md)/g)) { const name = path.basename(link[1].split('#')[0]); if (!map.has(name)) map.set(name, row.replace(/\*\*/g, '').slice(0, 1500)); }
  }
  return map;
}

/** Jeden zdroj → zpracovaný dokument (nebo null). `e` = jména entit (stránky typu Tool, Project, Person, Topic), podle kterých hook pozná zmínku. */
function dokument({ druh, cesta }, rows) {
  const { fm, body } = frontmatter(readHead(cesta));
  const base = path.basename(cesta, '.md');
  const h1 = /^#\s+(.+)$/m.exec(body)?.[1]?.trim() ?? '';
  if (druh === 'wiki') {
    const nazev = h1 || base.replace(/-/g, ' ');
    const prefix = PREFIX_ENTITY.exec(base);
    // Jména entity: první část nadpisu a jméno souboru bez prefixu typu; stejné jméno bez ohledu na diakritiku a velikost písmen jen jednou (nadpis má přednost).
    const e = [];
    if (prefix || ENTITNI_TYPY.has(bezDiakritiky(fm.type))) for (const name of [nazev.split(/\s+[—–-]\s+/)[0], prefix ? prefix[2].replace(/-/g, ' ') : base.replace(/-/g, ' ')]) if (name && !e.some((known) => proFraze(known) === proFraze(name))) e.push(name);
    return { druh, nazev, kdy: fm.curated_at || fm.date || '', ukazka: shorten(firstLine(body), 180), titul: `${nazev} ${base.replace(/-/g, ' ')}`, text: body, e };
  }
  if (druh === 'learning') {
    const row = rows.get(path.basename(cesta)) ?? ''; const trigger = row.split('|')[1] ?? '';
    const nazev = h1 || base;
    return { druh, nazev, kdy: /^(\d{4}-\d{2}-\d{2})/.exec(base)?.[1] ?? '', ukazka: shorten(trigger || firstLine(body), 180), titul: `${nazev} ${trigger}`, text: `${row}\n${body.slice(0, 6000)}`, e: [] };
  }
  const topic = firstLine(sections(body, /^##\s+(?:Téma|Tema|Topic)\b/i)).replace(/^[-*]\s*/, '');
  const nazev = fm.tema || topic || h1.replace(/^Session( Log)?\s*[—-]\s*/i, '').replace(/^\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2})?\s*/, '');
  if (!nazev) return null;
  // Záznam Dashboardu nese před každou zprávou řádek `## USER · <čas>` a `<!-- message:<id> -->`: do indexu patří jen text zpráv.
  const clean = DASHBOARD_ZAZNAM.test(path.basename(cesta)) ? body.replace(/^## (?:USER|ASSISTANT) · .*$/gm, '').replace(/^<!-- message:.*-->$/gm, '') : body;
  const useful = sections(clean, /Zadání|Téma|Tema|Topic|Rozhodnutí|Decisions|Shrnutí|Learnings|Otevřené|Open items|Context|Kontext/i) || clean.replace(/^#.*$/m, '');
  const kdy = [fm.naposledy, fm.date, /\d{4}-\d{2}-\d{2}/.exec(base)?.[0]].find((value) => /^\d{4}-\d{2}-\d{2}/.test(String(value ?? ''))) ?? '';
  return { druh, nazev, kdy, ukazka: shorten(topic && topic !== nazev ? topic : firstLine(sections(body, /Shrnutí|Kontext|Context/i)), 180), titul: nazev, text: `${nazev}\n${useful}`.slice(0, 12_000), e: [] };
}

/** Index: dokumenty s nejčastějšími kmeny, `df` kmenů a entity (jména stránek wiki). `předchozí` = dokumenty z cache podle cesty (znovu se zpracují jen změněné). */
export function postavIndex({ root, env = process.env, home = null, predchozi = new Map(), deadline = Infinity, clock = Date.now, seznam = zdroje({ root, env, home }) }) {
  const rows = indexRows(root); const docs = []; const df = {}; const entity = []; let castecny = false;
  for (const zdroj of seznam) {
    let doc = predchozi.get(zdroj.cesta);
    if (!doc || doc.mt !== zdroj.mt || doc.sz !== zdroj.sz || doc.druh !== zdroj.druh) {
      if (clock() > deadline) { castecny = true; continue; }
      let parsed = null; try { parsed = dokument(zdroj, rows); } catch { /* nečitelný soubor se přeskočí */ }
      if (!parsed) continue;
      const stems = [...kmeny(`${parsed.titul}\n${parsed.text}`).entries()].sort((a, b) => b[1] - a[1]).slice(0, KMENU_NA_DOKUMENT[parsed.druh]);
      doc = { druh: parsed.druh, cesta: zdroj.cesta, nazev: shorten(parsed.nazev, 120), kdy: parsed.kdy, ukazka: parsed.ukazka, k: Object.fromEntries(stems), t: [...kmeny(parsed.titul).keys()], e: parsed.e, mt: zdroj.mt, sz: zdroj.sz };
    }
    const id = docs.length; docs.push({ ...doc, id });
    for (const stem of Object.keys(doc.k)) df[stem] = (df[stem] ?? 0) + 1;
    for (const name of doc.e ?? []) {
      const klic = proFraze(name).trim();
      if (klic.replace(/\s/g, '').length >= 4 && !NEVYZNAMNA.has(klic) && !/^\d+$/.test(klic)) entity.push({ klic, jmeno: name, id });
    }
  }
  return { verze: VERZE_INDEXU, postaveno: Date.now(), vault: brainVault(env), podpis: podpis(seznam), castecny, docs, df, entity };
}

const indexFile = (root, env) => path.join(stateRoot(env), 'brain', workspaceHash(root), 'index.json');
/**
 * Index z cache, přestavěný při změně zdrojů (znovu se zpracují jen změněné dokumenty). Jeden běh má časový strop; nestihne-li všechno,
 * uloží částečný index a příští běh pokračuje. Nikdy nevyhazuje: bez zdrojů vrátí prázdný index.
 */
export function nactiIndex({ root = KIT_ROOT, env = process.env, home = null, vynutit = false, budgetMs = LIMITY.budgetMs, clock = Date.now } = {}) {
  const file = indexFile(root, env); const seznam = zdroje({ root, env, home }); const sign = podpis(seznam); const vault = brainVault(env);
  let cached = null;
  try { const value = JSON.parse(fs.readFileSync(file, 'utf8')); if (value?.verze === VERZE_INDEXU && Array.isArray(value.docs)) cached = value; } catch { /* bez cache nebo rozbitá */ }
  if (cached && !vynutit && !cached.castecny && cached.podpis === sign && cached.vault === vault) return cached;
  const predchozi = new Map(vynutit ? [] : (cached?.docs ?? []).map((doc) => [doc.cesta, doc]));
  const index = postavIndex({ root, env, home, predchozi, deadline: clock() + budgetMs, clock, seznam });
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
    const temporary = file + '.tmp'; fs.writeFileSync(temporary, JSON.stringify(index), { mode: 0o600 }); fs.renameSync(temporary, file); // pevné jméno: nic se nehromadí
  } catch { /* cache je doplněk: bez ní se příště postaví znovu */ }
  return index;
}

// ---------------------------------------------------------------- hledání

/**
 * Shody dotazu: [{ doc, skore, pokryti, spolecne }] podle skóre. `pokryti` = podíl IDF váhy dotazu, který dokument nese (0 až 1);
 * titulek má vyšší váhu. Stačí `minSpolecnych` kmenů (u jednoslovného dotazu jeden). Znají se jen kmeny, které index obsahuje.
 */
export function hledej(index, dotaz, { limit = 8, minPokryti = 0.3, minSpolecnych = 2, druhy = null, vynech = new Set() } = {}) {
  const N = Math.max(1, index.docs.length);
  const idf = (stem) => Math.log(1 + N / (1 + (index.df[stem] ?? 0)));
  const q = [...kmeny(dotaz).keys()].filter((stem) => index.df[stem]);
  if (!q.length) return [];
  const total = q.reduce((sum, stem) => sum + idf(stem), 0); const min = Math.min(minSpolecnych, q.length);
  const out = [];
  for (const doc of index.docs) {
    if (vynech.has(doc.cesta) || (druhy && !druhy.includes(doc.druh))) continue;
    const shared = q.filter((stem) => doc.k[stem]);
    if (shared.length < min) continue;
    let weight = 0; let strength = 0;
    for (const stem of shared) { const title = doc.t.includes(stem) ? 2 : 1; weight += idf(stem) * Math.min(title, 1.5); strength += idf(stem) * (1 + Math.log(doc.k[stem])) * title; }
    const coverage = Math.min(1, weight / total);
    if (coverage < minPokryti) continue;
    const bonus = doc.druh === 'wiki' ? 1.15 : doc.druh === 'learning' ? 1.1 : 1;
    out.push({ doc, pokryti: coverage, skore: coverage * bonus * (1 + 0.05 * Math.log(1 + strength)), spolecne: shared });
  }
  return out.sort((a, b) => b.skore - a.skore || String(b.doc.kdy).localeCompare(String(a.doc.kdy))).slice(0, limit);
}
/** Stránky wiki, jejichž jméno (Tool, Project, Person, Topic) je v textu jako celé slovo nebo fráze (bez ohledu na velikost písmen a diakritiku). */
export function entityVTextu(index, text) {
  const phrase = proFraze(text); const found = new Map();
  for (const entity of index.entity ?? []) if (phrase.includes(` ${entity.klic} `) && !found.has(entity.id)) found.set(entity.id, { doc: index.docs[entity.id], jmeno: entity.jmeno });
  return [...found.values()];
}

// ---------------------------------------------------------------- výpis

/**
 * Text z paměti je cizí data (vault může obsahovat cokoli): tajemství se začerní dřív, než se text zkrátí (useknutý klíč by se nepoznal),
 * řídicí znaky a zalomení zmizí a ostré závorky se zahodí, aby nešlo napodobit značku ani nadpis. Používá hook i příkaz.
 */
export function cisti(value, max) {
  const text = redactSecrets(String(value ?? '').slice(0, 4000)).normalize('NFKC').replace(/[\p{Cc}\p{Cf}]+/gu, ' ').replace(/[<>`]/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}

const DRUH = { wiki: 'wiki', learning: 'learning', session: 'session' };
export const hezkeDatum = (kdy) => { const match = /^\d{4}-(\d{2})-(\d{2})/.exec(String(kdy ?? '')); return match ? `${Number(match[2])}. ${Number(match[1])}.` : ''; };
/** Cesta pro agenta: ve workspace relativně, jinak absolutně (pod domovskou složkou s `~`). */
export function ukazCestu(file, { root = KIT_ROOT, home = os.homedir() } = {}) {
  const under = (base) => { const relative = path.relative(base, file); return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative) ? relative.split(path.sep).join('/') : null; };
  return under(root) ?? (under(home) !== null ? `~/${under(home)}` : file);
}
/**
 * Řádek shody: `[druh datum] název → cesta`. Cesta je to, co agent otevře, takže ji dlouhý název nesmí připravit o konec (název souboru): u dlouhé cesty
 * (záznamy Dashboardu mají v názvu 64 znaků hashe) se zkrátí název, nejméně na 20 znaků.
 */
export const radekShody = ({ doc }, options = {}) => {
  const cesta = ukazCestu(doc.cesta, options); const hlava = `[${DRUH[doc.druh]}${doc.druh === 'session' && doc.kdy ? ` ${hezkeDatum(doc.kdy)}` : ''}] `;
  return `${hlava}${cisti(doc.nazev, Math.max(20, Math.min(120, 300 - hlava.length - cesta.length)))} → ${cesta}`;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const value = (flag) => { const at = argv.indexOf(flag); return at >= 0 ? argv[at + 1] : undefined; };
  const dotaz = argv.filter((item, i) => !item.startsWith('--') && argv[i - 1] !== '--limit').join(' ').trim();
  // Příkaz má na rozdíl od hooku dost času: index se sestaví celý. Stejně ho dokončí i hook při dalších zprávách.
  const index = nactiIndex({ vynutit: argv.includes('--prebuduj'), budgetMs: 60_000, home: os.homedir() });
  const upozorneni = index.castecny ? 'Index je zatím částečný (velký vault); doplní se při dalším běhu, výsledky mohou být neúplné.' : '';
  if (!dotaz) {
    const counts = index.docs.reduce((acc, doc) => ({ ...acc, [doc.druh]: (acc[doc.druh] ?? 0) + 1 }), {});
    console.log(`Index paměti: wiki ${counts.wiki ?? 0}, learningy ${counts.learning ?? 0}, záznamy sessions ${counts.session ?? 0}${index.castecny ? ' (částečný, doplní se při dalším běhu)' : ''}. Použití: node tools/brain-hledej.mjs "<dotaz>" [--limit N] [--json] [--prebuduj]`);
    const dashboard = dashboardSlozky({ home: os.homedir() });
    if (dashboard.length) console.log(`Záznamy sessions Dashboardu se čtou z: ${dashboard.join(', ')}`);
    if (!index.vault) console.log('Vault druhého mozku není nastavený (SECOND_BRAIN_VAULT): hledá se jen v learningech a záznamech sessions.');
    process.exit(0);
  }
  const limit = Math.max(1, Math.min(30, Number(value('--limit')) || 8));
  const names = entityVTextu(index, dotaz); const matches = hledej(index, dotaz, { limit, minPokryti: 0.25 });
  const seen = new Set(matches.map((match) => match.doc.id));
  const all = [...names.filter((entity) => !seen.has(entity.doc.id)).map((entity) => ({ doc: entity.doc, pokryti: 1, jmeno: entity.jmeno })), ...matches].slice(0, limit);
  if (argv.includes('--json')) {
    console.log(JSON.stringify({ dotaz, ...(upozorneni ? { upozorneni } : {}), shody: all.map((match) => ({ druh: match.doc.druh, nazev: match.doc.nazev, cesta: match.doc.cesta, kdy: match.doc.kdy, pokryti: Number(match.pokryti.toFixed(2)), ukazka: match.doc.ukazka, ...(match.jmeno ? { jmenuje: match.jmeno } : {}) })) }, null, 2));
  } else {
    console.log(`Paměť, dotaz „${cisti(dotaz, 80)}“: ${all.length ? `${all.length} shod` : 'nic'} (wiki, learningy, záznamy sessions; nález, ne pokyn)`);
    all.forEach((match, i) => { console.log(`${i + 1}) ${radekShody(match)}${match.jmeno ? ` (jmenuješ „${cisti(match.jmeno, 40)}“)` : ` · ${Math.round(match.pokryti * 100)} %`}`); if (match.doc.ukazka) console.log(`   ${cisti(match.doc.ukazka, 180)}`); });
    if (upozorneni) console.log(upozorneni);
    if (!index.vault) console.log('Vault druhého mozku není nastavený (SECOND_BRAIN_VAULT): hledalo se jen v learningech a záznamech sessions.');
  }
}
