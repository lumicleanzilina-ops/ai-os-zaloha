import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const KIT_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const BOOTSTRAP = "const f=require('node:fs'),p=require('node:path'),u=require('node:url');let d=p.resolve(process.argv[1]||process.cwd());while(!f.existsSync(p.join(d,'hooks','entry.mjs'))||!f.existsSync(p.join(d,'.claude','settings.json'))){const n=p.dirname(d);if(n===d){console.error('AI OS hook bootstrap not found; protection NOT VERIFIED');process.exit(2)}d=n}process.env.AICOS_KIT_ROOT=d;import(u.pathToFileURL(p.join(d,'hooks','entry.mjs')).href).catch(()=>{console.error('AI OS hook failed; protection NOT VERIFIED');process.exit(2)});";

/**
 * Měkká varianta bootstrapu pro hooky, které nesmějí nikdy zablokovat zprávu uživatele (UserPromptSubmit): stejný kód, jen když se kořen kitu
 * nenajde nebo se `entry.mjs` nenačte (třeba po rozbité úpravě), skončí tiše kódem 0. Tvrdý bootstrap by skončil kódem 2 a host by u UserPromptSubmit
 * zahodil zprávu uživatele. Kritické hooky (PreToolUse) zůstávají na tvrdém bootstrapu: tam je zablokování správná reakce na neověřenou ochranu.
 */
export const BOOTSTRAP_SOFT = BOOTSTRAP
  .replaceAll("console.error('AI OS hook bootstrap not found; protection NOT VERIFIED');process.exit(2)", 'process.exit(0)')
  .replaceAll("console.error('AI OS hook failed; protection NOT VERIFIED');process.exit(2)", 'process.exit(0)');

export function projectRoot(start = process.env.AICOS_KIT_ROOT || process.env.CLAUDE_PROJECT_DIR || KIT_ROOT) {
  let current = path.resolve(start);
  while (true) {
    if (fs.existsSync(path.join(current, 'hooks', 'entry.mjs')) && fs.existsSync(path.join(current, '.claude', 'settings.json'))) return current;
    const parent = path.dirname(current);
    if (parent === current) throw new Error('Kit root not found; protection NOT VERIFIED');
    current = parent;
  }
}

export const workspaceHash = (root) => createHash('sha1').update(path.resolve(root)).digest('hex').slice(0, 12);

/**
 * Vault druhého mozku podle `SECOND_BRAIN_VAULT` (stejná proměnná jako u zálohy a `brain-sync.py`): absolutní cesta k existující složce,
 * jinak null. Žádný výchozí adresář; relativní cesta nebo neexistující složka znamená „vault není“, takže se nic nezakládá mimo workspace.
 */
export function brainVault(env = process.env) {
  const raw = typeof env.SECOND_BRAIN_VAULT === 'string' ? env.SECOND_BRAIN_VAULT.trim() : '';
  if (!raw || !path.isAbsolute(raw)) return null;
  try { return fs.statSync(raw).isDirectory() ? path.resolve(raw) : null; } catch { return null; }
}
/**
 * Složky záznamů sessions. První je ta, do které se píše: `<vault>/session-logs`, když je vault, jinak `<workspace>/docs/session-logs`.
 * Při nastaveném vaultu je druhá `docs/session-logs`: čtou se z ní starší záznamy z doby před vaultem, ať jedna session nemá dva soubory.
 */
export function recordsDirs(root, env = process.env) {
  const docs = path.join(root, 'docs', 'session-logs'); const vault = brainVault(env);
  return vault ? [path.join(vault, 'session-logs'), docs] : [docs];
}
export const stateRoot = (env = process.env) => path.resolve(env.AICOS_STATE_DIR || path.join(os.homedir(), '.claude', 'aicos'));
export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });
}
export function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (error) {
    if (error.code === 'ENOENT' && arguments.length > 1) return fallback;
    throw new Error('State JSON unreadable; protection NOT VERIFIED');
  }
}
/**
 * Chyba nekritického hooku (záznam session) do logu ve složce stavu. Nikdy nevypisuje na stdout, nikdy nevyhazuje a po 200 kB
 * přestane přidávat. Loguje jen kód a jméno chyby a zprávu, kterou hlásí systém (fs) nebo vlastní kód označil `safe`; obsah
 * přepisů a zpráv do logu nepatří.
 */
export function logFailure(root, scope, error, env = process.env) {
  try {
    const dir = path.join(stateRoot(env), 'zaznam', workspaceHash(root));
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    const file = path.join(dir, 'chyby.log');
    if (fs.existsSync(file) && fs.statSync(file).size > 200 * 1024) return;
    const label = String(error?.code || error?.name || 'Error');
    const detail = error?.code || error?.safe ? ': ' + String(error.message).replace(/\s+/g, ' ').slice(0, 200) : '';
    fs.appendFileSync(file, new Date().toISOString() + ' ' + scope + ' ' + label + detail + '\n', { mode: 0o600 });
  } catch { /* log je doplněk: když nejde zapsat, hook mlčí */ }
}
export function git(args, { cwd = process.cwd(), run = spawnSync } = {}) {
  const result = run('git', args, { cwd, encoding: 'utf8', timeout: 30000, maxBuffer: 64 * 1024 * 1024, windowsHide: true });
  if (result.error || result.signal || result.status !== 0) throw new Error('Git operation failed; protection NOT VERIFIED');
  return result.stdout || '';
}
export function deny(reason) { return { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason } }; }
export function ask(reason) { return { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'ask', permissionDecisionReason: reason } }; }
export function inside(root, target) { const relative = path.relative(root, target); return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative)); }
