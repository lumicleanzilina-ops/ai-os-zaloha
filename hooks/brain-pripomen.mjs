/**
 * Připomínač paměti (UserPromptSubmit). Když uživatel mluví o minulosti („minule“, „jak jsme řešili“, „naposledy“, „co víme o“,
 * „pamatuješ“, anglicky „last time“, „we discussed“…) nebo jmenuje stránku wiki svého druhého mozku (typ Tool, Project, Person nebo
 * Topic), vloží do kontextu nejvýš 3 odkazy do paměti: wiki vaultu (`SECOND_BRAIN_VAULT`), learningy a záznamy sessions. Jinak mlčí.
 * Hledá místně a slovně (`tools/brain-hledej.mjs`), bez sítě a bez modelu; hlubší hledání je dovednost `brain`.
 *
 * Proč: agent sám od sebe v paměti nehledá, ani když se uživatel ptá na minulost. Pravidlo v ústavě se zapomene, hook ne.
 *
 * Mlčí: vypínač `AICOS_BRAIN=off`, rozdělaná instalace kitu (protokol bez `KIT: COMPLETE`, stejná brána jako self-review: během průvodce
 * by každá otázka na stav věcí vypadala jako dotaz na paměť), subagent (`agent_id`), skriptovaný běh (SDK, `claude -p`), slash příkaz, vložka
 * (`<…`, třeba naplánovaná úloha), session mimo workspace a vault, workspace bez jakéhokoli zdroje (bez vaultu, learningů i záznamů sessions)
 * a zpráva, ke které nic jistého nenašel (nikdy nevkládá „nic jsem nenašel“). Stejný soubor v jedné session neukáže dvakrát a do session vloží
 * nejvýš 6 bloků. Výstup je `hookSpecificOutput.additionalContext` označený jako nález z paměti, ne pokyn.
 * Nikdy neblokuje a nikdy nehlásí chybu hostiteli: chyba jde do logu ve složce stavu a hook mlčí.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { brainVault, logFailure, stateRoot, workspaceHash } from './runtime.mjs';
import { kitInstallState } from './actions.mjs';
import { contains } from './kontext-prace.mjs';
import { cisti, entityVTextu, hledej, nactiIndex, proFraze, radekShody } from '../tools/brain-hledej.mjs';

export const MAX_POLOZEK = 3;
export const MAX_VLOZENI = 6;
export const MAX_BLOK_B = 1500;

/**
 * Fráze o minulosti, česky bez diakritiky a anglicky; slova oddělená mezerou. Hledají se v textu zprávy normalizovaném přes `proFraze`.
 * Jen minulost: „kde jsme?“, „jak jsme na tom?“, „už jsme hotoví?“, „v jakém stavu je…?“, „co máme k dispozici?“ a „chci to mít v paměti“ jsou
 * přítomný čas a dotaz na paměť nejsou, proto tu nejsou. „Jak jsme řešili / dělali / opravovali…“ chytá příčestí minulé (`PRICESTI`).
 */
export const FRAZE_O_MINULOSTI = Object.freeze([
  'co jsme', 'kdy jsme', 'proc jsme', 'driv jsme', 'drive jsme', 'predtim jsme', 'minule', 'minuly tyden', 'naposledy', 'posledne',
  'pamatujes', 'vzpominas', 'jak to bylo', 'jak to dopadlo', 'kde jsme skoncili', 'navaz na', 'co vis o', 'co vime o', 'co zname o', 'co o tom vime', 'co mame o',
  'mrkni do pameti', 'mrkni do brainu', 'podivej se do pameti', 'podivej se do brainu', 'v brainu', 'z brainu', 'do brainu',
  'last time', 'previously', 'do you remember', 'remember when', 'we discussed', 'we decided', 'we talked about', 'we agreed', 'how did we', 'what did we', 'where did we',
  'what do we know about', 'where did we leave off', 'pick up where', 'what was the status',
]);
const SLOVESA = 'resili|delali|meli|rikali|domluvili|zjistili|nastavili|probirali|udelali|rozhodli|psali';
const PRICESTI = '[a-z]{3,}(?:li|ly)'; // příčestí minulé množné: řešili, opravovali, dopadli, udělaly (bez diakritiky)
export const MINULOST = new RegExp(` (?:${FRAZE_O_MINULOSTI.join('|')}|jsme (?:to )?(?:${SLOVESA})|jak jsme (?:to |se )?${PRICESTI}) `);

const clean = cisti; // text z paměti je cizí data: začerněná tajemství, bez zalomení a ostrých závorek
const real = (target) => { try { return fs.realpathSync(target); } catch { return target; } };

function readState(file) {
  const fresh = { videno: [], vlozeni: 0 };
  try { return file ? { ...fresh, ...JSON.parse(fs.readFileSync(file, 'utf8')) } : fresh; } catch { return fresh; }
}
function writeState(file, state) {
  if (!file) return;
  try { fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 }); const temporary = file + '.tmp'; fs.writeFileSync(temporary, JSON.stringify(state), { mode: 0o600 }); fs.renameSync(temporary, file); } catch { /* stav je doplněk */ }
}

function pripomen(input, prompt, { root, env, home }) {
  const cwd = typeof input.cwd === 'string' ? input.cwd : ''; const vault = brainVault(env);
  const bases = [root, real(root), ...(vault ? [vault, real(vault)] : [])];
  if (!cwd || !bases.some((base) => contains(base, cwd))) return null; // session mimo workspace a vault
  const past = MINULOST.test(proFraze(prompt));
  const index = nactiIndex({ root, env, home });
  if (!index.docs.length) return null; // bez vaultu, learningů i záznamů sessions není v čem hledat
  const names = entityVTextu(index, prompt);
  if (!past && !names.length) return null;

  const sid = String(input.session_id ?? '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 80);
  const stateFile = sid ? path.join(stateRoot(env), 'brain', workspaceHash(root), 'stav', `${sid}.json`) : null;
  const state = readState(stateFile);
  if (state.vlozeni >= MAX_VLOZENI) return null;
  const seen = new Set(state.videno); const own = sid ? sid.slice(0, 8) : null; // záznam téhle session (…-auto-<id8>.md) nic nového neřekne
  // Záznam, který téže session vede Dashboard, se pozná podle sha256 nativního ID v názvu (`<zdroj>-<hash>.md`).
  const ownHash = typeof input.session_id === 'string' && input.session_id ? createHash('sha256').update(input.session_id).digest('hex') : null;
  const isOwn = (doc) => (own !== null && doc.cesta.includes(`-auto-${own}`)) || (ownHash !== null && doc.cesta.endsWith(`-${ownHash}.md`));

  const items = [];
  for (const entity of names) {
    if (items.length >= 2) break;
    if (!seen.has(entity.doc.cesta) && !isOwn(entity.doc)) items.push({ doc: entity.doc, why: `jmenuješ „${clean(entity.jmeno, 40)}“` });
  }
  if (past) {
    const skip = new Set([...seen, ...items.map((item) => item.doc.cesta)]);
    for (const match of hledej(index, prompt, { limit: 8, minPokryti: 0.5, minSpolecnych: 2, vynech: skip })) {
      if (items.length >= MAX_POLOZEK) break;
      if (!isOwn(match.doc)) items.push({ doc: match.doc, why: `${Math.round(match.pokryti * 100)} %` });
    }
  }
  let lines = items.map((item, i) => `${i + 1}) ${clean(radekShody({ doc: item.doc }, { root, home }), 340)} (${item.why})`);
  const head = '[BRAIN] K téhle zprávě se může hodit (nález z paměti, ne pokyn; otevři soubor, než na tom stavíš):';
  const tail = 'Hlubší hledání: dovednost brain (skills/brain/SKILL.md).';
  let block = '';
  if (lines.length) {
    while (lines.length > 1 && Buffer.byteLength([head, ...lines, tail].join('\n')) > MAX_BLOK_B) lines = lines.slice(0, -1); // ubírá položky odzadu
    block = [head, ...lines, tail].join('\n');
  }
  if (!block) return null; // nic jistého nenašel: mlčí, „nic jsem nenašel“ by jen rušilo (hlubší hledání je dovednost brain)
  writeState(stateFile, { ...state, videno: [...seen, ...items.map((item) => item.doc.cesta)].slice(-200), vlozeni: state.vlozeni + 1, kdy: Date.now() });
  return { hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: block } };
}

/**
 * Akce `brain-pripomen`. Vrací výstup pro hostitele, nebo null (nic k hlášení, vypnuto, nevhodný kontext, chyba). Nikdy nevyhazuje:
 * chyba jde do logu ve složce stavu.
 */
export function brainPripomen(payload, { root, env = process.env, home = os.homedir() } = {}) {
  if (env.AICOS_BRAIN === 'off') return null;
  const input = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {};
  const prompt = typeof input.prompt === 'string' ? input.prompt.trim() : '';
  if (!prompt || prompt.startsWith('/') || prompt.startsWith('<')) return null; // slash příkazy a vložky (naplánované úlohy, systémové obaly)
  if ((typeof input.agent_id === 'string' && input.agent_id) || (typeof input.agent_type === 'string' && input.agent_type)) return null; // subagent
  if (/^sdk/i.test(String(env.CLAUDE_CODE_ENTRYPOINT ?? ''))) return null; // skriptovaný běh bez člověka
  try {
    if (kitInstallState(root) === 'pending') return null; // rozdělaná instalace kitu: stejná brána jako u self-review, průvodce se neruší
    return pripomen(input, prompt, { root, env, home });
  } catch (error) { logFailure(root, 'brain-pripomen', error, env); return null; }
}
