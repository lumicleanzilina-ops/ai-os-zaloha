# Co uživatel řekl, zapiš doslova, než se na cokoli zeptáš

## Pravidlo
Když uživatel v jedné zprávě nasype víc faktů naráz (jména, data, místa, čísla, podmínky klienta, diktovaný text) a ty s nimi budeš pracovat přes víc kroků nebo subagentů, nejdřív je zapiš doslova do souboru projektu, který k tomu slouží. Až potom hledej, ptej se a vyvozuj.

## Proč
Nepřečtený vstup je pro uživatele horší než pomalá práce: znamená, že ho agent neposlouchá. V produkčním systému, ze kterého tenhle kit vznikl, uživatel hned v první zprávě jmenoval jednu osobu. Agent se na ni o kus dál zeptal znovu a při hledání ji potřetí přehlédl; mezitím se do dat dostala hypotéza bez důkazu a datum přiřazené špatné osobě. Stálo to tři upomenutí a výměnu modelu v jediné session.

## Jak to použít
1. **Než začneš hledat nebo se ptát, zapiš všechno ze zprávy doslova** do souboru projektu (třeba `inputs/udaje-od-uzivatele.md`; projekt bez takového souboru ho založí). S datem a poznámkou „od uživatele, chat“. Jedna odrážka je jeden fakt. Nic neinterpretuj a nepřiřazuj, co uživatel nepřiřadil.
2. **Před každou otázkou ten soubor prohledej** (`grep -i "<slovo>"`). Když tam odpověď je, neptej se.
3. **Subagentovi předej fakta doslova**, ne své shrnutí. Co subagent vrátí, je hypotéza, dokud ji neověříš ve zdroji.
4. **Hypotéza není fakt.** Do dat jde jen označená jako hypotéza (vlastní sekce), nikdy jako hotové jméno, číslo nebo datum.
