# Modul: Druhý mozek

> Znalostní báze, která nabaluje hodnotu — tvůj AI Chief of Staff ji čte, píše a udržuje v pořádku, takže se znalosti hromadí místo toho, aby se ztrácely v historii chatu.

## Proč druhý mozek?

Většina AI workflow je bez paměti: každá otázka objevuje znalosti znovu od nuly. Druhý mozek to řeší. Ty vybíráš zdroje a ptáš se; AI to, co přečte, **jednou** zkompiluje do strukturované a propojené znalostní báze a dál ji drží aktuální. Články, které jsi přečetl, průzkum konkurence, kontext klientů, frameworky — ze všeho se stanou trvalé, prohledatelné a provázané stránky.

Vychází to ze vzoru **„LLM Wiki"** (Andrej Karpathy): surové zdroje → wiki spravovaná AI → soubor se schématem, který AI říká pravidla hry. Wiki nikdy nepíšeš ty — píše ji AI. Ty ji řídíš.

---

## Vyber si, kde tvůj mozek bude žít

Dvě podoby: **lokálně** (markdown soubory u tebe v počítači, všechno vlastníš ty) nebo **v cloudu** (žije v SaaS, který už používáš). Vyber si jednu — tvůj Claude nastaví tu, kterou zvolíš.

### 🥇 Možnost 1 — Tolaria (lokálně, doporučeno)

Bezplatná open-source **markdown aplikace postavená přímo pro AI agenty**, kde jsou na prvním místě soubory. Představ si „lepší Obsidian, dělaný pro AI od prvního dne".

- **Vlastní MCP server** — Claude se napojí a čte i zapisuje přímo do tvého vaultu. Žádný plugin, žádné lepení dohromady.
- Nejdřív soubory, hned potom git: poznámky jsou obyčejný markdown s YAML frontmatterem. Nulový lock-in.
- Obsahuje konvenční soubor `AGENTS.md`, takže tvůj vault pochopí každý kódicí agent bez dalšího nastavování.

**Nejlepší, když:** chceš nejčistší lokální AI-native prostředí s nejmenším nastavováním.
→ [tolaria.md](https://tolaria.md)

### 🥈 Možnost 2 — Obsidian (lokálně)

Nejpopulárnější lokální markdown aplikace — obrovská komunita, ekosystém pluginů, hodně hype.

- **Háček:** Obsidian není dělaný pro AI. Aby v něm tvoje AI mohla číst a psát, nainstaluješ **MCP/AI plugin** (nebo Claudovi ukážeš rovnou na složku s vaultem na disku). Trochu víc lepení než u Tolarie.
- Všechno ostatní (markdown, wikilinky, graf, git) funguje skvěle.

**Nejlepší, když:** už v Obsidianu žiješ a nechceš přecházet jinam.
→ [obsidian.md](https://obsidian.md)

### ☁️ Možnost 3 — Notion (cloud, nejlepší cloudová volba)

Pokud chceš mít mozek radši v cloudu, Notion je nejsilnější volba.

- **Napoj Notion přes MCP** — to je celé nastavení. Claude s Notion MCP funguje **výborně**: zakládá stránky, databáze, relace, dotazuje se, udržuje pořádek.
- Od té chvíle ti **Notion spravuje Claude.** Tvůj mozek jsou prostě databáze v Notionu (Sources / Topics / People / Projects), které AI čte a udržuje.
- Žádný lokální vault, žádná git hygiena — o úložiště a synchronizaci mezi zařízeními se stará Notion.

**Nejlepší, když:** už si v Notionu řídíš život, nebo chceš cloudovou synchronizaci bez starostí o soubory.
→ Jak napojit Notion MCP najdeš v `../mcp-integrations/README.md`.

---

### Poznámka k NotebookLM

**Nepoužívej NotebookLM jako druhý mozek.** Jeho MCP (a NotebookLM Studio) použij na **deep research** — tedy shromáždit hodně zdrojů k jednomu tématu a pochopit ho do hloubky. Je to nástroj na výzkum, ne znalostní báze, která nabaluje hodnotu. Drž ho stranou od svého mozku.

---

## Jak to funguje (lokálně: Tolaria / Obsidian)

Tři vrstvy:

1. **Surové zdroje** — složka s neměnnými zdrojovými dokumenty (články, PDF, přepisy). AI je čte, nikdy needituje.
2. **Wiki** — markdown stránky generované AI (shrnutí, entity, koncepty). Tuhle vrstvu vlastní AI.
3. **Schéma** — soubor `AGENTS.md` (šablona je v téhle složce), který AI říká typy, konvence a postupy.

**Typy entit** (viz `AGENTS.template.md`): `Source`, `Topic`, `Tool`, `Person`, `Project`. Vztahy žijí ve frontmatteru jako wikilinky (`related_to`, `belongs_to`).

### Tři operace

- **Ingest** — hodíš tam zdroj (nebo vložíš odkaz); AI ho přečte, napíše shrnutí typu `Source`, zapojí ho do stránek `Topic`/`Person`/atd. a aktualizuje index i log. Jeden zdroj se dotkne 10–15 stránek. A přesně o to jde.
- **Query** — zeptáš se; AI přečte index, zavrtá se do relevantních stránek a odpoví **s citacemi**. Dobré odpovědi se zakládají zpátky jako nové stránky, takže hledání nabaluje hodnotu.
- **Lint** — pravidelná kontrola zdraví: protiřečení, zastaralá tvrzení, osiřelé stránky, chybějící křížové odkazy, díry k doplnění.

### Session logy, hledání a noční zápis

S nastaveným vaultem tři věci pracují za tebe, bez dalšího nastavování:

- **Záznam session rovnou do vaultu.** Hook `zaznam-session` zapisuje záznam každé session do `session-logs/` vaultu (jeden soubor na session, bez kopie, s polem `type: SessionLog`). `/end-session` a uzavření dne doplňují ten jediný soubor. Bez vaultu leží záznamy v `docs/session-logs/`.
- **Hledání a připomínač.** Dovednost `brain` (`/brain`) a příkaz `node tools/brain-hledej.mjs "<dotaz>"` prohledají wiki vaultu, learningy a záznamy sessions. Hook `brain-pripomen` sám připomene až 3 odkazy, když mluvíš o minulosti nebo jmenuješ stránku z wiki (typ `Tool`, `Project`, `Person`, `Topic`). Podrobnosti jsou v [hooks/README](../../hooks/README.md).
- **Noční zápis do wiki.** Rutina `daily-end-session` připíše do `log.md` řádek o dni a do sekce `## Stav` stránky projektu (`type: Project`) datovaný řádek s odkazem na záznam. Chybí-li stránka a projekt má `README.md`, založí ji z README bez nových faktů. Projekty, které uvedeš v `docs/profil/user-preferences.md` v sekci „Důvěrné projekty“, nepovyšuje. Týdenní `weekly-improvement` opravuje rozpory a zastaralá tvrzení (s poznámkou `> Opraveno …` a zdrojem) a vyřizuje `.needs-lint` z `brain-sync.py`.

Vault leží obvykle mimo workspace. Aby agent mohl jeho soubory číst a upravovat bez potvrzování každého souboru a noční běh bez dozoru nečekal na klik, přidej při zakládání mozku jeho absolutní cestu do `permissions.additionalDirectories` v `.claude/settings.json` (zapíše to agent po tvém souhlasu; aktivace pojistek ostatní klíče zachová). Hook `zaznam-session`, `brain-sync.py` a záloha vault čtou a zapisují sami a to nepotřebují.

### Jak to udržet zdravé

`brain-sync.py` (v téhle složce) je hygienický hook, který nepotřebuje žádné závislosti. **Spouští ho agent** po každé session (nebo si ho navěsí na git hook): najde rozbité wikilinky, osiřelé stránky a rozjetý index a pak vault commitne. Je idempotentní — když se nic nezměnilo, mlčí. Cestu k vaultu si bere z proměnné `SECOND_BRAIN_VAULT` a nastaví si ji agent při zakládání mozku: zapíše ji (absolutní cestou) do `env` v `.claude/settings.json`, aby ji viděly i hooky; aktivace pojistek ostatní klíče zachová. Stejnou proměnnou čte záloha, záznam session i připomínač paměti.

Hlídač tajemství zapoj i pro vault, když je to git repo. Nejdřív ověř efektivní `core.hooksPath` včetně původu a existující `.git/hooks/pre-commit`, vytvoř obnovitelnou zálohu. Vlastní hooky nepřepisuj: kitový guard připoj do zachovaného řetězce podle [SETUP](../../docs/SETUP.md), bez rekurze a s respektováním návratových kódů. Jen pokud žádné vlastní hooky nejsou, nastav `git -C "<vault>" config core.hooksPath "<absolutní-workspace>/hooks/git-hooks"`. Ověř původní kontrolu i nový guard neškodnými fixtures; syntetické tajemství se nesmí dostat do commitu.

## Jak to funguje (cloud: Notion)

Stejná myšlenka LLM Wiki, jen místo markdownových složek jsou databáze v Notionu:

- Jedna databáze na typ (Sources, Topics, People, Projects) — nebo jedna databáze s vlastností `type`.
- **Ingest / Query / Lint** fungují stejně, jen je Claude řídí přes Notion MCP.
- `brain-sync` není potřeba — úložiště je Notion, Claude je knihovník.

---

## Nastavení — nech to na svojí AI

Celý smysl je v tomhle: **nech svého Clauda přečíst tenhle soubor a nastavit ti to.** Prostě řekni:

> „Přečti si `modules/second-brain/README.md` a nastav mi druhý mozek. Zeptej se mě, kterou možnost chci."

Tvůj Claude pak:
1. Zeptá se, jestli chceš **Tolarii**, **Obsidian**, nebo **Notion**.
2. U lokální varianty (Tolaria/Obsidian): vytvoří složku s vaultem, vloží do ní `AGENTS.template.md` (upravenou na tebe), zapojí `brain-sync.py` a napojí MCP.
3. U Notionu: provede tě napojením Notion MCP a pak vytvoří strukturu databází.
4. Naučí tě ty tři operace, abys mohl začít plnit mozek zdroji.

Ty vybíráš zdroje a pokládáš otázky. AI dělá čtení, zakládání, křížové odkazování a údržbu.
