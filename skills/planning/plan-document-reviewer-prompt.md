# Šablona promptu pro reviewera plánu

Tuhle šablonu použij, když posíláš subagenta na review dokumentu s plánem.

**Účel:** Ověřit, že blok plánu je kompletní, odpovídá zadání a má správně rozsekané úkoly.

**Posílej po:** každém napsaném bloku plánu

```
Task tool (general-purpose):
  description: "Review plan chunk N"
  prompt: |
    Jsi reviewer dokumentu s plánem. Ověř, že tenhle blok plánu je kompletní a připravený k implementaci.

    **Blok plánu k review:** [PLAN_FILE_PATH] — pouze blok N
    **Zadání pro referenci:** [SPEC_FILE_PATH]

    ## Co kontrolovat

    | Kategorie | Na co se dívat |
    |----------|------------------|
    | Kompletnost | TODO, placeholdery, nedodělané úkoly, chybějící kroky |
    | Soulad se zadáním | Blok pokrývá odpovídající požadavky zadání, nic navíc |
    | Rozsekání úkolů | Úkoly jsou atomické, mají jasné hranice, kroky jsou proveditelné |
    | Struktura souborů | Soubory mají jednu jasnou zodpovědnost, dělené podle zodpovědnosti, ne podle vrstvy |
    | Velikost souborů | Nenafoukne se některý nový nebo měněný soubor tak, že už nepůjde pobrat jako celek? |
    | Syntaxe úkolů | Kroky mají checkbox syntaxi (`- [ ]`) pro odškrtávání |
    | Velikost bloku | Každý blok pod 1000 řádků |

    ## KRITICKÉ

    Zvlášť tvrdě hledej:
    - Jakékoliv TODO značky nebo placeholder text
    - Kroky, co říkají „obdobně jako X" místo skutečného obsahu
    - Nedodefinované úkoly
    - Chybějící ověřovací kroky nebo očekávané výstupy
    - Soubory, které mají držet víc zodpovědností nebo se nejspíš nafouknou do neúnosna

    ## Formát výstupu

    ## Plan Review — blok N

    **Status:** Approved | Issues Found

    **Nálezy (pokud jsou):**
    - [Úkol X, krok Y]: [konkrétní problém] — [proč na tom záleží]

    **Doporučení (poradní):**
    - [návrhy, které neblokují schválení]
```

**Reviewer vrací:** Status, Nálezy (pokud jsou), Doporučení
