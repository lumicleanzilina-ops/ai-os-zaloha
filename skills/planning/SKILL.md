---
name: planning
description: Použij, když máš zadání nebo požadavky na vícekrokový úkol, ještě než sáhneš na kód. Spouštěcí fráze - "naplánuj to", "udělej plán", "rozplánuj", "jak na to půjdeme", "implementační plán", "rozepiš kroky", /planning.
---

# Psaní plánů

## Přehled

Piš detailní implementační plány s předpokladem, že vývojář nemá žádný kontext. Zdokumentuj všechno: kterých souborů se to dotkne, ukázky kódu, kroky testování, relevantní dokumentaci. Celý plán rozepiš na malé úkoly po soustech. DRY. YAGNI. TDD. Časté commity.

**Na začátku oznam:** „Používám skill na psaní plánů, připravím implementační plán."

**Plány ukládej do:** `docs/plans/YYYY-MM-DD-<nazev-featury>.md`

## Kontrola rozsahu

Pokud zadání pokrývá víc nezávislých subsystémů, navrhni rozdělení do samostatných plánů — jeden na subsystém. Každý plán musí sám o sobě vyprodukovat funkční, otestovatelný software.

## Struktura souborů

Než začneš definovat úkoly, zmapuj, které soubory vzniknou nebo se změní a za co je každý zodpovědný.

- Navrhuj jednotky s jasnými hranicemi a dobře definovanými rozhraními
- Radši menší soustředěné soubory než velké, co dělají moc věcí
- Soubory, které se mění spolu, patří k sobě — děl podle zodpovědnosti, ne podle technické vrstvy
- Ve stávajícím codebase se drž zavedených patternů

## Granularita úkolů po soustech

**Každý krok je jedna akce (2–5 minut):**
- „Napiš padající test" — krok
- „Spusť ho a ověř, že opravdu padá" — krok
- „Naimplementuj minimum, aby test prošel" — krok
- „Spusť testy a ověř, že prochází" — krok
- „Commitni" — krok

## Hlavička dokumentu s plánem

**Každý plán MUSÍ začínat touto hlavičkou:**

```markdown
# [Název featury] Implementation Plan

> **For agentic workers:** Implement this plan using Agent tool (subagents for parallel tasks) or direct execution. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [Jedna věta, co se tímhle staví]

**Architecture:** [2–3 věty o přístupu]

**Tech Stack:** [Klíčové technologie/knihovny]

---
```

## Struktura úkolu

````markdown
### Task N: [Název komponenty]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

- [ ] **Step 1: Napiš padající test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Spusť test a ověř, že padá**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL s „function not defined"

- [ ] **Step 3: Napiš minimální implementaci**

```python
def function(input):
    return expected
```

- [ ] **Step 4: Spusť test a ověř, že prochází**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

- [ ] **Step 5: Commitni**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
````

## Pamatuj
- Vždy přesné cesty k souborům
- Kompletní kód přímo v plánu (ne „doplň validaci")
- Přesné příkazy včetně očekávaného výstupu
- DRY, YAGNI, TDD, časté commity

## Smyčka review plánu

Po dokončení každého bloku plánu:

1. Pošli subagenta plan-document-reviewer (viz [plan-document-reviewer-prompt.md](plan-document-reviewer-prompt.md)) na aktuální blok
   - Dej mu: obsah bloku, cestu k dokumentu se zadáním
2. Když přijde ❌ Issues Found:
   - Oprav nálezy v bloku
   - Pošli reviewera znovu na ten samý blok
   - Opakuj, dokud není ✅ Approved
3. Když přijde ✅ Approved: pokračuj dalším blokem (nebo předáním k exekuci, pokud to byl poslední)

**Hranice bloků:** Bloky odděluj nadpisy `## Chunk N: <název>`. Každý blok má mít ≤1000 řádků a být logicky samostatný.

**Jak vést smyčku review:**
- Plán opravuje tentýž agent, který ho psal (zachová si kontext)
- Když smyčka přesáhne 5 iterací, předej to člověku
- Revieweři jsou poradní — když s připomínkou nesouhlasíš, vysvětli proč

## Předání k exekuci

Po uložení plánu:

**„Plán je hotový a uložený v `docs/plans/<soubor>.md`. Můžeme ho odexekvovat?"**

**Komplexní plán (3+ nezávislých úkolů):**
- Použij Agent tool s paralelními subagenty — jeden úkol na subagenta
- Výsledky syntetizuj v hlavním kontextu

**Jednoduchý plán (1–2 úkoly nebo sekvenční):**
- Exekuuj rovnou v aktuální session
- Checkpointy k review po každém klíčovém kroku

> Původ: obra/superpowers, dovednost writing-plans a plan-document-reviewer-prompt.md (MIT, Copyright (c) 2025 Jesse Vincent); přejmenováno, přeloženo a přizpůsobeno kitu. Licence a změny: THIRD-PARTY-NOTICES.md v kořeni kitu.
