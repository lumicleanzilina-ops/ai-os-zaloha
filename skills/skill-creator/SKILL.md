---
name: skill-creator
description: Vytváří nové agentní skilly a vylepšuje stávající. Použij, když chce uživatel postavit skill od nuly, napsat SKILL.md, zabalit opakovatelný workflow do skillu, nebo doladit strukturu, frontmatter či spouštění existujícího skillu. Spouštěcí fráze - "vytvoř skill", "udělej z toho skill", "napiš SKILL.md", "tohle dělám pořád dokola", "vylepši ten skill", "proč se ten skill nespouští".
---

# Skill Creator

Meta-skill na psaní kvalitních, předvídatelných a tokenově úsporných agentních skillů. Skill je samostatná složka, která balí instrukce a volitelně skripty a zdroje tak, aby agent spolehlivě zvládl konkrétní úkol.

## Kdy tenhle skill použít

- Uživatel chce „vytvořit skill", „postavit skill" nebo „napsat SKILL.md".
- Uživatel dodá workflow, checklist nebo sadu instrukcí, které chce zopakovatelně používat.
- Uživatel chce zlepšit spouštění, strukturu nebo srozumitelnost existujícího skillu.

## Co to skill je

Skill žije ve vlastní složce a vždy obsahuje `SKILL.md`. Volitelně může obsahovat podpůrné soubory:

```
skill-name/
├── SKILL.md            # Povinné. Frontmatter + instrukce.
├── scripts/            # Volitelné. Pomocné skripty, které agent spouští.
├── references/         # Volitelné. Hlubší dokumentace načítaná podle potřeby.
├── examples/           # Volitelné. Referenční implementace.
└── assets/             # Volitelné. Šablony, obrázky, boilerplate.
```

Agent přečte `SKILL.md`, když úkol odpovídá popisu skillu, a podpůrné soubory si dotahuje až ve chvíli, kdy je potřebuje.

## Dvoudílný model

1. **Description (metadata)** — je vždy v kontextu. Podle něj se agent rozhoduje, *jestli* skill použít. Optimalizuj ho na spouštění.
2. **Tělo (obsah SKILL.md)** — načte se, až když skill vystřelí. Tohle agentovi říká, *jak* úkol udělat.

## Pravidla frontmatteru

```yaml
---
name: skill-name
description: Co dělá a kdy to použít. Třetí osoba, nabité spouštěči.
---
```

- **`name`**: jen malá písmena, číslice a pomlčky. Krátké a výstižné (max ~64 znaků). Musí sedět na název složky. Vyhni se rezervovaným slovům výrobců, pokud si je platforma přímo nevyžaduje.
- **`description`**: zdaleka nejdůležitější pole. Piš ve třetí osobě a nacpi tam konkrétní spouštěče — úkoly, klíčová slova, typy souborů a formulace, které mají skill aktivovat. Uveď *co skill dělá* i *kdy ho použít*. Max ~1024 znaků.

### Příklady description

Slabý (moc mlhavý, spolehlivě se nespustí):
```
description: Pomáhá s dokumenty.
```

Silný (uvádí schopnost i konkrétní spouštěče):
```
description: Vytahuje text a tabulky z PDF souborů, vyplňuje PDF formuláře, slučuje
a rozděluje PDF. Použij, když uživatel zmíní .pdf soubor nebo chce PDF přečíst,
spojit, rozdělit či vyplnit.
```

## Progresivní odkrývání

Drž `SKILL.md` soustředěný a pod ~500 řádky. Necpi všechno do jednoho souboru — agent platí za každý token, který načte.

- Do `SKILL.md` patří **hlavní workflow a nejčastější cesta**.
- Dlouhé reference, hraniční případy a detailní příklady přesuň do `references/` nebo `examples/` a **odkaž na ně jednu úroveň hluboko**. Agent je přečte, jen když je potřebuje.
- Když je nějaká sekce relevantní jen občas, radši popiš, kdy si ji má přečíst, než ji cpát dovnitř.

## Psaní těla — kolik volnosti agentovi dát

Formát vol podle toho, jak deterministický úkol je:

- **Volné heuristiky** (agent má přemýšlet) → odrážky, principy, „zvaž X".
- **Pevné šablony** (výstup musí mít daný tvar) → bloky kódu, které agent vyplní.
- **Křehké operace bez volnosti** (přesné příkazy, které se nesmí lišit) → přesné shellové příkazy, a takhle je i označ.

Předpokládej, že agent je schopný. Nevysvětluj základní pojmy (co je PDF, co dělá git). Zato rozepiš to, co se snadno zvorá: přesné přepínače, závislosti na pořadí, zrádnosti, které vyplavou až za běhu.

## Postup psaní

1. **Ujasni cíl** — jaký úkol tenhle skill dělá a co ho má spouštět? Nejdřív si dolaď spouštěče, ty pak řídí description.
2. **Vyber strukturu** — rozhodni, jestli jsou potřeba scripts/references/examples/assets, nebo stačí samotný `SKILL.md`. Začni minimálně.
3. **Napiš frontmatter** — `name` + `description` nabitý spouštěči.
4. **Napiš tělo** — nejdřív hlavní workflow, u každé sekce správná míra volnosti, hloubka odkazem ven.
5. **Přidej pojistky** — checklisty, smyčku plán → ověření → exekuce u rizikových kroků a jasné ošetření chyb u všech přibalených skriptů (každý má umět `--help` a hlasitě spadnout).
6. **Ořež** — vyházej vatu, vyhoď všechno, co agent stejně ví, a zkontroluj, že `SKILL.md` zůstal štíhlý.

## Přibalené skripty

Když skill obsahuje skripty:

- Ber je jako černé skříňky, které agent volá; agent by kvůli jejich použití neměl muset číst zdroják.
- Každému dej `--help` s popisem použití.
- Používej srozumitelné chybové hlášky a nenulové návratové kódy při selhání.
- Na skripty odkazuj relativní cestou od složky skillu. V cestách používej lomítka (`/`).

## Vylepšení existujícího skillu

Když máš zlepšit existující skill:

1. Přečti jeho aktuální `SKILL.md` a všechny podpůrné soubory.
2. Diagnostikuj pravděpodobný problém:
   - **Nespouští se?** `description` je moc mlhavý nebo mu chybí klíčová slova — přepiš ho s konkrétními spouštěči.
   - **Spouští se moc často / kde nemá?** Description slibuje moc — zúži ho a případně přidej „NE pro…".
   - **Nafouklý / pomalý?** Přesuň detaily do `references/`, uplatni progresivní odkrývání.
   - **Nespolehlivý výstup?** Utáhni tělo — přidej šablony, přesné příkazy nebo ověřovací checklist.
3. Změnu proveď a `SKILL.md` drž štíhlý.

## Kontrolní checklist kvality

- [ ] `name` je malými písmeny s pomlčkami a sedí na název složky.
- [ ] `description` je ve třetí osobě a obsahuje konkrétní spouštěče (co + kdy).
- [ ] `SKILL.md` začíná nejčastější cestou a drží se pod ~500 řádky.
- [ ] Hloubka je odkázaná v `references/`/`examples/`, ne vložená přímo.
- [ ] Formát odpovídá determinističnosti úkolu (odrážky vs. šablony vs. přesné příkazy).
- [ ] Přibalené skripty mají `--help` a rozumné ošetření chyb.
- [ ] Žádný nevysvětlený žargon, žádné vysvětlování základů, žádná vata.
