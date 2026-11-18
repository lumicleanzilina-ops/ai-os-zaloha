---
name: debugging
description: Systematické techniky hledání chyb, profiling nástroje a analýza skutečné příčiny, abys efektivně vystopoval bug v jakémkoliv kódu a technologii. Použij, když hledáš chybu, něco se chová divně, padá ti to, je to pomalé nebo vyšetřuješ neočekávané chování.
---

# Strategie debuggingu

Proměň debugging z frustrujícího hádání v systematické řešení problémů — s ověřenými strategiemi, silnými nástroji a metodickým postupem.

## Kdy tuhle dovednost použít

- Honíš nepolapitelný bug
- Vyšetřuješ výkonnostní problémy
- Zorientováváš se v cizím kódu
- Debuguješ problémy v produkci
- Analyzuješ crash dumpy a stack trace
- Profiluješ výkon aplikace
- Vyšetřuješ memory leaky
- Debuguješ distribuované systémy

## Základní principy

### 1. Vědecká metoda

1. **Pozoruj**: Jaké je skutečné chování?
2. **Vytvoř hypotézu**: Co to může způsobovat?
3. **Experimentuj**: Otestuj svou hypotézu
4. **Analyzuj**: Potvrdilo se to, nebo vyvrátilo?
5. **Opakuj**: Dokud nenajdeš skutečnou příčinu

### 2. Debuggovací mindset

**Nepředpokládej:**
- „Tohle to být nemůže“ — může
- „Y jsem přece neměnil“ — stejně to zkontroluj
- „U mě to funguje“ — zjisti proč

**Dělej:**
- Reprodukuj spolehlivě
- Izoluj problém
- Dělej si podrobné poznámky
- Zpochybňuj všechno
- Když se zasekneš, dej si pauzu

### 3. Rubber duck debugging

Vysvětli svůj kód a problém nahlas (gumové kachničce, kolegovi, nebo sám sobě). Často tím na chybu přijdeš.

## Systematický postup debuggingu

### Fáze 1: Reprodukce

```markdown
## Checklist reprodukce

1. **Umíš to reprodukovat?**
   - Vždycky? Občas? Náhodně?
   - Je potřeba konkrétní situace?
   - Reprodukují to i ostatní?

2. **Udělej minimální reprodukci**
   - Zjednoduš na nejmenší možný příklad
   - Vyhoď nesouvisející kód
   - Izoluj problém

3. **Sepiš kroky**
   - Zapiš přesný postup
   - Poznamenej detaily prostředí
   - Zachyť chybové hlášky
```

### Fáze 2: Sesbírej informace

```markdown
## Sběr informací

1. **Chybové hlášky**
   - Celý stack trace
   - Chybové kódy
   - Výstup z konzole/logů

2. **Prostředí**
   - Verze OS
   - Verze jazyka/runtimu
   - Verze závislostí
   - Proměnné prostředí

3. **Nedávné změny**
   - Historie gitu
   - Časová osa nasazení
   - Změny konfigurace

4. **Rozsah**
   - Týká se to všech uživatelů, nebo jen některých?
   - Všech prohlížečů, nebo jen některých?
   - Jen produkce, nebo i devu?
```

### Fáze 3: Postav hypotézu

```markdown
## Tvorba hypotézy

Na základě sesbíraných informací se ptej:

1. **Co se změnilo?**
   - Nedávné změny v kódu
   - Aktualizace závislostí
   - Změny infrastruktury

2. **V čem je rozdíl?**
   - Fungující vs. rozbité prostředí
   - Fungující vs. rozbitý uživatel
   - Před vs. po

3. **Kde to může selhat?**
   - Validace vstupu
   - Byznys logika
   - Datová vrstva
   - Externí služby
```

### Fáze 4: Otestuj a ověř

```markdown
## Testovací strategie

1. **Binární vyhledávání**
   - Zakomentuj polovinu kódu
   - Zúž problematickou část
   - Opakuj, dokud ji nenajdeš

2. **Přidej logování**
   - Strategicky rozmístěný console.log/print
   - Sleduj hodnoty proměnných
   - Trasuj tok vykonávání

3. **Izoluj komponenty**
   - Testuj každý kus zvlášť
   - Mockuj závislosti
   - Odstraň složitost

4. **Porovnej fungující vs. rozbité**
   - Diffni konfigurace
   - Diffni prostředí
   - Diffni data
```

## Debuggovací nástroje

### Debugging v JavaScriptu/TypeScriptu

```typescript
// Debugger v Chrome DevTools
function processOrder(order: Order) {
  debugger; // Vykonávání se tady zastaví

  const total = calculateTotal(order);
  console.log("Total:", total);

  // Podmíněný breakpoint
  if (order.items.length > 10) {
    debugger; // Zastaví se jen když podmínka platí
  }

  return total;
}

// Techniky debuggingu přes konzoli
console.log("Value:", value); // Základ
console.table(arrayOfObjects); // Tabulkový formát
console.time("operation");
/* kód */ console.timeEnd("operation"); // Měření času
console.trace(); // Stack trace
console.assert(value > 0, "Value must be positive"); // Aserce

// Profiling výkonu
performance.mark("start-operation");
// ... kód operace
performance.mark("end-operation");
performance.measure("operation", "start-operation", "end-operation");
console.log(performance.getEntriesByType("measure"));
```

**Konfigurace debuggeru ve VS Code:**

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Program",
      "program": "${workspaceFolder}/src/index.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "program": "${workspaceFolder}/node_modules/jest/bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Debugging v Pythonu

```python
# Vestavěný debugger (pdb)
import pdb

def calculate_total(items):
    total = 0
    pdb.set_trace()  # Debugger startuje tady

    for item in items:
        total += item.price * item.quantity

    return total

# Breakpoint (Python 3.7+)
def process_order(order):
    breakpoint()  # Pohodlnější než pdb.set_trace()
    # ... kód

# Post-mortem debugging
try:
    risky_operation()
except Exception:
    import pdb
    pdb.post_mortem()  # Debuguj v místě výjimky

# Debugging přes IPython (ipdb)
from ipdb import set_trace
set_trace()  # Lepší rozhraní než pdb

# Logging pro debugging
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def fetch_user(user_id):
    logger.debug(f'Fetching user: {user_id}')
    user = db.query(User).get(user_id)
    logger.debug(f'Found user: {user}')
    return user

# Profiling výkonu
import cProfile
import pstats

cProfile.run('slow_function()', 'profile_stats')
stats = pstats.Stats('profile_stats')
stats.sort_stats('cumulative')
stats.print_stats(10)  # 10 nejpomalejších
```

### Debugging v Go

```go
// Debugger Delve
// Instalace: go install github.com/go-delve/delve/cmd/dlv@latest
// Spuštění: dlv debug main.go

import (
    "fmt"
    "runtime"
    "runtime/debug"
)

// Vypiš stack trace
func debugStack() {
    debug.PrintStack()
}

// Zotavení z paniky s debug výpisem
func processRequest() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("Panic:", r)
            debug.PrintStack()
        }
    }()

    // ... kód, který může panikařit
}

// Profiling paměti
import _ "net/http/pprof"
// Otevři http://localhost:6060/debug/pprof/

// Profiling CPU
import (
    "os"
    "runtime/pprof"
)

f, _ := os.Create("cpu.prof")
pprof.StartCPUProfile(f)
defer pprof.StopCPUProfile()
// ... kód k profilování
```

## Pokročilé techniky debuggingu

### Technika 1: Debugging binárním vyhledáváním

```bash
# Git bisect na dohledání regrese
git bisect start
git bisect bad                    # Aktuální commit je špatný
git bisect good v1.0.0            # v1.0.0 byla v pořádku

# Git checkoutne prostřední commit
# Otestuj ho a pak:
git bisect good   # když to funguje
git bisect bad    # když je to rozbité

# Pokračuj, dokud bug nenajdeš
git bisect reset  # až budeš hotový
```

### Technika 2: Diferenciální debugging

Porovnej fungující a rozbité:

```markdown
## V čem je rozdíl?

| Aspekt       | Funguje     | Rozbité        |
| ------------ | ----------- | -------------- |
| Prostředí    | Development | Produkce       |
| Verze Node   | 18.16.0     | 18.15.0        |
| Data         | Prázdná DB  | 1M záznamů     |
| Uživatel     | Admin       | Běžný uživatel |
| Prohlížeč    | Chrome      | Safari         |
| Čas          | Přes den    | Po půlnoci     |

Hypotéza: problém závislý na čase? Zkontroluj práci s časovými zónami.
```

### Technika 3: Trace debugging

```typescript
// Trasování volání funkcí
function trace(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with args:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`${propertyKey} returned:`, result);
    return result;
  };

  return descriptor;
}

class OrderService {
  @trace
  calculateTotal(items: Item[]): number {
    return items.reduce((sum, item) => sum + item.price, 0);
  }
}
```

### Technika 4: Detekce memory leaků

```typescript
// Memory Profiler v Chrome DevTools
// 1. Udělej heap snapshot
// 2. Proveď akci
// 3. Udělej další snapshot
// 4. Porovnej snapshoty

// Debugging paměti v Node.js
if (process.memoryUsage().heapUsed > 500 * 1024 * 1024) {
  console.warn("High memory usage:", process.memoryUsage());

  // Vygeneruj heap dump
  require("v8").writeHeapSnapshot();
}

// Hledání memory leaků v testech
let beforeMemory: number;

beforeEach(() => {
  beforeMemory = process.memoryUsage().heapUsed;
});

afterEach(() => {
  const afterMemory = process.memoryUsage().heapUsed;
  const diff = afterMemory - beforeMemory;

  if (diff > 10 * 1024 * 1024) {
    // hranice 10 MB
    console.warn(`Possible memory leak: ${diff / 1024 / 1024}MB`);
  }
});
```

## Debuggovací vzory podle typu problému

### Vzor 1: Nahodilé bugy

```markdown
## Strategie na flaky bugy

1. **Přidej hodně logování**
   - Loguj časové údaje
   - Loguj všechny změny stavu
   - Loguj interakce s okolím

2. **Hledej race conditions**
   - Souběžný přístup ke sdílenému stavu
   - Async operace dokončené mimo pořadí
   - Chybějící synchronizace

3. **Zkontroluj časové závislosti**
   - setTimeout/setInterval
   - Pořadí rozplétání promisů
   - Časování animačních snímků

4. **Zatěžkávací test**
   - Spusť to mnohokrát
   - Měň časování
   - Simuluj zátěž
```

### Vzor 2: Výkonnostní problémy

```markdown
## Debugging výkonu

1. **Nejdřív profiluj**
   - Neoptimalizuj naslepo
   - Měř před i po
   - Najdi úzká hrdla

2. **Obvyklí viníci**
   - N+1 dotazy
   - Zbytečné re-rendery
   - Zpracování velkých dat
   - Synchronní I/O

3. **Nástroje**
   - Záložka Performance v prohlížečových DevTools
   - Lighthouse
   - Python: cProfile, line_profiler
   - Node: clinic.js, 0x
```

### Vzor 3: Produkční bugy

```markdown
## Debugging v produkci

1. **Sesbírej důkazy**
   - Error tracking (Sentry, Bugsnag)
   - Logy aplikace
   - Hlášení od uživatelů
   - Metriky/monitoring

2. **Reprodukuj lokálně**
   - Použij produkční data (anonymizovaná)
   - Napodob prostředí
   - Projdi přesný postup

3. **Bezpečné vyšetřování**
   - Neměň produkci
   - Použij feature flagy
   - Přidej monitoring/logování
   - Fixy testuj na stagingu
```

## Best practices

1. **Nejdřív reprodukuj**: Co neumíš reprodukovat, neopravíš
2. **Izoluj problém**: Odstraňuj složitost až na minimální případ
3. **Čti chybové hlášky**: Většinou opravdu pomůžou
4. **Zkontroluj nedávné změny**: Většina bugů je čerstvá
5. **Používej verzování**: Git bisect, blame, historie
6. **Dávej si pauzy**: Odpočaté oči vidí víc
7. **Zapisuj zjištění**: Pomůžeš budoucímu sobě
8. **Oprav příčinu**: Ne jen příznaky

## Časté chyby při debuggingu

- **Měníš víc věcí naráz**: Měň vždycky jednu věc
- **Nečteš chybové hlášky**: Přečti celý stack trace
- **Předpokládáš, že je to složité**: Většinou je to prostá věc
- **Debug logy v produkci**: Vyhoď je před nasazením
- **Nepoužíváš debugger**: console.log není vždycky nejlepší
- **Vzdáváš to moc brzo**: Vytrvalost se vyplácí
- **Netestuješ opravu**: Ověř, že to fakt funguje

## Rychlý debuggovací checklist

```markdown
## Když se zasekneš, zkontroluj:

- [ ] Překlepy (chyby v názvech proměnných)
- [ ] Velká a malá písmena (fileName vs. filename)
- [ ] Hodnoty null/undefined
- [ ] Index pole o jedna vedle
- [ ] Časování asynchronních operací (race conditions)
- [ ] Problémy se scope (closure, hoisting)
- [ ] Neshody typů
- [ ] Chybějící závislosti
- [ ] Proměnné prostředí
- [ ] Cesty k souborům (absolutní vs. relativní)
- [ ] Problémy s cache (vymaž cache)
- [ ] Zastaralá data (obnov databázi)
```

> Původ: wshobson/agents, dovednost debugging-strategies (MIT, Copyright (c) 2024 Seth Hobson); přejmenováno a přeloženo do češtiny. Licence a změny: THIRD-PARTY-NOTICES.md v kořeni kitu.
