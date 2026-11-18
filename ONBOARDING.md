# PRŮVODCE 1 — CELÝ AI OS KIT

ROZSAH: tento celý průchod použij pro novou instalaci nebo výslovně zvolené dokončení celého kitu. Chce-li stávající uživatel jen novinky či vybrané doplňky, použij [CHANGELOG](CHANGELOG.md) a neprováděj kroky níže: samotný přehled nic nezapisuje a nevyžaduje instalační protokol.

Vstup je [START.md](START.md). Toto je úplný průvodce samostatným AI OS kitem 4.4 pro nového i stávajícího zákazníka. Předchozí V.03 ani jiné vydání nejsou potřeba. Nového člověka pozná od začátku; u stávajícího zachová profil a doplní chybějící oblasti. Dashboard má [vlastního průvodce 2](NASTAV-MUJ-AI-OS-DASHBOARD.md) a začíná AŽ po dokončení všech oblastí kitu podle [stavu instalace](docs/STAV-INSTALACE.md). První užitečný úkol je mezikrok, nikoli konec onboardingu.

Veď přirozený rozhovor: jedna chybějící otázka, stručné vysvětlení, tvoje provedení, ukázaný výsledek. Známé odpovědi neopakuj. Základní osobní údaje stačí v potřebné míře; soukromé podrobnosti není nutné sdělovat. Uživatel může přerušit práci: ulož stav PENDING a přesný další krok, neoznač setup za hotový.

## KDYŽ ČLOVĚK ZAČÍNÁ OD NULY

Nečekej znalost V.03, programování, Gitu ani zkratek. Nejprve podle [SETUP](docs/SETUP.md) ověř, že agent může číst místní složku a provádět kroky. Chybějící přístup vysvětli a dej jeden konkrétní další krok podle skutečné aplikace; žádnou instalaci nepředstírej. Lidský začátek před prvním chatem je v [ZACNI-TADY](ZACNI-TADY.md).

První zpráva má stručně vysvětlit: poznáme tvoji práci → připravíme vlastní pracovní složku a první výsledek → projdeme další užitečné možnosti. Pak polož jedinou potřebnou otázku, například „S čím by ti měl tvůj AI parťák nejvíc pomáhat?“ Nezačínej tabulkou technických stavů ani celým katalogem najednou. Místo úrovně programování se ptej na zkušenost s těmito nástroji a přizpůsob tempo.

Pojem vysvětli při prvním použití jednou větou: workspace = tvoje pracovní složka; skill = naučený postup agenta; MCP = propojení s tvým nástrojem; vault = složka poznámek. Další pojmy až ve chvíli, kdy jsou potřeba. „Nevím“ znamená vysvětlit možnosti na příkladu a doporučit další krok, nikoli označit oblast za nepotřebnou. U každé skupiny řekni, kde jsme a co přijde dál; celý katalog postupně dokonči.

Před předáním nech uživatele zadat vlastní malý úkol běžnou řečí a ukaž, kde najde výsledek. Dej mu přesnou cestu pracovní složky, krok otevření podle jeho aplikace ([START §2](START.md#2-připrav-základ)) a větu pro návrat: „Načti můj profil a stav nastavení a pokračuj dalším krokem.“ Při odkladu nemusí pamatovat názvy souborů; návrat řídí uložený protokol. Tento návrat patří i zákazníkovi, který Dashboard nechce.


## POVINNĚ PROJDI CELÝ KATALOG

Cílem je, aby měl uživatel nastaveno co nejvíc věcí, které mu skutečně pomohou. Projdi s ním VŠECHNY dodané oblasti, aktivně doporuč vhodné možnosti a nabídni jejich nastavení rovnou. První snadný úkol není důvod zbytek přeskočit. Uživatel se nesmí o schopnosti, kterou by využil, dozvědět až náhodou později.

Před nabízením příslušné skupiny načti aktuální [CAPABILITIES](docs/CAPABILITIES.md), celý [katalog skills](skills/README.md), [dodané rutiny](scheduled-tasks/README.md), [BLUEPRINTS](scheduled-tasks/BLUEPRINTS.md) a přehled skutečných modulů v README kitu. Nenačítej všechny podrobné SKILL.md a blueprinty před první otázkou; celý inventář postupně dokonči v příslušných skupinách. Porovnej nabídku s dodanými `modules/*/README.md`, `skills/*/SKILL.md` a `scheduled-tasks/*/SKILL.md`; položku chybějící v přehledu také zařaď. Vyjdi z tohoto konkrétního vydání, nepoužívej počet ani nabídku z paměti.

| Oblast, kterou musíš představit | Co konkrétně probrat a nabídnout |
|---|---|
| Člověk, styl a hranice | Práce, role, projekty, cíle, priority, způsob komunikace, oprávnění a tři osobní profily. |
| Workspace a běžná práce | Struktura projektů, inputs/outputs/work, README, místo práce a výsledků, bezpečný upgrade existujícího systému. |
| Plánování a kvalita | Brainstorming, plánování, druhý názor, revize výstupu; kdy agent dovednost použije sám. |
| Byznys a klienti | Nabídky, ceny, funnely, lead magnety, klientský kontext, příprava na hovor a práce s finančními podklady podle dodaných skills. |
| Obsah, dokumenty a značka | Tón podle kanálů, brand-profile, carousely, prezentace, HTML dashboardy, čtení/tvorba a převod dokumentů. |
| Obrázky a další tvorba | [Obrázkový modul](modules/image-generation/README.md), vlastní reference/fotky, dostupné makery a případná video cesta; skutečné závislosti a náklady. |
| Vývoj a vlastní schopnosti | Debugging, UI/UX, MCP, tvorba vlastních skills a práce s kódem; neprogramátorovi vysvětli přínos běžně, nevyřaď oblast odhadem. |
| Všechny kategorie propojení | Pošta, kalendáře, úkoly/CRM, faktury/platby, přepisy, marketing, design, dokumenty, výzkum/web, vývoj/deploy, automatizační nástroje a diktování podle [menu integrací](modules/mcp-integrations/RECOMMENDED-MCPS.md). |
| Paměť a učení | Profil, vlastní learnings, playbook, znalostní báze, Markdown/vault/Tolaria/Obsidian/Notion, ingest, dohledání (dovednost `brain` a připomínač paměti), záznam sessions rovnou ve vaultu a údržba. |
| Všechny dodané rutiny | Ranní briefing, týdenní audit, úklid workspace, uzavření dne, noční záloha a údržba mozku; porovnej s aktuálním katalogem receptů. |
| Celý katalog blueprintů | Denní rytmus/historie, inbox a follow-upy, obchod/peníze, hlídání webů/konkurence/předplatných/novinek, obsahové nápady, učení a reflexe; nabídni všechny konkrétní položky aktuálního BLUEPRINTS po skupinách. |
| Ochrany a údržba systému | Tajemství, mazání, čistý root, checkpoint/obnova, zálohy, scan, ukončení session, self-review a kurátor dovedností. |
| Navazující Dashboard a AI firma | Vysvětli, co přidají. Volbu ulož, instalaci předej samostatnému druhému průvodci až po připraveném kitu. |

Volby se odehrávají PŘÍMO V TOMTO ROZHOVORU s coding agentem. Nejde o formulář v Dashboardu ani ruční editaci protokolu. Například: „Ranní přehled ti může shrnout schůzky a důležité zprávy. Doporučuji ho nastavit. Chceš nastavit teď, nechat na později, nebo ho nepotřebuješ?“ Uživatel přirozeně odpoví a agent volbu zapíše; nemusí použít přesné slovo. Nejasnou odpověď si ověř jednou krátkou otázkou. Možnosti není nutné vypisovat jako technické stavy uživateli.

Skupinu stručně vysvětli na uživatelově práci a řekni, co doporučuješ nastavit teď a proč. Potom dej volby NASTAVIT TEĎ / POZDĚJI / NEPOTŘEBUJI. Lze rozhodnout společně o jasně vyjmenované skupině; nemusí vzniknout desítky potvrzovacích dialogů. Přibalené skills už existují: vysvětli a použij je, neinstaluj je znovu a nezapínej každý do zvláštního placeného účtu. Již známou volbu ani funkční nastavení se znovu neptej.

Do jednoho soukromého protokolu zaznamenej každou skutečně nabídnutou položku nebo jednoznačně vyjmenovanou skupinu, její přínos, volbu a technický stav. Na konci porovnej tento soupis s celým načteným katalogem: nesmí zbýt položka bez nabídky a uživatelova rozhodnutí. Na „pro mě nerelevantní“ musí přijít uživatel, agent to nesmí potichu předpokládat. POZDĚJI ukládá přesný krok návratu a neblokuje dokončení funkčního základu; nikdy se nevydává za zprovoznění. Ticho není volba.

## 0. NAVÁZAT NA SKUTEČNÝ SYSTÉM

Přečti zákazníkovy instrukce, dostupný profil a dosavadní instalační protokol. Zjisti pracovní kořen, čistou distribuci, runtime agenta a skutečný cíl. Nepřebírej cizí identitu. U existujícího systému ověř již dokončené oblasti a doplň pouze chybějící.

- V.03, V.04 nebo V.04.1: před novým nastavením [bezpečný upgrade](docs/UPGRADE-Z-V3.md), u novějšího kitu [UPGRADE](docs/UPGRADE.md). Záloha a konkrétní schválený plán. Zachovat vlastní ústavu, projekty, skilly, integrace a vault. Receipt upgradu dokládá soubory, nikoli dokončení průvodce.
- Nový uživatel: připrav vlastní pracovní kopii v potvrzeném dosud neexistujícím cíli podle [SETUP](docs/SETUP.md) a [workspace modulu](modules/workspace-structure/README.md). Čistý kit ponech čistý. Pokud workspace už existuje, nevytvářej druhý.
- Existující Dashboard/Hermes: zachovej instanci, přihlášení, profil a vypnuté zdroje. Jeho existence není důkaz dokončeného kitu; ověř chybějící oblasti bez vypínání provozu.
- Už vybraný Dashboard nebo server: zaznamenej volbu jako WAITING_FOR_KIT. Dokonči nejdřív tento průvodce; samotný upgrade není zkratkou do druhé etapy.
- Claude Desktop na tarifu Pro (nevíš-li tarif, zeptej se jednou): na začátku jednou větou připomeň, že pod polem pro zprávu jde model přepnout na Sonnet (Mac Cmd+Shift+I). Šetří limit využití, Opus nech na náročné úkoly.

Jediný soukromý protokol a jeho cestu v user-systems udržuj podle [STAV-INSTALACE](docs/STAV-INSTALACE.md). Pro přechod session do kořene workspace připrav přesnou cestu, krok otevření podle hosta (Claude Desktop, nebo terminál; neznáš-li ho, zeptej se jednou) a hotovou první větu se zachovanými volbami, podrobně podle [START §2](START.md#2-připrav-základ).

## 1. POZNAT ČLOVĚKA A JEHO PRÁCI

Použij dosavadní zadání a profil. Postupně doplň: oslovení, role a obor, projekty, priority, pořadí cílů a zdrojů příjmu (podle něj agent určuje, co je důležité, viz [PRIORITIZACE](docs/PRIORITIZACE.md)), co uživateli bere čas či energii, s čím chce pomoci a s kým pracuje (spolupracovníci, kteří dotahují části práce: jméno a role; nemusí být žádní). Podle nich agent na konci odpovědí jmenuje dalšího vlastníka ([závěr odpovědi](docs/PRIORITIZACE.md#závěr-odpovědi-kdo-co-dokončuje)). Nechtěj dlouhý formulář. U každé nové informace ukaž její vztah k užitečné práci; neodhaduj fakta.

Ulož `docs/profil/user-profile.md`. Existující profil v jiné povolené cestě nejdřív přečti a zachovej jeho obsah; slučuj po kontrolovaných změnách. Profil dostupný jen v aplikaci načti podporovanou cestou, chybějící přístup přiznej. Na konci mají být potřebné informace dohledatelné z profilu kitu.

## 2. DOHODNOUT STYL A HRANICE

Zjisti jazyk, stručnost či detail, tón, technickou úroveň, způsob připomínkování a jak má agent nesouhlasit. Pro obsah podle potřeby vyjasni vlastní hlas a brand na skutečných ukázkách: na hlas stačí 5 vlastních textů jednoho kanálu (postup v [tone-of-voice-maker](skills/tone-of-voice-maker/SKILL.md)), víc nežádej. Vše ulož do `docs/profil/user-preferences.md`.

Píše-li agent e-maily za uživatele, zeptej se jednou: „Jak se mám podepisovat, když píšu e-mail za tebe: jen tvým jménem, nebo jménem s řádkem, že píše asistent? A má se to lišit u osobní zprávy jednomu člověku (pozvánka, odpověď známému) a u hromadných či administrativních e-mailů?“ Přesné znění podpisu a výjimku ulož do `user-preferences.md` v sekci „Podpis e-mailů“. Návrh e-mailu agent vždy ukáže a odešle až po výslovném ano; bez uložené volby podepíše jen jménem uživatele.

Prober nepřekročitelné hranice: mazání, přepisování, náklady, zveřejnění a odesílání, přístup k účtům a citlivým datům. Vlastní pravidla promítni do existujících instrukcí, nezahazuj je tovární šablonou. Agent provádí autorizovanou práci, uživatel vybírá rozsah a dokončuje důvěrná přihlášení. Klíče a kódy nepatří do chatu ani Gitu.

Ověř načtení instrukcí v konkrétním agentovi podle [SETUP](docs/SETUP.md). Pouhý soubor na disku neprokazuje načtení ani strojové vynucení.

## 3. PROJÍT NÁSTROJE A DOKONČIT VYBRANÉ INTEGRACE

Prober relevantní kategorie uživatelovy práce: osobní a pracovní pošta, kalendáře, úkoly/CRM, fakturace, schůzky, dokumenty, poznámky, výzkum, obsah a další používané systémy. Ptej se po souvisejících skupinách, ukaž přínos. Nevnucuj nové účty. Zjisti také úkolový nástroj, hlavní prohlížeč, ve kterém je uživatel přihlášený do služeb, a mapu repozitářů a účtů (osobní, firemní, klientské), ať agent ví, kam smí pushovat. Inventář a rozhodnutí ulož do `docs/profil/user-systems.md`.

Zeptej se i na čísla: „Pracuješ s čísly nebo tabulkami, které opakovaně uvádíš nebo potřebuješ (ceny, počty klientů, KPI, reporty)? Kde žijí (tabulka, CRM, účetnictví, platby…)?“ Každou odpověď zapiš jako řádek tabulky v `docs/GROUND-TRUTH.md`: veličina, kanonický zdroj a jak ji z něj získat; ukázkové řádky v kurzívě nahraď skutečnými. Nemá-li uživatel žádná taková čísla, nezapisuj nic. Agent pak čísla bere z uvedeného zdroje a nehádá je.

U každého požadavku určuj etapu KIT nebo DASHBOARD podle cílového runtime, jak stanoví [STAV-INSTALACE](docs/STAV-INSTALACE.md). Všechny části kitu zvolené NASTAVIT TEĎ dokonči nyní; požadavky závislé na budoucím Hermesovi/VPS ulož do druhé etapy s konkrétní návazností, nikoli jako hotové či nezvolené.

Každá služba musí mít volbu NASTAVIT TEĎ, POZDĚJI, NEPOTŘEBUJI nebo zatím NEROZHODNUTO. Dokonči VŠECHNY integrace zvolené TEĎ. Jedna snadná integrace neuzavírá celý inventář. Nerozhodnutý či čekající krok v rozsahu TEĎ drží kit PENDING; výslovné POZDĚJI se stavem ODLOŽENO neblokuje funkční základ. Prázdný výběr je platný pouze jako skutečná volba uživatele po nabídce všech kategorií.

Podle [MCP modulu](modules/mcp-integrations/README.md) ověř aktuální dokumentaci a cílový runtime. Připrav kompatibilní konfiguraci, závislosti a chráněný vstup pro klíč sám; uživatel se přihlásí a rozhodne o přístupu. Cizí MCP/plugin před spuštěním prověř. Uživatel nesestavuje ručně JSON. Ověř konkrétní neškodné čtení ze skutečného agenta; Connected ani uložený JSON nejsou důkaz funkce. Nikdy nesimuluj zákazníkova data.

## 4. WORKSPACE, DOVEDNOSTI A PRVNÍ UŽITEČNÝ VÝSLEDEK

Ukaž vlastní pracovní kořen a [strukturu projektů](modules/workspace-structure/README.md): inputs/, outputs/, work/ a README. Respektuj zabydlenou strukturu.

Dovednosti nejdřív zpřístupni hostu, ať je Claude Code nabízí jako příkazy. Z kořene workspace spusť `node tools/zpristupnit-skilly.mjs` (náhled, nic nezapíše; mimo kořen přidej `--workspace "<WORKSPACE>"`) a po kontrole plánu `node tools/zpristupnit-skilly.mjs --apply`. Nástroj pro každou dovednost založí `.claude/skills/<jméno>` (na macOS a Linuxu symlink, na Windows kopii se značkou), nic nepřepíše ani nesmaže, existující položky jen ohlásí a `checkpoint` vynechá, protože `/checkpoint` je v Claude Code vestavěný alias `/rewind`. Ohlášené položky (cizí složka, odkaz jinam, upravená či zastaralá kopie) ukaž uživateli a rozhodni s ním, nic nepřepisuj. Potom mu řekni, že dovednosti Claude Code nabízí jako `/<jméno>` (stačí napsat `/` a objeví se seznam) a použije je i sám podle popisu; v této session je uvidí po `/reload-skills`, nebo hned v nové session otevřené v kořeni workspace. Výsledek zapiš do protokolu u oblasti dovedností. V jiném hostu než Claude Code (Codex, Cursor…) tento krok vynech a `SKILL.md` otevírej sám.

Pak vyber relevantní dovednosti z [katalogu](skills/README.md), vysvětli, kdy se používají, a jednu použij na skutečný malý úkol: přípravu na schůzku, rozbor podkladu, návrh textu nebo plán.

Výsledek vytvoř, zkontroluj a ukaž s přesnou cestou. Pokud potřebuje chybějící podklad, zjisti jej; nevymýšlej ho. Tento první úspěch doporučeně vytvoř už po základním poznání člověka a nezbytném připojení, nemusíš čekat na celý inventář. Poté se vrať k nedokončeným oblastem kitu. První výsledek není zelený doctor ani prázdná složka profilu a sám neotevírá Dashboard.

## 5. PAMĚŤ, VAULT A VLASTNÍ UČENÍ

Vysvětli rozdíl: profil popisuje uživatele; vlastní learnings ukládají jeho opravy; tovární playbook obsahuje obecné postupy; znalostní paměť drží jeho podklady a poznatky. Nevnášej autorovy osobní learnings. Proveď malý záznam z této práce, ukaž místo uložení a ověř jeho dohledání ze souborů. Nový agent je znovu načte při předávce do druhé session.

Podle [Second Brain](modules/second-brain/README.md) prober existující paměť a výběr: vlastní Markdown složka, dosavadní vault, Tolaria, Obsidian nebo cloudová paměť v Notionu přes dostupnou integraci. Externí aplikace je volitelná; základní osobní paměť musí fungovat. Tolaria a Obsidian mohou prohlížet stejné Markdown soubory; nevytvářej dvě paměti podle názvu aplikace. Vybraný vault zachovej, nový založ jen při potřebě.

U vybrané paměti ověř povolený zápis i čtení skutečné poznámky se zdrojem. Jasně určuj autoritativní místo dat a kam se vracejí změny. Zvolil-li druhý mozek, zeptej se jednou, zda má některý projekt nebo klient zůstat mimo wiki (důvěrný, klientský, vázaný mlčenlivostí); jména ulož do `docs/profil/user-preferences.md` v sekci „Důvěrné projekty“. Noční uzavření dne takové projekty nepovyšuje do stránek wiki ani je nezapisuje do `log.md`. Řekni otevřeně, že automatický záznam každé session (zadání, soubory, commity) vzniká i u takové práce a leží ve složce záznamů; nechce-li ho tam uživatel mít, vypne se proměnnou `AICOS_ZAZNAM=off`. Jednorázový import není průběžná synchronizace. Serverový přenos a paměť Hermese patří až do průvodce Dashboardu.

## 6. BRIEFING A AUTOMATIZACE PODLE UŽIVATELE

Prober všechny dodané rutiny a všechny skupiny blueprintů podle povinného katalogu výše, nejen [ranní briefing](scheduled-tasks/morning-briefing/SKILL.md) a týdenní audit. Zjisti skutečné ranní potřeby a napojené zdroje: které schránky, kalendáře, úkoly, případně peníze či pipeline. Použij jen zvolené zdroje. Když briefing zvolí, nejprve vytvoř skutečný ruční výstup a dolaď jeho délku a obsah.

**V Claude Desktopu (záložka Code) vedeš uživatele podle [postupu pro ranní rutinu](scheduled-tasks/README.md#ranní-rutina-v-claude-desktopu).** Úlohu v appce zakládá on (Scheduled → New task, složka = jeho workspace, Only on this computer, rozvrh), protože je to trvalé nastavení jeho účtu. Ty mu připravíš text instrukcí k vložení nebo větu pro session, počkáš na vytvoření a s ním ověříš Run now a „always allow“. Řekni mu, že lokální úloha běží jen se spuštěnou aplikací a probuzeným počítačem, a nabídni Keep computer awake. Do protokolu zapiš název úlohy, rozvrh a výsledek Run now.

Automatický běh nastav podle zvolené frekvence, času, časové zóny a místa doručení. Ověř skutečný dostupný plánovač a jeho spuštění, ne pouhou existenci receptu. Nečekej kvůli ověření týdenní rutiny až do jejího běžného termínu: použij podporované testovací spuštění téhož jobu v témže plánovači a runtime, případně krátký dočasný termín. Zachovej původní rozvrh, po testu obnov uživatelův termín a ověř jeho uložení; ulož doklad běhu i finálního nastavení. Samotné ruční spuštění skillu mimo plánovač nestačí. Test nesmí bez autorizace odesílat nebo zveřejňovat výstupy. Je-li jediný možný plánovač součástí budoucího Hermese/VPS, patří jeho běh výslovně do druhé etapy; v kitu ověř obsah a potřebné zdroje, runtime zatím označ ČEKÁ podle stavové smlouvy. Existující automatizaci uprav, nevytvářej druhou. Nepodporovanou automatizaci přiznej a vyřeš volbu dalšího postupu; nezapínej kvůli ní Dashboard před dokončením kitu. Všechny rutiny zvolené TEĎ musí být ověřené. Uživatel může i dříve vybranou rutinu výslovně odložit: zapiš ODLOŽENO a přesný krok návratu. To neblokuje dokončení kitu; rutina ale nesmí být uvedená jako funkční.

## 7. POJISTKY, ZÁLOHA A OBNOVA

Podle [SETUP](docs/SETUP.md) zprovozni podporované pojistky: oprávnění, ochranu tajemství, checkpointy, ochranu před nechtěným mazáním a kontext. Nástroje kitu vyžadují Node 24, checkpoint a git pojistky také Git. Existující .claude/settings.json a git hooky zachovej a bezpečně sluč; tovární konfigurace je nesmí přepsat.

Self-review mlčí, dokud kit není dokončený (protokol nemá řádek `KIT: COMPLETE`), aby blok „Stop hook feedback“ neplašil během nastavování. Po KIT COMPLETE může každé páté ukončení odpovědi spustit self-review: agent ještě jednou projde session a zapíše trvalá poučení z oprav nebo novou dovednost, případně odpoví [SKIP]; není to zamrznutí. Pro automatický neinteraktivní běh je možné nastavit AICOS_REVIEW_EVERY=off. Uživatel musí vědět, že stažené soubory samy ochrany nespustí.

Workspace doctor a self-checks-passed jsou lokální kontroly. Host callback ověř v cílovém Claude Code; v jiném agentovi neslibuj běžící Claude hooky. Ověření používá izolovanou fixture a syntetické tajemství, ne skutečné mazání. Nepodporovaný požadavek zůstává otevřený, dokud se neověří podporovaná cesta nebo uživatel nepotvrdí konkrétní omezený rozsah podle [stavové smlouvy](docs/STAV-INSTALACE.md).

Vysvětli [zálohu](modules/github-backup/README.md) a její rozsah, zvlášť workspace a externí vault. Podle volby připrav soukromý Git nebo existující způsob; tajemství a ignorované soubory nejsou běžnou Git zálohou pokryté. Potvrzený push dokládá odeslání, obnovu z čisté kopie ověř zvlášť. Nevybranou službu zaznamenej s dopadem; neoznačuj ji za spuštěnou.

## 8. ULOŽIT PROFILY, OVĚŘIT NÁVRAT A PŘEDAT KIT

Zkontroluj všechny tři profily, vlastní instrukce a jediný protokol. Osobní údaje, pravidla, záznam paměti a výstup skutečně ulož a znovu načti ze souborů. Porovnej seznam nabídnutých položek s celým katalogem, aby žádná nezmizela. Ukaž přehled NASTAVENO A OVĚŘENO / ODLOŽENO NA POZDĚJI / NEPOTŘEBUJI / ZBÝVÁ V ROZSAHU TEĎ. Nech potvrdit, že rozsah odpovídá dohodě. Neoznač odklad za chybu ani za hotovou funkci.

Při fungujícím osobním základu, celém projitém katalogu a ověřeném rozsahu TEĎ v etapě KIT uzavři KIT COMPLETE podle [stavové smlouvy](docs/STAV-INSTALACE.md): do protokolu zapiš řádek `KIT: COMPLETE`, podle něj přestane self-review mlčet. Výslovně odložené možnosti zůstanou s přesným krokem návratu ve stejném protokolu. Nepřekrývej jimi nevyřešený krok, který uživatel stále chce TEĎ.

Průvodce 1 tím končí. Uživatel může dál pracovat s kitem bez Dashboardu, Hermese nebo VPS. Pokud chce Dashboard, DOPORUČ NOVOU SESSION VE STEJNÉM WORKSPACE podle [PŘEDÁNÍ DASHBOARDU](docs/PREDANI-DASHBOARDU.md). Připrav předávku ve stávajícím protokolu a hotový kopírovatelný vstup s ověřenými cestami. První krok nové session ověří načtení pravidel, profilu a paměti; potom rovnou naváže [průvodcem 2](NASTAV-MUJ-AI-OS-DASHBOARD.md). Žádná třetí povinná testovací session, žádný nový osobní dotazník. Když uživatel preferuje stejnou session, pokračuj v ní po stejné kontrole ze souborů a čerstvou session nevydávej za ověřenou.

## PRŮBĚŽNÉ VEDENÍ

Na dotaz odpověz a vrať se k poslednímu ověřenému kroku. Dej jeden další krok; při nejistém UI ověř skutečnou obrazovku nebo dokumentaci, nevymýšlej navigaci. Udržuj protokol, aby přerušení nebo nový chat pokračovaly na stejném místě. Dokončení zákazníkova kitu neprohlašuje celý release za veřejně ověřený na všech platformách.
