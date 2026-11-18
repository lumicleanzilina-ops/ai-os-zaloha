/**
 * Automatický záznam každé session bez /end-session. Deterministický (žádný model), bez sítě, jen čtení přepisu Claude Code
 * z `transcript_path` a zápis jednoho souboru <RRRR-MM-DD>-auto-<id8>.md. Kam: když je nastavený vault druhého mozku
 * (SECOND_BRAIN_VAULT), rovnou do <vault>/session-logs/, jinak do docs/session-logs/. Vždy jen na jedno místo: soubor se nekopíruje
 * a záznam, který session už má (resume), se dál píše tam, kde leží.
 *  - SessionStart vypíše jeden řádek kontextu s cestou k záznamu (do workspace ani vaultu nic nezapisuje, jen soukromý stav mimo ně),
 *  - Stop zapisuje nejvýš jednou za AICOS_ZAZNAM_MINUT (výchozí 5) minut na session, SessionEnd vždy,
 *  - na Stop a SessionEnd nic nejde na stdout; chyby jdou do logu ve složce stavu (runtime.logFailure).
 * Přepis se čte proudově od uloženého offsetu a jen řádky s vlastním sessionId (historie zkopírovaná při resume má cizí).
 * Soubor se přepisuje jen dokud nese `stav: automaticky-zaznam` a jeho otisk odpovídá poslednímu zápisu hooku; soubor
 * se `stav: zapsano` ani soubor, který upravil někdo jiný, hook nikdy nemění. Kontrola běží dvakrát: před čtením přepisu a znovu
 * těsně před přepsáním (čtení trvá až stovky ms, mezitím může záznam doplnit /end-session). Plánované běhy a session mimo workspace se
 * nezapisují. Když sessions ukládá Dashboard (hooky customer-sessions.mjs claude-stop/claude-end), hook nezapisuje nic.
 * Vypnutí: AICOS_ZAZNAM=off.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { brainVault, logFailure, recordsDirs, stateRoot, workspaceHash } from './runtime.mjs';
import { findBlobSecrets, redactSecrets } from './secret-guard.mjs';
import { AUTOMATED, claudeUserText, contains, dashboardHook, nfc, oneLine } from './kontext-prace.mjs';

export const ZAZNAM = Object.freeze({
  messages: 15, messageChars: 250, themeChars: 80, files: 80, commits: 40, pending: 40, resultLine: 1_000_000,
  stopMinutes: 5, stopScanMs: 800, endScanMs: 2500, chunk: 256 * 1024, maxLine: 8 * 1024 * 1024,
});
export const STAV_AUTO = 'automaticky-zaznam';
const ID = /^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$/;
const FILE_TOOLS = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit']);
const GIT_COMMIT = /\bgit\b[^\n]*\bcommit\b/;
const COMMIT_LINE = /^\[([^\]\n]+?) ([0-9a-f]{7,40})\] (.*)$/gm; // první řádek výstupu úspěšného git commit: [větev hash] předmět
// Pole `type, uuid, timestamp` a `cwd, sessionId` stojí v řádku přepisu až za velkou `message`: čas a cwd se berou z ocasu bez parsování celého řádku.
const TAIL_STAMP = /"uuid":"[0-9a-f-]{36}","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)"/;
const TAIL_CWD = /"cwd":"((?:[^"\\]|\\.)*)","sessionId":"/;
const sha = (data) => createHash('sha256').update(data).digest('hex');
const safe = (message) => Object.assign(new Error(message), { safe: true });
const real = (target) => { try { return fs.realpathSync(target); } catch { return target; } };

// ---------------------------------------------------------------- čas

const pad = (n) => String(n).padStart(2, '0');
const localDate = (ms) => { const d = new Date(ms); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const localTime = (ms) => { const d = new Date(ms); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
function localIso(ms) {
  const d = new Date(ms); const offset = -d.getTimezoneOffset(); const abs = Math.abs(offset);
  return `${localDate(ms)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${offset >= 0 ? '+' : '-'}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}
const stopMinutes = (env) => { const raw = env.AICOS_ZAZNAM_MINUT; const value = raw === undefined || raw === '' ? ZAZNAM.stopMinutes : Number(raw); return Number.isFinite(value) && value >= 0 ? value : ZAZNAM.stopMinutes; };

// ---------------------------------------------------------------- cesty a stav

const stateFileOf = (env, root, id) => path.join(stateRoot(env), 'zaznam', workspaceHash(root), id + '.json');
function atomicWrite(file, text) { // deterministické jméno dočasného souboru: nic se nehromadí, hook nikdy nemaže
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const temporary = file + '.tmp'; fs.writeFileSync(temporary, text, { mode: 0o600 }); fs.renameSync(temporary, file);
}
const readState = (file) => { try { const value = JSON.parse(fs.readFileSync(file, 'utf8')); return value && value.v === 1 ? value : null; } catch { return null; } };
const freshState = (id, now) => ({
  v: 1, id, file: null, dir: null, cwd: null, cwdFirst: null, startedAt: now, lastRun: 0, offset: 0, firstTs: null, lastTs: null,
  theme: '', messages: [], messageCount: 0, files: [], fileCount: 0, commits: [], commitCount: 0,
  pendingFiles: {}, pendingCommits: {}, automated: false, skip: null, sha: null, pending: null, note: null,
});
const resetExtraction = (state) => Object.assign(state, { ...freshState(state.id, state.startedAt), file: state.file, dir: state.dir, cwd: state.cwd, sha: state.sha, pending: state.pending, lastRun: state.lastRun });

/** Cesta cwd relativně k workspace ('.' = kořen), nebo null, když leží mimo. */
function relativeCwd(root, cwd) {
  for (const base of [root, real(root)]) if (contains(base, cwd)) return nfc(cwd).slice(nfc(base).length).replace(/^[\\/]+/, '').split(path.sep).join('/') || '.';
  return null;
}
/** Cesta souboru do záznamu: relativně k workspace, mimo něj `~/…` (domov) nebo absolutně. */
function displayPath(target, root, home) {
  const absolute = path.resolve(String(target));
  const inRoot = relativeCwd(root, absolute); if (inRoot !== null) return inRoot;
  for (const base of [home, real(home)]) if (base && contains(base, absolute)) return '~/' + nfc(absolute).slice(nfc(base).length).replace(/^[\\/]+/, '').split(path.sep).join('/');
  return absolute;
}

function frontmatter(text) {
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text.slice(0, 4096)); const out = {};
  if (!block) return out;
  for (const line of block[1].split(/\r?\n/)) { const pair = /^([A-Za-z_][\w-]*):\s*(.*?)\s*$/.exec(line); if (pair) out[pair[1]] = pair[2].replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1'); }
  return out;
}
/**
 * Záznam této session, který už leží v některé ze složek záznamů (resume): soubor *-auto-<id8>.md, jehož frontmatter nese tentýž
 * session_id. Hledá se v obou složkách (vault i docs/session-logs): session, která začala před nastavením vaultu, tak dál píše do svého
 * souboru a nevznikne druhý. Vrací { dir, name }, nebo null.
 */
function findRecord(root, env, id) {
  const suffix = `-auto-${id.slice(0, 8)}.md`;
  for (const dir of recordsDirs(root, env)) {
    let names; try { names = fs.readdirSync(dir); } catch { continue; }
    for (const name of names.sort()) {
      if (!name.endsWith(suffix) || !/^\d{4}-\d{2}-\d{2}-auto-/.test(name)) continue;
      try { if (frontmatter(fs.readFileSync(path.join(dir, name), 'utf8').slice(0, 4096)).session_id === id) return { dir, name }; } catch { /* nečitelný soubor není záznam této session */ }
    }
  }
  return null;
}
/**
 * Složka záznamu této session: uložená ve stavu, jinak ta, ve které soubor se stavovým jménem leží (stav z doby před vaultem složku
 * nenese), jinak složka, do které se píše teď. Stav se přitom nemění.
 */
function recordDir(root, env, state) {
  const dirs = recordsDirs(root, env);
  if (state.dir) return state.dir;
  if (state.file) return dirs.find((dir) => fs.existsSync(path.join(dir, state.file))) ?? dirs[0];
  return dirs[0];
}
/**
 * Může hook soubor přepsat? Jen když je to jeho soubor (stav automaticky-zaznam, tatáž session) a od posledního zápisu se nezměnil.
 * S `expected` (otisk z první kontroly téhož běhu) jde o druhou kontrolu těsně před zápisem: soubor musí mít přesně ten obsah, který
 * první kontrola viděla, a zmizelý soubor se nikdy nezakládá znovu.
 */
function checkTarget(target, state, id, expected = null) {
  let data;
  try { data = fs.readFileSync(target); } catch (error) { if (error.code === 'ENOENT') return state.sha || expected ? { ok: false, why: 'soubor zmizel (smazán nebo přesunut)' } : { ok: true, exists: false }; throw error; }
  const fm = frontmatter(data.toString('utf8'));
  if (fm.stav !== STAV_AUTO) return { ok: false, why: `stav je ${fm.stav ?? '(chybí)'}, doplnil ho člověk nebo /end-session` };
  if (fm.session_id !== id) return { ok: false, why: 'soubor patří jiné session' };
  const hash = sha(data);
  if (expected ? hash !== expected : hash !== state.sha && hash !== state.pending) return { ok: false, why: expected ? 'soubor se změnil během čtení přepisu, někdo ho upravil souběžně' : 'soubor od posledního zápisu hooku upravil někdo jiný' };
  return { ok: true, exists: true, sha: hash };
}

// ---------------------------------------------------------------- čtení přepisu

/** Čte řádky od `start` do `end` po blocích. Vrací offset za posledním celým řádkem; řádek delší než maxLine se přeskočí bez načtení. */
function scanLines(fd, start, end, visit, { clock, deadline }) {
  const buffer = Buffer.allocUnsafe(ZAZNAM.chunk);
  let position = start; let consumed = start; let carry = null; let skipping = false;
  while (position < end) {
    if (clock() > deadline) return { offset: consumed, done: false };
    const read = fs.readSync(fd, buffer, 0, Math.min(ZAZNAM.chunk, end - position), position);
    if (read <= 0) break;
    const view = buffer.subarray(0, read); let from = 0;
    for (;;) {
      const newline = view.indexOf(10, from);
      if (newline === -1) {
        if (!skipping) { const rest = view.subarray(from); carry = carry ? Buffer.concat([carry, rest]) : Buffer.from(rest); if (carry.length > ZAZNAM.maxLine) { carry = null; skipping = true; } }
        break;
      }
      if (skipping) { skipping = false; carry = null; }
      else { const part = view.subarray(from, newline); const data = carry ? Buffer.concat([carry, part]) : part; carry = null; if (data.length <= ZAZNAM.maxLine) visit(data.toString('utf8')); }
      consumed = position + newline + 1; from = newline + 1;
    }
    position += read;
  }
  return { offset: consumed, done: true };
}

const pushUnique = (list, value, max) => { if (!list.includes(value) && list.length < max) list.push(value); };
function timeOf(o) { const ms = Date.parse(o?.timestamp); return Number.isFinite(ms) ? ms : null; }
const textOf = (content) => (typeof content === 'string' ? content : Array.isArray(content) ? content.filter((b) => typeof b?.text === 'string').map((b) => b.text).join('\n') : '');

/** Zpracuje nové řádky přepisu a doplní stav (zprávy, soubory, commity). */
function extract(state, transcript, ctx, budgetMs) {
  const { id, root, home, clock, redact } = ctx;
  const fd = fs.openSync(transcript, 'r');
  try {
    const size = fs.fstatSync(fd).size;
    if (size < state.offset) resetExtraction(state); // přepis se zkrátil nebo vznikl znovu
    const marker = `"sessionId":"${id}"`;
    const clean = (text, max) => oneLine(redact(String(text).slice(0, 4000)), max);
    const touch = (o) => { const ms = timeOf(o); if (ms !== null) state.lastTs = Math.max(state.lastTs ?? 0, ms); if (state.cwdFirst === null && typeof o.cwd === 'string') state.cwdFirst = o.cwd; };
    const handle = (line) => {
      if (!line.includes(marker)) return; // cizí sessionId (historie z resume) i řádky bez něj se přeskočí bez parsování
      const tail = line.length > 1500 ? line.slice(-1500) : line; // čas poslední aktivity a první cwd z ocasu řádku, bez parsování
      const stamp = TAIL_STAMP.exec(tail); if (stamp) { const ms = Date.parse(stamp[1]); if (Number.isFinite(ms) && ms > (state.lastTs ?? 0)) state.lastTs = ms; }
      if (state.cwdFirst === null) { const where = TAIL_CWD.exec(tail); if (where) { try { state.cwdFirst = JSON.parse('"' + where[1] + '"'); } catch { /* neplatný escape: cwd se zjistí z parsovaného řádku */ } } }
      if (line.includes('"type":"user"')) {
        if (line.includes('"type":"tool_result"')) {
          if (line.length > ZAZNAM.resultLine) return; // výstup Write, Edit i git commit je malý; obří výsledky jiných nástrojů se nehledají
          const pending = Object.keys(state.pendingFiles).concat(Object.keys(state.pendingCommits));
          if (!pending.some((key) => line.includes(key))) return;
          let o; try { o = JSON.parse(line); } catch { return; }
          touch(o);
          for (const block of Array.isArray(o.message?.content) ? o.message.content : []) {
            if (block?.type !== 'tool_result') continue;
            const key = block.tool_use_id; const failed = block.is_error === true;
            if (Object.hasOwn(state.pendingFiles, key)) { if (!failed) { const shown = clean(displayPath(state.pendingFiles[key], root, home), 200); if (shown) { state.fileCount += state.files.includes(shown) ? 0 : 1; pushUnique(state.files, shown, ZAZNAM.files); } } delete state.pendingFiles[key]; }
            if (Object.hasOwn(state.pendingCommits, key)) {
              if (!failed) for (const m of textOf(block.content).matchAll(COMMIT_LINE)) { state.commitCount++; if (state.commits.length < ZAZNAM.commits) state.commits.push({ hash: m[2], subject: clean(m[3], 120) }); }
              delete state.pendingCommits[key];
            }
          }
          return;
        }
        let o; try { o = JSON.parse(line); } catch { return; }
        if (o.type !== 'user') return;
        touch(o);
        const found = claudeUserText(o);
        if (found === AUTOMATED) { if (state.messageCount === 0) state.automated = true; return; }
        if (!found) return;
        const text = clean(found, ZAZNAM.messageChars); if (!text) return;
        state.messageCount++;
        if (state.messageCount === 1) { state.theme = clean(found, ZAZNAM.themeChars); state.firstTs = timeOf(o) ?? state.startedAt; }
        if (state.messages.length < ZAZNAM.messages) state.messages.push(text);
      } else if (line.includes('"type":"assistant"') && line.includes('"type":"tool_use"')) {
        if (!/"name":"(?:Write|Edit|MultiEdit|NotebookEdit|Bash)"/.test(line)) return;
        let o; try { o = JSON.parse(line); } catch { return; }
        touch(o);
        for (const block of Array.isArray(o.message?.content) ? o.message.content : []) {
          if (block?.type !== 'tool_use' || typeof block.id !== 'string') continue;
          const input = block.input ?? {}; let target;
          if (FILE_TOOLS.has(block.name)) { target = input.file_path ?? input.notebook_path ?? input.path; if (typeof target === 'string' && target) state.pendingFiles[block.id] = target; }
          else if (block.name === 'Bash' && typeof input.command === 'string' && GIT_COMMIT.test(input.command)) state.pendingCommits[block.id] = 1;
        }
        for (const bag of [state.pendingFiles, state.pendingCommits]) for (const key of Object.keys(bag).slice(0, Math.max(0, Object.keys(bag).length - ZAZNAM.pending))) delete bag[key];
      }
    };
    const result = scanLines(fd, state.offset, size, handle, { clock, deadline: clock() + budgetMs });
    state.offset = result.offset;
    return result;
  } finally { fs.closeSync(fd); }
}

// ---------------------------------------------------------------- záznam

function compose(state, name, inVault = false) {
  const first = state.firstTs ?? state.startedAt; const moreMessages = state.messageCount - state.messages.length;
  const moreFiles = state.fileCount - state.files.length; const moreCommits = state.commitCount - state.commits.length;
  const list = (items, empty) => (items.length ? items : [empty]);
  return [
    '---', 'typ: SessionLog', ...(inVault ? ['type: SessionLog'] : []), `date: ${name.slice(0, 10)}`, 'hostitel: Claude Code', `session_id: ${state.id}`,
    `cwd: ${JSON.stringify(state.cwd ?? '.')}`, `tema: ${JSON.stringify(state.theme)}`, `naposledy: ${localIso(state.lastTs ?? first)}`, `stav: ${STAV_AUTO}`, '---', '',
    `# Session Log — ${name.slice(0, 10)} ${localTime(first)}`, '',
    '> Automatický záznam hooku `zaznam-session`. Dokud je `stav: automaticky-zaznam`, hook sekce níž přepisuje. `/end-session` (nebo uzavření dne) sem doplní shrnutí a přepne `stav` na `zapsano`; potom hook soubor nemění.', '',
    '## Zadání', '',
    ...list(state.messages.map((m) => `- ${m}`), '- (žádné)'), ...(moreMessages > 0 ? [`- … a dalších ${moreMessages} zpráv`] : []), '',
    '## Soubory', '',
    ...list(state.files.map((f) => `- \`${f.replace(/`/g, "'")}\``), '- žádné'), ...(moreFiles > 0 ? [`- … a dalších ${moreFiles} souborů`] : []), '',
    '## Commity', '',
    ...list(state.commits.map((c) => `- \`${c.hash}\` ${c.subject}`), '- žádné'), ...(moreCommits > 0 ? [`- … a dalších ${moreCommits} commitů`] : []), '',
  ].join('\n');
}

function context(text) { return { hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: text } }; }
/** Cesta záznamu pro agenta: v docs/session-logs relativně k workspace (jako dosud), ve vaultu absolutně. */
const shownPath = (root, dir, name) => (path.resolve(dir) === path.join(path.resolve(root), 'docs', 'session-logs') ? `docs/session-logs/${name}` : path.join(dir, name));

function start(input, ctx) {
  const { root, env, id, now, dashboard } = ctx;
  const cwd = relativeCwd(root, input.cwd);
  if (cwd === null) return null; // session mimo workspace
  if (dashboard) return context('Záznam této session vede Dashboard; hook kitu ho nezapisuje.');
  const stateFile = stateFileOf(env, root, id); let state = readState(stateFile);
  const known = state?.file ? null : findRecord(root, env, id);
  const name = state?.file ?? known?.name ?? `${localDate(now)}-auto-${id.slice(0, 8)}.md`;
  // Složka se uloží i se jménem: záznam zůstane tam, kde vznikl, i když se vault mezitím nastaví nebo změní (jedna session = jeden soubor).
  const dir = state?.file ? recordDir(root, env, state) : known?.dir ?? recordsDirs(root, env)[0];
  if (!state || !state.file) { state ??= freshState(id, now); state.file = name; state.dir = dir; state.cwd ??= cwd; atomicWrite(stateFile, JSON.stringify(state) + '\n'); }
  return context(`Záznam této session vede hook do \`${shownPath(root, dir, name)}\`; /end-session ho doplní.`);
}

function record(input, event, ctx) {
  const { root, env, id, now, clock } = ctx;
  const stateFile = stateFileOf(env, root, id);
  const state = readState(stateFile) ?? freshState(id, now);
  const save = () => atomicWrite(stateFile, JSON.stringify(state) + '\n');
  if (state.skip) return;
  if (state.cwd === null && state.cwdFirst === null && typeof input.cwd === 'string' && relativeCwd(root, input.cwd) === null) return; // session mimo workspace: bez stavu a bez zápisu
  const minutes = stopMinutes(env);
  if (event === 'Stop' && state.lastRun && now - state.lastRun < minutes * 60000) return;
  const transcript = input.transcript_path;
  if (typeof transcript !== 'string' || !path.isAbsolute(transcript) || !transcript.endsWith('.jsonl')) throw safe('transcript_path chybí nebo není cesta k přepisu .jsonl');
  const blocked = (why) => { if (state.note !== why) { state.note = why; logFailure(root, 'zaznam', safe(`záznam ${state.file ?? id} se nepřepisuje: ${why}`), env); } state.lastRun = now; save(); };
  let gate = { ok: true, exists: false };
  let target = state.file ? path.join(recordDir(root, env, state), state.file) : null;
  if (!target) { const known = findRecord(root, env, id); if (known) { state.file = known.name; state.dir = known.dir; target = path.join(known.dir, known.name); } }
  if (target) { gate = checkTarget(target, state, id); if (!gate.ok) return blocked(gate.why); }
  extract(state, transcript, ctx, event === 'SessionEnd' ? ZAZNAM.endScanMs : ZAZNAM.stopScanMs);
  state.lastRun = now;
  const rel = state.cwd ?? relativeCwd(root, state.cwdFirst ?? input.cwd);
  if (rel === null) { state.skip = 'outside'; return save(); }
  state.cwd ??= rel;
  if (state.automated) { state.skip = 'automated'; return save(); }
  if (!state.messageCount) return save(); // zatím žádná skutečná zpráva uživatele: soubor nevznikne
  const name = state.file ?? `${localDate(state.firstTs ?? now)}-auto-${id.slice(0, 8)}.md`;
  if (!state.file) { state.file = name; state.dir = recordsDirs(root, env)[0]; target = path.join(state.dir, name); gate = checkTarget(target, state, id); if (!gate.ok) return blocked(gate.why); }
  const dir = recordDir(root, env, state); const vault = brainVault(env);
  const content = compose(state, name, vault !== null && path.resolve(dir) === path.join(vault, 'session-logs'));
  const leaks = findBlobSecrets(Buffer.from(content), name);
  if (leaks.length) { logFailure(root, 'zaznam', safe(`záznam ${name} obsahuje tvar tajemství (${[...new Set(leaks.map((leak) => leak.what))].join(', ')}), nezapsáno`), env); return save(); }
  const hash = sha(content);
  if (gate.exists && hash === state.sha) return save(); // beze změny obsahu se nezapisuje
  state.pending = hash; save(); // otisk předem: kdyby proces padl mezi zápisem souboru a uložením stavu, soubor zůstane poznatelně jeho
  fs.mkdirSync(dir, { recursive: true });
  if (gate.exists) {
    // Čtení přepisu trvá až stovky ms a /end-session (nebo uzavření dne v jiné session) mohlo mezitím záznam doplnit. Proto se otisk i stav
    // ověří znovu až tady, těsně před přepsáním; při rozdílu se nezapíše nic a důvod jde do logu. Zbývá jen okno jednoho zápisu dočasného
    // souboru (zlomek ms), úplně by ho uzavřel až zámek souboru, o kterém /end-session neví.
    const again = checkTarget(target, state, id, gate.sha);
    if (!again.ok) return blocked(again.why);
    const temporary = path.join(dir, `.${name}.tmp`); fs.writeFileSync(temporary, content); fs.renameSync(temporary, target);
  } else fs.writeFileSync(target, content, { flag: 'wx' }); // wx: soubor, který mezitím vznikl jinde, se nepřepíše
  state.sha = hash; state.pending = null; state.note = null; save();
}

function eventOf(input) {
  const name = input.hook_event_name;
  if (['SessionStart', 'Stop', 'SessionEnd'].includes(name)) return name;
  if (name !== undefined) return null;
  return 'reason' in input ? 'SessionEnd' : 'stop_hook_active' in input ? 'Stop' : 'source' in input ? 'SessionStart' : null;
}

/**
 * Akce `zaznam-session`. SessionStart vrací kontext (nebo null), Stop a SessionEnd vždy null. Žádná chyba nevyletí ven:
 * jde do logu ve složce stavu.
 */
export function zaznamSession(payload, { root, env = process.env, home = os.homedir(), now = Date.now(), clock = Date.now, redact = redactSecrets } = {}) {
  if (env.AICOS_ZAZNAM === 'off') return null;
  const input = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {};
  const event = eventOf(input); const id = typeof input.session_id === 'string' && ID.test(input.session_id) ? input.session_id : null;
  if (!event || !id) return null;
  try {
    const ctx = { root, env, home, id, now, clock, redact, dashboard: dashboardHook('claude', [['Stop', 'stop'], ['SessionEnd', 'end']], { env, home }) };
    if (event === 'SessionStart') return start(input, ctx);
    if (!ctx.dashboard) record(input, event, ctx);
  } catch (error) { logFailure(root, 'zaznam-' + event, error, env); }
  return null;
}
