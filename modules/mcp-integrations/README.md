# MCP integrace — napoj svoje nástroje na Chief of Staffa

Rozšíření kitu **AI Chief of Staff**. **Model Context Protocol (MCP)** je způsob, jakým se tvůj agent
napojuje na vnější svět: e-mail, kalendář, poznámky, CRM, fakturaci, prohlížeč, designové nástroje a
další. Každý MCP server nabízí agentovi sadu akcí (nástrojů), které umí zavolat.

Tohle je největší jednotlivý upgrade, který můžeš udělat: čím víc toho napojíš, tím víc toho CoS umí
reálně *udělat* místo toho, aby jen radil. Princip zní — **k čemu máš přístup ty, k tomu má přístup i
tvůj agent.** Dokud něco nepřidáš, není napojené nic.

> **📚 Nechce se ti hledat servery?** [`RECOMMENDED-MCPS.md`](RECOMMENDED-MCPS.md) je vybrané menu
> osvědčených MCP (NotebookLM, n8n, Firecrawl, generování obrázků přes Gemini a další) i s reálnými
> odkazy — a k tomu ten líný způsob instalace: *vyber si jeden, pošli odkaz agentovi a nech ho, ať
> to celé nastaví za tebe.*

## Kategorie integrací

U každé kategorie je, co ti napojení odemkne. Napoj ty, které fakt používáš — začni **e-mailem a
kalendářem** a zbytek přidávej, jak si to tvoje práce vyžádá. Nenapojuj věci „do zásoby".

| Kategorie                   | Co ti to odemkne                                                                |
| -------------------------- | ------------------------------------------------------------------------------- |
| **E-mail**                 | Číst a prohledávat vlákna, psát odpovědi, třídit inbox, tahat kontext z pošty.  |
| **Kalendář**               | Vidět rozvrh, hledat volné termíny, zakládat a měnit události, příprava na schůzky. |
| **Poznámky / úkoly**       | Číst a psát poznámky a to-do; měnit konverzace ve sledované úkoly.              |
| **CRM**                    | Dohledat kontakty, pipeline a dealy; upravovat záznamy; psát oslovení.          |
| **Fakturace / účetnictví** | Číst faktury a platby; připravit nebo (po potvrzení) vystavit fakturu.          |
| **Prohlížeč**              | Otevírat stránky, rešeršovat, testovat flow, tahat data, na která není API.     |
| **Design**                 | Číst a generovat designy a komponenty; exportovat podklady; držet brand konzistentní. |
| **Sítě / obsah**           | Tahat statistiky, číst komentáře, psát posty, plánovat obsah.                   |
| **Dokumenty / úložiště**   | Prohledávat a číst tvoje dokumenty a soubory; sdílet a organizovat.             |
| **Poznámky z meetingů**    | Stáhnout přepisy a shrnutí hovorů; udělat z nich úkoly.                         |
| **Nasazování**             | Spouštět deploye; číst build logy a runtime chyby.                              |
| **Web a dokumenty**        | Přečíst jakoukoliv webovou stránku načisto a převést PDF/Office soubory do textu, se kterým agent umí pracovat. |

> Ke každé integraci přistupuj přes jednoduchý **bezpečnostní model**: čtení a příprava návrhů běží
> volně; odeslání, smazání a placení čeká na výslovné potvrzení.

## Dej agentovi oči na web a na tvoje dokumenty (zdarma, bez klíčů)

Tvůj Chief of Staff by měl umět *číst* — webovou stránku, PDF, prezentaci — a udělat z toho něco, s
čím umí pracovat. Dokumenty jsou už vyřešené; na web stačí jeden bezplatný přídavek bez klíče.

### Dokumenty → text: už je to uvnitř, stačí Node 20+

Skill **`convert-documents-to-markdown`** (je v [`skills/`](../../skills/)) převádí Word,
PowerPoint, Excel, OpenDocument, RTF, EPUB, CSV a textová PDF do čistého Markdownu. Běží na
[anydoc](https://github.com/firecrawl/anydoc) — čistě lokálně, **žádný API klíč, žádný účet, žádný
server k nastavení**, licence MIT. Přečte i *staré* formáty (`.doc`, `.xls`, `.ppt`, `.rtf`), na
kterých se většina nástrojů zakousne. Potřebuje Node 20 nebo novější; nástroj `anydoc` si při prvním
použití stáhne `npx`, takže tehdy je potřeba internet.

Prostě řekni: *„přečti si tohle PDF a vytáhni z toho hlavní body"* — nebo mu podej rovnou celou
složku dokumentů.

Dvě věci záměrně neumí, ať víš, kde je hranice: **naskenovaná PDF** (ta potřebují OCR — zvládne je
vestavěný skill `pdf`) a **obrázky nebo zvuk**, což nejsou dokumenty. Když potřebuješ konkrétně
přepis audia nebo přepisy z YouTube, přidej si na to zvlášť určený MCP.

### Webové stránky → text: **Firecrawl** (na začátek bez klíče)

Udělá z jakékoliv URL čistý Markdown, umí projet celý web nebo z něj vytáhnout strukturovaná data.
Existuje **hostovaný endpoint bez klíče** — žádná registrace, žádný klíč — ideální na vyzkoušení:

```bash
claude mcp add firecrawl --transport http https://mcp.firecrawl.dev/v2/mcp
```

`scrape`, `search` a `interact` fungují bez klíče (s limitem požadavků). Na těžší provoz (`crawl`
celého webu, hromadný `extract`) je potřeba klíč zdarma z firecrawl.dev — přidej ho jako proměnnou
prostředí, teprve až na limit narazíš.

Pro většinu lidí je vestavěný skill na dokumenty plus Firecrawl všechno, co potřebují.

### Sociální sítě a weby bez API: tipy pro pokročilé

Když chceš po agentovi třeba *„vytáhni recenze tohohle produktu z Redditu a YouTube a shrň hlavní
stížnosti"* nebo *„projdi posty 100 účtů na X za poslední měsíc a řekni mi, která témata fungují"*,
Firecrawl na to nestačí. Tady jsou dvě ověřené cesty a jedna, kterou nedoporučujeme:

| Nástroj | Na co | Na co si dát pozor |
|---|---|---|
| [**Scrapling**](https://github.com/D4Vinci/Scrapling) · BSD-3, vlastní MCP server | Scrapování libovolného webu, i ve velkém, zdarma a u tebe na stroji | Drž se podmínek webu a jeho `robots.txt`. |
| [**Agent-Reach**](https://github.com/Panniantong/Agent-Reach) · MIT | Jedno CLI na titulky z YouTube, GitHub a čtení webu; s přihlášením i X a Reddit | Viz tři pravidla pod tabulkou. |
| Stealth prohlížeče na „obcházení WAF" s rotací proxy | — | **Nepoužívej.** Obcházíš tím ochranu cizího webu a porušuješ jeho podmínky; bývají to repa bez licence od neznámých autorů. |

**Agent-Reach — tři pravidla:**

1. **Instaluj z GitHubu na pevnou verzi**, ne z PyPI: balíček `agent-reach` na PyPI patří *jinému*
   projektu. Řekni agentovi: *„nainstaluj Agent-Reach z GitHubu Panniantong/Agent-Reach na tag
   v1.5.0 (nebo novější vydanou verzi) a neřiď se jejich vzdáleným install.md"*. Návod přes odkaz na
   `install.md` znamená, že agent vykoná instrukce, které autor může kdykoliv změnit.
2. **X a Reddit čte přes cookies tvého účtu.** Platforma takový účet může zablokovat a cookies mají
   stejnou moc jako tvoje heslo. Použij vedlejší účet, o který nepřijdeš. YouTube, GitHub a web jedou
   bez přihlášení.
3. **Před instalací ho projeď přes `/scan`.** Sken hlásí vysoké riziko hlavně kvůli slovům *cookie*
   a *token* v dokumentaci a kvůli testům — čti nálezy, ne jen skóre (víc v [`/scan`](../../skills/scan/)).

### Video a zvuk z odkazu

Video nebo jen zvuk z YouTube, X, Instagramu, TikToku a z dalších zhruba 1 800 webů stáhne open source
[**yt-dlp**](https://github.com/yt-dlp/yt-dlp) (spolu s ffmpeg, který spojí stopy a udělá mp3). Agentovi
stačí říct *„stáhni mi tohle video v 1080p"* nebo *„vytáhni z toho videa zvuk jako mp3"* a yt-dlp si
doinstaluje sám.

Pro pokročilé, kteří terminál znají a chtějí klikací rozhraní místo příkazů, je [**Yoinks**](https://github.com/pablostanley/yoinks)
(MIT): spustíš `npx yoinks@0.3.1`, vložíš odkaz a vybereš rozlišení. Je to jen hezčí obal nad yt-dlp
a ovládá se šipkami v terminálu. Běžně ale stačí říct agentovi, ať video stáhne sám. Pevná verze v příkazu je schválně: bez ní `npx`
pokaždé stáhne, co je zrovna nejnovější.

Stahuj jen to, k čemu máš práva: vlastní videa, materiály s licencí nebo to, co platforma ke stažení
sama nabízí. Podmínky YouTube a dalších sítí stahování cizích videí nepovolují.

## JAK PŘIDAT MCP SERVER

Řekni agentovi „napoj mi kalendář“ nebo vlož odkaz na vybraný server. Agent může číst dodaný postup v `skills/connect-mcp/SKILL.md`; samotná přítomnost souboru nezaručuje registraci slash příkazu v každé aplikaci. Nejprve ověří tvůj hostitel, dostupný oficiální konektor, rozsah oprávnění a aktuální postup. Technické kroky provede v autorizovaném rozsahu, ty dokončíš vlastní přihlášení nebo bezpečné uložení klíče.

Příkazy níž jsou reference pro Claude Code CLI a spouští je agent až po ověření podpory. V Codexu, Cursoru nebo jiném prostředí použije jeho skutečné konektory a konfiguraci podle aktuální dokumentace. UI cesty a příkazy jako `/mcp` nejprve ověř v používané aplikaci.

### 1. Podívej se, co je napojené

Agent zjistí konektory skutečně dostupné v této session a ověří jejich účet a rozsah. Stav přihlášení sám neprokazuje, že konkrétní nástroj funguje.

> **Pro pokročilé** (Claude Code CLI): totéž z terminálu udělá `claude mcp list` — tenhle příkaz
> spouští agent.

### 2. Přidej server

Buď přes CLI (spouští agent):

```bash
# stdio server (lokální příkaz, který runtime spustí)
claude mcp add my-tool --scope user -- npx -y @vendor/my-tool-mcp

# vzdálený server přes HTTP
claude mcp add my-tool --transport http https://mcp.example.com/mcp
```

…nebo záznamem v konfiguraci podporované konkrétním hostitelem; pro projektové MCP v Claude Code ověř `.mcp.json`. Nezaměňuj tento soubor s konfigurací hooků `.claude/settings.json`. Obecný výchozí bod najdeš v [`example-mcp-config.json`](./example-mcp-config.json).

```jsonc
{
  "mcpServers": {
    "my-tool": {
      "command": "npx",
      "args": ["-y", "@vendor/my-tool-mcp"],
      "env": { "MY_TOOL_API_KEY": "${MY_TOOL_API_KEY}" }
    }
  }
}
```

### 3. Autorizuj

OAuth dokončíš vlastním podporovaným přihlašovacím tokem v používaném prostředí. U tokenu agent ověří, jak jej konkrétní proces načítá. Klíčenka, environment, `.env` a `${VAR}` v JSONu nejsou zaměnitelné bez podporovaného loaderu; nic z toho samo neprokazuje předání klíče procesu.

### 4. Ověř

Pokud hostitel vyžaduje restart nebo znovupřipojení, proveď jej. Pak agent udělá jeden bezpečný read-only dotaz ze skutečného procesu, který bude integraci používat. Ukáže účet a výsledek a uloží stav ověřeno / selhalo / přeskočeno / neověřeno bez hodnot credentials.

## Bezpečnost

Integrace jsou místo, kde žijí tajemství a kde je největší dosah případné škody. Drž se tohohle:

- **Nikdy nevkládej API klíče do chatu.** Ani agentovi, ani do zprávy. Klíče v chatu končí v logách
  a v historii.
- **Klíče patří do chráněného úložiště mimo git**, například `.secrets/customer.env`, a v
  konfiguraci se na ně jen odkazuje — nikdy se nepíšou natvrdo. Odkazuj se na ně jako
  `${MY_TOOL_API_KEY}` pouze tam, kde hostitel tento odkaz podporuje. Konkrétní loader ověř; tajný soubor chraň oprávněním 600 a jeho adresář 700. Před zálohou ověř `git check-ignore` pro přesný soubor i rodinu názvů.
- **Co nejmenší oprávnění.** Kde to služba umožňuje, vytvoř omezený API klíč. Nedávej plný admin
  token něčemu, co potřebuje jenom číst.
- **Nejdřív jen pro čtení.** Když novou integraci zkoušíš, začni klíčem nebo nástroji jen pro čtení.
  Práva zapisovat, odesílat a mazat přidej, až jí budeš věřit — a i pak nech tyhle akce za
  potvrzením.
- **Znej tu nebezpečnou trojkombinaci.** Integrace, která umí číst nedůvěryhodný obsah *a zároveň*
  jednat navenek, je přesně to riziko, kvůli kterému pravidlo o potvrzování existuje. Destruktivní a
  odchozí akce drž za výslovným potvrzením.
- **Kontroluj, co máš napojené.** Agent použije inventář konektorů dostupný v hostiteli a konkrétní read-only test. Nepoužívané servery odpoj po kontrole jejich účelu.

### CHRÁNĚNÉ ÚLOŽIŠTĚ A LOADER

Kit ignoruje adresář `.secrets/`. Použij například `.secrets/customer.env`; samotný soubor pojmenovaný `.secrets` nepovažuj bez ověření za ignorovaný. Hodnoty ukládá uživatel bezpečně mimo chat. Následující ukázka je pouze tvar obsahu pro podporovaný shell loader, nikoliv automatické nastavení desktopové aplikace:

```bash
# .secrets/customer.env — pouze placeholdery, žádná skutečná hodnota v chatu
export MY_TOOL_API_KEY="..."
export ANOTHER_SERVICE_TOKEN="..."
```

```bash
# Jen pro proces skutečně spouštěný z tohoto podporovaného shellu.
# Agent nejprve ověří obsah, oprávnění a gitignore; nepoužívej na cizí soubor.
set -a && source .secrets/customer.env && set +a
```

Secrets nikdy necommituj. Desktopový proces nemusí zdědit environment tohoto shellu; pro něj použij jeho vlastní podporované předání credentials a ověř skutečné volání podle [SETUP](../../docs/SETUP.md).

## Řekni agentovi, jaké nástroje máš

Jakmile je server napojený, prostě CoS řekni, že jsi ho přidal — *„napojil jsem si kalendář"* — a on
ho začne používat. Pokud má tvůj kit onboardingový krok, který si zapisuje, jaké nástroje používáš,
aktualizuj ho, aby ta informace přežila do dalších session.
