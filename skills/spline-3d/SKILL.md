---
name: spline-3d
description: Vkládá interaktivní 3D scény ze Spline.design do webových projektů. Použij, když se na web nebo do aplikace přidává 3D scéna ze Splinu. Pokrývá vkládání v Reactu, Next.js, Vue i čistém JS, runtime API @splinetool pro programové ovládání (události, proměnné, animace, kamera), optimalizaci výkonu a mobilu a typické problémy jako zablokovaný scroll, poskakující layout, fallbacky bez GPU a odstranění vodoznaku.
---

# Spline 3D — integrace

Průvodce vkládáním interaktivních 3D scén ze [Spline.design](https://spline.design) do webových projektů.

## Závislosti a soukromí

Před instalací zvol a prověř konkrétní vydání oficiálního balíčku Spline, připni přesnou verzi
a ulož lockfile. Nepřidávej do produkce vzdálený spustitelný skript s pohyblivou verzí.
Vanilla ukázky očekávají lokální bundle z prověřených závislostí (viz příslušný návod), který
musíš nejdřív vytvořit; součástí kitu binární knihovna není. URL scény připojí prohlížeč
k hostiteli této scény, takže soukromou scénu nezveřejňuj bez souhlasu uživatele.

---

## Rychlá orientace

| Úkol | Průvodce |
|---|---|
| Vložení do čistého HTML/JS | [guides/VANILLA_INTEGRATION.md](guides/VANILLA_INTEGRATION.md) |
| Vložení do React / Next.js / Vue | [guides/REACT_INTEGRATION.md](guides/REACT_INTEGRATION.md) |
| Výkon a optimalizace na mobilu | [guides/PERFORMANCE.md](guides/PERFORMANCE.md) |
| Ladění a typické problémy | [guides/COMMON_PROBLEMS.md](guides/COMMON_PROBLEMS.md) |

## Funkční ukázky

| Soubor | Co ukazuje |
|---|---|
| [examples/vanilla-embed.html](examples/vanilla-embed.html) | Minimální vložení v čistém JS s pozadím a fallbackem |
| [examples/react-spline-wrapper.tsx](examples/react-spline-wrapper.tsx) | Produkčně použitelný React wrapper s lazy loadingem a fallbackem |
| [examples/interactive-scene.tsx](examples/interactive-scene.tsx) | Kompletní interaktivní ukázka: události, ovládání objektů, kamera |

---

## Co je Spline?

Spline je 3D designový nástroj běžící v prohlížeči — něco jako Figma, ale pro 3D. Designéři v editoru Splinu vytvoří interaktivní 3D scény (objekty, materiály, animace, fyzika, události) a pak je vyexportují pro web jako hostovanou URL k souboru `.splinecode`.

---

## Krok 1 — Zjisti stack

Než napíšeš jediný řádek kódu, projdi existující soubory projektu a zjisti framework.

| Stack | Způsob |
|---|---|
| Čisté HTML/JS | Web komponenta `<spline-viewer>` NEBO `@splinetool/runtime` |
| React / Vite | `@splinetool/react-spline` |
| Next.js | `@splinetool/react-spline/next` |
| Vue | `@splinetool/vue-spline` |
| iframe (Webflow, Notion apod.) | iframe s veřejnou URL |

---

## Krok 2 — Získej URL scény

Uživatel musí ve svém Spline editoru jít na **Export** → **Code Export** → zkopírovat URL z `prod.spline.design`:

```
https://prod.spline.design/XXXXXXXXXXXXXXXX/scene.splinecode
```

**Než URL zkopíruje, řekni mu, ať zkontroluje Play Settings:**

- Zapnout **Hide Background**, pokud má web tmavé nebo vlastní pozadí
- Zapnout **Hide Spline Logo**, pokud má placený tarif
- Nastavit **Geometry Quality** na Performance kvůli rychlejšímu načtení
- Vypnout **Page Scroll**, **Zoom** a **Pan**, pokud nejsou potřeba (sníží riziko zablokovaného scrollu)
- Po každé změně nastavení kliknout na **Generate Draft** nebo **Promote to Production** — URL se NEAKTUALIZUJE sama

---

## Krok 3 — Přečti si příslušného průvodce

Až budeš mít stack a URL scény, přečti si odpovídajícího průvodce výše a řiď se jím. Před dokončením integrace si vždycky projdi `guides/COMMON_PROBLEMS.md` — jsou tam zásadní zrádnosti, které jinak vyplavou až v produkci.

> Původ: sickn33/agentic-awesome-skills, dovednost spline-3d-integration (MIT, Copyright (c) 2026 Antigravity User, přispěvatel ziuus); texty přeloženy, examples/ beze změny. Licence a změny: THIRD-PARTY-NOTICES.md v kořeni kitu.
