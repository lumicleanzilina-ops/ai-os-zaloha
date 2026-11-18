---
name: multi-model-deep-research
description: >
  Navrhni sadu deep-research promptů, které uživatel ručně rozešle do několika různých LLM
  (Claude / GPT / Gemini / Perplexity) k jednomu velkému rozhodnutí, a pak ověř, co se vrátí.
  Použij, když uživatel chce deep-research prompty, chce, ať několik modelů nezávisle prozkoumá
  nějakou věc, nebo přinese zpět výstupy z několika modelů k porovnání. NE pro interní review
  vlastního výstupu — na to je `second-opinion`.
---

# Multi-model deep research — dvě kola

## Proč tohle není "jeden prompt do čtyř modelů"

Když každý model dostane stejné zadání, dostaneš zpátky čtyři podobné odpovědi a **falešný pocit
potvrzení** — modely čtou stejné zdroje a dělají stejné chyby stejným směrem. Hodnota je v
**divergenci**. Nesouhlas je informace; shoda je jen hypotéza, která čeká na ověření.

Ověřeno na reálném produkčním běhu, na velkém nákupním rozhodnutí: čtyři samostatná zjištění, každé
za reálné peníze, přišla z **přesně jednoho** ze čtyř promptů a žádný jiný model je nezmínil.

## Kolo 1 — divergentní prompty (paralelně, nezávisle)

Rozděl je podle **disciplíny, ne podle podtématu**. Osvědčená čtveřice:

| # | Role | Ptá se | Typicky najde |
|---|---|---|---|
| 1 | **Technik / implementátor** | Co přesně se musí postavit? | fyzické konflikty, rozměry a specifikace |
| 2 | **Ekonom / TCO analytik** | Kolik to stojí a kdy se to vrátí? | citlivosti, body zvratu, skryté provozní náklady |
| 3 | **Regulatorní / dotační poradce** | Jak to zaplatíš a k čemu tě to zaváže? | deadliny, diskvalifikující podmínky, stropy |
| 4 | **Kritik / red team** | Co se rozbije? | co v zadání chybí, nevratná rozhodnutí |

**Kritik patří do kola 1, ne na konec** — kritizuje *zadání*, ne výstupy ostatních modelů.
Nezávislost mu umožní chytit něco, co ostatní tři minou kvůli sdílenému předpokladu. V případu za tímhle
skillem (velké rozhodnutí o rekonstrukci bydlení) byl kritik jediný ze čtyř, kdo označil konstrukční
detail, který se ukázal být významnou částí celého rozpočtu — detail, který ostatní tři, každý zabořený
ve své disciplíně, všichni minuli. Kdyby si nejdřív přečetl jejich výstupy, ukotvilo by ho to na jejich
rámci místo na samotném zadání.

**Každý prompt potřebuje stejná tvrdá pravidla:**
- Ber vstupy z přiloženého materiálu; cokoli chybí, označ `ASSUMPTION:` spolu s citlivostí výsledku na
  ten předpoklad.
- Každé číslo, které není ve zdrojovém materiálu, potřebuje zdroj a datum. Bez zdroje není číslo.
- **Pojmenuj rozpory v zadání** — nezahlazuj je.
- Uveď, co by muselo platit, aby bylo doporučení špatně.

## Kolo 2 — verifikátor (sekvenčně, jakmile se kolo 1 vrátí)

Pátý model dostane **každý výstup z kola 1 plus originální zdrojová data** a hledá:
① faktické rozpory mezi nimi (s verdiktem a odhadem nákladu) · ② čísla bez zdroje nebo čísla, která si
model dopočítal sám · ③ **tichou shodu, která může být sdílená chyba** · ④ co nikdo neřešil · ⑤ vnitřní
nekonzistenci uvnitř každého jednotlivého výstupu.

**Verifikátor nenavrhuje vlastní řešení** — jen rozhoduje o tom, co už bylo řečeno.

Přeskoč kolo 2 a skončíš u toho, že tu práci děláš ručně — poznáš to podle toho, že jsi to ty, kdo loví
chyby v ostatních výstupech. V případu za tímhle skillem: jeden model špatně přečetl sloupec v regulatorní
tabulce a tvrdil, že konkrétní úprava je pro rekonstrukční scénář v zadání povinná — nebyla; ten požadavek
platil jen pro novostavby. Vyplavalo to jen proto, že se to ověřilo proti primárnímu zdrojovému dokumentu.

## Kalibrační test — tenhle tam vždycky nech

**Než pošleš prompt pro kolo 2, vyřeš jeden konkrétní rozpor sám** (vytáhni primární zdroj, ověř ho) — a
**nedávej odpověď do promptu**. Když ho verifikátor najde, proces funguje. Když ho mine nebo potvrdí špatnou
verzi, teď víš, jak moc věřit zbytku jeho výstupu. Nestojí to nic navíc.

## Delivery

- **Dodej prompty v chatu**, ne jako soubor — uživatel je ručně kopíruje do rozhraní ostatních modelů. Jen
  **syntéza** na konci stojí za uložení do souboru nebo na sdílený disk; pracovní prompty session přežít
  nepotřebují.
- Doporuč, který prompt jde do kterého modelu, a **dej kritika/verifikátora do jiného modelu než technika**
  — ať to není stejná "hlava", co dělá obě práce.
- Zeptej se, jestli se výstupy z kola 1 vrátí jako soubory nebo vložené do chatu, a přepiš sekci **INPUTS**
  promptu pro kolo 2, ať tomu odpovídá.

## Syntéza, na konci

Když výstupy dorazí, **začni rozpory, ne shrnutím**. Seřaď je podle toho, kolik peněz nebo rizika na
každém z nich visí, a zakonči seznamem otázek na konkrétní lidi (dodavatel, statik, věřitel) — ne dalším
kolem výzkumu. Report je zadání k akci, ne newsletter.
