# Integrace v čistém JS / HTML

Dvě metody podle toho, kolik kontroly potřebuješ.

## Příprava lokální knihovny

V oficiálním npm registru ověř konkrétní vydání `@splinetool/viewer` (metoda A) nebo
`@splinetool/runtime` (metoda B), jeho závislosti a známé bezpečnostní problémy. Instaluj
zvolenou přesnou verzi do svého projektu s `--save-exact` a uchovej lockfile.
Existujícím bundlerem projektu vytvoř lokální modul včetně závislostí: viewer entry importuje
`@splinetool/viewer`, runtime entry exportuje `Application` z `@splinetool/runtime`.
V ukázkách umísti výstup na `./vendor/spline-viewer.js`, respektive `./vendor/runtime.module.js`;
pokud build používá jinou cestu, odkazy uprav. Tyto výstupy Kit neobsahuje. Ověř načtení lokálně
před publikací; nekopíruj jen jeden soubor bez jeho importovaných závislostí.

---

## Metoda A — Web komponenta (ve většině případů doporučeno)

Po vytvoření lokálního viewer bundlu ho přidej do HTML. Umí lazy loading, průhledné pozadí i interakci s myší.

```html
<!-- V <head> — načte web komponentu -->
<script type="module" src="./vendor/spline-viewer.js"></script>

<!-- Základní vložení -->
<spline-viewer url="https://prod.spline.design/REPLACE_ME/scene.splinecode"></spline-viewer>

<!-- S reakcí na pohyb myši (třeba roboti sledující kurzor) -->
<spline-viewer
  url="https://prod.spline.design/REPLACE_ME/scene.splinecode"
  events-target="global">
</spline-viewer>

<!-- Průhledné pozadí -->
<spline-viewer
  url="https://prod.spline.design/REPLACE_ME/scene.splinecode"
  background="transparent">
</spline-viewer>
```

---

## Metoda B — Runtime API (když potřebuješ programovou kontrolu)

Použij, když potřebuješ hýbat s objekty, spouštět animace nebo reagovat na události z vlastního JS.

Po přípravě lokálního runtime bundlu:
```html
<script type="module">
  import { Application } from './vendor/runtime.module.js';
  // ... zbytek tvého kódu
</script>
```

Základní použití:
```js
import { Application } from '@splinetool/runtime';

const canvas = document.getElementById('canvas3d');
const spline = new Application(canvas);

spline.load('https://prod.spline.design/REPLACE_ME/scene.splinecode').then(() => {
  console.log('Scene loaded');
});
```

S interakcí s objekty:
```js
spline.load(sceneUrl).then(() => {
  const obj = spline.findObjectByName('Cube');
  // nebo podle ID: spline.findObjectById('uuid-here')

  obj.position.x += 50;
  obj.rotation.y += Math.PI / 4; // POZOR: radiány, NE stupně
  obj.scale.x = 2;
});
```

S posluchači událostí:
```js
spline.load(sceneUrl).then(() => {
  spline.addEventListener('mouseDown', (e) => {
    console.log('Clicked:', e.target.name);
  });
});
```

Spouštění animací z kódu:
```js
spline.load(sceneUrl).then(() => {
  const obj = spline.findObjectByName('MyObject');
  obj.emitEvent('mouseHover');       // dopředu
  obj.emitEventReverse('mouseHover'); // pozpátku
});
```

---

## Nastavení pozadí přes celou stránku

Nejčastější případ použití — Spline scéna za vším obsahem.

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="./vendor/spline-viewer.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      /* NEPŘIDÁVEJ sem overflow: hidden — rozbije to scrollování stránky */
      position: relative;
    }

    .spline-bg {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      /* pointer-events: none — použij, když je scéna jen dekorativní */
      /* pointer-events: all — použij, když chceš interakci myší */
      pointer-events: all;
    }

    .content {
      position: relative;
      z-index: 1;
      /* Hlídej, aby prvky obsahu neblokovala 3D scéna */
    }

    /* Fallback zobrazený, dokud se Spline načítá nebo když selže */
    .spline-fallback {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: 0;
      background: #0a0a0a; /* dorovnej na základní barvu webu */
      display: none; /* defaultně skryté, zobrazí se přes JS podle potřeby */
    }
  </style>
</head>
<body>
  <!-- Fallback (zobrazí se, když se Spline nenačte) -->
  <div class="spline-fallback" id="spline-fallback"></div>

  <!-- Spline pozadí -->
  <div class="spline-bg">
    <spline-viewer
      url="https://prod.spline.design/REPLACE_ME/scene.splinecode"
      events-target="global"
      style="width:100%; height:100%;">
    </spline-viewer>
  </div>

  <!-- Obsah tvého webu -->
  <div class="content">
    <h1>Your Content Here</h1>
  </div>

  <script>
    // Když se Spline nenačte do 8 sekund, zobraz fallback
    setTimeout(() => {
      const viewer = document.querySelector('spline-viewer');
      if (!viewer || !viewer.shadowRoot) {
        document.getElementById('spline-fallback').style.display = 'block';
      }
    }, 8000);

    // Na slabých mobilech Spline úplně přeskoč — ušetříš baterku i výkon
    if (window.innerWidth < 768 || navigator.hardwareConcurrency <= 2) {
      document.querySelector('.spline-bg').style.display = 'none';
      document.getElementById('spline-fallback').style.display = 'block';
    }
  </script>
</body>
</html>
```

---

## Dostupné typy událostí

| Událost | Kdy se hodí |
|---|---|
| `mouseDown` | Klik/ťuknutí na objekt |
| `mouseUp` | Uvolnění po kliknutí |
| `mouseHover` | Kurzor vjede do oblasti objektu |
| `mousePress` | Držení stisknutého tlačítka |
| `keyDown` | Stisk klávesy |
| `keyUp` | Uvolnění klávesy |
| `start` | Scéna se načetla a rozběhla |
| `scroll` | Scrollování stránky |

---

## Preload (zkrátí vnímanou dobu načítání)

Přidej do `<head>`, ať se soubor scény začne stahovat dřív, než se spustí skripty:

```html
<link rel="preload" href="https://prod.spline.design/REPLACE_ME/scene.splinecode" as="fetch" crossorigin>
```

Kompletní strategii optimalizace najdeš v [PERFORMANCE.md](PERFORMANCE.md).
Ladění řeší [COMMON_PROBLEMS.md](COMMON_PROBLEMS.md).
