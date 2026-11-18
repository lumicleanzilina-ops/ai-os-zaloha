# Co tvůj AI Chief of Staff umí

> Kompletní menu. Tohle je ten dokument ve stylu „řekni mi všechno, co to umí". Prolítni ho a pak se
> prostě ptej — nic z toho se nemusíš učit nazpaměť. Kdykoliv můžeš agenta poslat sem větou
> „co umíš?" a on si soubor přečte.

Tvůj Chief of Staff je jeden agent, který pokrývá plánování, obsah, byznys, vývoj, znalosti,
komunikaci i automatizaci. Něco je zabudované rovnou v jádru kitu (skilly). Další věci se odemknou,
když zapneš volitelný **modul** (`modules/*/`) nebo napojíš nástroj přes **MCP**. U každé položky je
napsané, co ji pohání.

**Legenda:** `[core]` funguje rovnou · `[skill]` dovednost (po zpřístupnění hostu ji Claude Code nabízí jako příkaz `/<jméno>` a agent ji spustí i podle názvu nebo popisu; host bez příkazů s lomítkem agent obslouží otevřením `SKILL.md`) · `[module]` potřebuje volitelný modul
· `[mcp]` potřebuje napojenou integraci.

> **Funguje v Claude Code, Codexu, Cursoru i Antigravity.** Ústava je jediný soubor `AGENTS.md`,
> který čtou všechny (Claude Code od verze 2.1.281 sám), takže ať otevřeš složku v čemkoliv, agent
> čte stejná pravidla. Jediné, co se nepřenáší, jsou hooky specifické pro Claude Code.

---

## 1. Plánování a exekuce

| Co | Jak |
|------|-----|
| Převede mlhavý cíl na plán krok za krokem dřív, než se začne pracovat | `/planning` `[skill]` |
| Protlačí rozhodnutí třemi nezávislými expertními pohledy s ohodnocením jistoty | `/second-opinion` `[skill]` |
| Vezme hotový výstup a vytáhne ho na světovou úroveň | `/topshit` `[skill]` |
| Rozloží velkou práci mezi soustředěné subagenty, aby hlavní vlákno zůstalo čisté | `[core]` (strategie subagentů) |
| Uloží každý plán s časovým razítkem, takže rozhodnutí jsou dohledatelná | `[core]` → `docs/plans/` |
| Nic nemění bez tvého pokynu; nápad s tebou promyslí, do úkolů ho zapíše až na požádání | `[core]` → pravidlo 8, [PRIORITIZACE](PRIORITIZACE.md) |
| Na konci odpovědi ukáže 🎯 Priority (teď / naplánovat / delegovat / škrtnout) a řekne, kdy na novou věc dojde | `[core]` → [PRIORITIZACE](PRIORITIZACE.md) |
| Drží jeden registr otevřených bodů s vlastníkem, termínem a stavem | `[core]` → [otevrene-body.md](otevrene-body.md) |
| Na startu session ví, co se posledních 48 h dělo v ostatních sessions a repech, a upozorní na překryv | `[core]` → hook `kontext-prace` (Claude Code po zapnutí pojistek) |
| Každá session si sama zapíše záznam (zadání, soubory, commity); `/end-session` ho jen doplní. S druhým mozkem leží rovnou v jeho `session-logs/`, bez kopie | `[core]` → hook `zaznam-session` (Claude Code; v Codexu `/end-session`) |
| Na konci odpovědi řekne, kdo co dokončuje (`JÁ:`, `ČEKÁME NA:`, `TY TEĎ:`, případně jméno spolupracovníka z profilu), jen s ověřeným stavem | `[core]` → [PRIORITIZACE](PRIORITIZACE.md#závěr-odpovědi-kdo-co-dokončuje) |

**Zeptej se ho:** *„Naplánuj launch mojí nové nabídky."* · *„Co má dneska přednost?"* · *„Dej mi druhý názor na tuhle architekturu."*
· *„Vytáhni tuhle nabídku na světovou úroveň."*

## 2. Obsah a kreativa

| Co | Jak |
|------|-----|
| Píše dlouhý obsah — články, blogposty, newslettery, scénáře | `[core]` |
| Navrhuje carousely na sítě v tvém brandu — varianty pro Instagram i LinkedIn, naučené z tvých ukázkových grafik | `/carousel` `[skill]` |
| Píše scénáře k videím (hooky, struktura, CTA) tvým hlasem | `[core]` |
| Staví prezentace a slide decky | `[core]` + prezentační MCP `[mcp]` |
| Generuje interaktivní HTML dashboardy a reporty | `[core]` |
| Vyrábí obrázky a vizuály (posty na sítě, profilovky, ilustrace) | modul `image-generation` `[module]` + obrázkové MCP `[mcp]` |
| Navrhuje mockupy, diagramy a UI koncepty | designové MCP (Figma / Canva) `[mcp]` |
| Drží všechno v tvém tónu, jakmile se naučí tvůj styl | `[core]` (paměť) |

**Zeptej se ho:** *„Napiš LinkedIn post o X."* · *„Udělej z toho carousel na Instagram."*
· *„Postav slide deck z tohohle briefu."*

## 3. Byznys

| Co | Jak |
|------|-----|
| Staví a audituje nabídky, packaging a value stacky | `[core]` |
| Navrhuje ceny, ROI modely a odhady | `[core]` |
| Píše nabídky a cenové dokumenty (s ROI, harmonogramem, riziky) | `[core]` |
| Mapuje funnely, e-mailové sekvence a lead magnety | `[core]` |
| Analyzuje pipeline a určí pořadí follow-upů | CRM MCP `[mcp]` |
| Hlídá platby, faktury a tržby | fakturační / platební MCP `[mcp]` |
| Připraví tě na schůzku z přepisů minulých hovorů a poznámek | MCP na zápisy z hovorů `[mcp]` |

**Zeptej se ho:** *„Audituj moji nabídku a řekni mi, proč nikdo nekupuje."* · *„Napiš nabídku pro tohohle klienta."*
· *„Co mi teď trčí v pipeline?"*

## 4. Vývoj a technika

| Co | Jak |
|------|-----|
| Ladí a opravuje kód samostatně — zreprodukuje, izoluje, opraví, ověří | `[core]` (ověř dřív, než to prohlásíš za hotové) |
| Staví věci od začátku do konce postupem „nejdřív plán" | `/planning` `[skill]` + `[core]` |
| Navrhuje UI/UX a front-end v moderních stacích | `[core]` (+ UI/UX skilly, pokud je doinstaluješ) |
| Staví vlastní MCP servery na napojení nových nástrojů | `[core]` (pattern mcp-builder) |
| Projde diff a najde chyby i zbytečnosti, než to pustíš ven | `[core]` |
| Nasadí a zkontroluje logy / runtime chyby | deployment MCP `[mcp]` |

**Zeptej se ho:** *„Tohle je rozbité, oprav to."* · *„Postav MCP server pro tohle API."*
· *„Projdi moje změny, než je pushnu."*

## 5. Znalosti (Second Brain)

Potřebuje modul **second-brain** (`modules/second-brain/`).

| Co | Jak |
|------|-----|
| Nasaje článek / PDF / přepis a zapracuje ho do živé wiki | `[module]` (Ingest) |
| Odpoví na otázku napříč vším, co jsi mu kdy nakrmil — s citacemi | `[module]` (Query) |
| Udržuje wiki zdravou — hlídá si rozpory, zastaralá tvrzení a osiřelé stránky | `[module]` (Lint) |
| Buduje doménovou znalost, která se nabaluje a přežívá napříč sessionami | `[module]` |
| Najde, co už víš: projde wiki, tvoje learningy a záznamy sessions (bez vaultu jen learningy a záznamy) | `/brain` `[skill]` + `tools/brain-hledej.mjs` |
| Když mluvíš o minulosti nebo jmenuješ stránku z wiki, sám připomene až 3 odkazy do paměti jako nález, ne pokyn | `[core]` → hook `brain-pripomen` (Claude Code po zapnutí pojistek; vypíná ho `AICOS_BRAIN=off`) |
| Každý večer promítne den do wiki: řádek do `log.md` a do stránky projektu, chybí-li stránka a projekt má README, založí ji; důvěrné projekty nechá stranou | `[module]` → scheduled task `daily-end-session` |
| Týdně opraví rozpory a zastaralá tvrzení ve wiki (s poznámkou „Opraveno“ a zdrojem) a nenechá stejný návrh opakovat potřetí | `[module]` → scheduled task `weekly-improvement` |

**Zeptej se ho:** *„Přidej tenhle článek do mýho brainu."* · *„Co víme o konkurentovi Y?"*
· *„Shrň všechno, co jsem se naučil o tomhle trhu."*

> Znalost o *světě* žije ve second brainu. *Tvoje preference* žijí v paměti agenta. Pravidla o tom,
> *jak se agent chová*, žijí v `docs/learnings/`. Drž to oddělené.

## 6. Komunikace

Potřebuje příslušné **MCP** integrace (viz `modules/mcp-integrations/`).

| Co | Jak |
|------|-----|
| Čte, hledá a píše e-maily; odpovídá do vláken | e-mailové MCP `[mcp]` |
| Spravuje kalendář — zkontroluje program, najde volné sloty, připraví tě na schůzky | kalendářové MCP `[mcp]` |
| Pracuje s tvým CRM — kontakty, pipeline, úkoly, follow-upy | CRM MCP `[mcp]` |
| Vytáhne přepisy schůzek a udělá z nich úkoly | MCP na zápisy z hovorů `[mcp]` |
| Prozkoumá web a shrne, co našel | browser / vyhledávací MCP `[mcp]` |

**Zeptej se ho:** *„Napiš odpověď na tenhle e-mail."* · *„Co mám zítra v kalendáři a na co se mám připravit?"*
· *„Shrň můj poslední hovor s tímhle klientem do dalších kroků."*

> Bezpečnost: základní pravidla vyžadují potvrzení před čímkoliv nevratným (odeslání, mazání, platba).
> Agent připraví návrh; odeslání schvaluješ ty.

## 7. Automatizace

Dodané úlohy jsou recepty. Agent ti k nim připraví instrukce a v Claude Desktopu tě provede založením úlohy v appce: záložka Code → Scheduled (v novějších verzích Routines) → New task, podrobně v [postupu pro ranní rutinu](../scheduled-tasks/README.md#ranní-rutina-v-claude-desktopu). Ověří časovou zónu, potřebné integrace a ruční i skutečný plánovaný běh (Run now). Samotný soubor ani slash příkaz nedokazuje registraci. Lokální úloha běží jen se spuštěnou aplikací a probuzeným počítačem; provoz po zavření notebooku vyžaduje cloudovou úlohu nebo jiné ověřené místo.

| Co | Jak |
|------|-----|
| Ranní briefing — kalendář, úkoly, e-maily, co dnes potřebuje akci | scheduled task `morning-briefing` `[core]` |
| Týdenní sebezlepšovací audit celého systému | scheduled task `weekly-improvement` `[core]` |
| Automatické uzavření dne (shrnutí + learningy + log), takže `/end-session` nemusíš spouštět sám | scheduled task `daily-end-session` `[core]` |
| Vybereš si z katalogu hotových automatizací (třídění inboxu, popostrčení stojících dealů, kontrola faktur, hlídání webu/konkurence, learn-daily…) | `[core]` → `scheduled-tasks/BLUEPRINTS.md` |
| Připraví opakovaný workflow a ověří jeho registraci a běh v dostupném scheduleru (v Claude Desktopu úlohu v appce zakládáš ty podle návodu a agent ji s tebou ověří přes Run now) | `[core]` → `scheduled-tasks/README.md`; podle podpory hostitele |
| Zachytí každou opravu jako pravidlo, takže se stejná chyba neopakuje | `[core]` → `docs/learnings/` |
| Zaloguje každou session, uloží paměti a čistě zavře krám | `/end-session` `[skill]` |
| Zachytí tvoji opravu jako pravidlo: nejdřív najde existující learning a doplní ho, nový založí jen když žádný není | `[core]` → hook `self-review` |
| Opakovaná čísla (ceny, počty, KPI) bere z uvedeného zdroje, ne z paměti; zdroje drží v `docs/GROUND-TRUTH.md` | `[core]` → [GROUND-TRUTH](GROUND-TRUTH.md) |

**Zeptej se ho:** *„Dej mi ranní brief."* · *„Spouštěj tohle každý všední den v 7 ráno."*
· *„Audituj sám sebe a navrhni zlepšení."* · *„Ukaž mi blueprinty automatizací."*

## 8. Bezpečnost a sebezlepšování

Zapojení **hooků** Claude Code (`.claude/settings.json` + `hooks/`) potřebuje ověření podle [SETUP](SETUP.md). Self-check a skutečný callback hostitele jsou dva různé důkazy; automatické chování neslibuj před oběma. Stejná ústava v jiném agentovi není důkaz stejných hooků. Technické nastavení a testy provede agent podle tvého rozhodnutí.

| Co | Jak |
|------|-----|
| Vyhodnotí rizikový shell příkaz; známé permanentní mazání odmítne a force-push předá k review | `hooks/deny-dangerous.mjs` `[core]`; účinek ověř podle host callbacku |
| **Zastaví známý credential pattern na cestě do gitu** — proskenuje celé změněné staged objekty a commit zablokuje | `hooks/secret-guard.mjs` `[core]`; zapnout a ověřit pre-commit |
| **Drží root workspace čistý** — odmítne nové volné soubory a nově vymyšlené složky nejvyšší úrovně | `hooks/guard-root-writes.mjs` `[core]` (Tvrdé pravidlo 6) |
| V ověřeném hostiteli vloží rejstřík learningů do kontextu při startu session | `hooks/learnings-index.mjs` `[core]` (Základní pravidlo 3) |
| **28 řemeslných pravidel připravených hned první den** — dodávka, ověřování, destruktivní operace, nástroje, co selhávají potichu | `docs/playbook/` `[core]` (jsou tvoje, klidně je uprav) |
| Zkontroluje jediný zdroj pravidel: neprázdnou ústavu `AGENTS.md` a kořenový `CLAUDE.md` jen s importem `@AGENTS.md`. Upozorní na další `CLAUDE.md`, `CLAUDE.local.md` či `.claude/CLAUDE.md` ve workspace, pod ním i nad ním. Ověří Node 24 a Git a zkontroluje zápis pojistek v konfiguraci. Skutečné spuštění pojistek a načtení pravidel ověř v hostu | `tools/doctor.mjs` `[core]` |
| Bezpečnostně proskenuje skill / MCP / repo na škodlivé vzory, než jim začneš věřit | `/scan` `[skill]` (NVIDIA SkillSpector) |
| Uloží checkpoint zahrnutých souborů před podporovanými editacemi a shell voláními; obnoví ověřený snapshot. Ignorované soubory nejsou pokryté | dovednost `checkpoint` `[skill]` (řekni slovy „vrať předchozí verzi souboru“; `/checkpoint` je v Claude Code vestavěný alias `/rewind`, skill ho nepřebije, proto se hostu nezpřístupňuje) + `hooks/checkpoint.mjs`; potřebuje git |
| Po výslovném zapnutí commitne a pushne verzované soubory do tvého soukromého repa; workspace a vault ověř zvlášť. Ignorovaná data a credentials potřebují vlastní plán | `hooks/backup-on-stop.mjs` `[core]` + modul `github-backup` |
| Po dokončení instalace kitu (KIT COMPLETE) každý nastavený N-tý tah vyzve agenta k zachycení oprav a opakovaných postupů; během nastavování mlčí | `hooks/self-review.mjs` `[core]`; neukládá pravidla sám |
| Vyřadí mrtvé automaticky vygenerované skilly, označí duplikáty, drží sadu skillů štíhlou | `skills/CURATOR.md` `[core]` + `skills/.usage.json` |
| **Uklidí workspace každý večer** — zatoulané soubory do `outputs/`, pomocné do `work/`, nic nemaže | scheduled task `workspace-tidy` `[core]` |

**Zeptej se ho:** *„Vrať tu poslední změnu."* · *„Co jsi v tomhle souboru změnil?"*
· *„Proč jsi to prostě nesmazal?"* (protože Pravidlo 0 a deny hook to nedovolí).

> Hooky mají Node self-checks. Chybějící runtime, start hooku a host timeout mohou ochranu omezit; přiznej neověřený stav a postupuj podle [SETUP](SETUP.md). Konfiguraci měň řízeným merge po přečtení současných nastavení.

---

## Jak se schopnosti rozrůstají

1. **Jádro** přichází s kitem — plánování, obsah, byznys, vývoj, automatizace, sebezlepšování.
2. **Moduly** přidávají celé oblasti schopností. Viz README každého z nich:
   - `modules/workspace-structure/README.md` — složková struktura na míru tobě
   - `modules/mcp-integrations/README.md` — napoj e-mail, kalendář, CRM a další
   - `modules/second-brain/README.md` — nabalující se znalostní báze (Tolaria / Obsidian / Notion)
   - `modules/github-backup/README.md` — noční záloha workspace i vaultu do privátního GitHub repa
   - `modules/image-generation/README.md` — generování obrázků, dvěma cestami: rychle přes MCP, nebo kontrolovaně přes API
   - `modules/ai-firma/README.md` — AI firma: fronta práce pro Hermese, kterou schvaluješ, a kokpit, který jen ukazuje stav (Telegram a Hermes na serveru se doplní později)
3. **MCP integrace** napojí tvoje konkrétní nástroje — čím víc jich připojíš, tím víc toho agent umí.
4. **Tvoje vlastní skilly** — hoď `SKILL.md` do `skills/<jméno>/` a agent ho použije, když napíšeš `/<jméno>` nebo o něj řekneš slovy.

Systém se navíc zlepšuje sám: každá oprava se stane pravidlem a týdenní audit drží celek ostrý.
Jak sebezlepšování funguje, najdeš v README.
