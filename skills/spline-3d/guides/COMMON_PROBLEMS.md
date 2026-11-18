# Typické problémy a ladění

Tohle jsou reálné problémy, které vyplavou až po integraci. Přečti si to, než dokončíš jakoukoliv implementaci Splinu.

---

## 🚨 Zásadní zrádnosti (rozbijí ti web)

---

### 1. Zablokovaný scroll — stránkou nejde scrollovat

**Co se děje:** Po přidání Splinu přestane celá stránka scrollovat. Uživatel je zaseknutý.

**Proč:** Automaticky generované exporty Splinu pro čistý JS defaultně vkládají do CSS `<body>` pravidlo `overflow: hidden`. Mají to zapečené v generovaném kódu.

**Oprava:**
```css
/* Přidej do svého CSS — přebije to, co vkládá Spline */
body {
  overflow: auto !important;
}
```

Nebo v Play Settings (editor Splinu → Export → Play Settings) **vypni „Page Scroll"**, ještě než URL vygeneruješ. Z výstupu tím pravidlo overflow zmizí.

**Zkontroluj i tohle:** Když používáš Runtime API a vložil jsi vygenerované soubory `index.html`, otevři je a ručně z bloku `<style>` smaž řádek s `overflow: hidden`.

---

### 2. Bílý obdélník za 3D scénou

**Co se děje:** Tvůj tmavý nebo průhledný web má v místě Spline scény bílý obdélník.

**Proč:** V exportních nastaveních Splinu je barva pozadí defaultně bílá.

**Oprava:**
1. V editoru Splinu → Export → Play Settings → zapni **Hide Background**
2. Klikni na **Generate Draft** nebo **Promote to Production** — URL se s novým nastavením NEAKTUALIZUJE sama
3. Zkopíruj novou URL

U web komponenty to můžeš přebít i inline:
```html
<spline-viewer url="..." background="transparent"></spline-viewer>
```

---

### 3. Spline scéna se občas nenačte

**Co se děje:** Někdy se stránka načte v pohodě, jindy je prázdná nebo rozbitá. Působí to náhodně.

**Proč:** CDN `prod.spline.design` má občas latenci nebo zahazuje requesty. Žádné vestavěné opakování ani ošetření chyb tam není.

**Oprava — přidej fallback na timeout:**
```js
const TIMEOUT_MS = 8000;

const timeoutId = setTimeout(() => {
  // Spline se nestihl načíst — zobraz fallback
  document.getElementById('spline-fallback').style.display = 'block';
  document.querySelector('.spline-wrapper').style.display = 'none';
}, TIMEOUT_MS);

// Když používáš Runtime API, po úspěšném načtení timeout zruš:
spline.load(sceneUrl).then(() => {
  clearTimeout(timeoutId);
});
```

**Systémová oprava:** Stáhni si soubor `.splinecode` a hostuj si ho na vlastní CDN. Tím úplně odpadne závislost na třetí straně a vyřeší se i problémy s CORS.

---

### 4. Na Macu jede jako po másle, všude jinde to seká

**Co se děje:** Na MacBooku Pro nebo Macu s čipem M naprosto plynule. Na středně výkonných Windows noteboocích a Android telefonech úplně rozbité — seká, trhá se, občas shodí celou záložku.

**Proč:** Spline jede na WebGL, který běží na GPU. Macy s Apple Silicon mají výjimečný grafický výkon. Většina Windows notebooků a Android zařízení dedikovanou GPU nemá.

**Oprava — zjisti schopnosti zařízení dřív, než začneš načítat:**
```js
function shouldLoadSpline() {
  const isMobile = window.innerWidth < 768;
  const isLowEnd = navigator.hardwareConcurrency <= 2;

  // Volitelně: otestuj podporu WebGL
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  const noWebGL = !gl;

  return !isMobile && !isLowEnd && !noWebGL;
}

if (shouldLoadSpline()) {
  loadSplineScene();
} else {
  showFallback();
}
```

---

### 5. Poskakující layout — stránka nadskočí, když se scéna načte

**Co se děje:** Uživatel vidí rozvržení stránky a ve chvíli, kdy se načte 3D scéna, se všechno posune a nadskočí.

**Proč:** Canvas nemá před načtením rezervovanou výšku, takže prohlížeč neví, kolik místa má vyhradit. Vykreslí se HTML → místo se smrskne → načte se scéna → všechno poskočí. Tímhle si sestřelíš skóre CLS (Cumulative Layout Shift) v Core Web Vitals.

**Oprava — předalokuj místo:**
```css
spline-viewer, canvas.spline-canvas {
  display: block;
  width: 100%;
  height: 100vh; /* nebo jakákoliv výška, kterou chceš */
  contain: strict; /* řekne prohlížeči, ať tenhle prostor rezervuje */
}
```

U pozadí s `position: fixed` je to menší problém, ale u scén vložených do toku stránky je to zásadní.

---

### 6. Rotace se zadává v radiánech, ne ve stupních

**Co se děje:** Chceš objekt otočit o 90 stupňů. Sotva se hne, nebo se roztočí jako blázen.

**Proč:** Runtime API Splinu používá **radiány**, ne stupně. 90 stupňů = `Math.PI / 2`. 180 stupňů = `Math.PI`.

**Oprava:**
```js
// ŠPATNĚ
obj.rotation.y = 90;

// SPRÁVNĚ
obj.rotation.y = Math.PI / 2; // 90 stupňů
obj.rotation.y = Math.PI;     // 180 stupňů
obj.rotation.y = Math.PI * 2; // 360 stupňů (plná otáčka)

// Pomocná funkce, když radši počítáš ve stupních:
const toRad = (deg) => deg * (Math.PI / 180);
obj.rotation.y = toRad(90);
```

---

### 7. 3D scéna blokuje klikání na tlačítka a odkazy

**Co se děje:** Tlačítka, CTA nebo odkazy v navigaci, které se překrývají se Spline scénou, nereagují na kliknutí.

**Proč:** Canvas Splinu leží nahoře a pobírá všechny pointer eventy.

**Oprava:** Když je scéna jen dekorativní (nepotřebuje interakci), přidej wrapperu `pointer-events: none`:
```css
.spline-wrapper {
  pointer-events: none; /* scéna nepobere žádné kliknutí */
}
```

Když potřebuješ OBOJÍ — interakci myší se scénou i klikatelný obsah nad ní:
```css
.spline-wrapper {
  pointer-events: all; /* scéna dostává eventy myši */
}

.content-overlay {
  position: relative;
  z-index: 10;
  pointer-events: all; /* obsah dostává eventy myši taky */
}
```

Pozor: když mají obě vrstvy `pointer-events: all`, vyhrává ta nejvýš položená (podle z-indexu). Hlídej, aby měl div s obsahem vyšší z-index než wrapper Splinu.

---

### 8. Vidět vodoznak Splinu (free tarif)

**Co se děje:** V rohu se objeví malé logo „Built with Spline".

**Možnosti:**

**Varianta A — Přejdi na placený tarif Splinu.** Pak v Export → Play Settings zapni „Hide Spline Logo".

**Varianta B — Překrytí přes CSS (obchvat pro free tarif):**
```css
/* Schová vodoznak přes CSS — cílí do shadow DOM */
spline-viewer::part(logo) {
  display: none;
}

/* Fallback, když výše uvedené nefunguje */
spline-viewer {
  --spline-viewer-logo-display: none;
}
```

Pozor: skrývání přes CSS může s aktualizací Splinu přestat fungovat. Spolehlivé řešení je placený tarif.

---

### 9. Chyba CORS při načítání scény

**Co se děje:** Scéna se nenačte a v konzoli je chyba CORS.

**Proč:** Bezpečnostní politika prohlížeče v některých prostředích blokuje cross-origin requesty (typicky lokální dev servery s určitou konfigurací).

**Oprava — hostuj si soubor scény sám:**
1. Ve Splinu → Export → Code Export → klikni na ikonu stažení vedle URL
2. Stáhni soubor `.splinecode`
3. Nahraj ho na vlastní server nebo CDN (na stejný origin jako tvůj web)
4. Ve svém vkládacím kódu přepiš URL na tu svoji

---

### 10. Hydratační chyba v Next.js

**Co se děje:** Když je v Next.js zapojená Spline komponenta, hlásí React hydration mismatch.

**Proč:** Spline se vykresluje jen na klientovi (potřebuje WebGL z prohlížeče), ale Next.js ho zkouší vykreslit i na serveru.

**Oprava:**
```jsx
import dynamic from 'next/dynamic';

// ssr: false řekne Next.js, ať tohle na serveru nevykresluje
const Spline = dynamic(() => import('@splinetool/react-spline/next'), {
  ssr: false,
  loading: () => <div style={{ background: '#0a0a0a', height: '100vh' }} />
});
```

---

### 11. URL scény neukazuje poslední změny

**Co se děje:** Scénu jsi v editoru Splinu upravil, ale vložená scéna pořád ukazuje starou verzi.

**Proč:** URL `prod.spline.design` je snapshot. **Neaktualizuje se** sama, když něco změníš.

**Oprava:** Po každé úpravě v editoru Splinu musíš:
1. Jít na Export → Code Export
2. Kliknout na **„Promote to Production"** (nebo „Generate Draft" pro novou draft URL)
3. Stávající prod URL začne servírovat aktualizovanou scénu — URL v kódu měnit nemusíš

---

## Rychlá diagnostická tabulka

| Příznak | Nejpravděpodobnější příčina | Oprava |
|---|---|---|
| Stránkou nejde scrollovat | `overflow: hidden` vložený Splinem | Přidej `body { overflow: auto !important }` nebo vypni Page Scroll v Play Settings |
| Bílý obdélník za scénou | Neskryté pozadí | Play Settings → Hide Background → vygeneruj URL znovu |
| Někdy se načte, jindy prázdno | Vrtkavá CDN | Přidej fallback na timeout; zvaž vlastní hosting |
| Plynulé na Macu, jinde to seká | Propast ve výkonu GPU | Přidej detekci hardwaru, na slabých zařízeních přeskoč |
| Stránka při načtení poskočí | Nerezervované místo (CLS) | Nastav pevnou výšku na canvasu / prvku viewer |
| Rotace vypadají špatně | Stupně vs. radiány | Použij `Math.PI / 180 * stupně` |
| Tlačítka nejdou kliknout | Canvas pobírá pointer eventy | Přidej `pointer-events: none` wrapperu Splinu |
| Vidět vodoznak | Free tarif | Přejdi na placený tarif nebo přebij CSS |
| Chyba CORS | Cross-origin načítání | Hostuj si soubor `.splinecode` sám |
| Hydratační chyba (Next.js) | Konflikt se SSR | Použij `dynamic(() => import(...), { ssr: false })` |
| Pořád se ukazuje stará scéna | Nepromotoval jsi do produkce | Klikni na „Promote to Production" v editoru Splinu |
