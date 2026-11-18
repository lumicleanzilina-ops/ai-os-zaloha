---
name: client-context
description: >
  Rychle vytáhni kompletní kontext klienta ze všech napojených systémů. Použij na začátku každého
  klientského projektu nebo meetingu, nebo kdykoliv si uživatel řekne o brief ke klientovi. Výstup:
  jednostránkový brief — kdo je klient, kde jsme, co chce.
---

# /client-context [jméno klienta]

## Spuštění
- `/client-context [jméno]` — vytáhni kontext konkrétního klienta
- Automaticky na začátku projektu, pokud z kontextu není jasné, o kterého klienta jde

## Co tahle dovednost dělá

Paralelně tahá kontext ze všech relevantních napojených systémů a zhruba za 60 sekund z toho poskládá
brief.

## Postup

### Fáze 1: Paralelní tahání dat (3 subagenti)

**Subagent A — CRM a finance:**
1. Tvoje CRM (napojené přes MCP): najdi kontakt → jméno, firma, fáze v pipeline, poslední aktivita
2. Tvoje CRM: otevřené příležitosti/dealy a jejich stav
3. Tvůj platební nástroj: stav plateb, aktivní předplatná (pokud nějaká jsou)
4. Tvůj fakturační nástroj: neuhrazené faktury (pokud se tomuhle klientovi fakturuje)

**Subagent B — Komunikace:**
1. E-mail: posledních 5 vláken s klientem
2. Shrň klíčové body — co se řeší, co klient chce, co je otevřené
3. Najdi poslední domluvené další kroky

**Subagent C — Cally a dokumenty:**
1. Tvůj nástroj na zápisy z hovorů: posledních 3–5 přepisů s klientem
2. Shrň: co se probíralo, jaká padla rozhodnutí, akční body
3. Zkontroluj složku projektu daného klienta — existuje už vůbec?

### Fáze 2: Brief (jedna stránka)

Sesyntetizuj to do tohohle formátu:

```markdown
# Brief ke klientovi — [Jméno klienta] — [Datum]

## Kdo je klient
- **Firma:** [název]
- **Kontakt:** [jméno, role]
- **Fáze v pipeline:** [kde sedí v CRM]

## Kde jsme
- **Poslední interakce:** [datum + shrnutí]
- **Aktuální projekt / spolupráce:** [na čem se pracuje]
- **Stav plateb:** [OK / faktura X čeká na úhradu / po splatnosti]

## Co klient chce
- [Hlavní záměr z e-mailů a callů]
- [Otevřené požadavky]

## Akční body (na tvojí straně)
- [ ] [Co mu dlužíš]
- [ ] [Termín, pokud je známý]

## Červené praporky
- [Cokoliv, co vypadá divně — faktura po splatnosti, nedodržený slib apod.]
```

## Pravidla
- Vždycky uveď datum posledního kontaktu — čtenář podle něj pozná, jak čerstvý brief je
- Když klient v CRM není: upozorni na to uživatele
- Když je jakákoliv faktura po splatnosti víc než 30 dní: vždycky to označ jako červený praporek
- Tenhle brief je jen pro interní potřebu — je to shrnutí pro uživatele, nikdy ne něco, co se posílá
  klientovi
