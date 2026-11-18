/**
 * Jak obal `beh.mjs` spustí příkaz. Mimo Windows ho spustí tak, jak je. Na Windows `spawn` bez shellu nenajde `.cmd`
 * ani `.bat` (`npm`, `npx`, `vitest`, `playwright`) a od oprav CVE-2024-27980 je přímo spustit odmítne (EINVAL), takže:
 *
 *  - program se hledá podle PATHEXT (jen `.com`, `.exe`, `.bat`, `.cmd`) v PATH, ne v aktuální složce: holý název
 *    v pracovní složce projektu by jinak mohl podstrčit cizí `npm.cmd`. Cesta s lomítkem se bere od pracovní složky;
 *  - `.exe` a `.com` se spustí přímo, bez shellu;
 *  - `.cmd` a `.bat` spustí `cmd.exe /d /s /v:off /c "…"` a každý argument je v uvozovkách. V uvozovkách jsou `& | < > ^ ( )`
 *    pro cmd.exe obyčejné znaky a `/v:off` vypíná `!`. Dovnitř se nesmí uvozovka, `%` (cmd by ho rozbalil), zalomení řádku
 *    a NUL: takový argument obal odmítne místo hádání, jak ho uvozit. Poslední zpětná lomítka se zdvojí, ať neukončí uvozovku.
 *
 * Čistá logika bez vedlejších efektů (platforma, prostředí, pracovní složka i `exists` jsou parametry), takže se dá
 * ověřit simulací i mimo Windows. Skutečné spuštění `.cmd` na Windows tu ověřené není: viz tools/README.md.
 */
import fs from 'node:fs';
import path from 'node:path';

const EXECUTABLE = ['.com', '.exe', '.bat', '.cmd'];
const DEFAULT_PATHEXT = ['.com', '.exe', '.bat', '.cmd'];
const failure = (message, code) => Object.assign(new Error(message), { code });

/** Proměnná prostředí bez ohledu na velikost písmen (Windows: `Path`, `PATHEXT`, `ComSpec`). */
function variable(env, name) {
  const key = Object.keys(env ?? {}).find((candidate) => candidate.toLowerCase() === name.toLowerCase());
  return key === undefined ? undefined : env[key];
}

/** Přípony ke zkoušení: PATHEXT zúžený na ty, které Windows spustí bez dalšího hostitele; prázdný výběr dá výchozí pořadí. */
export function executableExtensions(env) {
  const wanted = String(variable(env, 'PATHEXT') ?? '').split(';').map((item) => item.trim().toLowerCase()).filter((item) => EXECUTABLE.includes(item));
  return wanted.length ? [...new Set(wanted)] : DEFAULT_PATHEXT;
}

/** Složky z PATH: oddělené `;`, bez uvozovek kolem a bez prázdných. Aktuální složka se nepřidává. */
export function pathDirectories(env) {
  return String(variable(env, 'PATH') ?? '').split(';').map((item) => item.trim().replace(/^"(.*)"$/, '$1')).filter(Boolean);
}

const defaultExists = (file) => { try { return fs.statSync(file).isFile(); } catch { return false; } };

/** Plná cesta ke spustitelnému souboru, nebo null. Název s lomítkem nebo diskem se bere od `cwd`, holý název jen z PATH. */
export function findExecutable(name, { env = {}, cwd = '.', exists = defaultExists } = {}) {
  const win = path.win32;
  const hasLocation = /[\\/]/.test(name) || /^[A-Za-z]:/.test(name);
  const extension = win.extname(name).toLowerCase();
  const names = EXECUTABLE.includes(extension) ? [name] : executableExtensions(env).map((item) => name + item);
  const folders = hasLocation ? [null] : pathDirectories(env);
  for (const folder of folders) {
    for (const candidate of names) {
      const full = folder === null ? win.resolve(cwd, candidate) : win.join(folder, candidate);
      if (exists(full)) return full;
    }
  }
  return null;
}

/** Jeden argument v uvozovkách pro cmd.exe. Co se bezpečně uvozit nedá (uvozovka, %, zalomení, NUL), odmítne. */
export function quoteForCmd(value) {
  const text = String(value);
  if (/[\0\r\n]/.test(text)) throw failure('Argument obsahuje zalomení řádku nebo NUL; přes cmd.exe ho nejde bezpečně předat.', 'EBEH_ARG');
  if (/["%]/.test(text)) throw failure(`Argument „${text.slice(0, 40)}“ obsahuje uvozovku nebo %; cmd.exe by ho rozbalil nebo rozdělil, proto ho .cmd a .bat nedostanou. Spusť program přímo (node, .exe) nebo použij cmd /c s vlastním uvozením.`, 'EBEH_ARG');
  return `"${text.replace(/\\+$/, (slashes) => slashes + slashes)}"`;
}

/** Příkaz pro cmd.exe: `cmd.exe /d /s /v:off /c ""program" "argument" …"` (první a poslední uvozovku s `/s` cmd odstraní). */
export function cmdInvocation(file, args, env) {
  const line = [file, ...args].map(quoteForCmd).join(' ');
  return { file: variable(env, 'ComSpec') || 'cmd.exe', args: ['/d', '/s', '/v:off', '/c', `"${line}"`], options: { windowsVerbatimArguments: true } };
}

/**
 * Co a s jakými volbami spustit. Mimo Windows beze změny. Na Windows najde program a `.cmd`/`.bat` obalí do cmd.exe.
 * Program, který se nenajde, se vrací beze změny: `spawn` pak selže s ENOENT a obal ohlásí kód 127 jako dřív.
 */
export function spawnPlan(command, { platform = process.platform, env = process.env, cwd = process.cwd(), exists } = {}) {
  const [name, ...args] = command;
  if (platform !== 'win32') return { file: name, args, options: {} };
  const found = findExecutable(name, { env, cwd, exists });
  if (found === null) return { file: name, args, options: {} };
  return ['.cmd', '.bat'].includes(path.win32.extname(found).toLowerCase()) ? cmdInvocation(found, args, env) : { file: found, args, options: {} };
}
