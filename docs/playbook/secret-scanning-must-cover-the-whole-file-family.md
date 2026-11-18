# Ignoruj celou rodinu souborů s citlivými údaji — a ověř to

## Pravidlo
Záznam `.env` v `.gitignore` **nesedí** na `.env.bak.2026-01-01`, `.env.old` ani `.env.2`. Ignoruj
celou rodinu přes zástupné znaky a pak to ověř příkazem `git check-ignore -v <file>`.

## Proč
Ta díra je neviditelná, dokud někdo nespustí široký `git add`. To, že vzor vypadá kompletně, není
důkaz, že je soubor vyloučený.

## Jak to použít
- Zástupné znaky: `.env*`, `*.key`, `credentials.*`.
- Ověřuj příkazem, ne okem.
- Když už se klíč do gitu dostane: **rotuj ho**. Smazání řádku ho z historie neodstraní.
