# Než něco zničíš, pochop to — a nejdřív si přečti filtr

## Pravidlo
Než cokoliv smažeš — i do koše — pochop, proč to vzniklo a jestli je to ještě potřeba. Když to může
mít hodnotu, **přesuň** to tam, kam patří, místo mazání.

## Proč
Úklid, při kterém zmizí něco cenného, stojí mnohem víc než nepořádek, který odstranil. A složka s
vlastní historií verzování může obsahovat nepushnutou práci, kterou porovnání obsahu nikdy neodhalí.

## Jak to použít
U jakékoliv **hromadné** destruktivní operace — vypínání procesů, hromadný přesun do koše, dávkové
úpravy — je výpis cílů **samostatný krok, který si opravdu přečteš**, nikdy ne dry run zřetězený do
stejného příkazu. Tiše rozbitý bezpečnostní filtr (přepínač, který na téhle platformě neexistuje,
vzor, který nic nenašel) selže otevřeně, pustí skrz všechno a nikdy nevyhodí chybu.

Než to spustíš, ověř si počet: sedí počet cílů s tím, co jsi čekal?
