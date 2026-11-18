# Převzatá díla a jejich licence (THIRD-PARTY NOTICES)

AI OS Kit je vlastní dílo poskytovatele uvedeného v [LICENSE.md](LICENSE.md) a šíří se pod tamní osobní licencí. Část dovedností a pomocných souborů
ale vychází z veřejně dostupných děl pod otevřenými licencemi. Tenhle soubor říká, co odkud je, pod jakou licencí a co se
na tom změnilo. Práva, která ti tyto otevřené licence dávají k původním dílům, osobní licence kitu neomezuje.

Původ byl určen z obsahu souborů a z historie repozitáře kitu (porovnání s původními repozitáři na pevných commitech,
18. 10. 2026). Kde se původ potvrdit nepodařilo, je to napsané; nic se nedomýšlí.

## Přehled

| Dovednost / soubor | Původ | Licence | Co se změnilo |
|---|---|---|---|
| `skills/mcp-builder/` | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/mcp-builder), Anthropic, PBC | Apache 2.0 ([LICENSE.txt](skills/mcp-builder/LICENSE.txt), [NOTICE](skills/mcp-builder/NOTICE)) | `SKILL.md` a `reference/*.md` přeloženy; doplněna bezpečnostní omezení instalace a evaluace, HTTP ukázky omezeny na loopback a upravena předloha package.json; připnuté přímé závislosti v `scripts/requirements.txt` a přidaný `scripts/README.md`; `scripts/*.py` a `scripts/example_evaluation.xml` beze změny |
| `skills/ui-ux-pro-max/` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | MIT, Copyright (c) 2024 Next Level Builder | `SKILL.md` zkrácen, přeložen a doplněn o bezpečný rozsah práce; CLI příklady v CSV `astro`, `shadcn`, `vue` změněny na předem prověřené lokální nástroje; ostatní CSV a 3 skripty v `scripts/` beze změny (dva CSV vycházejí z pravidel Vercel Labs, MIT) |
| `skills/debugging/` | [wshobson/agents](https://github.com/wshobson/agents) (`debugging-strategies`) | MIT, Copyright (c) 2024 Seth Hobson | Přejmenováno, přeloženo do češtiny; ukázky kódu beze změny |
| `skills/error-handling-patterns/` | [wshobson/agents](https://github.com/wshobson/agents) (`error-handling-patterns`) | MIT, Copyright (c) 2024 Seth Hobson | Zkráceno na asi pětinu, přidána sekce Workflow, přeloženo |
| `skills/planning/` | [obra/superpowers](https://github.com/obra/superpowers) (`writing-plans`, `plan-document-reviewer-prompt.md`) | MIT, Copyright (c) 2025 Jesse Vincent | Přejmenováno, přeloženo, cesty plánů `docs/plans/`, odkazy na `superpowers:` nahrazeny nástrojem Agent |
| `skills/brainstorming/` | [obra/superpowers](https://github.com/obra/superpowers) (`brainstorming`); stejný název, popis a principy, text přepsán | MIT, Copyright (c) 2025 Jesse Vincent | Zkráceno na checklist, přeloženo |
| `skills/convert-documents-to-markdown/` | [firecrawl/anydoc](https://github.com/firecrawl/anydoc) (stejnojmenná dovednost) | MIT, Copyright (c) 2026 Sideguide Technologies Inc. | Přepsáno a rozšířeno (připnutá verze `@0.1.6`, limity, rozhodovací tabulka), přeloženo; samotný nástroj `anydoc` se stahuje až při použití |
| `skills/spline-3d/` | [sickn33/agentic-awesome-skills](https://github.com/sickn33/agentic-awesome-skills) (`spline-3d-integration`, přispěvatel `ziuus`, označeno `source: community`) | MIT na úrovni repozitáře, Copyright (c) 2026 Antigravity User; původní autor dovednosti dál není znám | `SKILL.md` a `guides/*.md` přeloženy; doplněno prověření a připnutí závislostí; vanilla návod a `examples/vanilla-embed.html` používají vlastní lokální bundle místo pohyblivé CDN verze; ostatní příklady beze změny |
| `skills/interactive-dashboard/` (6 SVG ikon v ukázkách) | [Heroicons v1](https://github.com/tailwindlabs/heroicons), Tailwind Labs | MIT, Copyright (c) 2020 Refactoring UI Inc. | Jen cesty ikon vložené do ukázkového kódu; zbytek dovednosti je vlastní |
| `tools/time-tracking-extension/popup.js` | Ověřený původní projekt rozšíření; sestavený soubor má totožný SHA-256 | MIT, ISC a BSD-3-Clause dle [přesného soupisu a plných licencí](tools/time-tracking-extension/THIRD-PARTY-LICENSES.md) | Vlastní kód rozšíření plus sestavené knihovny; soupis produkčních závislostí React/Recharts z původního lockfile |

U ostatních dovedností se v dosavadní kontrole nepodařilo doložit převzatý zdroj. To samo není důkaz původního autorství; při dalším převzetí nebo úpravě je nutné původ znovu ověřit.

## Jména metodik a osob

Dovednosti `offer-architect`, `funnel-architect` a `content-strategist` pracují s veřejně popsanými metodikami Alexe Hormoziho,
Russella Brunsona a Garyho Vaynerchuka a používají jejich pojmy (Value Equation, Hook-Story-Offer, Perfect Webinar a podobně)
jen k označení těchto metodik. Text dovedností je vlastní. `geo-article-writer` odkazuje na veřejně publikované názory
jmenovaných odborníků na GEO. Žádná z těchto osob a firem kit nevytvořila, neschválila ani s ním není spojena; názvy
mohou být ochrannými známkami svých vlastníků.

## Nástroje, které kit nebalí, jen na ně odkazuje

- `/scan` používá [NVIDIA SkillSpector](https://github.com/NVIDIA/SkillSpector) (Apache 2.0, Copyright 2026 NVIDIA CORPORATION & AFFILIATES); instaluje se až při použití z oficiálního repozitáře.
- `convert-documents-to-markdown` spouští `@firecrawl/anydoc` přes `npx` (MIT).
- `interactive-dashboard` používá vlastní CSS přechod; dřívější externí textura s nedoloženou licencí byla odstraněna.
- `pentesting` popisuje obecný postup a volání nástroje přes zástupný `<tool>`; žádný konkrétní nástroj nebalí.
- `skills/CURATOR.md` (kurátor dovedností) je vlastní text; koncept využití a archivu dovedností je inspirovaný projektem [Hermes Agent](https://github.com/NousResearch/hermes-agent) (MIT, Copyright (c) 2025 Nous Research).
- Dovednosti Anthropic pro dokumenty (docx, pdf, pptx, xlsx) kit nebalí; viz `skills/README.md`.

## Texty licencí

### Apache License, Version 2.0

Platí pro `skills/mcp-builder/` (Anthropic, PBC). Plné znění je v [skills/mcp-builder/LICENSE.txt](skills/mcp-builder/LICENSE.txt),
změny proti původnímu dílu v [skills/mcp-builder/NOTICE](skills/mcp-builder/NOTICE). Požadavek licence na zachování
těchto souborů platí i pro tvoji pracovní kopii kitu.

### MIT License

Platí pro díla uvedená výše s licencí MIT. Držitelé práv:

- Copyright (c) 2024 Next Level Builder (ui-ux-pro-max)
- Copyright (c) 2025 Vercel Labs (pravidla `react-performance.csv` a `web-interface.csv` v ui-ux-pro-max)
- Copyright (c) 2024 Seth Hobson (debugging, error-handling-patterns)
- Copyright (c) 2025 Jesse Vincent (planning, brainstorming)
- Copyright (c) 2026 Sideguide Technologies Inc. (convert-documents-to-markdown, anydoc)
- Copyright (c) 2026 Antigravity User (spline-3d)
- Copyright (c) 2020 Refactoring UI Inc. (Heroicons)
- Copyright (c) Meta Platforms, Inc. and affiliates (React v `tools/time-tracking-extension/popup.js`)

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Stav

Seznam odpovídá obsahu AI OS Kit 4.4. Když do kitu přidáš cizí dovednost, zapiš ji sem (původ, licence, změny) a nech
u ní původní licenční soubor; postup je v `docs/playbook/read-the-license-before-you-reuse-code.md`.
