# GIT PRE-COMMIT

POSIX wrapper volaný Gitem. Ověří Node a root/scanner, potom spustí Node scan celých změněných staged blobs z Git indexu. Existuje kvůli blokaci commitu, ne kvůli registraci event hooků Claude.

## POUŽITÍ

Agent může po ověření Git repa nastavit core.hooksPath na hooks/git-hooks. Pouhá hodnota configu není důkaz, že proběhl scan. Ověřit na neškodném dummy fixture bez skutečného tajemství.

## STAV

Missing Node/Git/scanner nebo neúspěšné čtení indexu/blobs blokuje commit, stejně jako timeout či maxBuffer. Binární diff a .gitattributes -diff nezakrývají obsah. Wrapper vyžaduje POSIX interpreter Git for Windows/POSIX Git; Windows qualification vyžaduje vlastní CI receipt. Žádný bypass AICOS_ALLOW_SECRET. Scanner vrací plně redigované typy nálezů.
