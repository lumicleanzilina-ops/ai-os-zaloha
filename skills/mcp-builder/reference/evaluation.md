> Převzato z anthropics/skills (mcp-builder), Copyright 2026 Anthropic, PBC, Apache License 2.0. Tento soubor je český překlad původního textu (změna podle § 4 licence); viz ../NOTICE a ../LICENSE.txt.

# Průvodce evaluací MCP serveru

## Přehled

Tenhle dokument popisuje, jak vytvořit komplexní evaluace pro MCP servery. Evaluace testují, jestli LLM dokáže tvůj MCP server efektivně použít k zodpovězení realistických, složitých otázek — a to čistě pomocí poskytnutých tools.

---

## Rychlý přehled

### Požadavky na evaluaci
- Vytvoř 10 čitelných otázek
- Otázky musí být READ-ONLY, NEZÁVISLÉ, NEDESTRUKTIVNÍ
- Každá otázka vyžaduje víc volání toolů (klidně desítky)
- Odpovědi musí být jediná ověřitelná hodnota
- Odpovědi musí být STABILNÍ (nemění se v čase)

### Výstupní formát
```xml
<evaluation>
   <qa_pair>
      <question>Sem patří tvoje otázka</question>
      <answer>Jediná ověřitelná odpověď</answer>
   </qa_pair>
</evaluation>
```

---

## K čemu evaluace slouží

Kvalita MCP serveru se neměří tím, jak dobře nebo jak komplexně server implementuje tools, ale tím, jak dobře tyhle implementace (vstupní/výstupní schémata, docstringy/popisy, funkcionalita) umožní LLM bez jakéhokoliv dalšího kontextu a s přístupem POUZE k MCP serverům odpovědět na realistické a těžké otázky.

## Evaluace v kostce

Vytvoř 10 čitelných otázek, k jejichž zodpovězení stačí POUZE READ-ONLY, NEZÁVISLÉ, NEDESTRUKTIVNÍ a IDEMPOTENTNÍ operace. Každá otázka by měla být:
- Realistická
- Jasná a stručná
- Jednoznačná
- Složitá, vyžadující klidně desítky volání toolů nebo kroků
- Zodpověditelná jedinou ověřitelnou hodnotou, kterou znáš předem

## Pravidla pro otázky

### Základní požadavky

1. **Otázky MUSÍ být nezávislé**
   - Žádná otázka nesmí záviset na odpovědi na jinou otázku
   - Nesmí předpokládat zápisové operace provedené při zpracování jiné otázky

2. **Otázky MUSÍ vyžadovat POUZE NEDESTRUKTIVNÍ A IDEMPOTENTNÍ použití toolů**
   - Nesmí nařizovat ani vyžadovat změnu stavu jako cestu ke správné odpovědi

3. **Otázky musí být REALISTICKÉ, JASNÉ, STRUČNÉ a SLOŽITÉ**
   - Musí donutit jiné LLM použít víc (klidně desítky) toolů nebo kroků

### Složitost a hloubka

4. **Otázky musí vyžadovat hluboké prozkoumání**
   - Zvaž multi-hop otázky, které vyžadují víc dílčích otázek a sekvenčních volání toolů
   - Každý krok by měl těžit z informací nalezených v předchozích otázkách

5. **Otázky můžou vyžadovat rozsáhlé stránkování**
   - Můžou vyžadovat prolistování víc stránek výsledků
   - Můžou vyžadovat dotaz na stará data (1–2 roky zpět) kvůli nalezení okrajové informace
   - Otázky musí být TĚŽKÉ

6. **Otázky musí vyžadovat hluboké porozumění**
   - Ne jen povrchní znalost
   - Můžou stavět složité myšlenky jako True/False otázky vyžadující důkaz
   - Můžou použít formát s výběrem z možností, kde LLM musí prohledat různé hypotézy

7. **Otázky nesmí jít vyřešit přímočarým vyhledáváním podle klíčových slov**
   - Neuváděj konkrétní klíčová slova z cílového obsahu
   - Používej synonyma, příbuzné pojmy nebo parafráze
   - Vyžaduj víc hledání, analýzu víc souvisejících položek, vytažení kontextu a teprve pak odvození odpovědi

### Testování toolů

8. **Otázky by měly zátěžově testovat návratové hodnoty toolů**
   - Můžou vést k tomu, že tool vrátí obří JSON objekty nebo seznamy, které LLM zahltí
   - Měly by vyžadovat porozumění víc modalitám dat:
     - ID a jména
     - Timestampy a datetime (měsíce, dny, roky, sekundy)
     - ID souborů, jména, přípony a mimetypy
     - URL, GID atd.
   - Měly by prověřit schopnost toolu vracet všechny užitečné formy dat

9. **Otázky by měly VĚTŠINOU odrážet reálné lidské use casy**
   - Typ úloh na vyhledání informací, které zajímají ČLOVĚKA s pomocí LLM

10. **Otázky můžou vyžadovat desítky volání toolů**
    - Tím se testují LLM s omezeným kontextem
    - Motivuje to tools MCP serveru omezovat množství vracených informací

11. **Zařaď i nejednoznačné otázky**
    - Můžou být nejednoznačné NEBO vyžadovat těžké rozhodnutí, který tool zavolat
    - Nutí LLM potenciálně chybovat nebo si otázku vyložit špatně
    - Zajisti, že navzdory NEJEDNOZNAČNOSTI existuje POŘÁD JEDINÁ OVĚŘITELNÁ ODPOVĚĎ

### Stabilita

12. **Otázky musí být navržené tak, aby se odpověď NEMĚNILA**
    - Neptej se na věci závislé na „aktuálním stavu“, který je dynamický
    - Například nepočítej:
      - Počet reakcí na příspěvek
      - Počet odpovědí ve vlákně
      - Počet členů v kanálu

13. **NENECH si MCP serverem OMEZIT typy otázek, které vytváříš**
    - Tvoř náročné a složité otázky
    - Některé nemusí být dostupnými tools MCP serveru vůbec řešitelné
    - Otázky můžou vyžadovat konkrétní výstupní formát (datetime vs. epoch time, JSON vs. MARKDOWN)
    - Otázky můžou vyžadovat desítky volání toolů

## Pravidla pro odpovědi

### Ověřitelnost

1. **Odpovědi musí být OVĚŘITELNÉ přímým porovnáním řetězců**
   - Pokud jde odpověď zapsat v mnoha formátech, jasně specifikuj výstupní formát přímo V OTÁZCE
   - Příklady: „Použij YYYY/MM/DD.“, „Odpověz True nebo False.“, „Odpověz A, B, C, nebo D a nic jiného.“
   - Odpověď by měla být jediná OVĚŘITELNÁ hodnota, například:
     - ID uživatele, uživatelské jméno, zobrazované jméno, křestní jméno, příjmení
     - ID kanálu, název kanálu
     - ID zprávy, řetězec
     - URL, titulek
     - Číselná hodnota
     - Timestamp, datetime
     - Boolean (u True/False otázek)
     - E-mailová adresa, telefonní číslo
     - ID souboru, název souboru, přípona souboru
     - Odpověď s výběrem z možností
   - Odpovědi nesmí vyžadovat speciální formátování ani složitý strukturovaný výstup
   - Odpověď se bude ověřovat PŘÍMÝM POROVNÁNÍM ŘETĚZCŮ

### Čitelnost

2. **Odpovědi by měly obecně preferovat ČITELNÉ formáty**
   - Příklady: jména, křestní jméno, příjmení, datetime, název souboru, text zprávy, URL, ano/ne, true/false, a/b/c/d
   - Spíš než neprůhledná ID (i když ID jsou přípustná)
   - DRTIVÁ VĚTŠINA odpovědí by měla být čitelná pro člověka

### Stabilita

3. **Odpovědi musí být STABILNÍ/STACIONÁRNÍ**
   - Dívej se na starý obsah (např. ukončené konverzace, spuštěné projekty, zodpovězené otázky)
   - Tvoř OTÁZKY nad „uzavřenými“ koncepty, které vždycky vrátí stejnou odpověď
   - Otázky můžou vyžadovat zvážení pevného časového okna, aby se odstínily od nestacionárních odpovědí
   - Spoléhej se na kontext, který se PRAVDĚPODOBNĚ nezmění
   - Příklad: když hledáš název dokumentu, buď dost KONKRÉTNÍ, aby se odpověď nepletla s dokumenty publikovanými později

4. **Odpovědi musí být JASNÉ a JEDNOZNAČNÉ**
   - Otázky musí být navržené tak, aby existovala jediná jasná odpověď
   - Odpověď musí jít odvodit pomocí toolů MCP serveru

### Rozmanitost

5. **Odpovědi musí být ROZMANITÉ**
   - Odpověď by měla být jediná OVĚŘITELNÁ hodnota v rozmanitých modalitách a formátech
   - Koncept uživatel: ID uživatele, uživatelské jméno, zobrazované jméno, křestní jméno, příjmení, e-mailová adresa, telefonní číslo
   - Koncept kanál: ID kanálu, název kanálu, téma kanálu
   - Koncept zpráva: ID zprávy, text zprávy, timestamp, měsíc, den, rok

6. **Odpovědi NESMÍ být složité struktury**
   - Ne seznam hodnot
   - Ne složitý objekt
   - Ne seznam ID nebo řetězců
   - Ne text v přirozeném jazyce
   - LEDAŽE odpověď jde přímočaře ověřit PŘÍMÝM POROVNÁNÍM ŘETĚZCŮ
   - A jde ji realisticky reprodukovat
   - Mělo by být nepravděpodobné, že LLM vrátí ten samý seznam v jiném pořadí nebo formátu

## Průběh evaluace

### Krok 1: Průzkum dokumentace

Přečti dokumentaci cílového API, ať pochopíš:
- Dostupné endpointy a funkcionalitu
- Pokud je něco nejasné, dohledej si další informace na webu
- Tenhle krok paralelizuj CO NEJVÍC TO JDE
- Zajisti, že každý subagent zkoumá POUZE dokumentaci ze souborového systému nebo z webu

### Krok 2: Průzkum toolů

Vypiš tools dostupné v MCP serveru:
- Prozkoumej MCP server přímo
- Pochop vstupní/výstupní schémata, docstringy a popisy
- V téhle fázi tools BEZ TOHO, ABYS JE VOLAL

### Krok 3: Budování porozumění

Opakuj kroky 1 a 2, dokud tomu dobře neporozumíš:
- Iteruj víckrát
- Přemýšlej, jaké typy úloh chceš vytvořit
- Zpřesňuj své porozumění
- V ŽÁDNÉ fázi NEČTI kód samotné implementace MCP serveru
- Použij svou intuici a porozumění k vytvoření rozumných, realistických, ale VELMI náročných úloh

### Krok 4: Read-only průzkum obsahu

Až pochopíš API a tools, POUŽIJ tools MCP serveru:
- Prozkoumej obsah POUZE READ-ONLY a NEDESTRUKTIVNÍMI operacemi
- Cíl: najít konkrétní obsah (např. uživatele, kanály, zprávy, projekty, úkoly) pro tvorbu realistických otázek
- NESMÍŠ volat žádné tools, které mění stav
- NEBUDEŠ číst kód samotné implementace MCP serveru
- Tenhle krok paralelizuj — jednotliví subagenti sledují nezávislé linie průzkumu
- Zajisti, že každý subagent provádí jen READ-ONLY, NEDESTRUKTIVNÍ a IDEMPOTENTNÍ operace
- POZOR: NĚKTERÉ TOOLS můžou vrátit SPOUSTU DAT, což ti vyčerpá KONTEXT
- Při průzkumu dělej PŘÍRŮSTKOVÁ, MALÁ A CÍLENÁ volání toolů
- Ve všech voláních toolů omez počet výsledků parametrem `limit` (<10)
- Používej stránkování

### Krok 5: Generování úloh

Po průzkumu obsahu vytvoř 10 čitelných otázek:
- LLM by na ně mělo být schopné odpovědět pomocí MCP serveru
- Dodrž všechna pravidla pro otázky a odpovědi výše

## Výstupní formát

Každý QA pár se skládá z otázky a odpovědi. Výstupem má být XML soubor s touhle strukturou:

```xml
<evaluation>
   <qa_pair>
      <question>Najdi projekt založený v Q2 2024 s nejvyšším počtem dokončených úkolů. Jak se ten projekt jmenuje?</question>
      <answer>Website Redesign</answer>
   </qa_pair>
   <qa_pair>
      <question>Vyhledej issues se štítkem "bug", které byly uzavřené v březnu 2024. Který uživatel jich uzavřel nejvíc? Uveď jeho uživatelské jméno.</question>
      <answer>sarah_dev</answer>
   </qa_pair>
   <qa_pair>
      <question>Najdi pull requesty, které měnily soubory v adresáři /api a byly mergnuté mezi 1. a 31. lednem 2024. Kolik různých přispěvatelů na těchto PR pracovalo?</question>
      <answer>7</answer>
   </qa_pair>
   <qa_pair>
      <question>Najdi repozitář s nejvíc hvězdami, který vznikl před rokem 2023. Jak se ten repozitář jmenuje?</question>
      <answer>data-pipeline</answer>
   </qa_pair>
</evaluation>
```

## Příklady evaluací

### Dobré otázky

**Příklad 1: Multi-hop otázka vyžadující hluboké prozkoumání (GitHub MCP)**
```xml
<qa_pair>
   <question>Najdi repozitář, který byl archivovaný v Q3 2023 a předtím býval nejvíc forkovaným projektem v organizaci. Jaký byl v tom repozitáři hlavní programovací jazyk?</question>
   <answer>Python</answer>
</qa_pair>
```

Proč je tahle otázka dobrá:
- Vyžaduje víc hledání, aby se našly archivované repozitáře
- Je potřeba zjistit, který měl před archivací nejvíc forků
- Vyžaduje projít detaily repozitáře kvůli jazyku
- Odpověď je jednoduchá, ověřitelná hodnota
- Stojí na historických (uzavřených) datech, která se nezmění

**Příklad 2: Vyžaduje porozumění kontextu bez shody klíčových slov (Project Management MCP)**
```xml
<qa_pair>
   <question>Najdi iniciativu zaměřenou na zlepšení onboardingu zákazníků, která byla dokončená koncem roku 2023. Vedoucí projektu po jejím dokončení vytvořil retrospektivní dokument. Jaký měl v té době pracovní titul?</question>
   <answer>Product Manager</answer>
</qa_pair>
```

Proč je tahle otázka dobrá:
- Nepoužívá konkrétní název projektu („iniciativa zaměřená na zlepšení onboardingu zákazníků“)
- Vyžaduje najít dokončené projekty z konkrétního období
- Je potřeba identifikovat vedoucího projektu a jeho roli
- Vyžaduje pochopit kontext z retrospektivních dokumentů
- Odpověď je čitelná pro člověka a stabilní
- Stojí na dokončené práci (nezmění se)

**Příklad 3: Složitá agregace vyžadující víc kroků (Issue Tracker MCP)**
```xml
<qa_pair>
   <question>Mezi všemi bugy nahlášenými v lednu 2024 označenými kritickou prioritou — který řešitel vyřešil nejvyšší procento svých přidělených bugů do 48 hodin? Uveď jeho uživatelské jméno.</question>
   <answer>alex_eng</answer>
</qa_pair>
```

Proč je tahle otázka dobrá:
- Vyžaduje filtrovat bugy podle data, priority a stavu
- Je potřeba seskupit je podle řešitele a spočítat míru vyřešení
- Vyžaduje porozumět timestampům a určit 48hodinová okna
- Testuje stránkování (bugů může být hodně)
- Odpověď je jediné uživatelské jméno
- Stojí na historických datech z konkrétního období

**Příklad 4: Vyžaduje syntézu napříč víc typy dat (CRM MCP)**
```xml
<qa_pair>
   <question>Najdi účet, který v Q4 2023 přešel z tarifu Starter na Enterprise a měl nejvyšší roční hodnotu kontraktu. V jakém odvětví tenhle účet působí?</question>
   <answer>Healthcare</answer>
</qa_pair>
```

Proč je tahle otázka dobrá:
- Vyžaduje porozumět změnám úrovní předplatného
- Je potřeba najít události upgradu v konkrétním období
- Vyžaduje porovnat hodnoty kontraktů
- Je nutné dostat se k informaci o odvětví účtu
- Odpověď je jednoduchá a ověřitelná
- Stojí na dokončených historických transakcích

### Špatné otázky

**Příklad 1: Odpověď se mění v čase**
```xml
<qa_pair>
   <question>Kolik otevřených issues je aktuálně přiřazeno inženýrskému týmu?</question>
   <answer>47</answer>
</qa_pair>
```

Proč je tahle otázka špatná:
- Odpověď se změní, jak budou issues vznikat, zavírat se nebo se přeřazovat
- Nestojí na stabilních/stacionárních datech
- Spoléhá na „aktuální stav“, který je dynamický

**Příklad 2: Moc snadné přes vyhledávání podle klíčových slov**
```xml
<qa_pair>
   <question>Najdi pull request s názvem "Add authentication feature" a řekni mi, kdo ho vytvořil.</question>
   <answer>developer123</answer>
</qa_pair>
```

Proč je tahle otázka špatná:
- Jde vyřešit přímočarým vyhledáním přesného názvu
- Nevyžaduje hluboké prozkoumání ani porozumění
- Není potřeba žádná syntéza ani analýza

**Příklad 3: Nejednoznačný formát odpovědi**
```xml
<qa_pair>
   <question>Vypiš všechny repozitáře, které mají jako hlavní jazyk Python.</question>
   <answer>repo1, repo2, repo3, data-pipeline, ml-tools</answer>
</qa_pair>
```

Proč je tahle otázka špatná:
- Odpověď je seznam, který může přijít v libovolném pořadí
- Těžko se ověřuje přímým porovnáním řetězců
- LLM to může naformátovat jinak (JSON pole, oddělené čárkami, po řádcích)
- Lepší je ptát se na konkrétní agregát (počet) nebo superlativ (nejvíc hvězd)

## Postup ověření

Až evaluace vytvoříš:

1. **Projdi XML soubor**, ať rozumíš schématu
2. **Načti každé zadání úlohy** a paralelně, pomocí MCP serveru a jeho toolů, najdi správnou odpověď tím, že úlohu vyřešíš SÁM
3. **Označ všechny operace**, které vyžadují ZÁPIS nebo DESTRUKTIVNÍ akci
4. **Posbírej všechny SPRÁVNÉ odpovědi** a nahraď v dokumentu ty nesprávné
5. **Odstraň každý `<qa_pair>`**, který vyžaduje ZÁPIS nebo DESTRUKTIVNÍ operace

Nezapomeň řešení úloh paralelizovat, ať ti nedojde kontext — pak posbírej všechny odpovědi a proveď změny v souboru najednou na konci.

## Tipy na kvalitní evaluace

1. **Dobře přemýšlej a plánuj dopředu**, než začneš generovat úlohy
2. **Paralelizuj, kde to jde** — zrychlíš proces a ušetříš kontext
3. **Zaměř se na realistické use casy**, kterých by lidi reálně chtěli dosáhnout
4. **Tvoř náročné otázky**, které testují hranice schopností MCP serveru
5. **Zajisti stabilitu** tím, že použiješ historická data a uzavřené koncepty
6. **Ověř odpovědi** tak, že otázky vyřešíš sám pomocí toolů MCP serveru
7. **Iteruj a zpřesňuj** podle toho, co se během procesu naučíš

---

# Spouštění evaluací

Až budeš mít evaluační soubor hotový, můžeš k otestování MCP serveru použít přiložený evaluační harness.

## Nastavení

1. **Připrav izolované závislosti** podle [scripts/README.md](../scripts/README.md).
   Přímé verze jsou v requirements.txt, před instalací vytvoř a prověř úplný lock s hashi
   v cílovém vývojovém projektu. Neinstaluj nezafixované balíčky do globálního Pythonu.
2. **Omez testovací prostředí.** Připoj pouze vlastní testovací MCP server s technicky
   vynuceným read-only přístupem a syntetickými daty. Evaluátor sám oprávnění neomezuje;
   read-only formulace otázek nestačí. Uživatel musí předem odsouhlasit přenos dat do
   Anthropic API a využití placeného limitu.
3. **Nastav API klíč** přes správce tajemství nebo skrytý vstup. Nezadávej jeho hodnotu
   přímo do příkazu, chatu ani reportu. Používej testovací klíč s omezeným rozpočtem.

## Formát evaluačního souboru

Evaluační soubory používají XML formát s elementy `<qa_pair>`:

```xml
<evaluation>
   <qa_pair>
      <question>Najdi projekt založený v Q2 2024 s nejvyšším počtem dokončených úkolů. Jak se ten projekt jmenuje?</question>
      <answer>Website Redesign</answer>
   </qa_pair>
   <qa_pair>
      <question>Vyhledej issues se štítkem "bug", které byly uzavřené v březnu 2024. Který uživatel jich uzavřel nejvíc? Uveď jeho uživatelské jméno.</question>
      <answer>sarah_dev</answer>
   </qa_pair>
</evaluation>
```

## Spuštění evaluací

Evaluační skript (`scripts/evaluation.py`) podporuje tři typy transportu:

**Důležité:**
- **stdio transport**: Evaluační skript si proces MCP serveru spustí a spravuje sám. Nespouštěj server ručně.
- **sse/http transport**: Server musíš spustit zvlášť ještě před evaluací. Skript se připojí k už běžícímu serveru na zadané URL.

### 1. Lokální STDIO server

Pro lokálně běžící MCP servery (skript server spustí automaticky):

```bash
python scripts/evaluation.py \
  -t stdio \
  -c python \
  -a my_mcp_server.py \
  evaluation.xml
```

S neprivátními proměnnými prostředí (skutečné klíče do argumentu `-e` nepatří):
```bash
python scripts/evaluation.py \
  -t stdio \
  -c python \
  -a my_mcp_server.py \
  -e TEST_MODE=true \
  -e DEBUG=true \
  evaluation.xml
```

### 2. Server-Sent Events (SSE)

Pro MCP servery postavené na SSE (server musíš spustit první):

```bash
python scripts/evaluation.py \
  -t sse \
  -u https://example.com/mcp \
  -H "X-Custom-Header: value" \
  evaluation.xml
```

### 3. HTTP (Streamable HTTP)

Pro MCP servery postavené na HTTP (server musíš spustit první):

```bash
python scripts/evaluation.py \
  -t http \
  -u https://example.com/mcp \
  evaluation.xml
```

## Volby příkazové řádky

```
usage: evaluation.py [-h] [-t {stdio,sse,http}] [-m MODEL] [-c COMMAND]
                     [-a ARGS [ARGS ...]] [-e ENV [ENV ...]] [-u URL]
                     [-H HEADERS [HEADERS ...]] [-o OUTPUT]
                     eval_file

positional arguments:
  eval_file             Cesta k evaluačnímu XML souboru

optional arguments:
  -h, --help            Zobrazí nápovědu
  -t, --transport       Typ transportu: stdio, sse, nebo http (výchozí: stdio)
  -m, --model           Model Claude, který se použije (výchozí: claude-3-7-sonnet-20250219)
  -o, --output          Soubor pro výstupní report (výchozí: výpis na stdout)

stdio options:
  -c, --command         Příkaz pro spuštění MCP serveru (např. python, node)
  -a, --args            Argumenty příkazu (např. server.py)
  -e, --env             Proměnné prostředí ve formátu KEY=VALUE

sse/http options:
  -u, --url             URL MCP serveru
  -H, --header          HTTP hlavičky ve formátu 'Key: Value'
```

## Výstup

Evaluační skript vygeneruje podrobný report, který obsahuje:

- **Souhrnné statistiky**:
  - Přesnost (správné/celkem)
  - Průměrná doba trvání úlohy
  - Průměrný počet volání toolů na úlohu
  - Celkový počet volání toolů

- **Výsledky po úlohách**:
  - Prompt a očekávaná odpověď
  - Skutečná odpověď agenta
  - Jestli byla odpověď správná (✅/❌)
  - Doba trvání a detaily volání toolů
  - Agentovo shrnutí jeho postupu
  - Agentova zpětná vazba k toolům

### Uložení reportu do souboru

```bash
python scripts/evaluation.py \
  -t stdio \
  -c python \
  -a my_server.py \
  -o evaluation_report.md \
  evaluation.xml
```

## Kompletní ukázkový workflow

Tady je kompletní příklad, jak evaluaci vytvořit a spustit:

1. **Vytvoř evaluační soubor** (`my_evaluation.xml`):

```xml
<evaluation>
   <qa_pair>
      <question>Najdi uživatele, který v lednu 2024 založil nejvíc issues. Jaké je jeho uživatelské jméno?</question>
      <answer>alice_developer</answer>
   </qa_pair>
   <qa_pair>
      <question>Který repozitář měl mezi všemi pull requesty mergnutými v Q1 2024 nejvyšší počet? Uveď název repozitáře.</question>
      <answer>backend-api</answer>
   </qa_pair>
   <qa_pair>
      <question>Najdi projekt, který byl dokončený v prosinci 2023 a měl nejdelší trvání od začátku do konce. Kolik dní zabral?</question>
      <answer>127</answer>
   </qa_pair>
</evaluation>
```

2. **Nainstaluj závislosti**:

```bash
# Nejprve prověřený lock a oddělený venv podle scripts/README.md.
# API klíč už musí být poskytnut správcem tajemství nebo skrytým vstupem.
```

3. **Spusť evaluaci**:

```bash
python scripts/evaluation.py \
  -t stdio \
  -c python \
  -a github_mcp_server.py \
  -o github_eval_report.md \
  my_evaluation.xml
```

4. **Projdi report** v `github_eval_report.md` a:
   - Podívej se, které otázky prošly a které selhaly
   - Přečti si zpětnou vazbu agenta k tvým toolům
   - Najdi, co jde zlepšit
   - Iteruj na návrhu svého MCP serveru

## Řešení problémů

### Chyby připojení

Když dostáváš chyby připojení:
- **STDIO**: Ověř, že příkaz a argumenty jsou správné
- **SSE/HTTP**: Zkontroluj, že URL je dostupná a hlavičky jsou správné
- Ujisti se, že potřebné API klíče jsou nastavené v proměnných prostředí nebo v hlavičkách

### Nízká přesnost

Když hodně evaluací selhává:
- Projdi zpětnou vazbu agenta u každé úlohy
- Zkontroluj, jestli jsou popisy toolů jasné a úplné
- Ověř, že vstupní parametry jsou dobře zdokumentované
- Zvaž, jestli tools nevrací moc nebo naopak málo dat
- Zajisti, že chybové hlášky jsou akceschopné

### Timeouty

Když úlohy padají na timeout:
- Použij schopnější model (např. `claude-3-7-sonnet-20250219`)
- Zkontroluj, jestli tools nevrací moc dat
- Ověř, že stránkování funguje správně
- Zvaž zjednodušení složitých otázek
