# Integrace v React / Next.js / Vue

---

## React / Vite

Instaluj prověřenou přesnou verzi `@splinetool/react-spline` z oficiálního registru
s `--save-exact`; uchovej lockfile. Verzi vyber podle Reactu a bundleru svého projektu.

Základ:
```jsx
import Spline from '@splinetool/react-spline';

export default function App() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Spline scene="https://prod.spline.design/REPLACE_ME/scene.splinecode" />
    </div>
  );
}
```

S interakcí s objekty a posluchači událostí:
```jsx
import { useRef } from 'react';
import Spline from '@splinetool/react-spline';

export default function App() {
  const splineRef = useRef();

  function onLoad(splineApp) {
    splineRef.current = splineApp;
  }

  function triggerAnimation() {
    splineRef.current.emitEvent('mouseHover', 'Cube');
  }

  function onSplineEvent(e) {
    console.log('Object interacted:', e.target.name);
  }

  return (
    <div>
      <Spline
        scene="https://prod.spline.design/REPLACE_ME/scene.splinecode"
        onLoad={onLoad}
        onMouseDown={onSplineEvent}
      />
      <button onClick={triggerAnimation}>Trigger</button>
    </div>
  );
}
```

**Lazy loading (doporučeno kvůli výkonu):**
```jsx
import { lazy, Suspense } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

export default function Hero() {
  return (
    <Suspense fallback={<div style={{ background: '#0a0a0a', width: '100%', height: '100vh' }} />}>
      <Spline scene="https://prod.spline.design/REPLACE_ME/scene.splinecode" />
    </Suspense>
  );
}
```

---

## Next.js

Použij stejný postup připnutí `@splinetool/react-spline` jako v části React výše.

**Použij import z `/next`** kvůli podpoře SSR a automatickému rozmazanému placeholderu:
```jsx
import Spline from '@splinetool/react-spline/next';

export default function Page() {
  return (
    <Spline scene="https://prod.spline.design/REPLACE_ME/scene.splinecode" />
  );
}
```

**S dynamickým importem (když ti padají hydratační chyby):**
```jsx
import dynamic from 'next/dynamic';

const Spline = dynamic(() => import('@splinetool/react-spline/next'), {
  ssr: false,
  loading: () => <div style={{ background: '#0a0a0a', width: '100%', height: '100vh' }} />
});

export default function Page() {
  return <Spline scene="https://prod.spline.design/REPLACE_ME/scene.splinecode" />;
}
```

---

## Vue

Instaluj prověřenou přesnou verzi `@splinetool/vue-spline` s `--save-exact` a uchovej lockfile.

```vue
<template>
  <Spline
    scene="https://prod.spline.design/REPLACE_ME/scene.splinecode"
    @spline-loaded="onLoaded"
    @mouseDown="onClick"
  />
</template>

<script>
import Spline from '@splinetool/vue-spline';

export default {
  components: { Spline },
  methods: {
    onLoaded(spline) {
      const obj = spline.findObjectByName('Cube');
      obj.position.x += 10; // POZOR: rotace se zadává v radiánech, ne ve stupních
    },
    onClick(e) {
      console.log('Clicked:', e.target.name);
    }
  }
}
</script>
```

---

## Pozadí přes celou stránku (React)

```jsx
import Spline from '@splinetool/react-spline';
import { useState } from 'react';

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);

  // Na mobilu a slabých zařízeních Spline přeskoč
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const isLowEnd = typeof navigator !== 'undefined' && navigator.hardwareConcurrency <= 2;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>

      {/* Fallback pozadí — vykreslené vždy, schová se po načtení Splinu */}
      <div style={{
        position: 'absolute', inset: 0,
        background: '#0a0a0a',
        zIndex: 0,
        opacity: loaded ? 0 : 1,
        transition: 'opacity 0.5s ease'
      }} />

      {/* Spline scéna — načítej jen na dostatečně výkonných zařízeních */}
      {!isMobile && !isLowEnd && (
        <Spline
          scene="https://prod.spline.design/REPLACE_ME/scene.splinecode"
          onLoad={() => setLoaded(true)}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            zIndex: 0
          }}
        />
      )}

      {/* Obsah leží nahoře */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1>Your Content Here</h1>
      </div>

    </div>
  );
}
```

---

## Přehled React props

| Prop | Typ | Popis |
|---|---|---|
| `scene` | string | URL scény (povinné) |
| `onLoad` | function | Zavolá se se splineApp po načtení |
| `onMouseDown` | function | Stisk myši/dotyk na objektu |
| `onMouseUp` | function | Uvolnění myši/dotyku |
| `onMouseHover` | function | Najetí na objekt |
| `onKeyDown` | function | Stisk klávesy |
| `onKeyUp` | function | Uvolnění klávesy |
| `onStart` | function | Scéna se rozběhla |
| `onScroll` | function | Událost scrollu |
| `style` | object | CSS styly pro canvas |
| `className` | string | CSS třída |

Než to dokončíš, přečti si [PERFORMANCE.md](PERFORMANCE.md) a [COMMON_PROBLEMS.md](COMMON_PROBLEMS.md).
