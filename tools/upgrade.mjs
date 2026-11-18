#!/usr/bin/env node
// Offline, additive upgrade of a personalized workspace. Never deletes files.
import { constants } from 'node:fs';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const MANIFEST = 'release-manifest.json';
const ELIGIBLE = new Set(['create', 'replace']);
// One boundary for the optional Dashboard/server stack. Small guides stay in
// core as signposts; the existing, independent AI-firma module stays available.
const BONUS_PREFIXES = ['modules/aplikace/', 'modules/ai-firma/runtime/server/', 'tools/windows/', 'tools/tailscale/', 'tools/client-config/'];
const BONUS_FILES = new Set(['tools/ai-os.mjs', 'Nastavit Hermese.cmd', 'Overit AI OS Dashboard.cmd', 'Spustit AI OS Dashboard.cmd', 'Stav AI OS Dashboard.cmd']);
const isBonus = relative => BONUS_FILES.has(relative) || BONUS_PREFIXES.some(prefix => relative.startsWith(prefix));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const fail = message => { throw new Error(message); };
const json = value => JSON.stringify(value, null, 2) + '\n';

export function validatePath(value) {
  if (typeof value !== 'string' || !value || /[\\:\x00-\x1f]/.test(value) || value.startsWith('/')) fail('Unsafe manifest path');
  const parts = value.split('/');
  if (parts.some(p => !p || p === '.' || p === '..' || /[ .]$/.test(p) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p))) fail(`Unsafe manifest path: ${value}`);
  return value;
}

export function isProtected(value) {
  const parts = validatePath(value).toLowerCase().split('/');
  const leaf = parts.at(-1);
  // Konfigurace agentů a tajemství jsou osobní v jakékoli hloubce. Datové složky zákazníka jen v kořeni:
  // modules/second-brain/ je část kitu a majitel V.03 ho musí dostat (dřív se nedoručil nikdy).
  const configDirs = new Set(['.git', '.claude', '.codex', '.cursor', '.antigravity', '.secrets', '.hermes', '.ai-os-upgrades', '.memory']);
  const dataDirs = new Set(['vault', 'vaults', 'brain', 'second-brain', 'cos-brain', 'memory', 'personal', 'work', 'outputs', 'inputs', 'scratch', 'projects', 'reference-photos']);
  if (parts.some(p => configDirs.has(p)) || dataDirs.has(parts[0])) return true;
  if (/^(?:claude|claude\.local|agents|soul|identity|memory)\.md$/.test(leaf)) return true;
  if (/^user-(?:profile|preferences|systems)(?:\.|$)/.test(leaf) || /^(?:profile|preferences)\.md$/.test(leaf)) return true;
  if (leaf === MANIFEST || leaf === '.mcp.json' || /^\.env(?:\.|$)/.test(leaf)) return true;
  if (/^(?:auth|credentials|secrets)(?:\.|$)/.test(leaf) || /\.(?:pem|key|p12|pfx)$/.test(leaf)) return true;
  if (/token.*\.json$/.test(leaf) || /service-account/.test(leaf)) return true;
  if (parts[0] === 'docs' && ['learnings', 'plans', 'briefings', 'session-logs'].includes(parts[1])) return true;
  // A generated runtime workspace is customer data, never a release template.
  if (['system', 'board', 'data', 'state', 'logs'].includes(parts[0])) return true;
  return false;
}

/**
 * Chráněné šablony: README chráněných složek (outputs/, scratch/, docs/plans/…) a index learningů.
 * Neobsahují nic osobního, dokud je zákazník nepřepíše. Když chybí, upgrade je založí (V.03 neměla
 * outputs/ ani scratch/ a hook by je nedovolil založit); nezměněné tovární se smí vyměnit.
 */
export function isProtectedTemplate(value) {
  const lower = validatePath(value).toLowerCase();
  if (!isProtected(value) || lower.split('/').some(p => ['.git', '.secrets', '.hermes', '.ai-os-upgrades'].includes(p))) return false;
  return lower.endsWith('/readme.md') || lower === 'docs/learnings/index.md';
}

async function rootDirectory(value) {
  const absolute = path.resolve(value);
  if ((await fs.lstat(absolute)).isSymbolicLink() || (await fs.realpath(absolute)) !== absolute) fail(`Symlink root or ancestor: ${absolute}`);
  if (!(await fs.stat(absolute)).isDirectory()) fail(`Not a directory: ${absolute}`);
  return absolute;
}

// Inspect every component rather than following a link into another workspace.
async function inspect(root, relative) {
  validatePath(relative);
  let current = root;
  const parts = relative.split('/');
  for (let i = 0; i < parts.length; i++) {
    current = path.join(current, parts[i]);
    let st;
    try { st = await fs.lstat(current); } catch (e) { if (e.code === 'ENOENT') return { type: 'missing' }; throw e; }
    if (st.isSymbolicLink()) fail(`Symlink path or ancestor: ${relative}`);
    if (i < parts.length - 1 && !st.isDirectory()) return { type: 'obstruction' };
    if (i === parts.length - 1) return st.isFile() ? { type: 'file', mode: st.mode & 0o777, links: st.nlink } : { type: 'obstruction' };
  }
}

async function readFile(root, relative) {
  if ((await inspect(root, relative)).type !== 'file') fail(`Expected regular file: ${relative}`);
  const handle = await fs.open(path.join(root, relative), constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try { return await handle.readFile(); } finally { await handle.close(); }
}

async function readManifest(filename) {
  const absolute = path.resolve(filename);
  const directory = await rootDirectory(path.dirname(absolute));
  const bytes = await readFile(directory, path.basename(absolute));
  const manifest = JSON.parse(bytes.toString('utf8'));
  if (manifest.schemaVersion !== 1 || manifest.product !== 'ai-os' || typeof manifest.version !== 'string' || !manifest.version || !manifest.files || Array.isArray(manifest.files) || typeof manifest.files !== 'object') fail('Unsupported release manifest');
  const names = new Set();
  for (const [name, metadata] of Object.entries(manifest.files)) {
    validatePath(name);
    if (name.toLowerCase() === MANIFEST || names.has(name.toLowerCase())) fail('Duplicate or recursive manifest path');
    names.add(name.toLowerCase());
    if (!metadata || !/^[a-f0-9]{64}$/.test(metadata.sha256) || !Number.isSafeInteger(metadata.size) || metadata.size < 0 || (metadata.mode !== undefined && ![0o644, 0o755].includes(metadata.mode))) fail(`Invalid manifest metadata: ${name}`);
  }
  return { path: absolute, sha256: sha(bytes), manifest };
}

async function targetState(root, relative) {
  const st = await inspect(root, relative);
  if (st.type !== 'file') return { type: st.type, sha256: null };
  if (st.links > 1) fail(`Hard-linked target would affect another path: ${relative}`);
  return { ...st, sha256: sha(await readFile(root, relative)) };
}

async function safeState(root, relative) {
  try { return await targetState(root, relative); }
  catch { return { type: 'unsafe', sha256: null }; }
}

// Od Kitu 4.3 je CLAUDE.md jen import `@AGENTS.md`: takový workspace je už převedený a nic se nepřevádí.
// Rozpozná se podle otisku, ať se tovární wrapper nikdy nepovažuje za zákazníkova pravidla (jeho přesun do zálohy
// nebo nahrazení AGENTS.md jedenáctibajtovým wrapperem by Claude Code připravilo o ústavu).
const IMPORT_WRAPPERS = new Set(['@AGENTS.md', '@AGENTS.md\n', '@AGENTS.md\r\n'].map(sha));

/**
 * Od V.04.2 je jedinou ústavou AGENTS.md (čte ho Claude Code i Codex, Cursor, Antigravity).
 * Ve V.03 byla zákazníkova ústava v CLAUDE.md a AGENTS.md byl tovární průvodce; ve V.04.x byly
 * dvojčata. Převod je bezpečný jen tam, kde se nic vlastního neztratí; jinak ho dělá člověk s AI.
 */
async function instructionPlan(target, previous, trusted) {
  const state = {};
  for (const name of ['CLAUDE.md', 'AGENTS.md', 'CLAUDE.local.md', '.claude/CLAUDE.md']) state[name] = await safeState(target, name);
  const claude = state['CLAUDE.md']; const agents = state['AGENTS.md'];
  const result = (action, extra = {}) => ({ action, claudeSha256: claude.sha256, agentsSha256: agents.sha256, ...extra });
  const odd = ['CLAUDE.md', 'AGENTS.md', 'CLAUDE.local.md', '.claude/CLAUDE.md'].filter(name => ['unsafe', 'obstruction'].includes(state[name].type));
  if (odd.length) return result('manual', { reason: `${odd.join(', ')} je odkaz, složka, sdílený soubor nebo leží pod odkazem; slouč ručně do obyčejného AGENTS.md (pozor: zápis do odkazu mění soubor, na který míří).` });
  const blockers = ['CLAUDE.local.md', '.claude/CLAUDE.md'].filter(name => state[name].type === 'file');
  if (blockers.length) return result('manual', { reason: `${blockers.join(', ')} by v Claude Code vypnul AGENTS.md; obsah slouč do AGENTS.md a soubor přesuň do zálohy.` });
  if (claude.type === 'missing') return agents.type === 'file' ? result('none') : result('manual', { reason: 'Ve workspace není ústava; novou instalaci vede ONBOARDING.md.' });
  if (IMPORT_WRAPPERS.has(claude.sha256)) {
    return agents.type === 'file'
      ? result('none', { reason: 'CLAUDE.md jen importuje @AGENTS.md, pravidla jsou už v AGENTS.md; nic se nepřevádí.' })
      : result('manual', { reason: 'CLAUDE.md jen importuje @AGENTS.md, ale AGENTS.md chybí; obnov ho ze zálohy nebo ze zdroje NOVÉ ručně, z wrapperu se nic nepřevádí.' });
  }
  if (agents.type === 'missing') return result('convert', { agents: 'create', reason: 'AGENTS.md vznikne z tvého CLAUDE.md; CLAUDE.md se přesune do zálohy upgradu.' });
  if (agents.sha256 === claude.sha256) return result('convert', { agents: 'keep', reason: 'AGENTS.md už je shodný; CLAUDE.md se přesune do zálohy upgradu.' });
  const factory = trusted ? previous?.manifest.files['AGENTS.md']?.sha256 : null;
  if (factory && agents.sha256 === factory) return result('convert', { agents: 'replace', reason: 'AGENTS.md je nezměněný tovární průvodce staré verze; nahradí ho tvůj CLAUDE.md, obojí půjde do zálohy upgradu.' });
  // Kdo pracoval v Codexu, má pravidla v AGENTS.md a CLAUDE.md nechal tovární: ten jen odejde do zálohy.
  const factoryClaude = trusted ? previous?.manifest.files['CLAUDE.md']?.sha256 : null;
  if (factoryClaude && claude.sha256 === factoryClaude) return result('convert', { agents: 'keep', reason: 'CLAUDE.md je nezměněný tovární soubor a tvoje pravidla jsou v AGENTS.md; CLAUDE.md se přesune do zálohy upgradu.' });
  if (!trusted) return result('manual', { reason: 'Bez důvěryhodného otisku nejde poznat, co je tovární: vytvoř plán s otiskem staré verze (upgrade/baseline/), nebo slouč CLAUDE.md do AGENTS.md ručně.' });
  return result('manual', { reason: 'CLAUDE.md i AGENTS.md mají vlastní obsah; slouč je do AGENTS.md a CLAUDE.md přesuň do zálohy.' });
}

/**
 * Novinky Kitu 4.4, které si majitel Kitu 4.3 může převzít samostatně (docs/UPGRADE-Z-V3.md, „Jen vybrané novinky“). Skupina nese VŠECHNY soubory,
 * na kterých novinka stojí, ať si je agent nevybírá ručně a nic nechybí. U připomínače paměti je to uzávěr importů hooku `brain-pripomen` a jeho
 * zapojení: dispatcher `hooks/entry.mjs` a `hooks/runtime.mjs` s měkkým bootstrapem, `hooks/config.mjs` a `tools/doctor.mjs` (starý doctor ze 4.3 měkký
 * bootstrap nezná a po zapojení hlásí `config-exec-form` jako selhání), `tools/aktivovat-pojistky.mjs` s volbou `--jen` a dovednost `brain`.
 * Test hlídá, že seznam odpovídá skutečným importům. Soubory beze změny proti Kitu 4.3 plán označí `unchanged` a přeskočí se.
 * Platí od Kitu 4.3: starší verze (V.03 až V.04.1) Node pojistky nemají a patří jim celý upgrade.
 */
export const NOVINKY = Object.freeze({
  pripominac: Object.freeze({
    popis: 'Připomínač paměti (hook brain-pripomen), vyhledávač paměti a dovednost brain, včetně pojistek, na kterých hook stojí',
    cesty: Object.freeze([
      'hooks/actions.mjs', 'hooks/brain-pripomen.mjs', 'hooks/config.mjs', 'hooks/deny-dangerous.mjs', 'hooks/entry.mjs', 'hooks/kontext-prace.mjs',
      'hooks/runtime.mjs', 'hooks/secret-guard.mjs', 'hooks/zaznam-session.mjs', 'skills/brain/SKILL.md',
      'tools/aktivovat-pojistky.mjs', 'tools/brain-hledej.mjs', 'tools/doctor.mjs',
    ]),
  }),
});

/**
 * Stav souborů novinek v plánu: `create`, `replace` (převezmou se), `unchanged` (shodné s novým kitem), `blocked` (upravené nebo chráněné:
 * `conflict`, `protected`) a `missing` (plán je nemá). Jen čtení, nic nezapisuje.
 */
export function summarizeNovinky(plan) {
  const byPath = new Map((plan.entries ?? []).map(entry => [entry.path, entry]));
  const summary = {};
  for (const [name, novinka] of Object.entries(NOVINKY)) {
    const state = { create: [], replace: [], unchanged: [], blocked: [], missing: [] };
    for (const relative of novinka.cesty) {
      const entry = byPath.get(relative);
      if (!entry) state.missing.push(relative);
      else if (entry.action === 'create' || entry.action === 'replace' || entry.action === 'unchanged') state[entry.action].push(relative);
      else state.blocked.push({ path: relative, action: entry.action });
    }
    summary[name] = state;
  }
  return summary;
}

/** Cesty ke schválení pro vybrané novinky (create a replace; shodné se přeskočí). Všechno, nebo nic: upravený či chybějící soubor skupiny zastaví celý výběr. */
export function expandNovinky(plan, names) {
  const unique = [...new Set(names)];
  if (!unique.length) fail('No novelty selected');
  for (const name of unique) if (!Object.hasOwn(NOVINKY, name)) fail(`Unknown novelty: ${name}. Known: ${Object.keys(NOVINKY).join(', ')}`);
  const summary = summarizeNovinky(plan); const approved = []; const problems = [];
  for (const name of unique) {
    const state = summary[name];
    for (const item of state.blocked) problems.push(`${item.path} (${item.action})`);
    for (const relative of state.missing) problems.push(`${relative} (missing in the plan)`);
    for (const relative of [...state.create, ...state.replace]) if (!approved.includes(relative)) approved.push(relative);
  }
  if (problems.length) fail(`The selected novelty needs files that are edited, protected or missing: ${[...new Set(problems)].join(', ')}. Merge them by hand after reviewing the difference, or choose another scope; nothing was applied.`);
  if (!approved.length) fail(`Novelty already in place: every file equals the new kit (${unique.join(', ')}); nothing to apply`);
  return [...new Set(unique.flatMap(name => NOVINKY[name].cesty))].filter(relative => approved.includes(relative)); // pořadí skupiny, ne create před replace
}

export async function createPlan({ source, target, baseline, baselineSha256, scope = 'all' }) {
  if (!['core', 'all'].includes(scope)) fail('Invalid upgrade scope: use core or all');
  source = await rootDirectory(source);
  target = await rootDirectory(target);
  if (source === target || source.startsWith(target + path.sep) || target.startsWith(source + path.sep)) fail('Source and target must be separate, non-nested directories');
  const release = await readManifest(path.join(source, MANIFEST));
  const previous = baseline ? await readManifest(baseline) : null;
  if (baselineSha256 && (!previous || !/^[a-f0-9]{64}$/.test(baselineSha256) || previous.sha256 !== baselineSha256)) fail('Baseline digest does not match the independently trusted release');
  const trusted = !!baselineSha256;
  const entries = [];
  const excludedPaths = [];
  for (const relative of Object.keys(release.manifest.files).sort()) {
    const metadata = release.manifest.files[relative];
    const bytes = await readFile(source, relative);
    if (sha(bytes) !== metadata.sha256 || bytes.length !== metadata.size) fail(`Source differs from release manifest: ${relative}`);
    // Validate the complete release even when copying only core. Existing bonus
    // files in the target are neither inspected nor modified by a core upgrade.
    if (scope === 'core' && isBonus(relative)) { excludedPaths.push(relative); continue; }
    const base = previous?.manifest.files[relative]?.sha256 ?? null;
    const entry = { path: relative, sourceSha256: metadata.sha256, size: metadata.size, mode: metadata.mode ?? 0o644, baselineSha256: base, targetSha256: null };
    if (isProtected(relative) && isProtectedTemplate(relative)) {
      const current = await targetState(target, relative);
      entry.targetSha256 = current.sha256;
      if (current.type === 'missing') entries.push({ ...entry, action: 'create', reason: 'Missing template of a protected folder.' });
      else if (current.sha256 === metadata.sha256) entries.push({ ...entry, action: 'unchanged' });
      else if (trusted && base && current.sha256 === base) entries.push({ ...entry, action: 'replace', reason: 'Unchanged factory template of a protected folder.' });
      else entries.push({ ...entry, action: 'protected', reason: trusted && base ? 'Customer edited this template; merge separately.' : 'No trusted baseline: cannot tell whether this template was edited; kept as is.' });
      continue;
    }
    if (isProtected(relative)) {
      entries.push({ ...entry, action: 'protected', reason: 'Customer identity, configuration, secrets, history or data; merge separately.' });
      continue; // Do not read customer secrets even for hashing.
    }
    const current = await targetState(target, relative);
    entry.targetSha256 = current.sha256;
    let action, reason;
    if (current.type === 'obstruction') { action = 'conflict'; reason = 'A directory or ancestor file occupies this path.'; }
    else if (current.type === 'missing') action = 'create';
    else if (current.sha256 === metadata.sha256) action = 'unchanged';
    else if (trusted && base && current.sha256 === base) action = 'replace';
    else { action = 'conflict'; reason = trusted && base ? 'Customer file changed from baseline.' : 'No independently trusted baseline for this file.'; }
    entries.push({ ...entry, action, ...(reason ? { reason } : {}) });
  }
  return {
    schemaVersion: 1, kind: 'ai-os-upgrade-plan', id: randomUUID(), createdAt: new Date().toISOString(),
    source, target, release: { version: release.manifest.version, sha256: release.sha256 },
    baseline: previous ? { path: previous.path, sha256: previous.sha256, trusted } : null,
    scope, excludedPaths, entries,
    instructions: await instructionPlan(target, previous, trusted),
    retainedPaths: previous ? Object.keys(previous.manifest.files).filter(p => !(p in release.manifest.files)).sort() : [],
    approvedPaths: [],
    approveInstructions: false
  };
}

async function writeNew(filename, contents, mode = 0o600) {
  const absolute = path.resolve(filename);
  const directory = await rootDirectory(path.dirname(absolute));
  const relative = validatePath(path.basename(absolute));
  if ((await inspect(directory, relative)).type !== 'missing') fail(`Will not overwrite: ${absolute}`);
  const handle = await fs.open(absolute, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | (constants.O_NOFOLLOW ?? 0), mode);
  try {
    await handle.writeFile(contents);
    await handle.sync();
  } finally { await handle.close(); }
  await syncDirectory(directory);
}

// Windows/filesystems can explicitly refuse directory fsync. Never hide ENOSPC,
// EIO or access failures: those do not establish that metadata is durable.
async function syncDirectory(directory) {
  let handle;
  try {
    handle = await fs.open(directory, constants.O_RDONLY | (constants.O_DIRECTORY ?? 0) | (constants.O_NOFOLLOW ?? 0));
    try {
      await handle.sync();
    } catch (e) {
      // Windows/libuv returns EPERM for fsync on an opened directory. This
      // exception applies only to sync, never to failed open/access operations.
      if (process.platform !== 'win32' || e.code !== 'EPERM' || !(await handle.stat()).isDirectory()) throw e;
    }
  } catch (e) {
    if (process.platform !== 'win32' || !['EINVAL', 'ENOTSUP', 'ENOSYS', 'EISDIR'].includes(e.code)) throw e;
  } finally { if (handle) await handle.close(); }
}

async function writeReceipt(filename, receipt, initial = false) {
  const directory = await rootDirectory(path.dirname(filename));
  const current = await inspect(directory, path.basename(filename));
  if (initial ? current.type !== 'missing' : current.type !== 'file' || current.links > 1) fail('Unsafe or existing upgrade receipt');
  const temporary = path.join(directory, `receipt.json.tmp-${process.pid}-${randomUUID()}`);
  try {
    // A failed temporary file is retained for diagnosis; the previous receipt
    // stays readable until the complete replacement has been synced.
    await writeNew(temporary, json(receipt));
    await fs.rename(temporary, filename);
    await syncDirectory(directory);
  } catch (e) {
    e.receiptUpdateFailed = true;
    throw e;
  }
}

function stablePlan(plan) {
  // Review edits may change only approvedPaths; immutable decisions are recomputed.
  // Older plans predate scope; their meaning was the whole release (= all).
  const { id, createdAt, approvedPaths, approveInstructions, scope = 'all', excludedPaths = [], ...stable } = plan;
  return JSON.stringify({ ...stable, scope, excludedPaths });
}

async function ensureParents(root, relative) {
  let current = root;
  for (const part of validatePath(relative).split('/').slice(0, -1)) {
    current = path.join(current, part);
    let created = false;
    // Zálohy upgradu jen pro vlastníka; složky workspace (outputs/, scratch/…) s běžnými právy.
    const mode = relative.startsWith('.ai-os-upgrades/') ? 0o700 : 0o755;
    try { await fs.mkdir(current, { mode }); created = true; } catch (e) { if (e.code !== 'EEXIST') throw e; }
    const st = await fs.lstat(current);
    if (st.isSymbolicLink() || !st.isDirectory()) fail(`Unsafe write ancestor: ${relative}`);
    if (created) await syncDirectory(path.dirname(current));
  }
}

export async function applyPlan(filename, { approveSafe = false, withInstructions = false, novinky = [] } = {}) {
  const planPath = path.resolve(filename);
  const plan = JSON.parse((await readFile(await rootDirectory(path.dirname(planPath)), path.basename(planPath))).toString('utf8'));
  // Zkratka po review s člověkem: schválí všechny create/replace z plánu (nikdy conflict ani protected)
  // a převod pravidel, aniž by se ručně přepisoval JSON. Plán se dál ověřuje proti novému stavu.
  if (approveSafe && novinky.length) fail('--novinky and --approve-safe cannot be combined: --approve-safe approves every safe change of the plan');
  if (approveSafe && Array.isArray(plan.entries)) plan.approvedPaths = plan.entries.filter(e => ELIGIBLE.has(e.action)).map(e => e.path);
  // Vybrané novinky: cesty skupiny včetně toho, na čem stojí (NOVINKY), místo ručně psaných approvedPaths. Plán se dál ověřuje proti novému stavu.
  if (novinky.length) plan.approvedPaths = expandNovinky(plan, novinky);
  if (withInstructions) plan.approveInstructions = true;
  if (plan.schemaVersion !== 1 || plan.kind !== 'ai-os-upgrade-plan' || !/^[a-f0-9-]{36}$/.test(plan.id) || typeof plan.createdAt !== 'string' || !Array.isArray(plan.approvedPaths) || new Set(plan.approvedPaths).size !== plan.approvedPaths.length) fail('Invalid upgrade plan');
  if (plan.approveInstructions !== undefined && typeof plan.approveInstructions !== 'boolean') fail('Invalid upgrade plan');
  if (!plan.approvedPaths.length && plan.approveInstructions !== true) fail('No reviewed approvedPaths; nothing will be applied');
  const fresh = await createPlan({ source: plan.source, target: plan.target, baseline: plan.baseline?.path, baselineSha256: plan.baseline?.trusted ? plan.baseline.sha256 : undefined, scope: plan.scope });
  if (stablePlan(plan) !== stablePlan(fresh)) fail('Plan is stale or was edited beyond approvedPaths; generate and review a new plan');
  const selected = plan.approvedPaths.map(relative => {
    validatePath(relative);
    const entry = plan.entries.find(e => e.path === relative);
    if (!entry || !ELIGIBLE.has(entry.action) || (isProtected(relative) && !isProtectedTemplate(relative))) fail(`Path is not eligible: ${relative}`);
    return entry;
  });
  const convert = plan.approveInstructions === true;
  if (convert && fresh.instructions?.action === 'none') fail('Nothing to convert: the workspace already has only AGENTS.md');
  if (convert && fresh.instructions?.action !== 'convert') fail(`Instructions need a manual merge: ${fresh.instructions?.reason ?? 'unknown state'}`);
  const backupDir = `.ai-os-upgrades/${plan.id}`;
  await ensureParents(plan.target, `${backupDir}/receipt.json`);
  if ((await inspect(plan.target, `${backupDir}/receipt.json`)).type !== 'missing') fail('This plan was already applied');
  const receipt = {
    schemaVersion: 1, kind: 'ai-os-upgrade-receipt', id: plan.id, release: plan.release,
    scope: fresh.scope, excludedPaths: fresh.excludedPaths, ...(novinky.length ? { novinky: [...new Set(novinky)] } : {}),
    createdAt: new Date().toISOString(), status: 'preparing',
    files: selected.map(entry => ({
      path: entry.path, action: entry.action, beforeSha256: entry.targetSha256, afterSha256: entry.sourceSha256,
      backupPath: entry.action === 'replace' ? `${backupDir}/backup/${entry.path}` : null,
      backupStatus: entry.action === 'replace' ? 'pending' : 'not-needed', status: 'pending'
    })),
    ...(convert ? { instructions: {
      action: 'convert', agents: fresh.instructions.agents, claudeSha256: fresh.instructions.claudeSha256, agentsSha256: fresh.instructions.agentsSha256,
      claudeBackupPath: `${backupDir}/backup/CLAUDE.md`,
      agentsBackupPath: fresh.instructions.agents === 'replace' ? `${backupDir}/backup/AGENTS.md` : null,
      status: 'pending'
    } } : {})
  };
  const receiptPath = path.join(plan.target, backupDir, 'receipt.json');
  // Persist the full intent even if preparation fails before any target write.
  await writeReceipt(receiptPath, receipt, true);
  try {
    // Sync ALL selected originals and their parent directory entries before the
    // first target mutation; a verified read alone is not a durable backup.
    for (const [index, entry] of selected.entries()) {
      const current = await targetState(plan.target, entry.path);
      if (current.sha256 !== entry.targetSha256 || (entry.action === 'create' && current.type !== 'missing')) fail(`Target changed after validation: ${entry.path}`);
      if (entry.action === 'replace') {
        const backupPath = receipt.files[index].backupPath;
        await ensureParents(plan.target, backupPath);
        const original = await readFile(plan.target, entry.path);
        if (sha(original) !== entry.targetSha256) fail(`Target changed before backup: ${entry.path}`);
        await writeNew(path.join(plan.target, backupPath), original, current.mode);
        if (sha(await readFile(plan.target, backupPath)) !== entry.targetSha256) fail(`Backup verification failed: ${entry.path}`);
        receipt.files[index].backupStatus = 'ready';
      }
    }
    receipt.status = 'ready';
    await writeReceipt(receiptPath, receipt);
    for (const [index, entry] of selected.entries()) {
      const bytes = await readFile(plan.source, entry.path);
      if (sha(bytes) !== entry.sourceSha256) fail(`Source changed after validation: ${entry.path}`);
      await ensureParents(plan.target, entry.path);
      const current = await targetState(plan.target, entry.path);
      if (current.sha256 !== entry.targetSha256 || (entry.action === 'create' && current.type !== 'missing')) fail(`Target changed after validation: ${entry.path}`);
      // Durable write intent precedes open(O_CREAT) and truncate. After a crash,
      // writing means uncertain target contents; do not retry or auto-rollback.
      receipt.status = 'applying';
      receipt.files[index].status = 'writing';
      await writeReceipt(receiptPath, receipt);
      // Stop agents/sync while applying; in-place open with no-follow prevents link redirection.
      const flags = constants.O_RDWR | (constants.O_NOFOLLOW ?? 0) | (entry.action === 'create' ? constants.O_CREAT | constants.O_EXCL : 0);
      const handle = await fs.open(path.join(plan.target, entry.path), flags, entry.mode);
      try {
        if (entry.action === 'replace') {
          if ((await handle.stat()).nlink > 1) fail(`Opened target is hard-linked: ${entry.path}`);
          if (sha(await handle.readFile()) !== entry.targetSha256) fail(`Opened target changed: ${entry.path}`);
          await handle.truncate(0);
        }
        let offset = 0;
        while (offset < bytes.length) {
          const { bytesWritten } = await handle.write(bytes, offset, bytes.length - offset, offset);
          if (!bytesWritten) fail(`Incomplete write: ${entry.path}`);
          offset += bytesWritten;
        }
        if (entry.action === 'create' && process.platform !== 'win32') await handle.chmod(entry.mode);
        await handle.sync();
      } finally { await handle.close(); }
      await syncDirectory(path.dirname(path.join(plan.target, entry.path)));
      if (sha(await readFile(plan.target, entry.path)) !== entry.sourceSha256) fail(`Written file verification failed: ${entry.path}`);
      receipt.files[index].status = 'written';
      await writeReceipt(receiptPath, receipt);
    }
    if (convert) {
      receipt.status = 'applying';
      await writeReceipt(receiptPath, receipt);
      await convertInstructions(plan.target, receipt, receiptPath);
    }
    receipt.status = 'complete';
    await writeReceipt(receiptPath, receipt);
  } catch (e) {
    let receiptError;
    if (!e.receiptUpdateFailed) {
      receipt.status = 'partial';
      receipt.error = e.message;
      try { await writeReceipt(receiptPath, receipt); } catch (updateError) { receiptError = updateError; }
    }
    throw new Error(`Upgrade stopped; preserve backups and inspect ${receiptPath}. ${e.message}${receiptError ? ` Receipt update also failed: ${receiptError.message}; inspect the last durable intent.` : ''}`);
  }
  return { receiptPath, receipt };
}

/**
 * CLAUDE.md → AGENTS.md. Pořadí drží workspace čitelný i po pádu uprostřed: nejdřív záloha
 * továrního AGENTS.md, pak nový AGENTS.md (= CLAUDE.md), až nakonec přesun CLAUDE.md do zálohy.
 * Nic se nemaže; CLAUDE.md se jen přesune do .ai-os-upgrades/<id>/backup/.
 */
async function convertInstructions(target, receipt, receiptPath) {
  const step = receipt.instructions;
  const claudeNow = await targetState(target, 'CLAUDE.md');
  const claude = await readFile(target, 'CLAUDE.md');
  if (sha(claude) !== step.claudeSha256) fail('Target changed after validation: CLAUDE.md');
  const agentsNow = await targetState(target, 'AGENTS.md');
  if (agentsNow.sha256 !== step.agentsSha256) fail('Target changed after validation: AGENTS.md');
  if (step.agents === 'replace') {
    await ensureParents(target, step.agentsBackupPath);
    await writeNew(path.join(target, step.agentsBackupPath), await readFile(target, 'AGENTS.md'), agentsNow.mode);
    if (sha(await readFile(target, step.agentsBackupPath)) !== step.agentsSha256) fail('Backup verification failed: AGENTS.md');
  }
  step.status = 'writing-agents';
  await writeReceipt(receiptPath, receipt);
  if (step.agents !== 'keep') {
    const flags = constants.O_RDWR | (constants.O_NOFOLLOW ?? 0) | (step.agents === 'create' ? constants.O_CREAT | constants.O_EXCL : 0);
    const handle = await fs.open(path.join(target, 'AGENTS.md'), flags, claudeNow.mode ?? 0o644);
    try {
      if (step.agents === 'replace') {
        if ((await handle.stat()).nlink > 1) fail('Opened target is hard-linked: AGENTS.md');
        if (sha(await handle.readFile()) !== step.agentsSha256) fail('Opened target changed: AGENTS.md');
        await handle.truncate(0);
      }
      let offset = 0;
      while (offset < claude.length) {
        const { bytesWritten } = await handle.write(claude, offset, claude.length - offset, offset);
        if (!bytesWritten) fail('Incomplete write: AGENTS.md');
        offset += bytesWritten;
      }
      await handle.sync();
    } finally { await handle.close(); }
    await syncDirectory(target);
  }
  // keep: AGENTS.md zůstává, jak byl (dvojče, nebo tvoje pravidla vedle továrního CLAUDE.md).
  if (sha(await readFile(target, 'AGENTS.md')) !== (step.agents === 'keep' ? step.agentsSha256 : step.claudeSha256)) fail('Written file verification failed: AGENTS.md');
  step.status = 'moving-claude';
  await writeReceipt(receiptPath, receipt);
  await ensureParents(target, step.claudeBackupPath);
  if ((await inspect(target, step.claudeBackupPath)).type !== 'missing') fail('Will not overwrite backup: CLAUDE.md');
  if (sha(await readFile(target, 'CLAUDE.md')) !== step.claudeSha256) fail('Target changed before move: CLAUDE.md');
  await fs.rename(path.join(target, 'CLAUDE.md'), path.join(target, step.claudeBackupPath));
  await syncDirectory(target);
  await syncDirectory(path.dirname(path.join(target, step.claudeBackupPath)));
  if ((await inspect(target, 'CLAUDE.md')).type !== 'missing' || sha(await readFile(target, step.claudeBackupPath)) !== step.claudeSha256) fail('Move verification failed: CLAUDE.md');
  step.status = 'done';
  await writeReceipt(receiptPath, receipt);
}

const usage = `Usage (Node 24):
  node tools/upgrade.mjs --source KIT --target WORKSPACE --plan NEW-PLAN.json
    [--scope core|all] [--baseline OLD-MANIFEST.json --baseline-sha256 TRUSTED-DIGEST]
  node tools/upgrade.mjs --apply REVIEWED-PLAN.json [--approve-safe] [--convert-instructions]
  node tools/upgrade.mjs --apply REVIEWED-PLAN.json --novinky pripominac[,DALŠÍ]
Plan-only is the default. Edit only approvedPaths (and approveInstructions) after reviewing the plan,
or after the human review pass --approve-safe (every create/replace, never conflict/protected)
and --convert-instructions (approveInstructions).
--novinky takes only the files of the named novelty with everything it stands on (all or nothing; known: ${Object.keys(NOVINKY).join(', ')}) instead of hand-edited approvedPaths;
it cannot be combined with --approve-safe.
approveInstructions: true moves a V.03 CLAUDE.md into AGENTS.md when the plan says "convert".
Use --scope core for the personal kit without the optional Dashboard/server stack.
The default all preserves older CLI behavior. Scope is fixed in the reviewed plan.
No baseline digest: existing differences are conflicts. No deletion or force mode.`;

async function main(args) {
  if (!args.length || args.includes('--help')) { console.log(usage); return; }
  const options = {}; const flags = new Set();
  const allowed = new Set(['source', 'target', 'plan', 'scope', 'baseline', 'baseline-sha256', 'apply', 'novinky']);
  const switches = new Set(['approve-safe', 'convert-instructions']);
  for (let i = 0; i < args.length; i++) {
    const key = args[i].replace(/^--/, '');
    if (args[i].startsWith('--') && switches.has(key) && !flags.has(key)) { flags.add(key); continue; }
    if (!args[i].startsWith('--') || !allowed.has(key) || !args[i + 1] || args[i + 1].startsWith('--') || key in options) fail(usage);
    options[key] = args[++i];
  }
  if (flags.size && !options.apply) fail('--approve-safe and --convert-instructions belong to --apply');
  if (options.novinky && !options.apply) fail('--novinky belongs to --apply');
  if (options.apply) {
    if (Object.keys(options).filter(key => key !== 'novinky').length !== 1) fail('Do not combine --apply with planning options');
    const novinky = options.novinky === undefined ? [] : options.novinky.split(',').map(name => name.trim()).filter(Boolean);
    if (options.novinky !== undefined && !novinky.length) fail(usage);
    const result = await applyPlan(options.apply, { approveSafe: flags.has('approve-safe'), withInstructions: flags.has('convert-instructions'), novinky });
    console.log(`Applied reviewed paths${novinky.length ? ` (novinky: ${[...new Set(novinky)].join(', ')})` : ''}. Receipt: ${result.receiptPath}`);
  } else {
    if (!options.source || !options.target || !options.plan) fail(usage);
    const plan = await createPlan({ source: options.source, target: options.target, scope: options.scope, baseline: options.baseline, baselineSha256: options['baseline-sha256'] });
    await writeNew(options.plan, json(plan));
    const counts = {};
    for (const entry of plan.entries) counts[entry.action] = (counts[entry.action] ?? 0) + 1;
    console.log(`Plan only: ${path.resolve(options.plan)}\nScope: ${plan.scope}; excluded bonus paths: ${plan.excludedPaths.length}\n${JSON.stringify(counts)}\nInstructions: ${plan.instructions.action}${plan.instructions.reason ? ` (${plan.instructions.reason})` : ''}\nReview approvedPaths; no workspace file was changed.`);
    for (const [name, state] of Object.entries(summarizeNovinky(plan))) console.log(`Novelty ${name} (--novinky ${name}): create ${state.create.length}, replace ${state.replace.length}, unchanged ${state.unchanged.length}, blocked ${state.blocked.length}, missing ${state.missing.length}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch(error => { console.error(`Upgrade refused: ${error.message}`); process.exitCode = 1; });
}
