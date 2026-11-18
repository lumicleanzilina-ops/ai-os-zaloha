#!/usr/bin/env node
/** Reversible trash moves only. --apply represents the user's explicit permission. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Fixed script; the literal path travels through the child environment, never source interpolation.
export const WINDOWS_RECYCLE_SCRIPT = `$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName Microsoft.VisualBasic
$item = Get-Item -LiteralPath $env:AIOS_TRASH_SOURCE -Force -ErrorAction Stop
if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Links are not supported' }
$drive = [IO.DriveInfo]::new([IO.Path]::GetPathRoot($item.FullName))
if ($drive.DriveType -ne [IO.DriveType]::Fixed -or $drive.DriveFormat -ne 'NTFS') { throw 'Only local fixed NTFS volumes are supported' }
$ui = [Microsoft.VisualBasic.FileIO.UIOption]::OnlyErrorDialogs
$bin = [Microsoft.VisualBasic.FileIO.RecycleOption]::SendToRecycleBin
$cancel = [Microsoft.VisualBasic.FileIO.UICancelOption]::ThrowException
if ($item.PSIsContainer) {
  [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteDirectory($item.FullName, $ui, $bin, $cancel)
} else {
  [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile($item.FullName, $ui, $bin, $cancel)
}`;

export function trash({ source, apply = false, platform = process.platform, home = os.homedir(), run = spawnSync, env = process.env, cwd = process.cwd() } = {}) {
  if (typeof source !== 'string' || !source.trim()) throw new Error('Use one path');
  // A relative path is taken from the current folder (the workspace root the agent runs in). The same refusals apply to the result.
  const target = path.resolve(cwd, source); const stat = fs.lstatSync(target);
  const comparable = (value) => platform === 'win32' ? value.toLowerCase() : value;
  const relativeHome = path.relative(comparable(target), comparable(path.resolve(home)));
  const containsHome = relativeHome === '' || (!relativeHome.startsWith('..' + path.sep) && relativeHome !== '..' && !path.isAbsolute(relativeHome));
  if (stat.isSymbolicLink() || target === path.parse(target).root || containsHome) throw new Error('Refusing a root, home directory or link');
  if (!['win32', 'darwin', 'linux'].includes(platform)) throw new Error('This OS has no reviewed trash adapter');
  if (platform === 'win32' && (/^\\\\/.test(target) || !/^[A-Za-z]:\\/.test(target))) throw new Error('Only a local Windows drive is supported');
  const plan = { status: 'planned', source: target, destination: platform === 'win32' ? 'Windows Recycle Bin' : platform === 'darwin' ? path.join(home, '.Trash') : 'system trash (gio)', permanentDeletion: false };
  if (!apply) return plan;
  if (platform === 'darwin') {
    const bin = path.join(home, '.Trash'); const binStat = fs.lstatSync(bin);
    if (!binStat.isDirectory() || binStat.isSymbolicLink()) throw new Error('Trash folder unavailable');
    // Cross-volume moves fail rather than falling back to copy + permanent deletion.
    const destination = path.join(bin, path.basename(target) + '-' + randomUUID());
    if (fs.existsSync(destination)) throw new Error('Trash destination already exists');
    fs.renameSync(target, destination);
    return { ...plan, status: 'moved', destination };
  }
  const command = platform === 'win32' ? 'powershell.exe' : 'gio';
  const args = platform === 'win32' ? ['-NoProfile', '-NonInteractive', '-Command', WINDOWS_RECYCLE_SCRIPT] : ['trash', '--', target];
  const result = run(command, args, { env: { ...env, AIOS_TRASH_SOURCE: target }, encoding: 'utf8', timeout: 30000, windowsHide: true });
  if (result.error || result.signal || result.status !== 0 || fs.existsSync(target)) throw new Error('Trash move was not confirmed; no permanent-deletion fallback is used');
  return { ...plan, status: 'moved' };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2); let source; let apply = false;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--path' && args[i + 1]) source = args[++i];
      else if (args[i] === '--apply') apply = true;
      else throw new Error('Use --path <path> and optional --apply');
    }
    process.stdout.write(JSON.stringify(trash({ source, apply }), null, 2) + '\n');
  } catch (error) { process.stderr.write('Přesun do koše nebyl potvrzen: ' + error.message + '\n'); process.exitCode = 2; }
}
