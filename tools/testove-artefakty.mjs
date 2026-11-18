/**
 * Pracovní složky testů se stropem: jediná výjimka z pravidla 0 a týká se KÓDU TESTŮ, ne agenta.
 *
 * Test smí smazat (fs.rmSync) pouze složku, kterou sám vytvořil a označil značkou `.aios-test-retained`
 * (token, pid, čas startu procesu, čas vzniku), a to jen starší než 24 h nebo mimo nejnovějších 20
 * dokončených; složky, které ještě používá běžící proces, se do pořadí nepočítají. Před mazáním ověří
 * realpath přímo pod kořenem artefaktů, symlinky nenásleduje a adresáře bez práva zápisu nejdřív projde
 * přes lstat a odemkne (u+rwx). Značka nese poznámku `uklid` a mizí jako poslední: když složku nejde
 * odebrat (ENOTEMPTY od pozdního zápisu, EBUSY), vrátí se zpět (flag wx) a mazání dokončí příští úklid.
 * Kořen je vždy absolutní cesta určená kódem testů, nikdy cesta z proměnné prostředí. Složky neúspěšných
 * testů zůstanou k ladění, úspěšné zmizí hned po doběhnutí souboru testů. Agent v shellu dál nic nemaže
 * a hook to dál blokuje. Pod preloadem, který mazání nahrazuje přesunem, pomocník odmítne běžet.
 *
 * Přerušený proces (Ctrl+C = SIGINT, zavřený terminál = SIGHUP; Windows má jen SIGINT) svou složku smaže hned
 * celou a signál znovu vyvolá, takže skončí jako bez pomocníka. SIGTERM se záměrně nezachytává: test zablokovaný
 * v synchronním volání by ho s posluchačem ignoroval a runner by hlásil zelenou. Po SIGTERM a SIGKILL zbytek
 * smete příští úklid kořene.
 *
 * Použití v testech projektu (Node 24, node:test):
 *   import { testArtifacts } from '<cesta ke kitu>/tools/testove-artefakty.mjs';
 *   const artefakty = testArtifacts({ root: '/absolutní/cesta/projektu/work/_test-retained' });
 *   const dir = artefakty.dir('pripad-');   // nová složka uvnitř označené složky tohoto procesu
 *
 * Příkazy, které nejsou testy v Node (npm test, vitest, playwright, pytest, skripty), pouští obal tools/beh.mjs.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import * as nodeTest from 'node:test';

export const MARKER = '.aios-test-retained';
/** Jméno kořene artefaktů; obal beh.mjs u volby --koren jiné jméno nepřijme. */
export const ROOT_NAME = '_test-retained';
/** Signály, kterými uživatel přeruší proces: úklid hned a signál znovu. SIGTERM záměrně ne (viz hlavička). */
export const INTERRUPT_SIGNALS = Object.freeze(process.platform === 'win32' ? ['SIGINT'] : ['SIGINT', 'SIGHUP']);
export const MARKER_SCHEMA = 'aios-test-retained/v1';
export const LIMITS = Object.freeze({ maxAgeMs: 24 * 60 * 60 * 1000, keepNewest: 20, maxFolders: 20, maxBytes: 500 * 1024 * 1024 });
/** Značka preloadu retain-fixtures, který fs.rmSync/rmdirSync/unlinkSync nahrazuje přesunem do archivu. */
export const RETAIN_PRELOAD = Symbol.for('aios.tests.retain');
export const RETAIN_MESSAGE = 'Testové artefakty: proces běží s preloadem retain-fixtures (Symbol.for("aios.tests.retain")), který mazání nahrazuje přesunem a mimo svůj sandbox ho odmítá. Úklid pracovních složek testů by padal na EPERM a složky by přibývaly, proto testy hned končí. Spusť je bez tohoto preloadu.';
export const ROOT_README = `# Pracovní složky testů

Jediné místo, kam testy ukládají své pracovní soubory. Složky zakládá a uklízí sdílený pomocník \`tools/testove-artefakty.mjs\` z AI OS kitu; nic jiného sem nepatří.

## Obsah / Struktura

- Každá složka \`<test>-<token>\` patří jednomu procesu testů a má značku \`.aios-test-retained\` (token, pid, čas startu procesu, čas vzniku).
- Uvnitř: \`tmp/\` (TMPDIR procesu), \`spolecne/\` (sdílené soubory testů) a \`NNN-<název testu>/\` (soubory jednoho testu).
- Složky \`beh-<token>\` zakládá obal \`tools/beh.mjs\` pro libovolný příkaz (npm test, pytest, skripty): \`tmp/\` je jeho TMPDIR a zbytek je to, co po sobě příkaz nechal.

## Kolik se drží a jak se to uklízí

- Úspěšný soubor testů svou složku smaže hned po doběhnutí. U neúspěšného zmizí jen podsložky úspěšných testů, zbytek zůstane k ladění. Po Ctrl+C a zavřeném terminálu (SIGINT, SIGHUP) se složka smaže hned celá; po SIGTERM a SIGKILL ji smete další úklid.
- Na začátku a na konci každého procesu testů se smažou jen označené složky starší 24 h nebo mimo nejnovějších 20 dokončených; složky běžících procesů se nechávají a do pořadí se nepočítají. Nedokončené mazání (značka s poznámkou \`uklid\`) dokončí další úklid.
- Strop po plném běhu: nejvýš 20 spravovaných složek a 500 MB, v TMPDIR sady ani v kořeni nepřibude nic neoznačeného. Složky jiných běžících procesů a neoznačené položky se do stropu nepočítají a vypisují se zvlášť.
- Maže výhradně kód testů, po kontrole realpath uvnitř tohoto kořene a bez následování symlinků. Agent v shellu nemaže nic. Neoznačené složky zůstávají, dokud o nich nerozhodne majitel.

## Stav

Udržuje se automaticky; ručně sem nic neukládej.
`;

const NAME = /^([a-z0-9][a-z0-9-]{0,31})-([0-9a-f]{16})$/;
const PROCESS_STARTED_AT = new Date(Date.now() - process.uptime() * 1000).toISOString();
const failure = (message, code) => Object.assign(new Error(message), { code });
const validTime = (value) => typeof value === 'string' && Number.isFinite(Date.parse(value));

/** Běží proces s preloadem retain-fixtures? Pod ním úklid nefunguje, viz RETAIN_MESSAGE. */
export function retainPreloadActive() {
  return Boolean(globalThis[RETAIN_PRELOAD]);
}

function refuseRetainPreload() {
  if (retainPreloadActive()) throw failure(RETAIN_MESSAGE, 'EAIOS_RETAIN');
}

/** ASCII štítek pro název složky (bez diakritiky, mezer a cest). */
export function slug(text, max = 32) {
  return String(text ?? '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+/, '').slice(0, max).replace(/-+$/, '');
}

/** Štítek podle souboru testů: `hooks`, `ai-firma-runtime` … */
export function labelFor(file = process.argv[1]) {
  const parts = String(file || 'test').split(/[\\/]/);
  let name = parts.at(-1).replace(/\.(?:test|spec)\.[cm]?[jt]s$/i, '').replace(/\.[cm]?[jt]s$/i, '');
  const tests = parts.lastIndexOf('tests');
  if (tests >= 2 && parts[tests - 2] === 'modules' && tests === parts.length - 2) name = `${parts[tests - 1]}-${name}`;
  return slug(name) || 'test';
}

export function processAlive(pid) {
  if (!Number.isSafeInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; } catch (error) { return error.code === 'EPERM'; }
}

/** Domovská složka podle účtu (os.userInfo), ne podle proměnné HOME; null, když ji účet nemá. */
function accountHome() {
  try {
    const home = os.userInfo().homedir;
    return typeof home === 'string' && path.isAbsolute(home) && fs.lstatSync(home, { throwIfNoEntry: false })?.isDirectory() ? home : null;
  } catch { return null; }
}

/**
 * Kořen v uživatelské mezipaměti: jeden pro všechny checkouty a projekty uživatele, mimo Git i mimo kit
 * (macOS ~/Library/Caches/ai-os-kit/_test-retained, Linux ~/.cache/…, Windows ~\AppData\Local\…). Je to kořen
 * testů kitu. Cesta nikdy nevzniká z proměnné prostředí; účet bez domovské složky (kontejner s cizím uid) dostane null.
 */
export function userCacheRoot({ platform = process.platform, home = accountHome() } = {}) {
  if (!home) return null;
  const cache = platform === 'darwin' ? ['Library', 'Caches'] : platform === 'win32' ? ['AppData', 'Local'] : ['.cache'];
  return path.join(home, ...cache, 'ai-os-kit', ROOT_NAME);
}

/**
 * Krátký kořen `/tmp/aios-<uid>` pro obal beh.mjs. TMPDIR příkazu leží ve složce běhu pod kořenem a unixové sokety
 * (Chromium a Playwright, Postgres) mají limit ~104 znaků: kořen v mezipaměti dává TMPDIR kolem 80 až 90 znaků (podle
 * jména uživatele), takže se v něm soket Chromia (46 znaků) nevejde, krátký kořen dává kolem 50. Jen POSIX. `/tmp` je
 * sdílený, proto se použije jen skutečná složka tohoto uživatele bez práva zápisu pro ostatní (cizí složku téhož jména
 * nepřebereme); jinak null. `uid` a `base` jsou pro testy.
 */
export function shortRoot({ platform = process.platform, uid = process.getuid?.(), base = '/tmp' } = {}) {
  if (platform === 'win32' || !Number.isSafeInteger(uid)) return null;
  const dir = path.join(base, `aios-${uid}`);
  try {
    try { fs.mkdirSync(dir, { mode: 0o700 }); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const stat = fs.lstatSync(dir);
    return stat.isDirectory() && stat.uid === uid && (stat.mode & 0o022) === 0 ? dir : null;
  } catch { return null; }
}

/** Kořen musí být absolutní skutečná složka (ne symlink); vrací jeho realpath. */
export function resolveRoot(root) {
  if (typeof root !== 'string' || !path.isAbsolute(root)) throw failure('Kořen testových artefaktů musí být absolutní cesta určená kódem testů.', 'EAIOS_ROOT');
  const stat = fs.lstatSync(root);
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw failure('Kořen testových artefaktů musí být skutečná složka, ne odkaz.', 'EAIOS_ROOT');
  const real = fs.realpathSync(root);
  if (real === path.parse(real).root) throw failure('Kořen testových artefaktů nesmí být kořen disku.', 'EAIOS_ROOT');
  return real;
}

/** Založí kořen (0700) a jeho README, pokud chybí. Existující README nepřepisuje. */
export function prepareRoot(root, { readme = ROOT_README } = {}) {
  if (typeof root !== 'string' || !path.isAbsolute(root)) resolveRoot(root);
  fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  const real = resolveRoot(root);
  try { fs.writeFileSync(path.join(real, 'README.md'), readme, { flag: 'wx', mode: 0o644 }); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
  return real;
}

/**
 * Nová označená složka přímo pod kořenem. Značka vzniká hned po složce; když ji zapsat nejde (např. ENOSPC),
 * právě založená složka se hned odebere, jinak by v kořeni zůstala navždy bez značky.
 */
export function createRetainedFolder(root, label = labelFor()) {
  refuseRetainPreload();
  const real = resolveRoot(root);
  const token = randomBytes(8).toString('hex');
  const name = `${slug(label) || 'test'}-${token}`;
  const folder = path.join(real, name);
  fs.mkdirSync(folder, { mode: 0o700 });
  const marker = { schema: MARKER_SCHEMA, token, pid: process.pid, startedAt: PROCESS_STARTED_AT, createdAt: new Date().toISOString(), label: name.slice(0, -17) };
  const file = path.join(folder, MARKER);
  try { fs.writeFileSync(file, JSON.stringify(marker) + '\n', { flag: 'wx', mode: 0o600 }); }
  catch (error) {
    // Odebírá se jen to, co tento proces právě založil: neúplná značka (O_EXCL, tedy jeho) a prázdná složka.
    try {
      if (error.code !== 'EEXIST' && fs.lstatSync(file, { throwIfNoEntry: false })?.isFile()) fs.rmSync(file, { force: true });
      fs.rmdirSync(folder);
    } catch (cleanup) { error.leftover = `${folder} (${cleanup.code || cleanup.message})`; }
    throw error;
  }
  return { path: folder, name, token, marker };
}

function readMarker(folder) {
  const file = path.join(folder, MARKER);
  const stat = fs.lstatSync(file, { throwIfNoEntry: false });
  if (!stat?.isFile() || stat.size > 4096) return null;
  let fd;
  try {
    fd = fs.openSync(file, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0));
    const raw = fs.readFileSync(fd, 'utf8');
    const marker = JSON.parse(raw);
    return marker && typeof marker === 'object' && !Array.isArray(marker) ? { marker, raw } : null;
  } catch { return null; } finally { if (fd !== undefined) fs.closeSync(fd); }
}

/** Kandidát na úklid: skutečná složka přímo pod kořenem, s platnou značkou a shodným tokenem. */
function inspect(realRoot, name) {
  const match = NAME.exec(name);
  if (!match) return { keep: 'název bez tokenu' };
  const folder = path.join(realRoot, name);
  const stat = fs.lstatSync(folder);
  if (stat.isSymbolicLink() || !stat.isDirectory()) return { keep: 'není skutečná složka' };
  if (fs.realpathSync(folder) !== folder || path.dirname(folder) !== realRoot) return { keep: 'realpath mimo kořen' };
  const read = readMarker(folder);
  const marker = read?.marker;
  if (!marker || marker.schema !== MARKER_SCHEMA || marker.token !== match[2] || !Number.isSafeInteger(marker.pid) || marker.pid <= 0) return { keep: 'bez platné značky' };
  const created = Date.parse(marker.createdAt);
  if (!Number.isFinite(created)) return { keep: 'bez času vzniku' };
  return { folder, marker, raw: read.raw, created, removing: validTime(marker.uklid) };
}

/** Složku používá běžící proces: jeho pid žije a složka je mladší 24 h (starší pid už mohl dostat jiný proces). */
const inUse = (info, now, isAlive) => now - info.created <= LIMITS.maxAgeMs && isAlive(info.marker.pid);

/** Odemkne (u+rwx) každou skutečnou složku stromu; symlinky nenásleduje a jiný svazek odmítne. */
function unlockTree(top) {
  const first = fs.lstatSync(top);
  if (first.isSymbolicLink() || !first.isDirectory()) throw failure('Úklid čeká skutečnou složku.', 'EAIOS_TREE');
  const pending = [top];
  while (pending.length) {
    const dir = pending.pop();
    const before = fs.lstatSync(dir, { throwIfNoEntry: dir === top });
    if (!before) continue; // podsložku mezitím odebral souběžný úklid
    if (before.isSymbolicLink() || !before.isDirectory() || before.dev !== first.dev) throw failure('Strom se během úklidu změnil nebo vede na jiný svazek; nemaže se.', 'EAIOS_TREE');
    if (process.platform !== 'win32' && (before.mode & 0o700) !== 0o700) {
      fs.chmodSync(dir, (before.mode & 0o7777) | 0o700);
      const after = fs.lstatSync(dir);
      if (after.isSymbolicLink() || !after.isDirectory() || after.ino !== before.ino || after.dev !== before.dev) throw failure('Složka se během odemykání změnila; nemaže se.', 'EAIOS_TREE');
    }
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch (error) { if (error.code === 'ENOENT' && dir !== top) continue; throw error; }
    for (const entry of entries) if (entry.isDirectory()) pending.push(path.join(dir, entry.name));
  }
}

/** Smaže obsah (už odemčené) složky kromě `keep`; symlink maže jako odkaz, nikdy jeho cíl. */
function removeChildren(folder, keep) {
  for (const name of fs.readdirSync(folder)) if (name !== keep) fs.rmSync(path.join(folder, name), { recursive: true, force: true, maxRetries: 3 });
}

function emptyFolder(folder, keep) {
  unlockTree(folder);
  removeChildren(folder, keep);
}

/** Značka s poznámkou `uklid` (čas prvního pokusu): příští úklid takovou složku dokončí bez ohledu na pořadí. */
function markerWithIntent(raw) {
  const marker = JSON.parse(raw);
  if (!validTime(marker.uklid)) marker.uklid = new Date().toISOString();
  return JSON.stringify(marker) + '\n';
}

/** Atomicky nahradí značku verzí s poznámkou (dočasný soubor a přejmenování; odkaz na místě značky nenásleduje). */
function rememberIntent(folder, text) {
  const temp = path.join(folder, `${MARKER}.${randomBytes(6).toString('hex')}.tmp`);
  fs.writeFileSync(temp, text, { flag: 'wx', mode: 0o600 });
  fs.renameSync(temp, path.join(folder, MARKER));
}

/** Smaže ověřenou označenou složku. Značka mizí poslední; když rmdir selže, vrátí se zpět a chyba jde dál. */
function deleteMarkedFolder(info) {
  const file = path.join(info.folder, MARKER);
  const text = markerWithIntent(info.raw);
  unlockTree(info.folder);
  if (!info.removing) { try { rememberIntent(info.folder, text); } catch { /* např. plný disk: maže se i bez poznámky */ } }
  removeChildren(info.folder, MARKER);
  fs.rmSync(file, { force: true });
  try { fs.rmdirSync(info.folder); }
  catch (error) {
    if (error.code !== 'ENOENT') {
      try { fs.writeFileSync(file, text, { flag: 'wx', mode: 0o600 }); }
      catch (restore) { if (restore.code !== 'EEXIST') error.markerRestore = restore.code || restore.message; }
    }
    throw error;
  }
}

/** Smaže jednu označenou složku přímo pod kořenem; token musí odpovídat značce. Značka mizí poslední. */
export function removeRetainedFolder(root, name, token) {
  refuseRetainPreload();
  const realRoot = resolveRoot(root);
  const info = inspect(realRoot, name);
  if (!info.folder || info.marker.token !== token) throw failure('Složka nemá platnou značku tohoto testu; nemaže se.', 'EAIOS_MARKER');
  deleteMarkedFolder(info);
}

/**
 * Úklid kořene: smaže jen označené složky starší 24 h nebo mimo nejnovějších 20 dokončených a dokončí
 * rozpracované mazání (poznámka `uklid`). Složky vlastního procesu a běžících procesů mladší 24 h nechá
 * a do pořadí nepočítá: pořadí vzniká jen ze složek, které nikdo nepoužívá.
 */
export function sweepRoot(root, { now = Date.now(), isAlive = processAlive, protect = pid => pid === process.pid } = {}) {
  refuseRetainPreload();
  const realRoot = resolveRoot(root);
  const removed = [], kept = [], errors = [], finished = [];
  for (const name of fs.readdirSync(realRoot)) {
    let info;
    try { info = inspect(realRoot, name); } catch (error) { if (error.code !== 'ENOENT') errors.push({ name, error: error.code || error.message }); continue; }
    if (info.keep) { kept.push({ name, reason: info.keep }); continue; }
    if (protect(info.marker.pid)) { kept.push({ name, reason: 'vlastní proces' }); continue; }
    if (inUse(info, now, isAlive)) { kept.push({ name, reason: 'proces běží' }); continue; }
    finished.push({ name, age: now - info.created, created: info.created, removing: info.removing, token: info.marker.token });
  }
  finished.sort((a, b) => b.created - a.created || (a.name < b.name ? -1 : 1));
  let newest = 0;
  for (const item of finished) {
    if (!item.removing && item.age <= LIMITS.maxAgeMs && newest < LIMITS.keepNewest) { newest++; kept.push({ name: item.name, reason: 'nejnovější' }); continue; }
    try { removeRetainedFolder(realRoot, item.name, item.token); removed.push(item.name); }
    catch (error) { if (error.code !== 'ENOENT') errors.push({ name: item.name, error: error.code || error.message }); }
  }
  return { root: realRoot, removed, kept, errors };
}

/** Obsazené místo položky (alokované bloky, řídké soubory se nepřeceňují); symlinky nenásleduje. */
function allocatedBytes(top) {
  let bytes = 0;
  const pending = [top];
  while (pending.length) {
    const file = pending.pop();
    let stat;
    try { stat = fs.lstatSync(file); } catch { continue; }
    bytes += Number.isFinite(stat.blocks) ? stat.blocks * 512 : stat.size;
    if (stat.isDirectory()) { try { for (const name of fs.readdirSync(file)) pending.push(path.join(file, name)); } catch { /* nečitelná složka se nepočítá */ } }
  }
  return bytes;
}

/**
 * Stav kořene pro strop; jen čte. Počítá spravované složky (platná značka s tokenem z názvu) a jejich místo.
 * Zvlášť vrací živé cizí běhy (`live`: pid značky běží, není to `self`, mladší 24 h) a neoznačené položky
 * (`unmarked`: složky bez platné značky, cizí soubory a odkazy, o kterých rozhodne majitel); ty se do stropu
 * nepočítají. README kořene se počítá jen do místa.
 */
export function measureRoot(root, { now = Date.now(), isAlive = processAlive, self = process.pid } = {}) {
  const realRoot = resolveRoot(root);
  const names = [], live = [], unmarked = [];
  let bytes = 0;
  for (const entry of fs.readdirSync(realRoot, { withFileTypes: true })) {
    const full = path.join(realRoot, entry.name);
    if (entry.name === 'README.md' && entry.isFile()) { bytes += allocatedBytes(full); continue; }
    let info;
    try { info = inspect(realRoot, entry.name); } catch (error) { if (error.code === 'ENOENT') continue; info = { keep: error.code || error.message }; }
    const size = allocatedBytes(full);
    if (info.keep) unmarked.push({ name: entry.name, bytes: size, reason: info.keep });
    else if (info.marker.pid !== self && inUse(info, now, isAlive)) live.push({ name: entry.name, pid: info.marker.pid, bytes: size });
    else { names.push(entry.name); bytes += size; }
  }
  const byName = (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  return { root: realRoot, folders: names.length, bytes, names: names.sort(), live: live.sort(byName), unmarked: unmarked.sort(byName) };
}

/**
 * Správce artefaktů jednoho procesu testů: úklid kořene na začátku, vlastní označená složka,
 * TMPDIR procesu uvnitř ní, GIT_CEILING_DIRECTORIES na kořen (fixture neobjeví nadřazené repo),
 * podsložka pro každý test a rozhodnutí při ukončení procesu podle výsledku testů.
 * Při SIGINT a SIGHUP (INTERRUPT_SIGNALS) smaže složku hned celou a signál znovu vyvolá; `signals: false`
 * posluchače nezaloží (obal beh.mjs řídí signály sám: příkaz je dostane první a složka se maže až po jeho konci).
 * `discard()` smaže složku hned celou bez ohledu na výsledek; exit ji potom už nevyřizuje.
 */
export function testArtifacts({ root, label = labelFor(), readme = ROOT_README, redirectTmp = true, gitCeiling = true, signals = true } = {}) {
  refuseRetainPreload();
  const realRoot = prepareRoot(root, { readme });
  const startSweep = sweepRoot(realRoot);
  const run = createRetainedFolder(realRoot, label);
  const tmp = path.join(run.path, 'tmp');
  fs.mkdirSync(tmp, { mode: 0o700 });
  if (redirectTmp) for (const key of ['TMPDIR', 'TMP', 'TEMP']) process.env[key] = tmp;
  if (gitCeiling) process.env.GIT_CEILING_DIRECTORIES = [realRoot, ...String(process.env.GIT_CEILING_DIRECTORIES || '').split(path.delimiter).filter(Boolean)].join(path.delimiter);
  const buckets = new Map();
  let shared = null, counter = 0;
  const bucket = () => {
    const context = typeof nodeTest.getTestContext === 'function' ? nodeTest.getTestContext() : undefined;
    if (!context || !('passed' in context)) {
      if (!shared) { shared = path.join(run.path, 'spolecne'); fs.mkdirSync(shared, { mode: 0o700 }); }
      return shared;
    }
    let folder = buckets.get(context);
    if (!folder) {
      folder = path.join(run.path, `${String(++counter).padStart(3, '0')}-${slug(context.name, 24) || 'test'}`);
      fs.mkdirSync(folder, { mode: 0o700 });
      buckets.set(context, folder);
    }
    return folder;
  };
  const dir = (prefix = 'fixture-') => {
    if (typeof prefix !== 'string' || /[\\/\0]/.test(prefix) || prefix === '.' || prefix === '..') throw failure('Předpona složky nesmí obsahovat cestu.', 'EAIOS_PREFIX');
    return fs.mkdtempSync(path.join(bucket(), prefix));
  };
  const removeOwnChild = (folder) => {
    if (path.dirname(folder) !== run.path) throw failure('Podsložka mimo vlastní složku testu; nemaže se.', 'EAIOS_TREE');
    emptyFolder(folder);
    fs.rmdirSync(folder);
  };
  const onlyEmptyTmpLeft = () => {
    const left = fs.readdirSync(run.path).filter(name => name !== MARKER);
    return left.length === 0 || (left.length === 1 && left[0] === 'tmp' && fs.readdirSync(tmp).length === 0);
  };
  let settled = false; // složka je vyřízená (smazaná, nebo ponechaná k ladění): exit ani signál ji znovu nevyřizují
  const discard = () => {
    if (settled) return;
    settled = true;
    try { removeRetainedFolder(realRoot, run.name, run.token); }
    catch (error) { process.stderr.write(`Testové artefakty se nepodařilo hned smazat (${error.code || error.message}), další úklid to zkusí znovu: ${run.path}\n`); }
  };
  process.once('exit', (code) => {
    if (!settled) {
      settled = true;
      let whole = code === 0;
      try {
        if (!whole) {
          for (const [context, folder] of buckets) if (context.passed === true) removeOwnChild(folder);
          whole = onlyEmptyTmpLeft();
        }
        if (whole) removeRetainedFolder(realRoot, run.name, run.token);
      } catch (error) {
        const why = error.code || error.message;
        process.stderr.write(whole
          ? `Testové artefakty se nepodařilo hned smazat (${why}), další úklid to zkusí znovu: ${run.path}\n`
          : `Testové artefakty zůstaly k ladění (${why}): ${run.path}\n`);
      }
    }
    try { sweepRoot(realRoot, { isAlive: pid => pid !== process.pid && processAlive(pid), protect: () => false }); } catch { /* další běh uklidí znovu */ }
  });
  // Ctrl+C a zavřený terminál jdou na celou skupinu procesů, takže synchronní potomek skončí taky a posluchač se k slovu dostane.
  // Proces zacyklený v synchronním kódu ani SIGINT neuslyší; ukončí ho až SIGTERM, který záměrně nezachytáváme.
  // Událost exit po signálu nenastane, proto se uklízí tady; po úklidu `once` posluchač zmizel a signál proces ukončí jako obvykle.
  if (signals) {
    for (const signal of INTERRUPT_SIGNALS) {
      process.once(signal, () => {
        discard();
        try { process.kill(process.pid, signal); } catch { process.exit(128 + (os.constants.signals[signal] ?? 1)); }
      });
    }
  }
  return Object.freeze({ root: realRoot, run: run.path, tmp, dir, startSweep, discard });
}
