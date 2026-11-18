---
name: carousel
description: Navrhuj carousely na sociální sítě (Instagram + LinkedIn) ve vizuálním stylu samotného uživatele. Použij, když si uživatel řekne o carousel, slajdový post, IG/LinkedIn carousel, „swipe" post nebo dokumentový post. Generuje varianty pro každý kanál zvlášť a replikuje vizuální styl uživatele podle jeho brandových referencí.
---

# /carousel — carousely v brandu pro Instagram a LinkedIn

Udělá z tématu nebo z kusu obsahu hotový carousel k prolistování — navržený **ve značce samotného
uživatele**, ne v generické šabloně. Dva kanály, dva samostatné buildy, pokaždé.

## Než začneš navrhovat: poznej značku

Carousel je dobrý přesně tak, jak dobře vypadá *v brandu*. Při prvním použití (nebo když ještě nemáš
brand profil) **projdi nastavení značky v [`README.md`](README.md)** — provede uživatele jeho barvami,
fonty a tonalitou a požádá ho, ať hodí pár ukázkových grafik, které se mu líbí, do
`skills/carousel/brand-references/` (cesta od kořene workspace). Přečti si, co v té složce je, a trefuj to: paletu, typografii,
rozestupy, náladu. Pokud brand profil už existuje, načti ho a rozhovor přeskoč. **Když je složka
prázdná, ZASTAV SE a požádej uživatele, ať do ní dá 5–10 referencí, než začneš navrhovat — nevyráběj
generický carousel.**

Nikdy nehádej značku, když ti uživatel dal reference — replikuj to, co vidíš.

## Jediné pravidlo: dva kanály, dva buildy

**Instagram a LinkedIn jsou různé produkty. Každý stav od nuly — nikdy jeden nezmenšuj ani nerecykluj
pro druhý.** Mají jiné publikum, jiné rozměry i jiný kontext čtení, takže se liší i texty a design.

| | Instagram | LinkedIn |
|---|---|---|
| **Formát** | Vizuálně vedený carousel | Dokumentový post (PDF) |
| **Plátno** | 1080×1350 (na výšku) | 1080×1080 (čtverec) |
| **Text** | Sevřenější, úderný, vedený obrazem | **≥ 44px** (musí být čitelný na mobilu ve feedu) |
| **Hustota** | Míň textu, víc vizuálu | Víc obsahu na slajdu je v pohodě |
| **Hlas** | Chytit a udržet, emotivní | Vedený insightem, profesionální |
| **Export** | PNG na každý slajd | Jedno vícestránkové **PDF** (nativní dokumentový post) |

## Znalosti o kanálech, které agent NESMÍ splést

Tohle jsou draze vykoupená pravidla. Když kterékoliv z nich zvoríš, carousel vypadá amatérsky nebo je
nečitelný — ber je jako fakta, ne jako doporučení.

**LinkedIn:**
- **Carousel na LinkedInu je PDF, ne obrázky.** LinkedIn má nativní *dokumentový post* — stavíš
  vícestránkové **PDF** a nahráváš ho jako dokument. Nikdy to neposílej jako samostatné obrázkové
  slajdy; nepůjde to prolistovat jako carousel.
- **Písmo MUSÍ být větší než na Instagramu.** Tohle je chyba číslo jedna. LinkedIn vykresluje
  dokumenty ve feedu malé a většina lidí čte na mobilu. Text **≥ 44px**, nadpisy výrazně větší
  (cca 60–96px). Text nadimenzovaný na Instagram je tady nečitelný.
- Bezpečné plátno je čtverec **1080×1080** (funguje i na výšku 1200×1500). Hodně textu nevadí —
  tohle publikum čte. Miř na **8–12 stránek**.
- Nech velkorysé bezpečné okraje, ať se nic neořízne, až LinkedIn dokument narámuje.

**Instagram:**
- **Carousel na Instagramu jsou obrázky (PNG), ne PDF.** Exportuj jeden PNG na slajd. Na výšku
  **1080×1350** zabere ve feedu nejvíc místa; 1080×1080 je taky v pohodě.
- Písmo může být menší a vizuálnější než na LinkedInu, ale pořád čitelné palcem. **Vede design, text
  ho doplňuje** — míň textu na slajd. Maximálně **10 slajdů**.
- Opři se do estetiky: silný vizuál v hooku, konzistentní mřížka, nálada značky vepředu a na očích.

**Oba:** slajd 1 je hook, co zastaví scroll; poslední slajd je jasné CTA. A znovu — **oba stav
odděleně už od začátku; nikdy nezmenšuj ani nerecykluj slajdy z jednoho kanálu pro druhý.**

## Postup

1. **Vyjasni si cíl** — téma, jednu myšlenku, kterou každý slajd posouvá, a výsledek (uložení?
   návštěvy profilu? proklik na CTA?). Když ti uživatel dal post nebo článek, vytěž ho pro carousel.
2. **Nejdřív napiš texty, zvlášť pro každý kanál.** Struktura: **hook slajd** (zastav scroll) →
   4–8 **hodnotových slajdů** (jedna myšlenka na slajd) → **CTA slajd** (co dál). Na Instagramu drž
   texty krátké; LinkedIn unese víc. Žádný slajd nesmí vyžadovat druhé přečtení.
3. **Navrhni to v brandu.** Vygeneruj **jeden samostatný HTML soubor na kanál** (jedna `<section>` na
   slajd v rozměru plátna výš), aplikuj barvy a fonty značky a *vzhled* ze složky `skills/carousel/brand-references/`.
   Konzistentní okraje, jasná hierarchie písma, čísla stránek a decentní značka na každém slajdu.
   Drž to ploché a čisté, pokud reference neříkají jinak.
4. **Exportuj.**
   - Instagram → každou sekci se slajdem vyfoť do **PNG** ve 2× (aby to bylo ostré na retině).
   - LinkedIn → vytiskni/exportuj celou sadu do jednoho **PDF** (to je to, co dokumentový post spolkne).
   - Když je napojené MCP na generování obrázků nebo na prohlížeč, použij ho k renderu; jinak vydej
     HTML a uživateli přesně popiš, jak to exportovat (otevřít v prohlížeči → tisk do PDF / screenshot).
5. **Dodej obě varianty** jasně označené a k tomu návrh popisku k postu pro každý kanál.

## Laťka kvality

- Čitelnost vyhrává nad vychytralostí — když je text namačkaný nebo má malý kontrast, oprav to.
- Jedna myšlenka na slajd. Když jsou na slajdu dvě, rozděl ho.
- Hook slajd si zaslouží swipe; CTA slajd si zaslouží akci.
- Na první pohled to má vypadat jako značka *tohohle* uživatele — o tom celé ty reference jsou.

## Jak to držet ostré

Když uživatel návrh opraví („víc prázdného místa", „náš akcent je teplejší"), aktualizuj brand profil
v `README.md`, ať příští carousel startuje blíž. Dovednost má být s každým kolem víc jeho.
