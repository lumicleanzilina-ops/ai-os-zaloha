# Time Tracking Dashboard — designové patterny

Tenhle dokument definuje přesný design a layout dashboardu pro sledování času. **Vždycky se jím řiď** — je to specifikace, ne návrh.

## Struktura layoutu

### 1. Horní sekce (dvousloupcový grid)

Dvě sekce vedle sebe (`grid-cols-2 gap-4`):

#### Vlevo: Souhrn (4 statistiky pod sebou)

```jsx
<div className="space-y-4">
  <h3 className="text-lg font-bold text-white mb-2">Souhrn</h3>
  <div className="space-y-3">
    {/* 4 karty pod sebou: celkem hodin, člověkodny, průměr na den, CELKOVÁ ČÁSTKA */}
  </div>
</div>
```

Karta s **celkovou částkou** je povinná — report o odpracovaném čase, který jde s fakturou, musí ukazovat peníze, ne jen hodiny. Aktualizuje se živě podle aktivního filtru projektů, přesně jako celkový počet hodin.

Každá karta:

- Gradientní pozadí podle typu (blue/emerald/purple)
- Ikona vlevo, hodnota vpravo
- Padding: `p-4`, rámeček: `border`, zaoblení: `rounded-lg`
- Font hodnoty: `text-2xl font-bold`

#### Vpravo: Projekty (seznam projektů)

```jsx
<div className="space-y-4">
  <h3 className="text-lg font-bold text-white">Projekty</h3>
  <div className="space-y-2">
    {/* Projekty jako klikatelné řádky */}
  </div>
</div>
```

Každý projekt:

- Plná šířka (`w-full`)
- Padding: `p-3`, rámeček: `border-2`
- Flex layout: název + PD vlevo, hodiny + **částka** + stav vpravo
- Hover a aktivní stav se `scale-[1.02]`

### 2. Kalendář (přes celou šířku)

```jsx
<div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 shadow-2xl mb-6">
  {/* Obsah kalendáře */}
</div>
```

#### Legenda

- Velikost písma: `text-xs`
- Mezera mezi položkami: `gap-1.5`
- Ikony: `w-2 h-2`

#### Mřížka kalendáře

```jsx
// Hlavičky dnů v týdnu
<div className="grid grid-cols-7 gap-2 mb-2">
  {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map(day => (
    <div className="text-center text-xs font-semibold text-gray-400 py-1">
      {day}
    </div>
  ))}
</div>

// Mřížka dnů
<div className="grid grid-cols-7 gap-2">
  {/* Buňky dnů */}
</div>
```

#### Buňka dne

```jsx
<button className="aspect-square rounded-lg border-2 ...">
  <div className="h-full flex flex-col items-center justify-center p-1">
    <div className="text-xl font-bold text-white mb-0.5">{day}</div>
    {hours > 0 && (
      <div className="text-xs font-semibold text-gray-300 bg-black/30 px-1.5 py-0.5 rounded">
        {hours.toFixed(1)}h
      </div>
    )}
  </div>
</button>
```

### 3. Detail dne (zobrazí se po kliknutí na den)

```jsx
<div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-6 border border-gray-600/50 shadow-2xl">
  {/* Hlavička: datum, hodiny celkem + celková částka za daný den, zavírací tlačítko */}
  {/* Seznam projektů daného dne — každý řádek ukazuje svoje hodiny I svoji částku */}
</div>
```

## Barevné schéma

### Intenzita podle hodin (kalendář)

```javascript
const getColorForHours = (hours) => {
  if (!hours) return 'bg-gray-800 border-gray-700';
  if (hours < 4) return 'bg-blue-900/40 border-blue-600/30 hover:bg-blue-800/50';
  if (hours < 7) return 'bg-emerald-900/40 border-emerald-600/30 hover:bg-emerald-800/50';
  if (hours < 9) return 'bg-green-900/40 border-green-600/30 hover:bg-green-800/50';
  if (hours < 11) return 'bg-amber-900/40 border-amber-600/30 hover:bg-amber-800/50';
  return 'bg-red-900/40 border-red-600/30 hover:bg-red-800/50';
};
```

### Projekty (přizpůsob reálným projektům v datech)

```javascript
const projectColors = {
  'Kickoff': 'bg-purple-500/20 border-purple-500/40',
  'Website Redesign': 'bg-blue-500/20 border-blue-500/40',
  'Project C': 'bg-green-500/20 border-green-500/40',
  'Project D': 'bg-orange-500/20 border-orange-500/40',
  'Project E': 'bg-pink-500/20 border-pink-500/40',
};
```

### Statistické karty (pevně dané)

- Celkem hodin: `from-blue-900/40 to-blue-800/20 border-blue-500/30`
- Člověkodny: `from-emerald-900/40 to-emerald-800/20 border-emerald-500/30`
- Průměr: `from-purple-900/40 to-purple-800/20 border-purple-500/30`
- Celková částka: `from-amber-900/40 to-amber-800/20 border-amber-500/30`

## Ikony (Lucide React)

```javascript
import { Calendar, Clock, Briefcase, TrendingUp, Banknote } from 'lucide-react';
```

- Celkem hodin: `<Clock className="w-5 h-5 text-blue-400" />`
- Člověkodny: `<Briefcase className="w-5 h-5 text-emerald-400" />`
- Průměr: `<TrendingUp className="w-5 h-5 text-purple-400" />`
- Celková částka: `<Banknote className="w-5 h-5 text-amber-400" />`

## Interaktivita

### Správa stavu

```javascript
const [selectedDay, setSelectedDay] = useState(null);
const [selectedProject, setSelectedProject] = useState(null);
```

### Logika filtrování

```javascript
const getFilteredHours = (dateStr) => {
  const dayData = timeData[dateStr];
  if (!dayData) return 0;

  if (!selectedProject) return dayData.hours;

  return dayData.projects
    .filter(p => p.project === selectedProject)
    .reduce((sum, p) => sum + p.hours, 0);
};
```

### Obsluha kliknutí na projekt

```javascript
onClick={() => {
  setSelectedProject(isSelected ? null : project);
  setSelectedDay(null);
}}
```

### Obsluha kliknutí na den

```javascript
onClick={() => setSelectedDay(hasData ? dateStr : null)}
disabled={!hasData}
```

## Rozměry a rozestupy

### Mezery

- Mezera v horní sekci: `gap-4`
- Padding kalendáře: `p-4`
- Mezera mezi buňkami dnů: `gap-2`
- Mezera mezi projekty: `gap-2`

### Velikosti písma

- Hlavní nadpis: `text-4xl`
- Nadpisy sekcí: `text-lg` nebo `text-xl`
- Den v kalendáři: `text-xl`
- Hodiny uvnitř dne: `text-xs`
- Hodnoty statistik: `text-2xl`

## Chování na různých šířkách

Primárně desktopový layout se základním breakpointem:

```jsx
grid-cols-2  // Horní sekce má vždycky 2 sloupce
```

## Pozadí a kontejner

```jsx
<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
  <div className="max-w-7xl mx-auto">
    {/* Obsah */}
  </div>
</div>
```

## Zásadní pravidla

1. **Nahoře vždycky 2 sloupce** — Souhrn vlevo, Projekty vpravo.
2. **Kalendář přes celou šířku** pod horní sekcí.
3. **Barevné kódování** podle intenzity hodin.
4. **Interaktivní filtrování** — kliknutím na projekt se profiltruje kalendář.
5. **Detail dne** — zobrazí se až po kliknutí na den.
6. **Kompaktní design** — menší paddingy, mezery i písma, než je výchozí.
7. **Tmavý motiv** — šedá pozadí s barevnými akcenty.
8. **Vždycky ukaž částku** — čtvrtá karta v Souhrnu (celková částka), částka u každého projektu
   v seznamu Projekty a částka u každého projektu v detailu dne. Klientský report ukazuje peníze,
   ne jen čas.
