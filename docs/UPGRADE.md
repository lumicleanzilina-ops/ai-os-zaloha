# UPGRADE TVÉHO WORKSPACE NA KIT 4.4

## NEJDŘÍV NOVINKY A TVŮJ VÝBĚR

Chceš zatím jen zjistit, co přibylo oproti tvé verzi (V.03, V.04 nebo Kit 4.3)? Agent přečte [CHANGELOG](../CHANGELOG.md), vysvětlí změny a nabídne, co by se hodilo tobě. Nic nemění, nespouští tento postup, nevyžaduje Node ani instalační protokol. I běžný START ve stávajícím systému nejdřív nabídne novinky, pokud výslovně nežádáš celý upgrade.

Částečný výběr řeší [Jen vybrané novinky](UPGRADE-Z-V3.md#jen-vybrané-novinky).

## CELÝ UPGRADE — JEN KDYŽ JEJ CHCEŠ

> **Jdeš z V.03, V.04 nebo V.04.1?** Začni návodem [UPGRADE-Z-V3.md](UPGRADE-Z-V3.md): provede tě krok za krokem a použije tovární otisky z `upgrade/baseline/`. Tenhle dokument je technická reference nástroje.
>
> **Jdeš z Kitu 4.3?** Použij oddíl [Upgrade z Kitu 4.3 na 4.4](#upgrade-z-kitu-43-na-44) níž: stejný nástroj, otisk `V43.json` a jiný postup s ústavou.

Tento postup zachová tvůj profil, pravidla, projekty, integrace i znalosti. Ověření na tvém stroji je samostatný krok. Nový ZIP vždy rozbal do nové složky vedle svého workspace. Nepřetahuj ho přes stávající složku.

## CO ŘÍCT AGENTOVI

> Přečti si START.md v nové složce kitu a proveď mě dalším krokem.

Otevři svůj dosavadní workspace a přidej cestu k [START.md](../START.md) v nové distribuci. Chceš-li celý upgrade, řekni výslovně „Chci aktualizovat celý kit a dokončit jeho nastavení.“ Teprve potom průvodce 1 použije tento postup pro upgrade hlavního kitu v rozsahu core. Nejdřív agent ukáže plán, teprve po schválení provede změny.

Známý profilový rozhovor znovu neabsolvuješ. Agent ověří všechny oblasti dosavadního kitu a doplní chybějící části podle [stavu instalace](STAV-INSTALACE.md). Nezakládej druhý osobní workspace jen proto, že vyšla aktualizace. Potřebuješ čistou novou distribuci, svůj stávající workspace a případně původní release manifest s nezávisle známým SHA-256.

Průvodce znovu zkontroluje celý skutečný katalog nové distribuce: [CAPABILITIES](CAPABILITIES.md), [dovednosti](../skills/README.md), aktuální návody v `../modules/`, [plánované úlohy](../scheduled-tasks/README.md) a [BLUEPRINTS](../scheduled-tasks/BLUEPRINTS.md). Aktivně navrhne a nastaví užitečné možnosti, sám žádnou nevypustí. Zachová známé volby a u chybějících nechá uživatele vybrat „Nastavit teď“ / „Později“ / „Nepotřebuji“. Výslovné „Později“ je ODLOŽENO s důvodem a dalším krokem v témže soukromém protokolu: dokončení kitu neblokuje, ale není OVĚŘENO. „Nepotřebuji“ je NEZVOLENO; neznámá volba, nedokončené „Nastavit teď“ a nefunkční základ dál znamenají KIT PENDING.

## POSTUP PRO AGENTA

Příkazy níže spouští agent. Zákazník kontroluje srozumitelný plán a schvaluje konkrétní změny. Během apply nesmí jiný agent, editor ani synchronizace měnit cíl. Upgrade patří průvodci 1; jeho doklady připoj odkazem do jediného soukromého protokolu podle STAV-INSTALACE. Pro případný Dashboard nejdřív dokonči celý KIT a ověř KIT COMPLETE, včetně důkazů. Samotné přání bonusu ani receipt tento krok nenahrazují.

1. Ověř absolutní cesty čistého nového kitu a zákaznického workspace. Nesmí být stejné ani jeden uvnitř druhého. Zdroj obsahuje distribuční `release-manifest.json`; nástroj ověří raw-byte SHA-256 a velikost každého uvedeného souboru.
2. Pořiď nezávislou ověřenou zálohu workspace i vaultu. Receipt upgradu zálohuje jen měněné soubory; OAuth, `.secrets`, ignorovaná data ani externí vault takovou zálohou pokryté nejsou. Tajemství zálohuj v zabezpečeném úložišti mimo git.
3. Baseline ber z původní tovární distribuce a její digest porovnej s důvěryhodným distribučním záznamem. Otisky V.03, V.04, V.04.1 a Kitu 4.3.0-rc.28 i jejich digesty jsou v `upgrade/baseline/README.md`. Nikdy nevyráběj baseline z dnešního personalizovaného workspace: zákaznické úpravy by se pak považovaly za tovární soubory.
4. Založ `work/upgrade/` s README. Vygeneruj nový plán, který se nesmí přepsat:

```sh
node /cesta/novy-kit/tools/upgrade.mjs \
  --source /cesta/novy-kit --target /cesta/muj-workspace \
  --scope core \
  --baseline /cesta/puvodni-release-manifest.json \
  --baseline-sha256 NEZAVISLE_OVERENY_SHA256 \
  --plan /cesta/muj-workspace/work/upgrade/plan-01.json
```

Chybí-li důvěryhodná baseline, vynech oba baseline parametry. Nové cesty lze stále navrhnout; existující rozdíly budou konflikty. Bez nezávislého digestu se existující soubory automaticky nepřepisují.

## UPGRADE Z KITU 4.3 NA 4.4

Máš-li Kit 4.3.0-rc.28, postupuj stejně jako výše: nový kit rozbal vedle workspace, udělej zálohu a vytvoř plán. Liší se jen otisk a ústava. Otisk `V43.json` leží v `upgrade/baseline/` nové distribuce a jeho SHA-256 je v [README otisků](../upgrade/baseline/README.md). Poznáš ho podle `release-manifest.json` ve svém workspace (`"version": "4.3.0-rc.28"`); u jiného kandidáta 4.3 se změněné soubory ukážou jako konflikt.

```sh
node /cesta/novy-kit/tools/upgrade.mjs \
  --source /cesta/novy-kit --target /cesta/muj-workspace \
  --scope core \
  --baseline /cesta/novy-kit/upgrade/baseline/V43.json \
  --baseline-sha256 f905e59db9f7a02781e1ec156cc1860a65db09d43e1ac4e8ae203edd6a599100 \
  --plan /cesta/muj-workspace/work/upgrade/plan-01.json
```

- **Nezměněné tovární soubory 4.3 plán ukáže jako `replace`**, tvoje úpravy jako `conflict` (zůstanou tvoje, rozdíl porovnej ručně). Bez otisku by byl konflikt každý rozdílný soubor.
- **Ústava se nepřevádí.** Ve 4.3 je `AGENTS.md` jediná ústava a `CLAUDE.md` jen importuje `@AGENTS.md`. Plán proto ukáže `instructions: none` a `AGENTS.md` ani `CLAUDE.md` nemění. Při `--apply` nepoužívej `--convert-instructions`: nástroj ho odmítne, protože není co převádět.
- **Nová pravidla 4.4 slouč do svého `AGENTS.md` ručně.** Tříbodové sloučení nad továrním textem 4.3: `git merge-file -p "<WORKSPACE>/AGENTS.md" "<NOVÁ>/upgrade/baseline/V43-ustava.txt" "<NOVÁ>/AGENTS.md" > "<WORKSPACE>/work/upgrade/AGENTS-slouceny.md"`. Místa označená `<<<<<<<` rozhodni s uživatelem a po jeho souhlasu původní `AGENTS.md` nejdřív zálohuj. Sloučená pravidla platí až od nové session: host čte `AGENTS.md` při jejím startu, takže agent v rozběhnuté session nové pravidlo nemá načtené, ani když už soubor leží ve workspace. Neříkej, že ho „už načetl“; řekni uživateli, ať otevře novou session nad stejnou složkou.
- **Pojistky a oprávnění zapoj znovu.** `.claude/settings.json` je tvůj soubor a upgrade ho nepřepisuje. Po aktualizaci souborů proto spusť aktivaci pojistek ([SETUP](SETUP.md)): zapojí nový hook `brain-pripomen` (připomínač paměti) a přidá čtecí příkazy `ls`, `grep`, `head`, `wc` do `permissions.allow`, aby agent četl bez klikání. Tvoje vlastní hooky a pravidla zůstanou a nic se nezdvojí. Bez přepínače zapojí aktivace všechny hooky kitu, tedy i přehled práce `kontext-prace` a záznam session `zaznam-session`. Chceš-li jen vybrané novinky, použij volbu `--jen` podle [Jen vybrané novinky](UPGRADE-Z-V3.md#jen-vybrané-novinky) (třeba `--jen brain-pripomen`); do `.claude/settings.json` nikdy nezapisuj ručně. Chceš-li záznamy sessions rovnou ve vaultu druhého mozku, zapiš do `env` v `.claude/settings.json` proměnnou `SECOND_BRAIN_VAULT` s absolutní cestou.
- **Zpřístupni dovednosti hostu.** Upgrade `.claude/` nezakládá ani nemění. Po aktualizaci souborů spusť `node tools/zpristupnit-skilly.mjs` (náhled) a po kontrole `--apply`: pro každou dovednost založí `.claude/skills/<jméno>` (macOS a Linux symlink na `skills/`, Windows kopie se značkou), existující položky nepřepíše ani nesmaže a `checkpoint` vynechá. Symlinky se s upgradem aktualizují samy; kopii na Windows nástroj ohlásí jako zastaralou a nic nepřepíše (zastaralou kopii bez tvých úprav přesuň do koše přes `tools/kos.mjs` a nástroj spusť znovu). V `.gitignore` má být řádek `.claude/skills/`. Claude Code dovednosti nabídne jako `/<jméno>` po `/reload-skills` nebo v nové session.
- **Jen vybrané novinky z Kitu 4.3.** Záloha (git commit a značka `pred-4.4-<datum>`, bez gitu kopie složky) je povinný první krok. Připomínač paměti se bere i s tím, na čem stojí (`tools/doctor.mjs`, `hooks/config.mjs` a hooky): `--apply … --novinky pripominac` převezme celou skupinu a hook zapojí `aktivovat-pojistky.mjs --jen brain-pripomen`. Celý postup je v [Jen vybrané novinky](UPGRADE-Z-V3.md#jen-vybrané-novinky).
- Zbytek postupu (záloha, review plánu, `--approve-safe`, apply, receipt, ověření) je stejný. Co 4.4 přináší, shrnuje [CHANGELOG](../CHANGELOG.md).

## ROZSAH: HLAVNÍ KIT A VOLITELNÝ BONUS

`--scope core` aktualizuje osobní kit: dovednosti, návody, hooky a modul druhého mozku. Nekopíruje balíčky Dashboardu ani jeho serverovou instalaci. Malé návody zůstávají jako rozcestník; Dashboard se po ověřeném KIT COMPLETE nastavuje průvodcem 2 ze SAMOSTATNÉHO Dashboard ZIPu. Nový KIT neobsahuje firemní runtime; případný starší runtime ve workspace nástroj ponechá nedotčený.

Přesná hranice bonusu je `modules/aplikace/`, `modules/ai-firma/runtime/server/`, `tools/windows/`, `tools/tailscale/`, `tools/client-config/`, `tools/ai-os.mjs` a kořenové spouštěče `Nastavit Hermese.cmd`, `Overit AI OS Dashboard.cmd`, `Spustit AI OS Dashboard.cmd`, `Stav AI OS Dashboard.cmd`. Existující soubory bonusu ve workspace zůstanou nedotčené. Zdrojový manifest i bajty celé distribuce se ověřují v obou rozsazích.

`--scope all` zahrne i tyto bonusové soubory. Kvůli kompatibilitě se starším CLI je `all` také výchozí hodnota, když `--scope` vynecháš. Zákaznický postup výše proto výslovně volí `core`. Ani jeden rozsah nespouští služby, server, Dashboard či přihlášení.

Plán i receipt obsahují `scope` a `excludedPaths`. Rozsah po review nepřepisuj; změna znamená vytvořit nový plán. U `--apply` rozsah zadat nelze. Plány ze starší verze bez těchto polí znamenají `all`. Pro historický společný ZIP uměl `all` přidat i přibalený bonus. V samostatném KIT ZIPu runtime Dashboardu není; nevytvářej proto druhý upgrade plán kvůli Dashboardu. Použij jeho vlastní ZIP a instalátor podle předávky. Samotná přítomnost bonusových souborů nikdy neznamená dokončený KIT.

## JAK ČÍST PLÁN

| Stav | Význam | Možná akce |
|---|---|---|
| `create` | Nová cesta | Přidat po schválení |
| `replace` | Cíl odpovídá důvěryhodné původní verzi | Vyměnit po schválení a záloze |
| `unchanged` | Už je totožný s novou verzí | Nic neměnit |
| `conflict` | Zákaznická změna, chybějící baseline nebo obsazená cesta | Zachovat, obsah porovnat ručně |
| `protected` | Identita, konfigurace, tajemství, historie nebo data | Cíl se ani nečte (výjimka: `CLAUDE.md`, `AGENTS.md`, `CLAUDE.local.md` a `.claude/CLAUDE.md` se kvůli převodu pravidel hashují); případný merge zvlášť. Výjimka: README chráněných složek a `docs/learnings/INDEX.md` jsou šablony; chybějící se založí (`create`) a nezměněné tovární vymění (`replace`). |

`retainedPaths` uvádí staré soubory, které nový kit už nemá. Zůstávají na místě. Nástroj žádný soubor neodstraňuje.

Chrání `AGENTS.md`, `CLAUDE.md`, `CLAUDE.local.md`, profily, `.claude/`, další agentní konfigurace, `.secrets/`, `.env*`, credentials, `release-manifest.json`, vault/brain/memory, projekty, výstupy a runtime stav. Přesný seznam je v `isProtected()`. Symlink souboru nebo předka znamená odmítnutí. Vault s vlastním názvem nikdy nepředávej jako zdroj aktualizace; překrývá-li se s cestami kitu, tyto cesty do review nezařazuj a řeš je zvlášť.

### PRAVIDLA: JEN AGENTS.MD

Pravidla mají jediný zdroj `AGENTS.md`. Starý osobní `CLAUDE.md` se nejdřív bezpečně sloučí podle plánu níže; po dokončení převodu agent vytvoří malý wrapper `CLAUDE.md` s jediným řádkem `@AGENTS.md`. Tím Claude Code načte stejnou ústavu i bez nativní podpory AGENTS. Plán v poli `instructions` popíše původní soubory:

| `action` | Stav workspace | Při `approveInstructions: true` |
|---|---|---|
| `convert` (`agents: replace`) | `AGENTS.md` je nezměněný tovární soubor staré verze (podle důvěryhodného otisku) | Záloha `AGENTS.md`, nový `AGENTS.md` = `CLAUDE.md`, `CLAUDE.md` se přesune do zálohy |
| `convert` (`agents: keep`) | `AGENTS.md` je shodný s `CLAUDE.md`, nebo `CLAUDE.md` je nezměněný tovární soubor (podle důvěryhodného otisku) a pravidla jsou v `AGENTS.md` | `CLAUDE.md` se přesune do zálohy |
| `convert` (`agents: create`) | `AGENTS.md` chybí | `AGENTS.md` vznikne z `CLAUDE.md`, `CLAUDE.md` se přesune do zálohy |
| `manual` | Vlastní obsah v obou, `CLAUDE.local.md`, `.claude/CLAUDE.md`, odkaz nebo sdílený soubor | Apply odmítne; slouč ručně a soubory přesuň do zálohy |
| `none` | Už jen `AGENTS.md` | Nic |

Pořadí převodu drží workspace čitelný i po výpadku: záloha, nový `AGENTS.md`, kontrola, až nakonec přesun `CLAUDE.md` do `.ai-os-upgrades/<id>/backup/CLAUDE.md`. Stav kroku je v `receipt.json` → `instructions.status` (`pending`, `writing-agents`, `moving-claude`, `done`).

5. Ukaž konkrétní navržené cesty a význam změn. Souhlasí-li zákazník se vším bezpečným, stačí `--apply <plán> --approve-safe --convert-instructions` (schválí všechny `create`/`replace` a převod pravidel; `conflict` ani `protected` nikdy). Jinak: `approvedPaths` je původně prázdné pole. Po výslovném review do něj doplň jen schválené `create` a `replace` cesty; převod pravidel schvaluje `approveInstructions: true`. Ostatní pole plánu neměň.
6. Proveď explicitní apply:

```sh
node /cesta/novy-kit/tools/upgrade.mjs --apply /cesta/muj-workspace/work/upgrade/plan-01.json
```

Apply znovu ověří zdroj, baseline i cíl. Změna od plánování znamená zastavení a nový plán s novým review. Zálohy a receipt leží v `.ai-os-upgrades/<id>/backup/` a `receipt.json`. Není `--force` ani přepsání konfliktů.

Před první změnou cílového souboru nástroj uloží receipt se všemi schválenými cestami, zapíše a ověří všechny potřebné zálohy a provede `fsync` jejich obsahu i adresářových záznamů. Receipt se aktualizuje přes nový unikátní `receipt.json.tmp-*`, `fsync`, atomický rename a `fsync` rodičovského adresáře. Chyba zápisu, synchronizace nebo rename dočasného souboru tak neusekne dosavadní receipt. Neúspěšné dočasné soubory zůstávají pro kontrolu.

Na Windows se připouští výslovné odmítnutí directory fsync (`EINVAL`, `ENOTSUP`, `ENOSYS`, `EISDIR`) a `EPERM` pouze při fsync již otevřeného a ověřeného adresářového handle; obsah souborů se synchronizuje dál. `EPERM` při otevírání, `EACCES`, `EIO` a `ENOSPC` apply zastaví. Tam, kde filesystem nepodporuje directory fsync, nelze slíbit stejnou odolnost adresářových záznamů proti výpadku napájení. Nativní Windows stále vyžaduje vlastní ověření.

## CHRÁNĚNÉ SOUBORY

Nový tovární `AGENTS.md` porovnej se zákazníkovou ústavou (po převodu je v jeho `AGENTS.md`). Nabídni konkrétní doplnění a uchovej původní bajty před ručním merge. Po ověřeném sloučení vytvoř pouze `CLAUDE.md` s přesným importem `@AGENTS.md`; nepřidávej druhou kopii pravidel ani CLAUDE.local.md. Nepřepisuj identitu a nepouštěj znovu onboarding.

`.claude/settings.json` měň jen řízeným merge po přečtení stávajících oprávnění, MCP a hooků. Nevyměňuj jej celý za tovární verzi. Registraci `sync-agents-md` z V.04.x vyřaď. Starý skript `hooks/sync-agents-md.sh` z V.04.x kopíroval `CLAUDE.md` přes `AGENTS.md` při každé editaci; upgrade ho nahradí prázdnou verzí, ale do té doby běží (viz krok 1 v [UPGRADE-Z-V3.md](UPGRADE-Z-V3.md)). Následuje workspace doctor a ověření hooků ve skutečné session. Git hooky zapoj podle [SETUP](SETUP.md): zjisti efektivní cestu i existující pre-commit, zálohuj je a zachovej vlastní kontroly řetězením s novým guardem. Nepřepisuj slepě `core.hooksPath` ani existující hook. AI firma patří do samostatného průvodce 2 po dokončeném kitu.

Cílový `release-manifest.json` automaticky neměň: částečně přijatý upgrade není celý tovární release. Zachovej původní tovární manifest, nový manifest uchovej ve složce distribuce a přilož receipt. Konflikty a ruční merge zaznamenej v `work/upgrade/README.md`.

## OVĚŘENÍ A NÁVRAT

- Ověř `status: complete` a skutečně zapsané cesty. Pád může nechat stav `preparing`, `ready`, `applying` nebo `partial`; nepokračuj slepým opakováním plánu. Nástroj automaticky neobnovuje ani nepokračuje v přerušeném apply.
- `complete` potvrzuje přenos schválených souborů a případný převod názvu ústavy. Neznamená, že nové chování bylo sloučeno do osobních pravidel, konfigurace nebo upravených dovedností. Po převodu z V.03 je `AGENTS.md` stále přesnou kopií osobního `CLAUDE.md`; nové principy z kitu doplní řízený merge, zápis a opětovné načtení souborů. Původní identitu, vlastní pravidla, MCP, profil i nastavené zálohování zachovej.
- Receipt obsahuje pro každou cestu původní a nový SHA-256. `backupStatus: ready` znamená ověřenou a synchronizovanou zálohu; u `pending` zálohu nejdřív ověř, samotná existence souboru nestačí. Stav souboru `pending` znamená, že nástroj jeho zápis ještě nezačal. `writing` se ukládá před vytvořením nebo truncate cíle: po pádu může být cíl původní, nový, prázdný či nedopsaný. `written` se ukládá až po synchronizaci a kontrole cíle. Při chybě receipt může zůstat poslední čitelný záznam záměru; skutečný obsah proto vždy porovnej s oběma hashi a se zálohou. Dočasný receipt nepovažuj automaticky za výsledek.
- Znovu načti uložený profil a pravidla, ověř jeden lokální úkol a integraci zvolenou „Nastavit teď“ read-only dotazem. Vault ověř testovací poznámkou, nalezením a zvolenou zálohou; Tolaria není podmínkou. Čerstvé načtení patří na začátek druhé etapy podle [předání Dashboardu](PREDANI-DASHBOARDU.md), nikoli do třetí povinné session.
- Původní nahrazený soubor lze po porovnání a schválení obnovit z `backup/`. Nejprve uchovej i jeho nynější verzi. Nově přidané soubory nástroj zpět nemaže: deaktivuj funkci v konfiguraci, případně člověk použije koš.
- Receipt dokazuje výměnu souborů. Hook a zvolený scheduler potřebují vlastní ověření v používaném prostředí.
- Dokončení celého kitu vyhodnoť podle [STAV-INSTALACE.md](STAV-INSTALACE.md): projdi celý katalog, dolož funkční základ a vše zvolené „Nastavit teď“, zachovej známý profil a doplň jen chybějící kroky. Výslovné ODLOŽENO s důvodem a dalším krokem ani NEZVOLENO dokončení neblokují; nejsou OVĚŘENO. Neznámá volba, nedokončené „Nastavit teď“ nebo nefunkční základ znamenají KIT PENDING. Upgrade receipt `complete` ani první úkol nejsou KIT COMPLETE. Až po kontrole protokolu a důkazů může podle uložené volby začít [průvodce 2 — Dashboard](../NASTAV-MUJ-AI-OS-DASHBOARD.md).

Pro Dashboard doporuč novou session ve STEJNÉM osobním workspace podle [PREDANI-DASHBOARDU.md](PREDANI-DASHBOARDU.md); na přání uživatele lze pokračovat ve stejné. Přijímající agent převezme profil a tentýž protokol, včetně ověřené cesty k úplné distribuci NOVÉ. První etapa soubory uloží a znovu načte; druhá před instalací ověří převzetí z čerstvého kontextu. Při pokračování ve stejné session zaznamenej pouze opětovné čtení, nikoli nový host callback.

## STAV

Offline Node nástroj, Node 24. Doctor (`tools/doctor.mjs`) po upgradu ověří Node 24, Git, ústavu `AGENTS.md`, její import přes `CLAUDE.md` a registrace pojistek. Další instrukce pouze oznámí k posouzení; kompatibilitu konkrétní verze hosta ani jeho callback neprokazuje. Před aktivací použij `--preflight`; aktivátor `tools/aktivovat-pojistky.mjs` nejdřív nabídne plán a s `--apply` vytvoří checkpoint, zálohu a řízeně sloučí svoje registrace. Tovární settings.json je neaktivní. Skutečné načtení osobních pravidel a callbacky ověř podle [SETUP](SETUP.md). Nativní Windows ani reálné serverové přihlášení nejsou ověřené podle testu z macOS.

## SAMOSTATNÉ DISTRIBUCE OD RC21

AI OS Kit 4.4 se dodává samostatně bez instalačního payloadu Dashboardu. Upgrade prováděj z manifestu KIT balíku. Případná historická volba `--scope all` nepřidá nic, co v tomto manifestu není; Dashboard má svůj druhý ZIP a instalátor. Oba rozbalené balíky udržuj odděleně a osobní workspace zachovej. Po dokončení celého kitu naváže [předávka](PREDANI-DASHBOARDU.md) a ověřený START ze samostatné Dashboard distribuce. Starší vlastní runtime a zákaznické soubory automaticky nemaž.
