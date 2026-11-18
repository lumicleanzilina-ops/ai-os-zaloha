# Test kontroly hesiel nikdy nie vo workspace

Zdroj: vlastná chyba agenta, 2026-11-18 (nastavovanie zálohy).

**Pravidlo:** Syntetický „kľúč“ na test secret guardu vytváraj VŽDY mimo workspace, v samostatnom dočasnom Git repe v scratchpade, a hook pripoj cez `git -c core.hooksPath=<workspace>/hooks/git-hooks commit …`.

**Prečo:** Claude hook `checkpoint` odmietne každý Bash/PowerShell/Edit/Write, kým je v workspace súbor s niečím, čo vyzerá ako tajomstvo. Agent sa tak sám zamkne a súbor musí zmazať Miška ručne v Prieskumníkovi.

**Ako postupovať:** dočasné repo v scratchpade → Write fixture → `git add` → commit s `core.hooksPath` na kit → očakávaj `COMMIT BLOCKED` → repo do koša cez `tools/kos.mjs`.
