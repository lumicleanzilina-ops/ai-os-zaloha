#!/usr/bin/env node
/** Offline preflight + inert hook inputs. Never invoke a command carried by a payload. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { kitHooks, isKitHook } from '../hooks/config.mjs';
import { kitInstallInfo } from '../hooks/actions.mjs';
import { BOOTSTRAP, BOOTSTRAP_SOFT, KIT_ROOT, projectRoot, stateRoot, workspaceHash, inside, writeJson } from '../hooks/runtime.mjs';

const CASES = [
  ['bash-delete', 'Bash', 'rm dummy.txt', 'deny'],
  ['compound-git-exemption', 'Bash', 'git rm --cached dummy.txt && rm dummy.txt', 'deny'],
  ['python-delete', 'Bash', 'python -c "import os; os.remove(\'dummy.txt\')"', 'deny'],
  ['node-delete', 'Bash', 'node -e "require(\'node:fs\').unlinkSync(\'dummy.txt\')"', 'deny'],
  ['powershell-delete', 'PowerShell', 'Remove-Item -LiteralPath dummy.txt', 'deny'],
  ['git-force-review', 'Bash', 'git push --force', 'ask'],
  ['read-only', 'PowerShell', 'Get-Content dummy.txt', 'normal-permission-flow'],
];
const SKIPPED = Symbol('skipped');

/** Additional instruction sources to review. The canonical import is not a conflict.
 * These files are never removed or moved by doctor. */
export function claudeInstructionBlockers(root, { home = os.homedir() } = {}) {
  const found = [];
  for (let dir = path.resolve(root); ; dir = path.dirname(dir)) {
    for (const name of ['CLAUDE.md', 'CLAUDE.local.md', path.join('.claude', 'CLAUDE.md')]) {
      if (name === path.join('.claude', 'CLAUDE.md') && home && path.resolve(home) === dir) continue;
      const file = path.join(dir, name);
      if (fs.existsSync(file) && !(dir === path.resolve(root) && name === 'CLAUDE.md' && fs.readFileSync(file, 'utf8').trim() === '@AGENTS.md')) found.push(file);
    }
    if (path.dirname(dir) === dir) return found;
  }
}

/** Nested instruction files may legitimately belong to other projects; warn only. */
export function nestedClaudeInstructions(root, { depth = 4 } = {}) {
  const found = []; const skip = new Set(['.git', 'node_modules', '.ai-os-upgrades', '.venv', '__pycache__']);
  const walk = (dir, level) => {
    let entries; try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.isSymbolicLink() && !skip.has(entry.name) && level < depth) walk(full, level + 1);
      else if (level > 0 && /^claude(?:\.local)?\.md$/i.test(entry.name)) found.push(path.relative(root, full));
    }
    if (level > 0 && fs.existsSync(path.join(dir, '.claude', 'CLAUDE.md'))) found.push(path.relative(root, path.join(dir, '.claude', 'CLAUDE.md')));
  };
  walk(root, 0);
  return found.sort();
}

export function doctor({ workspace = KIT_ROOT, run = spawnSync, env = process.env, home = os.homedir(), preflight = false, configuration } = {}) {
  const checks = []; let root; let source = ''; let config; let implementationSha256 = null;
  const record = (name, inspect, { critical = true } = {}) => {
    try { const result = inspect(); checks.push({ name, status: result === SKIPPED ? 'skipped' : 'passed', critical: result === SKIPPED ? false : critical }); }
    catch (error) { checks.push({ name, status: critical ? 'failed' : 'warning', critical, ...(error?.detail ? { detail: error.detail } : {}) }); }
  };
  const failWith = (detail) => Object.assign(new Error(detail), { detail });
  record('workspace-root', () => { root = projectRoot(workspace); });
  record('node-runtime-24', () => {
    const result = run('node', ['--version'], { encoding: 'utf8', timeout: 10000, windowsHide: true });
    if (result.error || result.status !== 0 || Number(/^v(\d+)/.exec(result.stdout || '')?.[1]) !== 24) throw failWith('V shellu agenta musí být dostupný Node 24 LTS.');
  });
  record('git-runtime', () => {
    const result = run('git', ['--version'], { encoding: 'utf8', timeout: 10000, windowsHide: true });
    if (result.error || result.status !== 0 || !/^git version /.test(result.stdout || '')) throw new Error('Git unavailable');
  });
  record('critical-flags', () => { if (env.AICOS_CHECKPOINTS === 'off' || env.AICOS_GUARD_ROOT === 'off') throw new Error('Critical action disabled'); });
  if (root) {
    record('constitution-agents-md', () => {
      const constitution = fs.lstatSync(path.join(root, 'AGENTS.md'), { throwIfNoEntry: false });
      if (!constitution?.isFile()) throw failWith('Ve workspace chybí ústava AGENTS.md.');
      if (!fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8').trim()) throw failWith('AGENTS.md je prázdný.');
      if (fs.readFileSync(path.join(root, 'CLAUDE.md'), 'utf8').trim() !== '@AGENTS.md') throw failWith('CLAUDE.md má obsahovat jen @AGENTS.md; vlastní instrukce nejprve bezpečně sloučit do AGENTS.md.');
    });
    record('additional-claude-instructions', () => {
      const additional = claudeInstructionBlockers(root, { home });
      if (additional.length) throw failWith('Další instrukce mohou ovlivnit chování. Zkontroluj jejich soulad; cizí soubory nemaž ani nepřesouvej: ' + additional.join(', '));
    }, { critical: false });
    record('nested-claude-md', () => {
      const nested = nestedClaudeInstructions(root);
      if (nested.length) throw failWith(`V těchto složkách jsou další instrukce k posouzení: ${nested.slice(0, 10).join(', ')}${nested.length > 10 ? ' …' : ''}. Ověř soulad; cizí projekty nepřepisuj.`);
    }, { critical: false });
    // Protokol instalace bez rozpoznatelného stavového řádku (samostatný řádek KIT: PENDING nebo KIT: COMPLETE) je jen varování: self-review a připomínač
    // paměti se pak řídí dokladem .ai-os/kit-completion.json, a když chybí, mlčí. Doctor to připomíná, dokud se řádek nedoplní.
    record('install-protocol-state', () => {
      const info = kitInstallInfo(root);
      if (info.protocol && !info.stated.length) throw failWith(`Protokol docs/plans/ai-os-instalace.md nemá rozpoznatelný stavový řádek (samostatný řádek KIT: PENDING nebo KIT: COMPLETE, viz docs/STAV-INSTALACE.md). Self-review a připomínač paměti se proto řídí jen dokladem .ai-os/kit-completion.json (nyní: ${info.state}${info.state === 'pending' ? ', takže mlčí' : ''}). Doplň stavový řádek.`);
    }, { critical: false });
    record('implementation-readable', () => {
      const hash = createHash('sha256');
      for (const name of ['runtime.mjs', 'entry.mjs', 'actions.mjs', 'deny-dangerous.mjs', 'secret-guard.mjs']) hash.update(name).update(fs.readFileSync(path.join(root, 'hooks', name)));
      implementationSha256 = hash.digest('hex');
    });
    record('config-exec-form', () => {
      source = configuration ? JSON.stringify(configuration) : fs.readFileSync(path.join(root, '.claude', 'settings.json'), 'utf8'); config = JSON.parse(source);
      const actions = Object.values(config.hooks || {}).flatMap((entries) => entries.flatMap((entry) => entry.hooks || []));
      for (const action of actions.filter(isKitHook)) {
        // Měkký bootstrap (chyba kitu = tichý kód 0) smí mít jen připomínač paměti. U ostatních hooků, hlavně kritických (deny-dangerous, checkpoint,
        // guard-root-writes), by tichý kód 0 při rozbitém kitu vypnul ochranu bez hlášení; ty musí mít tvrdý bootstrap (kód 2 a zpráva o neověřené ochraně).
        const bootstraps = action.args?.[3] === 'brain-pripomen' ? [BOOTSTRAP, BOOTSTRAP_SOFT] : [BOOTSTRAP];
        if (action.command !== 'node' || action.args?.length !== 4 || action.async === true || action.asyncRewake === true || action.args?.[0] !== '--eval' || !bootstraps.includes(action.args?.[1]) || action.args?.[2] !== '${CLAUDE_PROJECT_DIR}') throw new Error('Unexpected bootstrap; not executed');
      }
      if (preflight) return;
      for (const [matcher, expected] of [['Bash|PowerShell', 'deny-dangerous'], ['Bash|PowerShell', 'checkpoint'], ['Edit|Write|MultiEdit', 'checkpoint'], ['Edit|Write|MultiEdit', 'guard-root-writes']]) {
        if (!(config.hooks.PreToolUse || []).some((entry) => entry.matcher === matcher && entry.hooks.some((hook) => isKitHook(hook) && hook.args[3] === expected))) throw new Error('Critical hook missing');
      }
    });
    const configurationPassed = checks.find((check) => check.name === 'config-exec-form')?.status === 'passed';
    if (configurationPassed) {
      const registration = kitHooks().PreToolUse[0].hooks[0];
      const invoke = (action, payload, project, cwd, extraEnv = {}) => run(registration.command,
        registration.args.map((arg, i) => i === 2 ? project : i === 3 ? action : arg),
        { input: JSON.stringify(payload), cwd, env: { ...env, AICOS_DOCTOR_PROBE: '1', ...extraEnv }, encoding: 'utf8', timeout: 15000, windowsHide: true });
      for (const [label, project, cwd] of [['root', root, root], ['nested', path.join(root, '.claude'), path.join(root, '.claude')]]) {
        record(label === 'root' ? 'registration-spawn-root' : 'bootstrap-resolves-from-subfolder', () => {
          const result = invoke('probe', { doctor_probe: true }, project, cwd);
          const marker = JSON.parse(result.stdout || '{}');
          if (result.error || result.status !== 0 || marker.marker !== 'AIOS_HOOK_REACHED' || marker.root !== root) throw new Error('Marker missing');
        });
      }
      for (const [name, tool, command, expected] of CASES) record('inert-' + name, () => {
        const result = invoke('deny-dangerous', { tool_name: tool, tool_input: { command } }, root, root);
        const response = result.stdout?.trim() ? JSON.parse(result.stdout) : {};
        const decision = response.hookSpecificOutput?.permissionDecision || 'normal-permission-flow';
        if (result.error || result.status !== 0 || decision !== expected) throw new Error('Wrong decision');
      });
      // Přehled práce na startu session je nekritický: chybějící soubor či registrace je jen varování. Probe běží s AICOS_KONTEXT=off,
      // takže nic nečte z domovské složky uživatele; ověřuje jen, že skutečný bootstrap modul načte a hook mlčí.
      record('kontext-prace-hook', () => {
        if (!fs.existsSync(path.join(root, 'hooks', 'kontext-prace.mjs'))) throw failWith('Chybí hooks/kontext-prace.mjs; přehled práce na startu session nepoběží.');
        if (!preflight && !(config.hooks?.SessionStart || []).some((entry) => (entry.hooks || []).some((hook) => isKitHook(hook) && hook.args?.[3] === 'kontext-prace'))) throw failWith('Hook kontext-prace není zapojený (starší aktivace?). Spusť aktivaci pojistek znovu.');
        const result = invoke('kontext-prace', { hook_event_name: 'SessionStart', session_id: 'doctor-probe', cwd: root }, root, root, { AICOS_KONTEXT: 'off' });
        if (result.error || result.status !== 0 || result.stdout?.trim()) throw failWith('Hook kontext-prace se přes bootstrap nepodařilo načíst.');
      }, { critical: false });
      // Automatický záznam session je taky nekritický. Entry u něj záměrně spolkne i chybu načtení modulu (vždy exit 0 a ticho), proto se
      // modul ověřuje přímým importem. Import nic nespouští: soubor jen definuje funkce.
      record('zaznam-session-hook', () => {
        const file = path.join(root, 'hooks', 'zaznam-session.mjs');
        if (!fs.existsSync(file)) throw failWith('Chybí hooks/zaznam-session.mjs; automatický záznam session nepoběží.');
        if (!preflight) {
          for (const event of ['SessionStart', 'Stop', 'SessionEnd']) {
            if (!(config.hooks?.[event] || []).some((entry) => (entry.hooks || []).some((hook) => isKitHook(hook) && hook.args?.[3] === 'zaznam-session'))) throw failWith(`Hook zaznam-session není zapojený v události ${event} (starší aktivace?). Spusť aktivaci pojistek znovu.`);
          }
        }
        const loaded = run('node', ['--input-type=module', '--eval', `await import(${JSON.stringify(pathToFileURL(file).href)})`], { cwd: root, encoding: 'utf8', timeout: 15000, windowsHide: true });
        if (loaded.error || loaded.status !== 0) throw failWith('Modul hooks/zaznam-session.mjs se nepodařilo načíst.');
      }, { critical: false });
      // Připomínač paměti (UserPromptSubmit) je také nekritický. Entry u něj spolkne chybu načtení (kód 0 a ticho, jinak by host zahodil zprávu
      // uživatele), proto se modul i s vyhledávačem v tools/ ověřuje přímým importem. Import nic nespouští: soubory jen definují funkce.
      record('brain-pripomen-hook', () => {
        const file = path.join(root, 'hooks', 'brain-pripomen.mjs');
        if (!fs.existsSync(file)) throw failWith('Chybí hooks/brain-pripomen.mjs; připomínač paměti nepoběží.');
        if (!fs.existsSync(path.join(root, 'tools', 'brain-hledej.mjs'))) throw failWith('Chybí tools/brain-hledej.mjs; připomínač paměti i dovednost brain nemají čím hledat.');
        if (!preflight && !(config.hooks?.UserPromptSubmit || []).some((entry) => (entry.hooks || []).some((hook) => isKitHook(hook) && hook.args?.[3] === 'brain-pripomen'))) throw failWith('Hook brain-pripomen není zapojený v události UserPromptSubmit (starší aktivace?). Spusť aktivaci pojistek znovu.');
        const loaded = run('node', ['--input-type=module', '--eval', `await import(${JSON.stringify(pathToFileURL(file).href)})`], { cwd: root, encoding: 'utf8', timeout: 15000, windowsHide: true });
        if (loaded.error || loaded.status !== 0) throw failWith('Modul hooks/brain-pripomen.mjs se nepodařilo načíst (včetně tools/brain-hledej.mjs).');
      }, { critical: false });
    }
  }
  const passed = checks.every((check) => check.status !== 'failed' || !check.critical);
  return {
    schema: 'aicos-doctor/v1', status: passed ? (preflight ? 'preflight-passed' : 'self-checks-passed') : 'failed', criticalChecksPassed: passed,
    hostRegistration: 'not-verified', at: new Date().toISOString(), platform: process.platform, node: process.version,
    workspace: root || path.resolve(workspace), requestedWorkspace: path.resolve(workspace),
    configSha256: source ? createHash('sha256').update(source).digest('hex') : null,
    implementationSha256,
    checkpointLocation: root ? path.join(stateRoot(env), 'checkpoints', `${path.basename(root)}-${workspaceHash(root)}.git`) : null,
    checks,
    limitations: [
      'No actual Claude callback was invoked; config spawn is not host registration evidence.',
      'Claude Code loads project .claude/settings.json only from the folder where the session starts: a session opened in a subfolder runs no hooks.',
      'No installed-workspace checkpoint/restore or remote backup operation was exercised by doctor.',
      'Windows/OneDrive qualification requires a passing platform CI and actual supported-client receipt.',
      'Hook startup, missing Node and host timeout can remain non-blocking at the host; do not infer a sandbox.',
      'Checkpoint ignores gitignored files and embedded repositories; arbitrary/obfuscated scripts exceed bounded command inspection.',
    ],
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2); let workspace = KIT_ROOT; let receipt; let preflight = false;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--workspace' && args[i + 1]) workspace = path.resolve(args[++i]);
      else if (args[i] === '--receipt' && args[i + 1]) receipt = path.resolve(args[++i]);
      else if (args[i] === '--preflight') preflight = true;
      else throw new Error('Unsupported argument');
    }
    const report = doctor({ workspace, preflight });
    if (receipt) {
      if (inside(report.workspace, receipt)) throw new Error('Receipt must be outside the workspace');
      writeJson(receipt, report);
    }
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    process.exitCode = report.criticalChecksPassed ? 0 : 2;
  } catch {
    process.stderr.write('Doctor failed; use --workspace <path> --receipt <path outside workspace>. Protection NOT VERIFIED.\n');
    process.exitCode = 2;
  }
}
