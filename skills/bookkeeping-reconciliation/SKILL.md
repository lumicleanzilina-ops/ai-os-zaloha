---
name: bookkeeping-reconciliation
description: Sestav podklad pro účetní — pohyby z bankovního výpisu napárované na faktury a doklady, rozdělené po měsících, s tabulkou a poctivým seznamem toho, co pořád chybí. Použij, když uživatel chce „účetnictví za rok X", „dohledat chybějící faktury", „připravit podklad pro účetní" nebo „napárovat platby k dokladům".
---

# Účetní párování — od bankovního výpisu k tabulce, se kterou účetní rovnou pracuje

Udělá z roku bankovních pohybů tabulku a složkovou strukturu, se kterou účetní rovnou pracuje, a
k tomu jasný, poctivý seznam toho, jaké doklady pořád chybí — místo hromady PDF a naděje, že se na
nic nezapomnělo.

**Precedens:** při reálném párování zhruba 100 bankovních pohybů za rok neměla po prvním
automatickém průchodu asi polovina žádný odpovídající doklad — většina se dohledala v nástroji,
který je vystavil, nebo v mailu; pár jich zůstalo nevysvětlených a šly do seznamu „na tohle je
potřeba člověk", místo aby se hádaly.

## Než začneš — potvrď si čtyři věci

1. **Právní subjekt.** Když uživatel podniká pod víc subjekty (firma + OSVČ, nebo víc firem), potvrď
   si, kterého z nich se párování týká, a nemíchej jejich pohyby ani doklady. O IČO/DIČ si řekni jen
   tehdy, když ho potřebuješ k dotazu do API účetního nástroje — nikdy ho nevypisuj do chatu, do
   souboru ani do ukázky.
2. **Období.** Rok a konkrétní měsíce si potvrď předem. Nezačínej šířeji, než bylo zadáno.
3. **Platební kanály.** Potvrď si, které bankovní účty a platební brány do účetnictví tohoto subjektu
   opravdu patří. Cokoliv mimo potvrzené účty do výstupu nepatří — pohyb ze špatného účtu je horší
   než chybějící, protože vypadá autoritativně.
4. **Formát a místo výstupu.** Než cokoliv vygeneruješ, potvrď si, kam má hotový podklad přistát.
   Předělávat dobrou práci, protože skončila na špatném místě, stojí víc než předělávat špatnou.

## Pořadí kroků

**1. Kostrou je bankovní výpis, ne doklady.** Všechno ostatní se páruje na něj, nikdy naopak. Napiš
parser na formát exportu dané banky (CSV, MT940, tabulka v PDF, cokoliv ti vydá) a než mu začneš
věřit, ověř ho proti dvěma věcem: kontrolním součtům samotného výpisu a tomu, že koncový zůstatek
jednoho měsíce se rovná počátečnímu zůstatku toho následujícího. Když to sedí na haléř, parser je
důvěryhodný — když ne, zastav se a oprav ho dřív, než na něj začneš cokoliv párovat. Banky mění
formát exportu bez varování mezi jednotlivými výpisy; nepředpokládej, že parser z minulého měsíce
funguje i na soubor z tohohle.

**2. Vystavené faktury tahej paralelně, ale každý zdroj zvlášť.** Když se fakturace v průběhu času
stěhovala mezi nástroji (nejdřív fakturace vestavěná v CRM, pak samostatný fakturační nástroj, změna
podúčtu apod.), ber každé období a každý zdroj jako samostatný tah, ne jako jeden dotaz přes
všechno — špatný účet nebo podúčet (slug) ve fakturačním API často vrátí prázdný výsledek bez
jakékoliv chyby, což pak tiše vypadá jako „žádné faktury" místo „špatný dotaz". Rozjet dva lehké
subagenty a tahat ze dvou zdrojů najednou je rychlejší než to dělat sériově.

**3. Přijaté doklady tahej přes IMAP, ne přes konektor mailové aplikace.** Většina mailových
MCP/konektorů vrací jen *metadata* příloh, ne samotná data souboru — na hromadné stažení skutečných
PDF potřebuješ malý IMAP skript. Počítej s tím dopředu; zjistit to uprostřed úkolu znamená začínat
znovu.

**4. Z každého PDF vytáhni dodavatele, datum a částku.** Napiš (nebo znovu použij) malý extrakční
skript, spusť ho a pak **si projdi seznam všeho, co se mu nepodařilo rozparsovat** — každá šablona
faktury chce vlastní vzor a univerzální extraktor vždycky něco mine. Nerozpoznané položky nech
nerozpoznané. Nikdy nehádej částku jen proto, aby řádek hezky prošel — špatné číslo v účetním
podkladu je dražší než prázdné pole, protože vypadá ověřeně, i když ověřené není.

**5. Páruj a zakládej.** Nech přesně jeden skript/krok jako jedinou autoritu na otázku „co pořád
chybí" (má vydat něco jako `missing.json` nebo seznam „ještě chybí doklad") a jakýkoliv pozdější
krok, který soubory zakládá nebo kopíruje, ať čte z tohohle výstupu, místo aby si vlastní představu
o tom, co už je pokryté, odvozoval znovu. Dvě nezávislé heuristiky na tutéž otázku se tiše rozejdou —
jedna z nich bude nakonec špatně a nikdo si toho nevšimne dřív než účetní.

**6. Vysvětli každý příchozí pohyb, nejen výdaje.** Vratka, výplata z platební brány, výběr ze
zůstatku na marketplace nebo platformě — u každého potřebuješ buď jednořádkové vysvětlení, co to je,
nebo výslovný příznak „doklad není k dispozici". Příchozí peníze bez vysvětlení jsou zdaleka
nejčastější věc, kterou účetní vrátí zpátky.

## Výstup

Jedna tabulka: souhrnný list, list na každý měsíc, list „vystavené faktury", list „CHYBĚJÍCÍ
doklady", list „doklady bez odpovídajícího pohybu" a list „ke kontrole" na všechno nejednoznačné.
Vedle toho jedna složka na měsíc (`01-leden` … `12-prosinec`) s napárovanými PDF, k tomu krátký
`README.md` a jednostránkový status brief.

Když tabulku generuješ Python knihovnou (např. `openpyxl`) a ta ještě není k dispozici, vytvoř si
jednorázové virtuální prostředí, místo abys sahal na systémovou instalaci Pythonu.

## Co vždycky zůstane na uživateli

Doklady, které sedí za cizím přihlášením — účet platební brány, ke kterému nemáš přístup, cloudová
konzole, projektový nástroj, cokoliv, co vyžaduje interaktivní session v prohlížeči s jeho vlastními
cookies. **Nesnaž se to obcházet.** Vypiš každý takový případ do status briefu s částkou, o kterou
jde, a přesným místem, kde ho najít. Když to vyžaduje, aby byl uživatel online a něco si ve vlastním
prohlížeči odklikl, prostě to počká na něj — to není selhání úkolu, to je hranice zadání.

## Daňová pravidla — přečti si tohle, než napíšeš cokoliv o DPH a reverse charge

**Pravidla pro DPH, reverse charge a přeshraniční fakturaci se liší podle jurisdikce a v čase se
mění.** Všechno níž je ilustrace *typu* věci, kterou máš označit, ne pravidlo k mechanickému použití:

- Faktura v režimu reverse charge vystavená neplátci DPH (nebo neplátcem) je obvykle červený praporek,
  který stojí za zmínku, ne něco, co se tiše spolkne.
- Příjem nebo výdaj, který na přelomu spadne do špatného účetního období (doklad s prosincovým datem
  zaplacený v lednu, nebo naopak), potřebuje rozhodnutí člověka, ne automatickou volbu.

Nikdy neaplikuj konkrétní daňový režim dané jurisdikce z paměti ani podle analogie s minulým
projektem. Když daňový režim dokladu vypadá nestandardně, označ ho a nech rozhodnutí na skutečné
účetní uživatele — to je její práce, ne tvoje.

## Označuj rizika, ne jen díry

Párování vyplaví věci, které nejsou účetní chybou, ale byznysovým rizikem: dvě různé verze něčeho,
co se tváří jako tatáž faktura, návrh vyrovnat rozdíl mimo účetnictví, daňový režim, který vypadá
divně, příjem zaúčtovaný do špatného období. **Tohle patří na začátek status briefu**, ne do
poznámky pod čarou — obvykle je to ta nejcennější věc, kterou párování našlo.
