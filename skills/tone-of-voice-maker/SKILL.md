---
name: tone-of-voice-maker
description: Zanalyzuje uživatelovo vlastní psaní a postaví z něj detailní, znovupoužitelný profil hlasu (soubor `tone-of-voice-<channel>.md`), aby všechno, co agent napíše, znělo jako on, ne jako AI. Tenhle skill je TVŮRCE — profil postaví jednou; ústava ho pak automaticky načítá do každého textu ven. Použij, když chce uživatel zachytit svůj tone of voice / styl psaní, "nauč se, jak píšu", "piš mým hlasem", "nastavit profil hlasu", nebo se ptá, proč jeho texty nezní jako on. Staví SAMOSTATNÝ profil pro každý kanál (sítě vs. e-mail vs. článek).
---

# Tone of Voice Maker — zachyť, jak uživatel doopravdy píše

Tvoje práce: zpětně rozebrat styl psaní uživatele z reálných ukázek a zapsat ho tak detailně,
aby ho jakýkoliv model dokázal zreprodukovat. Výstupem je **profil hlasu pro daný kanál**, který si
ostatní obsahové skilly načtou, než začnou psát.

Funguje v jakémkoliv jazyce — ukázky analyzuj v tom jazyce, ve kterém jsou napsané, a nálezy popiš
v pojmech toho jazyka.

## Krok 0 — Vyžádej si ukázky, jeden kanál po druhém (tohle udělej první)

Podívej se do `skills/tone-of-voice-maker/voice-samples/` (cesta od kořene workspace).

- **Prázdné nebo míň než 5 kusů?** ZASTAV SE a řekni uživateli, ať tam hodí **5 kusů vlastního
  psaní JEDNOHO typu** (viz README v té složce). Říkej vždy jen číslo 5: víc nevadí, ale nežádej
  to. Trvej na jednom kanálu: LinkedIn post ≠ e-mail ≠
  článek — když se to smíchá, vyleze z toho průměr, který nezní jako nikdo. Řekni mu, ať vybere
  svoje nejlepší a nejreprezentativnější kusy. Nevymýšlej hlas z ničeho.
- **Ukázky tam jsou?** Ověř, že vypadají jako jeden kanál. Když jsou evidentně smíchané, požádej
  uživatele, ať je rozdělí a uděláte teď jeden kanál. Pak se zeptej, **o jaký kanál** tahle dávka jde
  (sítě / e-mail / článek / …) — podle toho profil pojmenuješ.

## Analýza — tři úrovně, jedenáct prvků

Projdi každý prvek. U každého popiš pattern **a ocituj 1–2 reálné příklady z ukázek**. Buď konkrétní
a preskriptivní — cílem jsou instrukce dost přesné na napodobení stylu, ne mlhavý popis.

### Úroveň 1 — Mikro (slova a mechanika)
1. **Slovník a volba slov** — typická / odborná / opakující se slova a fráze; frekvence a rozsah;
   žargon vs. hovorovost; jednoduchá vs. složitá slova; slova, co strhávají pozornost; jakou úroveň
   čtenáře to vyžaduje.
2. **Gramatické patterny** — činný vs. trpný rod; konzistence časů; jednotné/množné číslo a zájmena
   (já / my / ty); opakující se zvláštnosti nebo vědomé odchylky od spisovné normy.
3. **Interpunkce a formátování** — jak používá čárky, středníky, pomlčky, závorky; interpunkce jako
   rytmus, důraz, přehlednost; osobité návyky (časté pomlčky, tři tečky, jednořádkové odstavce, emoji).

### Úroveň 2 — Střed (věty a struktura)
4. **Stavba a délka vět** — složitost a pestrost; průměrný počet slov na větu; poměr jednoduchých /
   souřadných / podřadných souvětí; používání větných úseků; % krátkých (<10 slov) vs. dlouhých
   (>30); čím věty typicky začínají.
5. **Rétorické a literární prostředky** — metafory, přirovnání, aliterace, opakování; řečnické
   otázky, ironie, nadsázka; analogie, historky, příklady; opakující se poznávací figury.
6. **Struktura textu** — organizace a délka odstavců; úvodní / tematické věty; přechody; deduktivně
   (obecné→detail) vs. induktivně (detail→obecné); chronologické / prostorové / gradační řazení;
   opakující se strukturní šablony (třeba hook → příběh → poučení → CTA).

### Úroveň 3 — Nadhled (hlas jako celek)
7. **Tón a nálada** — celková emoční poloha (formální / neformální / humorná / vážná); přeskoky mezi
   nimi a jak jich dosahuje; jak slovník, syntax a obraznost tvoří náladu.
8. **Soudržnost a návaznost** — jak se myšlenky propojují; přechodová slova a fráze; opakování,
   paralelní struktury; jak se drží jednota a fokus.
9. **Idiosynkrazie** — to nezaměnitelné: jedinečné fráze, typické obraty, osobní tiky, podle kterých
   ten text poznáš.
10. **Dialog** (pokud je) — jak jsou citace a dialogy interpunkčně a kontextově zasazené; konzistence hlasu.
11. **Obrazný jazyk** — personifikace, synekdocha, metonymie atd.; jak často a jak účinně tvoří
    plastické obrazy.

## Výstup — znovupoužitelný profil hlasu

Napiš **`tone-of-voice-<channel>.md`** (ulož ho do `docs/profil/`, kde ho najde
každá appka; nový soubor v kořeni workspace hook nepustí). Strukturuj ho takhle:

1. **Snímek** — 3–5 vět popisujících ten hlas, jako bys briefoval ghostwritera.
2. **Pravidla k dodržení** — konkrétní checklist ke každému prvku výše (např. „průměrně 14 slov na
   větu", „jedna vsuvka s pomlčkou na odstavec", „začínej úderným větným úsekem", „my/ty, nikdy
   neosobní konstrukce").
3. **Dělej & Nedělej** — poznávací tahy, které se mají držet; tahy mimo hlas, kterým se vyhnout.
4. **Mini styleguide** — 3–5 krátkých přepisů před/po, kde se z fádní věty stane věta v jeho hlase.

Udělej to dost preskriptivní na to, aby model bez jakéhokoliv předchozího kontextu zreprodukoval styl
jen z tohohle souboru.

## Předání — profil se od teď aplikuje automaticky
Řekni uživateli, který profil jsi uložil (např. `tone-of-voice-social.md`) a že se od teď aplikuje
**automaticky**: pravidlo *on-brand & on-voice* v ústavě zařídí, že každý text ven (posty, články,
e-maily, texty do carouselů, reklamy) načte odpovídající `tone-of-voice-<channel>.md` a řídí se jím —
nikdy o to nemusí prosit. Připomeň mu, ať si postaví samostatný profil pro každý kanál, na který
píše; kanál, který profil ještě nemá, spadne na nejlepší možný odhad.

## Pojistky
- Jeden kanál na jeden profil — nikdy nemíchat.
- Napodobuj to, co v ukázkách reálně je; nevnucuj „lepší" styl. Když nějaká ukázka působí divně nebo
  ji evidentně psal někdo jiný, zeptej se, než ji zahrneš.
- Ukázky zůstávají lokálně (gitignorované). Uživatelovo psaní nikam neposílej.
