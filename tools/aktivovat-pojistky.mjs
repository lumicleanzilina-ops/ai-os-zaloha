#!/usr/bin/env node
/** Explicit activation after dependency setup. No global host configuration changes. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { doctor } from './doctor.mjs';
import { SELECTABLE, activatedSettings, parseSelection } from '../hooks/config.mjs';
import { checkpoint } from '../hooks/actions.mjs';
import { KIT_ROOT, inside, stateRoot, workspaceHash, writeJson } from '../hooks/runtime.mjs';

/**
 * `only` (jen z CLI `--jen`): výběr hooků ze SELECTABLE v hooks/config.mjs. Zapojí jen je (a s `cteni` čtecí pravidla), ostatní registrace i vlastní
 * nastavení nechá. Je to jediná podporovaná cesta k převzetí jedné novinky (třeba připomínače paměti) bez ručního zápisu do settings.json.
 * Výběr jen doplňuje: kritické pojistky (deny-dangerous, checkpoint, guard-root-writes) už musí být zapojené, jinak doctor aktivaci zastaví.
 */
export function activate({ workspace = KIT_ROOT, apply = false, run = spawnSync, env = process.env, only = null } = {}) {
  const selected = only === null || only === undefined ? null : [...parseSelection(only)];
  const before = doctor({ workspace, preflight: true, run, env });
  if (!before.criticalChecksPassed) return { status: 'blocked', protection: 'not-verified', preflight: before };
  const root = before.workspace; const file = path.join(root, '.claude', 'settings.json');
  const original = fs.readFileSync(file, 'utf8');
  const candidate = activatedSettings(JSON.parse(original), { only: selected });
  const verified = doctor({ workspace: root, configuration: candidate, run, env });
  const note = selected ? { selected, note: 'Výběr --jen jen doplňuje už zapojené kritické pojistky (deny-dangerous, checkpoint, guard-root-writes). Chybí-li, proveď nejdřív celou aktivaci bez --jen.' } : {};
  if (!verified.criticalChecksPassed) return { status: 'blocked', protection: 'not-verified', ...note, preflight: verified };
  if (!apply) return { status: 'ready-to-activate', protection: 'not-verified', ...(selected ? { selected } : {}), next: 'Run with --apply after approval; this creates a checked checkpoint, settings backup and local registrations.', preflight: verified };
  const state = stateRoot(env);
  if (inside(root, state)) throw new Error('Activation state must be outside the workspace');
  // No critical registration is written until Git and scanning have made a real snapshot.
  const snapshot = checkpoint({ tool_name: 'Write' }, { root, env, run });
  if (snapshot.status !== 'verified') throw new Error('Checkpoint verification failed; settings unchanged');
  if (fs.readFileSync(file, 'utf8') !== original) throw new Error('Settings changed during activation; retry without overwriting them');
  const id = randomUUID(); const backup = path.join(state, 'activation-backups', workspaceHash(root) + '-' + id + '.settings.json');
  writeJson(backup, JSON.parse(original));
  const pending = path.join(root, '.claude', 'settings.' + id + '.pending');
  fs.writeFileSync(pending, JSON.stringify(candidate, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  fs.renameSync(pending, file);
  const receipt = { schema: 'aicos-activation/v1', status: 'activated', ...(selected ? { selected } : {}), workspace: root, at: new Date().toISOString(), backup, checkpoint: snapshot, hostRegistration: 'not-verified', next: 'Open a new session in this workspace and verify actual PreToolUse registration; activation alone is not host evidence.' };
  const receiptPath = path.join(state, 'state', workspaceHash(root) + '.activation.json');
  writeJson(receiptPath, receipt);
  return { ...receipt, receiptPath };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2); let workspace = KIT_ROOT; let apply = false; let only = null;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--workspace' && args[i + 1]) workspace = path.resolve(args[++i]);
      else if (args[i] === '--jen' && args[i + 1] && only === null) only = args[++i];
      else if (args[i] === '--apply') apply = true;
      else throw Object.assign(new Error('Use --workspace <path>, optional --jen <hook[,hook]> and optional --apply'), { userMessage: `Použití: --workspace <složka> [--jen <jména oddělená čárkou: ${SELECTABLE.join(', ')}>] [--apply].` });
    }
    const report = activate({ workspace, apply, only });
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    process.exitCode = report.status === 'blocked' ? 2 : 0;
  } catch (error) {
    process.stderr.write('Aktivace nebyla potvrzena. Pojistky NEJSOU OVĚŘENÉ. ' + (error.userMessage || 'Zkontroluj Node 24 LTS, Git, doctor a oprávnění; žádné citlivé hodnoty nevypisuj.') + '\n');
    process.exitCode = 2;
  }
}
