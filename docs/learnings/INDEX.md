# Rejstřík tvých pravidel — najdi pravidlo dřív, než uděláš chybu

> **K čemu to je:** tenhle soubor se načítá na začátku **každé** session (hook `learnings-index`, `hooks/learnings-index.mjs`).
> Je to jediné místo, které dostane tvoje vlastní pravidla do hlavy agenta dřív, než začne pracovat.
>
> **Jak se to čte:** levý sloupec je **spouštěč** — situace, ve které se právě nacházíš. Ne téma.
> Když ti sedí řádek, otevři soubor za odkazem, než se pustíš do práce.
>
> **Jak se to plní:** pokaždé, když opravíš svého Chief of Staff, zapíše si pravidlo do tohohle
> adresáře **a přidá sem řádek**. Pravidlo bez řádku v rejstříku se nenajde, takže neexistuje.
>
> **Drž to krátké.** Platí se za to na každém startu session — jeden řádek na pravidlo, žádná vata.
> Celý text patří do souboru za odkazem.
>
> Značky: ⚠️ = zvýšená závažnost · 🔴 = kritické, tohle už jednou něco stálo.

---

| Kdy | Pravidlo |
|---|---|
| ⚠️ Testuješ secret guard / kontrolu hesiel | Falošný kľúč len mimo workspace (repo v scratchpade) → [test-hesiel-mimo-workspace](test-hesiel-mimo-workspace.md) |

---

## Kam co patří

- **Sem** (`docs/learnings/`) jdou **tvoje** pravidla — z tvých oprav, o tvojí práci.
- **Do [`../playbook/`](../playbook/)** patří tovární pravidla, se kterými se kit prodává.
  Když si obojí odporuje, **tvoje pravidlo vyhrává.**
