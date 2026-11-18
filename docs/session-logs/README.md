# session-logs/

Jeden záznam na pracovní session, jeden soubor na session. Zakládá ho sám hook `zaznam-session` (`RRRR-MM-DD-auto-<id8>.md`, `stav: automaticky-zaznam`), doplňuje ho skill `/end-session` nebo uzavření dne a přepíná ho na `stav: zapsano`.

**Kde záznamy leží.** Když máš druhý mozek (proměnná `SECOND_BRAIN_VAULT`), zapisuje hook záznamy rovnou do jeho složky `session-logs/` a tahle složka zůstává prázdná. Bez vaultu leží tady. Vždycky jen na jednom místě: soubor se nekopíruje. Záznam, který session už má, se dál píše tam, kde leží, i když vault nastavíš až později.

## Proč je vést

Tři věci, které ti záznam session dá a git historie ne:

- **Co se rozhodlo a proč** — úvaha, ne jen diff.
- **Co zůstalo otevřené** — aby příští session začala od skutečného stavu, ne od odhadu.
- **Surovina pro týdenní audit**, který je čte, aby v nich našel opakující se tření a udělal z něj
  pravidlo v `docs/learnings/`.

## Jak záznam vzniká

1. **Hook `zaznam-session` založí soubor sám** a během práce ho průběžně přepisuje (Stop nejvýš jednou za 5 minut, na konci session vždy). Nese `stav: automaticky-zaznam` a sekce **Zadání** (co jsi napsal), **Soubory** (co se upravilo) a **Commity**. Cestu k němu agentovi řekne na startu session. Bez modelu, bez sítě, tajemství v něm jsou začerněná.
2. **`/end-session`** (nebo automatické uzavření dne) do téhož souboru (ve vaultu, je-li) doplní shrnutí, rozhodnutí a otevřené body a ve frontmatteru přepne `stav: automaticky-zaznam` na `stav: zapsano`. Sekce od hooku zůstanou.
3. **Se `stav: zapsano` hook soubor už nepřepíše.** Nepřepíše ani soubor, který jsi ručně upravil a `stav` nechal: hook pozná, že ho po něm změnil někdo jiný, a ustoupí.
4. **Bez hooku** (vypnutý přes `AICOS_ZAZNAM=off`, jiný hostitel než Claude Code, třeba Codex) vznikne záznam až při `/end-session`: `RRRR-MM-DD-<tema>.md`. Když sessions ukládá Dashboard, hook kitu nezapisuje nic: záznamy vede Dashboard do `session-logs/desktop/<zdroj>-<hash>.md` ve svém vaultu, `/end-session` ani uzavření dne je nepřepisují a `/brain` je čte (viz [PREDANI-DASHBOARDU](../PREDANI-DASHBOARDU.md#sessions-když-máš-kit-i-dashboard)).

Plánované běhy (scheduled tasky) a session mimo workspace se nezapisují.

## Co do něj patří

Krátce. Na čem se pracovalo, co se dodalo (s cestami), co se rozhodlo, co je pořád otevřené. Není to přepis konverzace — když to bez celého rozhovoru nedává smysl, je to moc dlouhé.

Složka se veze prázdná. První soubor v ní vznikne s první session, ve které je hook `zaznam-session` zapojený (podle [SETUP](../SETUP.md)); jinak při prvním `/end-session`.
