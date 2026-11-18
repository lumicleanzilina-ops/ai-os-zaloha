---
name: morning-briefing
description: >
  Denní briefing — stáhne dnešní kalendář, faktury po splatnosti i čekající na platbu,
  obchodní pipeline, e-maily, které chtějí reakci, otevřené úkoly a registr otevřených bodů do jednoho
  přehledu s prioritami dne. Automatický běh je volitelný: začne až po volbě uživatele, zapojení plánovače a ověření skutečného běhu.
---

# Ranní briefing

Jsi uživatelův AI Chief of Staff. Připrav dnešní briefing: jeden přehledný souhrn všeho,
co dnes ráno potřebuje jeho pozornost.

> **Tohle si při nastavení uprav na míru.** Navazuj na [ranní briefing v ONBOARDING](../../ONBOARDING.md#6-briefing-a-automatizace-podle-uživatele). Průvodce podle zájmu
> zjistí uživatelovo skutečné ráno — které schránky (pracovní / osobní), jestli chce v briefingu
> kalendář, úkoly, peníze a pipeline, a co má vlastně napojené — a podle toho tenhle soubor ořeže.
> Nech jen sekce, které sedí na *jeho* ráno; briefing ušitý na to, co reálně každý den kontroluje,
> je lepší než obecný. Nejprve připrav jeden briefing ze skutečných zdrojů. Rozvrh zapoj až podle
> uživatelovy volby času, časové zóny a doručení; už existující automatizaci uprav, neduplikuj ji.
> V Claude Desktopu úlohu v appce zakládá uživatel podle [postupu pro ranní rutinu](../README.md#ranní-rutina-v-claude-desktopu); ty mu připravíš text instrukcí a s ním ověříš Run now.

Pracuj s **těmi integracemi, které má uživatel napojené**. Každá sekce níž je volitelná — když
příslušný nástroj napojený není, sekci tiše přeskoč (nevypisuj prázdný placeholder ani chybu).
Jmenované služby jsou příklady, ne podmínka.

## Postup — kroky spouštěj PARALELNĚ, kde to jde

### 1. Kalendář — co je dneska?
- Přes uživatelovo **MCP na kalendář** (např. Google Calendar, Outlook) vypiš dnešní události.
- Každou schůzku ukaž jako `HH:MM–HH:MM Název` — začátek **i** konec, ať je délka vidět
  na první pohled. U celodenních / otevřených událostí piš `Název (celý den)`.
- Zmiň, co potřebuje přípravu (externí účastníci, call, který má vést, review).

### 2. Otevřené úkoly
- Použij uživatelovo **MCP na úkoly / projekty** (např. Notion, Linear, Jira, Todoist).
- Vytáhni úkoly, které **nejsou hotové**. Seskup je podle naléhavosti:
  - **Dnes / urgentní** — termín dnes nebo výslovně označené
  - **Tento týden** — termín do konce týdne
  - **Backlog** — bez termínu nebo daleko (uveď jen počet, nevypisuj je)
- Přečti i registr `docs/otevrene-body.md` (funguje bez jakéhokoli napojení). Vezmi otevřené body,
  které mají termín dnes, prošlý termín, nebo čekají na uživatele. Ostatní jen spočítej.

### 3. Faktury — peníze, které mají přijít
- Použij uživatelovo **MCP na fakturaci / účetnictví** (např. Stripe, Fakturoid, QuickBooks,
  Xero). Když má víc účtů nebo firem, projdi každý zvlášť.
- Vytáhni faktury **po splatnosti** a faktury **odeslané / čekající na platbu**.
- U každé faktury po splatnosti vypiš: klient · částka · dní po splatnosti.
- Když dotaz vrátí prázdno a máš důvod čekat data, zkus to ještě jednou, než usoudíš,
  že tam nic není.

### 4. Pipeline — otevřené dealy
- Použij uživatelovo **MCP na CRM** (např. GoHighLevel, HubSpot, Pipedrive, Salesforce).
- Ukaž otevřené příležitosti a celkovou hodnotu otevřené pipeline.
- Označ dealy, které **stagnují** (7+ dní beze změny) — právě ty nejčastěji vyšumí.

### 5. E-maily, které chtějí reakci
- Použij uživatelovo **MCP na e-mail** (např. Gmail, Outlook). Když má víc schránek
  (třeba pracovní + osobní), projdi každou a u každé položky uveď, ze které schránky je.
- **Koukej jen na posledních ~7 dní.** Co je starší a týden se to nevyřešilo, je nejspíš
  mrtvé — ignoruj to.
- Pusť několik doplňujících dotazů, ať nic neproklouzne, například:
  - nepřečtené v doručených za posledních 7 dní (nové)
  - přečtené v doručených za posledních 7 dní (pořád můžou čekat na odpověď)
  - odeslané za posledních 7 dní (kontext k rozjetým vláknům)
- Každé vlákno zařaď:
  - **Odpovědět dnes** — klienti, nabídky, cokoliv urgentního nebo s termínem
  - **Tento týden** — méně urgentní, plánování, FYI, které ale chtějí odpověď
  - **Ignorovat** — newslettery, notifikace, promo, účtenky (uveď jen počet)

### 6. Output

Naformátuj briefing **přesně** takhle. Sekci, jejíž integrace není napojená, vynech.
Ať se to dá přečíst do 90 sekund.

```
# Ranní briefing — [Den v týdnu] [Datum]

🎯 Priority
🔴 Teď: [nejvýš 3 věci na dnešek, kdo je dělá]
🟡 Naplánovat: [důležité bez dnešního termínu → kdy]
🔵 Delegovat: [co udělá agent nebo rutina]

## Kalendář
[HH:MM]–[HH:MM] [název schůzky]
[HH:MM]–[HH:MM] [název schůzky]
— nebo —
Dnes žádné schůzky

## Úkoly

| Stav | Úkol | Projekt |
|--------|------|---------|
| Rozpracované | [název] | [projekt] |
| K udělání | [název] | [projekt] |

Backlog: [počet] úkolů (dnes není potřeba nic dělat)
— nebo —
Čisto

## Otevřené body
[O-0NN] [co] — [kdo] — [termín / čeká na uživatele]
Ostatní otevřené: [počet]

## Faktury & pipeline
Po splatnosti: [počet] · Čeká na platbu: [počet] · Otevřené dealy: [počet] (za [hodnota])
[detail po splatnosti: číslo faktury — klient — částka — X dní po splatnosti]
[stagnující deal — klient — hodnota — beze změny X dní]

## E-maily — [počet] chce reakci

### Odpovědět dnes
[odesílatel] · [předmět / téma] — [1–2 řádky: co chtějí, kontext, případný termín] [tag schránky]
...

### Tento týden
[odesílatel] · [předmět / téma] — [1–2 řádky kontextu] [tag schránky]
...

### Ignorováno
[počet] — [kategorie, oddělené čárkou]
```

## Pravidla formátu
- Úkoly se vždy vypisují jako tabulka — žádné odrážky, závorky ani kurzíva.
- Faktury po splatnosti se vždy rozepisují řádek po řádku: klient, částka, dní po splatnosti.
- Faktury & pipeline mají jeden souhrnný řádek a pod ním detailní řádky.
- Když má uživatel víc schránek, označ u každého e-mailu, ze které je, ať ví, kde ho otevřít
  (např. `[práce]`, `[osobní]`).
- Každý e-mail je jeden řádek: `[odesílatel] · [předmět / téma] — [1–2 řádky kontextu]`.
  Radši užitečný popis než strohý a k ničemu.
- Do „odpovědět dnes" + „tento týden" dej dohromady klidně ~10–15 e-mailů, pokud mají reálný
  potenciál k akci. Trocha šumu je lepší než přehlédnutá zpráva.
- **Ignorováno** je počet plus 2–3 kategorie — nikdy je nevypisuj jednotlivě.
- Priority jsou jen v bloku 🎯 Priority nahoře, podle [PRIORITIZACE](../../docs/PRIORITIZACE.md):
  nejvýš 3 věci v 🔴, každá srozumitelná bez kontextu, prázdné řádky vynech. Žádná další sekce
  „doporučené akce“.
- Otevřené body odkazuj ID a jedním řádkem; když v registru nic otevřeného není, sekci vynech.
- Žádné poznámky pod čarou, žádné vysvětlivky mimo strukturu výše.

## Ukládání (volitelné, ale doporučené)
Když má uživatel workspace v repu, ulož hotový briefing do
`docs/briefings/YYYY-MM-DD-briefing.md` (dnešní datum), ať se briefingy hromadí jako
prohledávatelná historie. Pak commitni **jenom ten jeden soubor**:

```bash
git add docs/briefings/<file> && git commit -m "briefing: YYYY-MM-DD"
```

Nikdy nespouštěj `git checkout`, `git reset`, `git stash`, `git clean` ani `git add -A` —
ve stejném repu můžou zároveň pracovat jiné session nebo scheduled tasky.
Když commit selže, nech soubor na disku a jen to zmiň v reportu.

## Plánovaná úloha v Claude Desktopu

Tato sekce je jen pro nastavení; při plánovaném běhu ji přeskoč a briefing sestav podle kroků výše.

Hotový ruční briefing lze nechat běžet sám. Úlohu v Claude Desktopu (záložka Code → Scheduled → New task) zakládá uživatel podle [postupu pro ranní rutinu](../README.md#ranní-rutina-v-claude-desktopu): složka je jeho workspace, zapnuté **Only on this computer**, rozvrh například **Weekdays** v jím zvolený čas. Naplánovaná úloha běží v čerstvé session bez paměti, proto jí dej samostatné instrukce, třeba:

> Pracovní složka je [ABSOLUTNÍ CESTA K WORKSPACE]. Přečti `docs/profil/user-preferences.md` a `docs/profil/user-systems.md` a podle `scheduled-tasks/morning-briefing/SKILL.md` připrav dnešní ranní briefing z mých napojených zdrojů ([VYBRANÉ ZDROJE]). Ulož ho do `docs/briefings/[RRRR-MM-DD]-briefing.md` a v odpovědi ho shrň. Nic neodesílej a nic nemaž; zdroj, který není dostupný, přeskoč a napiš to.

Lokální úloha běží jen se spuštěnou aplikací a probuzeným počítačem. Po vytvoření klikni na **Run now** a u žádostí o oprávnění zvol „always allow“, jinak ranní běh visí na dialogu. Briefing, který zdroj bez „always allow“ (MCP nástroj s `requiresUserInteraction`) volá při každém běhu, se vždy zastaví; takový zdroj z rutiny vynech.
