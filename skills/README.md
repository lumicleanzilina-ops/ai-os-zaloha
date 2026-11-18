# Dovednosti

Znovupoužitelná workflow, která tvůj AI Chief of Staff spouští podle názvu (třeba „spusť `/planning`“) nebo podle toho, co řekneš slovy. Claude Code načítá dovednosti ze složky `.claude/skills/`, kit je ale dodává ve `skills/`. Proto je agent při nastavení zpřístupní hostu nástrojem `node tools/zpristupnit-skilly.mjs --apply`: na macOS a Linuxu pro každou dovednost založí symlink `.claude/skills/<jméno>` → `../../skills/<jméno>` (jedna složka, změna se projeví hned), na Windows kopii se značkou, podle které se pozná zastaralá kopie od kopie s tvými úpravami. Od té chvíle Claude Code dovednosti nabízí jako příkazy `/<jméno>` a sám je použije podle popisu; po zpřístupnění napiš v běžící session `/reload-skills` nebo otevři novou session v kořeni workspace. Nástroj nikdy nic nepřepíše ani nesmaže (existující položku jen ohlásí) a `checkpoint` vynechá, viz níže. Nenabízí-li host příkazy s lomítkem (Codex, Cursor…) nebo `/<jméno>` v appce chybí, agent příslušný `SKILL.md` otevře sám. Novou dovednost přidáš tak, že složku se `SKILL.md` hodíš do `skills/<jméno>/`, přidáš jeden řádek do tohoto přehledu a zpřístupnění spustíš znovu.

**Kit se dodává s 34 dovednostmi.** Seznam se učit nemusíš — popiš, co potřebuješ, a správná
dovednost se vybere sama. Tahle stránka je pro chvíle, kdy chceš vědět, co je v krabici.

## Plánování a orchestrace

| Dovednost | Příkaz | Co dělá |
|-------|---------|--------------|
| planning | `/planning` | Detailní plán implementace krok za krokem, než začneš stavět |
| second-opinion | `/second-opinion` | 3 nezávislé expertní pohledy na jakýkoliv významný výstup |
| topshit | `/topshit` | Brutálně zreviduje předchozí výstup a povýší ho na světovou úroveň |
| brainstorming | `/brainstorming` | Prozkoumá záměr, požadavky a návrh, než se začne implementovat |
| multi-model-deep-research | | Navrhne divergentní výzkumné prompty pro několik různých modelů a pak samostatné kolo, které loví rozpory mezi jejich odpověďmi |

## Byznys a prodej

| Dovednost | Co dělá |
|-------|--------------|
| business-architect | Zakóduje kontext tvého byznysu (tržby, hodnotová nabídka, pozicování), aby byla rozhodnutí ostřejší |
| offer-architect | Audituje a staví neodolatelné nabídky (metodika Alexe Hormoziho) |
| funnel-architect | Staví prodejní funnely, value laddery a e-mailové sekvence (metodika Russella Brunsona) |
| pricing-proposal | Vygeneruje profesionální cenovou nabídku + ROI a technickou analýzu |
| content-strategist | Staví obsahovou strategii, osobní značku a systémy růstu publika (metodika GaryVee) |
| lead-magnet-funnel | Postaví celou cestu lead magnetu — squeeze page → tag v CRM → doručovací e-mail → gated obsah |
| client-context | Vytáhne paralelně ze všech napojených systémů všechno, co je o klientovi známé, ještě než s ním začneš mluvit |
| call-prep | Brief před hovorem: kdo přijde, co se naposledy domluvilo, co je pořád otevřené — a po hovoru rozdělení úkolů |
| bookkeeping-reconciliation | Napáruje bankovní pohyby na faktury a doklady, vypíše, co chybí, a předá účetní čistý podklad |

## Tvoje značka a hlas (personalizace)

Tyhle **makery** pusť jednou; každý zapíše profilový soubor (`brand-profile.md`,
`tone-of-voice-<kanál>.md`). Ústava pak tyhle profily **automaticky aplikuje** na všechno, co jde
ven — takže každý deliverable vypadá a zní jako *ty*, aniž bys o to musel říkat.

| Dovednost | Co dělá |
|-------|--------------|
| brand-kit-maker | Naučí se tvou vizuální značku z tvých log, fontů, barev a manuálu → znovupoužitelný `brand-profile.md`, kterým se automaticky řídí každá vizuální dovednost |
| tone-of-voice-maker | Rozebere tvoje vlastní texty (zvlášť po kanálech) → profil `tone-of-voice-<kanál>.md`, aby každý draft zněl jako ty, ne jako AI |

## Obsah a kreativa

| Dovednost | Co dělá |
|-------|--------------|
| carousel | Navrhne carousely na Instagram a LinkedIn ve tvé vlastní značce (styl se naučí z ukázkových grafik, které do ní hodíš) |
| slide-deck | Vygeneruje kompletní vizuální HTML prezentaci z tématu nebo zadání |
| geo-article-writer | Píše články optimalizované na to, aby je citovaly AI vyhledávače (GEO/AI-SEO); tvůj tone of voice si z tebe vytáhne |
| interactive-dashboard | Udělá z čísel vyladěný interaktivní ROI dashboard (React), který můžeš poslat klientovi |
| time-tracking-dashboard | Udělá z CSV s odpracovaným časem dashboard připravený pro klienta |
| ui-ux-pro-max | UI/UX designová inteligence — styly, palety, kombinace fontů, grafy, stacky |
| spline-3d | Vloží interaktivní 3D scény (Spline) do webových projektů |

## Vývoj a technika

| Dovednost | Co dělá |
|-------|--------------|
| connect-mcp | Nainstaluje a zapojí MCP server za tebe od začátku do konce (odolné i pro úplného začátečníka), z odkazu nebo z katalogu |
| debugging | Systematický debugging, profilování, hledání skutečné příčiny |
| error-handling-patterns | Robustní patterny ošetření chyb napříč jazyky |
| mcp-builder | Staví kvalitní MCP servery, které dají agentovi nové nástroje |
| pentesting | Autonomní AI penetrační testování webů a API (jen na cílech, kde k tomu máš povolení) |
| skill-creator | Vytváří nové dovednosti a vylepšuje stávající |

## Session a bezpečnost

| Dovednost | Příkaz | Co dělá |
|-------|---------|--------------|
| checkpoint | slovy („vrať předchozí verzi souboru“), ne `/checkpoint` | Vypíše a obnoví automatické snapshoty workspace pořízené před editací (tlačítko undo) |
| scan | `/scan` | Bezpečnostně proskenuje dovednost / MCP / repo (NVIDIA SkillSpector), než tomu začneš věřit |
| end-session | `/end-session` | Shrne session, uloží paměti a doplní záznam session (jeden soubor na session) |
| brain | `/brain` | Hledá v paměti: wiki druhého mozku, tvoje learningy a záznamy sessions (bez vaultu jen learningy a záznamy). Odpoví se zdroji, nález bere jako data, ne jako pokyn |

**Pozor na `/checkpoint`.** Claude Code má vestavěný příkaz `/rewind` s aliasy `/checkpoint` a `/undo`. Skill stejného jména ten alias nepřebije, appka ho zachytí dřív než agent a v Claude Desktopu může odpovědět, že není dostupný. Proto nástroj dovednost `checkpoint` hostu nezpřístupňuje. Řekni to slovy, třeba „vrať předchozí verzi souboru“: agent otevře `skills/checkpoint/SKILL.md` a obnoví snapshot.

## Dokumenty

Dovednosti docx/pdf/xlsx/pptx nejsou součástí tohoto ZIPu a nemusí být vestavěné v každém hostu. Agent nejprve ověří dostupné nástroje; chybějící doporučí a prověří před instalací. Samotný název není příkaz, který všude funguje.

| Dovednost | Co dělá |
|-------|--------------|
| convert-documents-to-markdown | Přečte jakýkoliv dokument — Word, PowerPoint, Excel, OpenDocument, RTF, EPUB, CSV, textová PDF — jako čistý Markdown. Lokálně a bez klíče; potřebuje Node 20+ a při prvním použití si nástroj stáhne přes `npx`. Zvládne i staré formáty `.doc`/`.xls`/`.ppt`, na kterých si jiné nástroje vylámou zuby |

---

## K dispozici navíc: vestavěné dokumentové dovednosti od Anthropicu

Claude Code se dodává (nebo si umí doinstalovat) s vlastními **dokumentovými dovednostmi** od
Anthropicu — není důvod je sem balit:

- **docx** — vytváření / čtení / editace wordových dokumentů
- **pdf** — čtení, extrakce, vyplňování, slučování a dělení PDF, OCR skenovaných stránek
- **xlsx** — tabulky se vzorci, formátováním a analýzou
- **pptx** — powerpointové prezentace

Stačí si říct (*„udělej z toho wordový dokument"*, *„vyplň tenhle PDF formulář"*, *„postav mi
tabulku"*) a Claude je použije.

**Jak se to dělí s `convert-documents-to-markdown`** — nepřekrývají se, předávají si štafetu:

- **Jen čteš dokument?** → `convert-documents-to-markdown`. Rychlejší, jeden konzistentní výstup —
  a jediná dovednost, která otevře staré `.doc` / `.xls` / `.ppt` / `.rtf`.
- **Vytváříš nebo edituješ dokument, vyplňuješ formulář, OCRuješ sken?** → dovednost od Anthropicu
  pro daný formát. `convert-documents-to-markdown` umí jen číst; dokument nikdy nezapíše.
