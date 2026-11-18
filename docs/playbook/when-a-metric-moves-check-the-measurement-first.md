# Když se metrika pohne, nejdřív ověř, jestli se nezměnilo měření

## Pravidlo
Než začneš hledat byznysovou příčinu skoku nebo propadu, zkontroluj, jestli se nezměnilo to, co to
číslo vyrábí: deploy přesunul sekci, tag se přejmenoval, filtr na cestu porovnává přesnou shodu a
cesta se změnila.

## Proč
Jediný čistý den dat kolem té změny — před přesným okamžikem deploye a po něm — obvykle obě varianty
spolehlivě oddělí a zabere to pár minut.

## Jak to použít
Ověřit, že se metrika nerozbila, je jen polovina práce. Ověř taky, **co vlastně měřila**: metrika
může změnu pod sebou přežít a dál hlásit číslo, které se sice hýbe, ale už neznamená to, co všichni
předpokládají.
