# [Název projektu]

> Pro každý nový projekt si tuhle složku zkopíruj: `cp -r projects/project-template projects/my-new-project`.
> Pak vyplň tenhle README. Každá složka projektu ho musí mít — je to kontext, který si agent
> přečte, než tady cokoliv udělá.

## Co to je

Jedna dvě věty: co je tenhle projekt zač a proč existuje. K jakému výsledku vede?

## Aktuální stav

Kde to teď stojí (např. *rešerše hotová, píšu nabídku*). Drž tenhle řádek aktuální — je to první
věc, kterou si agent přečte, když se k projektu vrátí.

## Struktura

```
my-new-project/
├── inputs/     # podklady, které sem hodíš — zadání, dokumenty, screenshoty, exporty, přepisy
├── outputs/    # hotové deliverables — reporty, prezentace, kód, dokumenty
├── docs/       # pracovní poznámky, plány, rozhodnutí, rešerše
└── README.md   # tenhle soubor
```

- **`inputs/`** — sem hoď zdrojové soubory. Agent z nich čte a nikdy je needituje.
- **`outputs/`** — sem padají finální deliverables, připravené k odeslání.
- **`docs/`** — plány, poznámky a rozhodnutí, která cestou padnou.

## Jak se v tomhle projektu pracuje

Standardní průběh projektu:

1. **Kontext** — agent si natáhne, co potřebuje, buď z `inputs/`, nebo z napojených nástrojů
   (e-mail, kalendář, CRM, zápisy z meetingů) přes MCP.
2. **Zadání** — řekneš, co potřebuješ a jaké rozhodnutí děláš.
3. **Práce** — agent rešeršuje, plánuje (`/plan`) a u všeho podstatného si sám udělá review
   (`/second-opinion`). Automaticky.
4. **Review** — zkontroluješ klíčová rozhodnutí a doladíš směr.
5. **Dodání** — finální output jde do `outputs/`.

## Klíčová fakta

Cokoliv, co má agent o tomhle projektu vždycky vědět — termíny, lidi, omezení, odkazy, už
padlá rozhodnutí. Průběžně to doplňuj, ať kontext přežije i mezi session.

## Poznámky

Místo na otevřené otázky a průběžný kontext.
