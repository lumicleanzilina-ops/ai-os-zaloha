# Tvoje vlastní poznámky o tom, co nástroj umí, zastarávají

## Pravidlo
Poznámka „tahle integrace neumí X" je datovaný odhad, ne fakt. Než začneš stavět obezličku, ověř si
znovu aktuální seznam nástrojů.

## Proč
Konektory operace získávají a ztrácejí bez changelogu. Nejjistější známka, že se vyplatí to ověřit
znovu, je to, že jsi na přesně tohle omezení už jednou obezličku postavil — zvlášť když ta obezlička
hodila uživateli ruční krok, který jsi mohl udělat sám.

## Jak to použít
- Veď si krátký živý seznam známých vzorců selhání a náhradních postupů k nim, ať příští session
  neobjevuje stejnou slepou uličku metodou pokus-omyl.
- Čerstvě načtené schéma nástroje **není** ověřený funkční nástroj — zavolej ho jednou, než ho někomu
  slíbíš.
- Selhání konektoru je zdržení, ne závěr. „Nevím" znamená zkusit to příště znovu, ne „nejde to".
