#!/usr/bin/env node
/**
 * secret-guard.mjs — an API key must never reach git. Ever. This enforces it.
 *
 * Hard Rule 2 says "never commit secrets". A document can't enforce that; a
 * pre-commit hook can. This script scans changed staged blobs in full and
 * stops the commit if any of them looks like a live credential.
 *
 * Written after a real leak: a bot token slipped into a committed log file and
 * had to be rotated at the provider. Deleting the file afterwards does NOT undo
 * it — once a secret is in git history, it is burned. The only fix is rotation.
 * So the cheapest place to stop it is here, before the commit exists.
 *
 * Install (one time, in your workspace):
 *   git config core.hooksPath hooks/git-hooks
 *
 * Usage:
 *   node hooks/secret-guard.mjs --staged     # what's about to be committed (the hook)
 *   node hooks/secret-guard.mjs <file…>      # check specific files
 * Exit 0 = inspected and clean, 1 = found something OR inspection failed.
 * No environment variable bypass: fix a false-positive pattern, never bypass inspection.
 */

import { readFileSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from 'node:url';

/** Patterns are exported so other tools (e.g. log redaction) share one definition of "secret". */
export const SECRET_PATTERNS = [
  { what: "Telegram bot token", re: /\b\d{8,10}:AA[A-Za-z0-9_-]{30,}\b/g },
  { what: "OpenAI / Anthropic / OpenRouter key", re: /\bsk-(?:or-v1-|ant-|proj-|live-|svcacct-)?[A-Za-z0-9_-]{20,}/g },
  { what: "Google API key", re: /\bAIza[0-9A-Za-z_-]{30,}\b/g },
  { what: "Google key (new format)", re: /\bAQ\.[A-Za-z0-9._~-]{30,}\b/g },
  { what: "GitHub token", re: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/g },
  { what: "GitHub fine-grained token", re: /\bgithub_pat_[A-Za-z0-9_]{40,}/g },
  { what: "Slack token", re: /\bxox[baprs]-[A-Za-z0-9-]{10,}/g },
  { what: "AWS access key", re: /\bAKIA[0-9A-Z]{16}\b/g },
  { what: "Stripe key", re: /\b[sr]k_(?:live|test)_[A-Za-z0-9]{20,}\b/g },
  // Formats seen leaking in a real AI OS workspace (a JWT went to git once). Same list as the
  // author's own guard; none of them is tied to one person.
  { what: "Stripe webhook secret", re: /\bwhsec_[A-Za-z0-9]{20,}\b/g },
  { what: "JWT (Supabase key, session token)", re: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g },
  { what: "Supabase secret key", re: /\bsb_secret_[A-Za-z0-9_-]{20,}/g },
  { what: "Meta (Facebook) access token", re: /\bEAA[A-Za-z0-9]{50,}/g },
  { what: "Notion token", re: /\b(?:ntn_|secret_)[A-Za-z0-9]{40,}/g },
  { what: "GoHighLevel private integration token", re: /\bpit-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi },
  { what: "Figma token", re: /\bfigd_[A-Za-z0-9_-]{30,}/g },
  { what: "Tailscale key", re: /\btskey-[a-z]+-[A-Za-z0-9-]{20,}/g },
  { what: "Hugging Face token", re: /\bhf_[A-Za-z0-9]{30,}\b/g },
  { what: "Bitbucket app password", re: /\bATBB[A-Za-z0-9_-]{24,}/g },
  { what: "Atlassian token", re: /\bATATT3[A-Za-z0-9_=-]{30,}/g },
  { what: "Google OAuth client secret", re: /\bGOCSPX-[A-Za-z0-9_-]{20,}/g },
  // Not preceded by a word char, slash or colon: "https://host/a/1//0abc…" is a URL, not a token.
  { what: "Google refresh token", re: /(?<![\w/:])1\/\/0[A-Za-z0-9_-]{30,}/g },
  { what: "npm token", re: /\bnpm_[A-Za-z0-9]{36}\b/g },
  // Exact SendGrid shape (22 + 43 chars), so dotted identifiers like SG.Some_Long_Class.Method do not match.
  { what: "SendGrid key", re: /\bSG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}(?![A-Za-z0-9_-])/g },
  // Include the entire PEM body in redaction, including an incomplete block.
  { what: "private key", re: /-----BEGIN[A-Z ]*PRIVATE KEY-----[\s\S]*?(?:-----END[A-Z ]*PRIVATE KEY-----|$)/g },
  { what: "Bearer token", re: /\bBearer\s+[A-Za-z0-9._-]{30,}/g },
  { what: "password / key assignment", re: /\b(?:api[_-]?key|apikey|secret|token|password|passwd)["']?\s*[:=]\s*["']?[A-Za-z0-9._~+/-]{20,}/gi },
];

/** Looks like a key but isn't. Tested against the MATCH, not the whole line — otherwise
 *  a single "example" anywhere on a line would wave a real token straight through. */
const NOT_A_LEAK = /«redacted»|\$\{|process\.env|YOUR_|PLACEHOLDER|EXAMPLE|\*{4,}|^<.*>$/i;

function secretMatches(text) {
  const source = String(text); const found = [];
  for (const { what, re } of SECRET_PATTERNS) {
    for (const hit of source.matchAll(new RegExp(re.source, re.flags.replace("g", "") + "g"))) {
      // A placeholder-looking substring in PEM body cannot exempt the private key.
      if (what !== 'private key' && NOT_A_LEAK.test(hit[0])) continue;
      found.push({ what, start: hit.index, end: hit.index + hit[0].length });
    }
  }
  return found;
}

/** Return findings without exposing any matched credential bytes. */
export function findSecrets(text, origin = "") {
  return secretMatches(text).map(({ what, start, end }) => ({ what, origin, sample: `[redacted, ${end - start} chars]` }));
}

/** Shared full-value redaction, with exactly the same patterns/exceptions as inspection. */
export function redactSecrets(text) {
  const source = String(text); const ranges = [];
  for (const hit of secretMatches(source).sort((a, b) => a.start - b.start || b.end - a.end)) {
    const last = ranges.at(-1);
    if (last && hit.start <= last.end) last.end = Math.max(last.end, hit.end);
    else ranges.push({ start: hit.start, end: hit.end });
  }
  let result = ''; let cursor = 0;
  for (const { start, end } of ranges) { result += source.slice(cursor, start) + '[REDACTED]'; cursor = end; }
  return result + source.slice(cursor);
}

/** Binary diff heuristics and .gitattributes must not suppress inspection. */
export function findBlobSecrets(bytes, origin = '') {
  const variants = new Set([bytes.toString('utf8'), bytes.toString('latin1'), bytes.toString('utf16le')]);
  const bigEndian = Buffer.alloc(bytes.length - (bytes.length % 2));
  for (let i = 0; i < bigEndian.length; i += 2) { bigEndian[i] = bytes[i + 1]; bigEndian[i + 1] = bytes[i]; }
  variants.add(bigEndian.toString('utf16le'));
  const findings = []; // Findings are deduplicated across decodings.
  const seen = new Set();
  for (const text of variants) for (const finding of findSecrets(text, origin)) {
    const signature = finding.what + '\0' + finding.sample;
    if (!seen.has(signature)) { seen.add(signature); findings.push(finding); }
  }
  return findings;
}

/** Scan every byte with bounded memory. Keep overlap for split ASCII/UTF-16 signatures.
 * Very long unfinished credential candidates fail closed rather than falling out of the
 * overlap window. This is a scan failure, never permission to skip a large file. */
export async function scanBlobStream(chunks, origin = '') {
  const overlap = 64 * 1024; let tail = Buffer.alloc(0); const found = new Map();
  for await (const chunk of chunks) {
    const bytes = Buffer.concat([tail, chunk]);
    for (const offset of [0, 1]) {
      const part = bytes.subarray(offset);
      for (const encoding of ['utf8', 'latin1', 'utf16le']) {
        const text = part.toString(encoding);
        if (/\beyJ[A-Za-z0-9_-]{16000}|\b(?:Bearer|api[_-]?key|apikey|secret|token|password|passwd)["']?\s*[:=]?\s{16000}|-----BEGIN[A-Z ]{16000}/i.test(text)) throw new Error('Unbounded credential candidate; inspection BLOCKED');
      }
      // A boundary at the end makes an unfinished API-key prefix fail closed too.
      for (const finding of findBlobSecrets(Buffer.concat([part, Buffer.alloc(2)]), origin)) found.set(finding.what, finding);
    }
    // Even length preserves both UTF-16 alignments on the next chunk.
    tail = bytes.subarray(Math.max(0, bytes.length - overlap));
  }
  return [...found.values()];
}

async function streamIndexBlobs(cwd, gitArgs, paths) {
  const findings = [];
  for (const file of paths) {
    const child = spawn('git', [...gitArgs, 'cat-file', 'blob', ':' + file], { cwd, stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true });
    const completion = new Promise((resolve) => {
      child.once('error', () => resolve(false));
      child.once('close', (code, signal) => resolve(code === 0 && !signal));
    });
    const timer = setTimeout(() => child.kill(), 90000);
    try {
      findings.push(...await scanBlobStream(child.stdout, file));
      if (!await completion) throw new Error('Git blob read failed');
    } finally { clearTimeout(timer); if (child.exitCode === null) child.kill(); }
  }
  return findings;
}

/** Check what's staged — the exact point where a leak can still be stopped for free. */
export function checkStaged(cwd = process.cwd(), { run = spawnSync, gitArgs = [] } = {}) {
  const checked = (args) => {
    const result = run('git', [...gitArgs, ...args], { cwd, encoding: null, timeout: 30000, maxBuffer: 128 * 1024 * 1024, windowsHide: true });
    if (!result || result.error || result.signal || result.status !== 0 || !Buffer.isBuffer(result.stdout)) {
      throw new Error('Staged blob inspection failed; commit BLOCKED (no credential values are logged).');
    }
    return result.stdout;
  };
  // Include type changes and unmerged paths: uninspectable index entries fail closed.
  const names = checked(['diff', '--cached', '--name-only', '-z', '--diff-filter=ACMRTU', '--no-ext-diff', '--no-textconv']);
  if (!names.length) return [];
  if (names.at(-1) !== 0) throw new Error('Incomplete staged path list; commit BLOCKED.');
  let paths;
  try { paths = new TextDecoder('utf-8', { fatal: true }).decode(names).split('\0').slice(0, -1); }
  catch { throw new Error('Uninspectable staged filename encoding; commit BLOCKED.'); }
  const found = [];
  if (paths.some((file) => !file)) throw new Error('Invalid staged path list; commit BLOCKED.');
  if (run === spawnSync) {
    // The worker drains stdout as a stream; spawnSync buffers only its small redacted report.
    const result = run(process.execPath, [fileURLToPath(import.meta.url), '--stream-index-blobs', cwd, JSON.stringify(gitArgs)], {
      input: JSON.stringify(paths), encoding: 'utf8', timeout: 100000, maxBuffer: 16 * 1024 * 1024, windowsHide: true,
    });
    if (result.error || result.signal || result.status !== 0) throw new Error('Staged stream inspection failed; commit BLOCKED.');
    let report; try { report = JSON.parse(result.stdout); } catch { throw new Error('Invalid scanner result; commit BLOCKED.'); }
    if (!Array.isArray(report)) throw new Error('Invalid scanner result; commit BLOCKED.');
    return report;
  }
  for (const file of paths) {
    if (!file) throw new Error('Invalid staged path list; commit BLOCKED.');
    // Read the exact index object, never the working tree or a rendered diff.
    found.push(...findBlobSecrets(checked(['cat-file', 'blob', ':' + file]), file));
  }
  return found;
}

// ---------- CLI ----------
if (process.argv[1]?.endsWith("secret-guard.mjs")) {
  try {
    const argv = process.argv.slice(2);
    if (argv[0] === '--stream-index-blobs') {
      const paths = JSON.parse(readFileSync(0, 'utf8')); const gitArgs = JSON.parse(argv[2]);
      if (argv.length !== 3 || !Array.isArray(paths) || !paths.every((p) => typeof p === 'string' && p) || !Array.isArray(gitArgs) || !gitArgs.every((a) => typeof a === 'string')) throw new Error('Invalid worker input');
      process.stdout.write(JSON.stringify(await streamIndexBlobs(argv[1], gitArgs, paths)));
      process.exit(0);
    }
    if (argv.some((arg) => arg.startsWith('--') && arg !== '--staged')) throw new Error('Unsupported scanner argument');
    const found = argv.includes("--staged") || !argv.length
      ? checkStaged()
      : argv.flatMap((f) => findBlobSecrets(readFileSync(f), f));
    if (!found.length) process.exit(0);
    console.error("COMMIT BLOCKED — credential pattern detected. Values are redacted.");
    for (const finding of found.slice(0, 10)) console.error(`${finding.origin ? finding.origin + ' — ' : ''}${finding.what}: ${finding.sample}`);
    console.error("Protect credentials outside Git; correct false-positive rules rather than bypassing inspection.");
    process.exit(1);
  } catch {
    console.error("COMMIT BLOCKED — secret inspection failed. Check Git, paths and Node; no values were logged.");
    process.exit(1);
  }
}
