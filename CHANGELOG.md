# CO JE NOVÉHO V AI OS KITU 4.4 OPROTI 4.3, V.03 A V.04

Jediný začátek pro nové i stávající uživatele je [ZACNI-TADY](ZACNI-TADY.md). Majiteli 4.3, V.03, V.04 nebo V.04.1 agent nejdřív vysvětlí tento přehled a nabídne, co chce převzít. Samotné čtení nic neinstaluje ani nemění.

## NOVÉ VE 4.4: ŘÍZENÍ PRÁCE A PAMĚŤ

Pro majitele 4.3 i starších verzí. Verze 4.4 mění hlavně to, jak agent nakládá s tvou prací, pozorností a pamětí. Přidává jedinou novou dovednost, `/brain` (hledání v paměti).

| Novinka | S čím ti pomůže |
|---|---|
| [Jedná až na tvůj pokyn](AGENTS.md#základní-pravidla-práce) | Bez „udělej to“, „uprav to“ nebo „oprav to“ agent jen odpovídá, analyzuje a navrhuje. Otázka, nápad ani nahlášená chyba nejsou souhlas se změnou. Push, nasazení, zveřejnění a odeslání potřebují vlastní ano. |
| [Nápad není úkol](docs/PRIORITIZACE.md) | Nápad s tebou agent krátce promyslí. Do úkolů ho zapíše, až když řekneš. |
| [Priority na konci odpovědi](docs/PRIORITIZACE.md#formát-bloku-priorit) | Kde přibyla práce, agent ukáže blok 🎯 Priority: co teď (nejvýš 3 věci), co naplánovat, co delegovat a co škrtnout. Na „udělej to“ řekne, kdy na věc dojde a co má přednost, a rozdělané dokončí před novým. |
| [Jeden registr otevřených bodů](docs/otevrene-body.md) | Všechno, co má někdo udělat do termínu, je v jedné tabulce místo v několika reportech. |
| Přehled o ostatních sessions bez Dashboardu | Na startu každé session agent vidí, na čem se v tomto workspace posledních 48 hodin pracovalo v Claude Code a Codexu, top 5 otevřených bodů (nejbližší termín první) a necommitnutou práci v repech. Když se téma překrývá, řekne ti to a naváže. Kdo má Dashboard, má přehled sessions dál z něj; kit ho nezdvojí. Běží v Claude Code po zapnutí pojistek; v Codexu se hooky kitu nespouštějí. |
| Záznam každé session sám | Hook na konci práce zapíše do `docs/session-logs/` zadání, změněné soubory a commity, bez `/end-session`. `/end-session` a uzavření dne pak záznam jen doplní. Kdo má Dashboard, ukládá sessions dál on. Běží v Claude Code po zapnutí pojistek; v Codexu dělá záznam `/end-session`. |
| Learningy bez zahlcení | Když vlastních pravidel přibude hodně, agent na startu dostane krátký rozcestník (nejdůležitější a nejnovější) místo celého seznamu a zbytek si dohledá. Tvůj profil přitom zůstane celý. |
| [Ranní briefing s prioritami](scheduled-tasks/morning-briefing/SKILL.md) | Briefing začíná blokem 🎯 Priority a ukazuje otevřené body s termínem. |
| Úklid po testech pro všechny nástroje | Testy a ověřovací příkazy běží přes obal `tools/beh.mjs` (npm test, vitest, playwright, pytest, skripty). Dočasné soubory zmizí po úspěšném běhu i po Ctrl+C; po neúspěšném zůstanou nejvýš 24 hodin k ladění a pak je smete další běh. |
| Pořádek ve `work/` | Pomocné soubory, které úkol sám vytvořil, agent před koncem přesune do koše. Novou kopii repa zakládá, jen když nestačí větev. |
| Jedna vrstva místo dvou | Novou automatiku, zálohu nebo záznam agent přidá jen se současným vypnutím staré, která dělá totéž. |
| Opravy dovedností | `lead-magnet-funnel`: skryté pole proti robotům už nemá jméno, které vyplní prohlížeč (dřív mohl formulář potichu zahodit skutečného zájemce). `call-prep`: brief rovnou do chatu, po obchodním callu návrh shrnutí klientovi do 24 hodin. `end-session` a uzavření dne: jedna session má jeden záznam, žádné `-2` ani druhý log dne. |
| [Gmail podle skutečnosti](modules/mcp-integrations/RECOMMENDED-MCPS.md) | Oficiální konektor dnes umí i odeslat, a to okamžitě. Odkazy v odeslaném mailu přestanou po 24 hodinách fungovat; kit říká, kdy poslat mail jinou cestou. |
| Push na správné místo | Před commitem a pushem agent ověří repo, větev a účet podle mapy v profilu. Osobní, firemní a klientská repa nemíchá. |
| Přihlášené služby přes tvůj prohlížeč | Kde služba nemá API ani MCP, agent pracuje v prohlížeči, ve kterém jsi přihlášený. Přihlášení, hesla a platby nechá na tobě. |
| Subagenti s mírou | Na čtení levnější model, na kontrolu silnější. Víc než tři naráz jen s tvým souhlasem. |
| [Závěr odpovědi: kdo co dokončuje](docs/PRIORITIZACE.md#závěr-odpovědi-kdo-co-dokončuje) | Odpověď, kde se mění stav práce, končí řádky `JÁ:` (co dokončuje agent), jméno spolupracovníka z tvého profilu (jen když nějakého uvedeš), `ČEKÁME NA:` (na koho a na co) a `TY TEĎ:` (tvůj přesný krok, nebo „nic“). Jen ověřený stav; vlastní práci agent neschovává za čekání na jiné. |
| [Oprava se doplní, nezaloží podruhé](hooks/self-review-prompt.md) | Když tě agent opraví, nejdřív najde, jestli k tématu už pravidlo máš. Máš-li, doplní ho sekcí `Doplněno <datum>`; nový soubor a řádek v rejstříku přibude jen tehdy, když žádné není. Dvě pravidla k jednomu tématu se časem rozejdou a odporují si. |
| [Úklid po sobě bez ptaní](AGENTS.md#workflow-soubory-a-dodání) | Screenshoty, náhledy, pomocné skripty, výtahy, exporty a mezivýpočty, které si agent při práci sám vytvořil, přesune do koše hned, jak nejsou potřeba, nejpozději před „hotovo“. Export s osobními údaji hned po použití. Cizí a starší soubory jen s tvým souhlasem. |
| [Co jsi řekl, agent zapíše doslova](docs/playbook/write-facts-down-before-asking.md) | Když v jedné zprávě nadiktuješ víc jmen, dat nebo čísel, agent je nejdřív doslova zapíše do souboru projektu a před každou otázkou ten soubor prohledá. Neptá se dvakrát na totéž a nic nedomýšlí: hypotéza není fakt. |
| [Podpis e-mailů podle tebe](ONBOARDING.md) | V rozhovoru se agent zeptá, jak se má podepisovat, když píše e-mail za tebe: jen jménem, nebo s řádkem o asistentovi, a jinak u osobní zprávy jednomu člověku. Volba se uloží do profilu. E-mail agent pořád jen navrhne a odešle až po tvém ano. |
| [Čísla jen z uvedeného zdroje](docs/GROUND-TRUTH.md) | V rozhovoru agent zjistí, se kterými opakovanými čísly pracuješ (ceny, počty klientů, KPI) a kde žijí, a zapíše je do tabulky zdrojů. Číslo bez zdroje pak neuvede; týdenní audit přidá řádek, kdykoli nějaké číslo dalo práci dohledat. |
| [Hledání v paměti a připomínač](skills/brain/SKILL.md) | Nová dovednost `/brain` prohledá wiki druhého mozku, tvoje learningy a záznamy sessions. Hook `brain-pripomen` navíc, když mluvíš o minulosti („minule“, „jak jsme řešili“, „co víme o“) nebo jmenuješ stránku z wiki, přidá ke zprávě nejvýš 3 odkazy jako nález, ne pokyn. Bez vaultu hledá v learningech a záznamech. Mluví jen o minulosti, ne o přítomnosti („kde jsme?“, „jak jsme na tom?“), mlčí během nastavování kitu a mlčí, když nic jistého nenajde. Po aktualizaci ze starší verze se hook zapojí aktivací pojistek, kterou agent spustí znovu; vypnout ho jde proměnnou `AICOS_BRAIN=off`. Bereš-li z Kitu 4.3 jen tuhle novinku, převezme se spolu s ní i `tools/doctor.mjs`, `hooks/config.mjs` a hooky, na kterých stojí (doctor ze 4.3 zapojený připomínač hlásí jako chybu, a stávající `learnings-index` dostane krátký rozcestník). Soubory doplní `upgrade.mjs --novinky pripominac` a hook zapojí `aktivovat-pojistky.mjs --jen brain-pripomen`; do `.claude/settings.json` se ručně nepíše a před začátkem vznikne záloha. |
| [Záznam session rovnou ve vaultu](docs/session-logs/README.md) | S druhým mozkem hook zapisuje záznam každé session rovnou do jeho složky `session-logs/` (jeden soubor na session, žádná kopie), jinak dál do `docs/session-logs/`. Přehled sessions na startu čte ze stejného místa. `/end-session` a uzavření dne doplňují ten jediný soubor. |
| [Noční zápis do wiki](scheduled-tasks/daily-end-session/SKILL.md) | Uzavření dne s druhým mozkem připíše den do `log.md` a do stránky projektu ve wiki; chybí-li stránka a projekt má README, založí ji z README bez nových faktů. Projekty, které označíš jako důvěrné, nepovyšuje. |
| [Údržba druhého mozku v týdenním auditu](scheduled-tasks/weekly-improvement/SKILL.md) | Týdenní audit opraví rozpory a zastaralá tvrzení ve wiki (s poznámkou „Opraveno“ a zdrojem; sporné ti položí jako otázku), vyřídí hlášení údržby vaultu a opakované přeskočení nočního zápisu bere jako vadu. Návrh, který by se objevil potřetí, se provede, zruší, nebo jde jako ano/ne do registru otevřených bodů. |
| [Čtení a hledání bez klikání](hooks/README.md#aktivace-po-závislostech) | Claude Code už nemá nástroje Glob a Grep. Agent proto čte nástrojem Read a hledá příkazy `ls`, `grep`, `head` a `wc`, které dodaný `.claude/settings.json` předschvaluje (`cat` a `find` ne: `cat` by s `>` přepsal soubor, `find` umí mazat; obsah souboru čte nástroj Read). V čerstvém Kitu nemusíš nic potvrzovat; starý workspace tato pravidla nemá, dokud agent nespustí aktivaci pojistek, takže se tam může objevit dotaz na povolení čtecího příkazu. Jen tuhle novinku přidá do starého workspace `aktivovat-pojistky.mjs --jen cteni`. |
| [Dovednosti jako příkazy](skills/README.md) | Claude Code načítá dovednosti z `.claude/skills/`, kit je ale dodává ve `skills/`, takže je dřív nenabízel. Při nastavení je agent zpřístupní nástrojem `tools/zpristupnit-skilly.mjs`: napíšeš `/planning`, `/brain`… a Claude Code je používá i sám podle popisu. Na macOS a Linuxu je to symlink, na Windows kopie; nástroj nic nepřepíše ani nesmaže a `checkpoint` vynechá (vestavěný příkaz `/checkpoint` je alias `/rewind`). Po zpřístupnění stačí v session napsat `/reload-skills`, nebo otevřít novou. Po aktualizaci ze starší verze agent nástroj spustí znovu. |
| [Ranní rutina v Claude Desktopu](scheduled-tasks/README.md#ranní-rutina-v-claude-desktopu) | Přesný postup, jak v appce založit plánovanou úlohu (Code → Scheduled → New task, složka = tvůj workspace, Only on this computer, rozvrh), co musí platit (aplikace spuštěná, počítač vzhůru) a jak ji ověřit (Run now, „always allow“). Úlohu v appce zakládáš ty; agent ti připraví instrukce a běh s tebou ověří. |
| [Model Sonnet na tarifu Pro](ZACNI-TADY.md) | Na tarifu Pro ti agent na začátku připomene přepnout model na Sonnet, který šetří limit využití (pod polem pro zprávu, na Macu Cmd+Shift+I). Opus nech na náročné úkoly. |

Převzít jde všechno najednou, nebo jen vybrané řádky podle [postupu pro vybranou část](docs/UPGRADE-Z-V3.md#jen-vybrané-novinky).

## NOVÉ DOVEDNOSTI PRO TVOJI PRÁCI

Nové oproti V.03. Ve V.04 a V.04.1 už byly, viz [níže](#máš-v04-nebo-v041).

| Novinka | S čím ti pomůže |
|---|---|
| [Příprava na schůzku](skills/call-prep/SKILL.md) | Připomene účastníky, předchozí domluvy a otevřené body. Z dodaného přepisu po schůzce pomůže vybrat další kroky. |
| [Přehled o klientovi](skills/client-context/SKILL.md) | Poskládá dostupný kontext klienta z propojených nástrojů, abys ho nemusel dohledávat v několika místech. |
| [Podklady pro účetní](skills/bookkeeping-reconciliation/SKILL.md) | Pomůže spárovat bankovní pohyby s fakturami a doklady a vypíše, co ještě chybí. |
| [Převod dokumentů](skills/convert-documents-to-markdown/SKILL.md) | Převede podporované dokumenty, prezentace a tabulky do textového formátu, se kterým může agent dál pracovat. Potřebuje Node 20 nebo novější a při prvním použití internet: nástroj si stáhne přes `npx`. Účet ani klíč nepotřebuje. |
| [Lead magnet a sběr kontaktů](skills/lead-magnet-funnel/SKILL.md) | Pomůže připravit stránku s užitečným materiálem, sběrem kontaktů a doručením podle tvých nástrojů. |
| [Výzkum přes více AI modelů](skills/multi-model-deep-research/SKILL.md) | Připraví různá výzkumná zadání pro několik modelů a porovná jejich výstupy. Zadání do jednotlivých služeb předáváš ty; nejde o automatické propojení všech účtů. |

Jsou to připravené postupy pro agenta. Potřebné podklady, propojení a případné další služby s tebou ověří až u vybrané funkce. Stažení ZIPu samo nepřipojí účty ani nespustí automatizace.

## DALŠÍ ZMĚNY

- [Úklid pracovní složky](scheduled-tasks/workspace-tidy/SKILL.md): nová rutina pomáhá roztřídit pracovní soubory a udržovat pořádek. Zapnutí a rozvrh si zvolíš.
- [Bezpečnější aktualizace](docs/UPGRADE-Z-V3.md): agent nejdřív ukáže změny, uchová zálohu a zachová tvoje vlastní úpravy. Rozdílná osobní pravidla nebo konfigurace nesmí přepsat tovární kopií.
- [Pojistky a kontrola nastavení](docs/SETUP.md): upravené ochrany souborů, hlídač tajemství před commitem a diagnostika. Agent ověří jejich skutečný běh v používané aplikaci; některé změny vyžadují společnou aktualizaci souborů a nastavení.
- [Úplný průvodce kitem](ONBOARDING.md): při nové instalaci nebo celkové aktualizaci projde celý katalog a uloží, co chceš nastavit teď, později, nebo vůbec. Na rozdělané nastavení můžeš navázat.
- [AI OS Dashboard](docs/PREDANI-DASHBOARDU.md): volitelná nadstavba v samostatném druhém ZIPu, Dashboard 4.4 jako beta pro kupující Kitu, včetně upravitelných zdrojů aplikace. Má vlastní průvodce pro počítač nebo server a navazuje až na dokončený Kit 4.4.

## CO UŽ V.03 MĚLA

Osobní rozhovor, profil, pravidla, paměť, původní dovednosti, ranní briefing, ukončení dne, zálohy i týdenní zlepšování byly už ve V.03. Nejde o nové funkce jen proto, že mají upravený návod. Podrobné doložené srovnání V.03 → Kit 4.3.0-rc.28 a Dashboard pro pokročilé, u každého bodu s odkazem na soubor, je v [POROVNANI-S-V03](docs/POROVNANI-S-V03.md); co přibylo ve 4.4, je výše v tomto přehledu. To, co už máš nastavené, nemusíš dělat znovu.

## MÁŠ V.04 NEBO V.04.1

Šest dovedností z tabulky výše, rutinu [úklidu pracovní složky](scheduled-tasks/workspace-tidy/SKILL.md) a modul AI firma už V.04 i V.04.1 obsahovaly; pro tebe nejsou novinkou. Nové jsou pro tebe hlavně tyto věci:

- Jedna ústava `AGENTS.md`: `CLAUDE.md` už jen importuje `@AGENTS.md` a tvoje vlastní pravidla se převádějí řízeně, se zálohou. Ve V.04.x je udržovaly dvě kopie.
- Pojistky na Node 24 fungují i ve složce s mezerou v názvu (ve V.03 až V.04.1 se tam nespustily). Přibyl hlídač tajemství, který zná víc formátů klíčů, a `tools/doctor.mjs` pro kontrolu nastavení. Checkpoint se dělá před každým příkazem v shellu.
- Nástroj upgradu nejdřív ukáže plán, uloží zálohu a podle továrních otisků V.03 až V.04.1 pozná tvoje vlastní úpravy. Profil leží v `docs/profil/`, takže ho najde Claude Code i Codex.
- [Úplný průvodce](ONBOARDING.md) projde celý katalog s volbou teď / později / nepotřebuji, průběh ukládá do jednoho soukromého záznamu a umí navázat.
- Hermes a AI OS Dashboard jsou samostatný druhý ZIP s vlastním průvodcem pro počítač nebo server. Dřívější modul AI firma tím nahrazují; tvůj starší runtime se při upgradu nemaže ani nespouští vedle nového.

Verzi tvého workspace agent pozná jen čtením, podle tabulky v [upgradu ze starší verze](docs/UPGRADE-Z-V3.md#krok-0-odkud-jdeš). Když si není jistý, zeptá se tě.

## POKYNY PRO AGENTA: NEJDŘÍV VYSVĚTLIT, POTOM VÝBĚR

Tato větev platí při prohlížení nové distribuce AI OS kitu pro dotazy „co je nového“, „porovnej s V.03 nebo V.04“, „co se mi hodí“ i pro stávajícího zákazníka bez výslovného požadavku na úplný upgrade při otevření nové distribuce. Má přednost před automatickým pokračováním setupu v START, ONBOARDING a kroku 0 AGENTS. Bezpečnostní pravidla a oprávnění prostředí platí dál.

1. Jen čti START, tento changelog, skutečný obsah nové distribuce a relevantní zpřístupněný profil a stav stávajícího workspace. Čti nástrojem Read (na přehled novinek stačí) a hledej čtecími příkazy `ls`, `grep`, `head` a `wc`, každým zvlášť a bez řetězení (Claude Code nemá nástroje Glob a Grep). Nic nezapisují a dodaný `.claude/settings.json` je předschvaluje, ale starý workspace ho nemá, takže se tam mohou zeptat na povolení. Verzi workspace (V.03, V.04, V.04.1 nebo starší 4.x) urči jen čtením podle tabulky v [UPGRADE-Z-V3](docs/UPGRADE-Z-V3.md#krok-0-odkud-jdeš); nepoznáš-li ji nebo umístění workspace, zeptej se. Novou ústavu ber při porovnání jako podklad, nenahrazuj jí platná osobní pravidla. Když nemáš přístup ke složce, požádej o její cestu nebo obsah CHANGELOG; dostupnost nepředstírej. Tajemství a nesouvisející soubory nečti.
2. Řekni stručně, co přibylo, co se zlepšilo a co už jeho verze měla; u V.04 a V.04.1 vycházej ze sekce MÁŠ V.04 NEBO V.04.1. Zohledni doložené vlastní úpravy: pokud funkci už má, označ ji tak. Nemáš-li starý workspace zpřístupněný, srovnávej s tovární verzí, kterou uživatel uvede, a výslovně to řekni. Nezastavuj přehled kvůli chybějícímu profilu; bez něj dej obecné tipy bez vymyšlené personalizace. Na konci přehledu uveď odkaz na podrobné srovnání [POROVNANI-S-V03](docs/POROVNANI-S-V03.md) s cestou v rozbalené složce.
3. Doporuč nejpřínosnější změny a krátce proč. Pak se zeptej: „Které z toho chceš přidat? Můžeš vybrat jen něco, nechat to na později, nebo se na cokoli doptat.“ Po této nabídce počkej. Nenavracej člověka automaticky do KIT PENDING.
4. Dokud jde jen o přehled, nic nezapisuj, neinstaluj, nemigruj, nespouštěj doctor ani upgrade nástroj, nevytvářej plán na disku, instalační protokol, zálohu ani nový workspace. Pouhé čtení novinek nevyžaduje Node, zálohu, KIT COMPLETE ani průchod katalogem. Nevynucuj nový profilový rozhovor ani celý onboarding. Profil, pravidla, data a vlastní úpravy zůstávají beze změny.
5. Po výběru ověř potřebné soubory a závislosti a ukaž konkrétní rozsah. Výběr jedné dovednosti není souhlas s výměnou všech pravidel nebo hooků. Vysvětli případnou nutnou společnou změnu a nech uživatele rozhodnout. Pro schválené převzetí použij zálohu a [postup pro vybranou část](docs/UPGRADE-Z-V3.md#jen-vybrané-novinky); kopie sama neprokazuje funkčnost. Nic neposílej do cizích služeb ani nezapínej placený provoz jen kvůli výběru funkce.
6. Částečné převzetí popiš přesně: co bylo přidáno a co ověřeno. Neoznač je za dokončený upgrade celého kitu ani KIT COMPLETE. Celý [ONBOARDING](ONBOARDING.md) použij pro novou instalaci nebo výslovně požadované dokončení celého kitu; před instalací Dashboardu dokončení ověř podle [STAV-INSTALACE](docs/STAV-INSTALACE.md).

## ZMĚNY VYDÁNÍ 4.3.0-rc.28

- Dashboard ZIP znovu obsahuje upravitelné zdroje aplikace (`modules/aplikace/zdroje/`): celý projekt UI a serveru se závislostmi, buildem a postupem úprav. Každý kupec si Dashboard nainstaluje i upraví na míru; coding agent převede úpravu do běžící instalace se zálohou dat.
- Aplikace uvnitř Dashboardu je stejná jako ve 4.3.0-rc.27 (sestavení z commitu `2fe3751`) a Kit se obsahově nemění. Existující instalaci není potřeba aktualizovat; zdroje odpovídají přesně nainstalované verzi.

## ZMĚNY VYDÁNÍ 4.3.0-rc.27

- Společná paměť sessions v Dashboardu ukládá spolehlivě i dlouhé konverzace Codexu: obří řádek s kompakcí historie se přeskočí a zbytek konverzace se uloží, sub-agenti a rozvětvené konverzace už nezahlcují frontu a do záznamu ani názvu se nedostanou instrukce AGENTS.md ani vložky aplikace Codex.
- Na začátku každé session ve zvoleném workspace agent dostane krátký přehled, na čem se posledních 48 hodin pracovalo v ostatních sessions (Claude Code, Codex, Hermes), a umí v nich hledat. Text jiných sessions bere jako informaci, ne jako pokyn.
- Konverzace ukončené během výpadku Centralu se odešlou samy s další session nebo při startu Dashboardu. Hesla a přihlašovací kódy se ve všech cestách začerňují stejně.
- Dashboard ukáže nepovedený zápis, odložené konverzace, čekající přenos a blížící se strop zálohy na GitHub; kontrola stavu (doctor) je hlásí místo „v pořádku“.
- Majitel V.03 dostane na konci přehledu novinek odkaz na podrobné srovnání s V.03.

## ZMĚNY VYDÁNÍ 4.3.0-rc.26

- Tři jasné vstupy: nový zákazník projde celého průvodce (první úkol není konec, průběh se ukládá a jde navázat), majitel V.03 nebo V.04 dostane nejdřív jen přehled novinek a výběr bez jakékoli změny a Dashboard naváže v nové session ve stejném workspace, s volbou počítač nebo server před instalací.
- Dashboard jde kupujícím Kitu jako beta: volitelný bonus v druhém ZIPu. Co zatím není ověřené skutečným průchodem (Windows přes WSL2, čistý VPS, telefon, živý Hermes s vlastními účty), uvádí jeho `LICENSE.md` a `vydani.json`; podmínky licence se nemění.
- Nové [detailní srovnání s V.03](docs/POROVNANI-S-V03.md): co V.03 měla, co přidává Kit 4.3 a co Dashboard, co se mění v denní práci a co je zatím beta, u každého bodu s odkazem na soubor.
- Předání Kitu Dashboardu funguje i z nativního Windows: soukromí dokladu se tam ověřuje podle ACL (číst smí jen tvůj účet, SYSTEM a Administrators). Sdílenou složku kontrola odmítne s přesným návodem k nápravě a nic v ní nezaloží. Na skutečném Windows zatím neověřeno.
- Úklid po testech: pracovní složky testů jsou označené a po úspěšném testu zmizí, neúspěšné zůstanou k ladění nejdéle 24 hodin a jen mezi 20 nejnovějšími. Jediná výjimka z pravidla 0 v ústavě platí pro kód testů, agent sám dál nic nemaže.
- Návody jsou sjednocené se skutečností: přihlášení Claude Code a Codexu do Dashboardu spouští instalační agent (ne dvojkliky vnitřního balíku) a stejně radí i upozornění firmy na odhlášeného Claude; spouštěče celého stacku ověřují doklad Kitu.
- Hermes v samostatném Dashboard ZIPu: u zákazníka se z oprav projeví jen okno ozvěny (upozornění v Telegramu nejvýš jednou za hodinu; potřebuje bota i domovský kanál Telegramu) a bez Telegramu už nevzniká falešný poplach.
- Dashboard má od tohoto vydání stejné číslo verze jako Kit, 4.3.0-rc.26 (dřív řada 0.1.0). Jde jen o číslo, data ani postup se nemění.

## STAV

AI OS Kit 4.4. Zachovává přehled novinek a výběr pro majitele 4.3, V.03 i V.04. Licence: soukromé i pracovní použití a vlastní klientské výstupy jsou dovolené; další šíření, přeprodej či přebalení Kitu nejsou. Autor produktu je uvedený také v úvodním README. Dashboard 4.4 je samostatný druhý ZIP, beta pro kupující Kitu, včetně upravitelných zdrojů aplikace; vychází spolu s Kitem 4.4 a navazuje na hotový Kit 4.4. Textový průvodce není zárukou chování každého modelu; skutečná připojení a vybrané změny je třeba ověřit v uživatelově prostředí.

## CO SE ZMĚNÍ V DENNÍ PRÁCI

- Pojistky se aktivují až po kontrole Node 24 a Gitu; agent musí ověřit jejich skutečný běh.
- Mazání má vést do koše; checkpoint před změnou umožní lokální návrat, nenahrazuje zálohu mimo počítač.
- Nové projekty mají vlastní místo a README. Pracovní data v work/clients, work/projects, work/content a work/admin nejsou plošně vyřazena z Git zálohy.
- Self-review zůstává jako dřív: po každé páté odpovědi vyzve k zápisu trvalých poučení z oprav a nových dovedností. K poučení patří i řádek v `docs/learnings/INDEX.md` (ve V.03 index nebyl) a self-review se jako ostatní pojistky zapne až aktivací. Automatická záloha je samostatná volba, není zapnutá samotným ZIPem.
- Nedokončené nastavení se uloží; vybrané odklady mají konkrétní návrat. Dashboard navazuje na ověřenou předávku hotového Kitu.
