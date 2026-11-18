---
name: weekly-improvement
description: >
  Týdenní self-improvement audit — projde ústavu AGENTS.md, learningy, skilly (včetně
  úklidu podle reálného používání), paměť, druhý mozek, historii gitu a poslední session a pak
  navrhne nejdůležitější zlepšení jako uložený plán. Návrh, který se objeví potřetí, už jen neopakuje:
  provede ho, zruší, nebo ho předloží jako ano/ne. Poběží automaticky podle rozvrhu, až ho agent napojí
  na plánovač (doporučeno: každé pondělí ráno).
---

# Týdenní zlepšovací audit

Jsi uživatelův AI Chief of Staff. Udělej týdenní self-improvement audit celého systému.
Cíl: najít, kde to drhne, převést to na konkrétní změny a nechat systém měřitelně lepší
než minulý týden.

## Krok 0 — bezpečnost v gitu (důležité, když workspace repo existuje)
Ve stejném repu můžou zároveň pracovat jiné session nebo scheduled tasky.
- Nikdy nespouštěj `git checkout`, `git reset`, `git stash`, `git clean` ani neměň branch.
  Pracuj na tom, co je zrovna checknuté.
- Nikdy `git add -A` / `git add .` — stageuj jen konkrétní soubory, které jsi vytvořil.
- Každý výstupní soubor (plán, learning) commitni **hned po zápisu**, ne až na konci běhu.
- Cizí necommitnuté změny nech být.
- Když commit selže (např. `index.lock` od paralelního tasku), počkej ~30 s a zkus to
  ještě jednou. Když to pořád nejde, nech soubor na disku a selhání zmiň v reportu.

## Krok 0b — registr a opakované návrhy (nejdřív, před čímkoli dalším)
Bez tohohle kroku audit týdny opakuje stejné návrhy a nikdo je neprovede.

1. Přečti `docs/otevrene-body.md`, jediný registr otevřených bodů.
2. Přečti sekci „Top 3 návrhy“ ze tří posledních `docs/plans/*-weekly-improvement.md` (`ls docs/plans` a Read;
   chybí-li Top 3, vezmi jejich top friction pointy).
3. Sestav tabulku „Opakované návrhy“: návrh · v kterých auditech (data) · O-ID v registru · kolikátý výskyt.
4. **Návrh, který by se teď objevil potřetí** (byl v obou předchozích, nebo ve dvou ze tří), nesmí jít znovu do
   Top 3 jako návrh. Udělej s ním jedno ze tří:
   - **proveď ho**, když je bezpečný a nemění chování sessions: oprava dokumentace, řádek v indexu, README, zápis
     do registru. Commitni a do registru dej `hotovo` s důkazem;
   - **zruš ho s důvodem**, když už neplatí nebo ho překonalo jiné řešení: do registru `zrušeno — <důvod>`;
   - **polož ho uživateli jako ano/ne s termínem**, když mění chování sessions (hook, nastavení, ústava, rutina,
     mazání, cokoli v cizím systému): „O-0NN · ANO/NE: <jedna věta, co se stane při ANO> · do <datum>“,
     do registru `čeká na uživatele`.
5. Každý nový návrh tohoto auditu dostane v registru O-ID (vlastník, další krok, termín). Návrh bez O-ID v plánu být nesmí.
6. Do plánu (sekce „Delta registru“) napiš jen změny: nová O-ID, změny stavu, zrušené, ano/ne pro uživatele. Obsah bodů neopisuj.

Čtení souborů v běhu bez dozoru: nástroje Glob a Grep v Claude Code nejsou. Čti nástrojem Read, hledej a vypisuj
příkazy `ls`, `grep`, `head` a `wc`, každým zvlášť a bez řetězení (jsou předschválené v `.claude/settings.json`).

## Kroky

### 1. Projdi ústavu AGENTS.md
- Přečti ústavu v AGENTS.md.
- Je tam něco zastaralého, protichůdného nebo chybějícího? Sedí to pořád na to, jak
  uživatel reálně pracuje?
- **Zkontroluj, že ústava je jen jedna:** v kořeni workspace ani nad ním nesmí ležet `CLAUDE.md`,
  `CLAUDE.local.md` ani `.claude/CLAUDE.md`. Claude Code by kvůli nim `AGENTS.md` přeskočil a jel
  podle jiných pravidel, i když všechno *vypadá* v pořádku. Rychle to ověří `node tools/doctor.mjs`
  (kontrola `constitution-agents-md`). Když tam takový soubor je, obsah navrhni sloučit do
  `AGENTS.md`, soubor po souhlasu přesuň do zálohy (nemaž) a zmiň to v reportu.

### 2. Projdi learningy
- Přečti každý soubor v `docs/learnings/` — to jsou uživatelova vlastní pravidla.
- **Zkontroluj i dodávaný `docs/playbook/`:** neodporuje si už nějaké tovární pravidlo s tím, jak
  tenhle uživatel reálně pracuje? Řekni to a nabídni, že ho upravíš nebo smažeš. Playbook je
  výchozí pozice, ne zákon — pravidlo, které uživatel pořád obchází, má zmizet, ne ho každý týden
  otravovat.
- **Porovnej `INDEX.md` s obsahem složky:** každý learning musí mít řádek a každý řádek musí
  ukazovat na existující soubor. Learning bez řádku se nedá najít, takže neexistuje; řádek
  mířící na smazaný soubor bere důvěru celému indexu.
- **Znovu si přečti řádky indexu u learningů, které se tenhle týden změnily** — nezneplatnil nový
  obsah jejich jednořádkové shrnutí? To shrnutí se načítá do každé session; zastaralé slovo o stavu
  je nejdražší lež v systému.
- Hledej opakující se vzorce. Dá se z několika jednorázových korekcí udělat jedno pravidlo?
  Není už něco přežité?

### 3. Projdi skilly
- Projdi `skills/`. Jsou vnitřně konzistentní? Sedí cesty a odkazy?
- Nechybí skill na workflow, který uživatel pořád dokola dělá ručně?

### 3b. Kurátor dovedností

Postupuj podle [skills/CURATOR.md](../../skills/CURATOR.md). Události Skill nepokrývají přímé čtení SKILL.md ani všechny hosty; chybějící použití znamená neznámé využití. Záznamy stáří použij jen pro doporučení. Bez výslovného výběru uživatele nearchivuj ani agentem vytvořený skill. Navrhni konkrétní kandidáty, vysvětli nejistotu a nabídni vratný přesun; neslučuj ani nepřepisuj uživatelské dovednosti.

### 4. Projdi paměť
- Zkontroluj soubory s pamětí. Není tam něco zastaralého, duplicitního nebo v rozporu
  s aktuálním stavem?
- Drobnosti oprav rovnou. Větší věci navrhni.

### 4b. Projdi otevřené body a nápady
- Přečti `docs/otevrene-body.md` a nápady (úkolový nástroj podle `docs/profil/user-systems.md`, jinak `docs/napady.md`).
  Metoda je v [PRIORITIZACE](../../docs/PRIORITIZACE.md).
- Bod bez změny déle než 7 dní polož uživateli v plánu zlepšení **jednou** jako otázku ano/ne
  a do sloupce Důkaz / poznámka připiš, kdy ses ptal; podruhé se na tentýž bod neptej.
- Navrhni, co zavřít jako `zrušeno` (ztratilo smysl), a připomeň důležité body bez termínu.
  Nic sám nemaž ani nezavírej; hotové jen s důkazem.

### 4c. Údržba druhého mozku (jen když je nastavený vault `SECOND_BRAIN_VAULT`)
Strukturální hygienu (rozbité wikilinky, osiřelé stránky, rozjetý index) průběžně hlídá
[`brain-sync.py`](../../modules/second-brain/brain-sync.py) po každé session. Tenhle krok dělá to, co skript neumí: sémantiku.

1. **Začni flagem.** Přečti `<vault>/.needs-lint` (existuje-li; zapisuje ho `brain-sync.py`) a vyřeš položky z něj.
   Flag nemaž: až drift zmizí, `brain-sync.py` ho při dalším běhu sám archivuje do `.ai-os-hygiene/`.
2. **Kontradikce a zastaralá tvrzení OPRAV, nejen nahlas.** Nález nejdřív sám ověř: najdi stránku i novější zdroj
   (záznam session, learning, živý systém) čtením a `grep`. Když novější zdroj jednoznačně platí, starší tvrzení
   ve stránce přepiš a pod něj připiš `> Opraveno <datum>: <co bylo> → <co platí> (zdroj: [[…]] nebo cesta)`;
   do `log.md` na konec jeden řádek. Neověřitelné nebo sporné neopravuj: polož uživateli jako ano/ne do
   `docs/otevrene-body.md`, ne do dalšího reportu. Pouhé hlášení by přenášelo stejné rozpory z týdne na týden.
3. **Opakované „přeskočeno“ v nočních reportech je vada.** `grep -h "přeskočeno" docs/plans/*-daily-end.md` za
   posledních 7 dní: důvod, který se opakuje 3 a víc nocí (typicky „nejasná stránka“, „projekt bez README“),
   oprav (chybějící stránku projektu založ podle části „Druhý mozek“ v [`daily-end-session`](../daily-end-session/SKILL.md))
   nebo ho předlož uživateli jako ano/ne. Jinak wiki stojí, aniž by si toho kdo všiml. „Důvěrný projekt“ vada není,
   to je volba uživatele.
4. **Mezery.** Pojmy zmíněné v textu bez vlastní stránky, stránky bez křížových odkazů a díry v datech: drobnosti
   doplň rovnou, větší navrhni jako otázky nebo zdroje k přečtení.

### 5. Revize historie gitu
- Koukni na `git log` za poslední týden. Co se změnilo? Jaký je trend? Jaký typ práce
  převažuje — a není něco z toho dost opakující se na to, aby se to zautomatizovalo?

### 6. Retrospektiva konverzací (klíčový krok)
Projdi session od posledního auditu a vytěž z nich zlepšení.

**Jak na to:**
1. Najdi datum předchozího auditu (nejnovější `*-weekly-improvement.md` v `docs/plans/`
   před dneškem).
2. Když je k dispozici historie session (např. přes MCP na správu session), vypiš session
   od toho data a stáhni jejich přepisy. U velké dávky rozděl práci mezi subagenty
   (pár paralelně), každý vrátí krátké strukturované shrnutí.
3. Když historie session k dispozici není, vycházej z historie gitu a aktuálního stavu repa.

**Co hledat:**
- **Friction pointy** — kde tě uživatel musel opravovat, opakovat instrukce nebo přepínat
  kontext.
- **Pomalé cesty** — co zabralo zbytečně moc kroků nebo kol.
- **Chybějící kontext** — kde jsi nevěděl něco, co jsi vědět měl (z AGENTS.md / learningů /
  napojeného nástroje).
- **Ruční obcházení** — co uživatel dělal rukou a dalo by se to zautomatizovat.
- **Opakující se dotazy** — co se ptá pořád dokola, signalizuje díru v dokumentaci nebo learningu.
- **Signály zpětné vazby** — „takhle ne", „stop", „vždycky to dělej takhle", „zase…".
- **Výhry** — co fungovalo nečekaně dobře a mělo by se zachytit jako opakovatelný postup.

**Výstup retrospektivy:**
- Top 5 friction pointů seřazených podle frekvence × dopad.
- Ke každému konkrétní fix — nový learning, úprava AGENTS.md, nový skill, nová MCP
  integrace nebo hook. Dávej přednost systémovým řešením (hook / skill / pravidlo) před
  „AI si to zapamatuje".
- Hrubý odhad, kolik času týdně to ušetří, až se to zavede.

### 6b. Zdroje čísel (`docs/GROUND-TRUTH.md`)
Dalo od minulého auditu nějaké číslo práci dohledat: dva systémy říkaly něco jiného, nebylo jasné, odkud se hodnota
bere, nebo ji uživatel opravil? Přidej do [`docs/GROUND-TRUTH.md`](../../docs/GROUND-TRUTH.md) řádek (údaj, kanonický
zdroj, jak ho ověřit). Zdroj nehádej: nevíš-li, který systém je kanonický, polož uživateli v plánu jednu otázku.
U stávajících řádků zkontroluj, jestli uvedený zdroj pořád platí.

### 7. Napiš plán zlepšení (povinné — bez něj audit není hotový)
Vytvoř `docs/plans/YYYY-MM-DD-weekly-improvement.md` a dej do něj:
- Skóre systému (1–10) s jednořádkovým zdůvodněním.
- **Delta registru** (z kroku 0b): nová O-ID, změny stavu, zrušené s důvodem, provedené s důkazem, ano/ne pro uživatele.
- **Opakované návrhy** (z kroku 0b): co se objevilo potřetí a co se s tím stalo (provedeno, zrušeno, ano/ne).
- Stav úkolů z minulého auditu (tabulka hotovo / nehotovo / částečně).
- **Retrospektiva konverzací** — top 5 friction pointů + fixy z kroku 6.
- **Skill Curator** — co se archivovalo (s cestami), co je označené jako nepoužívané, zadržení
  kandidáti na archivaci a navržená sloučení z kroku 3b (nebo „tenhle týden nic").
- Top 3 návrhy na zlepšení seřazené podle dopadu, každý s konkrétními kroky a O-ID z registru. Návrh, který takhle
  napsat nejde (chybí konkrétní krok nebo O-ID), je postřeh a patří do retrospektivy.
- Co funguje dobře a nemá se měnit.

Tenhle soubor commitni hned po zápisu (viz krok 0).

### 8. Aktualizuj docs/learnings/
Když jsi objevil nové vzorce, sepiš je jako learningy, ať přežijí do dalších session.

### 9. Ověř, že plán existuje a je commitnutý (finální kontrola)
Nejčastější způsob selhání je dodělat analýzu a plán nikdy neuložit. Ověř, že soubor je na
disku **a** je commitnutý. Necommitnutý plán se rovná žádnému plánu — ztratí se. Když chybí,
napiš ho znovu; když je untracked, commitni ho teď. Tohle je definice „hotovo".

## Output
Krátký report pro uživatele: skóre systému, top 3 návrhy a drobné opravy, které jsi rovnou
udělal — plus cesta k uloženému plánu.
