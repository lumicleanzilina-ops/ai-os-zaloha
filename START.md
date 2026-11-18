# PRŮVODCE 1 — AI OS KIT

Lidský začátek je v [ZACNI-TADY](ZACNI-TADY.md). Toto je rozcestník pro instalačního agenta. Kit funguje samostatně, bez Dashboardu, Hermese a serveru.

## 1. ROZLIŠ ZÁMĚR
Použij známé informace a to, co uživatel napsal. Není-li situace jasná, polož jednu otázku: „Začínáš s AI OS poprvé, nebo už máš svou pracovní složku a chceš novinky či pokračovat?“
- Stávající zákazník (V.03, V.04, V.04.1 nebo starší 4.x) bez výslovné žádosti o celý upgrade či setup, nebo dotaz „co je nového“: přečti jen tento START a [CHANGELOG](CHANGELOG.md) a ze stávajícího workspace jen to, co potřebuješ k porovnání. Čti nástrojem Read (na přehled novinek stačí) a hledej čtecími příkazy `ls`, `grep`, `head` a `wc`, každým zvlášť a bez řetězení (Claude Code nemá nástroje Glob a Grep). Nic nezapisují a dodaný `.claude/settings.json` je předschvaluje, ale starý workspace ho nemá, takže se tam mohou zeptat na povolení. Verzi poznáš čtením podle tabulky v [UPGRADE-Z-V3](docs/UPGRADE-Z-V3.md#krok-0-odkud-jdeš); když ji nebo umístění workspace nepoznáš, zeptej se. Vysvětli, co je pro jeho verzi nové, a nabídni výběr. Dokud si nevybere, nic nezapisuj, neinstaluj ani nekopíruj, nevytvářej protokol, zálohu ani nový workspace a nespouštěj doctor, upgrade ani onboarding. Profil, pravidla, data a vlastní úpravy zůstávají beze změny. Částečná volba patří do [vybraných novinek](docs/UPGRADE-Z-V3.md#jen-vybrané-novinky).
- Rozdělané nastavení: načti vlastní pravidla, profil a jediný soukromý protokol; pokračuj nedokončeným krokem. Známé odpovědi nezjišťuj znovu.
- Nová instalace nebo výslovná žádost o celý setup: pokračuj níže a projdi celý průvodce až do konce. V.03 ani jiná předchozí verze není potřeba.

## 2. PŘIPRAV ZÁKLAD
Načti platná pravidla a úvod [ONBOARDING](ONBOARDING.md). Hned na začátku, v první odpovědi a ještě před dalšími kroky, zjisti skutečného hosta a tarif jednou otázkou, ne postupně. Je-li host Claude Desktop na tarifu Pro (nevíš-li tarif, zeptej se jednou), jednou větou připomeň, že pod polem pro zprávu jde model přepnout na Sonnet (Mac Cmd+Shift+I): šetří limit, Opus nech na náročné úkoly. Potom podle [SETUP](docs/SETUP.md) ověř souborový přístup, Node 24 a Git. Potřebné instalace proveď v povoleném rozsahu; uživateli ponech jeho důvěrné přihlášení a potřebná systémová potvrzení. Závislosti připrav před aktivací checkpointů. Novému zákazníkovi vytvoř vlastní pracovní kopii v dosud neexistující složce `AI-OS` přímo v jeho domovské složce (Mac `~/AI-OS`, Windows `C:\Users\<jméno>\AI-OS`) a umístění s ním potvrď. Ne v Ploše ani v Dokumentech: ty se mohou synchronizovat do iCloudu či OneDrive a první snapshot potřebuje soubory skutečně uložené na disku. Zálohu neřeš synchronizací složky (iCloud, OneDrive, Dropbox), ale kitem: Git a soukromé GitHub repo podle [modulu zálohy](modules/github-backup/README.md). Hned v nové složce založ jediný soukromý protokol podle [STAV-INSTALACE](docs/STAV-INSTALACE.md): KIT PENDING, hotové kroky a právě jeden další krok.

Potom doporuč pokračovat v nové session otevřené přímo v kořeni workspace a v téže odpovědi dej uživateli tři hotové věci, nic nenech na něm k doplnění:
1. Absolutní cestu workspace.
2. Přesný krok otevření podle jeho aplikace. Hosta poznej z prostředí a z toho, co uživatel napsal; neznáš-li ho, zeptej se jednou: „Používáš Claude Desktop, nebo terminál?“ Claude Desktop: v záložce Code klikni v postranním panelu na + New (Cmd+N na Macu, Ctrl+N na Windows), pod polem pro zprávu zvol prostředí Local a ve výběru složky Open folder… vyber workspace (výběr složky stejně jako v [ZACNI-TADY](ZACNI-TADY.md)). Terminál: v terminálu otevřeném ve složce workspace spusť `claude`. Jiný host (Codex, Cursor…): krok ověř v jeho dokumentaci nebo podle screenshotu a nehádej klikání. Větu „nemám ověřeno, jak to otevřít“ nepoužívej: když hosta neznáš, zeptej se.
3. První větu pro novou session s dosazenou cestou: „Pracovní složka je <ABSOLUTNÍ CESTA>. Načti můj profil a stav nastavení a pokračuj dalším krokem.“

Chce-li zůstat v této session, pracuj s workspace přes absolutní cesty a přechod udělej nejpozději před aktivací pojistek; ty ověřuj jen v session z kořene workspace. Existující workspace zachovej. Tovární distribuci nepersonalizuj.

## 3. VEĎ ČLOVĚKA PO KROCÍCH
Pokračuj [ONBOARDING](ONBOARDING.md). Načítej podrobné podklady až pro právě řešenou oblast. Postupně projdi CELÝ skutečný katalog skills, modulů, rutin a blueprintů; žádnou oblast sám nevyřaď. Jedna potřebná otázka → krátké vysvětlení → provedení → skutečný výsledek. Technické kroky provádíš ty; uživatel dělá jen výběr, přihlášení a souhlas. Volby Nastavit teď / Později / Nepotřebuji probíhají přímo v tomto rozhovoru. Agent je zapisuje do [jediného soukromého protokolu](docs/STAV-INSTALACE.md) hned po každé oblasti, aby přerušení nebo nová session navázaly na stejném místě. Při přechodu mezi skupinami řekni, kde jste a co přijde dál.

První užitečný výstup vytvoř během průchodu; neukončuje nastavení. Každé TEĎ dokonči a ověř. Výslovné POZDĚJI má důvod a konkrétní návrat, neblokuje dokončení použitelného kitu, ale není funkčním propojením. Nevysvětlená možnost, nerozhodnutý bod nebo nefunkční základ znamená KIT PENDING.

## 4. OVĚŘ A PŘEDEJ
Zkontroluj celý inventář a skutečné soubory podle [STAV-INSTALACE](docs/STAV-INSTALACE.md). Ulož a znovu načti profil, pravidlo, paměť a výstup. Zelený doctor ani samotný řetězec COMPLETE nedokazují dokončení Kitu.

Až po KIT COMPLETE připrav ověřený soukromý doklad .ai-os/kit-completion.json podle stavové smlouvy. Volitelný Dashboard je druhý ZIP (Dashboard 4.4, beta pro kupující Kitu, obsahuje i upravitelné zdroje aplikace) a navazuje na hotový Kit 4.4. Připrav [předání](docs/PREDANI-DASHBOARDU.md) do doporučené NOVÉ SESSION VE STEJNÉM WORKSPACE. Na přání lze pokračovat ve stejné; žádný nový profilový dotazník. Kit bez Dashboardu zůstává plně použitelný.

Při přerušení ulož jeden další krok a dej uživateli přesnou cestu workspace, krok otevření podle jeho aplikace (viz §2) a větu pro návrat: „Načti můj profil a stav nastavení a pokračuj dalším krokem.“ Na otázku odpověz, vysvětli nový pojem a vrať se k poslednímu ověřenému kroku. Navigaci v aplikaci ověř podle skutečné obrazovky nebo dokumentace; nevymýšlej klikání.

## POKRAČOVÁNÍ A POMOC

Na vedlejší otázku krátce odpověz a vrať se k poslednímu ověřenému kroku. Vedlejší nápad ulož jako poznámku do soukromého protokolu. Výslovné přerušení, odložení, stop nebo změnu cíle respektuj. Ulož stav a další krok; dokončené kroky neopakuj.

Pro navigaci použij dostupný browser nástroj nad skutečnou kartou zákazníka a v povoleném rozsahu na jeho zařízení. Samostatný prohlížeč agenta nesdílí automaticky účet ani obrazovku zákazníka. Nemáš-li přístup, vyžádej aktuální screenshot. Nepředstírej, že vidíš obrazovku; ukaž jeden další klik a zkontroluj výsledek. Hesla, tokeny a přihlašovací kódy nezachycuj do screenshotu, nevypisuj ani neukládej do protokolu.
