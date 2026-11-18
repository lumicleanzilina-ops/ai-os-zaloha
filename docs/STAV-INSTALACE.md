# STAV INSTALACE — KIT AŽ POTOM DASHBOARD

Toto je smlouva pro instalačního agenta, nikoli hotový zákaznický záznam. [Průvodce 1](../START.md) nastavuje celý kit podle [ONBOARDING](../ONBOARDING.md). [Průvodce 2](../NASTAV-MUJ-AI-OS-DASHBOARD.md) smí začít instalovat Dashboard až po ověření dokončeného kitu.

## JEDEN SOUKROMÝ PROTOKOL

Použij existující instalační protokol v zákazníkově workspace. Pokud není, vytvoř jediný soubor `docs/plans/ai-os-instalace.md` v JEHO pracovní kopii, nikoli v čisté distribuci. Jeho cestu ulož do `docs/profil/user-systems.md`. Nevytvářej druhý logger ani další profil. Tajemství, přihlašovací kódy a tokeny do záznamu nepatří.

Záznam obsahuje:

- workspace, cestu k čisté KIT distribuci, verzi a otisk jejího manifestu; je-li dostupná, také cestu, verzi a otisk samostatné DASHBOARD distribuce; prostředí agenta a datum posledního ověření;
- `KIT: PENDING` nebo `KIT: COMPLETE` a oblast právě řešeného kroku; stav piš na samostatný řádek v tomto tvaru (smí mít odrážku, tučné písmo nebo krátký popisek, třeba `**Stav:** KIT: COMPLETE`) a při změně rozsahu připiš pod něj nový řádek `KIT: PENDING`; starý `KIT: COMPLETE` neměň ani nemaž. Podle posledního takového řádku pozná hook self-review a připomínač paměti, že instalace běží, a do `KIT: COMPLETE` mlčí;
- tabulku všech oblastí níže a úplný soupis nabídnutých možností podle [ONBOARDING](../ONBOARDING.md): zdrojová položka, vysvětlený přínos, uživatelova volba, skutečný stav, důkaz/cesta a další krok; společně probranou skupinu lze zaznamenat jedním řádkem s výčtem jejích položek;
- u každé možnosti oddělenou volbu NASTAVIT TEĎ / POZDĚJI / NEPOTŘEBUJI (nebo dosud NEROZHODNUTO), etapu KIT nebo DASHBOARD a cílové prostředí; POZDĚJI zachovává zájem, ale vyjímá konkrétní funkci z dnešního dokončení;
- `DASHBOARD: NOT_SELECTED / WAITING_FOR_KIT / PENDING / COMPLETE`, případnou předem zvolenou variantu počítač/server a existující instanci;
- první užitečný výstup, ověření uložených souborů, předávku podle [PREDANI-DASHBOARDU](PREDANI-DASHBOARDU.md) a právě jeden další krok. Zkouška načtení v nové session proběhne při zahájení druhé etapy, není potřeba třetí povinná session.

Technické stavy řádků: `OVĚŘENO`, `ODLOŽENO`, `NEZVOLENO`, `ČEKÁ`, `NEOVĚŘENO`, `NEPODPOROVÁNO`, `CHYBA`.

- NASTAVIT TEĎ: agent nastaví a ověří; nehotový nebo neznámý krok aktuální etapy drží PENDING.
- POZDĚJI: výslovná uživatelova volba, technický stav ODLOŽENO. Ulož konkrétní nedokončenou funkci, důvod nebo závislost a přesný první krok návratu; případný termín jen pokud ho uživatel určil. Odklad NEBLOKUJE dokončení použitelného kitu ani přechod k Dashboardu. Není to OVĚŘENO ani NEPOTŘEBUJI. Dříve zvolené TEĎ lze takto vědomě odložit.
- NEPOTŘEBUJI: výslovná volba konkrétní volitelné možnosti, stav NEZVOLENO; znovu ji nenabízej jako povinnost.
- NEROZHODNUTO, ticho nebo odhad agenta nejsou odklad ani souhlas s vynecháním. Agent nesmí sám odložit náročnější část, aby setup rychleji uzavřel. Celé projití nabídky a funkční osobní základ přeskočit nelze; konkrétní volitelnou funkci ano. Když chce uživatel přerušit celý rozhovor, ulož PENDING.

Při návratu k odložené možnosti znovu ověř aktuální stav a dokonči ji. Neměň hotovou instalaci ostatních částí a neopakuj osobní rozhovor. Odložené propojení se nesmí použít jako závislost jiné funkce bez jeho zprovoznění; například nenapojená pošta nemůže být ověřeným zdrojem briefingu.

## CO ZNAMENÁ CELÝ KIT

| Povinně projít a uzavřít | Důkaz dokončení |
|---|---|
| Vlastní workspace a upgrade | Jediný potvrzený pracovní kořen, zachované vlastní soubory a data, dokončený bezpečný upgrade, pokud byl potřeba; uživatel zná místo projektů a výstupů. |
| Člověk, cíle, styl a hranice | Ověřené `user-profile.md`, `user-preferences.md`, `user-systems.md` v docs/profil/; žádné osobní odhady. Neposkytnuté volitelné údaje výslovně zaznamenané. Vlastní pravidla načtená agentem. |
| Pracovní postupy a dovednosti | Dovednosti jsou zpřístupněné hostu (`node tools/zpristupnit-skilly.mjs --apply`, výsledek v protokolu) a uživatel ví, že je Claude Code nabízí jako `/<jméno>`; v hostu bez příkazů s lomítkem agent otevírá `SKILL.md` sám. Agent použil vhodný skill na skutečnou práci, výsledek je uložený a zkontrolovaný. Uživatel ví, jak úkol zadat a kde výsledek najít. |
| Inventář nástrojů a integrace | Všechny dodané kategorie probrané, každá služba má rozhodnutí. VŠECHNY integrace zvolené TEĎ ověřené neškodným čtením ve skutečném agentovi; ostatní výslovně ODLOŽENO nebo NEZVOLENO. Prázdný výběr je možný. |
| Paměť a učení | Funguje vlastní profil, zápis do paměti a dohledání uloženého záznamu ze souborů; při předávce znovu načtené přijímajícím agentem. Vybraný externí vault/Tolaria/Obsidian či Notion zachovaný a ověřený, nebo výslovně odložený či nezvolený. Uživatel zná rozdíl mezi vlastními learnings a továrním playbookem. |
| Automatizace a briefing | Probrané všechny dodané rutiny i konkrétní možnosti blueprintů. Zvolené TEĎ ověřené skutečným běžícím plánovačem a jeho spuštěním; ostatní výslovně odložené či nezvolené. Ruční briefing není automatický běh. V Claude Desktopu je důkazem úloha v seznamu Scheduled (název, složka, rozvrh, Only on this computer) a úspěšný Run now s uloženým výstupem podle [postupu pro ranní rutinu](../scheduled-tasks/README.md#ranní-rutina-v-claude-desktopu); uživatel ví, že lokální úloha běží jen se spuštěnou aplikací a probuzeným počítačem. |
| Pojistky a záloha | Podporované pojistky zvolené TEĎ zapojené a ověřené v hostu, jasná pravidla práce s tajemstvími a oprávněními. Zálohu zvolenou TEĎ pro workspace i externí vault ověřit odesláním i obnovou zvlášť; jinak výslovně odložena či nezvolena s vysvětleným dopadem. |
| Předání a pokračování | Rekapitulace hotových oblastí, skutečný výstup, přesné cesty. Profily, pravidla, výstup i protokol zapsané a znovu přečtené ze skutečných cest. Při zvoleném Dashboardu a dostupné ověřené distribuci připravený vstup do doporučené nové session podle PREDANI-DASHBOARDU; jinak konkrétní krok získání druhého ZIPu nebo návratu později. Chybějící či nezvolený Dashboard KIT COMPLETE neblokuje. Uživatel rozumí dalšímu použití a potvrdil rekapitulaci rozsahu. |

Celý kit nevyžaduje všechny placené služby, všechny MCP, externí vault ani automatizaci. Vyžaduje celý rozhovor, funkční osobní základ a dokončení všech částí zvolených TEĎ; výslovně odložené funkce zůstávají viditelně nedokončené. Hermes a Dashboard patří do druhé etapy; jejich předem zvolená instalace sama neblokuje dokončení první. Požadavek závislý na této nadstavbě (například briefing přes Hermese na VPS při vypnutém notebooku) eviduj výslovně v etapě DASHBOARD jako ČEKÁ. V kitu připrav a ověř potřebný obsah, zdroje a osobní pravidla; serverový běh ověří teprve druhý průvodce. Není to nezvolená služba ani hotová funkce. Požadavek patřící existujícímu kitu nesmíš svévolně přesunout do druhé etapy jen kvůli obejití podmínky; rozdělení vysvětli a zaznamenej v dohodnutém rozsahu.

Pojistky Claude Code nemusejí běžet v jiném agentovi. `self-checks-passed` není host callback. Nepodporovanou funkci označ NEPODPOROVÁNO, vysvětli konkrétní omezení a ověř dostupnou náhradu. Je-li původní funkce požadavkem pro TEĎ, zůstává KIT PENDING až do ověření v podporovaném prostředí nebo uživatelova výslovného odkladu volitelné funkce. Nefunkční osobní základ odkladem nezprovozníš. Jestli přijme omezený rozsah, zaznamenej přesnou volbu a její dopad; nikdy nepřepiš nefunkční hook na OVĚŘENO.

## KONTROLA PŘED DRUHÝM PRŮVODCEM

1. Z user-systems načti protokol a ověř, že patří právě tomuto workspace a uživateli. Chybí záznam? Zkontroluj existující kit a doplň jej z důkazů; nezačínej automaticky nový systém ani osobní dotazník.
2. Ověř tabulku a aktuální důkazy. Samotný řádek KIT COMPLETE, úspěšný upgrade receipt `complete`, zelený doctor, hotový profil, první úkol ani dokončené UI Dashboardu nestačí. Změněný rozsah nebo neplatný důkaz kroku v etapě KIT vrací dotčený krok na ČEKÁ/NEOVĚŘENO a KIT na PENDING. Čekající krok etapy DASHBOARD tím první etapu znovu neotevírá.
3. Chybí projitá položka katalogu, funkční základ nebo krok zvolený pro TEĎ v etapě KIT? Zapiš Dashboard WAITING_FOR_KIT, zachovej jeho případnou volbu a vrať se k prvnímu chybějícímu kroku [ONBOARDING](../ONBOARDING.md). Zatím neinstaluj Dashboard, Hermese ani serverovou nadstavbu. Existující běžící instanci nevypínej ani nepřepisuj.
4. Všechny oblasti projité, volby zaznamenané, základ a rozsah TEĎ v etapě KIT ověřené? Ulož KIT COMPLETE s datem, viditelným seznamem ODLOŽENO a připravenou předávkou. COMPLETE znamená dokončené dnešní nastavení po celém průvodci, nikoli zapnuté všechny možnosti. Doporuč [novou session ve stejném workspace](PREDANI-DASHBOARDU.md); po její vstupní kontrole pokračuj podle [druhého průvodce](../NASTAV-MUJ-AI-OS-DASHBOARD.md). Původní profil, pravidla, workspace a vybrané zdroje předej jako vstup, nikoli jako otázky k novému vyplnění.

Dashboard si vlastní technické podkroky drží v `/__operator/setup/progress`. Tento stav nedokazuje dokončený kit. Soukromý protokol na něj pouze odkazuje, nepřepisuje interní doklady aplikace. Dashboard COMPLETE vyžaduje ověřené funkce nadstavby zvolené TEĎ podle jejího průvodce; výslovně odložené zůstanou viditelně ODLOŽENO a připravené k návratu.

Pořadí kontroluje instalační agent i technická brána kit-completion. UI aplikace samo úplnost kitu nedokazuje.

## Strojově ověřená předávka Kitu

Po projití celého katalogu a funkčního základu agent připraví soukromý .ai-os/kit-completion.json ve workspace. Nástroj `node tools/kit-completion.mjs template --workspace "<WORKSPACE>"` poskytne pouze PENDING šablonu, nikoli hotové potvrzení. Pro každou z oblastí profile, workspace, rules, skills, integrations, memory, safety, backup a automations agent zaznamená skutečnou volbu a důkaz. Profile/workspace/rules/memory/safety tvoří povinný ověřený základ; paměť může být lokální Markdown, ochrany odpovídají konkrétnímu hostu. Volitelné later mají důvod a nextStep, not-needed důvod. Verified dokládá existující soubor a SHA-256, nikoli tvrzení bez podkladu.

Agent provede `node tools/kit-completion.mjs validate --workspace "<WORKSPACE>"`. Pro server nebo oddělenou distribuci použije `export --workspace "<WORKSPACE>" --output "<NOVA_SOUKROMA_SLOZKA>"` a bezpečně přenese jen uvedený export na vybraný cílový stroj. Export obsahuje osobní důkazy: patří do soukromého prostoru, nikdy do ZIPu, veřejného repa ani chatu. Nevkládej klíče nebo celé vaulty. Dashboard prepare/setup dostane `--kit-completion "<CESTA_K_EXPORTU>"`; uloží ověřený snapshot. Pozdější změny profilu nezruší běžné spuštění.
