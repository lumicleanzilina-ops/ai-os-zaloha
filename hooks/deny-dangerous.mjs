/** Bounded command inspection, never command execution. Not an OS sandbox. */
import { ask, deny } from './runtime.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DELETE = new Set(['rm', 'rmdir', 'rd', 'del', 'erase', 'unlink', 'shred', 'remove-item', 'ri', 'clear-content']);
const WRAPPERS = new Set(['sudo', 'command', 'exec', 'nohup', 'env', 'call', 'then', 'do', 'else', 'if', '!', 'time', 'timeout']);
const INTERPRETERS = /^(?:python(?:\d+(?:\.\d+)?)?|node|ruby|perl|php|powershell|pwsh|bash|sh|cmd)$/i;
const DELETE_API = /(?:\b(?:os\s*\.\s*(?:remove|unlink)|shutil\s*\.\s*rmtree|(?:fs|fsPromises|fsp)\s*\.\s*(?:rm|rmdir|unlink)(?:Sync)?|(?:File|Directory)\]\s*::\s*Delete)\s*\(|\.(?:rm|remove|unlink|rmdir|rmtree)(?:Sync)?\s*\(|\[['"](?:rm|unlink|rmdir)(?:Sync)?['"]\]\s*\(|\b(?:Remove-Item|Clear-Content)\b)/i;

// Keep quoted arguments as a single word; inspect nested shell substitutions separately.
export function lex(command, { posix = true } = {}) {
  const tokens = []; let word = ''; let quote = '';
  const flush = () => { if (word) tokens.push({ word }); word = ''; };
  for (let i = 0; i < command.length; i++) {
    const char = command[i];
    if (quote) {
      if (char === quote) quote = '';
      else if (char === '\\' && quote === '"' && /["\\$`]/.test(command[i + 1] || '')) word += command[++i];
      else word += char;
      continue;
    }
    if (char === '"' || char === "'") { quote = char; continue; }
    // POSIX shells remove an unquoted backslash before any character.
    if (posix && char === '\\' && command[i + 1]) { if (command[i + 1] === '\n') i++; else word += command[++i]; continue; }
    if (';&|\n(){}'.includes(char)) { flush(); tokens.push({ operator: char }); continue; }
    if (/\s/.test(char)) { flush(); continue; }
    word += char;
  }
  flush();
  return { tokens, uncertain: Boolean(quote) };
}
const executable = (word) => String(word).split(/[\\/]/).at(-1).replace(/\.(exe|cmd|bat)$/i, '').toLowerCase();
function commandWords(words) {
  let index = 0;
  while (index < words.length) {
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(words[index])) { index++; continue; }
    const wrapper = executable(words[index]);
    if (!WRAPPERS.has(wrapper)) break;
    index++;
    const withValue = wrapper === 'sudo' ? ['-u', '-g', '-h', '-p', '-C', '--user', '--group', '--host'] : wrapper === 'env' ? ['-u', '-C', '--unset', '--chdir'] : wrapper === 'exec' ? ['-a'] : wrapper === 'time' ? ['-f', '-o', '--format', '--output'] : wrapper === 'timeout' ? ['-k', '-s', '--kill-after', '--signal'] : [];
    while (index < words.length && words[index].startsWith('-')) { if (withValue.includes(words[index])) index++; index++; }
    if (wrapper === 'timeout' && /^\d+(?:\.\d+)?[smhd]?$/.test(words[index] || '')) index++;
  }
  return words.slice(index);
}
function inspectSegment(words, depth) {
  words = commandWords(words);
  const head = executable(words[0]);
  if (!head) return null;
  if (DELETE.has(head)) return deny('Permanent deletion is blocked, including temporary files. Prepare a trash move and obtain the user’s permission.');
  if (/^(mkfs(?:\..*)?|format|format-volume|clear-disk)$/.test(head) || (head === 'dd' && words.some((word) => /^of=\/dev\//.test(word)))) return deny('Disk formatting or raw device writes are blocked.');
  if ((head === 'find' && words.some((word) => word === '-delete' || DELETE.has(executable(word)))) || (head === 'xargs' && words.some((word) => DELETE.has(executable(word))))) return deny('Indirect permanent deletion is blocked.');
  if (head === 'git') {
    // The exception applies only to this segment, never to the entire compound input.
    let i = 1;
    while (i < words.length && words[i].startsWith('-')) { if (['-C', '-c', '--git-dir', '--work-tree'].includes(words[i])) i++; i++; }
    const sub = words[i]; const args = words.slice(i + 1);
    if (sub === 'rm' && !args.includes('--cached')) return deny('git rm removes worktree files. Only git rm --cached is exempt from the deletion guard.');
    if (sub === 'clean' && args.some((word) => word === '--force' || /^-[A-Za-z]*f/.test(word))) return deny('git clean permanently removes untracked files.');
    if ((sub === 'push' && args.some((word) => /^(--force(?:-with-lease)?|-f)$/.test(word))) || (sub === 'reset' && args.includes('--hard')) || (sub === 'checkout' && args.some((word) => ['--', '-f', '--force', '.'].includes(word)))) return ask('This Git operation can overwrite history or local work. Review the target and obtain explicit approval; recovery is not guaranteed.');
  }
  if (['eval', 'invoke-expression', 'iex', 'source', '.'].includes(head)) return ask('Dynamically evaluated code is not fully inspectable. Review it before running.');
  if (INTERPRETERS.test(head)) {
    const text = words.slice(1).join(' ');
    if (DELETE_API.test(text)) return deny('Filesystem deletion through an interpreter is blocked.');
    const inline = words.findIndex((word) => ['-c', '-e', '-command', '-encodedcommand', '/c'].includes(word.toLowerCase()));
    if (inline >= 0) {
      if (words[inline].toLowerCase() === '-encodedcommand') return ask('Encoded code cannot be inspected safely.');
      if (depth < 3) {
        const nested = inspectCommand(words.slice(inline + 1).join(' '), depth + 1);
        if (nested?.hookSpecificOutput?.permissionDecision === 'deny') return nested;
      }
      return ask('Inline interpreter code can mutate files. Review it before running; this guard is not a sandbox.');
    }
  }
  if (['chmod', 'chown'].includes(head) && words.some((word) => /^(?:-[A-Za-z]*R|--recursive)$/.test(word))) return ask('Recursive permissions changes require review.');
  return null;
}
export function inspectCommand(command, depth = 0, { posix = true } = {}) {
  if (typeof command !== 'string' || !command.trim()) return deny('Missing command; protection NOT VERIFIED.');
  if (command.length > 1024 * 1024) return deny('Command too large to inspect; protection NOT VERIFIED.');
  if (/:\(\)\s*\{\s*:\|:/.test(command)) return deny('Process fork bomb blocked.');
  const parsed = lex(command, { posix }); const decisions = []; let words = [];
  const inspect = () => { const value = inspectSegment(words, depth); if (value) decisions.push(value); words = []; };
  for (const token of parsed.tokens) { if (token.operator) inspect(); else words.push(token.word); }
  inspect();
  // Shell substitutions inside quotes are executable even though their surrounding word is quoted.
  for (const hit of command.matchAll(/\$\(([^()]*)\)|`([^`]*)`/g)) {
    if (depth < 3) { const value = inspectCommand(hit[1] || hit[2], depth + 1); if (value) decisions.push(value); }
  }
  if (decisions.some((value) => value.hookSpecificOutput.permissionDecision === 'deny')) return decisions.find((value) => value.hookSpecificOutput.permissionDecision === 'deny');
  if (decisions.length) return decisions[0];
  if (parsed.uncertain || /\$\{|\$\w+\s|\$\(.*\$\(/.test(command)) return ask('Dynamic or incomplete shell input requires review.');
  if (/\b(?:curl|wget)\b[\s\S]*\|\s*(?:(?:sudo|env)\s+)?(?:bash|sh|pwsh|powershell)\b/i.test(command)) return ask('Downloaded code piped to an interpreter requires review.');
  return null;
}
export function dangerous(payload) {
  if (!payload || !['Bash', 'PowerShell'].includes(payload.tool_name)) return deny('Unsupported or missing shell tool; protection NOT VERIFIED.');
  const command = payload.tool_input?.command ?? payload.tool_input?.cmd;
  if (typeof command === 'string' && /::\s*Delete(?:File|Directory)\s*\(/i.test(command)) return deny('VisualBasic file deletion is blocked. Use the reviewed tools/kos.mjs helper for a confirmed Recycle Bin move.');
  if (payload.tool_name === 'PowerShell' && typeof command === 'string' && (DELETE_API.test(command) || /\.Delete\s*\(/i.test(command))) return deny('PowerShell filesystem/object deletion is blocked.');
  return inspectCommand(command, 0, { posix: payload.tool_name === 'Bash' });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const output = dangerous(JSON.parse(fs.readFileSync(0, 'utf8')));
    if (output) process.stdout.write(JSON.stringify(output) + '\n');
  } catch {
    process.stdout.write(JSON.stringify(deny('Invalid guard input; protection NOT VERIFIED.')) + '\n');
    process.exitCode = 2;
  }
}
