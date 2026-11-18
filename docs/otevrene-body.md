# Otevřené body

Co to je: **jediné místo pro věci, které má někdo udělat do termínu**: nevyřešené nálezy, rozhodnutí čekající na uživatele, slíbené kroky. Agent ho čte před auditem, reportem a větším rozhodnutím a hook `kontext-prace` z něj na startu každé session vkládá top 5 otevřených bodů podle termínu.
Proč existuje: bez jednoho registru se stejné body znovu zjišťují a hlásí v briefingu, v uzavření dne i v auditech, ale nikdo je nevlastní ani neuzavře.

## Jak se používá

1. **Nový bod zapiš sem**, ne do nového reportu nebo plánu. Dostane další volné ID (`O-001`, `O-002`…) a vyplní Co, Kdo a Stav. Termín, když existuje.
2. **Hook řadí podle termínu, pořadí řádků rozhoduje až potom.** Do startu session vybere 5 otevřených bodů v tomhle pořadí: nejdřív termín v okně ±7 dní od dneška (nejblíž dnešku první), potom termín dál v budoucnu (nejbližší první), potom termín starší než 7 dní (nejčerstvější první; takový bod patří do úklidu registru) a nakonec body bez termínu v pořadí souboru. Při stejném termínu platí pořadí řádků, takže nahoře má být, co je nejdůležitější (metoda v [PRIORITIZACE](PRIORITIZACE.md)). Termín piš česky `20. 11.` nebo `20. 11. 2026` (bez roku platí rok dneška), případně `2026-11-20`; z buňky se bere první datum a text kolem něj („před“, „po“, čas) se ignoruje.
3. **Reporty odkazují ID** a hlásí jen změnu stavu nebo nový bod. Obsah bodu neopisují.
4. **Stavy:** `otevřeno` · `čeká na uživatele` · `rozpracováno` · `hotovo` (jen s důkazem) · `zrušeno` (s důvodem).
5. **Hotovo = důkaz** ve sloupci Důkaz / poznámka: commit, odkaz, ID zprávy, screenshot. Hotové a zrušené body se nemažou; jednou za čas je agent přesune do sekce Archiv níž.
6. Bod bez změny déle než 7 dní připomene agent uživateli **jednou** jako otázku ano/ne a do poznámky připíše, kdy se ptal.

| ID | Co | Kdo | Termín | Stav | Důkaz / poznámka |
|---|---|---|---|---|---|
| O-000 | Ukázka: rozhodnout, jestli zapnout ranní briefing | uživatel | | příklad | Řádek s ID O-000 je vzor, agent ho ignoruje. První skutečný bod zapiš pod něj. |

## Archiv

| ID | Co | Kdo | Uzavřeno | Stav | Důkaz / poznámka |
|---|---|---|---|---|---|
