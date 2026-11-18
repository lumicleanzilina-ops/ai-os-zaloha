#!/usr/bin/env node
/**
 * Obal pro libovolný příkaz: dá mu soukromou dočasnou složku a po konci ji uklidí.
 *
 *   node tools/beh.mjs -- npm test
 *   node tools/beh.mjs -- python3 -m pytest
 *   node tools/beh.mjs -- bash -c 'cd projekt && npm test'            (pro && a roury)
 *   node tools/beh.mjs --koren=/cesta/projektu/work/_test-retained -- npx playwright test
 *
 * Proč: `testove-artefakty.mjs` uklízí testy psané v Node. Vitest, playwright, pytest, shell skripty a spol. píšou
 * do systémového TMPDIR a nikdo po nich neuklidí. Obal jim dá stejnou označenou složku: TMPDIR, TMP a TEMP míří do
 * `<kořen>/beh-<token>/tmp`, GIT_CEILING_DIRECTORIES na kořen. Složku zakládá a maže `tools/testove-artefakty.mjs`
 * (značka `.aios-test-retained`, 24 h a 20 složek, realpath, bez symlinků), na začátku i na konci proběhne běžný úklid
 * kořene. Neoznačené a cizí složky v kořeni se nikdy nemažou.
 *
 * Výchozí kořen je krátký `/tmp/aios-<uid>` (shortRoot): TMPDIR příkazu leží uvnitř složky běhu a unixové sokety
 * (Chromium a Playwright, Postgres) mají limit ~104 znaků, kořen v mezipaměti by ho přetáhl. Kde to nejde (Windows,
 * cizí složka téhož jména), je to uživatelská mezipaměť jako u testů kitu. Volba `--koren=` ho nahradí absolutní cestou
 * ke složce jménem `_test-retained` (v projektu typicky `work/_test-retained` v `.gitignore`; drž ji krátkou). Jiná
 * cesta se odmítne, kořen se nikdy nebere z proměnné prostředí.
 *
 * Konec: příkaz skončil kódem 0 => složka zmizí. Jiný kód nebo pád => zůstane k ladění v mezích pravidel (po příkazu,
 * který nic nenechal, nezůstane nic); cestu obal vypíše. Přeruší-li příkaz signál poslaný obalu (Ctrl+C, kill), složka
 * zmizí vždy. Návratový kód obalu je kód příkazu, příkaz zabitý signálem znamená 128 + číslo signálu.
 *
 * Signály SIGINT, SIGTERM a SIGHUP dostane nejdřív příkaz (bez terminálu celá jeho skupina procesů); po prodlevě
 * (výchozích 5 s, `--prodleva-ms=`) dostane SIGKILL, ať obal nevisí na příkazu, který signál ignoruje. Složka se maže až
 * po konci příkazu, ne pod rukama běžícího procesu. Bez terminálu běží příkaz ve vlastní skupině procesů: po jeho konci
 * se zabijí všichni, kdo ve skupině zbyli, a hlídač skupinu ukončí taky, kdyby obal zahynul násilím (SIGKILL).
 * Proto jím nepouštěj, co má zůstat běžet (dev server, tunel, `nohup … &`).
 *
 * Windows: `npm`, `npx`, `vitest` a spol. jsou `.cmd`, které `spawn` bez shellu nespustí; obal je najde v PATH podle PATHEXT a spustí
 * přes `cmd.exe` s každým argumentem v uvozovkách (viz tools/beh-prikaz.mjs; argument s uvozovkou nebo `%` se odmítne). Skupiny procesů
 * Windows nemá: signál (kromě Ctrl+C v konzoli, který dostane celá konzole) dostane jen přímý potomek, u `.cmd` tedy `cmd.exe`,
 * a strom procesů se nezabíjí. Obal na skutečném Windows zatím neběžel.
 *
 * Meze: uklízí jen TMPDIR. `test-results/`, `coverage/`, `.next` a `work/` v projektu zůstanou, stejně jako pevné cesty
 * v `/tmp`. BSD `mktemp` na macOS bez šablony a s `-t` TMPDIR ignoruje; ve skriptech piš `mktemp -d "$TMPDIR/x.XXXXXX"`.
 * Nejde-li složku založit, obal vypíše NEAKTIVNÍ a příkaz přesto proběhne, bez úklidu (kdyby neběžel, blokoval by práci).
 * Pod preloadem retain-fixtures odmítne běžet (stejně jako sada kitu). Vstup a výstup příkazu jsou přímo roury obalu
 * (stdio inherit); vlastní hlášení obal píše synchronně přes fs.writeSync, ať při `process.exit` nezmizí.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { isatty } from 'node:tty';
import { spawnPlan } from './beh-prikaz.mjs';
import { ROOT_NAME, shortRoot, testArtifacts, userCacheRoot } from './testove-artefakty.mjs';

const USAGE = `Použití: node tools/beh.mjs [--koren=<absolutní cesta>/${ROOT_NAME}] [--prodleva-ms=<ms>] -- <příkaz> [argumenty…]`;
const WATCHDOG = 'W=$1; shift; ( while kill -0 "$W" 2>/dev/null; do sleep 1; done; kill -KILL 0 ) >/dev/null 2>&1 & exec "$@"';

function say(text) {
  try { fs.writeSync(2, `beh.mjs: ${text}\n`); } catch { /* stderr zavřený */ }
}
function usage(text) {
  say(`${text}\n${USAGE}`);
  process.exit(2);
}

const argv = process.argv.slice(2);
const split = argv.indexOf('--');
if (split < 0) usage('před příkazem chybí „--“');
const command = argv.slice(split + 1);
if (!command.length) usage('za „--“ chybí příkaz');
let rootOption = null, graceMs = 5000;
for (const arg of argv.slice(0, split)) {
  const at = arg.indexOf('=');
  const key = at < 0 ? arg : arg.slice(0, at), value = at < 0 ? '' : arg.slice(at + 1);
  if (key === '--koren' && value) rootOption = value;
  else if (key === '--prodleva-ms' && /^[0-9]{1,6}$/.test(value)) graceMs = Number(value);
  else usage(`neznámá nebo neúplná volba ${arg}`);
}
if (rootOption !== null && (!path.isAbsolute(rootOption) || path.basename(rootOption) !== ROOT_NAME)) usage(`kořen musí být absolutní cesta ke složce jménem ${ROOT_NAME}`);
// Co a jak spustit (na Windows hledání v PATH podle PATHEXT a `.cmd`/`.bat` přes cmd.exe; jinde beze změny). Dřív než vznikne složka běhu.
let launch;
try { launch = spawnPlan(command); } catch (error) { say(error.message); process.exit(2); }

let artifacts = null;
try {
  const root = rootOption ?? shortRoot() ?? userCacheRoot();
  if (!root) throw new Error('účet nemá domovskou složku a /tmp není použitelný');
  artifacts = testArtifacts({ root, label: 'beh', signals: false }); // krátký štítek: TMPDIR nesmí být delší, než musí
} catch (error) {
  if (error.code === 'EAIOS_RETAIN') { say(error.message); process.exit(1); }
  say(`obal je NEAKTIVNÍ, příkaz poběží bez soukromé složky a nic po něm neuklidí (${error.message}). Zapisovatelný kořen zadáš volbou --koren=<absolutní cesta>/${ROOT_NAME}.`);
}
// Registrován až po exit posluchači pomocníka, takže vidí, co po jeho rozhodnutí ve složce zbylo.
if (artifacts) {
  process.once('exit', (code) => {
    if (code !== 0 && fs.existsSync(artifacts.run)) say(`příkaz skončil s kódem ${code}, soubory zůstaly k ladění v ${artifacts.run} (smažou se po 24 h nebo mimo 20 nejnovějších)`);
  });
}

// Bez terminálu (agent, CI) běží příkaz ve vlastní skupině procesů a signál dostane celá. S terminálem zůstává ve skupině
// popředí, jinak by čtení z klávesnice zastavil SIGTTIN; Ctrl+C tam dostane skupina od terminálu sama, příkaz ho tedy
// dostane dvakrát (od terminálu a od obalu). Windows skupiny procesů nemá.
const group = !isatty(0) && process.platform !== 'win32';
// Hlídač ve skupině příkazu sleduje obal: zahyne-li bez možnosti úklidu (SIGKILL, časový limit nástroje), do ~1 s zabije
// celou skupinu, jinak by příkaz přežil jako osiřelý. `exec` nahradí shell příkazem, takže se kód i signály předávají beze změny.
const child = group
  ? spawn('/bin/sh', ['-c', WATCHDOG, 'sh', String(process.pid), launch.file, ...launch.args], { stdio: 'inherit', detached: true })
  : spawn(launch.file, launch.args, { stdio: 'inherit', ...launch.options });
const send = (signal) => {
  try {
    if (group) process.kill(-child.pid, signal);
    else child.kill(signal);
  } catch { /* už skončil */ }
};
let interrupted = false;
for (const signal of process.platform === 'win32' ? ['SIGINT', 'SIGTERM'] : ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => {
    interrupted = true;
    send(signal);
    setTimeout(() => send('SIGKILL'), graceMs).unref();
  });
}
child.on('error', (error) => {
  say(`${command[0]} nejde spustit: ${error.message}`);
  process.exit(127);
});
child.on('exit', (status, signal) => {
  if (group) send('SIGKILL'); // po konci příkazu nesmí ve skupině zůstat nikdo, kdo by psal do složky, kterou teď smažeme
  if (interrupted) artifacts?.discard();
  process.exit(signal ? 128 + (os.constants.signals[signal] ?? 1) : (status ?? 1));
});
