---
name: time-tracking-dashboard
description: Udělá z CSV s odpracovaným časem vyladěný interaktivní React dashboard připravený pro klienta. Použij, když uživatel nahraje CSV s výkazem práce (projekt, datum, hodiny, poznámka, částka) a chce z něj vizuální přehled k odeslání klientovi — měsíční kalendář obarvený podle intenzity, statistické karty a filtrování po projektech. Spouští ji věty jako „udělej dashboard z výkazu", „mám CSV s odpracovanými hodinami", „vykázání práce pro klienta" nebo „pošli klientovi přehled hodin k faktuře". VŽDY nejdřív projde CSV a zeptá se, které projekty do dashboardu patří, a VŽDY ukáže vyfakturovanou částku. Vyrábí pevně daný tmavý design, ne volný layout.
---

# Time Tracking Dashboard

Udělá z CSV s výkazem odpracovaného času profesionální interaktivní React dashboard, který se dá rovnou poslat klientovi. Dashboard ukazuje měsíční kalendář obarvený podle intenzity práce, statistické karty (celkem hodin, člověkodny, průměr na den) a klikatelné filtry po projektech.

> **🎁 Bonus — jde ruku v ruce s extension na měření času** ve složce [`tools/time-tracking-extension/`](../../tools/time-tracking-extension/). Uživatel si měří hodiny přímo v Chromu (odlehčená náhrada Toggl), na konci měsíce vyexportuje CSV a ty z něj uděláš tenhle klientský dashboard. Celý koloběh: **měř → vyexportuj CSV → „postav dashboard pro klienta X" → pošli to s fakturou**, takže klient přesně vidí, kdy jsi dělal, na jakém projektu a který den. Instalace je popsaná v README té složky.

## Očekávaný formát CSV

CSV musí obsahovat aspoň tyhle sloupce:

- `Project` — název projektu
- `Date` — datum ve formátu `YYYY-MM-DD`
- `Hours` — odpracované hodiny (desetinné číslo)
- `Amount` — vyfakturovaná částka za daný záznam (může se jmenovat `Amount`, `Částka`, `Total`, `Price`,
  `Cost` nebo `Fee`). **Na dashboardu je vidět vždycky.** Pokud v CSV opravdu žádný sloupec s částkou
  není, zeptej se uživatele na sazbu a částku dopočítej (viz krok 0).
- Volitelně: `Session`, `Note`, `Minutes`

Příklad:

```csv
Project,Session,Date,Minutes,Hours,Note,Amount
"Website Redesign","Frontend build","2026-01-09","530","8.85","Done","8850"
"Kickoff","Intro call","2026-01-06","480","8.00","Done","8000"
```

## Postup

### Krok 0 — Projdi CSV a potvrď rozsah (VŽDYCKY nejdřív tohle)

Nikdy nezačínej rovnou stavět. Nejdřív si CSV přečti, zorientuj se a ověř si to s uživatelem:

1. **Najdi sloupce.** Vyhledej sloupec s projektem, datem a hodinami — a **sloupec s částkou**
   (`Amount` / `Částka` / `Total` / `Price` / `Cost` / `Fee`). Když je v souboru uvedená měna, poznamenej si ji.
2. **Shrň uživateli, co v souboru je** — jeden krátký přehledný blok: **rozsah dat**,
   **seznam nalezených projektů** (u každého hodiny + částka) a **celkové součty** (hodiny + částka).
3. **Zeptej se, které projekty zahrnout:** *„Chceš na dashboardu všechny tyhle projekty, nebo jen
   některé — a které?"* Počkej na odpověď. Stav dashboard **jen z projektů, které vybere** (když řekne
   „všechny", ber všechny). Všechno ostatní — statistiky, kalendář, částka — vychází z toho výběru.
4. **Pokud sloupec s částkou úplně chybí,** řekni to a zeptej se na **sazbu** (za hodinu, nebo za
   projekt), ať částku dopočítáš — dashboard ji musí ukázat *vždycky*. Potvrď si **měnu**
   (např. Kč, €, $; výchozí je podle lokalizace uživatele).

Teprve až uživatel potvrdí rozsah projektů, pusť se do parsování a stavby.

### Krok 1 — Naparsuj CSV a udělej agregace

Přečti CSV (profiltrované na projekty, které uživatel vybral v kroku 0) a spočítej:

- Celkem hodin za měsíc a **celkovou vyfakturovanou částku**
- Hodiny **a částku** po dnech
- Hodiny **a částku** po projektech
- Člověkodny (celkem hodin / 8)
- Průměr hodin na odpracovaný den

```python
import csv
from collections import defaultdict

with open('time-tracking.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    data = list(reader)

# Projekty, které uživatel vybral v kroku 0 (None = všechny).
chosen = None  # např. {'Website Redesign', 'Kickoff'}

def get_amount(row):
    for key in ('Amount', 'Částka', 'Total', 'Price', 'Cost', 'Fee'):
        if row.get(key):
            return float(row[key])
    return 0.0  # chybí sloupec s částkou → dopočítej ze sazby uživatele (viz krok 0)

days_data = defaultdict(lambda: {'hours': 0, 'amount': 0, 'projects': []})
for row in data:
    project = row['Project']
    if chosen is not None and project not in chosen:
        continue
    date = row['Date']
    hours = float(row['Hours'])
    amount = get_amount(row)

    days_data[date]['hours'] += hours
    days_data[date]['amount'] += amount
    days_data[date]['projects'].append({
        'project': project,
        'session': row.get('Session', ''),
        'hours': hours,
        'amount': amount,
    })
```

### Krok 2 — Postav React dashboard

1. **Vždycky začni tím, že si přečteš designovou specifikaci:** `references/design-patterns.md`.
2. Jako základ použij `assets/dashboard-template.jsx`.
3. Do objektu `timeData` doplň data vytažená z CSV.
4. Každému projektu přiřaď vlastní barvu.

**Důležité:** dashboard se MUSÍ držet designové specifikace v referenčním souboru — je to pevně daný styl, ne volný layout.

### Krok 3 — Tvar dat v dashboardu

```javascript
const timeData = {
  '2026-01-06': {
    hours: 8.00,
    amount: 8000,
    projects: [
      { project: 'Kickoff', session: 'Intro call', hours: 8.00, amount: 8000 }
    ]
  },
  '2026-01-09': {
    hours: 8.85,
    amount: 8850,
    projects: [
      { project: 'Website Redesign', session: 'Frontend build', hours: 8.85, amount: 8850 }
    ]
  },
  // ... další dny
};
```

## Klíčové prvky dashboardu

1. **Statistiky** (levý sloupec):
   - Celkem hodin, přepočítává se živě, když je aktivní filtr projektů
   - Člověkodny (PD) = hodiny / 8
   - Průměr hodin na odpracovaný den
   - **Celková vyfakturovaná částka** — vidět vždycky, přepočítává se živě s filtrem projektů

2. **Projekty** (pravý sloupec):
   - Seznam vybraných projektů s hodinami, PD **a částkou**
   - Kliknutím se profiltruje kalendář
   - Barevně odlišené po projektech

3. **Kalendář** (přes celou šířku, pod statistikami):
   - Měsíční pohled obarvený podle intenzity
   - Kliknutím na den se rozbalí rozpad po projektech
   - Respektuje aktivní filtr projektů

4. **Detail dne** (zobrazí se po kliknutí na den):
   - Datum, hodiny celkem **a celková částka za ten den**
   - Všechny projekty a jednotlivé záznamy (`Session`) toho dne, u každého hodiny **a částka**
   - Respektuje aktivní filtr projektů

## Logika barev

Intenzita podle hodin:

- Šedá: 0 h (volno)
- Modrá: <4 h (lehký den)
- Světle zelená: 4–7 h (střední)
- Tmavě zelená: 7–9 h (standard)
- Oranžová: 9–11 h (intenzivní)
- Červená: >11 h (maximum)

Každý projekt dostane vlastní barvu:

```javascript
const projectColors = {
  'Kickoff': 'bg-purple-500/20 border-purple-500/40',
  'Website Redesign': 'bg-blue-500/20 border-blue-500/40',
  'Project C': 'bg-green-500/20 border-green-500/40',
  // ... přizpůsob reálným projektům v datech
};
```

## Dokončení

1. Ulož soubor jako `.jsx`.
2. Předej ho uživateli (jako artifact nebo soubor).
3. Shrň mu krátce statistiky (celkem hodin, člověkodny, průměr **a celková částka**) — a napiš,
   které projekty dashboard pokrývá (všechny, nebo tu podmnožinu, kterou vybral v kroku 0).

## Reference

- **Designová specifikace:** kompletní design a layout v `references/design-patterns.md`
- **Šablona:** základní struktura v `assets/dashboard-template.jsx`

## Poznámky

- Hodiny se přepočítávají na osmihodinový člověkoden; když uživatel pracuje s jinak dlouhým standardním dnem, uprav dělitele.
- **Vyfakturovaná částka je vidět vždycky** — kvůli tomu ten klientský report je. Bere se ze sloupce
  s částkou v CSV (`Amount` / `Částka` / `Total` / …). Když CSV žádný takový sloupec nemá, zeptej se
  uživatele na sazbu a částku dopočítej (hodiny × sazba); dashboard nikdy neposílej bez částky.
  Ukaž měnu, výchozí podle lokalizace uživatele (např. `Kč` pro češtinu, `€`, `$`).
