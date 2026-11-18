# Deliverable musí přežít session

## Pravidlo
Výstup není hotový, dokud neleží tam, kde ho uživatel později najde — a dokud není commitnutý, pokud
je projekt v gitu. Markdown v chatu, běžící lokální server, soubor na odpojené branchi, artefakt
„někde v cloudu": nic z toho se nepočítá.

## Proč
Vypnutý dev server = smazaný výstup. V jednom auditovaném případě existovala 50 kB obsahová
strategie — měsíc naplánovaných postů a kompletní komunikační flow — jen jako untracked soubory v
pracovní branchi, zatímco v hlavním repu ležel 2 kB útržek původního zadání. Týden si toho nikdo
nevšiml.

## Jak to použít
- Pracuješ ve worktree nebo na izolované branchi? Tvoje `outputs/` **nejsou** na hlavní branchi. Než
  skončíš, zkopíruj deliverable na správné místo v hlavní branchi a commitni ho tam.
- Než začneš cokoliv netriviálního, potvrď jednou větou formát a místo uložení. Špatné místo stojí
  přesně tolik co špatný obsah.
- Než začneš uživatele varovat před „necommitnutou prací v ohrožení", nejdřív si ji porovnej s hlavní
  branchí — z většiny takhle označených worktree se vyklubou redundantní kopie, ne nová práce.
