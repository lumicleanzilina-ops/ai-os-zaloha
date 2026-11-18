---
name: second-opinion
description: >
  Multi-perspektivní review jakéhokoliv významného výstupu. Automaticky se spouští na architektonická
  rozhodnutí, strategické analýzy, plány a cenové nabídky. Tři nezávislé perspektivy s confidence
  scoringem a syntézou. Spouštěcí fráze - "dej tomu second opinion", "zkontroluj to z víc stran",
  "co na to říkáš", "ověř mi ten návrh", "je to dobrý?", "prověř ten plán", /second-opinion.
---

# Second Opinion — multi-perspektivní review

## Kdy se spouští
- **Automaticky** (podle ústavy AGENTS.md) na každý významný výstup:
  - Architektonická rozhodnutí
  - Strategické analýzy a doporučení
  - Plány a roadmapy
  - Nabídky a ceny
  - Důležitá komunikace směrem ke klientovi
- **Ručně** přes `/second-opinion`
- **Přeskoč** u: rychlých fixů, krátkých mailů, jednoduchých odpovědí

## Protokol

### Fáze 1: Vyber perspektivy
Podle typu výstupu vyber 3 relevantní perspektivy pro review:

| Typ výstupu | Perspektiva 1 | Perspektiva 2 | Perspektiva 3 |
|---|---|---|---|
| **Technická architektura** | Senior Staff Engineer | Security architekt | DevOps/SRE lead |
| **Byznys strategie** | Partner z McKinsey | Startupový mentor (YC) | Zákazník / koncový uživatel |
| **Cena / nabídka** | Finanční ředitel klienta | Konkurenční agentura | ROI analytik |
| **Marketing / obsah** | CMO B2B SaaS | SEO expert | Cílová persona |
| **AI automatizace** | AI solutions architekt | Procesní inženýr | Change manager |
| **Plán / roadmapa** | Program manager (FAANG) | Rizikový analytik | Stakeholder |

### Fáze 2: Nezávislé review (3 paralelní subagenti)
Pusť 3 subagenty paralelně. Každý dostane:

```
Jsi [ROLE]. Tvým úkolem je udělat nezávislé review následujícího výstupu.

VÝSTUP K REVIEW:
[celý výstup]

KONTEXT:
[co se řeší, pro koho, jaký je cíl]

Vyhodnoť:
1. **Silné stránky** — Co je na tomhle výstupu dobré? (2–3 body)
2. **Slabiny** — Co chybí, je špatně, nebo by šlo zlepšit? (2–3 body)
3. **Rizika** — Jaká vidíš rizika? (1–2 body)
4. **Doporučení** — Konkrétní návrhy na zlepšení (2–3 body)
5. **Confidence Score** — Jak moc si svým hodnocením věříš? (1–10)
6. **Severity** — Jak kritické tvoje nálezy jsou? (LOW / MEDIUM / HIGH / CRITICAL)
```

### Fáze 3: Syntéza
Až dorazí všechna 3 review:

```markdown
## Second Opinion — syntéza

### Shoda
[Na čem se shodli všichni]

### Rozpory
[Kde se perspektivy liší a proč]

### Souhrnné skóre
- Průměrná Confidence: X/10
- Nejvyšší Severity: [ÚROVEŇ]
- Míra shody: [VYSOKÁ/STŘEDNÍ/NÍZKÁ]

### Akční body (seřazeno podle priority)
1. [CRITICAL/HIGH] ...
2. [MEDIUM] ...
3. [LOW] ...

### Doporučení
[Přijmout / Přijmout s úpravami / Předělat]
```

### Fáze 4: Iterace (max 3 kola)
- Když se objeví Severity CRITICAL: automaticky přepracuj a pusť další kolo
- Když jen MEDIUM/LOW: předlož syntézu uživateli a nech rozhodnutí na něm
- Po 3 kolech: dodej nejlepší verzi + přehled zbývajících otevřených bodů

## Pravidla
- Subagenti jsou NEZÁVISLÍ — nesmí vidět review těch ostatních
- Vždy uváděj konkrétní příklady, ne obecné „šlo by to líp"
- Když všechny perspektivy dají Confidence 8+ a severity LOW — výstup je dobrý, neiteruj zbytečně dál
- Když se objevují opakující se patterny, zapiš klíčové poznatky do `docs/learnings/`
