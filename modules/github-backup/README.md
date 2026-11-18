# Modul: Záloha na GitHub

Modul zálohuje verzované soubory zákaznického workspace a volitelného vaultu do uživatelem schváleného privátního repozitáře. Je to Git záloha; ignorované soubory, credentials a vložená repa potřebují samostatnou zálohu. Stažený kit ani jeho čistá kopie nejsou záloha osobních dat.

## NASTAVENÍ A OVĚŘENÍ

Agent nejdřív ověří aktivní GitHub účet, zamýšlený privátní remote, větev a rozsah souborů. Přihlášení a oprávnění patří konkrétnímu uživateli. V existujícím workspace nesmí přepsat origin nebo založit druhý systém bez kontroly. Node 24 LTS a Git jsou podmínkou.

Před prvním push musí být credentials mimo Git a musí proběhnout scanner. `.gitignore` ani privátní repo nejsou důkaz, že tajemství není verzované; již uniklou hodnotu je třeba rotovat. Git hooks nastaví agent podle [SETUP](../../docs/SETUP.md), ověří chování a výsledek zaznamená.

Jednorázový běh z kořene workspace:
```bash
node modules/github-backup/backup.mjs
```
Explicitní adresáře předá agent jako samostatné ABSOLUTNÍ argumenty v uvozovkách. Bez argumentů se použije workspace plus `SECOND_BRAIN_VAULT`, nebo nakonfigurované `AICOS_BACKUP_DIRS_JSON` (JSON pole absolutních cest). Staré `backup.sh` deleguje na stejný Node kód. Seznam cest oddělený dvojtečkou se nepoužívá.

## PROVOZ

Příkaz je výslovná jednorázová záloha. Používá stejnou implementaci jako [Stop hook](../../hooks/README.md); pro hook je navíc nutné `AICOS_BACKUP=on`. U každého repa ověří Git a origin. Změny stageuje, celé staged blobs proskenuje a commitne; bez změn commit nevytváří. Push provede i u čistého repa, aby zopakoval předchozí neúspěšný push. Chyba kontroly, commitu nebo push se hlásí jako neúspěch. Žádný reset, checkout, clean, stash ani force push.

[Noční úloha](../../scheduled-tasks/nightly-backup/SKILL.md) je recept. Agent ji musí registrovat v dostupném scheduleru konkrétního klienta nebo OS, ukázat uložený rozvrh a ověřit první běh. Samotný Markdown nic nespouští; univerzální slash příkaz pro plánování se neslibuje.

## STAV A OBNOVA

Funkční záloha má dohledatelný commit na správném remote a otestovanou obnovu do oddělené složky. Restore se nepokouší přepsat aktivní práci. Klíče, necommitované/ignorované soubory a externí data se obnovují ze své samostatné zálohy.

## NAVAZUJÍCÍ DASHBOARD

Společné sessions a jejich samostatný sync patří do druhého Dashboard ZIPu. Při jeho pozdější instalaci zachovej jednu cestu zálohy stejného vaultu a nevytvářej duplicitní writer. Navazuj podle [předávky](../../docs/PREDANI-DASHBOARDU.md).
