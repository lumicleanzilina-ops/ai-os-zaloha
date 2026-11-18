# PŘEDÁNÍ — NOVÁ SESSION PRO DASHBOARD

Doporučené jsou dvě pracovní sessions ve STEJNÉM osobním workspace: první projde a nastaví AI OS KIT, druhá převezme jeho hotový základ a přidá Dashboard. Nová session je čistý kontext pro jiný úkol, nikoli nový workspace, nový profil nebo automatická instalace. Pokud uživatel chce pokračovat v jedné session, respektuj to a proveď stejnou předávku a kontrolu ze souborů.

## CO PŘIPRAVÍ PRVNÍ AGENT

Dokonči celý [průvodce kitem](../ONBOARDING.md): projdi celý katalog, aktivně pomoz nastavit užitečné možnosti a ověř všechno zvolené TEĎ v etapě KIT. Požadavky závislé na Dashboardu/Hermesu jsou zaznamenané v etapě DASHBOARD a čekají na ni; nejsou blokátorem hotového kitu. POZDĚJI je platný výslovný odklad podle [STAV-INSTALACE](STAV-INSTALACE.md), nikoli neúspěch nebo ověřená funkce. Uživatelovi ukaž hotové i odložené části.

V JEDINÉM existujícím soukromém protokolu doplň sekci PŘEDÁNÍ DASHBOARDU:

- absolutní cesta osobního workspace, ověřené čisté distribuce KITU, samostatné čisté distribuce DASHBOARDU a tohoto protokolu;
- verze/otisk kitu, konkrétní cesty tří profilů, instrukcí, paměti a prvního výstupu;
- co je ověřeno a jak, co je výslovně ODLOŽENO nebo NEZVOLENO, co ještě blokuje dnešní rozsah;
- uživatelova volba Dashboardu, případný počítač/server, existující instance a místo jejích dat; pokud volba chybí, otevřeně to označ;
- zvolené úkoly druhé etapy včetně serverových rutin, potřebných zdrojů a oprávnění; žádná hesla ani tokeny;
- poslední ověřený krok a jeden další krok pro přijímajícího agenta.

Osobní soubory skutečně ulož, znovu načti a zkontroluj jejich obsah. Když základ funguje, katalog je celý probraný a TEĎ v etapě KIT dokončené, ulož KIT COMPLETE. Na povinnou třetí testovací session nečekej: čerstvé načtení ověří druhá session HNED na začátku, ještě před instalací nadstavby. Pokud už je doložené z předchozího návratu, použij tento důkaz a ověř jen změny.

Zastav vlastní instalační zásahy v první session po bezpečném dokončení právě běžícího kroku. Dva agenti nesmějí souběžně měnit tentýž setup. Rozpracovanou operaci nikdy nepředávej jako hotovou.

## DVA ZIPY, TŘI RŮZNÉ CESTY

AI OS Kit a AI OS Dashboard se stahují a rozbalují samostatně. Osobní workspace je třetí složka. Dashboard ZIP rozbal do nového čistého adresáře vedle distribuce kitu, nikdy přes kit ani zákazníkovu práci. První agent zjistí skutečnou cestu druhého ZIPu, ověří jeho manifest a doplní ji do protokolu. Pokud jej uživatel ještě nemá, uloží čekání na tento konkrétní balík a přesný další krok; funkční kit tím nezneplatní. Cestu ke stažení ani lokální cestu nehádej.

## CO DOSTANE UŽIVATEL

Dej mu konkrétní cestu k jeho workspace a jeden hotový kopírovatelný vstup. V šabloně níže DOSAĎ ověřené absolutní cesty; neposílej uživateli placeholdery k doplnění. Stačí otevřít novou session nad tou samou složkou a vložit připravený text. Ovládání konkrétní appky ověř podle skutečného UI nebo dokumentace, nevymýšlej tlačítka či klávesové zkratky.

```text
Přečti si <OVĚŘENÁ ABSOLUTNÍ CESTA K START.md V DISTRIBUCI DASHBOARDU> a pokračuj podle něj.
Průvodce Dashboardu: <OVĚŘENÁ ABSOLUTNÍ CESTA K NASTAV-MUJ-AI-OS-DASHBOARD.md V DISTRIBUCI DASHBOARDU>
Můj osobní workspace: <OVĚŘENÁ ABSOLUTNÍ CESTA>
Čistá distribuce kitu: <OVĚŘENÁ ABSOLUTNÍ CESTA>
Čistá distribuce Dashboardu: <OVĚŘENÁ ABSOLUTNÍ CESTA>
Můj instalační protokol: <OVĚŘENÁ ABSOLUTNÍ CESTA>
Navazuji druhým průvodcem AI OS Dashboardu. Nejdřív přečti můj protokol,
profil a pravidla, ověř dokončení kitu a pak pokračuj podle uložené volby.
Existujícího Hermese či Dashboard nejdřív zkontroluj; místo provozu, pokud
ho ještě nemám, se mnou vyber před instalací. Zachovej odložené možnosti.
Nezakládej nový workspace ani osobní profil.
```

První START/ONBOARDING čti z ověřené distribuce KITU. Druhý START a instalační Dashboard návod čti z ověřené distribuce DASHBOARDU. Příkazy tools/ai-os.mjs, Windows/server helpery i modules/aplikace/vydani.json patří do pracovního adresáře Dashboard distribuce; nikdy je nehledej v osobním kitu ani kvůli nim nekopíruj oba balíky přes sebe. Uživatelská pravidla a data vždy patří pracovnímu workspace. Uživatel nemusí přepisovat konfiguraci, historii ani vybírat soubory k ručnímu přenosu.

Kit-only uživatel nedostává povinnost začít Dashboard: předej mu stejnou informaci o dokončených a odložených možnostech a vysvětli návrat později. Odložená funkce se znovu otevře na jeho žádost, případně v jím zvoleném termínu; samotný záznam termínu nezakládá automatickou připomínku.

## CO UDĚLÁ DRUHÝ AGENT

1. Ověř skutečné pracovní cesty a přečti existující instrukce, tři profily a tentýž protokol. Nic nedoplňuj odhadem. Chybějící dokument najdi v potvrzeném workspace; nepředpokládej nový systém.
2. Z uložených souborů sám dolož jedno konkrétní osobní pravidlo, prioritu a dohledaný pracovní záznam. Uživatel je znovu nevyplňuje. Ověř všechna kritéria KIT COMPLETE, dnešní rozsah a potřebné aktuální důkazy. Samotný řetězec COMPLETE nestačí. Pokud chybí podklad, oprav pouze konkrétní mezeru a odlož instalaci Dashboardu, ne celý rozhovor od nuly.
3. Zapiš ověření převzetí do stejného protokolu: čas, workspace, zdroje, výsledek a vlastník další práce. V nové session jde o důkaz načtení po předání; při pokračování ve stejné session zaznamenej pouze opětovné načtení, nepředstírej nový host callback.
4. Navazuj [druhým průvodcem Dashboardu](../NASTAV-MUJ-AI-OS-DASHBOARD.md). Použij hotový profil a známý počítač/server; ptej se jen na chybějící volbu, a to před instalací. Existující Hermes či Dashboard nejdřív zkontroluj a druhou instanci slepě nezakládej. ODLOŽENO respektuj. Vyžaduje-li aktuální Dashboard krok odloženou integraci, vysvětli závislost a nech uživatele zvolit její dokončení teď nebo odklad závislé funkce. Dokončení dolož skutečným úkolem a návratem po restartu.

Předávka sama nespouští nový chat, nezakládá účet ani nepovoluje náklady. Otevření nové session musí být doložené skutečnou funkcí použitého prostředí nebo uživatelem; agent je nesmí pouze prohlásit za provedené.

## SESSIONS, KDYŽ MÁŠ KIT I DASHBOARD

Záznam každé session zapisuje jediný writer, a po zapojení Dashboardu je to Dashboard, ne hook kitu. Dva zapisovače vedle sebe dělají duplicity, proto se vrstvy dělí takhle:

| | Jen Kit | Kit a Dashboard (hooky `customer-sessions.mjs` v nastavení hostitele) |
|---|---|---|
| Kdo záznam zapisuje | hook kitu `zaznam-session` | Dashboard; hook kitu na startu řekne „Záznam této session vede Dashboard“ a nezapisuje nic |
| Kam | `<den>-auto-<id8>.md` v `session-logs/` vaultu druhého mozku (`SECOND_BRAIN_VAULT`), jinak v `docs/session-logs/` | `session-logs/desktop/<zdroj>-<hash>.md` ve vaultu Dashboardu (výchozí `<data>/stav/operator-data/vault`; klient na druhém stroji má lokální kopii téhož vaultu) |
| Přehled na startu | hook kitu `kontext-prace` | hook Dashboardu; kit sekci sessions vynechá, otevřené body a repa dál dává |
| `/end-session` | doplní záznam a přepne `stav: zapsano` | záznam nezakládá ani nedoplňuje: shrnutí řekne v chatu, trvalé věci uloží do memories, learningů a `docs/otevrene-body.md` |
| Uzavření dne (noc) | doplní `*-auto-*.md`, zapíše wiki | záznamy Dashboardu jen čte (podklad pro shrnutí dne a wiki) a nepřepisuje je |
| `/brain` a připomínač paměti | hledají v záznamech kitu | hledají i v `session-logs/desktop/` |

**Proč agent do záznamu Dashboardu nepíše:** soubor vlastní jeho writer a při každém zápisu ověřuje, že odpovídá tomu, co sám napsal. Cizí úprava (třeba doplněné shrnutí) vyvolá `canonical-conflict`: další zápis té session se zastaví (původní přepis i pozice čtení zůstanou zachované) a doctor Dashboardu ohlásí chybu. Proto `/end-session` Dashboardový záznam nedoplňuje a nezakládá druhý.

**Jak kit paměť Dashboardu najde.** Sám, bez nastavení: v uživatelském nastavení hostitele (Claude `~/.claude/settings.json`, Codex `~/.codex/hooks.json`) vezme `--data` z příkazu hooku Dashboardu a z `customer-sessions-config.json` v těch datech pole `memory`. Sdílí-li Dashboard vault druhého mozku, stačí složka `session-logs/desktop/` pod `SECOND_BRAIN_VAULT`. Čte jen soubory `claude-code-<hash>.md` a `codex-<hash>.md`, nic nezapisuje.

**Co udělá agent při zapojení Dashboardu:**

1. Cestu k paměti Dashboardu (`--memory` z `customer-sessions.mjs init`) zapíše do jediného instalačního protokolu v sekci předání Dashboardu.
2. Má-li noční uzavření dne záznamy číst bez potvrzení, přidá se souhlasem uživatele tu cestu do `permissions.additionalDirectories` v `.claude/settings.json` (aktivace pojistek ostatní klíče zachová). Bez toho noční běh záznamy Dashboardu nepřečte a do reportu napíše `Dashboard: cesta ke vaultu chybí`.
3. Nezapíná druhý logger a záznamy Dashboardu nekopíruje do vaultu kitu ani je nepřesouvá (jeden soubor na session, žádná kopie). `AICOS_ZAZNAM` nechá, jak je: hook kitu u Dashboardu zapisovat nebude, i když zapnutý zůstane.

## Strojově ověřená předávka Kitu

Po projití celého katalogu a funkčního základu agent připraví soukromý .ai-os/kit-completion.json ve workspace. Nástroj `node tools/kit-completion.mjs template --workspace "<WORKSPACE>"` poskytne pouze PENDING šablonu, nikoli hotové potvrzení. Pro každou z oblastí profile, workspace, rules, skills, integrations, memory, safety, backup a automations agent zaznamená skutečnou volbu a důkaz. Profile/workspace/rules/memory/safety tvoří povinný ověřený základ; paměť může být lokální Markdown, ochrany odpovídají konkrétnímu hostu. Volitelné later mají důvod a nextStep, not-needed důvod. Verified dokládá existující soubor a SHA-256, nikoli tvrzení bez podkladu.

Agent provede `node tools/kit-completion.mjs validate --workspace "<WORKSPACE>"`. Pro server nebo oddělenou distribuci použije `export --workspace "<WORKSPACE>" --output "<NOVA_SOUKROMA_SLOZKA>"` a bezpečně přenese jen uvedený export na vybraný cílový stroj. Export obsahuje osobní důkazy: patří do soukromého prostoru, nikdy do ZIPu, veřejného repa ani chatu. Nevkládej klíče nebo celé vaulty. Dashboard prepare/setup dostane `--kit-completion "<CESTA_K_EXPORTU>"`; uloží ověřený snapshot. Pozdější změny profilu nezruší běžné spuštění.
