# Tovární otisky starších verzí

Každý soubor tu popisuje jednu dřívější distribuci AI Chief of Staff: cestu, SHA-256, velikost a práva každého souboru tak, jak ležel v původním ZIPu. Obsah souborů tu není, jen otisky.

Upgrade (`tools/upgrade.mjs`) díky nim pozná, který soubor ve tvém workspace je pořád tovární a smí se vyměnit (`replace`), a který sis upravil (`conflict`, ten zůstane tvůj). Bez otisku by se každý existující soubor bral jako konflikt. U V.03 to dřív znamenalo 0 výměn a 74 konfliktů.

## Obsah

| Soubor | Verze | Souborů | SHA-256 otisku (`--baseline-sha256`) | SHA-256 původního ZIPu |
|---|---|---|---|---|
| `V03.json` | V.03 (Circle) | 127 | `2e06ae4c0569bffc3b6040c2820341036b5f89eef65b683dd62b67b8657914c2` | `c51c3828076fdd5ed8de3b52a5ce0eb88ce0a809caa140d9b0a95999a4b66fc8` |
| `V04.json` | V.04 | 179 | `58a25925a3be33156ac1bff99f078949f49273b2b0bde99c001f560e368bb475` | `4fd99b7a83a00c9cd4b6145b97070e7ffbdd09e871df564c0fce843b089b369c` |
| `V041.json` | V.04.1 | 180 | `19700e94453937b047d705e6fa040bb7939fe507cb6a77156525f6031a2e7ec9` | `bfa81b694c9445316d614020e1d38e9c2b520bd457f0e6ef483d84a3a3c99805` |
| `V43.json` | Kit 4.3.0-rc.28 | 222 | `f905e59db9f7a02781e1ec156cc1860a65db09d43e1ac4e8ae203edd6a599100` | `2e5a49516eaa1113982d28f169dbf73d55b63bae822c27dc0d00e121021fb699` |

Vedle otisků leží tovární texty starých ústav: `V03-ustava.txt` (V.03 `CLAUDE.md`), `V04-ustava.txt`, `V041-ustava.txt` a `V43-ustava.txt` (V.04, V.04.1 a Kit 4.3.0-rc.28 `AGENTS.md`). Podle nich agent při upgradu pozná, co si zákazník v pravidlech dopsal sám (postup v kroku 4 návodu). Mají příponu `.txt`, aby je žádná appka nenačetla jako instrukce.

Otisky vznikly z rozbalených původních ZIPů (bez `.DS_Store` a `__MACOSX`; `release-manifest.json` v otisku není, protože sám sebe do seznamu souborů zapsat nemůže). Máš-li původní ZIP ještě u sebe, jeho SHA-256 porovnej se sloupcem vpravo: shoda znamená, že máš přesně tu verzi, ze které otisk vznikl.

`V43.json` popisuje přesně Kit 4.3.0-rc.28. Máš-li jiný kandidát 4.3 (například rc.27), soubory, které se mezi kandidáty změnily, vyjdou jako konflikt a zůstanou tvoje; porovnej je ručně.

## Jak se používá

Postup pro agenta je v [docs/UPGRADE-Z-V3.md](../../docs/UPGRADE-Z-V3.md) (z V.03, V.04 a V.04.1) a [docs/UPGRADE.md](../../docs/UPGRADE.md#upgrade-z-kitu-43-na-44) (z Kitu 4.3). Otisk vyber podle verze, ze které jdeš, a jeho SHA-256 ze sloupce výš předej jako `--baseline-sha256`. Nikdy si otisk nevyráběj z dnešního personalizovaného workspace: tvoje úpravy by se pak tvářily jako tovární a upgrade by je přepsal.

Test parity ve vývojovém repu (`tests/parita-v3.test.mjs`, do ZIPu se nebalí) hlídá dvě věci: každý soubor ze starých verzí je v novém kitu, nebo má vysvětlení, proč chybí, a digesty v téhle tabulce sedí na soubory.

## Stav

Hotové pro V.03, V.04 a V.04.1 (6. 10. 2026) a Kit 4.3.0-rc.28 (12. 11. 2026). Další verze sem přibude se svým ZIPem.
