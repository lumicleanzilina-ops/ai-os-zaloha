# outputs/

**Všechno, co agent vyrobí *pro tebe*, končí tady** — nabídky, carousely, obrázky, prezentace,
reporty, exporty, cokoliv, co má publikum.

## Proč tahle složka existuje

Dva důvody a oba se platily draze.

**1. Nikdy nemáš hledat, kam se ti deliverable schoval.** Jedno známé místo je lepší než chytré.
Agent ti navíc vždycky napíše celou cestu, jakmile něco dodělá — nemáš se ptát „kam jsi to uložil?"

**2. Soubor, který existuje jen v okně chatu, neexistuje.** Markdown vysypaný do konverzace,
běžící `localhost`, soubor v dočasné branchi — to všechno zmizí, jakmile session skončí. Output
není hotový, dokud tady neleží jako reálný soubor.

## Jak je to uspořádané

Podsložky podle typu, poskládané kolem toho, co *ty* reálně vyrábíš:

```
outputs/
├── proposals/
├── carousels/
├── images/
├── reports/
└── decks/
```

Agent je zakládá podle potřeby — nestav dopředu složky, které nikdy nepoužiješ.

## Co sem NEPATŘÍ

Pracovní soubory: pomocné skripty, mezivýpočty, rozdělané verze, pokusy. Ty patří do `scratch/`
nebo do složky `work/` daného projektu. U inputu má zůstat hotový output a nic jiného.
