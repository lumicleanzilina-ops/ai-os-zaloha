import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { git, inside, stateRoot, workspaceHash, writeJson, readJson, deny } from './runtime.mjs';
import { checkStaged } from './secret-guard.mjs';

const LAYOUT = new Set(['work', 'personal', 'outputs', 'inputs', 'scratch', 'projects']);

export function rootWrites(payload, { root, env = process.env } = {}) {
  if (env.AICOS_GUARD_ROOT === 'off') return null;
  const file = payload.tool_input?.file_path;
  if (typeof file !== 'string' || !file) return deny('Missing file_path; root protection NOT VERIFIED.');
  const absolute = path.resolve(payload.cwd || root, file);
  if (!inside(root, absolute)) return null; // Root hygiene is not a workspace sandbox.
  const relative = path.relative(root, absolute); const parts = relative.split(path.sep);
  if (parts.length === 1 && !fs.existsSync(absolute) && !parts[0].startsWith('.')) return deny('Nový volný soubor v kořeni workspace: ulož ho do outputs/, scratch/, docs/ nebo do složky projektu (Tvrdé pravidlo 6 v AGENTS.md).');
  // Soukromý doklad dokončení kitu (tools/kit-completion.mjs, docs/STAV-INSTALACE.md) je jediný soubor, který smí agent bez ptaní založit i v dosud
  // neexistující skryté složce `.ai-os/`; jiný obsah `.ai-os/` a jiné skryté složky dál ne.
  if (parts.length === 2 && parts[0] === '.ai-os' && parts[1] === 'kit-completion.json') return null;
  // The documented workspace layout may always be created (onboarding, upgrade from V.03 without outputs/ or scratch/).
  if (parts.length > 1 && !LAYOUT.has(parts[0]) && !fs.existsSync(path.join(root, parts[0]))) return deny('Nová složka v kořeni workspace: bez ptaní jde work/, personal/, outputs/, inputs/, scratch/ a projects/. Jinou nejdřív odsouhlas s uživatelem a pak ji založ přes mkdir.');
  return null;
}

export function checkpoint(payload, { root, env = process.env, run = spawnSync } = {}) {
  if (env.AICOS_CHECKPOINTS === 'off') return { status: 'disabled' };
  if (!['Bash', 'PowerShell', 'Write', 'Edit', 'MultiEdit'].includes(payload.tool_name)) throw new Error('Unsupported checkpoint tool; protection NOT VERIFIED');
  const shell = ['Bash', 'PowerShell'].includes(payload.tool_name);
  const command = payload.tool_input?.command ?? payload.tool_input?.cmd;
  if (shell && typeof command !== 'string') throw new Error('Missing shell input; checkpoint NOT VERIFIED');
  // Conservatively snapshot all shell calls. A regex cannot prove an arbitrary command read-only.
  const state = stateRoot(env);
  if (inside(root, state)) throw new Error('Checkpoint state must be outside the workspace');
  const shadow = path.join(state, 'checkpoints', `${path.basename(root)}-${workspaceHash(root)}.git`);
  const noHooks = path.join(state, 'checkpoint-hooks-disabled');
  fs.mkdirSync(noHooks, { recursive: true, mode: 0o700 });
  if (!fs.existsSync(shadow)) {
    git(['init', '--bare', '--quiet', shadow], { cwd: root, run });
    fs.writeFileSync(path.join(shadow, 'info', 'exclude'), '.git/\n', { mode: 0o600 });
  }
  const prefix = ['--git-dir=' + shadow, '--work-tree=' + root, '-c', 'core.hooksPath=' + noHooks];
  const call = (args) => git([...prefix, ...args], { cwd: root, run });
  call(['add', '-A']);
  const leaks = checkStaged(root, { run, gitArgs: prefix });
  if (leaks.length) {
    // Jen názvy souborů, nikdy hodnoty. entry.mjs tuhle zprávu propustí, aby zákazník věděl, co udělat.
    const files = [...new Set(leaks.map((leak) => leak.origin).filter(Boolean))].slice(0, 5);
    throw Object.assign(new Error('Checkpoint contains a credential pattern'), {
      userMessage: `Pojistka AI OS zastavila úpravy: ${files.join(', ') || 'jeden ze souborů ve workspace'} obsahuje něco, co vypadá jako klíč, token nebo heslo. Přesuň ten soubor mimo workspace (do .secrets/ nebo do správce hesel), nebo ho přidej do .gitignore, a zkus to znovu. Hodnotu nikam nevypisuj.`,
    });
  }
  const diff = run('git', [...prefix, 'diff', '--cached', '--quiet'], { cwd: root, encoding: 'utf8', timeout: 30000, windowsHide: true });
  if (diff.error || diff.signal || ![0, 1].includes(diff.status)) throw new Error('Checkpoint diff failed; protection NOT VERIFIED');
  if (diff.status === 1) call(['-c', 'user.name=AI OS checkpoint', '-c', 'user.email=checkpoint@aicos.local', 'commit', '--quiet', '-m', 'before ' + (payload.tool_name || 'edit') + ' @ ' + new Date().toISOString()]);
  const commit = call(['rev-parse', 'HEAD']).trim();
  const receipt = { status: 'verified', root, shadow, commit, at: new Date().toISOString(), ignoredFiles: 'not-covered' };
  writeJson(path.join(state, 'state', workspaceHash(root) + '.checkpoint.json'), receipt);
  return receipt;
}

export function skillUsage(payload, { root } = {}) {
  if (!fs.existsSync(path.join(root, 'skills'))) return;
  const input = payload.tool_input; const candidate = typeof input === 'string' ? input : ['skill', 'name', 'skill_name', 'skillName', 'command', 'slug'].map((key) => input?.[key]).find(Boolean);
  if (typeof candidate !== 'string') return;
  const name = candidate.trim().replace(/^\//, '').split(/\s+/)[0]; if (!name) return;
  const file = path.join(root, 'skills', '.usage.json'); const ledger = readJson(file, {});
  const previous = ledger[name]; ledger[name] = { use_count: Number(previous?.use_count || 0) + 1, last_used: new Date().toISOString().slice(0, 10) };
  writeJson(file, ledger);
}

// Receiving one callback does not prove Git, checkpoints or the other hooks work.
export const HOOKS_MARKER = 'AI OS SessionStart přijat';
const PROFILE = ['user-profile.md', 'user-preferences.md', 'user-systems.md'];
const PROFILE_LIMIT = 6000;

// Rozcestník learningů. Plný docs/learnings/INDEX.md se vkládá, dokud je malý: když by výstup hooku s ním (bez profilu) přesáhl
// strop, vloží se výběr řádků „spouštěč → soubor“ po sekcích ## a celý výstup (JSON obal, úvod, profil, hlavička, řádek o playbooku)
// se vejde do stropu v bajtech UTF-8. Profil má přednost a kvůli rozcestníku se nikdy nezkracuje (platí jen jeho dosavadní limit
// 6000 znaků): rozcestník (včetně hlavičky s názvem, počtem pravidel a větou o grepu) dostane, co po profilu ze stropu zbývá, nejméně
// však DIGEST_MIN_BYTES. Velký profil proto může výstup přenést přes strop, a to o profil a o toto minimum. Všechno se měří stejně: v bajtech
// UTF-8 tak, jak výstup hook vypíše. Počítá se za běhu, žádný soubor se negeneruje.
export const LEARNINGS_BYTES = 5 * 1024;
export const DIGEST_MIN_BYTES = 1500;
const SEVERITY = [/\u{1F534}/u, /⚠/u]; // 🔴 kritické, ⚠️ zvýšená závažnost
const FILE_REF = /\[([^\]]*)\]\(\s*<?([^)\s>]+?\.md)(?:#[^)\s>]*)?>?(?:\s+"[^"]*")?\s*\)|`([^`\s]+\.md)`|(?<![\w./-])(\w[\w./-]*\.md)(?![\w-])/;
const outputBytes = (text) => Buffer.byteLength(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: text } }) + '\n');
const escapedBytes = (text) => Buffer.byteLength(JSON.stringify(text)) - 2; // bajty textu uvnitř JSON řetězce (bez uvozovek), tedy tolik, kolik přidá k výstupu
const tierOf = (text) => { const index = SEVERITY.findIndex((pattern) => pattern.test(text)); return index < 0 ? 2 : index; };
const shorten = (text, max) => { const chars = Array.from(text); return chars.length > max ? chars.slice(0, max - 1).join('').trimEnd() + '…' : text; };
const sliceChars = (text, max) => { let end = Math.min(max, text.length); if (end > 0 && end < text.length && /[\uD800-\uDBFF]/.test(text[end - 1])) end--; return text.slice(0, end); };

/** Nejnovější datum v řádku (ISO RRRR-MM-DD nebo české D. M. RRRR), jinak null. */
function dateOf(line) {
  let best = null;
  for (const m of line.matchAll(/(?<!\d)(20\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(?!\d)/g)) best = Math.max(best ?? 0, Date.UTC(+m[1], +m[2] - 1, +m[3]));
  for (const m of line.matchAll(/(?<!\d)(0?[1-9]|[12]\d|3[01])\.\s*(0?[1-9]|1[0-2])\.\s*(20\d{2})(?!\d)/g)) best = Math.max(best ?? 0, Date.UTC(+m[3], +m[2] - 1, +m[1]));
  return best;
}
const cleanTrigger = (text) => text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\*\*|__|`/g, '').replace(/[\u{1F534}⚠️]/gu, '')
  .replace(/\s+/g, ' ').replace(/^[\s|:→>–—-]+/, '').replace(/[\s|:→>–—(-]+$/, '').trim();

/** Řádek INDEXu, který odkazuje na soubor .md: řádek tabulky nebo odrážka. Jiné řádky (nadpisy, úvod, prózu) rozcestník vynechává. */
function indexEntry(raw) {
  if (raw.length > 4000) return null; // řádek rejstříku je jedna věta, ne dokument
  const line = raw.trim(); const row = line.startsWith('|'); const item = /^(?:[-*+]|\d+[.)])\s+/.exec(line);
  if (!row && !item) return null;
  const ref = FILE_REF.exec(line); if (!ref) return null;
  const file = (ref[2] ?? ref[3] ?? ref[4]).replace(/^\.\//, '');
  const before = line.slice(item ? item[0].length : 0, ref.index);
  // Spouštěč je text před odkazem (u tabulky buňky vlevo); odkaz na začátku řádku: text odkazu, jinak popis za ním.
  let trigger = (row ? before.split('|').map(cleanTrigger).filter(Boolean).join(' · ') : cleanTrigger(before));
  if (!trigger) trigger = cleanTrigger(ref[1] && ref[1] !== file ? ref[1] : line.slice(ref.index + ref[0].length));
  const mark = SEVERITY[0].test(line) ? ' 🔴' : SEVERITY[1].test(line) ? ' ⚠️' : '';
  return { text: `- ${shorten(trigger || file, 110)} → ${file}${mark}`, tier: tierOf(line), date: dateOf(line) };
}
/** Sekce ## s řádky INDEXu v pořadí souboru. Řádky před prvním ## tvoří sekci bez nadpisu; sekce bez řádků odpadnou. */
function indexSections(text) {
  const sections = [{ title: '', entries: [] }]; let current = sections[0]; let order = 0;
  for (const raw of text.split(/\r?\n/)) {
    const heading = /^##(?!#)\s+(.*\S)\s*$/.exec(raw);
    if (heading) { current = { title: shorten(heading[1].replace(/\s*#+$/, '').trim(), 80), entries: [] }; sections.push(current); continue; }
    const entry = indexEntry(raw);
    if (entry) { entry.order = order++; current.entries.push(entry); }
  }
  return sections.filter((section) => section.entries.length);
}
// Přednost v sekci: 🔴, potom ⚠️, potom nejnovější (podle data v řádku, jinak novější = níž v souboru); řádky s datem před řádky bez něj.
const recency = (a, b) => (a.date !== null && b.date !== null && a.date !== b.date ? b.date - a.date : (a.date !== null) === (b.date !== null) ? b.order - a.order : a.date !== null ? -1 : 1);
/** Vybere nejvíc řádků, které se ještě vejdou (fits). Každá sekce dostane nejdřív svůj nejlepší řádek, potom se doplňuje po stupních závažnosti. */
function digestLines(sections, fits) {
  for (const section of sections) {
    section.ranked = section.entries.slice().sort((a, b) => a.tier - b.tier || recency(a, b));
    const seen = [0, 0, 0]; for (const entry of section.ranked) entry.tierRank = seen[entry.tier]++;
  }
  const picked = sections.map(() => new Set());
  const lines = () => {
    const out = []; let omitted = 0;
    sections.forEach((section, index) => {
      const shown = section.entries.filter((entry) => picked[index].has(entry)); // zobrazení v pořadí souboru
      if (!shown.length) { omitted += section.entries.length; return; }
      if (out.length) out.push('');
      if (section.title) out.push('## ' + section.title);
      for (const entry of shown) out.push(entry.text);
      if (shown.length < section.entries.length) out.push(`… +${section.entries.length - shown.length} dalších v INDEX.md`);
    });
    if (omitted) out.push('', `… +${omitted} dalších v INDEX.md (sekce bez výběru)`);
    return out.length ? ['', ...out, ''] : out; // prázdný řádek před výběrem a za ním
  };
  // Řádek, který se nevejde, sekci uzavře: kratší řádek s nižší přednostní se do ní nedostane přes něj (výběr je vždy začátek pořadí).
  const closed = new Set();
  const add = (index, entry) => { picked[index].add(entry); if (fits(lines())) return; picked[index].delete(entry); closed.add(index); };
  sections.forEach((section, index) => add(index, section.ranked[0]));
  const queue = sections.flatMap((section, index) => section.ranked.map((entry) => ({ index, entry })))
    .sort((a, b) => a.entry.tier - b.entry.tier || a.entry.tierRank - b.entry.tierRank || a.index - b.index);
  for (const { index, entry } of queue) if (!closed.has(index) && !picked[index].has(entry)) add(index, entry);
  return lines();
}
/** INDEX bez jediného řádku s odkazem na .md: aspoň začátek souboru, kolik se vejde. */
function digestHead(index, fits) {
  const note = '… (zkráceno, zbytek v INDEX.md)'; const lines = [];
  for (const raw of index.split(/\r?\n/)) { lines.push(raw); if (!fits([...lines, note])) { lines.pop(); break; } }
  return [...lines, note];
}

export function learningsIndex(_payload, { root } = {}) {
  const intro = HOOKS_MARKER + ': funguje tento startovací callback. Ostatní pojistky a checkpoint tím nejsou ověřené; zkontroluj aktivační protokol a skutečný callback PreToolUse.\n';
  // Profil uživatele z docs/profil/ rovnou do kontextu: „co o mně víš?“ pak nezávisí na tom, jestli si ho agent přečte sám.
  let profile = '';
  for (const name of PROFILE) {
    const file = path.join(root, 'docs', 'profil', name);
    if (fs.existsSync(file)) profile += '\n--- docs/profil/' + name + ' ---\n' + fs.readFileSync(file, 'utf8').trim() + '\n';
  }
  const profileBlock = () => (profile ? '\nProfil uživatele (docs/profil/):' + (profile.length > PROFILE_LIMIT ? sliceChars(profile, PROFILE_LIMIT) + '\n… (zkráceno, zbytek si přečti v docs/profil/)\n' : profile) + '\n' : '');
  let learnings = null; let playbook = '';
  for (const [relative, title] of [['docs/learnings', 'Your institutional memory'], ['docs/playbook', 'General craft playbook']]) {
    const dir = path.join(root, relative); const index = path.join(dir, 'INDEX.md');
    if (!fs.existsSync(index)) continue;
    const count = fs.readdirSync(dir).filter((name) => name.endsWith('.md') && !['README.md', 'INDEX.md'].includes(name)).length;
    if (!count) continue;
    const line = title + ' (' + count + ' rules): ' + relative + '/INDEX.md\n';
    if (relative === 'docs/learnings') learnings = { line, index: fs.readFileSync(index, 'utf8') }; else playbook += line;
  }
  const wrap = (text) => ({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: text } });
  const full = learnings ? learnings.line + learnings.index + '\n' : '';
  // Malý INDEX (s obalem: JSON, úvod, řádek o playbooku) se vkládá celý, jako dosud.
  if (!learnings || outputBytes(intro + full + playbook) <= LEARNINGS_BYTES) return wrap(intro + profileBlock() + full + playbook);
  const head = learnings.line + 'Když tvůj případ chybí, prohledej `docs/learnings/INDEX.md` grepem.\n';
  const before = intro + profileBlock(); // profil celý a vždy
  // Místo pro hlavičku a rozcestník dohromady: co po profilu zbývá ze stropu, nejméně však garantované minimum (i když kvůli němu výstup strop přeroste).
  const room = Math.max(LEARNINGS_BYTES - outputBytes(before + playbook), DIGEST_MIN_BYTES);
  const fits = (lines) => escapedBytes(head + (lines.length ? lines.join('\n') + '\n' : '')) <= room;
  const sections = indexSections(learnings.index);
  const lines = sections.length ? digestLines(sections, fits) : digestHead(learnings.index, fits);
  while (lines.length && !fits(lines)) lines.pop();
  return wrap(before + head + (lines.length ? lines.join('\n') + '\n' : '') + playbook);
}

// Stav instalace kitu podle jediného soukromého protokolu (docs/STAV-INSTALACE.md): řádek `KIT: PENDING` nebo `KIT: COMPLETE`.
// Smí mít odrážku, nadpis, tučné písmo, zpětné apostrofy, buňku tabulky a krátký popisek před sebou (`**Stav:** KIT: COMPLETE`,
// `| Celkem | KIT: COMPLETE |`, `Stav instalace: KIT: PENDING`). Popisek má nejvýš 40 znaků bez `:` a `|`, nezačíná mezerou a končí dvojtečkou
// nebo svislítkem, takže věta, která KIT: COMPLETE jen zmiňuje („Dokud není KIT: COMPLETE, pokračuj.“), stavovým řádkem není. Platí poslední
// takový řádek. Tvar výrazu drží hledání lineární i na řádku z milionu mezer nebo podtržítek (test to hlídá): popisek nezačíná mezerou a před
// dvojtečkou nestojí žádný další běh mezer.
const KIT_STATE_LINE = /^[ \t>*_`#|-]*(?:[^\s|:][^\n|:]{0,39}?[:|][ \t*_`|:]*)?KIT[ \t*_`|:=-]*(PENDING|COMPLETE)\b/gim;
const readHead = (file, max) => {
  const fd = fs.openSync(file, 'r');
  try { const buffer = Buffer.alloc(max); return buffer.subarray(0, fs.readSync(fd, buffer, 0, max, 0)).toString('utf8'); } finally { fs.closeSync(fd); }
};
// Doklad nástroje kit-completion se stavem complete. Jen povrchová kontrola druhu a stavu: úplné ověření (otisky důkazů) patří nástroji, ne hooku.
const receiptComplete = (root) => {
  try {
    const receipt = JSON.parse(readHead(path.join(root, '.ai-os', 'kit-completion.json'), 1024 * 1024));
    return receipt?.kind === 'ai-os-kit-completion' && receipt?.status === 'complete';
  } catch { return false; }
};

/**
 * Stav instalace s podrobnostmi pro doctor: `{ protocol, stated, receipt, state }`. `stated` jsou rozpoznané stavové řádky protokolu v pořadí
 * ('PENDING' / 'COMPLETE'), `receipt` je platný doklad .ai-os/kit-completion.json se stavem complete.
 * 'none': workspace bez instalačního protokolu (starší verze, hotový systém), chová se jako dosud.
 * 'complete': poslední stavový řádek je KIT: COMPLETE, nebo protokol nemá žádný stavový řádek či jen starý PENDING ze začátku instalace a platný
 * doklad říká complete. 'pending': ostatní případy, tedy i nečitelný doklad (protokol existuje a nic nedokládá dokončení).
 * Návrat na PENDING po dřívějším COMPLETE (změna rozsahu, STAV-INSTALACE) platí i při dokladu, který zůstal z dřívějška; proto se starý
 * řádek KIT: COMPLETE nemaže. Nikdy nevyhazuje: nečitelný protokol znamená „none“ (připomínky zůstanou jako dosud).
 */
export function kitInstallInfo(root) {
  let text;
  try {
    const protocol = path.join(root, 'docs', 'plans', 'ai-os-instalace.md');
    if (!fs.statSync(protocol, { throwIfNoEntry: false })?.isFile()) return { protocol: false, stated: [], receipt: false, state: 'none' };
    text = readHead(protocol, 1024 * 1024);
  } catch { return { protocol: false, stated: [], receipt: false, state: 'none' }; }
  const stated = [...text.matchAll(KIT_STATE_LINE)].map((match) => match[1].toUpperCase());
  const receipt = receiptComplete(root);
  const last = stated.at(-1);
  const state = last === 'COMPLETE' ? 'complete' : last === 'PENDING' && stated.includes('COMPLETE') ? 'pending' : receipt ? 'complete' : 'pending';
  return { protocol: true, stated, receipt, state };
}
export const kitInstallState = (root) => kitInstallInfo(root).state;

export function selfReview(payload, { root, env = process.env } = {}) {
  if (env.AICOS_REVIEW_EVERY === 'off' || payload.stop_hook_active === true) return null;
  // Rozdělaná instalace kitu: žádná připomínka a čítač stojí, ať blok „Stop hook feedback“ neruší průvodce. Po KIT COMPLETE běží dál.
  if (kitInstallState(root) === 'pending') return null;
  const every = /^[1-9]\d*$/.test(env.AICOS_REVIEW_EVERY || '') ? Number(env.AICOS_REVIEW_EVERY) : 5;
  const file = path.join(stateRoot(env), 'state', workspaceHash(root) + '.review.json');
  const previous = readJson(file, { count: 0 }); const count = previous.count + 1;
  writeJson(file, { count }); if (count % every) return null;
  const prompt = fs.readFileSync(path.join(root, 'hooks', 'self-review-prompt.md'), 'utf8').replaceAll('__TODAY__', new Date().toISOString().slice(0, 10));
  return { decision: 'block', reason: prompt };
}

const sameDirectory = (a, b) => { try { return path.resolve(fs.realpathSync(a)) === path.resolve(fs.realpathSync(b)); } catch { return false; } };

export function backup(payload, { root, env = process.env, run = spawnSync } = {}) {
  // Network/git writes require explicitly configured opt-in, not merely a shipped script.
  // AICOS_BACKUP_LEGACY=1 sets the old wrapper backup-on-stop.sh (V.03/V.04 settings): there the
  // backup was on by default and never failed the hook, so it stays that way after an upgrade.
  if (env.AICOS_BACKUP !== 'on' || payload.stop_hook_active === true) return { status: 'disabled' };
  const legacy = env.AICOS_BACKUP_LEGACY === '1';
  const file = path.join(stateRoot(env), 'state', workspaceHash(root) + '.backup.json');
  const previous = readJson(file, { at: 0 }); const minutes = Number(env.AICOS_BACKUP_EVERY_MIN || 15);
  if (Date.now() - previous.at < (Number.isFinite(minutes) ? Math.max(0, minutes) : 15) * 60000) return { status: 'throttled' };
  // V.03 stamped before running, so an offline machine does not retry git on every Stop.
  if (legacy) writeJson(file, { at: Date.now(), status: 'running' });
  // AICOS_BACKUP_DIRS (path.delimiter-separated) is the V.03 form; kept so an upgrade does not change what is backed up.
  let dirs = env.AICOS_BACKUP_DIRS_JSON ? JSON.parse(env.AICOS_BACKUP_DIRS_JSON)
    : env.AICOS_BACKUP_DIRS ? env.AICOS_BACKUP_DIRS.split(path.delimiter).filter(Boolean)
    : [root, env.SECOND_BRAIN_VAULT].filter(Boolean);
  if (legacy && Array.isArray(dirs)) dirs = dirs.filter((dir) => typeof dir === 'string' && path.isAbsolute(dir));
  if (!Array.isArray(dirs) || !dirs.every((dir) => typeof dir === 'string' && path.isAbsolute(dir))) throw new Error('Backup directories must be an absolute JSON array');
  let pushed = 0; const failed = [];
  for (const dir of dirs) {
    const call = (args) => git(args, { cwd: dir, run });
    try {
      // Only a folder that is itself a repository root. Inside a parent repository rev-parse
      // succeeds too and add -A would commit (and push) the parent's files.
      if (!sameDirectory(call(['rev-parse', '--show-toplevel']).trim(), dir)) throw new Error('Backup folder is not a repository root; protection NOT VERIFIED');
      call(['remote', 'get-url', 'origin']);
    } catch (error) { if (legacy) continue; throw error; } // V.03: no repo or no remote = not configured
    try {
      if (call(['status', '--porcelain']).trim()) {
        call(['add', '-A']);
        if (checkStaged(dir, { run }).length) throw new Error('Backup refused: credential pattern in staged changes');
        call(['commit', '--quiet', '-m', 'AI OS backup ' + new Date().toISOString().slice(0, 10)]);
      }
      // A prior push can have failed after a successful commit. Retry clean repos too.
      call(['push', '--quiet']);
      pushed++;
    } catch (error) { if (!legacy) throw error; failed.push(dir); } // legacy: next folder (vault) still runs
  }
  const status = failed.length ? 'failed' : pushed ? 'success' : 'not-configured';
  writeJson(file, { at: Date.now(), status }); return { status };
}
