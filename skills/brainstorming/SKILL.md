---
name: brainstorming
description: Prozkoumá záměr uživatele, požadavky a návrh řešení ještě před implementací. Použij, když se začíná nová funkce, komponenta nebo složitější úkol a je potřeba se shodnout dřív, než se začne psát kód.
---

# Od nápadů k návrhu řešení

## Kdy tuhle dovednost použít
- Začíná se úplně nový projekt, funkce nebo komponenta.
- Uživatel chce postavit něco složitého nebo to popsal vágně.
- Potřebuješ se shodnout na požadavcích a návrhu dřív, než napíšeš kód.

## Workflow

- [ ] **Prozkoumej kontext projektu:** projdi soubory, dokumentaci a poslední commity, ať víš, v jakém stavu to je.
- [ ] **Ptej se na to, co není jasné:** jednu otázku po druhé, ať pochopíš účel, omezení a podle čeho se pozná úspěch.
- [ ] **Navrhni varianty:** nabídni 2–3 různé přístupy, ke každému trade-offy a k tomu své konkrétní doporučení.
- [ ] **Předlož návrh:** popiš architekturu, komponenty a tok dat. Vyžádej si výslovné schválení od uživatele.
- [ ] **Sepiš design doc:** ulož schválenou specifikaci a přejdi do fáze implementace (např. přes dovednost `planning`).

## Instrukce

- **NEPIŠ kód a nepouštěj se do implementace**, dokud není návrh předložený a uživatelem schválený.
- **Jedna otázka po druhé.** Nezahlcuj uživatele obřím seznamem otázek najednou.
- Kde to jde, dávej přednost otázkám s výběrem odpovědí před otevřenými — vyřeší se to rychleji.
- Nemilosrdně uplatňuj **YAGNI** (You Aren't Gonna Need It). Z každého prvního návrhu vyhoď zbytečné funkce, ať zůstane rozsah pod kontrolou.
- Rozděl systém na menší, testovatelné části, z nichž každá má jeden jasný účel.
- Když pracuješ v existující kódové základně, drž se zavedených vzorů. Pokud je potřeba refaktoring, drž ho striktně u aktuálního cíle.

## Přechod k implementaci
Jakmile uživatel návrh výslovně schválí:
1. Zdokumentuj specifikaci do markdown souboru (např. `docs/plans/YYYY-MM-DD-feature-design.md`).
2. NEZAČÍNEJ hned kódovat.
3. Přepni na dovednost `planning` (psaní plánů) a vytvoř podrobný implementační plán krok po kroku podle schváleného návrhu.

> Původ: obra/superpowers, dovednost brainstorming (MIT, Copyright (c) 2025 Jesse Vincent); zkráceno a přepsáno do češtiny. Licence a změny: THIRD-PARTY-NOTICES.md v kořeni kitu.
