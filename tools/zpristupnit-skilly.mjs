#!/usr/bin/env node
/**
 * zpristupnit-skilly.mjs: zpřístupní dovednosti kitu hostu. Node bez závislostí a bez sítě.
 *
 * Claude Code načítá dovednosti ze složky `.claude/skills/<jméno>/SKILL.md` a nabízí je jako příkaz `/<jméno>`. Kit je dodává v
 * `skills/<jméno>/`, takže je host sám nevidí. Nástroj pro každou složku `skills/<jméno>/` se `SKILL.md` založí ve workspace položku
 * `.claude/skills/<jméno>`:
 *   macOS a Linux  relativní symlink `../../skills/<jméno>`: jedna složka, žádná kopie, změna dovednosti i upgrade kitu se projeví hned
 *                  (když systém symlink nepovolí, použije se kopie jako na Windows);
 *   Windows        kopie složky se značkou `.ai-os-kopie.json` (otisk obsahu), protože symlinky tam chtějí zvláštní oprávnění. Podle otisku
 *                  se pozná kopie bez úprav od kopie s vlastními úpravami a zastaralá kopie od aktuální.
 * Nikdy nic nepřepíše ani nesmaže: existující položku (cizí složku, jiný odkaz, upravenou či zastaralou kopii) jen ohlásí.
 * Vynechá `checkpoint` (Claude Code má vestavěný příkaz `/checkpoint`, alias `/rewind`, který skill stejného jména nepřebije) a všechno,
 * co není dovednost: soubory, složky bez `SKILL.md` a složky začínající tečkou.
 *
 *   node tools/zpristupnit-skilly.mjs [--workspace <cesta>] [--nahled | --apply]
 *
 * Bez přepínače a s `--nahled` jen vypíše plán a nic nezapíše. Idempotentní: druhý běh nic nemění. Výstup je JSON (`aicos-skills/v1`),
 * kód 0 je úspěch (i s ohlášenými položkami), 1 chyba u některé dovednosti, 2 neplatné použití nebo zablokováno. Host načte nový nejvyšší
 * adresář `.claude/skills`, který při startu session neexistoval, až po `/reload-skills` nebo v nové session.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const KIT_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const COPY_MARKER = '.ai-os-kopie.json';
export const COPY_SCHEMA = 'aicos-skill-copy/v1';
export const SKIPPED = Object.freeze({
  checkpoint: 'Claude Code má vestavěný příkaz /checkpoint (alias /rewind) a skill stejného jména ho nepřebije. Dovednost zůstává v skills/checkpoint a agent ji otevře sám, když uživatel řekne slovy „vrať předchozí verzi souboru“.',
});
// Soubory, které si systém zakládá sám: do kopie ani do otisku nepatří.
const JUNK = new Set(['.DS_Store', 'Thumbs.db', 'desktop.ini']);
// Chyby, kdy systém nebo svazek symlink nepovolí (FAT/exFAT, sdílený disk, chybějící oprávnění): zpřístupní se kopií.
const NO_SYMLINK = new Set(['EPERM', 'ENOTSUP', 'EOPNOTSUPP', 'ENOSYS', 'EINVAL']);

const byName = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const sha256 = (data) => createHash('sha256').update(data).digest('hex');
const lstatOrNull = (file) => {
  try { return fs.lstatSync(file); } catch (error) { if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return null; throw error; }
};
const realOrNull = (file) => { try { return fs.realpathSync(file); } catch { return null; } };
const fail = (message, code) => Object.assign(new Error(message), { code, safe: true });

/** Soubory a složky dovednosti jako relativní POSIX cesty, seřazené. Odkaz uvnitř se nenásleduje, jen se ohlásí (`link`). */
function listTree(root) {
  const files = []; const dirs = []; let link = null;
  const walk = (dir, prefix) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => byName(a.name, b.name))) {
      if (JUNK.has(entry.name)) continue;
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isSymbolicLink()) { link ??= relative; continue; }
      if (entry.isDirectory()) { dirs.push(relative); walk(path.join(dir, entry.name), relative); }
      else if (entry.isFile()) files.push(relative);
    }
  };
  walk(root, '');
  return { files, dirs, link };
}

/** Otisk obsahu složky: názvy a SHA-256 souborů bez značky kopie. Nezávisí na pořadí čtení ani na času změny. */
function fingerprint(root, tree = listTree(root)) {
  const hash = createHash('sha256'); let files = 0;
  for (const relative of tree.files) {
    if (relative === COPY_MARKER) continue;
    hash.update(`${relative}\0${sha256(fs.readFileSync(path.join(root, ...relative.split('/'))))}\n`); files++;
  }
  return { sha256: hash.digest('hex'), files };
}

/** Dovednost je složka se `SKILL.md`, jejíž jméno nezačíná tečkou. Zbytek (README.md, CURATOR.md, .archive, složky bez SKILL.md) se jen vypíše. */
function discover(skillsDir) {
  const skills = []; const ignored = [];
  for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true }).sort((a, b) => byName(a.name, b.name))) {
    let isSkill = false;
    if (!entry.name.startsWith('.')) {
      try { isSkill = fs.statSync(path.join(skillsDir, entry.name)).isDirectory() && fs.statSync(path.join(skillsDir, entry.name, 'SKILL.md')).isFile(); } catch { isSkill = false; }
    }
    (isSkill ? skills : ignored).push(entry.name);
  }
  return { skills, ignored };
}

/** Jméno příkazu: `name` z hlavičky SKILL.md, jinak jméno složky (host bere příkaz z hlavičky, když ji dovednost má). */
function commandOf(skillDir, fallback) {
  try {
    const head = /^---\r?\n([\s\S]*?)\r?\n---/.exec(fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8'));
    const name = head && /^name:[ \t]*["']?([^"'\r\n]+?)["']?[ \t]*$/m.exec(head[1])?.[1];
    return `/${name || fallback}`;
  } catch { return `/${fallback}`; }
}

function readMarker(dir) {
  try {
    const marker = JSON.parse(fs.readFileSync(path.join(dir, COPY_MARKER), 'utf8'));
    return marker?.schema === COPY_SCHEMA && /^[a-f0-9]{64}$/.test(marker.fingerprint ?? '') ? marker : null;
  } catch { return null; }
}

/** Co už leží na místě `.claude/skills/<jméno>`. Nic nemění. */
function inspectTarget(target, sourceDir, name) {
  const stat = lstatOrNull(target);
  if (!stat) return { action: 'create' };
  const where = `.claude/skills/${name}`;
  if (stat.isSymbolicLink()) {
    const resolved = realOrNull(target);
    if (resolved === null) return { action: 'exists', kind: 'broken-link', detail: `${where} je rozbitý odkaz. Nepřepisuji ho; zjisti s uživatelem, kam měl vést.` };
    if (resolved === realOrNull(sourceDir)) return { action: 'current' };
    let to = '?'; try { to = fs.readlinkSync(target); } catch { /* jen popis do hlášení */ }
    return { action: 'exists', kind: 'foreign-link', detail: `${where} je odkaz jinam (${to}). Nepřepisuji ho; porovnej ho s skills/${name} a rozhodni s uživatelem.` };
  }
  if (stat.isDirectory()) {
    const marker = readMarker(target);
    if (!marker) return { action: 'exists', kind: 'foreign-folder', detail: `${where} je složka, kterou kit nezakládal (chybí značka ${COPY_MARKER}). Nepřepisuji ji; porovnej ji s skills/${name} a rozhodni s uživatelem.` };
    const own = fingerprint(target);
    if (own.sha256 !== marker.fingerprint) return { action: 'modified-copy', detail: `Kopie ${where} má vlastní úpravy (otisk nesouhlasí se značkou). Nepřepisuji ji; porovnej ji s skills/${name} a rozhodni s uživatelem.` };
    if (fingerprint(sourceDir).sha256 === own.sha256) return { action: 'current' };
    return { action: 'stale-copy', detail: `Kopie ${where} je zastaralá: skills/${name} se od jejího vzniku změnila a kopie nemá vlastní úpravy. Nepřepisuji ji. Chceš-li ji obnovit, přesuň složku do koše (node tools/kos.mjs --path ".claude/skills/${name}" --apply) a spusť zpřístupnění znovu.` };
  }
  return { action: 'exists', kind: 'file', detail: `Na místě ${where} leží soubor. Nepřepisuji ho; zjisti s uživatelem, co to je.` };
}

/** Kopie složky dovednosti: nejdřív do pracovní složky vedle, ověřit otiskem, připsat značku a teprve potom jedním přejmenováním na místo. */
function copySkill({ sourceDir, targetDir, claudeDir, name }) {
  const tree = listTree(sourceDir);
  if (tree.link) throw fail(`Složka dovednosti obsahuje odkaz (${tree.link}); kopie by ho nenásledovala, proto ji nezakládám.`, 'ELINK');
  const staging = path.join(claudeDir, `.zpristupneni-${name}-${process.pid}`);
  fs.mkdirSync(staging);
  try {
    for (const relative of tree.dirs) fs.mkdirSync(path.join(staging, ...relative.split('/')), { recursive: true });
    for (const relative of tree.files) fs.copyFileSync(path.join(sourceDir, ...relative.split('/')), path.join(staging, ...relative.split('/')), fs.constants.COPYFILE_EXCL);
    const copied = fingerprint(staging); const original = fingerprint(sourceDir);
    if (copied.sha256 !== original.sha256) throw fail(`Zdroj skills/${name} se během kopírování změnil; kopii nezakládám.`, 'ECHANGED');
    fs.writeFileSync(path.join(staging, COPY_MARKER), JSON.stringify({ schema: COPY_SCHEMA, skill: name, source: `skills/${name}`, fingerprint: copied.sha256, files: copied.files, created: new Date().toISOString() }, null, 2) + '\n', { flag: 'wx' });
    if (lstatOrNull(targetDir)) throw fail(`Mezitím vznikla položka .claude/skills/${name}; nepřepisuji ji.`, 'EEXIST');
    fs.renameSync(staging, targetDir);
  } catch (error) {
    // Nic nemažeme: nedokončená pracovní složka zůstane a hlášení ji pojmenuje, ať ji uživatel může dát do koše.
    error.message += ` (zbytek nedokončené kopie: ${staging})`;
    throw error;
  }
}

const blocked = (root, platform, reason) => ({
  schema: 'aicos-skills/v1', status: 'blocked', workspace: root, platform, reason,
  next: 'Nic se nezapsalo. Oprav uvedenou příčinu (nebo uprav --workspace) a spusť nástroj znovu.',
});

export function zpristupni({ workspace = KIT_ROOT, apply = false, platform = process.platform, symlink = fs.symlinkSync } = {}) {
  const root = path.resolve(workspace);
  const skillsDir = path.join(root, 'skills'); const claudeDir = path.join(root, '.claude'); const targetRoot = path.join(claudeDir, 'skills');
  if (!fs.statSync(skillsDir, { throwIfNoEntry: false })?.isDirectory()) return blocked(root, platform, 'Ve workspace chybí složka skills/. Zkontroluj cestu v --workspace: má to být kořen pracovní kopie kitu, ne čistá distribuce.');
  for (const [folder, label] of [[claudeDir, '.claude'], [targetRoot, '.claude/skills']]) {
    const stat = lstatOrNull(folder);
    if (stat && (stat.isSymbolicLink() || !stat.isDirectory())) return blocked(root, platform, `${label} není obyčejná složka (je to odkaz nebo soubor). Do ní nic nezakládám, ať se nezapíše mimo workspace.`);
  }
  const { skills, ignored } = discover(skillsDir);
  const method = platform === 'win32' ? 'copy' : 'symlink';
  const items = [];
  for (const name of skills) {
    const sourceDir = path.join(skillsDir, name); const target = path.join(targetRoot, name);
    const base = { skill: name, command: commandOf(sourceDir, name), method };
    if (Object.hasOwn(SKIPPED, name)) { items.push({ ...base, action: 'skipped', detail: SKIPPED[name] }); continue; }
    const found = inspectTarget(target, sourceDir, name);
    if (found.action !== 'create' || !apply) { items.push({ ...base, ...found }); continue; }
    try {
      fs.mkdirSync(targetRoot, { recursive: true });
      let used = method; let detail;
      if (method === 'symlink') {
        try { symlink(path.posix.join('..', '..', 'skills', name), target, 'dir'); } catch (error) {
          if (error.code === 'EEXIST') throw fail(`Mezitím vznikla položka .claude/skills/${name}; nepřepisuji ji.`, 'EEXIST');
          if (!NO_SYMLINK.has(error.code)) throw error;
          used = 'copy'; detail = `Systém symlink nepovolil (${error.code}), dovednost je zpřístupněná kopií se značkou ${COPY_MARKER}.`;
          copySkill({ sourceDir, targetDir: target, claudeDir, name });
        }
      } else copySkill({ sourceDir, targetDir: target, claudeDir, name });
      items.push({ ...base, method: used, action: 'created', ...(detail ? { detail } : {}) });
    } catch (error) {
      items.push({ ...base, action: 'error', detail: String(error.message).slice(0, 400) });
    }
  }
  const count = (...actions) => items.filter((item) => actions.includes(item.action)).length;
  const summary = { skills: skills.length, toCreate: count('create'), created: count('created'), current: count('current'), kept: count('exists', 'stale-copy', 'modified-copy'), skipped: count('skipped'), errors: count('error') };
  const warnings = [];
  const gitignore = (() => { try { return fs.readFileSync(path.join(root, '.gitignore'), 'utf8'); } catch { return null; } })();
  if (gitignore !== null && !/^\/?\.claude\/skills\/?\s*$/m.test(gitignore)) warnings.push('.gitignore workspace neobsahuje řádek .claude/skills/: odkazy (na Windows kopie dovedností i s případnými vlastními podklady) by se dostávaly do commitů a záloh. Přidej ten řádek do .gitignore.');
  if (method === 'copy' && (summary.toCreate || summary.created)) warnings.push('Kopie se po změně dovednosti v skills/ neobnoví sama: nástroj ji příště ohlásí jako zastaralou a nic nepřepíše. Vlastní podklady dovedností (brand-references/, voice-samples/…) patří do skills/<jméno>/, ne do kopie.');
  const kept = summary.kept ? ' Ohlášené položky (exists, stale-copy, modified-copy) nástroj nechal beze změny: probrat je s uživatelem, nic nepřepisuj.' : '';
  const next = (!apply
    ? (summary.toCreate ? 'Náhled nic nezapsal. Po souhlasu spusť totéž s --apply.' : 'Není co zakládat.')
    : summary.errors ? 'Některé dovednosti se nepodařilo zpřístupnit (viz detail); ostatní jsou hotové. Chybu odstraň a spusť nástroj znovu, hotové položky nechá beze změny.'
      : 'Dovednosti jsou zpřístupněné hostu. Řekni uživateli, že je Claude Code nabízí jako /<jméno> (po napsání lomítka); nevidí-li je, ať v této session napíše /reload-skills nebo otevře novou session v kořeni workspace.') + kept;
  return { schema: 'aicos-skills/v1', status: apply ? 'applied' : 'planned', workspace: root, platform, method, target: '.claude/skills', summary, items, ignored, warnings, next };
}

export function parseArgs(argv) {
  let workspace = KIT_ROOT; let apply = false; let preview = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--workspace' && argv[i + 1]) workspace = path.resolve(argv[++i]);
    else if (argv[i] === '--apply') apply = true;
    else if (argv[i] === '--nahled') preview = true;
    else throw fail('Použití: node tools/zpristupnit-skilly.mjs [--workspace <cesta>] [--nahled | --apply]', 'EUSAGE');
  }
  if (apply && preview) throw fail('Zvol jen jeden režim: --nahled, nebo --apply.', 'EUSAGE');
  return { workspace, apply };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const report = zpristupni(parseArgs(process.argv.slice(2)));
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    process.exitCode = report.status === 'blocked' ? 2 : report.summary.errors ? 1 : 0;
  } catch (error) {
    process.stderr.write(`${error.safe ? error.message : `Zpřístupnění dovedností selhalo: ${error.message}`}\n`);
    process.exitCode = 2;
  }
}
