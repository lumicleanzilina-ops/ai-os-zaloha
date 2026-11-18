# UPGRADE Z V.03, V.04 A V.04.1 NA KIT 4.4

## NEJDŘÍV NOVINKY A TVŮJ VÝBĚR

Chceš zatím jen zjistit, co přibylo oproti V.03, V.04 nebo V.04.1? Agent přečte START a [CHANGELOG](../CHANGELOG.md), vysvětlí změny pro tvou verzi a nabídne, co by se hodilo tobě. Nic nemění, nespouští tento postup, nevyžaduje Node ani instalační protokol. Čte nástrojem Read, na přehled stačí; k hledání smí použít čtecí příkazy `ls`, `grep`, `head` a `wc`. Dodaný `.claude/settings.json` je předschvaluje, ale tvůj starý workspace ho nemá, takže se tě na ně mohou zeptat na povolení. I běžný START ve stávajícím systému nejdřív nabídne novinky, pokud výslovně nežádáš celý upgrade.

## CELÝ UPGRADE — JEN KDYŽ JEJ CHCEŠ

Máš workspace z dřívější verze (`<tvojejmeno>-workspace`) a chceš novou? **Nová verze tvůj systém nepřepíše.** Vymění se jen tovární soubory, které sis neupravil (hooky, návody, dovednosti kitu); profil, pravidla, vlastní dovednosti, projekty, integrace, paměť a historie zůstanou. Před první změnou vznikne záloha a vrátit se jde kdykoli.

**Co uděláš ty:**

1. Nový ZIP rozbal **vedle** svého workspace, ne přes něj (třeba ve Stažených souborech). Neotevírej jej jako nový osobní systém.
2. Otevři v appce **svůj dosavadní workspace**, zpřístupni agentovi novou distribuci (v Claude Code přes + vedle pole pro zprávu → Add folder) nebo mu dej cestu k [START.md](../START.md) v ní a napiš:
   > Přečti si START.md v nové složce kitu a proveď mě dalším krokem.

   Chceš-li celý upgrade, řekni agentovi výslovně „Chci aktualizovat celý kit a dokončit jeho nastavení.“ Teprve potom průvodce 1 naváže na tvůj systém a připraví upgrade hlavního kitu v rozsahu core. Nejdřív ukáže plán; před schválením nic nepřepíše.
3. Odpovídej na otázky. U všeho, co sis v kitu sám upravil, ti agent ukáže rozdíl a rozhodneš ty.

**Co se změní u pravidel:** od V.04.2 má systém jedinou ústavu, soubor `AGENTS.md`. Čte ho Claude Code (od verze 2.1.281 sám) i Codex, Cursor a Antigravity. Tvoje pravidla z `CLAUDE.md` se přenesou do `AGENTS.md` a původní `CLAUDE.md` se přesune do zálohy upgradu. Nesmaže se. Po bezpečném sloučení pravidel vytvoř místo něj pouze import `@AGENTS.md` podle SETUP; nikdy nepřepiš dosud nesloučená osobní pravidla.

> Dashboard a server jsou dobrovolná nadstavba. Tento postup aktualizuje hlavní kit bez jejich velkých balíčků a nic nespouští. Pro případný bonus použij samostatný Dashboard ZIP; oba rozbalené balíky ponech oddělené. Přání Dashboardu agent uloží, ale jeho průvodce 2 začne až po ověřeném dokončení celého kitu podle [STAV-INSTALACE.md](STAV-INSTALACE.md).

## Jen vybrané novinky

Pokud si zákazník vybere jen část, nerozšiřuj výběr na celý upgrade ani na celý katalog ONBOARDING. Kroky 1–6 jdou po pořadí a žádný se nepřeskakuje ani nepřehazuje; kdo začne rovnou plánem nebo zápisem do nastavení, postup porušil.

1. **ZÁLOHA je povinný první krok, ještě před čímkoli, co do workspace zapisuje.** Řekni uživateli jednou větou, že před převzetím novinek uděláš zálohu, a udělej ji:
   - **Workspace je git repo** (`git rev-parse --is-inside-work-tree`): ukaž `git status`, necommitnuté změny se souhlasem uživatele commitni (`git add -A`, potom `git commit -m "Záloha před převzetím novinek 4.4"`) a stav označ značkou `git tag pred-4.4-<RRRR-MM-DD>` (týž den podruhé `pred-4.4-<RRRR-MM-DD>-2`). Příkazy pouštěj jednotlivě. U čistého stromu stačí značka. Hlídač tajemství commit se skutečným klíčem zastaví; neobcházej ho a řekni to uživateli.
   - **Bez gitu, nebo když uživatel commit odmítne:** zkopíruj celou složku i se skrytými soubory (`cp -Rp "<WORKSPACE>" "<WORKSPACE>-zaloha-pred-4.4-<RRRR-MM-DD>"`) a výpisem `ls -A` ověř originál i kopii.
   - **Ukaž uživateli doklad:** výstup `git log -1 --oneline` a `git tag --list "pred-4.4-*"`, nebo absolutní cestu ke kopii. Dokud doklad neukážeš, nevytvářej plán v `work/upgrade/`, nespouštěj `--apply` ani aktivaci pojistek a nezapisuj do `.claude/settings.json`. Zálohu z kroků 0–2 níže tím nenahrazuj odkazem: ta patří k celému upgradu, tenhle krok je povinný vždy.
2. **Co novinka potřebuje.** Pouze přečti vybranou dovednost, rutinu nebo hook a jejich závislosti, ověř, co už uživatel má, a ukaž, které soubory a propojení jsou pro tuhle změnu nutné. Chybějící účet, nástroj či změnu společných hooků vysvětli předem; uživatel může rozšíření schválit, nebo funkci odložit. Soubory, na kterých novinka stojí, se berou spolu s ní:
   - **Připomínač paměti** (hook `brain-pripomen`, vyhledávač `tools/brain-hledej.mjs`, dovednost `brain`) stojí na dispečeru hooků a pojistkách: `hooks/entry.mjs`, `hooks/runtime.mjs` (měkký bootstrap), `hooks/actions.mjs`, `hooks/kontext-prace.mjs`, `hooks/zaznam-session.mjs`, `hooks/config.mjs`, `hooks/deny-dangerous.mjs`, `hooks/secret-guard.mjs`, a na `tools/doctor.mjs` a `tools/aktivovat-pojistky.mjs`. **Doctor ze 4.3 měkký bootstrap nezná:** po zapojení připomínače hlásí `config-exec-form` jako `failed` a náhled aktivace `blocked`, proto se `tools/doctor.mjs` a `hooks/config.mjs` berou vždy spolu s ním. Skupinu doplní nástroj (`--novinky pripominac`, krok 4); ručně ji nevybírej. Předem řekni uživateli, že převzetím `hooks/actions.mjs` dostane i stávající hook `learnings-index` krátký rozcestník místo celého seznamu learningů. Samostatně jde připomínač vzít jen z Kitu 4.3: ve V.03, V.04 a V.04.1 Node pojistky nejsou a patří jim celý upgrade.
   - **Závěr odpovědi** (`JÁ:`, `TY TEĎ:`) je pravidlo v `AGENTS.md`. Nepřenáší se souborem, ale sloučením jeho textu do uživatelova `AGENTS.md` (krok 3).
3. **Plán a ústava.** Ochranu `work/upgrade/` a `.ai-os-upgrades/` před automatickou Git zálohou a vytvoření plánu proveď podle kroku 2 níže (u Kitu 4.3 s otiskem `V43.json` podle [UPGRADE](UPGRADE.md#upgrade-z-kitu-43-na-44), rozsah `core`). Plán obsahuje širší nabídku souborů a u každé novinky se skupinou vypíše její stav; `approvedPaths` pro ni nepiš. Převod ústavy je samostatná změna: `approveInstructions` ponech `false` a nepřidávej `--convert-instructions`. Nové pravidlo slouč do `AGENTS.md` jen v rozsahu vybrané novinky, s ukázaným rozdílem a souhlasem uživatele.
4. **Převzetí souborů.** `node "<NOVÁ>/tools/upgrade.mjs" --apply "<WORKSPACE>/work/upgrade/plan-01.json" --novinky pripominac` vezme jen soubory skupiny (`create` a `replace`, shodné přeskočí) a nic jiného; s `--approve-safe` se nespojí. Je-li některý soubor skupiny upravený (`conflict`), nástroj skončí dřív, než cokoli zapíše: ukaž rozdíl, slouč ručně se zálohou a souhlasem uživatele a vytvoř nový plán. Novinky bez skupiny (dovednost, návod) vyber ručně: do `approvedPaths` zapiš výhradně schválené cesty typu `create` nebo `replace` a spusť `--apply` bez `--approve-safe`, protože ten schvaluje všechny bezpečné změny plánu. `conflict` a `protected` vyřeš jen v rozsahu vybrané změny, se zálohou a ukázaným rozdílem.
5. **Zapojení hooku.** `.claude/settings.json` je uživatelův soubor a **ručně se do něj nepíše**. Jediná doporučená cesta je aktivace jen vybraného hooku: `node "<NOVÁ>/tools/aktivovat-pojistky.mjs" --workspace "<WORKSPACE>" --jen brain-pripomen` (náhled) a po schválení stejný příkaz s `--apply`. Volba `--jen` nahradí jen registrace vybraných hooků, ostatní registrace i vlastní nastavení nechá a `permissions` nemění. Jména: `deny-dangerous`, `checkpoint`, `guard-root-writes`, `skill-usage`, `self-review`, `backup-on-stop`, `zaznam-session`, `learnings-index`, `kontext-prace`, `brain-pripomen` a `cteni` (jen čtecí pravidla `ls`, `grep`, `head`, `wc` v `permissions.allow`, novinka „Čtení a hledání bez klikání“). Výběr jen doplňuje: kritické pojistky z dřívější aktivace už musí být zapojené, jinak doctor aktivaci zastaví a nástroj poradí celou aktivaci bez `--jen`.
6. **Ověření a nová session.** Ověř právě zvolené funkce a zachování ostatního nastavení: `node tools/doctor.mjs` musí projít kontrolou `config-exec-form`; varování `kontext-prace-hook` a `zaznam-session-hook` (hook není zapojený) jsou u výběru očekávaná, nejde o chybu. **Nové pravidlo i nový hook platí až od nové session:** host načítá `AGENTS.md` a registrace hooků při jejím startu. Neříkej, že pravidlo „už načetl“ nebo že hook „už běží“, jen protože soubor leží ve workspace; do nové session se agent řídí starou verzí. Řekni uživateli, ať otevře novou session nad stejnou složkou. Uchovej technický doklad výběru a zálohy v `work/upgrade/`; existující osobní záznam nastavení aktualizuj jen tam, kde se stav změnil. Nezakládej kvůli doplňku celý instalační dotazník. Ukaž, co přibylo, co funguje a co zbývá, kde je záloha (značka nebo kopie) a jak se vrátit. Částečné převzetí není celý Kit 4.4 ani KIT COMPLETE; žádný další setup automaticky nenavazuje.

Pravidla a kroky níže popisují CELÝ upgrade. Při částečném výběru použij pouze jeho schválený rozsah podle této sekce.

---

## Pro agenta: pravidla upgradu

Pojmy: **NOVÁ** = rozbalená složka nové verze. **WORKSPACE** = uživatelův personalizovaný workspace, ve kterém běží tahle session. Soubory z NOVÉ čti po absolutní cestě.

1. **Nic nemaž.** Co se nahradí, jde do `.ai-os-upgrades/<id>/backup/`. Žádné `rm`; když něco musí z cesty, přesuň to (`mv`) do zálohy.
2. **Neopakuj profilový rozhovor a nezakládej novou kopii workspace.** Uživatel svůj systém má. Povinně projdi celý skutečný katalog nové distribuce: `docs/CAPABILITIES.md`, `skills/README.md`, aktuální návody v `modules/`, `scheduled-tasks/README.md` a `scheduled-tasks/BLUEPRINTS.md`. Aktivně pomoz nastavit co nejvíc užitečného; sám nic nevypusť. Navazuj na dochované důkazy a známé volby, chybějící nech uživatele rozhodnout „Nastavit teď“ / „Později“ / „Nepotřebuji“. Jeden soukromý protokol a stavy KIT PENDING / COMPLETE určuje [STAV-INSTALACE.md](STAV-INSTALACE.md). Výslovné „Později“ je ODLOŽENO s důvodem a dalším krokem; neblokuje dokončení, ale není OVĚŘENO. „Nepotřebuji“ je NEZVOLENO. Neznámá volba, nedokončené „Nastavit teď“ nebo nefunkční základ zůstávají KIT PENDING.
3. **Workspace nepřejmenovávej ani nepřesouvej.** Paměť agenta bývá vázaná na cestu ke složce (tak to má Claude Code); přejmenováním by „zmizela“.
4. **Uživatelova data jsou nedotknutelná.** Soubory kitu, které uživatel upravil, měníš jen s ukázaným rozdílem a jeho souhlasem. Bez odpovědi platí jeho verze.
5. **Tajemství nečti ani nevypisuj.** U `.env`, `.secrets/` a konfigurace MCP ověřuješ jen existenci.
6. **Po každém kroku řekni jednou větou, co se stalo.** Plán ukazuj lidsky (co přibude, co se vymění, co zůstane), ne jako JSON.

## Krok 0: odkud jdeš

| Poznávací znak ve WORKSPACE | Verze | Otisk v `upgrade/baseline/` |
|---|---|---|
| Chybí `CHANGELOG.md` a `AGENTS.md` začíná „Setup Wizard“ (anglicky) | V.03 | `V03.json` |
| První záznam `## V.…` v `CHANGELOG.md` je V.04 | V.04 | `V04.json` |
| První záznam je V.04.1 | V.04.1 | `V041.json` |

SHA-256 otisku vezmi z tabulky v [upgrade/baseline/README.md](../upgrade/baseline/README.md). Už máš Kit 4.3 (`release-manifest.json` ve WORKSPACE má verzi `4.3.0-rc.28`)? Tuhle tabulku nepoužívej: postup a otisk `V43.json` jsou v [UPGRADE](UPGRADE.md#upgrade-z-kitu-43-na-44). Když verzi nepoznáš, zeptej se a případně jeď bez otisku (pak bude víc konfliktů, ale nic se nepřepíše).

Ověř `node --version` (musí být 24) a `git --version`. Nové pojistky i nástroj upgradu běží na Node; V.03 ho nepotřebovala, takže ho uživatel mít nemusí. Bez funkčního Node 24 i Gitu dál nepokračuj a domluv s uživatelem instalaci: po výměně hooků by stará registrace bez Node zablokovala každý příkaz a každou úpravu souboru.

Zjisti také: kde leží paměť agenta (`user-profile.md`, `user-preferences.md`, `user-systems.md`, třeba `ls ~/.claude/projects` a potom `ls` složky `memory` v té, která odpovídá workspace; cestu neodhaduj), jestli je WORKSPACE git repo, jestli má remote (záloha na GitHub) a jestli v něm není něco necommitnutého.

## Krok 1: záloha, než se čehokoli dotkneš

1. Celá složka vedle, i se skrytými soubory (`.claude/`, `.git/`, `.env`):
   ```bash
   cp -Rp "<WORKSPACE>" "<WORKSPACE>-zaloha-pred-kit43-$(date +%Y-%m-%d)"
   ```
   Ověř zálohu výpisem: `ls -A "<WORKSPACE>"` a `ls -A "<záloha>"` ukážou stejné položky, a stejně `ls -A` u složek, na kterých ti záleží (`projects`, `docs`, `.claude`). Na Windows použij ekvivalent a ověř stejně.
2. Paměť agenta zkopíruj do zálohy (`…-zaloha-…/_pamet-agenta/`).
3. Git: necommitnuté změny commitni (se souhlasem uživatele) a označ stav `git tag pred-upgradem-kit43`. Push jen tehdy, když má zálohu na GitHub a souhlasí.
4. Řekni uživateli absolutní cestu k záloze. Záloha zůstává; do koše ji dá on, až bude spokojený.

**V.04 a V.04.1: pozor na starý hook.** Jejich `settings.json` spouští po každé editaci souboru (Edit, Write) `hooks/sync-agents-md.sh`, který kopíruje `CLAUDE.md` přes `AGENTS.md`. Když si uživatel v `AGENTS.md` něco upravil (třeba v Codexu), první zápis editorem by to přepsal. Dokud neproběhne apply (krok 3, ten skript nahradí prázdným), zapisuj jen přes shell (`cp`, `printf`, nástroj upgradu), ne nástroji Edit a Write. Zálohu z bodu 1 udělej jako první věc.

## Krok 2: plán (jen čtení)

Před prvním zápisem pracovních souborů ověř ochranu `work/upgrade/` a `.ai-os-upgrades/` před commitem. V.03 tyto cesty ještě nemusí ignorovat a její automatická Git záloha může běžet. Pokud výluky chybí, zahrň jejich doplnění do vysvětleného a schváleného rozsahu i při převzetí jediného skillu. Nejmenší místní změna: zjisti účinný soubor výluk přes `git rev-parse --git-path info/exclude`, uchovej jeho obsah a doplň pouze `/work/upgrade/` a `/.ai-os-upgrades/`. Ověř obě cesty přes `git check-ignore` a ověř, že jejich obsah už není trackovaný; ignore nechrání soubory, které Git už sleduje. Pokud ochrana neplatí, plán ani zálohy dovnitř nezapisuj a nejdřív vyřeš ochranu v odsouhlaseném rozsahu. Neodpojuj dosavadní zálohování. Mimo Git repo tuto Git kontrolu nepředstírej.

Pak založ `work/upgrade/` s krátkým README (u V.04.x přes shell, viz krok 1) a vygeneruj plán:

```sh
node "<NOVÁ>/tools/upgrade.mjs" \
  --source "<NOVÁ>" --target "<WORKSPACE>" \
  --scope core \
  --baseline "<NOVÁ>/upgrade/baseline/<OTISK>.json" \
  --baseline-sha256 <SHA-256 otisku z tabulky> \
  --plan "<WORKSPACE>/work/upgrade/plan-01.json"
```

`<OTISK>` je `V03`, `V04` nebo `V041` podle kroku 0. Plán nemění produktové soubory cíle, ale zapíše soubor plánu do work/upgrade/. Proto ho nevytvářej pro pouhý dotaz na novinky. `scope: core` vynechá Dashboard balíčky a jeho serverové pomocníky; v `excludedPaths` je přesný seznam. Původní samostatný modul AI firma a malé návody zůstanou dostupné. Úplný rozsah `all` patří až do průvodce 2 pro zvolený bonus po ověření KIT COMPLETE; vynechání přepínače znamená kvůli staršímu CLI právě `all`. Hranice rozsahu je v [technické referenci](UPGRADE.md#rozsah-hlavní-kit-a-volitelný-bonus). Ukaž uživateli:

- **Přibude** (`create`): nové soubory kitu, třeba `ONBOARDING.md`, `CHANGELOG.md`, `docs/playbook/`, nové dovednosti, modul `ai-firma`.
- **Vymění se** (`replace`): tovární soubory, které sis neupravil. Původní verze půjde do zálohy.
- **Konflikt** (`conflict`): soubor kitu, který sis upravil. Ukaž rozdíl proti NOVÉ a nech ho rozhodnout; bez rozhodnutí zůstává jeho. U V.03 je NOVÁ česky a jeho soubor anglicky, takže celý diff nic neřekne: najdi v jeho souboru řádky, které vypadají jako jeho doplněk (připsaný odstavec, vlastní příklad), nabídni je přenést do české verze z NOVÉ, a když si nejsi jistý, nech jeho verzi.
- **Chráněné** (`protected`): ústava, `.claude/`, profily, tajemství, projekty, výstupy, historie. Upgrade je nečte ani nemění; slučuješ je v kroku 4. Výjimka jsou README chráněných složek a index learningů: když chybí (třeba `outputs/` a `scratch/` z V.03), upgrade je založí, a když jsou tovární a nezměněné, vymění je.
- **Pravidla** (`instructions`): co se stane s `CLAUDE.md` a `AGENTS.md`:

| `instructions.action` | Co to znamená | Co uděláš |
|---|---|---|
| `convert` + `replace` | V.03: `AGENTS.md` je nezměněný tovární průvodce | Průvodce i `CLAUDE.md` půjdou do zálohy, `AGENTS.md` = jeho `CLAUDE.md` |
| `convert` + `keep` | V.04.x: `AGENTS.md` je shodná kopie `CLAUDE.md`, nebo `CLAUDE.md` je nezměněný tovární a pravidla má v `AGENTS.md` (Codex) | `CLAUDE.md` jen půjde do zálohy, `AGENTS.md` zůstane |
| `convert` + `create` | `AGENTS.md` chybí | `AGENTS.md` vznikne z `CLAUDE.md` |
| `manual` | Vlastní obsah v obou souborech, `CLAUDE.local.md`, `.claude/CLAUDE.md` nebo odkaz | Slouč ručně (krok 4) |
| `none` | Už je jen `AGENTS.md` | Nic |

## Krok 3: schválení a provedení

Když uživatel souhlasí se vším, co přibude a vymění se, i s převodem pravidel (plán říká `convert`), spusť:

```sh
node "<NOVÁ>/tools/upgrade.mjs" --apply "<WORKSPACE>/work/upgrade/plan-01.json" --approve-safe --convert-instructions
```

`--approve-safe` schválí všechny `create` a `replace` v již vybraném rozsahu (nikdy `conflict` ani `protected`), `--convert-instructions` převod pravidel. Chce-li uživatel jen část, zapiš vybrané cesty do `approvedPaths` v plánu (a `"approveInstructions": true` jen tehdy, když výslovně schválil také převod ústavy) a spusť `--apply` bez přepínačů. Jiná pole včetně `scope` a `excludedPaths` neměň. Pro jiný rozsah vytvoř nový plán. Plán obsahuje absolutní cesty k počítači uživatele, proto jeho vyloučení z commitu ověř podle kroku 2; nespoléhej na výchozí .gitignore starého kitu.

Apply znovu ověří zdroj, otisk i cíl. Když se mezitím něco změnilo, zastaví se a chce nový plán. Výsledek ukaž z `.ai-os-upgrades/<id>/receipt.json`: `status: complete`, u pravidel `instructions.status: done` a cesty k záloze `CLAUDE.md` (a u V.03 i továrního průvodce).

`complete` znamená hotový přenos schválených souborů. Nové chování ještě není sloučené do osobní ústavy a nastavení: po převodu je `AGENTS.md` přesnou kopií původního osobního `CLAUDE.md`. Pokračuj krokem 4 a ověřením v kroku 5. Ani úspěšný technický upgrade sám neznamená KIT COMPLETE; potom zkontroluj všechny oblasti a důkazy podle STAV-INSTALACE.

Nové soubory v kořeni (`ONBOARDING.md`, `CHANGELOG.md`) zapisuje nástroj, ne editor; root guard je proto nezastaví.

## Krok 4: sloučit chráněné soubory

- **`AGENTS.md` (ústava).** Po převodu v něm je jeho stará ústava. Cíl: nová tovární ústava z NOVÉ a v ní všechno, co si uživatel dopsal sám. Tovární texty starých ústav jsou v `<NOVÁ>/upgrade/baseline/` (`V03-ustava.txt`, `V04-ustava.txt`, `V041-ustava.txt`), takže jeho úpravy jde spočítat přesně:
  - **V.04 a V.04.1** (česky): tříbodové sloučení `git merge-file -p "<WORKSPACE>/AGENTS.md" "<NOVÁ>/upgrade/baseline/V041-ustava.txt" "<NOVÁ>/AGENTS.md" > "<WORKSPACE>/work/upgrade/AGENTS-slouceny.md"` (u V.04 `V04-ustava.txt`). Místa označená `<<<<<<<` rozhodni s uživatelem.
  - **V.03** (anglicky): `diff "<NOVÁ>/upgrade/baseline/V03-ustava.txt" "<jeho CLAUDE.md ze zálohy upgradu>"` ukáže jeho vlastní úpravy. Vezmi tovární `<NOVÁ>/AGENTS.md`, jeho úpravy přelož do jazyka, kterým s ním mluvíš, a vlož je do odpovídajících sekcí (co se nehodí nikam, do sekce „## Moje pravidla“ na konec).
  - Výsledek ukaž (seznam jeho pravidel, která zůstala, a nových sekcí z NOVÉ). Po souhlasu jeho dosavadní `AGENTS.md` zkopíruj do `.ai-os-upgrades/rucne-<datum>/` a nahraď ho sloučenou verzí. Identitu a jeho pravidla nepřepisuj. Odkazy na `CLAUDE.md` v textu oprav na `AGENTS.md`.
- **Profil.** Porovnej jeho `user-profile.md`, `user-preferences.md` a `user-systems.md` v paměti agenta (krok 0) s `docs/profil/`. Chybějící cílový soubor zkopíruj, shodný nech. Existující odlišný profil nikdy nepřepisuj kopií: nejdřív uchovej obě verze v soukromé záloze, připrav sloučení do `work/upgrade/` a ukaž konkrétní rozdíly. Zachovej vlastní údaje a novější doložená rozhodnutí; skutečný rozpor rozhodni s uživatelem. Teprve schválený výsledek vlož do `docs/profil/`, kde jej najde Claude Code i Codex. Originály v paměti nech a do protokolu napiš, odkud profil pochází a která kopie je pro další práci aktivní.
- **Ruční převod (`manual`).** Obsah `CLAUDE.md` (a případně `CLAUDE.local.md` nebo `.claude/CLAUDE.md`) slouč do `AGENTS.md`, výsledek ukaž a po souhlasu původní soubory přesuň (`mv`) do `.ai-os-upgrades/rucne-<datum>/`. Když je `AGENTS.md` odkaz na původní `CLAUDE.md`, nejdřív zachovej jeho obsah jako obyčejný soubor, aby přesun nevytvořil neplatný odkaz. Po ověření zachovaných pravidel vytvoř nový kořenový `CLAUDE.md` s jediným řádkem `@AGENTS.md`. Totéž dokonči po automatickém převodu z kroku 3. Nevytvářej druhou kopii ústavy ani nový `CLAUDE.local.md`.
- **`.claude/settings.json`.** Nejdřív původní soubor zkopíruj do `.ai-os-upgrades/rucne-<datum>/` (upgrade chráněné soubory nezálohuje). Zachovej vlastní `permissions`, `env` a nesouvisející hooky. Podle původní verze a skutečných cest vyřaď pouze doložené staré kitové registrace, včetně `sync-agents-md`; neodstraňuj obecně všechny uživatelské shell hooky. Nové registrace NEKOPÍRUJ z továrního settings.json, protože má úmyslně prázdné hooks. Po ověření Node 24, Gitu, wrapperu a platného JSONu spusť `node "<NOVÁ>/tools/aktivovat-pojistky.mjs" --workspace "<WORKSPACE>"`. Zkontroluj plán; potom v odsouhlaseném rozsahu přidej `--apply`. Nástroj vytvoří skutečný checkpoint, zálohu nastavení a sloučí pouze svoje registrace. Zachování cizích hooků a skutečný callback ověř podle [SETUP](SETUP.md). Nevyměňuj settings.json celý.
- **Záloha na GitHub.** Ve V.03 byla po každé práci zapnutá. Zachovej dosavadní volbu uživatele: stávající `AICOS_BACKUP` ani vlastní složky přes `AICOS_BACKUP_DIRS_JSON` nepřepisuj. Nové registrace mají zálohu zapnutou až po souhlasu; pokud uživatel používal původní automatickou zálohu, má remote a chce ji dál, při merge přenes její zapnutí jako `"env": { "AICOS_BACKUP": "on" }`. Nejde o založení nové služby. Dokud nechá staré registrace, záloha běží jako dřív.
- **`.gitignore`.** Vlastní výluky zachovej a prober s uživatelem, tovární řádky porovnej se starou verzí. Staré obecné `work/` nesmí dál vyřazovat pracovní zakázky ze schválené zálohy: pro pracovní obsah nová šablona vylučuje jen `work/tmp/` a `work/cache/`. Nahraď pouze doloženou starou tovární výluku; záměrnou soukromou výluku uživatele neruš. Vždy zachovej ochranu `.secrets/`, `.env`, autentizace a `.ai-os/`. Přes `git check-ignore` a zkušební commit/obnovu ověř, že vybraná pracovní složka skutečně vstupuje do zálohy.
- **`docs/learnings/INDEX.md`.** Když chybí (V.03), vezmi šablonu z NOVÉ a přidej řádek na každý jeho learning (spouštěč „když děláš X“ a odkaz). Když existuje, nech ho.
- **Šablony.** Chybí-li `projects/project-template/`, zkopíruj ho z NOVÉ. Do jeho projektů nesahej.
- **`release-manifest.json`.** Ten ve WORKSPACE neměň; nový manifest zůstává v NOVÉ.
- **Tovární příklad learningu z V.03.** `docs/learnings/verify-in-your-weak-spots.md` je teď v `docs/playbook/`. Když ho uživatel neupravil, přesuň ho do `.ai-os-upgrades/rucne-<datum>/`, ať se nepočítá mezi jeho vlastní pravidla.
- **Zbytky dvojčete (V.04.x).** `hooks/agents-twin-paths.txt` už nic neřídí: přesuň ho do `.ai-os-upgrades/rucne-<datum>/`. Podsložky, které v něm měl, mají vlastní `CLAUDE.md`: nabídni je převést na `AGENTS.md` stejně jako kořen (doctor je vypíše v `nested-claude-md`). U V.03 přibude `hooks/sync-agents-md.sh`; je to neškodný skript, který nic nedělá.

Technické detaily a rozhodnutí upgradu zapiš do `work/upgrade/README.md`. Z jediného soukromého protokolu nastavení podle STAV-INSTALACE na ně odkaž; nevytvářej druhý stav dokončení kitu.

## Krok 5: ověření

1. **Uložení a načtení.** Osobní soubory skutečně ulož a znovu načti; dolož konkrétní pravidlo z `AGENTS.md`, profil a dohledaný pracovní výsledek. Odpověď na „Jaká máš tvrdá pravidla?“ musí sedět s uloženým obsahem. Čerstvé načtení ověří začátek doporučené druhé session před Dashboardem podle [PREDANI-DASHBOARDU.md](PREDANI-DASHBOARDU.md), ne třetí povinná session. Pokračování ve stejné session na přání uživatele je možné; opětovné čtení není nový host callback. Skutečný běh pojistek ověř podle [SETUP](SETUP.md). Vyžaduje-li host pro novou konfiguraci restart, proveď potřebný technický restart a jeho výsledek ověř; samotná existence hooků úspěch nedokládá.
2. **Doctor.**
   ```sh
   node tools/doctor.mjs --workspace "<WORKSPACE>" --receipt "<mimo WORKSPACE>/doctor.json"
   ```
   Kontroly `node-runtime-24`, `git-runtime` a `constitution-agents-md` musí projít; poslední ověřuje také přesný import `@AGENTS.md` v kořenovém CLAUDE.md. `config-exec-form` projde po aktivaci z kroku 4. Před aktivací použij doctor `--preflight`, který ještě nevyžaduje aktivní hooky. Varování `additional-claude-instructions` a `nested-claude-md` znamenají další pravidla k posouzení, nikoli oprávnění stěhovat cizí soubory nebo workspace. Ukaž cestu a ověř soulad; cizí repozitáře nech. Doctor neověřuje přihlášení, kompatibilitu konkrétní verze hosta ani jeho skutečný callback. Ten dolož bodem 1 a postupem SETUP. Ukaž výsledek po řádcích.
3. **Hlídač tajemství.** Když je WORKSPACE git repo, nejdřív přečti `git config --show-origin --get core.hooksPath` a zkontroluj existující hooky v účinném adresáři; bez nastavené cesty zkontroluj i výchozí Git hooky. Není-li vlastní konfigurace ani aktivní hook, zapni `git config core.hooksPath hooks/git-hooks`. Už nastavené `hooks/git-hooks` neměň. Vlastní cestu ani hooky neodpojuj: změna `core.hooksPath` by přeskočila celý původní adresář. Uchovej původní konfiguraci a skripty, připrav konkrétní zapojení hlídače do stávajícího správce hooků nebo řetězce `pre-commit` a po review jej proveď. Zachovej všechny původní hooky, jejich argumenty i chybové návratové kódy; žádnou chybu nepřeváděj na úspěch. Ověř původní kontroly i hlídač neškodným testem. Dokud tento krok není ověřený, uváděj ochranu jako neověřenou, ne jako zapnutou.
4. **Profil.** „Co o mně víš?“ musí sedět s tím, co agent věděl před upgradem.
5. **Integrace a dovednosti.** `/mcp` (nebo obdoba v jeho appce) ukazuje stejné servery jako před upgradem; vlastní dovednosti jsou na místě. Aby je Claude Code nabízel jako příkazy `/<jméno>`, spusť `node tools/zpristupnit-skilly.mjs` (náhled) a po kontrole `--apply`; existující položky v `.claude/skills/` nástroj nepřepíše, jen ohlásí.
6. **Git.** Ukaž `git status` a se souhlasem commitni jedním commitem („upgrade na kit 4.4“).
7. **Shrnutí upgradu a dokončení kitu.** Ukaž, co se vyměnilo, co zůstalo jeho, kde je záloha a jak zpátky. Potom ověř celý katalog podle [STAV-INSTALACE.md](STAV-INSTALACE.md), doplň chybějící kroky a zkontroluj důkazy funkčního základu i všeho zvoleného „Nastavit teď“. Výslovné ODLOŽENO s důvodem a dalším krokem ani NEZVOLENO dokončení neblokují; nejsou OVĚŘENO. Neznámá volba, nedokončené „Nastavit teď“ a nefunkční základ znamenají KIT PENDING. První výsledek ani upgrade receipt nejsou dokončený KIT. Teprve ověřené KIT COMPLETE umožní podle uložené volby zahájit [průvodce 2 — Dashboard](../NASTAV-MUJ-AI-OS-DASHBOARD.md).

Pro Dashboard doporuč novou session ve STEJNÉM osobním workspace; na přání uživatele lze pokračovat ve stejné. Předej existující profil, tentýž protokol a ověřenou cestu úplné distribuce NOVÉ podle [PREDANI-DASHBOARDU.md](PREDANI-DASHBOARDU.md). První etapa končí zápisem a opětovným načtením souborů, čerstvé načtení ověří druhá na začátku před instalací. Dva agenti nemění setup současně.

## Návrat zpátky

- **Přes git** (upgrade byl jeden commit): `git revert <hash>`. Nic se nemaže, vznikne nový commit s původním stavem. Soubory, které starý `.gitignore` ignoroval (u V.03 `skills/spline-3d/examples/*` a `skills/time-tracking-dashboard/assets/dashboard-template.jsx`), revert z disku odebere; vrať je ze zálohy z kroku 1.
- **Jen pravidla:** `CLAUDE.md` vrať z `.ai-os-upgrades/<id>/backup/CLAUDE.md` (přesunem). Claude Code pak čte zase jen `CLAUDE.md`. U V.03 leží vedle i původní průvodce (`backup/AGENTS.md`); vrať ho na místo `AGENTS.md`, až když chceš zpátky celou V.03.
- **Přes zálohu** (funguje vždycky): zavři session, upgradovanou složku přejmenuj na `<WORKSPACE>-po-upgradu` a zálohu přejmenuj **přesně** na původní jméno workspace (kvůli paměti). Když se měnila paměť agenta, vrať ji ze `_pamet-agenta/`.

## Časté otázky

- **Mám V.04 nebo V.04.1.** Postup je stejný, otisk `V04.json` nebo `V041.json`. Pravidla vyjdou jako `convert` + `keep`.
- **Pracuju v Codexu, Cursoru nebo Antigravity.** Postup je stejný. Hooky Claude Code tam neběží; doctor zkontroluje ústavu a konfiguraci. Hlídač tajemství (git pre-commit, zapnutý v kroku 5, bod 3) funguje i tam, protože ho spouští git při každém commitu. `AGENTS.md` tyhle appky četly vždycky.
- **Upravil jsem si páteř hodně.** Nevadí: u každého takového souboru uvidíš rozdíl a vybereš. Když si nejsi jistý, nech svoji verzi.

Technické detaily nástroje (stavy, receipt, odolnost proti výpadku): [UPGRADE.md](UPGRADE.md).

## Stav

Postup pro kit 4.4, aktualizováno 12. 11. 2026 (původně 17. 10. 2026 pro kit 4.3). Přesnou distribuční verzi a soubory určuje `release-manifest.json` v NOVÉ; tento návod nedokládá zveřejnění releasu. Převod pravidel, rozsah upgradu a otisky V.03 až V.04.1 i Kitu 4.3 hlídají automatické testy ve vývojovém repu; do ZIPu se nebalí.

## SAMOSTATNÉ DISTRIBUCE OD RC21

AI OS Kit 4.4 se dodává samostatně bez instalačního payloadu Dashboardu. Upgrade prováděj z manifestu KIT balíku. Případná historická volba `--scope all` nepřidá nic, co v tomto manifestu není; Dashboard má svůj druhý ZIP a instalátor. Oba rozbalené balíky udržuj odděleně a osobní workspace zachovej. Po dokončení celého kitu naváže [předávka](PREDANI-DASHBOARDU.md) a ověřený START ze samostatné Dashboard distribuce. Starší vlastní runtime a zákaznické soubory automaticky nemaž.
