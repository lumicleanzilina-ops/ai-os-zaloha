# Dashboard je samostatný druhý ZIP

Nejdřív dokonči [průvodce kitem](START.md). Pak podle [předávky](docs/PREDANI-DASHBOARDU.md) najdi a ověř samostatný AI OS Dashboard ZIP a rozbal jej do nové čisté složky vedle kitu.

## Obsah / Struktura
Tento soubor je jen rozcestník. Úplný instalační návod a platformové balíky jsou uvnitř druhého ZIPu. Instalační agent zjistí jeho skutečnou cestu a připraví hotovou zprávu pro novou session ve stejném osobním workspace. Cestu ani odkaz ke stažení nehádej.

## Stav
Dashboard se instaluje až po KIT COMPLETE podle [stavové smlouvy](docs/STAV-INSTALACE.md). Dokud je kit nehotový, zůstává WAITING_FOR_KIT. Výslovné POZDĚJI neblokuje použitelný základ. Spouštěče Dashboardu tento protokol nečtou; technicky ověřují jen soukromý doklad `.ai-os/kit-completion.json` a otisky jeho důkazů. Obsah a skutečné dokončení průvodce ověřuje agent.
