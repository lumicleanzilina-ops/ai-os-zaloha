# TECHNICKÉ NASTAVENÍ CELÉHO AI OS KITU

Začni vždy v [START.md](../START.md). Ten určí, zda navazuješ na existující workspace, pokračuješ v rozdělaném nastavení, nebo zakládáš vlastní systém. Tento dokument je technický podklad pro instalačního agenta; zákazník nemusí otevírat terminál ani ručně přepisovat konfiguraci. Agent provádí kroky dostupnými nástroji, krátce vysvětluje jejich účel a ukazuje ověřený výsledek.

Tento podklad patří průvodci 1. Podle [ONBOARDING](../ONBOARDING.md) projdi CELÝ skutečný katalog: [CAPABILITIES](CAPABILITIES.md), [dovednosti](../skills/README.md), aktuální návody v `../modules/`, [plánované úlohy](../scheduled-tasks/README.md) a [BLUEPRINTS](../scheduled-tasks/BLUEPRINTS.md). Aktivně pomoz nastavit co nejvíc užitečného podle uživatele a sám nic nevypouštěj. U možností zaznamenej jeho volbu „Nastavit teď“ / „Později“ / „Nepotřebuji“ podle [STAV-INSTALACE.md](STAV-INSTALACE.md). „Později“ je výslovné ODLOŽENO s důvodem a dalším krokem v jediném protokolu: neblokuje KIT COMPLETE, ale není OVĚŘENO. „Nepotřebuji“ je NEZVOLENO. Neznámá volba, nedokončené „Nastavit teď“ nebo nefunkční základ drží KIT PENDING. KIT funguje bez Dashboardu, Hermese, VPS i Dockeru. Volbu nadstavby lze uložit předem, její instalace začne až po ověření KIT COMPLETE průvodcem 2.

## 1. ČISTÝ KIT A VLASTNÍ WORKSPACE

### PŘED PRVNÍ INSTALACÍ

1. Zjisti operační systém a dostupné `node --version`, `git --version`. Tato kontrola nesmí aktivovat hooky.
2. Pokud Node chybí nebo nemá major 24: otevři oficiální [Node 24 download](https://nodejs.org/en/download), vyber systém uživatele a ověř původ instalátoru. Agent připraví cestu; systémové heslo zadává zákazník sám. Pokud instalace vyžaduje nový PATH, znovu otevři agenta a ověř verzi z jeho skutečného shellu.
3. Git pro Windows připrav z [Git for Windows](https://gitforwindows.org/). Na Macu ověř Git a případný systémový dialog Command Line Tools; když chybí, agent může spustit `xcode-select --install` a uživatel dokončí oficiální dialog. Na Linuxu použij oficiální správce balíků dané distribuce. Nehádej tlačítka, opři se o aktuální dokumentaci nebo obrazovku.
4. Dokud nástroje nefungují, neaktivuj checkpointy a netvrď, že ochrany běží. Vysvětli jeden další krok. Přehled novinek pro V.03 může pokračovat pouhým čtením bez instalace.
5. Pro nový workspace doporuč jednu složku `AI-OS` přímo v domovské složce uživatele: Mac `~/AI-OS`, Windows `C:\Users\<jméno>\AI-OS` (tedy `%USERPROFILE%\AI-OS`). Ne v Ploše ani v Dokumentech: ty se mohou synchronizovat do iCloudu či OneDrive a první snapshot musí soubory skutečně přečíst (cloudové placeholdery nejsou místní záloha). Zálohu workspace neřeš synchronizací složky (iCloud, OneDrive, Dropbox), ale kitem: Git a soukromé GitHub repo podle [modulu zálohy](../modules/github-backup/README.md). Na Windows leží složka na disku NTFS, ne přímo pod `C:\` ani na USB disku s FAT32/exFAT; pracuje-li agent ve WSL, drž workspace v domovské složce Linuxu (`~/AI-OS`), ne na `/mnt/c`. Jinde může předání Dashboardu zastavit kontrola soukromí dokladu Kitu. Existující workspace nepřesouvej.

Nový zákazník nemusí mít V.03 ani umět programovat. Pro spuštění agenta použije [ZACNI-TADY](../ZACNI-TADY.md); zde přebíráš technickou práci. Ověř skutečný host, operační systém, přístup ke zvolené místní složce a možnost číst soubory i spouštět potřebné nástroje. Zjisti dostupný Node a Git dřív, než spustíš doctor nebo slíbíš funkční pojistky. Potřebné závislosti připrav podle aktuální oficiální dokumentace pro daný systém v povoleném rozsahu; pokud nemáš oprávnění, vysvětli jediný potřebný ruční krok. Uživatel nepotřebuje předem server, GitHub ani účty ke všem integracím. Jejich potřebu a náklady vysvětli až u zvolené funkce.

Chybějící startovací marker sám neříká, že uživatel otevřel podsložku. Zkontroluj cestu, závislosti, konfiguraci i skutečný host callback. Nedostupné ochrany jasně označ a oprav ověřenou příčinu; nepřikazuj opakovaně stejné otevření složky. Chybějící oprávnění nebo přihlášení nepovažuj za hotovou instalaci.

Nový kit rozbal vedle dosavadní práce, nikdy přes ni. Uchovej verzi, SHA-256 balíku a release-manifest.json. U existujícího systému nejdřív dokonči upgrade vybraný STARTem; nespouštěj založení nové kopie a nepřepisuj vlastní profil, pravidla, projekty, integrace ani vault továrními soubory.

Jen pro nový workspace agent připraví pracovní kopii základu do zvoleného dosud neexistujícího cíle, doporučeně `AI-OS` podle bodu 5 výše. Zachová potřebné instrukce, skills, hooks, nástroje a dokumentaci kitu, nepřenese vývojovou .git historii ani cizí přihlášení. Dashboard je druhý samostatný ZIP a do osobní pracovní kopie kitu se nekopíruje. Existující cílovou složku nepřekryje. Předá přesnou cestu a jednu větu pro pokračování v kořeni vlastní kopie; dosavadní volby zapíše do jednoho soukromého protokolu podle STARTu. Čistý distribuční kit ponechá beze změny.

Git nemusíš ovládat: agent jej připraví a nakonfiguruje podle zvolených pojistek a zálohy. Původní nastavení git hooků nejdřív přečte a zachová jeho účel. Lokální checkpoint potřebuje fungující Git a nepokrývá ignorované soubory; tovární kit nezálohuje pozdější uživatelská data.

## 2. PROFIL A PRVNÍ ÚKOL

Podle [ONBOARDING](../ONBOARDING.md) agent nejdřív použije známý profil a zadání. Doplní všechny potřebné oblasti celého průvodce: člověka a cíle, styl, hranice a inventář systémů. Známé údaje znovu nezjišťuje; první skutečný úkol je mezikrok, po kterém dokončí ostatní oblasti. Osobní soubory i výsledek skutečně ulož a znovu načti; ověř konkrétní pravidlo a dohledání uložené práce. Čerstvé načtení patří na začátek doporučené druhé session před Dashboardem podle [PREDANI-DASHBOARDU](PREDANI-DASHBOARDU.md). Připojení Dashboardu nezakládá druhý profilový dotazník ani třetí povinnou session.

Pravidla mají jediný zdroj `AGENTS.md`; `CLAUDE.md` je pouze import `@AGENTS.md` pro Claude Code. Pro nové nastavení použij aktuální host. Automatické načítání samotného AGENTS bez wrapperu je v Claude Code všeobecně dostupné od 2.1.281; wrapper zachovává kompatibilní cestu. Existující osobní CLAUDE.md nikdy nepřepiš: nejdřív záloha a sloučení. Po nastavení agent cituje konkrétní vlastní pravidlo; ostatní hosty ověř samostatně.

## 3. INTEGRACE A TAJEMSTVÍ

Prober uživatelovy nástroje podle [MCP modulu](../modules/mcp-integrations/README.md), použij již známé volby a postupně dokonči všechny integrace zvolené „Nastavit teď“. Agent ověří konektor, účet a konkrétní čtení ze správného runtime. Uživatel dokončí důvěrné OAuth přihlášení nebo uloží klíč do chráněného úložiště; nikdy do chatu, gitu či běžné poznámky. „Nepotřebuji“ zaznamenej jako NEZVOLENO. Chybějící přihlášení samo není odklad: ODLOŽENO použij pouze po uživatelově výslovném „Později“, s důvodem a dalším krokem.

Klíčenka, environment a chráněný `.env` jsou různé způsoby uložení. Použij ten, který konkrétní proces skutečně umí načíst. Klíč v Keychainu ani `${VAR}` v JSONu neprokazuje předání procesu. Ověř loader bezpečným read-only dotazem ze stejného runtime; ukaž účet a výsledek, nikdy hodnotu klíče. `.env` drž mimo verzované soubory, omez oprávnění a ověř gitignore celé rodiny názvů.

Každý počítač a server mají vlastní modelové OAuth přihlášení. Nekopíruj `auth.json`, `.credentials.json` ani refresh token. Přihlas každý stroj zvlášť a proveď malý skutečný dotaz.

## 4. HOOKY A WORKSPACE DOCTOR

Po ověření Node 24 a Gitu spustí agent z kořene workspace `node tools/aktivovat-pojistky.mjs` (náhled bez přepínačů, který nic nezapisuje a je předschválený; mimo kořen přidá `--workspace "<WORKSPACE>"`). Chceš-li zapojit jen vybrané hooky (třeba po převzetí jediné novinky ze starší verze), přidá `--jen <jména oddělená čárkou>`; podrobnosti jsou v [hooks/README](../hooks/README.md#aktivace-po-závislostech). Dovednosti zpřístupní hostu zvlášť (`node tools/zpristupnit-skilly.mjs --workspace "<WORKSPACE>"`, po kontrole plánu s `--apply`): založí `.claude/skills/<jméno>`, tedy symlink na macOS a Linuxu a kopii se značkou na Windows. Nic nepřepíše ani nesmaže a `checkpoint` vynechá; aktivace pojistek `.claude/skills` nemění. Po kontrole plánu použije `--apply`; nástroj uchová původní nastavení. Přidá i několik čtecích příkazů a dotazů do `permissions.allow`, aby je uživatel nemusel potvrzovat klikem (seznam a důvody v [hooks/README](../hooks/README.md)): vedle `ls`, `grep`, `head` a `wc` třeba `git --version`, `git check-ignore`, `sw_vers` a náhledy `node tools/zpristupnit-skilly.mjs` a `node tools/aktivovat-pojistky.mjs` bez `--apply`; vlastní pravidla zůstanou. Kit je může předschválit, jen když uživatel složce důvěřuje: až se Claude Code při otevření workspace zeptá, zda složce důvěřuješ, potvrď to, jinak se bude ptát častěji. Ověř zachování cizích hooků a skutečný nový callback v hostu. `node tools/doctor.mjs --preflight --workspace "<WORKSPACE>"` je kontrola připravenosti, ne důkaz zapojených událostí.

Když aktivovaný checkpoint narazí na chybějící Git, oprav příčinu. Neobcházej ochranu plošným vypnutím při jakékoli chybě. Pro přesuny do koše použij `node tools/kos.mjs --path "<soubor>"` nejprve jako náhled a po autorizaci s `--apply`.

Claude Code otevírej vždy v **kořeni workspace** (ve složce, kde leží `AGENTS.md` a `.claude/`). Když otevřeš podsložku, pravidla se načtou, ale pojistky (hooky) Claude Code nespustí. Pojistky v podsložce nejdou zapnout jinak než registrací v uživatelském nastavení s absolutními cestami (viz [hooks/README](../hooks/README.md)).

Nástroje základu kitu používají Node 24. Dodaná konfigurace je neaktivní, aktivaci proveď až po přípravě závislostí níže. Git je potřeba pro checkpoint, secret guard a git zálohu. Event hooky jsou Node; POSIX git wrapper potřebuje shell (na Windows Git for Windows). Soubory v `hooks/` a settings nejsou důkaz aktivní ochrany.

Agent spustí:

```sh
node tools/doctor.mjs --workspace /absolutni/muj-workspace \
  --receipt /absolutni/mimo-workspace/doctor-receipt.json
```

Výsledek (receipt `aicos-doctor/v1`) obsahuje platformu, Node, hash configu a `checks[]`. `status: self-checks-passed` znamená, že prošly lokální kontroly. `hostRegistration` je vždy `not-verified`: doctor nedokáže vyvolat událost v appce, takže skutečný běh pojistek se ověřuje zvlášť (další odstavec). Nezaměňuj tyto stavy.

Skutečný běh pojistek ověř v používané appce: ve workspace vytvoř nástrojem Write soubor `<absolutní-workspace>/scratch/hook-test.txt` (složka `scratch/` uvnitř workspace, ne „scratchpad“ appky), nástrojem Edit ho změň a hned nástrojem Read načti checkpoint receipt v soukromé složce stavu hooků (cestu určí aktivátor/doctor). Z něj si ulož konkrétní `commit`. Teprve poté příkazem `git --git-dir "<checkpointLocation z receiptu>" show "<uložený-commit>:scratch/hook-test.txt"` ověř původní obsah PŘED Edit. Nepoužívej `log -1`: kontrolní Bash sám vytvoří nový checkpoint a posune poslední commit. Shoda starého obsahu a nová callback evidence pro použitou session potvrzují běh pojistky. Vyžaduje-li host opětovné otevření pro načtení nové konfigurace, proveď potřebný technický restart; samotné čtení souboru není důkaz callbacku. Nezaváděj kvůli předání další povinnou testovací session. Testovací soubor pak se souhlasem přesuň do koše. Rozhodnutí o mazání netestuj skutečným mazáním (to dělá doctor neškodnými vstupy). Secret guard ověř v bezpečné fixture bez reálného klíče. V jiném agentovi než Claude Code hooky neběží: označ je jako neověřené a dodržuj pravidla z `AGENTS.md`; netvrď strojové vynucení.

Agent nejdřív zjistí efektivní `core.hooksPath` včetně původu konfigurace a přečte stávající hooky; i bez nastavené hodnoty může existovat vlastní `.git/hooks/pre-commit`. Před změnou uloží jejich obnovitelnou kopii. Jen pokud dosud nejsou vlastní hooky, může nastavit `git config core.hooksPath hooks/git-hooks`. Existující vlastní cestu ani pre-commit nepřepíše: zachová původní chování a přidá kitový secret guard do stejného řetězce, bez rekurze, s předáním původních argumentů a respektováním nenulového návratového kódu každé kontroly. Ověří jak dosavadní kontrolu, tak nový guard bezpečnými fixtures; samotný výpis konfigurace není acceptance test. Záloha `backup-on-stop` je u nové instalace vypnutá; zapíná ji `AICOS_BACKUP=on`. Cílové složky nastav přes `AICOS_BACKUP_DIRS_JSON` (JSON pole absolutních cest); seznam `AICOS_BACKUP_DIRS` z V.03 (oddělovač `:`, na Windows `;`) dál funguje. Workspace z V.03, který ještě volá starý `backup-on-stop.sh`, zálohuje dál jako dřív.

Po aktivaci vkládá SessionStart hook `kontext-prace` na začátek každé session krátký přehled práce (nejvýš 4 kB): poslední sessions za 48 h z lokálních přepisů Claude Code a Codexu, top 5 bodů z `docs/otevrene-body.md` podle termínu a rozdělanou práci v git repech. Čte jen místní soubory, nic neposílá a nepotřebuje server ani placenou službu; vypíná ho `AICOS_KONTEXT=off`. Když přehled sessions už vkládá Dashboard, sekci sessions vynechá. Podrobnosti jsou v [hooks/README](../hooks/README.md).

Hook `zaznam-session` zakládá záznam každé session sám do `<RRRR-MM-DD>-auto-<id8>.md` (`stav: automaticky-zaznam`; zadání, soubory, commity) bez modelu a bez sítě. Má-li uživatel druhý mozek (proměnná `SECOND_BRAIN_VAULT` s absolutní cestou k vaultu v `env` v `.claude/settings.json`; aktivace pojistek ostatní klíče zachová), píše rovnou do `session-logs/` vaultu, jinak do `docs/session-logs/`, vždy jen na jedno místo a bez kopie: SessionStart řekne cestu, Stop zapisuje nejvýš jednou za `AICOS_ZAZNAM_MINUT` minut (výchozí 5), SessionEnd vždy. Záznam doplní `/end-session` nebo uzavření dne a přepne `stav` na `zapsano`; soubor se `zapsano` ani cizí úpravu hook nepřepíše. Vypíná ho `AICOS_ZAZNAM=off`; když sessions ukládá Dashboard, hook nezapisuje nic. V Codexu kit hook nezapojuje, záznam tam dělá `/end-session`. Podrobnosti jsou v [hooks/README](../hooks/README.md).

Hook `brain-pripomen` (UserPromptSubmit) přidá ke zprávě nejvýš 3 odkazy do paměti (wiki vaultu, learningy, záznamy sessions), když uživatel mluví o minulosti („minule“, „jak jsme řešili“, „co víme o“) nebo jmenuje stránku wiki; jinak mlčí. Hledá lokálně přes `tools/brain-hledej.mjs`, nic neposílá a nikdy neblokuje zprávu; vypíná ho `AICOS_BRAIN=off`. Hlubší hledání na povel je dovednost `brain`. Během instalace kitu (protokol bez `KIT: COMPLETE`) mlčí a stejně mlčí, když nic jistého nenajde. Po aktualizaci ze starší verze spusť aktivaci pojistek znovu, ať se hook zapojí. Podrobnosti jsou v [hooks/README](../hooks/README.md).

Hook `learnings-index` vkládá `docs/learnings/INDEX.md` celý, dokud výstup hooku s ním nepřesáhne 5 kB; větší rejstřík nahradí rozcestník „spouštěč → soubor“ po sekcích (přednost 🔴, ⚠️, nejnovější) a věta, že případ, který chybí, se hledá grepem v `docs/learnings/INDEX.md`. Profil z `docs/profil/` se kvůli rozcestníku nikdy nezkracuje: hlavička s rozcestníkem dostane, co po profilu z 5 kB zbývá, nejméně však 1 500 B, takže výstup s velkým profilem může 5 kB přesáhnout.

## 5. DRUHÝ MOZEK A ZÁLOHA

[Second Brain](../modules/second-brain/README.md) může být prostá Markdown wiki. Tolaria je volitelné rozhraní; není podmínkou ingestu, citací ani zálohy souborů. Lze zvolit Obsidian nebo existující Notion integraci.

Paměť ověř vložením testovací poznámky a jejím dohledáním s citací. Volbu zálohy prober zvlášť. Pokud uživatel zvolí „Nastavit teď“ pro [GitHub backup](../modules/github-backup/README.md), dokonči a ověř pro workspace a externí vault zvlášť správné privátní repo, push a obnovu čtením z čisté druhé kopie. Ignorovaná data a credentials git nezálohuje. Lokální checkpoint nepřežije ztrátu počítače.

## 6. AUTOMATIZACE PODLE SKUTEČNÉHO DNE

`scheduled-tasks/` jsou recepty pro dostupný scheduler. Agent podle tvého skutečného dne navrhne obsah a čas; ty zvolíš, zda chceš automatický běh, časovou zónu, rozsah a oprávnění. Agent pak ověří ruční výsledek a spuštění téhož jobu skutečným plánovačem. U vzdáleného termínu použije podporovaný testovací běh nebo krátký dočasný termín, potom obnoví a ověří zvolený rozvrh; nevytvoří duplicitní rutinu. Test zůstane v autorizovaném rozsahu včetně doručení. Soubor `SKILL.md` sám nic nespouští. Provoz po zavření notebooku závisí na místě a způsobu provozu scheduleru.

V Claude Desktopu (záložka Code) je plánovač součástí appky. Úlohu v něm zakládá uživatel (Scheduled → New task) podle [ověřeného postupu](../scheduled-tasks/README.md#ranní-rutina-v-claude-desktopu), protože je to trvalé nastavení jeho účtu; agent připraví text instrukcí a s uživatelem ověří Run now a „always allow“. Lokální úloha běží jen se spuštěnou aplikací a probuzeným počítačem, provoz při vypnutém počítači vyžaduje cloudovou úlohu s repozitářem na GitHubu.

Rutinu určenou pro budoucí Hermes/VPS eviduj výslovně v etapě Dashboard podle [STAV-INSTALACE](STAV-INSTALACE.md); v kitu připrav její obsah a zdroje, její budoucí běh neoznačuj za ověřený.

Automatizaci kitu zvolenou „Nastavit teď“ označ za hotovou až po skutečném ověření. Čekání na naplánovaný běh drží tento krok nedokončený; ulož přesný další krok. Pokud uživatel výslovně zvolí „Později“, zapiš ODLOŽENO s důvodem a dalším krokem do téhož protokolu: dokončení kitu neblokuje, ale běh není OVĚŘENO. Agent odklad nevolí za uživatele. Již fungující automatizace ověř a zachovej, nevytvářej duplikáty.

## 7. PŘEDÁNÍ

Předej cestu workspace, profil, uložený výsledek a důkazy funkčního základu i všech částí zvolených „Nastavit teď“. Soubory ulož a znovu načti. Zkontroluj soukromý protokol podle [STAV-INSTALACE.md](STAV-INSTALACE.md), nikoli jen napsaný stav. První úkol, zelený doctor ani upgrade receipt `complete` samy neznamenají KIT COMPLETE. Neznámá volba, nedokončené „Nastavit teď“ nebo nefunkční základ znamenají KIT PENDING s jediným dalším krokem. Výslovné ODLOŽENO a NEZVOLENO neblokují dokončení, nejsou ověřenými funkcemi. Existující uživatel potřebuje ověření a doplnění chybějících částí, ne nový rozhovor od nuly.

Až ověřený KIT COMPLETE umožní podle uložené volby zahájit [průvodce 2 — Dashboard](../NASTAV-MUJ-AI-OS-DASHBOARD.md). Jeho instalační stav nenahrazuje stav kitu. U integrací a automatizací uveď konkrétní prostředí a skutečný test. Windows nativně není ověřen testem z macOS ani linuxové WSL session; rozhoduje samostatná evidence.

Pro Dashboard doporuč novou session ve STEJNÉM osobním workspace podle [PREDANI-DASHBOARDU.md](PREDANI-DASHBOARDU.md); na přání uživatele lze pokračovat ve stejné. Převezme hotový profil, tentýž protokol a ověřenou cestu čisté distribuce. Čerstvé načtení ověřuje druhá session na začátku před instalací, nikoli třetí povinná session.

Pro další aktualizaci uchovej čistou distribuční složku beze změn, i s jejím release-manifest.json. Vlastní práci a protokol pokračování udržuj mimo ni.

## Obnova starého zablokovaného bootstrapu

Pokud stará RC23 registrace bez Gitu blokuje i opravu, otevři novou session v čisté nové distribuci s neaktivními hooky. Připrav závislosti a po uchování původního nastavení oprav cílový workspace. Při práci ve staré session neobcházej blokaci globálním vypnutím pojistek.
