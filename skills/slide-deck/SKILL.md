---
name: slide-deck
description: >
  Vygeneruje kompletní vizuální HTML prezentaci z tématu nebo zadání. Použij tenhle skill, když
  uživatel řekne "udělej prezentaci", "vytvoř slajdy", "potřebuju deck", "postav prezentaci o",
  "prezentace na téma", "mám prezentovat", nebo cokoliv v tom smyslu, že chce vygenerovat vizuální
  prezentaci.
---

# Generátor prezentací

Vytváříš vypiplané vizuální HTML prezentace, které vypadají profesionálně a dají se rovnou prezentovat z prohlížeče. Nejsou to odrážky na bílém pozadí — používají bohaté vizuální komponenty, aby vyprávěly příběh.

## Krok 0 — Napasuj se na brand uživatele z jeho referencí (tohle udělej první)

Než začneš stavět, podívej se do `skills/slide-deck/brand-references/` (cesta od kořene workspace) — tam leží prezentace a slajdy, které se uživateli líbí.
- **Prázdné nebo míň než ~5 kusů?** ZASTAV SE a řekni mu, ať do `skills/slide-deck/brand-references/` nejdřív hodí
  5–10 referencí (viz README v té složce). Vysvětli mu proč: bez nich mu vyrobíš generickou
  prezentaci, s nimi vyleze *jeho* brand. Nestav celou prezentaci naslepo — nabídni rychlý drátěný model a zopakuj prosbu.
- **Je jich tam dost?** Prostuduj je a zreprodukuj vizuální jazyk uživatele — paletu, fonty, layout,
  odsazení, náladu. Napasuj se na to, co vidíš; brand nehádej.

## Postup

### Krok 1: Pochop zadání
Ověř si:
- Jaké je téma?
- Kdo je publikum? (tým, klient, investoři, posluchači školení)
- Kolik slajdů? (výchozí: 8–12)
- Jsou nějaké body, které tam musí být?

Když uživatel dá jasné téma, přeskoč otázky a rovnou stav.

### Krok 2: Naplánuj vyprávění
Než napíšeš první HTML, udělej osnovu slajdů:
- Jaký příběh vyprávíš?
- Co je hook na prvním slajdu?
- Co si má člověk odnést?
- Jeden slajd = jedna myšlenka, jeden vizuál

### Krok 3: Postav prezentaci

Vygeneruj jediný samostatný HTML soubor. Všechno CSS v `<style>`, všechno JS v `<script>`. Žádné externí závislosti.

**Design systém:**
```
Background: #0a0a0a
Primary text: #f5f5f7 (weight 400)
Bold text: #fff (weight 700)
Secondary text: #86868b
Font: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif
Card background: rgba(255,255,255,0.04)
Card radius: 20px
Accent: #DA7756
```

**Dostupné vizuální komponenty:**
- **Velké číslo** — obří číslo + popisek (na působivá data)
- **Srovnávací panel** — vedle sebe s popisky (na před/po, pro/proti)
- **Mřížka karet** — 2×2, 2×3 nebo 3×3 karty s ikonami (na kategorie, funkce)
- **Diagram toku** — boxy s kroky a šipkami (na procesy, časové osy)
- **Panel s kódem** — blok neproporcionálním písmem (na technický obsah, příkazy)
- **Seznam odrážek** — řádky ikona + text (na rychlá fakta)
- **Mockup** — falešné okno aplikace s obsahem (když ukazuješ výstup nástroje)
- **Emoji + text** — velké emoji + titulek (na emotivní nebo jednoduché myšlenky)

**Pravidla pro text na slajdu:**
- 3–10 slov na titulek. Míň je víc.
- Tagem `<strong>` zvýrazni 1–2 klíčová slova v titulku
- Jedna vizuální komponenta na slajd
- Podtitulek (menší šedý text) pro kontext — maximálně jedna věta

**Ovládání:**
- Šipky (doleva/doprava) pro posun
- Mezerník nebo klik pro další slajd
- Klávesa F na celou obrazovku
- Dvojklik na celou obrazovku
- Tečky s postupem dole
- Automatické skrytí kurzoru po 3 sekundách

### Krok 4: Ulož a otevři

Ulož HTML soubor a otevři ho v prohlížeči, ať se na něj uživatel může podívat.

## Pravidla

- Každý slajd musí mít vizuální komponentu. Nikdy jen text na černé.
- První slajd je vždycky hook — musí chytnout.
- Maximum 15 slajdů. Když jich potřebuješ víc, nejsi dost stručný.
- Minimum 5 slajdů. Když jich potřebuješ míň, téma možná na prezentaci nestačí.
- Žádné externí závislosti. Všechno inline v jednom HTML souboru.
- Prezentace musí fungovat v každém moderním prohlížeči bez jakéhokoliv nastavování.
- Mysli na estetiku Apple keynote — čisté, vzdušné, vysoký kontrast, minimalismus.
