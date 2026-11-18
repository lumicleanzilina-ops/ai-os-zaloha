# CO SE ZMĚNILO OD V.03 — KIT 4.3 A DASHBOARD

> Srovnání je zpracované pro Kit 4.3.0-rc.28 a Dashboard 4.3.0-rc.28, čísla v něm nejsou přepočítaná na Kit 4.4. Co přibylo ve 4.4, je v [CHANGELOG](../CHANGELOG.md).

Detailní srovnání pro pokročilé uživatele V.03, vydání 4.3.0-rc.28. Výchozí stav V.03 dokládá tovární otisk [V03.json](../upgrade/baseline/V03.json) (127 souborů, SHA-256 původního ZIPu je v [README otisků](../upgrade/baseline/README.md)) a tovární ústava [V03-ustava.txt](../upgrade/baseline/V03-ustava.txt). Odkazy vedou do souborů tohoto Kitu. Cesty ve tvaru `Dashboard: …` jsou soubory druhého ZIPu AI OS Dashboard. Přesné soubory a otisky tohoto ZIPu určuje `release-manifest.json`.

## VE ZKRATCE

- **Kit 4.3 je pořád tvůj systém z V.03**, jen rozšířený: z 127 souborů V.03 chybí na původní cestě jediný (tovární learning přesunutý do playbooku). Přibyla jedna česká ústava `AGENTS.md`, pojistky na Node aktivované až po ověření, hlídač tajemství, doctor, upgrade s továrními otisky a uložený průvodce nastavením.
- **6 nových dovedností (celkem 33)**, rutina úklidu workspace, playbook 27 pravidel a zdroje čísel v `GROUND-TRUTH.md`.
- **Dashboard je beta ve druhém ZIPu**: aplikace, Hermes a firemní backend na počítači nebo vlastním serveru, jedna Markdown paměť s Git syncem, společné sessions Claude Code, Codexu a Hermese, volitelně COS Central s Jevem a telefon přes Tailscale.
- **Pro majitele V.03:** přehled novinek nic nemění. Upgrade jde nejdřív plánem, se zálohou a s rozlišením tvých úprav od továrních souborů.
- **Neověřené:** skutečné Windows, čistý VPS, telefon, živý Hermes s vlastními účty (model, Telegram), hlas přes OpenAI Realtime, živá inference Jevu a nativní callback desktopových klientů (sekce 6).

## 1. VÝCHOZÍ STAV: CO MĚLA V.03

| Oblast | V.03 | Zdroj |
|---|---|---|
| Jazyk a ústava | Anglicky. `CLAUDE.md` byla ústava (tvrdá pravidla 0–4, základní 1–7). `AGENTS.md` obsahoval anglický průvodce „Setup Wizard“, takže hosté čtoucí `AGENTS.md` (Codex, Cursor, Antigravity) dostali průvodce místo pravidel. `CHANGELOG.md` chyběl. | [V03-ustava.txt](../upgrade/baseline/V03-ustava.txt), [UPGRADE-Z-V3, krok 0](UPGRADE-Z-V3.md#krok-0-odkud-jdeš), [CAPABILITIES](CAPABILITIES.md) |
| Dovednosti | 27 složek v `skills/` | [V03.json](../upgrade/baseline/V03.json) |
| Pojistky | 5 shellových hooků: `deny-dangerous`, `checkpoint`, `self-review`, `skill-usage`, `backup-on-stop`. Aktivní hned přítomností `.claude/settings.json`. Strážce mazání odmítal rekurzivní a vynucené `rm`, checkpoint vznikal před editací souboru. | [V03.json](../upgrade/baseline/V03.json), [V03-ustava.txt](../upgrade/baseline/V03-ustava.txt) (Hard Rules 0, Self-Improvement) |
| Tajemství | Pravidlo v ústavě a `.gitignore`, bez strojového hlídače commitů | [V03-ustava.txt](../upgrade/baseline/V03-ustava.txt) (Hard Rules 2), [V03.json](../upgrade/baseline/V03.json) |
| Záloha | `backup-on-stop` po každé práci zapnutý, push workspace i vaultu přibližně po 15 minutách | [V03-ustava.txt](../upgrade/baseline/V03-ustava.txt), [UPGRADE-Z-V3, krok 4](UPGRADE-Z-V3.md#krok-4-sloučit-chráněné-soubory) |
| Rutiny | 5: `morning-briefing`, `weekly-improvement`, `daily-end-session`, `nightly-backup`, `second-brain-declutter` a katalog `BLUEPRINTS.md` | [V03.json](../upgrade/baseline/V03.json) |
| Moduly | `workspace-structure`, `mcp-integrations`, `second-brain`, `github-backup`, `image-generation` | [V03.json](../upgrade/baseline/V03.json) |
| Profil a učení | Profil v paměti agenta (`user-profile.md`, `user-preferences.md`, `user-systems.md`), `docs/learnings/` bez indexu s jedním továrním pravidlem | [V03-ustava.txt](../upgrade/baseline/V03-ustava.txt) (Step 2), [UPGRADE-Z-V3, krok 4](UPGRADE-Z-V3.md#krok-4-sloučit-chráněné-soubory) |
| Nástroje | Žádný Node nástroj, Node V.03 nepotřebovala; rozšíření sledování času | [V03.json](../upgrade/baseline/V03.json), [UPGRADE-Z-V3, krok 0](UPGRADE-Z-V3.md#krok-0-odkud-jdeš) |

## 2. CO PŘINÁŠÍ KIT 4.3

| Oblast | Kit 4.3 | Zdroj |
|---|---|---|
| Jedna ústava | `AGENTS.md` je jediný obsah pravidel pro Claude Code, Codex, Cursor i Antigravity; kořenový `CLAUDE.md` jen importuje `@AGENTS.md`. Česky, tvrdá pravidla 0–6 (nová: 5 systémová nastavení jen se snapshotem, 6 žádné volné soubory v rootu) a základní pravidla 1–9 (mj. nevymýšlet čísla, nehádat ověřitelné). Krok 0 každé session: záměr, pojistky, profil, stav instalace. | [AGENTS.md](../AGENTS.md), [SETUP §2](SETUP.md#2-profil-a-první-úkol) |
| Pojistky na Node | Hooky běží jako Node exec form přes `hooks/entry.mjs` a fungují i v cestě s mezerou; `.sh` zůstaly jen jako wrappery. Dodaný `.claude/settings.json` má hooky prázdné. `tools/aktivovat-pojistky.mjs` je zapne až po ověření Node 24 a Gitu, se skutečným checkpointem a zálohou původního nastavení; cizí hooky zachová. Mimo Claude Code se Claude hooky nespouštějí. | [hooks/README](../hooks/README.md), [SETUP §4](SETUP.md#4-hooky-a-workspace-doctor), [CHANGELOG](../CHANGELOG.md#máš-v04-nebo-v041) |
| Strážce mazání | Odmítne i jednotlivé `rm`, `unlink`, PowerShell `Remove-Item` a mazací API interpretů, složené příkazy posuzuje po částech a nic nespouští; výjimka je jen `git rm --cached`. Přesun do koše dělá `tools/kos.mjs` (macOS koš, Linux `gio trash`, Windows koš) bez fallbacku na trvalé mazání. | [hooks/README](../hooks/README.md), [deny-dangerous.mjs](../hooks/deny-dangerous.mjs) |
| Hlídač tajemství | `hooks/secret-guard.mjs` jako git pre-commit čte celé staged bloby (UTF-8 i UTF-16), hodnotu nikdy nevypíše a při chybě Node nebo Gitu commit zastaví. Do existujícího řetězce hooků se přidá, nepřepíše ho. Spouští ho git, takže hlídá i v Codexu a Cursoru. | [hooks/README](../hooks/README.md), [SETUP §4](SETUP.md#4-hooky-a-workspace-doctor), [UPGRADE-Z-V3, časté otázky](UPGRADE-Z-V3.md#časté-otázky) |
| Checkpoint | Snapshot před editací i před každým příkazem v shellu, uložený mimo workspace (`AICOS_STATE_DIR`, jinak `~/.claude/aicos`), obnova přes dovednost checkpoint (řekni slovy „vrať předchozí verzi souboru“; `/checkpoint` je v Claude Code vestavěný alias `/rewind`). Respektuje gitignore a nenahrazuje zálohu mimo počítač. | [hooks/README](../hooks/README.md#stav--záloha), [CAPABILITIES §8](CAPABILITIES.md#8-bezpečnost-a-sebezlepšování), [CHANGELOG](../CHANGELOG.md#máš-v04-nebo-v041) |
| Doctor | `tools/doctor.mjs` s receiptem `aicos-doctor/v1`: Node 24, Git, ústava s importem `@AGENTS.md`, zápis pojistek v konfiguraci, `--preflight` před aktivací. `hostRegistration` je vždy `not-verified`; skutečný callback hostu se ověřuje zvlášť. | [hooks/README](../hooks/README.md#doctor--receipt), [UPGRADE-Z-V3, krok 5](UPGRADE-Z-V3.md#krok-5-ověření) |
| Upgrade s otisky | `tools/upgrade.mjs`: offline plán (`create`, `replace`, `conflict`, `protected`, `instructions`), provedení jen schválených cest se zálohou v `.ai-os-upgrades/<id>/backup/`, převod ústavy `CLAUDE.md` → `AGENTS.md`, rozsah `core` i výběr jednotlivých cest. Tovární otisky V.03 (127 souborů), V.04 (179) a V.04.1 (180) odliší tvé úpravy; bez otisku vycházelo u V.03 0 výměn a 74 konfliktů. Tovární texty starých ústav ukážou, co sis do pravidel dopsal (u V.04 a V.04.1 tříbodovým sloučením). | [UPGRADE-Z-V3](UPGRADE-Z-V3.md), [otisky](../upgrade/baseline/README.md), [tools/README](../tools/README.md) |
| Průvodce a stav nastavení | START rozliší nový systém, pokračování a novinky. ONBOARDING projde celý katalog s volbou teď / později / nepotřebuji. Jeden soukromý protokol `docs/plans/ai-os-instalace.md` drží KIT PENDING / COMPLETE a právě jeden další krok; návrat jednou větou v nové session. | [START](../START.md), [ONBOARDING](../ONBOARDING.md), [STAV-INSTALACE](STAV-INSTALACE.md) |
| Profil ve workspace | `docs/profil/` místo paměti jednoho hostu, takže profil najde Claude Code i Codex | [UPGRADE-Z-V3, krok 4](UPGRADE-Z-V3.md#krok-4-sloučit-chráněné-soubory), [AGENTS.md](../AGENTS.md) |
| Učení a pravidla | `docs/learnings/INDEX.md`, který hook vkládá na startu session; dodaný playbook 27 řemeslných pravidel (tovární learning V.03 je teď tam); `docs/GROUND-TRUTH.md` pro zdroje opakovaných čísel | [CAPABILITIES §8](CAPABILITIES.md#8-bezpečnost-a-sebezlepšování), [playbook](playbook/INDEX.md), [GROUND-TRUTH](GROUND-TRUTH.md) |
| Dovednosti | +6: `call-prep`, `client-context`, `bookkeeping-reconciliation`, `convert-documents-to-markdown`, `lead-magnet-funnel`, `multi-model-deep-research`; celkem 33 | [CHANGELOG](../CHANGELOG.md#nové-dovednosti-pro-tvoji-práci), [skills/README](../skills/README.md) |
| Rutiny | + `workspace-tidy` (přesouvá, nemaže). Zvolená rutina je hotová až po ručním i skutečném plánovaném běhu. | [scheduled-tasks/README](../scheduled-tasks/README.md), [SETUP §6](SETUP.md#6-automatizace-podle-skutečného-dne) |
| Záloha | `backup-on-stop` je u nové registrace opt-in (`AICOS_BACKUP=on`, složky `AICOS_BACKUP_DIRS_JSON`); starý wrapper z V.03 drží zálohu zapnutou. Push i obnova se ověřují zvlášť pro workspace a externí vault. | [hooks/README](../hooks/README.md#stav--záloha), [UPGRADE-Z-V3, krok 4](UPGRADE-Z-V3.md#krok-4-sloučit-chráněné-soubory) |
| Předávka do Dashboardu | `tools/kit-completion.mjs` (`template`, `validate`, `export`) vede soukromý doklad `.ai-os/kit-completion.json` s důkazy (cesta a SHA-256) pro 9 oblastí. Na nativním Windows ověřuje soukromí podle ACL. | [STAV-INSTALACE](STAV-INSTALACE.md#strojově-ověřená-předávka-kitu), [ZNAME-LIMITY](ZNAME-LIMITY.md) |
| Úklid testů | `tools/testove-artefakty.mjs`: testy mažou jen vlastní složky se značkou `.aios-test-retained` (24 h a 20 nejnovějších), strop 20 složek a 500 MB se jen měří. Jediná výjimka z pravidla 0 platí pro kód testů, agent sám dál nemaže nic. | [AGENTS.md](../AGENTS.md), [tools/README](../tools/README.md) |
| AI firma | Oproti V.03 nová (role, úkoly a jejich kontrola). Ve 4.3 běží jako firemní backend Dashboardu; Kit nese jen rozcestník a starší vlastní runtime při upgradu nemaže ani nespouští vedle nového. | [modules/ai-firma](../modules/ai-firma/README.md), [CHANGELOG](../CHANGELOG.md#máš-v04-nebo-v041), `Dashboard: modules/ai-firma/runtime/server/README.md` |

## 3. CO PŘIDÁVÁ DASHBOARD (DRUHÝ ZIP, BETA)

Dashboard začíná až po KIT COMPLETE, doporučeně v nové session ve stejném workspace ([předání](PREDANI-DASHBOARDU.md)). Kit ho ke své práci nepotřebuje.

| Oblast | Dashboard 4.3.0-rc.28 | Zdroj (Dashboard ZIP) |
|---|---|---|
| Aplikace | Přehled, Mapa práce, Hermes, Práce, Výstupy a Posádka nad vlastním profilem, poštou a pamětí. Zámek aplikace, porty jen na loopbacku: 4920 aplikace, 4921 backend, 4930 a 4931 Hermes API a jeho nastavení. | `modules/aplikace/README.md`, `NASTAV-MUJ-AI-OS-DASHBOARD.md` |
| Hermes | Oficiální Hermes Agent od Nous Research ve vlastním soukromém HOME instance. Model se přihlašuje na každém stroji zvlášť (doporučená cesta je ChatGPT/Codex předplatné přes OAuth), přihlašovací soubory se nekopírují. Telegram je volitelný kanál téhož Hermese. Samostatně nainstalovaného Hermese instalace nepřebírá ani nevypíná. | `docs/PRVNI-SPUSTENI-HERMESE.md`, `START.md` |
| Firma | Původní firemní backend (harness API v1/role-v1, runner, soukromý Git board) obsluhuje Práci a Posádku. Nová firma je za STOPem, inicializace sama nevolá model. | `modules/ai-firma/runtime/server/README.md`, `modules/aplikace/README.md` |
| Jedna paměť | Jeden autoritativní Markdown vault instance se společným zámkem zápisu. Tolaria i Obsidian otevřou tutéž složku. Git sync na vlastní privátní repo; lokální commit, potvrzený push a obnova jsou oddělené stavy. Další stroj používá Git mirror téhož vaultu. | `modules/aplikace/README.md` (MODELY A JEDNA PAMĚŤ) |
| Společné sessions | Claude Code a Codex: nativní hooky → kanonický SessionLog → trvalá fronta → Central. Hermes: omezené souhrny v okně 168 hodin. Cursor a Antigravity: ruční export. Jména a pracovní kontext se zachovávají, přihlašovací tajemství se redigují. | `modules/ai-firma/runtime/server/README-SESSIONS.md`, `modules/aplikace/README.md` |
| COS Central a Jev | Volitelné. `--central` přidá Central na loopback 4933 (Linux a WSL nativně, Mac v Linux kontejneru). Placené porovnávání sessions Jevem je samostatná volba `--jev active` s klíčem OpenRouteru; výchozí konfigurace ho má vypnuté. | `modules/ai-firma/runtime/server/README-CENTRAL.md`, `modules/aplikace/README.md` |
| Kde běží | Počítač (Mac, nebo Windows přes WSL2/Ubuntu): běží jen při zapnutém počítači, bez nákladů na server. Vlastní VPS s Ubuntu 24.04: nepřetržitě, placená služba, stack pod účtem `aios-customer` bez sudo, správa přes SSH tunel. Volí se v chatu před instalací. | `START.md`, `NASTAV-MUJ-AI-OS-DASHBOARD.md`, `modules/aplikace/README.md` |
| Telefon | Volitelně Tailscale na VPS a telefonu: soukromé HTTPS na odděleném vstupu 4932, zámek aplikace zůstává, Funnel vypnutý, klient na počítači není potřeba. | `docs/TAILSCALE.md`, `modules/aplikace/vydani.json` |
| Přenos z počítače | Jen vybraná MCP (inventura a soukromý export konfigurace Claude a Codexu) a vybraný vault. Celý HOME ani login cache se nepřenášejí. | `docs/PRENOS-MCP-NA-SERVER.md`, `docs/PRENOS-VAULTU-NA-SERVER.md`, `tools/client-config/README.md` |
| Záloha instance | `tools/instance-backup.mjs`: snapshot trvalých dat zastavené instance včetně tajemství do nové soukromé složky, obnova jen do nového cíle. Git sync vaultu není záloha instance. | `docs/ZALOHA-DASHBOARDU.md` |
| Hlas | Volitelný Jarvis nad stejnou pamětí přes OpenAI Realtime, s volbou hlasu OpenAI, ElevenLabs nebo Fish Audio | `TVUJ-AI-PARTAK-NA-SERVERU.md` (ÚKOL 6) |
| Úpravy na míru | Upravitelné zdroje téže aplikace (UI, server, závislosti, build). Úpravu převede coding agent do běžící instalace se zálohou dat, profil a paměť zůstávají. | `modules/aplikace/zdroje/README.md` |
| Vazba na Kit | Instalátory a spouštěče celého stacku bez platného dokladu Kitu nic nenainstalují ani nespustí. Profil se přebírá z Kitu bez druhého dotazníku. Dokončení dokládá skutečný úkol a návrat po restartu. | `START.md`, `modules/aplikace/README.md` |

## 4. CO SE ZMĚNÍ V DENNÍ PRÁCI

- Session otevírej v kořeni workspace. V podsložce se pravidla načtou, ale projektové hooky Claude Code nespustí ([SETUP §4](SETUP.md#4-hooky-a-workspace-doctor)).
- Rozbalením ZIPu nic neběží: pojistky zapíná agent po Node 24 a Gitu a ověřuje skutečný callback ([hooks/README](../hooks/README.md)).
- Mazání vede do koše přes `tools/kos.mjs`. Checkpoint je lokální návrat, ne záloha mimo počítač ([CHANGELOG](../CHANGELOG.md#co-se-změní-v-denní-práci)).
- Commit s tvarem klíče zastaví hlídač tajemství, i když commituješ z terminálu nebo jiné appky ([UPGRADE-Z-V3](UPGRADE-Z-V3.md#časté-otázky)).
- Automatická záloha po práci už není zapnutá samotným ZIPem, zapíná se volbou; `work/clients`, `work/projects`, `work/content` a `work/admin` nejsou plošně vyřazené ze zálohy ([CHANGELOG](../CHANGELOG.md#co-se-změní-v-denní-práci), [UPGRADE-Z-V3, krok 4](UPGRADE-Z-V3.md#krok-4-sloučit-chráněné-soubory)).
- Self-review zůstává jako ve V.03: po každé páté odpovědi vyzve agenta k zápisu trvalých poučení z oprav a nových dovedností, a když není co zachytit, agent odpoví `[SKIP]`. Nově výzva žádá ke každému poučení i řádek v `docs/learnings/INDEX.md` a self-review se jako ostatní pojistky zapne až aktivací ([výzva self-review](../hooks/self-review-prompt.md), [hooks/README](../hooks/README.md)).
- Čísla jen se zdrojem z `GROUND-TRUTH.md`, nové soubory ne do rootu workspace ([AGENTS.md](../AGENTS.md)).
- Nedokončené nastavení se ukládá; „později“ má důvod a konkrétní návrat ([STAV-INSTALACE](STAV-INSTALACE.md)).
- S Dashboardem: úkoly firmy, Hermes i z Telegramu nebo telefonu, společná paměť a sessions napříč Claude Code, Codexem a Hermesem (sekce 3).

## 5. CO ZŮSTÁVÁ STEJNÉ

- Z 127 souborů V.03 je v Kitu 4.3 na stejné cestě všech 126 kromě továrního learningu `verify-in-your-weak-spots.md`, který je teď v [playbooku](playbook/verify-in-your-weak-spots.md). Bajtově shodných je 39 (data a skripty `ui-ux-pro-max`, `mcp-builder`, `spline-3d`, rozšíření sledování času, `modules/mcp-integrations/example-mcp-config.json` a prázdná značka `skills/.archive/.gitkeep`), ostatní jsou upravené, včetně všech 27 původních `SKILL.md`. Ověříš to porovnáním [V03.json](../upgrade/baseline/V03.json) s `release-manifest.json` tohoto ZIPu.
- Tvrdá pravidla V.03 0–4 (nemazat natvrdo, data uživatele jsou posvátná, žádná tajemství v gitu, prověřit cizí dovednosti, uživatele neposílat do terminálu) jsou dál pravidla 0–4 ([V03-ustava.txt](../upgrade/baseline/V03-ustava.txt), [AGENTS.md](../AGENTS.md)).
- Dovednosti `planning`, `second-opinion`, `topshit`, `checkpoint`, `scan`, `end-session` a všech 5 modulů V.03 zůstávají ([AGENTS.md](../AGENTS.md), [skills/README](../skills/README.md), [README](../README.md)).
- Upgrade zachová profil, pravidla, vlastní dovednosti, projekty, integrace, paměť a historii. Nový ZIP patří vedle tvého workspace, nikdy přes něj ([UPGRADE-Z-V3](UPGRADE-Z-V3.md)).
- Kit funguje bez Dashboardu, Hermese i serveru ([START](../START.md)).

## 6. CO JE BETA A CO NENÍ OVĚŘENÉ

| Oblast | Stav | Zdroj |
|---|---|---|
| Dashboard jako celek | Beta pro kupující Kitu: `customerDistributionApproved: true`, `distributionChannel: beta` | `Dashboard: modules/aplikace/vydani.json`, `Dashboard: LICENSE.md` |
| Windows přes WSL2 | Experimentální; `realWindowsTest` a `powershellParserTest` jsou `false` | `Dashboard: modules/aplikace/vydani.json`, `Dashboard: tools/windows/README.md` |
| Předávka Kitu z nativního Windows | Ověřování podle ACL zatím neprošlo skutečným Windows | [ZNAME-LIMITY](ZNAME-LIMITY.md) |
| Čistý VPS | `cistyVpsTest: false`; Linux stack a Central nemají doložený průchod na čistém zákaznickém stroji | `Dashboard: modules/aplikace/vydani.json`, `Dashboard: modules/aplikace/README.md` |
| Tailnet a telefon | `realTailnetTest` a `realPhoneTest` jsou `false` | `Dashboard: modules/aplikace/vydani.json` |
| Živý Hermes s vlastními účty | Odpověď modelu přes tvoje přihlášení a Telegram nejsou doložené průchodem se skutečnými účty zákazníka; instalační agent je ověřuje až ve tvé instanci skutečnou odpovědí a obousměrnou zprávou | `Dashboard: LICENSE.md`, `Dashboard: README.md`, `Dashboard: docs/PRVNI-SPUSTENI-HERMESE.md` |
| Hlas přes OpenAI Realtime | Živý hovor s vlastním klíčem OpenAI vydání nedokládá; poslech, odpověď a malý úkol z hovoru ověřuje instalační agent až ve tvé instanci | `Dashboard: TVUJ-AI-PARTAK-NA-SERVERU.md` (ÚKOL 6) |
| Živá inference Jevu | `liveInferenceVerified: false` | `Dashboard: modules/aplikace/vydani.json` |
| Nativní callback desktopových klientů | `desktopCallbackVerified: false`; Claude hooky nejsou hooky Codexu ani jiného hosta | `Dashboard: modules/aplikace/vydani.json`, [ZNAME-LIMITY](ZNAME-LIMITY.md) |
| Sessions z nativních Windows | Nepodporované, aplikace na Windows běží ve WSL2 | `Dashboard: modules/aplikace/README.md` |
| Kit na nativním Windows a úplný onboarding začátečníka | Nedoložené lokálními macOS testy | [ZNAME-LIMITY](ZNAME-LIMITY.md) |
| Chování modelu | Textový průvodce nezaručuje chování každého modelu; připojení a vybrané změny se ověřují v prostředí uživatele | [CHANGELOG](../CHANGELOG.md#stav) |

## 7. CO SROVNÁNÍ NEDOKAZUJE

Stejný název dovednosti neznamená stejné chování: všech 27 původních `SKILL.md` je upravených. Převod pravidel, rozsah upgradu a otisky V.03 až V.04.1 hlídají automatické testy ve vývojovém repu, které se do ZIPu nebalí; ruční sloučení ústavy, každé MCP ani callback v konkrétním hostu nedokazují ([UPGRADE-Z-V3](UPGRADE-Z-V3.md#stav), [otisky](../upgrade/baseline/README.md)). Zelený doctor ani soubory pojistek nedokazují jejich běh v appce ([hooks/README](../hooks/README.md#doctor--receipt)).

## STAV

Srovnání pro AI OS Kit a AI OS Dashboard 4.3.0-rc.28, 2. 11. 2026; od 4.3.0-rc.27 se změnilo jen to, že Dashboard ZIP nese upravitelné zdroje aplikace. Údaje o V.03 vycházejí z továrních otisků, údaje o 4.3 ze souborů obou distribucí. Počty souborů platí pro tento ZIP; s dalším vydáním je přepočítej.
