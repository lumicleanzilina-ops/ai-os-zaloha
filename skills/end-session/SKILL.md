---
name: end-session
description: >
  Ukonči session — shrň, co se stalo, ulož memories a všechno zaloguj.
  VŽDY použij, když uživatel napíše /end — bez výjimky.
---

# /end — Session Log & uzavření

## Spouštěče
- `/end`
- `/end-session`

---

## Krok 1: Projdi session

Projdi celou konverzaci a identifikuj:

- **Provedené akce** — co se reálně udělalo (soubory, commity, MCP akce, deploye...)
- **Rozhodnutí** — co se rozhodlo a proč
- **Learningy / uživatelské korekce** — co uživatel opravil nebo upřesnil
- **Otevřené položky** — co zůstalo nevyřešené

---

## Krok 2: Ulož memories

Zkontroluj existující index memories a ulož/aktualizuj potřebné memories:

- **feedback** — korekce a potvrzené postupy z téhle session
- **project** — rozdělaná práce, cíle, deadliny, kontext pro další session
- **user** — nové poznatky o uživatelových preferencích nebo workflow
- **reference** — nástroje, systémy, repozitáře zmíněné v session

Pravidla:
- Žádné duplicity — aktualizuj existující memories, nevytvářej duplicity
- Neukládej věci odvoditelné z kódu nebo git historie
- Převeď relativní data na absolutní
- U feedback a project memories přidej **Why:** a **How to apply:**

---

## Krok 3: Vytvoř shrnutí session

Napiš markdown log v tomhle **přesném formátu**:

```markdown
# Session Log — YYYY-MM-DD HH:MM

## Topic
[Jedna věta — o čem tahle session byla]

## Context
[Proč session vznikla, co uživatel potřeboval]

## Actions taken
- [Každá akce jako bullet — co se UDĚLALO, ne co se ŘEKLO]
- [Konkrétně: "Vytvořen soubor X", "Odeslána připomínka pro Y", "Přesunuty projekty do Z"]

## Key decisions
- [Provedená rozhodnutí a jejich důvody]

## Files created/modified
- `path/to/file.md` — co se změnilo

## MCP actions
- [Jaké MCP nástroje se použily a na co]

## Learnings / User corrections
- [Pokud uživatel něco opravil nebo dal feedback — zaznamenej to]

## Open items / Next steps
- [Co zůstalo nevyřešené nebo by se mělo udělat příště]

## Git commits in this session
- [Hash + zpráva každého commitu, nebo "none"]
```

**Jedna session = jeden soubor.** Hook `zaznam-session` zakládá záznam každé session sám
(`YYYY-MM-DD-auto-<id8>.md`, `stav: automaticky-zaznam`) a cestu k němu ti řekne na startu session.
Leží v `session-logs/` vaultu druhého mozku (`SECOND_BRAIN_VAULT`), když je nastavený, jinak
v `docs/session-logs/`. Když ten soubor existuje, **doplň shrnutí do něj**: sekce, které tam zapsal hook
(Zadání, Soubory, Commity), ponech; hookové sekce Soubory a Commity nahrazují „Files created/modified“ a „Git commits in this session“, nezakládej je podruhé. Dopiš chybějící sekce z formátu výš a ve frontmatteru přepni
`stav: automaticky-zaznam` na `stav: zapsano`. Hook pak soubor už nepřepíše.

**Když sessions ukládá Dashboard**, záznam v `session-logs/` kitu nehledej: na startu session ti hook napsal „Záznam této session vede Dashboard; hook kitu ho nezapisuje.“ a záznam vede Dashboard sám do `session-logs/desktop/<zdroj>-<hash>.md` ve svém vaultu. Vlastní ho jeho writer, takže: **do něj nepiš** (ruční úprava zastaví jeho další zápis a doctor Dashboardu ohlásí `canonical-conflict`), **druhý záznam `YYYY-MM-DD-<tema>.md` ani jiný soubor session nezakládej** a **Krok 4 přeskoč** (řádek do `log.md` připíše uzavření dne ze záznamu Dashboardu). Shrnutí z kroku 1 řekni v kroku 5 jen v chatu; trvalé věci ulož jinam: memories (krok 2), learningy a otevřené body v `docs/otevrene-body.md`.

Když automatický záznam není (hook vypnutý, jiný hostitel), ulož do téže složky záznamů
(`session-logs/` vaultu, bez vaultu `docs/session-logs/`) jako `YYYY-MM-DD-<tema>.md`. Existuje-li soubor stejného jména z **této** session,
aktualizuj ho; je-li z jiné session, zvol přesnější téma. Nikdy nezakládej `-2`, `-3` pro tutéž session.
Otevřené body s vlastníkem a termínem zapiš do `docs/otevrene-body.md`, ne jen do logu.

---

## Krok 4: Zařaď session log do second brainu (pokud je zapnutý)

> Sessions ukládá Dashboard (viz Krok 3)? Tenhle krok přeskoč: záznam vede Dashboard a do `log.md` ho zařadí uzavření dne.

Pokud uživatel nastavil modul **second brain**, patří session log do něj, ať se nabaluje se
zbytkem jeho znalostí (viz `modules/second-brain/`).

- **Lokální vault (Tolaria / Obsidian / prostý markdown):** záznam už leží rovnou v `session-logs/`
  vaultu, protože ho tam zapisuje hook (jeden soubor na session, žádná kopie). Doplň ten soubor
  a nic nekopíruj. Když automatický záznam není a vault je nastavený, napiš log přímo do
  `session-logs/` vaultu jako poznámku `SessionLog`, ne do `docs/session-logs/`. Pak na KONEC `log.md`
  vaultu připoj jednořádkový záznam `## [RRRR-MM-DD] session | <téma>`; nejdřív vyhledej jméno
  souboru v `log.md`, a když tam už je (zapsalo ho uzavření dne), nepřidávej ho znovu.
  Filesystem je source of truth — prostý `Write` stačí.
- **Notion:** vytvoř stránku v uživatelově session-log databázi přes Notion MCP.
- **Žádný second brain nastavený:** nech log v `docs/session-logs/` (Krok 3) a jednou za session
  zmiň: *"Tyhle logy můžeš nabalovat do second brainu — mám ti nějaký nastavit?"*
  (viz `modules/second-brain/README.md`). Nenaléhej, když odmítne.

> Poznámka: NotebookLM **není** second brain — pokud má uživatel jeho MCP, je na deep
> research, ne na session logy. Netlač tam logy.

---

## Krok 5: Potvrzení

Řekni uživateli:
- Kolik memories se uložilo/aktualizovalo
- Že se vytvořil session log (a kam se zařadil; u Dashboardu že session zapisuje on a kit nic nezakládá)
- Otevřené položky pro příští session

Zakonči: **"Díky za session."**

---

## Pravidla logování

- **Buď vyčerpávající** — zaznamenej VŠECHNO, co se v session stalo
- **Akce > konverzace** — zaznamenej, co se UDĚLALO, ne jen co se řeklo
- **Konkrétní cesty a hodnoty** — ne "upraven soubor", ale "upraven AGENTS.md řádky 9-20"
- **MCP akce explicitně** — s názvem nástroje, parametry, výsledkem
