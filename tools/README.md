# Nástroje osobního kitu

## Obsah / Struktura
- upgrade.mjs: offline plán a kontrolované změny podle [UPGRADE](../docs/UPGRADE.md). Manifest ověřuje každý přenášený soubor; vlastní ústava a připojení se slučují samostatně. Samostatnou novinku (připomínač paměti) převezme `--apply … --novinky pripominac` včetně souborů, na kterých stojí.
- doctor.mjs: lokální kontrola prostředí a pojistek; skutečný callback v agentovi ověř zvlášť podle [SETUP](../docs/SETUP.md).
- aktivovat-pojistky.mjs: nejdřív náhled, poté výslovné --apply; bezpečně spojí projektové hooky až po skutečném checkpointu. Volba `--jen <hooky>` zapojí jen vybrané hooky (a `cteni` čtecí pravidla) a nic jiného v nastavení nemění.
- kos.mjs: náhled a následný přesun vybraného souboru do koše.
- testove-artefakty.mjs: pomocník pro testy tvých projektů. Pracovní složky testů drží v `work/_test-retained/` projektu; úspěšný test je po sobě uklidí (po Ctrl+C hned), neúspěšný nechá k ladění. Jediná výjimka z pravidla 0 pro kód testů, ne pro agenta.
- beh.mjs: obal pro testy a ověřovací příkazy (npm test, vitest, playwright, pytest, skripty): `node <cesta ke kitu>/tools/beh.mjs -- <příkaz>`. Dá příkazu soukromou označenou dočasnou složku (výchozí kořen `/tmp/aios-<uid>`, v projektu volba `--koren=…/work/_test-retained`); po úspěšném běhu a po Ctrl+C ji smaže, po neúspěšném ji nechá k ladění nejvýš 24 hodin. Nepouštěj jím, co má zůstat běžet (dev server, tunel). Na Windows spouští `.cmd` a `.bat` přes `cmd.exe` (beh-prikaz.mjs); ověřeno je jen simulací na macOS, skutečný běh na Windows ne.
- brain-hledej.mjs: hledání v paměti (wiki vaultu druhého mozku, learningy, záznamy sessions včetně těch, které ukládá Dashboard): `node tools/brain-hledej.mjs "<dotaz>"`. Používá ho dovednost `brain` a hook `brain-pripomen`; jen čte, zapisuje pouze cache indexu do složky stavu mimo workspace.
- zpristupnit-skilly.mjs: zpřístupní dovednosti hostu: `node tools/zpristupnit-skilly.mjs [--nahled | --apply]` založí `.claude/skills/<jméno>` (macOS a Linux symlink, Windows kopie se značkou), takže je Claude Code nabízí jako `/<jméno>` (po `/reload-skills` nebo v nové session). Nic nepřepíše ani nesmaže, existující položky jen ohlásí, `checkpoint` vynechá. Bez přepínače je to náhled.
- kit-completion.mjs: ověření soukromého protokolu a předání Dashboardu.
- time-tracking-extension/: volitelné sledování práce.

## Stav
Node 24 LTS, Git pro checkpoint a zálohy. Zákazník odpovídá v konverzaci; technické příkazy provádí agent. Release/build nástroje výrobce do zákaznického kitu nepatří. Instalační nástroje Dashboardu jsou v jeho samostatném ZIPu.
