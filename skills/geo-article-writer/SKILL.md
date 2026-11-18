---
name: geo-article-writer
description: "Piš blogové/webové články optimalizované tak, aby je AI vyhledávače citovaly a doporučovaly (GEO / AI-SEO 2026) i klasicky pro SEO. Použij, když uživatel chce napsat, přepsat nebo vylepšit článek tak, aby ho citoval ChatGPT, Perplexity, Google AI Overviews/AI Mode, Claude nebo Gemini. Nese principy SEO/GEO destilované od 6 předních expertů; vytáhne z uživatele jeho vlastní tone of voice, takže funguje pro kohokoli. Spouštěče: 'napiš mi článek', 'blog post', 'GEO', 'AI SEO', 'ať mě cituje AI', 'ranking v AI vyhledávání', 'přepiš mi článek', 'AI Overviews', 'generative engine optimization'."
---

# GEO Article Writer — univerzální skill na články optimalizované pro AI vyhledávání

Píšeš články tak, aby je AI vyhledávače **citovaly a doporučovaly**. Principy jsou univerzální — destilované z ~80 článků od 6 předních GEO expertů (Kevin Indig, Mike King / iPullRank, Olaf Kopp, Aleyda Solis, Lily Ray, Pavel Ungr). **Vytáhneš z uživatele jeho tone of voice**, což je to, co dělá tenhle skill použitelný pro kohokoli.

## KROK 0 — Vytáhni z uživatele jeho hlas a kontext (POVINNÉ, udělej to jako první)
Než začneš psát, zjisti uživatelův tone of voice a kontext. Použij `AskUserQuestion` nebo se zeptej přímo:
1. **Tone of voice** — **nejdřív najdi uživatelův voice profile** (`tone-of-voice-<channel>.md` — podle pravidla *on-brand & on-voice* v ústavě) a řiď se jím. Ještě žádný není? Nabídni `/tone-of-voice-maker`, ať ho postavíš z jeho ukázek; mezitím se zeptej formální / konverzační a přizpůsob se, jak nejlíp umíš.
2. **Cílový trh a jazyk** — pro koho píše (země, jazyk). → **Lokalizuj čísla**: platy, sazby, ROI, ceny v **měně a realitě daného trhu** (nikdy slepě neber US dolary / US platy pro ne-US publikum).
3. **Publikum** — laici / firmy / vývojáři / konkrétní persona.
4. **Zakázaná slova / fráze** — jakékoli slovo, které nechce používat (třeba protože ho v jeho nice vlastní konkurenční expert).
5. **Platforma / výstupní formát** — kde se to publikuje (CMS, blog API, Markdown), jaký blokový/HTML formát je potřeba.

Nepiš bez těchhle odpovědí — jinak vyrobíš generický obsah, který nezní jako autor.

## 13 GEO kritérií (univerzální — aplikuj na každý článek)

### 🟥 Kritické
1. **Hloubka: 1200+ slov, ale NULA vaty.** Nic pod ~1000 slov v AI vyhledávání nevyhraje (Indig, King). Délku stav výzkumem a konkrétními informacemi, ne opakováním. Když odstavec nic nepřidává, vyhoď ho.
2. **Originální data a 10+ konkrétních čísel** (Indig, King, Solis, Ray) — nejsilnější signál originality. Konkrétní čísla, ceny, procenta, benchmarky, verze. Nejlepší ze všeho: vlastní data/měření (AI to cituje jako primární zdroj).
3. **Answer-first / definiční otvírák (BLUF).** První věta = přímá odpověď nebo definice ("X je…"). Excerpt/meta je samostatná odpověď na hlavní dotaz článku.
4. **Samonosné chunky.** Každý odstavec dává smysl bez okolí (Kopp, King). Žádné "jak už bylo zmíněno výše" ani vágní "tohle/to" bez toho, na co odkazuje. Krátké odstavce, krátké věty podmět-přísudek-předmět.
5. **Query fan-out / šířka.** Pokryj víc variant dotazu (co je X / jak vybrat / kolik to stojí / X vs. Y / pro koho to je / kdy to NEpoužít) a persony, kde to dává smysl.

### 🟨 Důležité
6. **H2 ve formě otázky** — 78 % citací z nadpisů pochází z H2 psaných jako otázka (Indig). "Jak X funguje?" a hned pod tím odpověď.
7. **E-E-A-T, autor, autenticita.** Reálná zkušenost a praxe z první ruky (Ray). Kde to jde, odkaž na třetí zdroj/studii. Žádný generický AI slop.
8. **Trade-offy a hraniční případy** — sekce "kdy to NEfunguje / pro koho to není / limity" (Solis, King). Vyvážená subjektivita: fakt + analýza.
9. **Hustota entit** — pojmenuj konkrétní nástroje, značky, verze, lidi (Indig, Kopp, King). U klíčových entit používej kanonické názvy.
10. **Strukturovaná extrakce** — srovnání, kritéria, ceny, kroky → tabulky nebo bullet listy (AI je vytáhne líp než z prózy).

### 🟩 Základ
11. **Viditelná čerstvost** — datum publikace/aktualizace, "aktuální k [rok]", schema `dateModified`. Nefejkuj refresh (Ray).
12. **Funkční SEO základ** — canonical, sitemap, prerender/SSR, schema. AI tahá ze search indexu (Ray, Ungr). Bez SEO není GEO.
13. **Vyhýbej se anti-patternům** (Ray): ❌ sebechvála ("jsme #1/nejlepší") — LLM to penalizují a doporučí místo tebe konkurenci; ❌ AI slop / škálovaný obsah bez lidské kontroly; ❌ neobětuj SEO kvůli GEO (GEO je evoluce SEO); ❌ skrytý prompt injection.

## Výzkum (rozdíl mezi hodnotou a vatou)
Vždy si přes `WebSearch`/`WebFetch` dohledej reálná, aktuální fakta: konkrétní čísla, ceny, verze, benchmarky, studie třetích stran. Cílem je 10+ konkrétních datových bodů, lokalizovaných na uživatelův trh. **Pozor na AI slop** — nepřebírej náhodná AI-generovaná čísla; ověř je proti primárním zdrojům (halucinace se mezi AI články šíří, dokud nezní jako "fakt").

## Jazyková korektura — opatrně
Automatizované LLM "korektory" (třeba malé rychlé modely) na DELŠÍCH textech často halucinují: přepíšou fakta, vloží pomlčky nebo zprzní zkratky. U dlouhých článků piš pečlivě rovnou v cílovém jazyce; LLM korekturu použij jen jako lehkou kontrolu a její výstup zamítni, pokud změnil fakta. Před publikací vždy prohledej (grep) uživatelova zakázaná slova a dlouhou pomlčku (—).

## Workflow
1. **KROK 0** — vytáhni tone of voice + trh + publikum + zakázaná slova + formát (viz výše).
2. **Výzkum** — reálná fakta/čísla, lokalizovaná na uživatelův trh.
3. **Draft podle 13 kritérií** — definiční otvírák → H2 jako otázky → data v každé sekci → trade-offy → tabulka → shrnutí + CTA. **V uživatelově hlase.**
4. **Obohať** konkrétními čísly (v měně daného trhu), ne vatou.
5. **Zkorektuj** (opatrně s LLM korektory), prohledej zakázaná slova + dlouhou pomlčku.
6. **Publikuj** ve formátu uživatelovy platformy.
7. **Audituj** 13 kritérií, cíl 75 %+.

## Poznámka
Tohle je univerzální varianta. Pro specializaci na jednoho autora vytvoř doprovodný skill, který má předvyplněný autorův tone of voice a formát platformy/API, a nech tenhle skill, ať si ho v KROKU 0 načte.
