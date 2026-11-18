---
name: scan
description: Bezpečnostně proskenuje jakýkoliv AI skill, MCP server nebo složku se skilly na škodlivé vzorce JEŠTĚ PŘED tím, než ho nainstaluješ nebo mu začneš věřit. Použij, když chce uživatel prověřit skill/plugin/MCP, který našel na internetu, proauditovat vlastní skilly, nebo se ptá "je bezpečné to nainstalovat?". Spouštěcí fráze - "proskenuj tenhle skill", "je to bezpečný", "zkontroluj to repo", "prověř to, než to nainstaluju", "můžu tomu věřit", /scan.
---

# /scan — prověř skill, než mu začneš věřit

Spouští **[NVIDIA SkillSpector](https://github.com/NVIDIA/SkillSpector)** (Apache-2.0, oficiální) — statický
bezpečnostní skener postavený přímo pro AI agentní skilly. Odpovídá na jednu otázku: **„je bezpečné
tenhle skill nainstalovat?"** Použij ho na cokoliv, co se chystáš přidat do svého setupu — skill z repa,
MCP server, `SKILL.md`, co ti někdo poslal — a na vlastní skilly předtím, než je pustíš ven.

**Proč na tom záleží:** skill jsou instrukce, které bude tvůj agent následovat, a kód, který může spustit.
Ten škodlivý umí sebrat přihlašovací údaje, odnést data ven nebo podstrčit prompt. Zběžné přečtení tohle
nezachytí. Tohle ano — kontroluje 68 vzorců napříč 17 kategoriemi (prompt injection, lov credentials,
exfiltrace dat, otrávené MCP nástroje, nebezpečný kód, YARA malware signatury, CVE v závislostech).

## Bezpečnost samotného skeneru

SkillSpector je **read-only** — skenovaný skill nikdy nespouští (jen statická analýza + AST + YARA).
S `--no-llm` nepotřebuje **žádný API klíč a neposílá nic do žádného LLM**. Jediné volání po síti je
volitelné dohledání CVE v závislostech na `api.osv.dev` (jen jména balíčků, a jen pokud skill nějaké
závislosti deklaruje). Pro nulový provoz po síti ho pusť offline — spadne zpátky na přibalený seznam CVE.

## Instalace (jednorázově)

Nejdřív ověř, jestli už je důvěryhodná instalace dostupná. Pokud ano, použij ji a ulož její verzi do reportu.
Pokud chybí, vysvětli uživateli, co budeš instalovat; samotný požadavek na kontrolu cizího skillu není
souhlas ke spuštění jeho kódu ani k instalaci dalšího nástroje do systému.

Pro novou instalaci ověř aktuální požadavky a vydání v oficiálním repozitáři NVIDIA výše. Vyber
konkrétní neměnný commit nebo vydání, ulož jeho identifikátor a ověř kontrolní součet staženého
archivu proti důvěryhodnému zdroji. Před instalací přečti instalační skripty, deklarace závislostí
a Dockerfile, pokud ho chceš použít. Do odděleného virtuálního prostředí instaluj až prověřený
lokální zdroj s uzamčenými závislostmi; nepoužívej pohyblivou větev ani neověřený vzdálený instalátor.
Není-li původ nebo konkrétní verze ověřitelná, instalaci zastav a proveď ruční read-only review.
Docker sám o sobě kontrolu zdroje a oprávnění nenahrazuje.

## Spuštění

Defaultně jeď na **`--no-llm`** — bez volání modelu a bez API klíčů. Tento přepínač sám
nezaručuje nulovou síťovou komunikaci: vzdálený vstup a volitelné CVE dotazy potřebují síť.
Pro offline audit použij lokální vstup a prostředí bez sítě; skutečná omezení zapiš do reportu.

```bash
# jeden skill
skillspector scan ./path/to/skill/ --no-llm

# celá složka se skilly, každý hodnocený samostatně
skillspector scan ./skills/ --recursive --no-llm

# sken vzdáleného repa ještě před tím, než ho naklonuješ/nainstaluješ
skillspector scan https://github.com/someone/their-skill --no-llm

# strojově čitelný report pro třídění nálezů
skillspector scan ./skills/ --recursive --no-llm --format json --output report.json
```

Zkontroluj i `analysis_completeness`, počty zpracovaných a vynechaných skills a chyby analyzérů.
Rekurzivní sken může narazit na limit počtu souborů či skills: vynechané položky proskenuj zvlášť.
Úspěšné spuštění ani nulové skóre neznamená úplné pokrytí. Neúplný průchod tak vždy označ.

**Volitelný modelový průchod** může pomoci vysvětlit nálezy; není zárukou přesnosti.
Posílá kontrolovaný obsah do modelu a může čerpat placený limit. Zapni ho jen po souhlasu uživatele
s tímto přenosem a po kontrole, že vstup neobsahuje tajemství. Používá stávající přihlášení ke Claudovi:

```bash
SKILLSPECTOR_PROVIDER=claude_cli skillspector scan ./path/to/skill/
```

## Přečti si výsledek správně — tohle je ta důležitá část

Skóre jsou **0–100**: `0–20 SAFE`, `21–50 CAUTION`, `51–80 HIGH`, `81–100 CRITICAL`, s verdiktem
**SAFE / CAUTION / DO_NOT_INSTALL**. Návratový kód `0` = safe/caution, `1` = neinstalovat.

**Statické skenování má vysokou úspěšnost v záchytu, ale i false positives — nikdy nejednej podle
samotného skóre.** Když něco vyjde HIGH/CRITICAL, otevři konkrétní nálezy a posuď každý zvlášť:

- Vytáhni nálezy (`--format json`) a u každého se podívej na `category`, `file`, `finding` a
  `code_snippet`.
- **Typické false positives** (zamítni s odůvodněním): zásah klíčového slova v `LICENSE.txt`,
  v dokumentaci nebo v referenčních datech (třeba `.env` nebo `dangerouslySetInnerHTML` jako *příklad*
  v CSV/README), ukázkový výukový kód.
- **Skutečné red flagy** (ber vážně): **YARA zásah `info_stealer`** na kódu, co čte cookies z prohlížeče /
  Keychain / keyring; zásah **`remote_bootstrap_execution`** (`pip install https://…`, `curl … | sh`);
  zápis souborů s credentials; nečekaný odchozí síťový provoz v kódu, který o sobě tvrdí, že je lokální;
  popisy MCP nástrojů, které neodpovídají tomu, co nástroj reálně dělá.

Uživateli nahlas: skóre, pak **které nálezy jsou reálné a které false positive a proč**, a nakonec
jasný verdikt — instalovat / instalovat s opatrností / neinstalovat.

## Dobré návyky

- Skenuj **před** instalací čehokoliv zvenku, ne až potom.
- Skenuj **vlastní** skilly, než je zveřejníš — zachytíš omylem prosáklou cestu nebo příliš široké
  oprávnění dřív, než to uvidí svět.
- Když udržuješ repo se skilly, zapoj to do CI (SkillSpector umí vyplivnout SARIF pro code scanning).
