# AGENTS.md — druhý mozek [tvůj-vault]

> Kanonický soubor s pravidly pro každého AI agenta, který v tomhle vaultu pracuje.
> Prohlížeč markdown wiki (Obsidian, Tolaria, …) si odsud načítá konvence.
> Čte ho Claude Code, Codex, Cursor i Antigravity. `CLAUDE.md` do vaultu nezakládej: Claude Code by pak
> četl jen ten a tenhle soubor by přeskočil.

## Co tenhle vault je

**[tvůj-vault]** je druhý mozek — nabalující se doménová znalost pro [tvoje-jméno].
Postavený na patternu **LLM Wiki** (Andrej Karpathy) plus typovaném modelu entit (typy + vztahy).

Princip: znalost se **nehromadí v chatu**. Jednou se **zkompiluje do wiki** a drží se aktuální.
Wiki píšeš a udržuješ ty (AI agent). Člověk vybírá zdroje, ptá se a rozhoduje.

## Tři vrstvy

1. **`raw/`** — neměnné zdrojové dokumenty (články, PDF, přepisy). Čti z nich,
   **NIKDY je needituj**.
2. **`wiki/` a poznámky v rootu** — stránky generované modelem (souhrny, entity, koncepty).
   Tahle vrstva je tvoje.
3. **`AGENTS.md`** (tenhle soubor) — schéma, konvence, postupy.

## Struktura

```
[tvůj-vault]/
├── AGENTS.md              # tenhle soubor (kanonický)
├── README.md
├── index.md               # KATALOG všech stránek wiki (při každém dotazu čti první)
├── log.md                 # chronologický log, jen se přidává (ingest/dotaz/lint)
├── raw/                   # neměnné zdroje — nikdy needituj
├── wiki/
│   ├── [doména-a]/        # např. nástroje, modely, trendy
│   ├── [doména-b]/        # např. klienti / znalost sektoru
│   ├── [doména-c]/        # např. obsah: co funguje
│   └── [doména-d]/        # např. prodej / ceny / konkurence
├── attachments/           # obrázky, PDF
└── session-logs/          # záznamy session (hook zaznam-session je sem zapisuje, jeden soubor na session)
```

## Typy

Prohlížeč odvozuje typ entity z pole `type:` ve frontmatteru, NE ze složky.

| Typ          | Na co                                                      |
| ------------ | ---------------------------------------------------------- |
| `Source`     | Jeden souhrn na každý zpracovaný zdroj (článek, video, PDF) |
| `Topic`      | Téma nebo koncept, který slučuje znalost napříč zdroji      |
| `Tool`       | Produkt, služba nebo software                               |
| `Person`     | Klient, partner, konkurent nebo veřejně známá osoba         |
| `Project`    | Klientský nebo interní projekt                              |
| `SessionLog` | Záznam pracovní session (zakládá ho hook, doplňuje /end-session) |

## Vztahy (ve frontmatteru, jako wikilinky)

- `belongs_to` — hlavní příslušnost nebo kontext, např. `[[Topic-AI-Agenti]]`
- `related_to` — volnější boční vazba
- Vlastní pole — použij, když chceš označit zdroj konkrétního tvrzení

Opačné odkazy (`has`) si prohlížeč umí dopočítat; ty zapisuješ jen jeden směr.

## Konvence frontmatteru

```yaml
---
type: Source
status: organized        # captured | organized | archived
date: RRRR-MM-DD
url: https://...
source_count: 1
belongs_to:
  - "[[Topic-Priklad]]"
related_to:
  - "[[Tool-Priklad]]"
---
```

## OPERACE

### 1. Ingest (přidání zdroje)

Když člověk hodí zdroj do `raw/` nebo pošle odkaz:

1. Přečti zdroj.
2. Když je u toho, potvrď si s ním klíčové poznatky.
3. Založ stránku `Source` se souhrnem (v rootu nebo ve `wiki/` podle domény).
4. **Zapoj to** do existujících stránek `Topic` / `Tool` / `Person` — aktualizuj, neduplikuj.
5. Označ rozpory s tím, co už je zapsané (přidej poznámku; nikdy nepřepisuj potichu).
6. Aktualizuj `index.md` (přidej stránku do katalogu).
7. Připiš řádek do `log.md`.

Jeden zdroj se může dotknout deseti až patnácti stránek. To je správně.

### 2. Dotaz (ptát se wiki)

1. Přečti `index.md` → najdi relevantní stránky.
2. Zavrtej se do nich a syntetizuj odpověď **s citacemi** (odkazy na stránky a zdroje).
3. **Dobré odpovědi zapisuj zpátky do wiki** jako novou stránku (analýza, srovnání), ať se
   zkoumání nabaluje.

### 3. Lint (občasná kontrola zdraví)

Hledej: rozpory mezi stránkami, zastaralá tvrzení, která překonaly novější zdroje, osiřelé stránky
bez jediného příchozího odkazu, koncepty, které se zmiňují, ale nemají vlastní stránku, chybějící
křížové odkazy a díry v datech, které stojí za dohledání. Navrhni nové otázky k prozkoumání a nové
zdroje k sehnání.

## Pravidla

- **Souborový systém je zdroj pravdy.** Piš markdown přímo (čti/zapisuj/edituj). Prohlížeč si změny
  načte; nečekej na žádný server ani aplikaci.
- **NIKDY needituj `raw/`** — zdroje jsou neměnné.
- **Vždycky cituj** — každé netriviální tvrzení odkaž na stránku `Source`.
- **Wikilinky** `[[název-souboru-bez-přípony]]` na propojení.
- **Prefix v `log.md`**: `## [RRRR-MM-DD] ingest|dotaz|lint | Název` — ať se to dá grepovat.
- **Jazyk** — stránky piš v [tvůj-jazyk].

## Vztah k ostatním pamětem

- **Paměť agenta / session** — preference, zpětná vazba, profil. NE doménová znalost. Zůstává zvlášť.
- **Nástroje na deep research** — jen na vícezdrojové zkoumání jednoho tématu. Ne na session logy.
- **Learningy a pravidla** — institucionální pravidla pro agenta. Tenhle vault je znalost o světě.
