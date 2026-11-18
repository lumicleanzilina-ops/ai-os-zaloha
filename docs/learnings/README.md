# learnings/ — tvoje vlastní institucionální paměť

**Tahle složka začíná záměrně prázdná. Stane se tvojí.**

Pokaždé, když opravíš svého Chief of Staff — „ne, takhle ne", „tohle číslo máš špatně", „tohle už
nikdy nedělej" — se ta oprava zapíše sem jako pravidlo, tvými slovy, o tvojí práci. Příště si ho
agent přečte dřív, než začne jednat. To je celá sebezlepšovací smyčka a funguje jen tehdy, když je
to, co je tady, opravdu *tvoje*.

> Hledáš hotová pravidla? Kit jich veze dvacet sedm v [`../playbook/`](../playbook/) — obecné řemeslné
> standardy destilované z reálného produkčního systému. To je tovární nastavení.
> **Tahle** složka je tvoje historie.

Zatím tu leží jen tenhle `README.md` a prázdný [`INDEX.md`](INDEX.md). Žádné pravidlo. To je správně —
první přibude, až svého agenta poprvé opravíš.

## Jak se to plní

1. Opravíš agenta.
2. Self-review hook (`hooks/self-review.sh`) si toho všimne a zapíše sem pravidlo.
3. Do `INDEX.md` přibude řádek — **spouštěč**: „když děláš X, přečti si Y".
4. Na startu každé session se ten rejstřík načte do kontextu (`hooks/learnings-index.mjs`), takže se
   pravidlo opravdu přečte, místo aby potichu leželo na disku.
   Když rejstřík přeroste 5 kB, vloží se místo něj rozcestník „spouštěč → soubor“ po sekcích (přednost mají
   řádky s 🔴, potom s ⚠️, potom nejnovější) a ostatní najdeš grepem v `INDEX.md`.

Nepřečtené pravidlo je dražší než žádné — stojí práci, kterou dalo ho napsat, a tu chybu stejně
nechá projít. Proto rejstřík existuje a proto se drží na jednom řádku na pravidlo.

## Formát

```markdown
# [Krátký titulek — samotné pravidlo, ne téma]

## Pravidlo
[Konkrétní věc, kterou dělat, nebo kterou nikdy nedělat.]

## Proč
[Co se stalo. Precedent je to, co dělá pravidlo věrohodným i za půl roku.]

## Jak to použít
[Hraniční případy, výjimky, související pravidla.]
```

Rozpracovaný příklad přesně v tomhle tvaru najdeš v playbooku:
[`../playbook/verify-in-your-weak-spots.md`](../playbook/verify-in-your-weak-spots.md).
