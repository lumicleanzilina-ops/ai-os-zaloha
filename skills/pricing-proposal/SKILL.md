---
name: pricing-proposal
description: "Generuje profesionální cenové nabídky a technické analýzy projektů. Vytváří komplexní dokumenty s ROI analýzou, propočtem ceny, harmonogramem a vyhodnocením rizik. Výstupem je buď PDF, nebo čistý text připravený k převodu do PDF. Použij, když klient potřebuje cenovou nabídku, analýzu projektu nebo propočet ROI. Spouštěcí fráze - 'udělej nabídku', 'nacenit projekt', 'kolik si mám říct', 'poptávka od klienta', 'spočítej ROI', 'technická analýza projektu'."
---

# Generátor cenových nabídek

Skill na tvorbu profesionálních cenových nabídek a technických analýz projektů s důrazem na ROI, konkrétní čísla a jasnou strukturu.

## Účel

Vytvářet nabídky, které:
- **Přesvědčují čísly** – ROI, úspory, návratnost
- **Jsou technicky přesné** – jasný rozsah, technická proveditelnost
- **Se dají číst** – logická struktura, vizuální hierarchie
- **Snižují riziko** – pojmenují rizika i jejich ošetření

## Krok 0 — Nauč se styl uživatele z jeho ukázek (tohle udělej první)

Než začneš psát, podívej se do `skills/pricing-proposal/examples/` (cesta od kořene workspace) — tam leží jeho vlastní dřívější nabídky.
- **Prázdné nebo míň než ~5 kusů?** ZASTAV SE a řekni mu, ať do `skills/pricing-proposal/examples/` nejdřív hodí
  5–10 svých reálných nabídek (viz README v té složce). Řekni mu to na rovinu: bez nich z tebe vyleze
  jen generická šablona; s nimi bude nabídka sedět na *jeho* strukturu, cenovou logiku, podmínky a hlas.
  Nevyráběj celou nabídku z ničeho — maximálně načrtni hrubou kostru a zopakuj prosbu.
- **Je jich tam dost?** Přečti je, vytáhni z nich patterny (jak balí varianty, jak obhajuje hodnotu,
  jak formuluje podmínky, jeho tón) a stav podle toho. Jeho styl reprodukuj, nikdy si nevymýšlej vlastní.

## Workflow

### 1. Sesbírej informace

Než začneš psát nabídku, **VŽDY** si zjisti:

**O projektu:**
- Co přesně klient potřebuje? (jádro funkčnosti)
- Jaké má problémy / bolesti?
- Co má teď? (současný stav)
- Jaké má požadavky? (must-have vs. nice-to-have)

**Čas a peníze:**
- Jak dlouho ten proces teď zabere? (hodin denně/týdně)
- Jaké jsou náklady na práci? (hodinová sazba nebo měsíční mzda)
- Jaký je požadovaný termín dodání?
- Jaký je očekávaný rozpočet?

**Technika:**
- Jaké technologie/nástroje už klient používá?
- Jsou nějaká technická omezení?
- Kdo bude systém používat? (technická úroveň uživatelů)

### 2. Definuj rozsah MVP

Rozděl funkčnost na:
- ✅ **MVP (Minimum Viable Product)** – co je v první verzi
- 📦 **Další fáze** – co se dá dodělat později
- ❌ **Mimo rozsah** – co v nabídce není

**Pravidlo 80/20:** MVP má vyřešit 80 % problému za 20 % času/ceny plného řešení.

### 3. Spočítej ROI

**Vzorec pro výpočet:**
```
Současné měsíční náklady = Čas (hodiny) × Hodinová sazba zaměstnance
Měsíční úspora            = Současné náklady − Provozní náklady systému
Návratnost (měsíce)       = Celková investice ÷ Měsíční úspora
```

**Vždy uveď:**
- Bod zvratu (kdy se investice vrátí)
- ROI po 12/24/36 měsících
- Roční úsporu od druhého roku dál

### 4. Odhadni čas a cenu

**Realistický odhad:**
- Rozsekej projekt na dílčí úkoly
- Každý úkol odhadni zvlášť
- Přidej 20–30% rezervu na nečekané
- Uveď rozpětí (např. 3 000 – 4 000 jednotek)

**Struktura ceny:**
- Vývoj (po hodinách)
- Měsíční provoz (hosting, API, služby)
- Vstupní poplatky, pokud jsou

### 5. Pojmenuj rizika

**Typická rizika:**
- Změna struktury cizího webu/API
- Antibotová ochrana
- Výpadky služeb třetích stran
- Změna požadavků klienta
- Technologická omezení

**Vždy navrhni ošetření** – jak se riziko snižuje nebo řeší.

## Struktura dokumentu

### 1. Hlavička
```
Analýza: [Název projektu]
Technická studie a cenový propočet

Shrnutí
[1–2 věty: co projekt řeší, hlavní přínos, stěžejní číslo o čase/ceně]
```

**Pravidlo:** Shrnutí musí chytit pozornost do 10 sekund čtení.

### 2. Technická proveditelnost

**Pro každou variantu/komponentu řešení:**
- Název komponenty/řešení
- Stav: ✅ PLNĚ FUNKČNÍ / ⚠️ VYŽADUJE [co] / ❌ MIMO MVP
- Odrážky s technickými detaily
- Doporučení (pokud dává smysl)

**Pravidlo:** Používej semafory (✅⚠️❌) pro rychlou orientaci.

### 3. Rozsah MVP

**Dva sloupce:**

**Funkce (co TAM BUDE):**
- Odrážkový seznam klíčových funkcí
- Konkrétně, ne obecně (špatně: „notifikace", dobře: „E-mailová notifikace při nové objednávce")

**Vyloučeno (co tam NEBUDE):**
- Odrážkový seznam funkcí mimo rozsah
- Označ, co se dá dodělat později vs. co není relevantní

### 4. Odhad času a ceny

**Tabulka:**
```
Položka                      | Hodnota
-----------------------------|------------------
Pracnost                     | cca X hodin
Cena (dle skutečných hodin)  | XX,XXX – XX,XXX
Měsíční provoz               | X,XXX – X,XXX
Termín dodání                | [měsíc rok]
```

**Pravidlo:** Vždy uveď rozpětí, ne fixní číslo (kromě termínu).

### 5. Ekonomické vyhodnocení (ROI)

**Současný stav:**
- Čas: X hodin denně/týdně = Y hodin měsíčně
- Náklady na práci: náklad/měsíc ÷ pracovní hodiny = náklad/hodinu
- Měsíční hodnota času: X hodin × náklad/hodinu = Y

**Po automatizaci:**
- Provozní náklady systému: X měsíčně
- Dohled/údržba: Y minut denně
- Ušetřený čas: Z hodin měsíčně přesměrovaných na hodnotnější činnosti

**Spočítej měsíční úsporu:**
```
Měsíční úspora = (Hodnota času − Provozní náklady) − Čas na dohled
```

### 6. Návratnost investice

**Vždy uveď:**
```
Investice: XX,XXX
Měsíční úspora: X,XXX
Návratnost: X měsíců

Po 12 měsících: X (bod zvratu nebo +/−)
Po 24 měsících: +XX,XXX čistého zisku
Po 36 měsících: +XXX,XXX čistého zisku

Roční úspora: XX,XXX (od 2. roku)
```

**Pravidlo:** Vždy počítej 3 roky dopředu.

### 7. Klíčové přínosy

**Rozděl do kategorií:**

**Finanční:**
- Konkrétní úspory
- Odstranění promarněných příležitostí
- Snížení nákladů na X

**Provozní:**
- Uvolnění času na hodnotnější činnosti
- Vyšší kvalita/pokrytí/rychlost
- Odstranění lidské chyby

**Strategické:**
- Škálovatelnost
- Konkurenční výhoda
- Rozhodování na základě dat
- Prostor pro růst

### 8. Co klient dostane

**Technicky:**
- Konkrétní výstupy (systém, API, databáze…)
- Přístupová práva
- Integrace

**Dokumentace:**
- Uživatelský manuál
- Technická dokumentace (pokud dává smysl)
- Onboarding/zaškolení

**Podpora:**
- X dní po spuštění zdarma
- Zaškolení týmu (Y hodin)
- SLA (pokud dává smysl)

**Editovatelné bez programování:**
- Co si klient může měnit sám
- Jak to může měnit
- Kde to může měnit

### 9. Harmonogram

**Tabulka po týdnech:**
```
Týden   | Činnost
--------|------------------
1-2     | Setup + analýza
3-4     | [Komponenta 1]
5-6     | [Komponenta 2]
7       | [Finalizace]
8       | Testování + dokumentace
```

**Vždy uveď:**
- Start: Po podpisu smlouvy / Po zaplacení zálohy
- Dokončení: [konkrétní měsíc rok]

### 10. Potenciální rizika

**Tabulka:**
```
Riziko                  | Ošetření
------------------------|------------------------
[Konkrétní riziko]      | [Jak to řešíme]
[Další riziko]          | [Jak to řešíme]
```

**Pravidlo:** Maximálně 3–5 nejdůležitějších rizik; zbytek vypisovat netřeba.

### 11. Doporučení

**Shrň, proč ANO nebo NE:**
- Návratnost za X měsíců je [výborná/přijatelná/dlouhá]
- Technicky [jednoznačně proveditelné/složité, ale možné/vyžaduje další analýzu]
- [Nízké/Střední/Vysoké] provozní náklady
- [Hlavní přínos pro klienta]

**Pravidlo:** Buď konkrétní a upřímný. Když projekt nedává smysl, řekni to.

### 12. Platební podmínky

**Standard:**
```
● Záloha X %: při podpisu / po akceptaci nabídky
● Doplatek X %: po dodání a převzetí

Celková cena: XX,XXX – XX,XXX (dle skutečných hodin)
```

**Alternativy:**
- Platby po milnících
- Měsíční fakturace
- Fixní cena vs. time & material

### 13. Kontakt a platnost

```
Kontakt:
[Jméno] | [Firma]
[E-mail] | [Telefon]

Datum: [DD. měsíc RRRR]
Nabídka platí: [XX dní]
```

## Pravidla psaní

### Jazyk a tón

**✅ POUŽÍVEJ:**
- Konkrétní čísla: „30 hodin měsíčně", ne „spousta času"
- Aktivní slovesa: „ušetříte", „odbouráte", ne „bude ušetřeno"
- Profesionální, ale lidský tón
- Odrážky u výčtů
- Tabulky u strukturovaných dat

**❌ NEPOUŽÍVEJ:**
- Nadsázku: „revoluční", „unikátní", „neuvěřitelné"
- Mlhavé pojmy: „přibližně", „zhruba", „tak nějak"
- Trpná slovesa: „bude vytvořeno", „je plánováno"
- Dlouhé odstavce (max 3–4 řádky)

### Čísla a odhady

**Vždy:**
- Zaokrouhluj na rozumné jednotky
- Časy zaokrouhluj na 0,5 hodiny
- U nejistých odhadů uveď rozpětí (75 000 – 95 000)
- ROI počítej konzervativně (víc času na implementaci, míň úspor)

**Nikdy:**
- Negarantuj přesné časy (používej „cca", „zhruba")
- Nenafukuj úspory (buď realistický)
- Nezapomeň na provozní náklady

### Vizuální hierarchie

**Nadpisy:**
- H1: Název sekce (`## Technická proveditelnost`)
- H2: Podsekce (`### Současný stav`)
- Tučně pro stav: `**PLNĚ FUNKČNÍ**`
- Odrážky u výčtů

**Zvýraznění:**
- ✅ Pro hotové/funkční
- ⚠️ Pro vyžaduje pozornost
- ❌ Pro mimo rozsah
- 📦 Pro další fáze

## Formát výstupu

### Pro PDF

Když umíš vytvořit PDF, použij skill/nástroj na generování PDF, který máš k dispozici:
- Použij čitelné fonty a rozestupy
- První strana = titulní strana s vizuálně oddělenou sumarizací

### Pro čistý text

Když PDF není k dispozici:
```markdown
# Analýza: [Název projektu]
## Technická studie a cenový propočet

### Shrnutí
[Text…]

## Technická proveditelnost

### [Komponenta 1] - PLNĚ FUNKČNÍ
● [Detail 1]
● [Detail 2]

[… zbytek struktury …]

---
**Kontakt:**
[Jméno] | [Firma]

**Datum:** [DD. měsíc RRRR]
**Nabídka platí:** [XX dní]
```

**Pravidlo:** Čistý text musí být připravený na copy-paste do textového editoru a rychlé naformátování do PDF.

## Checklist před odesláním

- [ ] Obsahuje shrnutí hlavní přínos + ROI v 1–2 větách?
- [ ] Je ROI spočítané na 12/24/36 měsíců?
- [ ] Je cena uvedená jako rozpětí?
- [ ] Má harmonogram konkrétní měsíc dokončení?
- [ ] Mají rizika navržené ošetření?
- [ ] Jsou všechna čísla zaokrouhlená a realistická?
- [ ] Není tam hype ani marketingové žvásty?
- [ ] Je technická část srozumitelná i netechnickému klientovi?
- [ ] Jsou platební podmínky jasné?
- [ ] Je uvedený kontakt a platnost?

## Příklady dobré praxe

**✅ DOBŘE:**
```
Měsíční úspora: 6 313
Návratnost: 12 měsíců (1 rok)
```

**❌ ŠPATNĚ:**
```
Měsíční úspora: cca 6 313,75
Návratnost: tak nějak kolem roku
```

---

**✅ DOBŘE:**
```
Po 24 měsících: +76 068 čistého zisku
```

**❌ ŠPATNĚ:**
```
Po dvou letech: významné úspory
```

---

**✅ DOBŘE:**
```
Riziko                     | Ošetření
---------------------------|---------------------------
Změna struktury webu       | SLA 48 h na opravu
```

**❌ ŠPATNĚ:**
```
Struktura webu se může změnit, ale nějak to vyřešíme.
```

## Pokročilé tipy

### Když klient nemá přesná data

Když klient nezná přesné časy/náklady:
1. Nabídni odhad: „Odhaduju, že podobná pozice stojí kolem X měsíčně"
2. Použij rozpětí: „Pokud to zabere 1–2 hodiny denně…"
3. Dej klientovi domácí úkol: „Pro přesnější propočet potřebuju vědět…"

### Když je projekt nejasný

1. Rozděl na fáze: MVP → Fáze 2 → Fáze 3
2. Vytvoř „Discovery fázi": první týden analýzy za X, teprve pak nabídka
3. Navrhni proof of concept: malý test za Y před plným projektem

### Když je rozpočet malý

1. Zmenši rozsah: „Za tenhle rozpočet umíme dodat…"
2. Navrhni fáze: „První část za X, zbytek později"
3. Ukaž cenu nečinnosti: „Bez automatizace přijdete o Y měsíčně"

### Když soutěžíš s jinými nabídkami

1. **Zdůrazni ROI**, ne cenu
2. Vypíchni, co **ostatní nezahrnují** (podpora, zaškolení, údržba)
3. Uveď **konkrétní výstupy**, ne mlhavé popisy
