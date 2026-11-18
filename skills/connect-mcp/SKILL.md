---
name: connect-mcp
description: Nainstaluj a zapoj uživateli MCP server od začátku do konce — i když je úplný začátečník. Použij vždy, když chce uživatel napojit nějaký nástroj („napoj mi X", „nainstaluj MCP na NotebookLM/n8n/…", „připoj mi e-mail", „nastav MCP", „připoj mi to na X"). Přečte si dokumentaci daného serveru, nainstaluje ho, člověku předá jen ty kroky, které musí udělat člověk (přihlášení, klíč), ověří funkčnost a řekne mu, ať restartuje.
---

# Napojení MCP — spolehlivý recept

Tvoje práce: rozchodit funkční MCP připojení pro uživatele, který možná neví vůbec nic o terminálu,
konfiguracích ani MCP. Technických 80 % udělej sám. Člověku předej jen to, co opravdu musí udělat
člověk (interaktivní přihlášení, vložení klíče v prohlížeči). Nikdy nehádej destruktivně, nikdy
nesahej na jeho hesla.

Postupuj podle kroků **popořadě**. Průběžně lidsky popisuj, co zrovna děláš.

## 1. Identifikuj server
- Když uživatel jmenoval nástroj z `modules/mcp-integrations/RECOMMENDED-MCPS.md`, použij odkaz z toho řádku.
- Když poslal odkaz na GitHub nebo npm balíček, použij ten.
- Zjisti používaný hostitel a skutečně dostupné konektory. Když to řekl vágně („napoj mi e-mail“), navrhni nejdřív dostupný oficiální konektor podle jeho cíle. UI a slash příkazy ověř v této aplikaci; neslibuj univerzální `/mcp` nebo `/connect-mcp`.

## 2. Přečti si zdroj dřív, než na cokoliv sáhneš
- Stáhni si README / dokumentaci k nastavení: `WebFetch` na URL repozitáře, nebo `gh repo view <owner/repo>`,
  nebo naklonuj do dočasné složky a přečti si to. **Nikdy si nevymýšlej instalační příkaz — vezmi ho
  z dokumentace.**
- Z dokumentace zjisti: (a) způsob instalace (`npx`, `pip`/`uv`/`pipx`, Docker, klon + build),
  (b) jakou autentizaci potřebuje (žádnou / API klíč / interaktivní přihlášení v prohlížeči / cookies),
  (c) jaké má prerekvizity.

## 3. Bezpečnostní brána (tohle udělej dřív, než nainstaluješ cizí kód)
- Komunitní MCP je kód, který poběží na počítači uživatele. **Pusť na něj `/scan`** (SkillSpector) a
  přečti si nálezy. Zastav se a varuj uživatele, pokud čte cookies z prohlížeče nebo Keychain, zapisuje
  soubory s credentials nebo při instalaci dělá `curl … | sh`.

## 4. Zkontroluj prerekvizity a chybějící doinstaluj
- Node/`npx` u npm serverů; Python + `uv` nebo `pipx` u Python serverů. Když něco chybí, nainstaluj
  to (nebo dej jednořádkový install) a řekni, cos udělal.

## 5. Nainstaluj server
- Spusť přesný příkaz z dokumentace. Ukaž výstup. Když to spadne, přečti si chybu, mrkni do sekce
  troubleshooting v repozitáři a oprav to — necykli naslepo.

## 6. Předej člověku jen to, co musí udělat člověk — a pak ČEKEJ
Všechno, kde je příkazová řádka, instalace nebo konfigurační soubor, je **tvoje** — člověk terminál
nikdy neotevře. Jeho jediné ruční kroky jsou přihlášení a (někdy) vyzvednutí klíče, obojí v aplikaci
nebo na webu poskytovatele. Přesně tady lidi zasekávají, takže buď explicitní:
- **Interaktivní přihlášení (Google/OAuth):** příkaz k přihlášení spouštíš *ty*, pak uživateli *přesně*
  popiš, co se stane („otevře se záložka v prohlížeči — přihlas se účtem, který chceš napojit"), a
  **počkej, až ti potvrdí**, že je hotovo. **Nikdy za něj nevyplňuj heslo ani nedokončuj přihlášení.**
- **API klíč:** ověř aktuální stránku a podporovaný tok poskytovatele a předej jeden konkrétní krok. Uživatel uloží hodnotu bezpečně mimo chat do chráněného úložiště. Ty nastavíš odkaz nebo podporovaný loader, oprávnění a gitignore; nikdy klíč nežádej v chatu ani jej nevypisuj. Neposílej uživatele do terminálu a nenuť ho editovat konfiguraci.

## 7. Zapoj to do konfigurace
- Přidej server (`claude mcp add <name> -- <command>`, nebo uprav projektový `.mcp.json` / nastavení)
  a na jakýkoliv secret se odkazuj přes proměnnou prostředí — **nikdy nevkládej holý klíč do souboru,
  který se trackuje.**
- Referenční Claude CLI použij pouze v ověřeném Claude prostředí; jiný hostitel má vlastní podporovanou konfiguraci. Stávající konfiguraci přečti a řízeně slučuj, nikdy ji nenahrazuj tovární kopií. `.claude/settings.json` není obecné úložiště MCP serverů.
- Environment, klíčenka, `.env` a `${VAR}` v JSONu vyžadují skutečný podporovaný loader. Ověř předání procesu bezpečným voláním. Tajemství v `.secrets/` chraň adresářem 700 a souborem 600 a ověř přesnou cestu pomocí `git check-ignore`.

## 8. Ověř a restartuj
- Ověř, zda hostitel vyžaduje restart nebo znovupřipojení; pokud ano, předej přesný krok.
- Ze skutečného procesu pusť jeden bezpečný read-only dotaz. Ukaž účet/rozsah a výsledek, nikdy credentials. Stav přihlášení ani seznam nástrojů samy nejsou důkaz fungující integrace.

## 9. Uzavři to
- Jednořádkové shrnutí: co je napojené, co to teď umí, a jeden ukázkový prompt, který si může vyzkoušet.
- Když něco vyžaduje jeho akci a ty jsi to nedotáhl, napiš jednou větou přesně, co zbývá.

## Mantinely
- **Nikdy** neposílej uživatele do terminálu. Pracuje v desktopové aplikaci Claude (záložka **Code**)
  a na webech poskytovatelů; každý příkaz, instalaci i úpravu konfigurace spouštíš za něj ty.
- **Nikdy** nezadávej hesla uživatele a nedokončuj za něj přihlášení ani CAPTCHA.
- **Nikdy** nezapisuj reálné API klíče do souborů, které se commitují. Přesný secret soubor i rodinu názvů ověř proti gitignore; nepředpokládej, že chráněný adresář `.secrets/` znamená i ignorovaný soubor `.secrets`.
- Když je dokumentace nejasná nebo instalace vypadá rizikově, **zastav se a zeptej** místo zkoušení
  náhodných příkazů.
- Když existuje oficiální konektor, dej mu přednost — je na něm nejmíň, co se může pokazit.
