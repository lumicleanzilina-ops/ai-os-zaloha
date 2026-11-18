import fs from 'node:fs';
import { projectRoot, deny, logFailure } from './runtime.mjs';
import { dangerous } from './deny-dangerous.mjs';
import { rootWrites, checkpoint, skillUsage, learningsIndex, selfReview, backup } from './actions.mjs';

const action = process.argv[2];
const critical = ['deny-dangerous', 'checkpoint', 'guard-root-writes'].includes(action);
try {
  const root = projectRoot();
  const payload = JSON.parse(fs.readFileSync(0, 'utf8'));
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Invalid hook payload');
  if (process.env.AICOS_HOOK_REGISTRATION_PROBE === '1') {
    // Real-client registration probe is deliberately blocking for PreToolUse. No payload
    // command, checkpoint, backup or personal/global hook is executed in this mode.
    const output = critical ? deny('Registration probe only: this tool call was not executed.') : {};
    output.systemMessage = 'AIOS_HOOK_REACHED ' + action + ' ' + root;
    process.stdout.write(JSON.stringify(output) + '\n');
    process.exit(0);
  }
  let output;
  switch (action) {
    case 'probe': output = { marker: 'AIOS_HOOK_REACHED', root, node: process.version, action }; break;
    case 'deny-dangerous': output = dangerous(payload); break;
    case 'guard-root-writes': output = rootWrites(payload, { root }); break;
    case 'checkpoint': checkpoint(payload, { root }); break;
    case 'skill-usage': skillUsage(payload, { root }); break;
    // Vyřazeno ve V.04.2 (jediná ústava je AGENTS.md). Starší settings.json ji ještě volají: nic nedělej, nehlas chybu.
    case 'sync-agents-md': break;
    case 'learnings-index': output = learningsIndex(payload, { root }); break;
    // Dynamický import: chybějící nebo rozbitý soubor přehledu práce nesmí shodit kritické hooky (deny-dangerous, checkpoint).
    case 'kontext-prace': output = (await import('./kontext-prace.mjs')).kontextPrace(payload, { root }); break;
    // Záznam session: stejné dynamické načtení; chyba (i při načtení modulu) jde jen do logu ve složce stavu, ne na stdout ani do kódu.
    case 'zaznam-session': {
      try { output = (await import('./zaznam-session.mjs')).zaznamSession(payload, { root }); }
      catch (error) { logFailure(root, 'zaznam-session: načtení modulu', error); }
      break;
    }
    // Připomínač paměti (UserPromptSubmit): stejné dynamické načtení; nikdy neblokuje zprávu uživatele. Chyba jde jen do logu ve složce stavu.
    case 'brain-pripomen': {
      try { output = (await import('./brain-pripomen.mjs')).brainPripomen(payload, { root }); }
      catch (error) { logFailure(root, 'brain-pripomen: načtení modulu', error); }
      break;
    }
    case 'self-review': output = selfReview(payload, { root }); break;
    case 'backup-on-stop': backup(payload, { root }); break;
    default: throw new Error('Unknown hook action');
  }
  if (output) process.stdout.write(JSON.stringify(output) + '\n');
} catch (error) {
  // Never echo payload, command, file contents or environment values in error output.
  if (action === 'zaznam-session' || action === 'brain-pripomen') {
    process.exitCode = 0; // záznam session a připomínač paměti nikdy neblokují ani nehlásí chybu hostiteli (rozbitý vstup, chybějící kořen kitu); u UserPromptSubmit by kód 2 zahodil zprávu uživatele
  } else if (critical) {
    // userMessage nese jen bezpečný text (názvy souborů, nikdy hodnoty) a říká zákazníkovi, co udělat.
    const message = typeof error?.userMessage === 'string' ? error.userMessage : 'AI OS critical hook failed; protection NOT VERIFIED. Run doctor and resolve the failure before continuing.';
    process.stdout.write(JSON.stringify(deny(message)) + '\n');
    process.exitCode = 2;
  } else {
    process.stderr.write('AI OS hook failed; result NOT VERIFIED. Run doctor.\n');
    process.exitCode = 1;
  }
}
