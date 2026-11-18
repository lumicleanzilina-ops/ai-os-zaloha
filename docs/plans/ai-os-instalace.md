# AI OS — soukromý instalační protokol (Miška)

**Stav:** KIT: PENDING
**Dashboard:** DASHBOARD: NOT_SELECTED
**Oblast právě řešeného kroku:** příprava základu (Node 24, Git, workspace)
**Poslední ověření:** 2026-11-18

## Prostředí
- Workspace (pracovní kopie): `C:\Users\HP\AI-OS`
- Čistá KIT distribuce (neměnit): `C:\Users\HP\OneDrive\Documents\Claude\AI OS\AI OS Kit 4.4.0`
- Verze kitu: 4.4.0; SHA-256 `release-manifest.json`: `44C63F7F23A056440368B783959DD773CD065F5C82D2642ACD9FF7556C432AC5`
- Host: Claude Desktop (záložka Code), Windows 10 Home, tarif Pro, model přepnut na Sonnet
- Git: 2.56.1 (OVĚŘENO). Node: v24.10.0 nainstalován přes winget (OVĚŘENO `node --version`, 2026-11-18); ověřeno i v nové session otevřené v kořeni workspace (2026-11-18)
- Doctor 2026-11-18: vše prošlo kromě `config-exec-form` (tovární neaktivní konfigurace, očekávané). Náhled `node tools/aktivovat-pojistky.mjs`: `ready-to-activate`, všechny kritické kontroly passed. Pojistky zatím NEAKTIVNÍ.
- Aktivace 2026-11-18 (`--apply`): `status: activated`, záloha settings `C:\Users\HP\.claude\aicos\activation-backups\e04b964fb8a7-cc45d0a5-0758-4c19-a330-5bb4d44e39cd.settings.json`, receipt `C:\Users\HP\.claude\aicos\state\e04b964fb8a7.activation.json`.
- Host callback OVĚŘENO v této session: po Edit `scratch/hook-test.txt` nový checkpoint (08:39:14Z, commit `663cac0f…`) obsahuje obsah PŘED editací; checkpoint vzniká i na Bash. Testovací soubor přesunut do koše (`tools/kos.mjs`).
- Secret guard (git pre-commit): NEPOUŽITELNÝ zatím — workspace není Git repo; řešit spolu se zálohou.
- Dashboard: nezvolen

## Co o uživatelce víme (zdroj: její odpovědi 2026-11-18)
- Oslovení: Miška (tykání; zatím nepotvrzeno výslovně)
- Podnikání: LumiClean (web ve složce `Documents\Claude\Lumiclean`, slovensky, úklid domů, třídění šatníků, módní poradenství)
- Hlavní potřeba: online objednávky
- 2026-11-18: s podnikáním začíná, objednávky zatím žádným kanálem nechodí; stále pracuje na webu. Píše slovensky.
- 2026-11-18: LumiClean je zatím jen nápad na nové podnikání. Způsob objednávek neřešit teď; nejdřív zjistit, s čím chce pomoct v této fázi.
- Dřívější instrukce / paměť Claude Code / Codex: žádné nalezeny

## Hotové kroky
1. Přečten START, ONBOARDING, SETUP, STAV-INSTALACE; prohledány dřívější instrukce a paměť (nic nenalezeno).
2. Vytvořena pracovní kopie `C:\Users\HP\AI-OS` (bez .git historie).
3. Založen tento protokol.

## Tabulka oblastí
| Oblast | Volba | Stav | Důkaz / cesta | Další krok |
|---|---|---|---|---|
| Vlastní workspace | — | OVĚŘENO | `C:\Users\HP\AI-OS`, session otevřena v kořeni, doctor `workspace-root` passed | ukázat strukturu projektů |
| Člověk, styl, hranice | NASTAVIT TEĎ | ČEKÁ | `docs/profil/user-profile.md` doplněn (role, lokalita, koncept, živnost) | styl odpovědí zapsán do `user-preferences.md` (2026-11-18); nesouhlas: přímo; hranice potvrzeny (výchozí pravidla, nic navíc); podpis e-mailů zatím výchozí (jen jménem), přesné znění upřesnit u prvního e-mailu. Zbývá: cíle/priority, co bere čas |
| První užitečný výstup | NASTAVIT TEĎ | OVĚŘENO | `projects/lumiclean/outputs/ponuka-a-cennik-NAVRH.md` (skill offer-architect, zdroje) | — |
| Dovednosti | NEROZHODNUTO | ČEKÁ | | `zpristupnit-skilly.mjs` |
| Integrace | NEROZHODNUTO | ČEKÁ | | probrat kategorie |
| Paměť a učení | NASTAVIT TEĎ — Tolaria (její přání 2026-11-18: „nauč sa pracovať s tolaria“) | ČEKÁ | `modules/second-brain/README.md` přečten | po dokončení zálohy: zjistit, zda má Tolarii nainstalovanou; vault mimo workspace, AGENTS.template, SECOND_BRAIN_VAULT, MCP bridge, ověřit zápis+čtení, záloha vaultu zvlášť |
| Automatizace a briefing | NEROZHODNUTO | ČEKÁ | | |
| Pojistky (hooky) | NASTAVIT TEĎ | OVĚŘENO | activation receipt + test checkpointu 2026-11-18 | — |
| Záloha + secret guard | NASTAVIT TEĎ | OVĚŘENO (ruční záloha workspace) | workspace není Git repo; checkpoint dál běží (poslední 2026-11-18 10:00Z) | 2026-11-18 volba NASTAVIT TEĎ. Hotovo: `git init -b main` ve workspace, lokální user.name/email (Miška, lumicleanzilina@gmail.com), `core.hooksPath=hooks/git-hooks` (předtím žádné vlastní hooky). Secret guard OVĚŘENO: dočasné repo ve scratchpadu se syntetickým AWS klíčem → `COMMIT BLOCKED`, hodnota redigována; repo v koši. Claude checkpoint hook navíc blokoval nástroje, dokud byl syntetický klíč ve workspace (learning zapsán). GitHub účet `lumicleanzilina-ops` (založila Miška), soukromé repo `ai-os-zaloha`, remote `https://lumicleanzilina-ops@github.com/lumicleanzilina-ops/ai-os-zaloha.git` (uživatel v URL kvůli jinému uloženému účtu `mfilova10-source`, který dostal 403 — NEPOUŽÍVAT pro tuto zálohu). Push OVĚŘENO: commit `436099c` na `origin/main` (`git ls-remote`). Obnova OVĚŘENO: klon do scratchpadu, `docs/profil` a `projects` beze změn proti originálu; klon v koši. Automatická záloha (`AICOS_BACKUP=on` / noční rutina) zatím NEROZHODNUTO — probrat u automatizací. Vault Tolarie bude potřebovat zálohu zvlášť. |
| Předání | — | ČEKÁ | | |

## Inventář nástrojů (průběžně)
| Kategorie | Stav | Volba | Další krok |
|---|---|---|---|
| E-mail | Gmail na notebooku, iPhone Mail v telefonu; e-mail LumiClean zatím nemá, chce založit | NEROZHODNUTO | doménu nemá; 2026-11-18 založen `lumicleanzilina@gmail.com`. Další: e-mail na web (čeká na souhlas), přidat do iPhonu, rozhodnout o napojení konektoru na TENTO účet a ověřit čtením |
| Kalendář | iPhone Kalendář | NEROZHODNUTO | doporučeno POZDĚJI: po založení Gmailu LumiClean použít jeho Google Kalendář (zobrazí se i v iPhonu, napojí se rezervace) |

## Poznámky bokem
- Online objednávky pro LumiClean: probrat u integrací (kalendář, platby, e-mail).

## Jediný další krok
Rozhovor o práci (ONBOARDING §1): koncept = úklid + šatníky + módní poradenství v jedné službě (zapsáno v profilu); první užitečný výstup SCHVÁLEN: nabídka nejdřív po službách samostatně, pak balíčky (skill offer-architect). Založen projekt `projects/lumiclean/`. Lokalita: Rajecké Teplice, Rajec, Žilina a okolí. První výstup HOTOVÝ jako návrh: `projects/lumiclean/outputs/ponuka-a-cennik-NAVRH.md` (průzkum cen se zdroji, služby samostatně + 3 balíčky). Doplněna okna a spotřebiče. Role: šatník+poradenství ona, úklid 1 zaměstnanec, živnost. Neplátkyně DPH; zaměstnanec na dohodu 10 €/h, přepočet marže doplněn; 18 €/h ponechává. První užitečný výstup HOTOVÝ (návrh nabídky, schválené ceny a názvy; okna/spotřebiče ještě doladí). Second-opinion nabídnout před zveřejněním na webu. ONBOARDING §2 hotový v souborech (styl, nesouhlas, hranice, podpis výchozí). Nyní ONBOARDING §3: inventář nástrojů — začít e-mailem a kalendářem (v session se objevil Gmail konektor, zatím nepoužit ani neověřen)., potom zdroj příjmu/současná práce a spolupracovníci.
