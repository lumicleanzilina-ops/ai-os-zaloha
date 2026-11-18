---
name: call-prep
description: >
  Připrav uživatele na nadcházející call — kdo přijde, proč, co se naposledy domluvilo a co je
  otevřené. Použij, když uživatel řekne, že má za chvíli call nebo schůzku a chce vědět, co o tom víš,
  nebo požádá o přípravu na jednání. Platí i PO callu: „vem přepis a řekni mi, co dál" — rozdělení
  na úkoly a zápis do nástroje na úkoly.
---

# call-prep — brief na schůzku, před ní i po ní

Tohle si o sebe většinou někdo řekne **pár minut před začátkem**. Rychlost je součást zadání:
hledej paralelně, nezastavuj se u doplňujících otázek — nejdřív dodej brief, teprve pak ho dolaď.

## Před callem

### Krok 1: Najdi událost v kalendáři (tímhle vždycky začni)

Vytáhni dnešní události z kalendáře uživatele. Záznam události ti dá dvě věci, které nemá nic jiného:

- **Účastníci = ověřená celá jména a e-maily.** Název události často obsahuje jen přezdívky nebo
  příjmení — teprve e-mail spolehlivě spojí jméno s tím, co o daném člověku už víš.
- **Stav odpovědi** — kdo reálně přijde. Nepřipravuj uživatele na někoho, kdo pozvánku odmítl.

Ulož si i odkaz na schůzku, ať je po ruce.

### Krok 2: Tahej kontext paralelně

Tohle pusť najednou, ne popořadě:

- **Paměť / poznámky** — hledej podle názvu projektu a podle jména každého účastníka.
- **Nástroj na zápisy z hovorů** (napojený přes MCP) — předchozí cally s týmiž lidmi. Filtruj přes
  rozsah dat kolem známé předchozí schůzky, nebo klíčovým slovem na název projektu.
- **Složka s projektovými poznámkami a plány** — hledej jména a téma.

### Krok 3: Postav brief

Struktura, která funguje:

1. **Kdo přijde** — tabulka jméno · e-mail · role. Roli ber ze samotného záznamu schůzky, ne
   z automatického přiřazení.
2. **Proč tenhle call existuje** — jedna věta o záměru, aby uživatel schůzku vedl, místo aby na ni
   jen reagoval.
3. **Co se domluvilo minule** — hlavně čísla a závazky.
4. **Co je od minule otevřené** — včetně, výslovně, **nedodělaných úkolů samotného uživatele**.
   Ty bývají tím, co blokuje ostatní, a je nepříjemné zjistit to živě na callu.
5. **Otázky na call** — 3–5, konkrétních.

### Pravidla, na kterých to stojí

- **Nástroje na zápisy z hovorů si pletou, kdo co řekl.** Když automatický souhrn přiřadí úkol
  špatnému člověku, věř spíš samotnému přepisu než souhrnu a **ten rozpor v briefu pojmenuj** —
  ať uživatel neopakuje cizí úkol špatnému člověku.
- **Nikdy neuváděj číslo, které jsi neověřil.** Počty členů, tržby a útratu tahej ze zdrojového
  systému, nebo je označ jako „neověřeno" s datem posledního známého údaje. Číslo vyslovené nahlas
  na callu se pak těžko bere zpátky.
- **U jakéhokoliv podílu nebo provize vždycky uveď, z čeho se počítá.** Vyslovené číslo vytváří
  očekávání, i když se formálně nic nedomluvilo.
- **Brief vypiš celý přímo do chatu**, krátce a v pořadí: co se naposledy řešilo → co uživatel
  dluží → osnova → otázky → na co si dát pozor. Před callem se čte na telefonu nebo ve spěchu
  a otevírat soubor je zbytečné tření. Do `outputs/` projektu ulož až zápis **po** callu
  (z přepisu); zbývá-li do callu méně než 30 minut, žádný soubor nezakládej.
- **Do briefu patří tři cíle schůzky a jedna věta na domluvení dalšího kroku** (kdo, co, do kdy).

## Po callu: z přepisu do nástroje na úkoly

Nástrojům na zápisy z hovorů obvykle trvá **zhruba 15–30 minut po skončení**, než call zpracují.
Když tam call ještě není, nehlas „přepis nenalezen" — nejdřív si dalším dotazem bez filtru na datum
ověř, jestli konektor vůbec vrací data, a pak uživateli řekni, že se to ještě zpracovává.

**U obchodního nebo klientského callu nabídni rovnou shrnutí klientovi do 24 hodin**: jeho vlastní
slova o tom, co potřebuje, co se domluvilo a další krok s termínem. Návrh ukaž ke schválení;
odešle se až na výslovné ano (Tvrdé pravidlo 1).

### Rozdělení na úkoly

1. **Ber akční body jako surovinu, ne jako hotové přiřazení** — komu co patří, je nespolehlivé
   (viz pravidla výš).
2. **Člověk s nulou úkolů je nález, ne prázdné místo.** Když někdo proseděl celý call a nic mu
   nezůstalo, řekni to nahlas: buď na něj nic nevyšlo, nebo to přepis minul. Tak jako tak to musí
   posoudit uživatel — jinak ten člověk tiše vypadne z rytmu, který ostatní drží.
3. **Než založíš nové karty, zkontroluj duplicity proti stávajícím.** Duplicitní úkol je horší
   než chybějící.
4. **Přečti si každý dokument, který na callu padl.** Když se má posílat starší soubor, ověř, že
   neodporuje tomu, co se dnes domluvilo (ceny, podíly, sliby) — konflikt pojmenuj dřív, než
   dokument odejde, ne až na něj přijde někdo jiný.

### Zápis do nástroje na úkoly

Oficiální API/MCP integrace nástroje na úkoly typicky umí založit karty a nastavit standardní pole
(stav, datum, řešitele) — ale většinou **neumí pozvat lidi ani nastavit filtry a pohledy**. To
zůstává na ručním kliknutí uživatele, tak to tak i popiš, místo abys to zabalil do slova „hotovo".
Po zápisu si **výsledek ověř zpětným dotazem přímo do toho nástroje**, ne tvrzením, že to prošlo.
