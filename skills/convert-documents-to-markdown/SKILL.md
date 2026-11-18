---
name: convert-documents-to-markdown
description: Převeď Word (.doc, .docx, .docm), PowerPoint (.ppt, .pptx), Excel (.xls, .xlsx, .xlsb), OpenDocument (.odt, .ods, .odp), RTF, EPUB, CSV a textové PDF do čistého Markdownu. Použij, když úkol potřebuje obsah dokumentu, který neumíš přečíst přímo — hlavně u starých formátů (.doc, .xls, .ppt, .rtf) a u dávkového převodu celé složky podkladů. NENÍ na vytváření a editaci dokumentů a NENÍ na skenovaná PDF.
license: MIT (anydoc by Firecrawl)
---

# Převod dokumentů do Markdownu

Pouští CLI [anydoc](https://github.com/firecrawl/anydoc) — Rust knihovnu od Firecrawlu. Běží lokálně, nepotřebuje API klíč, žádné ML modely, žádný účet. Obsah převádí lokálně; první stažení nástroje vyžaduje síť. Rychlost závisí na souboru.

Není co instalovat: příkaz níž si při prvním spuštění stáhne binárku a nacachuje ji.

**Před prvním spuštěním** řekni uživateli jednou větou, co se stáhne a odkud (například: „Stáhnu z npm registru balíček `@firecrawl/anydoc` ve verzi 0.1.6, MIT nástroj; po stažení převádí dokumenty jen u tebe v počítači“), a pokračuj až po jeho souhlasu. Mlčky ho nespouštěj a samotné „ověřeno“ nestačí. Souhlas stačí jednou za session.

## Příkazy

Verze je zafixovaná schválně. Holé `npx -y` stáhne cokoliv je zrovna na npm nejnovější, což je riziko útoku na dodavatelský řetězec — zafixuj ji a zvyšuj vědomě.

```bash
npx -y @firecrawl/anydoc@0.1.6 report.docx               # Markdown na stdout
npx -y @firecrawl/anydoc@0.1.6 sheet.xls -o out.md       # zápis do souboru
npx -y @firecrawl/anydoc@0.1.6 - --format csv < data.csv # čtení ze stdin
```

Celá složka najednou:

```bash
mkdir -p work/conversion
failed=0
for f in inputs/*; do
  [ -f "$f" ] || continue
  if ! npx -y @firecrawl/anydoc@0.1.6 "$f" -o "work/conversion/$(basename "$f").md"; then
    printf 'Převod selhal: %s\n' "$f" >&2
    failed=1
  fi
done
[ "$failed" -eq 0 ]
```

Vyžaduje Node 20+. Než zvýšíš zafixovanou verzi, projdi changelog a znovu pusť `/scan`.

## Kdy tohle použít a kdy ne

Tohle je **jednosměrný převod: dokument → Markdown**. Čte. Dokument nikdy nezapisuje.

| Potřebuješ | Použij |
|---|---|
| Jen si přečíst obsah — hlavně u `.doc`, `.xls`, `.ppt`, `.rtf`, `.epub`, `.odt` | **tuhle dovednost** |
| Převést celou složku podkladů najednou | **tuhle dovednost** |
| Vytvořit nebo upravit Word dokument | `docx` (jen pokud je host skutečně nabízí) |
| Vytvořit nebo upravit prezentaci | `pptx` (jen pokud je host skutečně nabízí) |
| Vytvořit nebo upravit tabulku, pracovat se vzorci | `xlsx` (jen pokud je host skutečně nabízí) |
| Skenované nebo čistě obrázkové PDF (potřebuje OCR), vyplnit formulář, spojit, rozdělit | `pdf` (jen pokud je host skutečně nabízí) |

## Omezení

1. **Žádné OCR.** Skenovaná a čistě obrázková PDF spadnou na `Unsupported`. Na ty použij dovednost `pdf`, nebo hostované Parse API od Firecrawlu.
2. **Žádné obrázky, audio ani video.** Převádí dokumenty, ne média.
3. **Zašifrované soubory a soubory chráněné heslem** spadnou na `Encrypted`.
4. **Žádná data o layoutu ani pozicích** — dostaneš text a strukturu, ne geometrii stránky.
5. Chyby vypisují jediný řádek `anydoc: <message>` na stderr. Návratové kódy: 0 úspěch, 1 nepodařilo se převést, 2 chyba v použití. Nikdy se na nic neptá.
6. U velkého dokumentu zapisuj přes `-o` do souboru a přečti si jen ty části, které potřebuješ, místo abys celý obsah cpal do kontextu.

## Formáty

`.doc` `.docx` `.docm` · `.ppt` `.pptx` `.pps` `.pot` `.pptm` `.ppsx` `.ppsm` · `.xls` `.xlsx` `.xlsm` `.xlsb` · `.odt` `.ods` `.odp` · `.rtf` · `.epub` · `.csv` · `.pdf` (textové)

Formát se pozná z obsahu souboru, ne z přípony, takže i špatně pojmenovaný soubor se převede. `--format <name>` předávej jen tam, kde detekce fungovat nemůže: CSV ze stdin, nebo chybějící přípona.

> Původ: firecrawl/anydoc, stejnojmenná dovednost (MIT, Copyright (c) 2026 Sideguide Technologies Inc.); přepsáno a rozšířeno. Licence a změny: THIRD-PARTY-NOTICES.md v kořeni kitu.
