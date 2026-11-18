---
name: mcp-builder
description: "Návod na stavbu kvalitních MCP (Model Context Protocol) serverů, díky kterým můžou LLM pracovat s externími službami přes dobře navržené tools. Použij, když stavíš MCP server nebo chceš napojit externí API či službu — v Pythonu (FastMCP) i v Node/TypeScriptu (MCP SDK). Spouštěcí fráze: „postav mi MCP server“, „napoj tohle API na Clauda“, „udělej MCP integraci“, „jak napsat MCP tool“, „přidej mi vlastní MCP“."
license: Úplné podmínky v LICENSE.txt
---

# Návod na vývoj MCP serveru

## Přehled

Stavíš MCP (Model Context Protocol) servery, díky kterým můžou LLM pracovat s externími službami přes dobře navržené tools. Kvalita MCP serveru se měří tím, jak dobře umožní LLM zvládnout reálné úkoly.

## Rozsah a oprávnění

Pracuj jen v projektu a s API, které uživatel určil. Ukázky v referencích jsou výukové předlohy,
nikoli oprávnění připojit produkční účet. Používej testovací data a nejmenší potřebná oprávnění;
změny dat, zveřejnění, instalace cizího kódu a přenos do modelu vyžadují odpovídající zadání uživatele.
Nerozšiřuj automaticky hostitelské seznamy povolených nástrojů. Před použitím ověř původ balíčků,
konkrétní verze a závislosti; ulož je do lockfile. Tajemství nepatří do chatu, příkazové řádky ani logů.

---

# Postup

## 🚀 Workflow z ptačí perspektivy

Stavba kvalitního MCP serveru má čtyři hlavní fáze:

### Fáze 1: Hloubkový výzkum a plánování

#### 1.1 Pochop moderní návrh MCP

**Pokrytí API vs. workflow tools:**
Vyvažuj kompletní pokrytí API endpointů a specializované workflow tools. Workflow tools jsou pohodlnější pro konkrétní úkoly, kdežto kompletní pokrytí dává agentům volnost operace skládat. Výkon se liší podle klienta — některým klientům pomáhá spouštění kódu, které kombinuje základní tools, jiným sedí spíš hotová workflow na vyšší úrovni. Když si nejsi jistý, dej přednost kompletnímu pokrytí API.

**Pojmenování toolů a dohledatelnost:**
Jasné, popisné názvy toolů pomáhají agentům rychle najít ten správný. Používej konzistentní prefixy (např. `github_create_issue`, `github_list_repos`) a pojmenování odvozené od akce.

**Práce s kontextem:**
Agentům pomáhají stručné popisy toolů a možnost výsledky filtrovat a stránkovat. Navrhuj tools tak, aby vracely soustředěná, relevantní data. Někteří klienti umí spouštět kód, což agentům pomůže data efektivně filtrovat a zpracovat.

**Chybové hlášky, se kterými se dá pracovat:**
Chybové hlášky mají agenta navigovat k řešení — konkrétními návrhy a dalšími kroky.

#### 1.2 Prostuduj dokumentaci MCP protokolu

**Jak se pohybovat ve specifikaci MCP:**

Začni sitemapou, ve které najdeš relevantní stránky: `https://modelcontextprotocol.io/sitemap.xml`

Pak si konkrétní stránky stáhni s příponou `.md` pro markdown formát (např. `https://modelcontextprotocol.io/specification/draft.md`).

Klíčové stránky k prostudování:
- Přehled specifikace a architektura
- Transportní mechanismy (streamable HTTP, stdio)
- Definice toolů, resources a promptů

#### 1.3 Prostuduj dokumentaci frameworku

**Doporučený stack:**
- **Jazyk**: TypeScript (kvalitní SDK a dobrá kompatibilita v mnoha běhových prostředích, např. MCPB. Navíc AI modely píšou TypeScript dobře — těží z jeho rozšířenosti, statického typování a kvalitních lintovacích nástrojů)
- **Transport**: Streamable HTTP pro vzdálené servery, se stateless JSON (jednodušší na škálování a údržbu než stavové session a streamované odpovědi). stdio pro lokální servery.

**Načti si dokumentaci frameworku:**

- **MCP best practices**: [📋 Zobrazit best practices](./reference/mcp_best_practices.md) — základní pravidla

**Pro TypeScript (doporučeno):**
- **TypeScript SDK**: přes WebFetch načti `https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md`
- [⚡ TypeScript návod](./reference/node_mcp_server.md) — TypeScript patterny a příklady

**Pro Python:**
- **Python SDK**: přes WebFetch načti `https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md`
- [🐍 Python návod](./reference/python_mcp_server.md) — Python patterny a příklady

#### 1.4 Naplánuj implementaci

**Pochop dané API:**
Projdi dokumentaci API té služby a najdi klíčové endpointy, požadavky na autentizaci a datové modely. Použij webové vyhledávání a WebFetch podle potřeby.

**Výběr toolů:**
Upřednostni kompletní pokrytí API. Sepiš si endpointy k implementaci, začni od nejběžnějších operací.

---

### Fáze 2: Implementace

#### 2.1 Založ strukturu projektu

Nastavení projektu najdeš v návodech pro jednotlivé jazyky:
- [⚡ TypeScript návod](./reference/node_mcp_server.md) — struktura projektu, package.json, tsconfig.json
- [🐍 Python návod](./reference/python_mcp_server.md) — organizace modulů, závislosti

#### 2.2 Postav základní infrastrukturu

Vytvoř sdílené utility:
- API klient s autentizací
- Pomocné funkce pro ošetření chyb
- Formátování odpovědí (JSON/Markdown)
- Podpora pagination

#### 2.3 Implementuj tools

Pro každý tool:

**Vstupní schema:**
- Použij Zod (TypeScript) nebo Pydantic (Python)
- Zahrň omezení a jasné popisy
- Do popisů polí přidej příklady

**Výstupní schema:**
- Kde to jde, definuj `outputSchema` pro strukturovaná data
- V odpovědích toolu použij `structuredContent` (funkce TypeScript SDK)
- Pomáhá to klientům výstupy toolů pochopit a zpracovat

**Popis toolu:**
- Stručné shrnutí funkčnosti
- Popisy parametrů
- Schema návratového typu

**Implementace:**
- Async/await pro I/O operace
- Pořádné ošetření chyb s hláškami, se kterými se dá pracovat
- Podpora pagination tam, kde dává smysl
- Když používáš moderní SDK, vracej textový obsah i strukturovaná data

**Anotace:**
- `readOnlyHint`: true/false
- `destructiveHint`: true/false
- `idempotentHint`: true/false
- `openWorldHint`: true/false

---

### Fáze 3: Review a testování

#### 3.1 Kvalita kódu

Zkontroluj:
- Žádný duplicitní kód (princip DRY)
- Konzistentní ošetření chyb
- Plné pokrytí typy
- Jasné popisy toolů

#### 3.2 Build a testování

**TypeScript:**
- Spusť `npm run build` a ověř, že se to zkompiluje
- Otestuj přes MCP Inspector z již prověřené lokální závislosti projektu. Nejdřív vyber konkrétní
  vydání z oficiálního registru, zkontroluj jeho požadavky a advisories, připni přesnou verzi
  a ulož lockfile; pak spusť jeho lokální binární soubor. Nespouštěj nezafixované vzdálené `npx`.

**Python:**
- Ověř syntaxi: `python -m py_compile your_server.py`
- Otestuj přes MCP Inspector

Podrobné postupy testování a checklisty kvality najdeš v návodech pro jednotlivé jazyky.

---

### Fáze 4: Vytvoř evaluace

Až máš MCP server hotový, vytvoř pořádné evaluace, které ověří, jestli funguje.

**Načti si [✅ Návod na evaluace](./reference/evaluation.md), kde jsou kompletní pravidla.**

#### 4.1 Pochop, k čemu evaluace jsou

Evaluacemi testuješ, jestli LLM dokáže tvůj MCP server reálně využít k zodpovězení realistických, komplexních otázek.

#### 4.2 Vytvoř 10 evaluačních otázek

Aby evaluace k něčemu byly, drž se postupu z návodu na evaluace:

1. **Průzkum toolů**: vypiš dostupné tools a pochop, co umí
2. **Průzkum obsahu**: pomocí READ-ONLY operací prozkoumej dostupná data
3. **Tvorba otázek**: vymysli 10 komplexních, realistických otázek
4. **Ověření odpovědí**: vyřeš každou otázku sám a ověř si odpovědi

#### 4.3 Požadavky na evaluace

Zajisti, aby každá otázka byla:
- **Nezávislá**: nezávisí na ostatních otázkách
- **Read-only**: vyžaduje jen nedestruktivní operace
- **Komplexní**: vyžaduje víc volání toolů a hlubší průzkum
- **Realistická**: vychází z reálných případů, na kterých lidem záleží
- **Ověřitelná**: jedna jasná odpověď, kterou lze ověřit porovnáním řetězců
- **Stabilní**: odpověď se časem nezmění

#### 4.4 Formát výstupu

Vytvoř XML soubor s touto strukturou:

```xml
<evaluation>
  <qa_pair>
    <question>Find discussions about AI model launches with animal codenames. One model needed a specific safety designation that uses the format ASL-X. What number X was being determined for the model named after a spotted wild cat?</question>
    <answer>3</answer>
  </qa_pair>
<!-- Další qa_pairs... -->
</evaluation>
```

---

# Referenční soubory

## 📚 Knihovna dokumentace

Tyhle zdroje si načítej během vývoje podle potřeby:

### Základní MCP dokumentace (načti jako první)
- **MCP protokol**: začni sitemapou na `https://modelcontextprotocol.io/sitemap.xml`, pak si stáhni konkrétní stránky s příponou `.md`
- [📋 MCP best practices](./reference/mcp_best_practices.md) — univerzální MCP pravidla, mimo jiné:
  - Konvence pojmenování serveru a toolů
  - Pravidla pro formát odpovědí (JSON vs. Markdown)
  - Best practices pro pagination
  - Výběr transportu (streamable HTTP vs. stdio)
  - Standardy bezpečnosti a ošetření chyb

### Dokumentace SDK (načti během fáze 1/2)
- **Python SDK**: stáhni z `https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md`
- **TypeScript SDK**: stáhni z `https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md`

### Implementační návody pro jednotlivé jazyky (načti během fáze 2)
- [🐍 Implementační návod pro Python](./reference/python_mcp_server.md) — kompletní návod pro Python/FastMCP, obsahuje:
  - Patterny inicializace serveru
  - Příklady Pydantic modelů
  - Registrace toolů přes `@mcp.tool`
  - Kompletní funkční příklady
  - Checklist kvality

- [⚡ Implementační návod pro TypeScript](./reference/node_mcp_server.md) — kompletní návod pro TypeScript, obsahuje:
  - Strukturu projektu
  - Patterny Zod schémat
  - Registrace toolů přes `server.registerTool`
  - Kompletní funkční příklady
  - Checklist kvality

### Návod na evaluace (načti během fáze 4)
- [✅ Návod na evaluace](./reference/evaluation.md) — kompletní návod na tvorbu evaluací, obsahuje:
  - Pravidla pro tvorbu otázek
  - Strategie ověřování odpovědí
  - Specifikaci XML formátu
  - Ukázkové otázky a odpovědi
  - Spuštění evaluace přes dodané skripty

> Původ: anthropics/skills (mcp-builder), Copyright 2026 Anthropic, PBC, Apache License 2.0. Český překlad a bezpečnostní úpravy AI OS Kitu jsou popsané v NOTICE; úplná licence je v LICENSE.txt. AI OS Kit není produkt Anthropic.
