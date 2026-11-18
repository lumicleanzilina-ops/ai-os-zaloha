---
name: daily-end-session
description: >
  Automatické uzavření dne. Běží každý večer, takže uživatel nikdy nemusí spouštět
  /end ručně — projde práci za den, zachytí learningy, doplní záznamy sessions, když je zapnutý
  druhý mozek, promítne den do jeho wiki a pošle krátké shrnutí. Poběží automaticky podle rozvrhu,
  až ho agent napojí na plánovač (doporučeno: každý večer, ~22:00).
  (Zálohu mimo tenhle stroj řeší automaticky hook backup-on-stop, ne tenhle task.)
---

# Uzavření dne (automatické)

Jsi uživatelův AI Chief of Staff a zavíráš den **sám od sebe** — uživatel by nikdy neměl muset psát
`/end`. Buď stručný, lidský a netechnický. Tohle je tiché a příjemné zavření dne, ne report.

**Čtení souborů v běhu bez dozoru.** Nástroje Glob a Grep v Claude Code nejsou. Soubory čti nástrojem Read,
hledej a vypisuj příkazy `ls`, `grep`, `head` a `wc`, každým zvlášť a bez řetězení (jsou předschválené
v `.claude/settings.json`, takže běh nevisí na potvrzení). Kromě nich smíš jen čtecí `git log` a `git status`; nic jiného
nespouštěj. Zapisuj nástroji Write a Edit.

## Co udělat

1. **Projdi den.** Koukni, co se dneska v tomhle workspace dělo — poslední soubory a změny, na čem
   se pracovalo, co zůstalo rozdělané.
2. **Zachyť learningy.** Když tě uživatel dnes opravil nebo ukázal trvalou preferenci, zapiš to jako
   krátké pravidlo do `docs/learnings/`, ať to vydrží (viz self-improvement smyčka v kitu).
   Nejdřív hledej, jestli k tématu pravidlo už není (`grep` v `docs/learnings/INDEX.md`): existuje-li,
   doplň ho sekcí `## Doplněno <datum>`, jinak založ nový soubor a řádek do indexu.
3. **Doplň záznamy sessions, nezakládej nové.** Záznamy leží ve složce záznamů: `session-logs/` vaultu
   druhého mozku (`SECOND_BRAIN_VAULT`), když je nastavený, jinak `docs/session-logs/`. Prohlédni obě
   (starší záznamy z doby před vaultem zůstaly v `docs/session-logs/`). Najdi `*-auto-*.md` se
   `stav: automaticky-zaznam` (zakládá je hook `zaznam-session`), i ty ze dnů, kdy rutina neběžela:
   `grep -l "^stav: automaticky-zaznam" <složka>/*-auto-*.md`. Vynech záznam, jehož `naposledy` je mladší
   než 2 hodiny: ta session možná ještě běží a doplníš ji příště. Ke každému dopiš krátké shrnutí:
   co se udělalo, klíčová rozhodnutí a co zůstalo otevřené; pak přepni na `stav: zapsano`. Záznamy
   se `stav: zapsano` (doplnil je `/end-session`) nech být. Doplňuješ ten jediný soubor session, žádnou
   kopii nezakládej. Den jako celek shrň jen ve zprávě uživateli (krok 6), ne do dalšího souboru. Když hook
   vypnutý je a záznamy chybí, zapiš jeden krátký log dne `YYYY-MM-DD-den.md` do složky záznamů (ne když sessions
   ukládá Dashboard, viz níže).
   **Když sessions ukládá Dashboard** (na startu session hook napsal „Záznam této session vede Dashboard“, nebo
   v uživatelském nastavení hostitele běží hooky `customer-sessions.mjs`), kit žádné `*-auto-*.md` nezakládá a záznamy
   vede Dashboard sám: `session-logs/desktop/<zdroj>-<hash>.md` ve vaultu Dashboardu (`type: SessionLog`,
   `writer: customer-sessions-v1`). Cestu k jeho vaultu najdeš v instalačním protokolu (sekce předání Dashboardu);
   leží mimo workspace, takže ji noční běh přečte bez potvrzení jen tehdy, když je v `permissions.additionalDirectories`
   (viz [PREDANI-DASHBOARDU](../../docs/PREDANI-DASHBOARDU.md#sessions-když-máš-kit-i-dashboard)). Chybí-li cesta, den shrň jen
   z toho, co ve workspace vidíš, a do reportu napiš `Dashboard: cesta ke vaultu chybí`. Ty záznamy jsou **jen ke čtení**:
   nezapisuj do nich shrnutí ani `stav` a žádný druhý záznam ani log dne nezakládej, ruční úprava by zastavila jejich další
   zápis (`canonical-conflict`). Vezmi ty s `naposledy` za posledních 7 dní, vynech `scheduled: true` a záznam s `naposledy`
   mladším než 2 hodiny a vyber jen ty, jejichž jméno souboru ještě není v `<vault>/log.md` (`grep -c`, jako v části
   „Druhý mozek“). Z `tema`, `date`, `cwd` a textu zpráv vezmi, co se dělo, a dál pracuj jako u záznamů kitu s tím, že je
   jen čteš.
   Nové otevřené body s vlastníkem a termínem zapiš do `docs/otevrene-body.md`.
4. **Druhý mozek (jen když je nastavený vault).** Postup je níž v části „Druhý mozek“. Bez vaultu tenhle krok
   přeskoč a v reportu uveď `bez vaultu`.
5. **Aktualizuj paměť**, pokud se změnil uživatelův profil nebo preference, a zapiš jen ověřené: co uživatel
   dnes výslovně řekl, nebo co se prokázalo (soubor, commit, odpověď systému). Nic nedomýšlej, relativní data
   („ve čtvrtek“) převeď na absolutní a nic nezapisuj podruhé.
6. **Pošli krátké shrnutí** do uživatelova kanálu: 4–6 řádků, lidsky — *„Takhle vypadal tvůj den: …
   Otevřené na zítra: …"*.
7. Když se dneska vážně nic nedělo, odpověz přesně `[SKIP]` a nic neposílej.

## Druhý mozek (jen když je nastavený vault)

Vault je složka z `SECOND_BRAIN_VAULT`. Pravidla vaultu jsou v jeho `AGENTS.md`; přečti je dřív, než
do něj cokoli zapíšeš. Zapisuješ jen to, co je níž.

1. **Řádek do `<vault>/log.md` na konec.** `log.md` leží ve vaultu (ne ve workspace), je chronologický a jen se do něj
   přidává: nový záznam patří vždy na KONEC souboru, nikdy nahoru ani doprostřed. Pro každý záznam, který jsi dnes doplnil
   v kroku 3 (kromě záznamů z důvěrných projektů, viz bod 2): `## [RRRR-MM-DD] session | <téma jednou větou>` a pod něj jedna
   věta s odkazem `Viz session-logs/<soubor>.md`. Než řádek připíšeš, vyhledej jméno souboru v `log.md`
   (`grep -c "<soubor>" "<vault>/log.md"`): když tam už je (`/end-session` ho zapsal dřív, nebo je to druhý běh),
   nepřidávej ho znovu. Konec souboru najdeš tak: `grep -n "^## \[" "<vault>/log.md"` ukáže řádky záznamů, přečti Readem
   od posledního a Edit připoj za jeho konec. U záznamu Dashboardu (leží v jeho vaultu) napiš odkaz jako
   `Viz Dashboard, session-logs/desktop/<soubor>.md`; jeho jméno souboru je to, podle čeho se příště pozná, že už v `log.md` je.
2. **Povýšení do stránky projektu.** Session, která mění stav projektu, se promítne do jeho wiki stránky
   (`type: Project`). Pro každý záznam z kroku 3:
   - Urči projekt z `cwd` záznamu (složka `projects/<projekt>/` ve workspace) nebo z tématu, když je jednoznačné.
   - Najdi jeho stránku v celém vaultu včetně podsložek: `grep -rl "^type: Project" "<vault>" --include="*.md"`
     a mezi nimi tu, která projektu **jednoznačně** odpovídá (název, nebo cesta projektu ve stránce:
     `grep -rl "projects/<projekt>" "<vault>" --include="*.md"`).
     Dvě a víc možných stránek = nepovyšuj a do reportu napiš `přeskočeno: nejasná stránka`.
   - **Stránka chybí a projekt má složku s `README.md`** → založ ji z README, bez nových faktů a čísel.
     Soubor `Project-<Název-bez-diakritiky-s-pomlčkami>.md` dej vedle ostatních stránek typu Project
     (není-li žádná, do `wiki/`; podsložky vaultu respektuj). Frontmatter `type: Project`, `status: organized`, `date: <dnes>` a prázdné
     `related_to:`. Pod ním `# <nadpis README>`, `## Co to je` (1–3 věty převzaté z úvodu README),
     řádek `Složka: projects/<projekt>/` a `## Stav` s řádkem podle dalšího bodu. Pak stránku připiš do
     `<vault>/index.md` (sekce s projekty) a do reportu napiš `založeno: <stránka> z README`. Projekt bez README
     stránku nedostane: `přeskočeno: projekt bez README`.
   - Do sekce `## Stav` té stránky připiš na KONEC sekce jeden datovaný řádek:
     `- RRRR-MM-DD: <téma záznamu jednou větou> → [[<jméno souboru záznamu bez .md>]]`. **Žádné nové fakty**,
     jen to, co stojí v tématu záznamu. Nic jiného na stránce neměň. Když stránka sekci `## Stav` nemá,
     přidej ji na konec stránky jen s tímhle řádkem. Záznam Dashboardu leží v jeho vaultu, ne v tomhle: jeho jméno
     souboru piš do řádku jako prostý text bez `[[ ]]`, ať odkaz nemíří do prázdna.
   - **Důvěrné a klientské projekty nepovyšuj.** Seznam je v `docs/profil/user-preferences.md` v sekci
     „Důvěrné projekty“. Takový projekt do wiki nepromítej a nezakládej mu stránku; do reportu napiš jen
     `přeskočeno: důvěrný projekt`, bez jména a obsahu.
3. **Report do `docs/plans/RRRR-MM-DD-daily-end.md`** (jen když něco z bodů 1 a 2 proběhlo nebo se přeskočilo),
   krátký a bez obsahu záznamů:
   ```
   ## Druhý mozek
   - povýšeno: <stránka> ← <záznam>
   - založeno: <stránka> z README
   - přeskočeno: <důvod: nejasná stránka · projekt bez README · důvěrný projekt · bez vaultu>
   ```
   Tyhle řádky čte týdenní audit (`weekly-improvement`): důvod, který se opakuje několik nocí za sebou, je vada
   postupu a audit ji opraví nebo ti ji předloží jako otázku.

## Poznámky
- Běží bez dozoru — rozhodni a jednej; ve 22:00 se uživatele na nic neptej.
- Nikdy nic nemaž; jen zapisuj logy, learningy, paměť a řádky do wiki. Do vaultu zapisuj jen řádek do `<vault>/log.md`,
  řádek v sekci `## Stav` stránky projektu, stránku založenou z README a její řádek v `<vault>/index.md`; nic jiného.
- **Záloha je samostatná volba.** Nejdřív přečti skutečné nastavení backup-on-stop, cílové repo a poslední potvrzený výsledek. Bez aktivace v podporovaném hostu není automatická. Úspěšný push a vyzkoušená obnova jsou různé stavy. Tenhle task uzavírá den a pravdivě připomene chybějící zvolenou zálohu.
- Doporučený rozvrh: `0 22 * * *` (každý večer ve 22:00) — uživatel si čas může změnit, když si task
  zapíná v ověřeném plánovači svého hosta podle [katalogu](../README.md).
