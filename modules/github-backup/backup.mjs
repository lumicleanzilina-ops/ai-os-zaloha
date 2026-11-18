#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { backup } from '../../hooks/actions.mjs';

// Calling this CLI is the explicit one-off backup action; hook opt-in is separate.
export function nightlyBackup(dirs = [], { root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'), env = process.env, run } = {}) {
  if (!Array.isArray(dirs) || !dirs.every(dir => typeof dir === 'string' && path.isAbsolute(dir))) throw new Error('Pass absolute backup directory paths');
  return backup({}, { root, env: { ...env, AICOS_BACKUP: 'on', AICOS_BACKUP_EVERY_MIN: '0', ...(dirs.length ? { AICOS_BACKUP_DIRS_JSON: JSON.stringify(dirs) } : {}) }, ...(run ? { run } : {}) });
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    const result = nightlyBackup(process.argv.slice(2));
    console.log(`Backup: ${result.status}. Verify the intended private remote and branch before first use.`);
  } catch {
    console.error('Backup failed. Verify Node/Git, private origin, auth, branch and secret scanner. No credential values logged.');
    process.exitCode = 1;
  }
}
