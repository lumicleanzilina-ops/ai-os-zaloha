# Výkon a optimalizace na mobilu

Spline scény jedou na WebGL — běží na GPU. Špatně zoptimalizovaná scéna ti sestřelí PageSpeed skóre, bude sekat na běžných zařízeních a vysaje baterku na mobilu. Ber je jako videa, ne jako obrázky.

---

## Ještě než začneš integrovat — zkontroluj velikost scény

**Řekni uživateli, ať zkontroluje velikost souboru scény, než ti dá URL.**

- Pod ~3 MB = většinou v pohodě
- 3–10 MB = použitelné, ale optimalizuj, kde to jde
- Přes 10 MB = vážný problém, potřebuje optimalizaci nebo jiný přístup
- Přes 20 MB = nevkládej jako živé 3D — vyexportuj to jako video

Kde to zjistí: v editoru Splinu → Export → Code Export → velikost souboru se ukáže ještě před vygenerováním URL.

**Když je scéna moc těžká, řekni uživateli, ať:**
1. V Export → Play Settings nastaví **Geometry Quality** na „Performance"
2. Sníží úroveň dělení (subdivision) — 1 obvykle stačí, maximálně 2
3. Smaže objekty, které jsou skryté nebo nejsou nikdy vidět
4. Odstraní nepoužité textury a obrázky
5. Použije míň než 3 světla — na odlesky radši Matcap materiály (fingují odrazy bez zátěže GPU)
6. Sloučí objekty, které sdílí stejný materiál

---

## Optimalizační checklist (před integrací)

Projdi si ho, než napíšeš jediný řádek kódu na vložení:

- [ ] Soubor scény je pod 10 MB
- [ ] Geometry Quality je v Play Settings nastavená na „Performance"
- [ ] Pozadí je skryté, když má web vlastní barvu pozadí
- [ ] Vypnuté: Page Scroll, Zoom, Pan (v Play Settings), pokud nejsou vysloveně potřeba
- [ ] Maximálně 1–2 vložené Spline scény na stránku (nikdy víc než 3)
- [ ] Ve scéně jsou míň než 3 světla
- [ ] Žádné textury ve vysokém rozlišení, pokud nejsou nezbytné

---

## Strategie načítání

### 1. Přednačti soubor scény
Přidej do `<head>`, ať se stahování rozjede dřív, než se spustí skripty:
```html
<link rel="preload" href="https://prod.spline.design/REPLACE_ME/scene.splinecode" as="fetch" crossorigin>
```

### 2. Zobraz fallback během načítání
Nikdy nenechávej uživatele koukat do prázdna. Vždycky vykresli barvu pozadí nebo statický obrázek jako placeholder:

```css
.spline-wrapper {
  background: #0a0a0a; /* barva pozadí tvého webu — naskočí okamžitě */
  width: 100%;
  height: 100vh;
}
```

### 3. Lazy load (React)
Nenačítej Spline dřív, než je potřeba:
```jsx
const Spline = lazy(() => import('@splinetool/react-spline'));
```

### 4. Intersection Observer (načti, až když je vidět)
Pro Spline scény pod ohybem stránky:
```js
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadSplineScene(); // načti, až když k tomu uživatel doscrolluje
    observer.disconnect();
  }
});
observer.observe(document.getElementById('spline-section'));
```

---

## Strategie pro mobil

Spline scény zatěžují GPU. Na mobilu:
- Rychle vysají baterku
- Sekají na každém zařízení bez dedikované GPU
- Na slabších Androidech můžou shodit celou záložku prohlížeče

**Vždycky nasaď jednu z těchhle strategií:**

### Varianta A — Na mobilu přeskočit úplně (doporučeno pro hero pozadí)
```js
if (window.innerWidth < 768) {
  // Spline nenačítej — ukaž místo něj statické pozadí
  document.querySelector('.spline-wrapper').style.background = 'url(fallback.jpg) center/cover';
}
```

### Varianta B — Kontrola počtu jader
```js
// navigator.hardwareConcurrency = počet jader CPU
// Málo jader = nejspíš slabé zařízení
if (navigator.hardwareConcurrency <= 2 || window.innerWidth < 768) {
  // Přeskoč Spline, použij fallback
}
```

### Varianta C — Export jako video pro mobil
U dekorativních/neinteraktivních scén: nahraj animaci ve Splinu jako MP4 a na mobilu servíruj to. Uživatel dostane vizuál, GPU nic nestojí.

```js
const isMobile = window.innerWidth < 768;

if (isMobile) {
  // Ukaž video
  document.getElementById('spline-video').style.display = 'block';
} else {
  // Načti Spline
  loadSpline();
}
```

---

## Core Web Vitals (LCP / CLS)

Spline scéna je skoro vždycky prvek **Largest Contentful Paint**, takže přímo ovlivňuje tvoje skóre u Googlu.

### Jak zabránit poskakování layoutu (CLS)
Canvas se načte až po HTML a stránka poskočí. Oprava — předalokuj místo:

```css
canvas#canvas3d {
  width: 100%;
  height: 100vh;
  /* Tímhle řekneš prohlížeči, ať tenhle prostor rezervuje ještě před načtením scény */
  contain: strict;
}
```

Nebo u web komponenty:
```html
<spline-viewer
  url="..."
  style="width: 100%; height: 100vh; display: block;">
</spline-viewer>
```

### Poznámka k Lighthouse
Lighthouse často nedokáže spočítat skóre výkonu vůbec, když je Spline scéna dominantním prvkem nad ohybem stránky. Je to známé omezení Lighthouse, ne nutně problém webu. Na reálné profilování použij radši WebPageTest nebo Chrome DevTools.

---

## Kdy živé 3D NEPOUŽÍVAT

Někdy je vložený Spline prostě špatný nástroj. Sáhni po videu nebo GIFu, když:

- Animace nereaguje na uživatele (nesleduje myš, nedá se klikat)
- Soubor scény má přes 15 MB
- Tvoje cílovka je primárně na mobilu
- Potřebuješ, aby stránka měla na PageSpeed přes 80 bodů

**Jak vyexportovat video ze Splinu:**
V editoru Splinu → Export → Video → nahraj animaci → zkomprimuj v HandBrake → nahraj na GitHub nebo CDN → vlož jako `<video autoplay loop muted playsinline>`
