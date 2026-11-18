#!/usr/bin/env node
/** A checked handoff from the Kit guide. This tool never completes a step. */
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep, win32 } from 'node:path';
import { fileURLToPath } from 'node:url';

export const KIT_AREAS = ['profile','workspace','rules','skills','integrations','memory','safety','backup','automations'];
const REQUIRED = new Set(['profile','workspace','rules','memory','safety']);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const within = (root,path) => { const part=relative(root,path);return !part||(!isAbsolute(part)&&part!=='..'&&!part.startsWith('..'+sep)); };
const failure = detail => new Error('Nejdřív dokonči průvodce AI OS Kitem a ověř jeho .ai-os/kit-completion.json. '+detail);
// Where the receipt or export lies is not proof of an unfinished Kit: own prefix, passed through validate unchanged.
const privacyFailure = detail => Object.assign(new Error('Předání Kitu Dashboardu zastavila kontrola soukromí dokladu. '+detail),{code:'EAIOS_KIT_PRIVACY'});
const text = value => typeof value==='string' && value.trim().length>=4 && value.length<=4000;
const absoluteIdentity = value => typeof value==='string'&&(isAbsolute(value)||/^[A-Za-z]:[\\/]/.test(value)||/^\\\\[^\\]+\\[^\\]+/.test(value));

/*
 * Native Windows has no POSIX owner/group/other bits: Node/libuv reports 0666/0444 whatever chmod asked for,
 * so there privacy is the real ACL. Only the current user, SYSTEM and Administrators may hold access.
 * The ACL is read as SDDL (locale-independent SIDs); icacls prints localized account names, which would
 * reject Czech or German Windows. Fixed one-line script; the literal path travels through the environment.
 */
export const WINDOWS_ACL_SCRIPT = "$ErrorActionPreference = 'Stop'; $acl = Get-Acl -LiteralPath $env:AIOS_ACL_TARGET; $user = & (Join-Path $env:SystemRoot 'System32\\whoami.exe') /user /fo csv /nh; 'AIOS-SDDL ' + $acl.Sddl; 'AIOS-USER ' + ($user -join '')";
const SID = /^S-1-\d+(?:-\d+)+$/;
const ACL_ALIASES = { SY: 'S-1-5-18', BA: 'S-1-5-32-544', WD: 'S-1-1-0', BU: 'S-1-5-32-545', AU: 'S-1-5-11', IU: 'S-1-5-4', NU: 'S-1-5-2', AN: 'S-1-5-7', BG: 'S-1-5-32-546', CO: 'S-1-3-0', CG: 'S-1-3-1', OW: 'S-1-3-4', AC: 'S-1-15-2-1' };
const ACL_NAMES = { 'S-1-1-0': 'Everyone', 'S-1-5-32-545': 'Users', 'S-1-5-11': 'Authenticated Users', 'S-1-5-4': 'INTERACTIVE', 'S-1-5-2': 'NETWORK', 'S-1-5-7': 'ANONYMOUS LOGON', 'S-1-5-32-546': 'Guests', 'S-1-3-1': 'CREATOR GROUP', 'S-1-3-4': 'OWNER RIGHTS', 'S-1-15-2-1': 'ALL APPLICATION PACKAGES' };
const PRIVILEGED = ['S-1-5-18', 'S-1-5-32-544']; // SYSTEM, Administrators
/**
 * Pure verdict on Get-Acl SDDL. Deny ACEs never grant; inherit-only ACEs do not apply to a file itself.
 * inheritable: the nearest existing parent of a new export folder. Only ACEs that a new child folder and its
 * files inherit (OI or CI) count; ACEs effective on the parent alone and the parent's owner do not.
 */
export function windowsAclVerdict({ sddl, user } = {}, { container = false, inheritable = false } = {}) {
  const unreadable = { readable: false, private: false, ownerOk: false, foreign: [] };
  if (typeof sddl !== 'string' || typeof user !== 'string' || !SID.test(user)) return unreadable;
  const m = /^O:([A-Z]{2}|S-1-\d+(?:-\d+)+)(?:G:(?:[A-Z]{2}|S-1-\d+(?:-\d+)+))?D:([A-Z_]*)((?:\([^()]*\))*)(?:S:.*)?$/.exec(sddl.trim());
  if (!m) return unreadable; // conditional ACEs, resource attributes or anything unexpected: fail closed
  const sid = value => (ACL_ALIASES[value] || value).toUpperCase();
  const me = user.toUpperCase(), owners = new Set([me, ...PRIVILEGED]);
  // CREATOR OWNER on a new private export folder becomes the creating account on its files.
  const allowed = new Set([...owners, ...(container || inheritable ? ['S-1-3-0'] : [])]);
  const foreign = [];
  if (m[2].includes('NO_ACCESS_CONTROL')) foreign.push('NULL DACL (Everyone)');
  for (const [, body] of m[3].matchAll(/\(([^()]*)\)/g)) {
    const fields = body.split(';');
    if (fields.length !== 6) return unreadable;
    const [type, flags, , , , trustee] = fields;
    if (/^(?:D|OD|XD)$/.test(type)) continue;
    const pairs = flags.match(/../g) || [];
    if (inheritable ? !pairs.includes('OI') && !pairs.includes('CI') : !container && pairs.includes('IO')) continue;
    const who = sid(trustee);
    if (!allowed.has(who)) foreign.push(ACL_NAMES[who] || trustee);
  }
  const ownerOk = inheritable || owners.has(sid(m[1]));
  return { readable: true, private: ownerOk && !foreign.length, ownerOk, owner: m[1], foreign: [...new Set(foreign)] };
}
/** PowerShell 5.1 may prefix a BOM (UTF-8 console encoding) or emit UTF-16LE; both are decoded before parsing. */
function decodeAclOutput(stdout) {
  let text = typeof stdout === 'string' ? stdout : '';
  if (Buffer.isBuffer(stdout)) {
    const utf16 = (stdout[0] === 0xff && stdout[1] === 0xfe) || (stdout.length > 1 && stdout[0] !== 0 && stdout[1] === 0);
    text = stdout.toString(utf16 ? 'utf16le' : 'utf8');
  }
  return text.replace(/^\uFEFF/gm, '');
}
/** Reads the ACL through the fixed Windows PowerShell 5.1 script; never uses PATH lookup or source interpolation. */
export function readWindowsAcl(path, { run = spawnSync, env = process.env } = {}) {
  const root = env.SystemRoot || env.SYSTEMROOT || env.windir || env.WINDIR;
  if (typeof root !== 'string' || !/^[A-Za-z]:\\[^\x00-\x1f"]*$/.test(root)) throw new Error('SystemRoot is not available');
  const result = run(win32.join(root, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe'), ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', WINDOWS_ACL_SCRIPT],
    { env: { ...env, AIOS_ACL_TARGET: path }, timeout: 30000, windowsHide: true });
  if (!result || result.error || result.signal || result.status !== 0) throw new Error('ACL read did not finish');
  const output = decodeAclOutput(result.stdout);
  const sddl = /^AIOS-SDDL (\S+)\s*$/m.exec(output)?.[1], user = /^AIOS-USER .*"(S-1-\d+(?:-\d+)+)"\s*$/m.exec(output)?.[1];
  if (!sddl || !user) throw new Error('ACL output is not readable');
  return { sddl, user };
}
// icacls run from Git Bash gets /inheritance:r and /grant:r rewritten to paths by MSYS; (OI)(CI) makes the grant inherited by files and subfolders.
const ICACLS_SHELL = 've Windows PowerShellu nebo v cmd (ne v Git Bash, ten přepínače /inheritance:r a /grant:r přepíše na cesty)';
const ICACLS_SHELL_START = 'Ve' + ICACLS_SHELL.slice(2);
const icaclsPrivate = (folder, user) => `icacls "${folder}" /inheritance:r /grant:r "*${user}:(OI)(CI)F" "*S-1-5-18:(OI)(CI)F" "*S-1-5-32-544:(OI)(CI)F"`;
// FAT32/exFAT volumes carry no NTFS permissions and icacls fails there: only a folder in the profile on NTFS stays private.
const NO_ACL_DISK = 'Na disku bez oprávnění NTFS (FAT32 nebo exFAT, typicky USB disk nebo paměťová karta) icacls nefunguje a soukromí tam zajistit nejde; workspace i export patří do tvého profilu (%USERPROFILE%) na disku NTFS.';
const ACL_UNREADABLE = 'Na Windows se soukromí dokladu ověřuje přes ACL a to se nepodařilo přečíst (Windows PowerShell 5.1: Get-Acl a whoami). Kontrolu nevypínej ani neobcházej: spusť nástroj v běžném Windows účtu s dostupným Windows PowerShellem, nebo celý setup veď ve WSL2 na ext4 podle tools/windows/README.md. ' + NO_ACL_DISK;
// WSL: Windows drives under /mnt/<letter> (DrvFs) do not keep POSIX modes by default, so 0600 does not stick there.
const WSL_WINDOWS_DRIVE = /^\/mnt\/[a-z](?:\/|$)/i;
/** POSIX privacy failure of a receipt or bundle; on a WSL Windows drive it says where the workspace belongs instead. */
export function posixModeFailure(path) {
  return privacyFailure('Soukromý receipt musí mít práva 0600: číst a měnit ho smí jen vlastník.' + (WSL_WINDOWS_DRIVE.test(path || '')
    ? ' Soubor leží ve WSL na disku Windows (/mnt/…), kde se práva 0600 obvykle neudrží. Kontrolu nevypínej: pro agenta ve WSL měj workspace v domovské složce Linuxu (ext4), nebo agenta i workspace provozuj přímo ve Windows ve svém profilu na disku NTFS (soukromí se tam ověřuje přes ACL).'
    : ''));
}
/**
 * kind 'file': the private receipt or bundle; on NTFS the fix is the folder that holds it and the workspace stays where it is
 * (FAT32/exFAT has no permissions to fix, so there the workspace belongs in the profile on NTFS).
 * kind 'parent': the nearest existing parent of a new export, checked before anything is created.
 * kind 'container': the new export folder itself (defence in depth after mkdir; it stays empty).
 */
function assertWindowsPrivate(path, { readAcl = readWindowsAcl, kind = 'file' } = {}) {
  let acl = null;
  try { acl = readAcl(path); } catch { acl = null; }
  const verdict = windowsAclVerdict(acl || {}, { container: kind === 'container', inheritable: kind === 'parent' });
  if (!verdict.readable) throw privacyFailure(ACL_UNREADABLE + (kind === 'file' ? '' : ' Nic jsem do exportu nezkopíroval.'));
  if (verdict.private) return;
  const others = verdict.foreign.length ? 'přístup i pro ' + verdict.foreign.join(', ') : '';
  if (kind === 'file') {
    const found = [...(verdict.ownerOk ? [] : ['vlastník ' + verdict.owner]), ...(others ? [others] : [])].join('; ');
    throw privacyFailure(`Na Windows smí soukromý receipt číst jen tvůj účet, SYSTEM a Administrators; ACL ukazuje ${found}. Kontrolu nevypínej ani neobcházej.` +
      (verdict.ownerOk ? '' : ' Soubor vlastní jiný účet: doklad připrav znovu pod svým účtem Windows.') +
      (others ? ` Na disku NTFS workspace kvůli tomu nepřesouvej, stačí omezit složku dokladu. ${ICACLS_SHELL_START} spusť: ${icaclsPrivate(dirname(path), acl.user)} a ověř znovu. Hlásí-li kontrola potom cizí účet dál, má na souboru vlastní (neděděné) oprávnění; odeber ho tamtéž přes icacls /remove:g. ${NO_ACL_DISK}` : ''));
  }
  const fix = `Kontrolu nevypínej. Nejjednodušší je zvolit jako --output novou složku ve svém uživatelském profilu (například v %LOCALAPPDATA%) a export spustit znovu. Musí-li export ležet jinde na disku NTFS, založ si tam pro něj vlastní složku (ne kořen disku), ${ICACLS_SHELL} ji omez příkazem ${icaclsPrivate('<ta složka>', acl.user)} a jako --output zvol novou podsložku v ní. Na FAT32 nebo exFAT (USB disk, paměťová karta) soukromý export být nemůže.`;
  if (kind === 'parent') throw privacyFailure(`Na Windows smí soukromý export číst jen tvůj účet, SYSTEM a Administrators. Nová složka by ze složky ${path} zdědila ${others}; nic jsem nevytvořil ani nezkopíroval. ${fix}`);
  throw privacyFailure(`Na Windows smí soukromý export číst jen tvůj účet, SYSTEM a Administrators; nová složka ${path} ukazuje ${others || 'vlastníka ' + verdict.owner}. Nic jsem do ní nezkopíroval; nech ji být (export vyžaduje novou složku). ${fix}`);
}
/** Nearest existing ancestor: a new export folder inherits its ACL, so it is checked before mkdir creates anything. */
function assertWindowsExportParent(output, options) {
  let parent = dirname(output);
  while (!existsSync(parent) && dirname(parent) !== parent) parent = dirname(parent);
  assertWindowsPrivate(parent, { readAcl: options.readAcl, kind: 'parent' });
}
function fileBytes(path,{privateFile=false,platform=process.platform,readAcl}={}) {
  const stat=lstatSync(path);
  if(!stat.isFile()||stat.isSymbolicLink()||stat.nlink!==1||realpathSync(path)!==resolve(path)||stat.size>1024*1024||(process.getuid&&stat.uid!==process.getuid()))throw failure('Důkaz/receipt musí být vlastní běžný soubor bez symlinků a hardlinků, nejvýše 1 MiB.');
  if(privateFile){
    if(platform==='win32')assertWindowsPrivate(path,{readAcl,kind:'file'});
    else if((stat.mode&0o777)!==0o600)throw posixModeFailure(path);
  }
  return readFileSync(path);
}
function evidencePath(root,path) {
  if(typeof path!=='string'||isAbsolute(path)||path.split(/[\\/]/).some(p=>!p||p==='.'||p==='..'||/^(?:\.git|\.secrets|\.ssh|\.hermes|\.claude|\.codex)$/i.test(p))||/[\\\x00-\x1f]/.test(path)||/(?:^|\/)(?:\.env(?:\..*)?|.*(?:credentials|private[-_]?key|auth[-_]?token).*|.*\.(?:pem|key|p12|pfx))$/i.test(path))throw failure('Evidence nesmí obsahovat credentials, privátní klíče ani cestu mimo schválený workspace.');
  const result=resolve(root,path);if(!within(root,result))throw failure('Důkaz je mimo workspace.');return result;
}
function assertNoSecrets(bytes) {
  const content=bytes.toString('utf8');
  if(content.includes('\0')||/-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----|\b(?:sk-ant-|sk-proj-|ghp_|github_pat_|xox[baprs]-)[A-Za-z0-9_-]{12,}|\b(?:api[_ -]?key|access[_ -]?token|refresh[_ -]?token|password|secret)\s*[=:]\s*["']?[A-Za-z0-9_\-/+=]{16,}/i.test(content))throw failure('Důkaz obsahuje přihlašovací tajemství nebo binární obsah; vytvoř stručný protokol bez klíčů.');
  const assignments=[...content.matchAll(/\b(?:api[_ -]?key|access[_ -]?token|refresh[_ -]?token|password|heslo|secret)["']?\s*[=:]\s*["']?([^\s"',;]{3,})/gi)];
  if(assignments.some(([,value])=>!/^\[?redacted\]?|^<[^>]+>$|^(?:configured|verified|not-set|none|null|false|true)$/i.test(value))||/https?:\/\/[^\s/:]+:[^\s/@]+@/i.test(content))throw failure('Důkaz nesmí přenášet hesla nebo tokeny; ulož pouze výsledek kontroly.');
}
export function pendingCompletion(workspace) {
  if(!isAbsolute(workspace||''))throw failure('Zadej absolutní --workspace.');
  return {schemaVersion:1,kind:'ai-os-kit-completion',workspace:existsSync(workspace)?realpathSync(workspace):resolve(workspace),status:'pending',completedAt:null,areas:KIT_AREAS.map(id=>({id,decision:'now',status:'pending',evidence:[],...(id==='safety'?{host:null}:{})}))};
}
/** options: {platform, readAcl} only for platform tests; callers omit them. */
export function validateKitCompletion(input,{platform=process.platform,readAcl}={}) {
  try {
    if(!input||!isAbsolute(input))throw failure('Chybí --kit-completion <absolutní receipt nebo exportovaná složka>.');
    if(lstatSync(input).isSymbolicLink())throw failure('Receipt ani export nesmí být symlink.');
    const source=realpathSync(input),directory=lstatSync(source).isDirectory();
    const receiptFile=directory?join(source,'kit-completion.json'):source;
    const bytes=fileBytes(receiptFile,{privateFile:true,platform,readAcl}),receipt=JSON.parse(bytes);
    if(receipt.schemaVersion!==1||receipt.kind!=='ai-os-kit-completion'||receipt.status!=='complete'||!absoluteIdentity(receipt.workspace)||/[\x00-\x1f]/.test(receipt.workspace)||!Number.isFinite(Date.parse(receipt.completedAt))||Date.parse(receipt.completedAt)>Date.now()+60000)throw failure('Receipt není dokončený platný protokol.');
    let evidenceRoot=directory?null:realpathSync(receipt.workspace);
    if(directory){
      const bundle=JSON.parse(fileBytes(join(source,'bundle.json'),{privateFile:true,platform,readAcl}));
      if(bundle.schemaVersion!==1||bundle.kind!=='ai-os-kit-evidence-bundle'||bundle.receiptSha256!==hash(bytes)||bundle.originalWorkspace!==receipt.workspace||bundle.evidenceRoot!=='evidence')throw failure('Přenesený protokol neodpovídá původnímu workspace.');
      evidenceRoot=join(source,'evidence');
    }else if(source!==join(evidenceRoot,'.ai-os','kit-completion.json'))throw failure('Lokální receipt musí ležet v <workspace>/.ai-os/kit-completion.json. Pro přenos použij export.');
    if(!Array.isArray(receipt.areas)||receipt.areas.length!==KIT_AREAS.length||new Set(receipt.areas.map(a=>a.id)).size!==KIT_AREAS.length)throw failure('Protokol musí projít všech 9 oblastí.');
    const files=new Map();let total=0;
    for(const area of receipt.areas){
      if(!KIT_AREAS.includes(area.id))throw failure('Neznámá oblast průvodce.');
      if(area.status==='verified'){
        if(area.decision!=='now'||!Array.isArray(area.evidence)||!area.evidence.length||area.evidence.length>10||(area.id==='safety'&&!text(area.host)))throw failure('Ověřená oblast potřebuje rozhodnutí now a konkrétní důkazy; safety také host.');
        for(const evidence of area.evidence){
          if(!/^[a-f0-9]{64}$/.test(evidence.sha256||''))throw failure('Chybí SHA-256 důkazu.');
          const path=evidencePath(evidenceRoot,evidence.path),proof=fileBytes(path);assertNoSecrets(proof);
          if(hash(proof)!==evidence.sha256)throw failure('Důkaz se změnil: '+evidence.path);
          if(!files.has(evidence.path)){files.set(evidence.path,proof);total+=proof.length;}
        }
      }else if(REQUIRED.has(area.id))throw failure('Povinný základ '+area.id+' musí být skutečně ověřen.');
      else if(area.status==='deferred'&&area.decision==='later'&&text(area.reason)&&text(area.nextStep)){}
      else if(area.status==='not-selected'&&area.decision==='not-needed'&&text(area.reason)){}
      else throw failure('Volba později potřebuje další krok; nepotřebuji potřebuje důvod.');
    }
    if(files.size>50||total>10*1024*1024)throw failure('Přenášej pouze minimální protokol, nejvýše 50 souborů / 10 MiB.');
    return {receipt,receiptBytes:bytes,receiptSha256:hash(bytes),source,evidenceRoot,files};
  }catch(error){if(error.message?.startsWith('Nejdřív dokonči')||error.code==='EAIOS_KIT_PRIVACY')throw error;throw failure('Receipt nebo jeho důkazy nejsou dostupné či platné.');}
}
function privateDirectory(path) {
  for(let at=resolve(path);at!==dirname(at);at=dirname(at))if(existsSync(at)&&lstatSync(at).isSymbolicLink())throw failure('Soukromý export nesmí procházet odkazem.');
  if(existsSync(path)&&(lstatSync(path).isSymbolicLink()||!lstatSync(path).isDirectory()||realpathSync(path)!==resolve(path)))throw failure('Soukromý export nesmí procházet odkazem.');
  mkdirSync(path,{recursive:true,mode:0o700});chmodSync(path,0o700);
}
export function exportKitCompletion(input,output,options={}) {
  const verified=validateKitCompletion(input,options);
  if(!isAbsolute(output||'')||existsSync(output))throw failure('Export vyžaduje novou absolutní soukromou cílovou složku.');
  const windows=(options.platform??process.platform)==='win32';
  // Windows: the new folder inherits its ACL from the nearest existing parent. Refuse before mkdir, so a
  // shared location leaves nothing behind and the same --output stays usable after the parent is fixed.
  if(windows)assertWindowsExportParent(resolve(output),options);
  privateDirectory(resolve(output));
  // Defence in depth: the created folder itself is checked before any evidence is copied into it.
  if(windows)assertWindowsPrivate(resolve(output),{readAcl:options.readAcl,kind:'container'});
  const write=(path,bytes)=>{privateDirectory(dirname(path));writeFileSync(path,bytes,{flag:'wx',mode:0o600});};
  for(const [path,bytes] of verified.files)write(join(output,'evidence',path),bytes);
  write(join(output,'kit-completion.json'),verified.receiptBytes);
  write(join(output,'bundle.json'),JSON.stringify({schemaVersion:1,kind:'ai-os-kit-evidence-bundle',originalWorkspace:verified.receipt.workspace,receiptSha256:verified.receiptSha256,evidenceRoot:'evidence'},null,2)+'\n');
  validateKitCompletion(output,options);
  return {ok:true,output,originalWorkspace:verified.receipt.workspace,files:verified.files.size,receiptSha256:verified.receiptSha256};
}
export function installKitCompletion(input,data,options={}) {
  const verified=validateKitCompletion(input,options),path=join(data,'kit-completion',verified.receiptSha256);
  if(existsSync(path)){if(validateKitCompletion(path,options).receiptSha256!==verified.receiptSha256)throw failure('Uložené předání se změnilo.');}
  else exportKitCompletion(input,path,options);
  return {schemaVersion:1,path,receiptSha256:verified.receiptSha256,originalWorkspace:verified.receipt.workspace};
}
export function assertInstalledKitCompletion(record,data,options={}) {
  if(!record||record.path!==join(data,'kit-completion',record.receiptSha256)||!/^[a-f0-9]{64}$/.test(record.receiptSha256||''))throw failure('Dashboard nemá ověřené předání z Kitu. Spusť setup s --kit-completion.');
  const verified=validateKitCompletion(record.path,options);
  if(verified.receiptSha256!==record.receiptSha256||verified.receipt.workspace!==record.originalWorkspace)throw failure('Uložené předání se změnilo.');
  return verified;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const [action,...args]=process.argv.slice(2),options={};
    while(args.length){const option=args.shift();if(!['--workspace','--input','--output'].includes(option)||!args.length)throw failure('Použij template/validate/export a --workspace, --input, --output.');options[option]=args.shift();}
    const input=options['--input']||(options['--workspace']?join(resolve(options['--workspace']),'.ai-os/kit-completion.json'):null);
    if(action==='template')console.log(JSON.stringify(pendingCompletion(options['--workspace']),null,2));
    else if(action==='validate'){const result=validateKitCompletion(input);console.log(JSON.stringify({ok:true,workspace:result.receipt.workspace,receiptSha256:result.receiptSha256,areas:result.receipt.areas.map(({id,status})=>({id,status}))},null,2));}
    else if(action==='export')console.log(JSON.stringify(exportKitCompletion(input,options['--output']),null,2));
    else throw failure('Použij template/validate/export.');
  }catch(error){console.error(error.message);process.exitCode=1;}
}
