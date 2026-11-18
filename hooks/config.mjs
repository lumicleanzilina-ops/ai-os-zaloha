import { BOOTSTRAP, BOOTSTRAP_SOFT } from './runtime.mjs';

export function kitHooks() {
  const action = (name, timeout = 30) => ({ type: 'command', command: 'node', args: ['--eval', BOOTSTRAP, '${CLAUDE_PROJECT_DIR}', name], timeout });
  // Měkký bootstrap: při jakékoli chybě kitu tichý kód 0 (tvrdý by u UserPromptSubmit zahodil zprávu uživatele).
  const soft = (name, timeout = 5) => ({ type: 'command', command: 'node', args: ['--eval', BOOTSTRAP_SOFT, '${CLAUDE_PROJECT_DIR}', name], timeout });
  return {
    PreToolUse: [
      { matcher: 'Bash|PowerShell', hooks: [action('deny-dangerous'), action('checkpoint', 120)] },
      { matcher: 'Edit|Write|MultiEdit', hooks: [action('checkpoint', 120), action('guard-root-writes')] },
    ],
    PostToolUse: [{ matcher: 'Skill', hooks: [action('skill-usage')] }],
    Stop: [{ hooks: [action('self-review'), action('backup-on-stop', 120), action('zaznam-session', 10)] }],
    SessionStart: [{ hooks: [action('learnings-index'), action('kontext-prace', 10), action('zaznam-session', 10)] }],
    // Připomínač paměti: při řeči o minulosti nebo zmínce stránky wiki vloží k zprávě nejvýš 3 odkazy do paměti. Rychlý, bez sítě; timeout 5 s.
    UserPromptSubmit: [{ hooks: [soft('brain-pripomen', 5)] }],
    // SessionEnd: host čeká nejvýš na největší timeout zapojených hooků (výchozí 1,5 s), proto 5 s a rozpočet čtení přepisu uvnitř hooku.
    SessionEnd: [{ hooks: [action('zaznam-session', 5)] }],
  };
}

/**
 * Čtecí příkazy, které kit předschvaluje v `permissions.allow`, aby je uživatel nemusel potvrzovat klikem. Jen příkazy, které nic
 * nezapisují a nejdou na síť. Dodaný `.claude/settings.json` nese první dvě skupiny (SHIPPED_ALLOW) už před aktivací (čte se a ptá i bez
 * zapnutých pojistek), aktivace pojistek přidá celý seznam (KIT_ALLOW):
 * - ls, grep, head a wc (READ_ALLOW): Claude Code (ověřeno ve verzi 2.1.286) nemá nástroje Glob a Grep. Agent čte nástrojem Read a hledá těmito
 *   příkazy, každým zvlášť, bez řetězení;
 * - dotazy a náhledy (QUERY_ALLOW), na které se agent při generálce 16. 11. 2026 po každém kroku ptal: `git --version`, `git check-ignore`
 *   (které cesty Git ignoruje), `sw_vers` (verze macOS) a náhled `node tools/zpristupnit-skilly.mjs` (bez přepínače, nebo s `--nahled`) a `node
 *   tools/aktivovat-pojistky.mjs` (bez přepínačů). Náhled se od zápisu liší tvarem příkazu: přesný tvar bez hvězdičky hostitel porovnává doslova,
 *   takže `--apply` ani `--workspace …` předschválené nejsou, a `--nahled --apply` nástroj sám odmítne (kód 2), takže prefix `--nahled:*` nikdy nezapíše;
 * - shasum, doctor bez --receipt, kit-completion template a validate.
 * Záměrně tu NENÍ:
 * - cat: pravidlo `Bash(cat:*)` pustí i `cat x > y`, které soubor přepíše; obsah souboru čte nástroj Read;
 * - find: umí -delete a -exec, takže by pustil mazání i spouštění jiných příkazů;
 * - git status/log/diff: čtecí tvary hostitel schvaluje sám a pravidlo s hvězdičkou by pustilo i zapisující přepínače (git diff --output=…);
 * - doctor s --receipt (zapisuje soubor) a kit-completion export (zakládá složku): předschválené jsou jen tvary bez zápisu;
 * - aktivovat-pojistky a zpristupnit-skilly s --apply (zapisují; předschválený je jen náhled), kos (přesun do koše), brain-hledej (zapisuje cache
 *   indexu do složky stavu), backup, upgrade, ai-os, WebSearch, WebFetch a cokoli, co jde na síť.
 * Přesné tvary bez hvězdičky (doctor) hostitel porovnává doslova; tvar `:*` je pravidlo „začíná takto“ (u starších Claude Code
 * jediný zápis, u nových rovnocenný s „ *“). Složený příkaz (`;`, `&&`, `|`) se předschválí jen tehdy, když je každá část povolená.
 * Co pravidlo s hvězdičkou pustí, určuje hostitel podle začátku příkazu; checkpoint proto dál snapshotuje před každým shell příkazem
 * a deny-dangerous odmítá mazání.
 */
export const READ_ALLOW = Object.freeze(['Bash(ls:*)', 'Bash(grep:*)', 'Bash(head:*)', 'Bash(wc:*)']);
export const QUERY_ALLOW = Object.freeze([
  'Bash(git --version)',
  'Bash(git check-ignore:*)',
  'Bash(sw_vers:*)',
  'Bash(node tools/zpristupnit-skilly.mjs)',
  'Bash(node tools/zpristupnit-skilly.mjs --nahled:*)',
  'Bash(node tools/aktivovat-pojistky.mjs)',
]);
/** Co nese dodaný `.claude/settings.json` už před aktivací pojistek. */
export const SHIPPED_ALLOW = Object.freeze([...READ_ALLOW, ...QUERY_ALLOW]);
export const KIT_ALLOW = Object.freeze([
  ...SHIPPED_ALLOW,
  'Bash(shasum:*)',
  'Bash(node tools/doctor.mjs)',
  'Bash(node tools/doctor.mjs --preflight)',
  'Bash(node tools/kit-completion.mjs template:*)',
  'Bash(node tools/kit-completion.mjs validate:*)',
]);

export function isKitHook(hook) {
  return hook?.args?.[1] === BOOTSTRAP || hook?.args?.[1] === BOOTSTRAP_SOFT || (Array.isArray(hook?.args) && hook.args.some((arg) => typeof arg === 'string' && arg.includes('AICOS_KIT_ROOT')));
}

/**
 * Výběr pro `aktivovat-pojistky --jen`: jména akcí hooků kitu (deny-dangerous, checkpoint, guard-root-writes, skill-usage, self-review,
 * backup-on-stop, learnings-index, kontext-prace, zaznam-session, brain-pripomen) a `cteni` = jen čtecí pravidla KIT_ALLOW v `permissions.allow`.
 * Slouží k převzetí jediné novinky bez zapojení všeho ostatního; vlastní nastavení se nikdy nepřepisuje ručně.
 */
export const HOOK_ACTIONS = Object.freeze([...new Set(Object.values(kitHooks()).flatMap((entries) => entries.flatMap((entry) => entry.hooks.map((hook) => hook.args[3]))))]);
export const SELECTABLE = Object.freeze([...HOOK_ACTIONS, 'cteni']);
/** Seznam (pole nebo text oddělený čárkami) → Set platných jmen. Prázdný nebo neznámý výběr je chyba se srozumitelnou zprávou. */
export function parseSelection(only) {
  const list = (Array.isArray(only) ? only : String(only ?? '').split(',')).map((name) => String(name).trim()).filter(Boolean);
  if (!list.length) throw Object.assign(new Error('Empty hook selection'), { userMessage: `Výběr --jen je prázdný. Uveď jména oddělená čárkou: ${SELECTABLE.join(', ')}.` });
  const unknown = list.filter((name) => !SELECTABLE.includes(name));
  if (unknown.length) throw Object.assign(new Error('Unknown hook selection'), { userMessage: `Neznámý výběr --jen: ${unknown.join(', ')}. Platí: ${SELECTABLE.join(', ')}.` });
  return new Set(list);
}

/**
 * Keep unrelated settings and hooks; replace only our identifiable registrations.
 * Permissions: the user's own `permissions` (allow, deny, ask, anything else) stay untouched and in order; only the kit's
 * read-only rules from KIT_ALLOW are appended to `allow`, each once, so repeated activation adds nothing.
 * `only` (výběr z SELECTABLE, viz `parseSelection`) zapojí jen vybrané hooky: nahradí jen jejich registrace, ostatní hooky kitu i cizí
 * hooky nechá, jak jsou, a `permissions` nechá beze změny, dokud výběr neobsahuje `cteni`.
 */
export function activatedSettings(current, { only = null } = {}) {
  if (!current || typeof current !== 'object' || Array.isArray(current)) throw new Error('Invalid settings object');
  const wanted = only === null || only === undefined ? null : parseSelection(only);
  const hooks = {};
  for (const [event, entries] of Object.entries(current.hooks || {})) {
    if (!Array.isArray(entries)) throw new Error('Invalid hook configuration');
    hooks[event] = entries.map((entry) => ({ ...entry, hooks: (entry.hooks || []).filter((hook) => !(isKitHook(hook) && (wanted === null || wanted.has(hook.args?.[3])))) })).filter((entry) => entry.hooks.length);
  }
  for (const [event, entries] of Object.entries(kitHooks())) {
    const chosen = wanted === null ? entries : entries.map((entry) => ({ ...entry, hooks: entry.hooks.filter((hook) => wanted.has(hook.args[3])) })).filter((entry) => entry.hooks.length);
    if (chosen.length) hooks[event] = [...chosen, ...(hooks[event] || [])];
  }
  const permissions = current.permissions ?? {};
  if (!permissions || typeof permissions !== 'object' || Array.isArray(permissions) || (permissions.allow !== undefined && !Array.isArray(permissions.allow))) throw new Error('Invalid permissions configuration');
  if (wanted !== null && !wanted.has('cteni')) {
    return { ...current, $comment: `AI OS hooks activated selectively (${[...wanted].join(', ')}) after dependency and checkpoint verification. Host callback registration still requires verification in a new session. permissions were not changed.`, hooks };
  }
  const allow = [...(permissions.allow || [])];
  for (const rule of KIT_ALLOW) if (!allow.includes(rule)) allow.push(rule);
  const selective = wanted === null ? '' : ` Selection: ${[...wanted].join(', ')}.`;
  return { ...current, $comment: `AI OS hooks activated after dependency and checkpoint verification. Host callback registration still requires verification in a new session. permissions.allow gained only the read-only rules listed in hooks/config.mjs (KIT_ALLOW).${selective}`, permissions: { ...permissions, allow }, hooks };
}
