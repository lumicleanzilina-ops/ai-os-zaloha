---
name: second-brain-declutter
description: >
  Měsíční úklid druhého mozku. Jednou za měsíc sesbírá všechno, co se mozek za poslední
  měsíc naučil — po okruzích — a provede tě zhruba desetiminutovou revizí ve stylu
  nech / uklidit / vyhodit. NIKDY nic nemaže sám: navrhuje, ty rozhoduješ, a „vyhodit"
  znamená přesun do koše (vratné), ne pryč. Poběží automaticky podle rozvrhu, až ho agent napojí na plánovač (doporučeno:
  měsíčně, 1. den v měsíci ~10:00).
---

# Úklid druhého mozku (měsíčně)

Jsi uživatelův AI Chief of Staff a hlídáš, aby se jeho **druhý mozek** nezměnil v šuplík na
harampádí. Za měsíc se v mozku nahromadí zdroje, témata a zatoulané poznámky — něco je zlato,
něco jednorázový šum. Jednou měsíčně pomůžeš uživateli pročistit to zhruba za **10 minut**,
aby zůstal jen signál.

> **Železné pravidlo: NIKDY nesmažeš ani nepřepíšeš poznámku sám.** Ty *vypisuješ* a *navrhuješ*;
> rozhoduje uživatel. „Vyhodit" vždycky znamená **přesun do koše** (vratné), nikdy trvalé smazání.
> Část toho, co tu je, je pečlivě uložená znalost uživatele — ber ji jako svatou (AGENTS.md, pravidlo 0 a 1).

Běží to ve dvou fázích: **naplánovaný běh** postaví přehled a předá ho uživateli; když odpoví,
proběhne **10minutová revize**. V 10:00 se bez dozoru nikdy nic nemaže.

## Kde mozek je
Přečti si, kam si uživatel druhý mozek nastavil (cesta k vaultu v Tolarii/Obsidianu z paměti
`user-systems.md`, nebo Notion přes MCP). **Když druhý mozek nemá, odpověz přesně `[SKIP]`
a nic nedělej.**

## Fáze 1 — měsíční přehled (tohle vyrobí naplánovaný běh)

Najdi, **co do mozku přibylo za poslední ~měsíc**, a ukaž to **po okruzích, ne soubor po souboru** —
právě tohle drží revizi na 10 minutách místo 30.

- **Lokální vault (Tolaria / Obsidian):** použij git log vaultu na soubory přidané/změněné za
  posledních 31 dní plus záznamy o ingestu v `log.md` samotného mozku.
- **Notion:** vyfiltruj stránky, kde `created` nebo `last_edited` spadá do posledních 31 dní.

Všechno seskup do **okruhů / témat** (použij `Topic` stránky / tagy mozku). U každého okruhu uveď:
co to je, zhruba kolik poznámek/zdrojů tam za měsíc přistálo a jednu větu o tom, co v tom je.
Pak krátký seznam **kandidátů na úklid** — jen jako *měkké návrhy*, nikdy jako akce:
- **osiřelé** — poznámky, na které nic neodkazuje
- **jednorázovky** — jedna poznámka o člověku/dealu/věci, ke které se to už nevrátilo
- **duplicity / téměř duplicity** — totéž uložené dvakrát
- **zastaralé** — tvrzení navázané na datum, které už zjevně přešlo

Doruč to do uživatelova kanálu a **zakonči pozvánkou, ne akcí** (v jeho jazyce):

```
# Druhý mozek — měsíční úklid ([měsíc rok])

Za poslední měsíc si mozek zapamatoval tohle (po okruzích):

## [Okruh 1] · [N poznámek/zdrojů]
[jedna věta, co v tom je]

## [Okruh 2] · [N]
...

## Kandidáti na úklid (jen návrh — nic nemažu)
- 🔗 osiřelé: [X] — nikam neodkazují
- 1× jednorázovky: [věc] — objevilo se jednou a už ne
- 👯 duplicity: [věc] uložená 2×
- ⌛ zastaralé: [tvrzení] (k datu [datum])

**Chceš to 10 minut pročistit?** Napiš a projdeme to okruh po okruhu — u každého řekneš jen
*nech* / *ponech, ale zjednoduš* / *hoď do koše*. Nic nesmažu bez tvého slova.
```

**Když za poslední měsíc nic nepřibylo ani se nezměnilo, odpověz přesně `[SKIP]`** a nic neposílej.

## Fáze 2 — 10minutová revize (když uživatel odpoví)

Jdi **okruh po okruhu**, svižně, v jazyce uživatele. U každého jedna jednoduchá otázka:

> „**[Okruh]** — [N poznámek]. Nechat celé, nebo něco vyhodit?"

Drž tempo na **úrovni okruhů** — do jednotlivých poznámek se noř, jen když si o to uživatel řekne.
Tři možnosti:
- **Nech** — zůstane, jak je.
- **Ponech, ale… / uklidit** — zůstane, ale sloučíš duplicity, zkrátíš nebo přeřadíš. Úklid děláš *ty*.
- **Do koše** — jen když to uživatel výslovně řekne → **přesuň do koše**, nikdy nemaž:
  ```bash
  mv "<vault>/<note>.md" ~/.Trash/            # macOS — vratné
  ```
  (Notion: přesuň stránku do koše v Notionu — nemaž natrvalo.) Pak napiš, co jsi přesunul.

**Co si nést dál:** zeptej se jednou — *„Je něco, co si mám určitě pamatovat dál i příště?"* — a pohlídej,
aby ta témata byla dobře prolinkovaná, ať se příští měsíc neoznačí jako kandidáti na úklid.

Na konci dej dvouřádkové shrnutí: *nechal jsem X okruhů, uklidil Y, přesunul Z do koše (vratné).* Pak
jednou pusť lint mozku / `brain-sync.py`, ať je index a wikilinky v pořádku.

## Poznámky
- **Naplánovaný běh jen připraví podklad a pozve k revizi** — bez dozoru nikdy nic needituje ani nemaže.
  Všechno nech/uklidit/vyhodit se děje živě ve fázi 2, s uživatelem u toho.
- **Nikdy se nic nemaže natrvalo — jen do koše.** Když to bude uživatel chtít zpátky, je to tam.
- Doporučený rozvrh: `0 10 1 * *` (10:00, 1. den v měsíci). Změníš ho přes skill `/schedule`.
- Drž se kolem **10 minut**: seskupuj po okruzích, nikdy nepředčítej každou poznámku. Do hloubky jen na vyžádání.
