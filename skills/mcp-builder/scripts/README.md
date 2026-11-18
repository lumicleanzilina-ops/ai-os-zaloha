# Evaluační nástroje MCP

Pomocné skripty pro vývojáře, nikoli součást prvního nastavení AI OS Kitu.

## Obsah a použití

`evaluation.py` spouští modelovou evaluaci, `connections.py` připojení k MCP serveru,
`example_evaluation.xml` je ukázka vstupu. Evaluátor odesílá otázky a výsledky MCP nástrojů
do Anthropic API, čerpá jeho placený limit a může volat všechny nástroje připojeného serveru.
Nemá vlastní sandbox ani vynucený read-only filtr. Použij výhradně testovací server s technicky
omezenými oprávněními a syntetická data po souhlasu uživatele s evaluací. Produkční účty,
obsah zákazníků a přihlašovací údaje do něj nevkládej. Hlavičky a `-e` argumenty jsou viditelné
v seznamu procesů; ukázkové hodnoty nejsou způsob, jak bezpečně předat skutečná tajemství.

`requirements.txt` připíná přímé závislosti. Před instalací vytvoř ve svém vývojovém projektu
úplný lock všech tranzitivních závislostí s hashi, prověř jej a použij oddělený venv.
Instaluj z prověřeného locku s kontrolou hashů (např. pip `--require-hashes`), ne z volných rozsahů.
API klíč poskytni pomocí správce tajemství nebo skrytého vstupu, nikdy jako literál v historii shellu.

## Stav

Přímé verze `anthropic==0.125.0` a `mcp==1.30.0` byly 18. 10. 2026 ověřeny v oficiálním PyPI
API (https://pypi.org/pypi/anthropic/0.125.0/json a https://pypi.org/pypi/mcp/1.30.0/json).
OSV dotaz na přesné verze v ten den nevrátil advisory; to není záruka bezpečnosti ani kontrola
tranzitivních závislostí. Placená evaluace ani instalace těchto balíčků nebyla při auditu spuštěna.
Před použitím znovu ověř advisories a funkčnost ve svém testovacím prostředí.
