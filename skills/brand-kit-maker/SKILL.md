---
name: brand-kit-maker
description: Nauč se vizuální identitu uživatele z jeho vlastních podkladů (loga, fonty, barvy, brand manuál) a ulož znovupoužitelný brand profil (soubor `brand-profile.md`), aby každý vizuál, který agent vyrobí — carousely, prezentace, dashboardy, obrázky — vycházel v jeho značce, ne genericky. Tahle dovednost je TVŮRCE — profil postaví jednou; ústava ho pak načítá automaticky ke každému vizuálu, který jde ven. Použij, když si uživatel chce nastavit značku, říká „nauč se moji značku", nahrává loga nebo fonty, definuje firemní barvy, nebo se ptá, proč výstupy pořád nevypadají jako jeho značka.
---

# Brand Kit Maker — nauč se vizuální identitu uživatele, jednou provždy

Tvoje práce: udělat z reálných podkladů uživatele **znovupoužitelný brand profil**, ze kterého čte
zbytek kitu. Uděláš to jednou; každá vizuální dovednost (`carousel`, `slide-deck`,
`interactive-dashboard`, generování obrázků) pak automaticky vyrábí věci v jeho značce. Nikdy nehádej
značku, kterou můžeš vytáhnout z podkladů.

## Krok 0 — Nejdřív si vyžádej podklady od uživatele (tímhle začni)

Podívej se do `skills/brand-kit-maker/assets/` (cesta od kořene workspace). Tam mají být brandové materiály uživatele.

- **Prázdné nebo chybí to podstatné?** ZASTAV SE a proveď uživatele nahráváním, seřazeno podle hodnoty:
  1. **Logo** — nejlíp `.svg` (škáluje se čistě), `.png` stačí taky. Všechny varianty, co má: plné, jen značka, světlá, tmavá.
  2. **Barvy** — hex kódy jeho značky (primární, sekundární, akcentní). Když je nezná, vytáhneš je z loga nebo z manuálu.
  3. **Fonty** — buď samotné soubory fontů (`.ttf`/`.otf`), **nebo** jejich názvy (např. „Inter na text, Space Grotesk na nadpisy"). Poznamenej si, jestli jsou z Google Fonts.
  4. **Brand manuál / grafický manuál** — jakékoliv PDF, co má (rozestupy, co se smí a nesmí, tonalita).
  5. **Pár reálných grafik** — 3–5 postů, slajdů nebo one-pagerů, které vypadají tak, jak chce.

  Řekni to na rovinu: bez těchhle věcí umíš vyrobit jen generický vzhled; s nimi všechno vychází
  jako *jeho* značka. Nevymýšlej si značku — nanejvýš navrhni startovní paletu a zopakuj, co
  potřebuješ.

- **Podklady jsou tam?** Přečti si je, prohlédni si je a pokračuj.

## Postav brand profil

Z podkladů vytáhni informace a napiš **`brand-profile.md`** (ulož ho do `docs/profil/`, kde ho najde
každá appka; nový soubor v kořeni workspace hook nepustí). Zachyť:

- **Barvy** — primární / sekundární / akcentní jako hex, k tomu barvu pozadí a textu a kdy se která používá.
- **Typografie** — font na nadpisy, font na text, řezy a fallbacky; poznamenej názvy z Google Fonts, ať si je umí načíst každá dovednost.
- **Logo** — jaké varianty existují, ochranná zóna, minimální velikost a která varianta patří na světlé a která na tmavé pozadí.
- **Vzhled a vyznění** — rytmus rozestupů, zaoblení rohů, stíny, styl obrazového materiálu, celková nálada — odvozeno z manuálu a ukázkových grafik.
- **Co se nesmí** — cokoliv, co manuál zakazuje (nedeformovat logo, nepoužívat barvy mimo paletu…).

Kde manuál mlčí, odvoď rozumný default z loga a ukázek a **napiš, co jsi odvodil**, ať to uživatel
může opravit.

## Předání — profil se odteď používá automaticky

Řekni uživateli, že je hotovo a že se `brand-profile.md` odteď uplatňuje **automaticky**: pravidlo
ústavy *v brandu a ve svém hlase* zajistí, že si každý vizuál, který jde ven (`carousel`,
`slide-deck`, dashboardy, generované obrázky, prezentace), tenhle profil přečte jako první a
přizpůsobí se mu — uživatel o to nikdy nemusí žádat. Na lokální `skills/<dovednost>/brand-references/`
u konkrétní dovednosti sahej jen tehdy, když ještě žádný profil neexistuje.

## Mantinely
- Soubory fontů a manuál můžou být licencované — drž je **lokálně** (jsou v gitignore; commituje se jen README téhle složky). Nikam podklady uživatele nenahrávej a nesdílej je.
- Vytahuj, nevymýšlej. Když hádáš, označ to jako odhad a nech si to potvrdit.
