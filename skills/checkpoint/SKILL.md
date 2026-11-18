---
name: checkpoint
description: Vypiš, prohlédni a obnov automatické snapshoty workspace. Použij při požadavku na návrat změny, obnovu souboru či kontrolu změn.
---

# CHECKPOINT — OVĚŘENÁ OBNOVA SOUBORU

Node akce checkpoint přes hooks/entry.mjs pořizuje snapshot před Edit/Write/MultiEdit a konzervativně před každým Bash/PowerShell voláním. Přímý vstup je hooks/checkpoint.mjs; .sh je pouze POSIX/Git Bash wrapper. Samotná přítomnost registrace není důkaz funkčnosti.

## ZJISTI SKUTEČNOU CESTU

Spusť node tools/doctor.mjs --workspace <absolutní workspace> --receipt <JSON mimo workspace>.
Z receiptu přečti workspace a checkpointLocation. NEDOPOČÍTÁVEJ cestu ze shellového cwd nebo holého CLAUDE_PROJECT_DIR: session může začínat v podprojektu. Doctor používá root rozpoznaný v ancestry. Pokud nezjistí root, nepředstírej existenci checkpointu.

State root je AICOS_STATE_DIR, pokud je nastavený, jinak uživatelský .claude/aicos.
Uvnitř: checkpoints/<workspace-basename>-<12 znaků SHA1 normalizované root cesty>.git.
Tento formát zachovává historickou cestu při nezměněném rootu. Přesun/přejmenování workspace vytvoří jiné jméno; původní snapshoty se nemažou.

## POSTUP

1. Ověř, že checkpointLocation existuje, a čti skutečný log: git --git-dir="<checkpointLocation>" --work-tree="<workspace>" log --oneline -20.
2. Ukaž konkrétní diff proti nalezenému commitu. Git argumenty předávej odděleně/ocitované; mezery a Windows cesty nejsou výjimka.
3. Obnov primárně jeden soubor z výslovně vybraného snapshotu. Nejprve zachovej jeho aktuální obsah mimo workspace a ukaž, co se přepíše. Git checkout <commit> -- <path> použij jen v autorizovaném rozsahu; neslibuj, že nový checkpoint právě běží bez receiptu.
4. Po obnově přečti soubor a dolož výsledek. Aktuální vlastní Git historii neměň. Před obnovou celého stromu dolož inventář a zálohu; požadavek na jeden soubor neopravňuje přepis celého workspace.
5. Neodstraňuj snapshot, shadow repo ani fixture. Úklid jen podle výslovného uživatelova rozhodnutí a do koše.

## HRANICE

Gitignore obsah a obsah vložených Git repozitářů nejsou tímto shadow snapshotem chráněné. Ochrana citlivého obsahu má přednost: známý credential pattern zabrání shadow commitu. Git/scan chyby se nepovažují za úspěch; běžící critical callback odmítne editaci.

Doctor ověřuje preflight, inertní guard a config spawn marker. Neprovádí snapshot/restore skutečného workspace ani callback klienta; pro tvrzení „checkpoint funguje“ potřebuješ skutečný snapshot commit a ověřenou obnovu.

Pokud cesta neexistuje, chybí první úspěšný snapshot, root se přesunul, hook je vypnutý/neaktivní nebo selhal. Zkontroluj receipt a klientský debug výsledek; standardní Git historii lze nabídnout pouze pro skutečně trackované soubory.
