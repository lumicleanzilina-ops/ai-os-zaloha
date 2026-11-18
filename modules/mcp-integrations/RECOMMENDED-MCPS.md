# Doporučené MCP servery — vybrané menu

MCP = způsob, jakým tvůj agent sáhne do reálného nástroje (e-mail, databáze, aplikace, web).
Nemusíš je hledat ani umět instalovat. **Vyber si z menu níž a pak řekni agentovi: „napoj mě
na X — tady je repo, přečti si ho a nastav to."** Přečte README, nastaví config a zeptá se tě
jen na to jediné, co za tebe udělat nemůže (přihlášení nebo API klíč).

> Řekni agentovi „napoj mi tento nástroj“. Dodaný postup `skills/connect-mcp/SKILL.md` může přečíst i bez registrovaného slash příkazu. Nejprve ověří používanou aplikaci, dostupný konektor a aktuální dokumentaci. Přihlášení dokončíš ty; agent provede technické kroky a jedno skutečné read-only volání podle [SETUP](../../docs/SETUP.md).

Dva druhy MCP, seřazené podle námahy:

1. **Oficiální konektor** — dodává ho sám výrobce (nebo tvoje AI aplikace). Nejrychlejší: přidat
   podporovaným tokem hostitele, přihlásit se a ověřit skutečné volání. UI a příkazy se liší podle aplikace. Gmail, Google Calendar,
   Notion, GitHub, Drive… patří sem.
2. **Komunitní MCP** — někdo postavil bohatší nebo self-hostovatelný server. Seznam níž. Obvykle
   `npx …` nebo naklonované repo + API klíč.

> **Nejdřív bezpečnost:** komunitní MCP je *cizí kód běžící na tvém počítači*. Než mu začneš věřit,
> proskenuj ho přes **`/scan`** (SkillSpector) a přečti si nálezy — server, co čte cookies z tvého
> prohlížeče nebo klíčenku, nebo při instalaci pouští `curl … | sh`, je červený praporek.

---

## Menu

| Nástroj | Co ti to odemkne | Jak napojit | Na co si dát pozor |
|------|-----------------|----------------|---------------|
| **Gmail / Google Calendar** | Číst, hledat, psát koncepty i odesílat maily a odpovědi do vlákna, spravovat kalendář, připravit se na meeting. | **Oficiální konektor** — přidat přes `/mcp` (nebo v nastavení konektorů tvojí AI aplikace) a přihlásit se. Žádné GitHub repo není potřeba. | Oficiální konektor dnes umí i odeslat (nová zpráva i odpověď do vlákna) a odesílá **okamžitě**, bez mezikroku s konceptem: text proto vždy nejdřív ukaž ke schválení a po odeslání dolož, že zpráva je ve vlákně jako odeslaná. Dvě pasti ověřené v provozu (říjen 2026): **odkazy** v odeslaném mailu konektor přepíše na přesměrování přes google.com, které po 24 hodinách přestane fungovat a adresát pak uvidí stránku podobnou phishingu; **přílohy** jdou jen jako base64 do 25 MB, u PDF nespolehlivě. Mail s odkazem, který má platit déle, nebo s velkou přílohou pošli jinak: jako koncept, který odešle uživatel, nebo přes vlastní MCP postavené skillem **`mcp-builder`** (nejbezpečnější varianta, nikomu cizímu nemusíš věřit). Komunitní servery se rychle mění (dříve nejpopulárnější `GongRzhe/Gmail-MCP-Server` je archivovaný); když půjdeš touhle cestou, vyber *udržovaný* a nejdřív ho projeď přes **`/scan`**. Nabídka oficiálního konektoru se mění, co umí právě teď, ověř jedním testovacím mailem sobě. |
| **NotebookLM** | Hluboký výzkum nad vybranými zdroji s odkazy na podklady. | [`teng-lin/notebooklm-py`](https://github.com/teng-lin/notebooklm-py) *(volitelné)* | Před přihlášením ověř aktuální postup a oprávnění. Odpovědi kontroluj vůči citovaným zdrojům. |
| **n8n automatizace** | Nech agenta **stavět a spravovat kompletní n8n workflow** — 1600+ nodů, skutečné CRUD nad tvými automatizacemi. | [`czlonkowski/n8n-mcp`](https://github.com/czlonkowski/n8n-mcp) → `npx n8n-mcp` | ⚠️ **Jen self-hostované n8n.** Plná kontrola funguje na tvém vlastním serveru; n8n Cloud nabízí jen omezené API. Potřebuje URL tvojí instance + API klíč. |
| **Firecrawl** | Stáhnout nebo proválcovat jakýkoli web do čistého markdownu, ať si to agent může přečíst. | [firecrawl.dev](https://firecrawl.dev) — hostovaný MCP, potřebuje free API klíč. | Nad rámec free tieru se platí kredity. |
| **Generování obrázků (Gemini „nano-banana")** | Generovat a upravovat obrázky z promptu přímo v agentovi. Na skriptovou/dávkovou pipeline (referenční fotky → obrázky tebe samotného přes OpenAI `gpt-image-2`) mrkni do [`modules/image-generation/`](../image-generation/README.md). | Neexistuje jedno kanonické repo → **řekni agentovi: „nastav mi MCP na generování obrázků přes Gemini nano-banana"** a nech ho vybrat aktuální. Potřebuje klíč z Google AI Studio. | Forky vznikají a zanikají — nech agenta sáhnout po udržovaném, místo abys zafixoval mrtvý odkaz. |
| **Higgsfield (AI video/obrázky)** | Generovat video a obrázky z promptu — 30+ modelů (Veo, Kling, Sora…), až do 4K, rovnou do chatu. | **Oficiální konektor** → přidat `https://mcp.higgsfield.ai` jako vlastní konektor a přihlásit se. Žádná instalace, žádný API klíč. | Placené kredity za každé generování; potřebuje účet na Higgsfieldu. |
| **Meta Ads / Business Manager** | Vytvářet, spravovat a analyzovat reklamní kampaně na Facebooku a Instagramu normální řečí. | **Oficiální** vzdálené MCP → `https://mcp.facebook.com/ads` (nativní pro Clauda). Nebo komunitní: [`pipeboard-co/meta-ads-mcp`](https://github.com/pipeboard-co/meta-ads-mcp). | Jde o reálně utrácené peníze za reklamu — než něco vyjede naostro, nech to schválit člověkem. |
| **Tolaria** | Lokální markdown vault stavěný pro AI — doporučený domov pro tvůj **druhý mozek** (bez pluginu). | MCP má rovnou v sobě. Viz `modules/second-brain/`. | Lokální aplikace; v aplikaci je potřeba zapnout MCP bridge. |
| **Fireflies — přepis schůzek** | Vyhledání nebo zpracování přepisů podle možností účtu a konektoru. | [Dokumentace konektoru](https://docs.fireflies.ai/getting-started/mcp-configuration). | Před nahráváním ověř souhlas účastníků, uchovávání záznamů, export a rozsah sdílených dat. Funkce a ceny se mohou měnit. |
| **Apify / actors** | Hotové scrapery — Instagram, LinkedIn, Mapy, TikTok, e-shopy… | Řekni agentovi, co chceš scrapovat; správného actora si najde sám. | Běhy actorů stojí kredity. |

*(Přidávej si vlastní řádky, jak budeš objevovat MCP, co stojí za to. Tenhle soubor je tvoje
rostoucí bedna s nářadím.)*

### SOUHLAS A ZPRACOVÁNÍ SCHŮZEK

Před nahráváním ověř souhlas účastníků a aktuální podmínky služby. Zkontroluj, kam se nahrávka a přepis ukládají, kdo k nim má přístup, jak dlouho se uchovávají a jak je lze exportovat nebo smazat.

### VOLITELNÝ HLASOVÝ VSTUP

Přepis řeči může být pohodlný vstup pro prompty. Pokud použiješ službu třetí strany, ověř její aktuální podporu jazyků a platforem, cenu a způsob zpracování hlasových dat na [oficiálním webu Wispr Flow](https://wisprflow.ai/).

### Poznámky k instalaci u těch složitějších

Technickou část řeší tvůj agent — tyhle poznámky jen zviditelňují *lidské* kroky.

**NotebookLM** (`teng-lin/notebooklm-py`) — kroky 1 a 3 dělá agent, **krok 2 děláš ty**:
1. `uv tool install "notebooklm-py[browser]"` (spouští agent; první běh stáhne Chromium, ~170 MB)
2. `notebooklm login` → **otevře se prohlížeč → přihlásíš se ke Googlu.** Tohle za tebe agent udělat
   nemůže (a neměl by).
3. `notebooklm skill install`, pak **restartuj agenta.** Ověř přes `notebooklm auth check`.

**n8n** (`czlonkowski/n8n-mcp`) — `npx n8n-mcp`, ale potřebuje **tvoje vlastní self-hostované n8n**:
dej mu URL tvojí instance + n8n API klíč (klíč patří do proměnné prostředí). Na n8n Cloudu dostaneš
jen zhruba čtecí přístup.

U každého nástroje agent ověří aktuální dokumentaci a podporovaný hostitel, bezpečnostní sken a předání credentials skutečnému procesu. Katalog je podklad pro výběr, nikoliv důkaz instalace nebo registrace slash příkazu.

---

## Co všechno se dá napojit (pro inspiraci)

Všechno tohle nepotřebuješ. **Nainstaluj si jen to, co fakt používáš — zbytek přeskoč nebo odstraň.**
Tohle je jen ukázka rozsahu toho, do čeho se Chief of Staff umí zapojit. Ke každému existuje buď
oficiální konektor, nebo komunitní MCP; řekni agentovi, které chceš, a on je nastaví.

- **E-mail a kalendář** — Gmail, Outlook, Seznam, Google Calendar, Google Drive
- **CRM a obchod** — tvoje CRM (GoHighLevel / HubSpot / Pipedrive), pipeline, kontakty, follow-upy
- **Fakturace a platby** — Fakturoid, Stripe
- **Meetingy** — Fireflies / Otter / Fathom (přepisy → úkoly)
- **Marketing** — Meta Ads, YouTube Studio, plánovače na sociální sítě
- **Obsah a design** — Figma, Canva, generování obrázků přes Gemini
- **Znalosti** — Notion, NotebookLM, lokální vault (Tolaria / Obsidian)
- **Vývoj a nasazení** — GitHub, Vercel, Chrome DevTools
- **Výzkum a web** — Firecrawl, Apify actors, MCP na vyhledávání na webu
- **Automatizace** — n8n (self-hostované)

> **⚠️ Důležité — tohle všechno jede na TVÝCH účtech.** Nic tady nechodí s cizími přihlašovacími
> údaji. Každé napojení používá *tvoje vlastní* přihlášení nebo API klíč, který si přidáš sám (viz
> `README.md` → proměnné prostředí a API klíče). Nainstaluj, co potřebuješ, smaž, co ne.

---

## Jak na to reálně (líná a správná cesta)

1. Vyber si nástroj z menu.
2. Pošli agentovi odkaz na jeho repo: *„napoj mě na tohle — přečti si repo a nastav to."*
3. Až bude potřebovat klíč, přesně ti řekne, kde ho vzít (viz `README.md` → proměnné prostředí
   a API klíče).
4. Přes `/mcp` si potvrď, že je server napojený.
5. Od té chvíle se ptáš normální řečí — *„prozkoumej tohle přes NotebookLM", „vytáhni moje n8n
   workflow", „udělej mi obrázek…", „napiš koncept odpovědi na tenhle e-mail"*.

Nikdy ses nemusel učit instalační příkaz. Vybral sis z menu a zbytek udělal systém.

> **Potřebuješ něco, co žádné MCP nepokrývá?** V kitu je skill `mcp-builder` — agent umí postavit
> malé vlastní MCP pro API, které žádné nemá. Pokročilý tah; menu výš pokrývá to, co většina lidí
> potřebuje nejdřív.
