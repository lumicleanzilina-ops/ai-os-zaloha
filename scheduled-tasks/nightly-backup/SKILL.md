---
name: nightly-backup
description: >
  Recept pro denní Git zálohu workspace a volitelného vaultu do schváleného
  privátního repozitáře; registraci scheduleru a první skutečný běh ověří agent.
---

# Noční záloha na GitHub

Použij jen při výslovně nakonfigurované záloze. Tento soubor není aktivní rozvrh.
Registraci v konkrétním klientovi nebo OS řeší [SETUP](../../docs/SETUP.md).

## POSTUP

1. Ověř schválený privátní origin, účet, větev a adresáře podle
   [modulu GitHub backup](../../modules/github-backup/README.md). Chybějící nebo jiné
   napojení neopravuj improvizovaným přesměrováním; nahlas co chybí.
2. V zákaznickém workspace spusť:
   ```bash
   node modules/github-backup/backup.mjs
   ```
   Volitelný vault určuje `SECOND_BRAIN_VAULT`; explicitní sadu nastavuje
   `AICOS_BACKUP_DIRS_JSON` nebo samostatné absolutní CLI argumenty.
3. Implementace stageuje zálohované změny, kontroluje přesné staged blobs a commitne
   je. Výjimka pro `git add -A` platí jen pro tuto schválenou zálohu. Push zopakuje
   i při čistém workspace, takže předchozí neúspěšný push nezůstane zapomenutý.
   Chyba vrací neúspěch; nereportuj ji jako „všechno čisté“.
4. Ověř commit na zamýšleném remote a zaznamenej úspěch či chybu bez credentials.
   Žádný reset, checkout, clean, stash nebo force push. Neúspěch vyžaduje upozornění
   podle uložené preference scheduleru. Úspěšný běh může zůstat tichý.

## STAV

Recept připravený k registraci a ověření prvního běhu. Ignorované soubory,
credentials a externí data Git záloha nepokrývá; obnovu ověř v oddělené složce.
