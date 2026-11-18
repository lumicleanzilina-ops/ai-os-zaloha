# Blueprinty automatizací

Katalog hotových receptů na automatizace, které stačí naplánovat. Vyber si ty, co sedí
tomu, jak pracuješ, doplň `[placeholdery]` a naplánuj je (viz
[README → Jak je zapnout](./README.md#jak-je-zapnout)).

Šest úloh je v kitu **už postavených** — [`morning-briefing`](./morning-briefing/SKILL.md),
[`weekly-improvement`](./weekly-improvement/SKILL.md), [`workspace-tidy`](./workspace-tidy/SKILL.md),
[`daily-end-session`](./daily-end-session/SKILL.md), [`nightly-backup`](./nightly-backup/SKILL.md)
a [`second-brain-declutter`](./second-brain-declutter/SKILL.md). Všechno níž je **menu**:
každý recept je samostatný prompt, který jen vložíš do naplánované úlohy. Žádnou složku
se skillem k tomu nepotřebuješ — ten prompt *je* kompletní sada instrukcí.

Každý recept tady je nezávislý na konkrétní značce. Pojmenovává **kategorie** nástrojů
(kalendář, CRM, fakturace, e-mail…) a v závorkách dává příklady konkrétních nástrojů.
Použij ty MCP servery, které máš napojené; jména v závorkách jsou jen ilustrace.

---

## Dva vzorce, díky kterým se s automatizacemi dá žít

Než se dostaneme k receptům, dvě konvence, na kterých všechno níž stojí. Nauč se je
jednou a celý katalog ti dá smysl.

### Vzorec 1 — `[SKIP]`: ve výchozím stavu ticho

Naplánovaná úloha, která ti pingne po každém jediném běhu — i když se nic nestalo — tě
naučí ji ignorovat. Řešení je jednořádková konvence: úloha, která nenajde nic, co by
stálo za hlášení, odpoví **přesně** `[SKIP]` a nic jiného. Doručování bere `[SKIP]` jako
značku ticha a nepošle nic — takže se ti monitor ozve jedině tehdy, když je fakt na co
koukat.

Rozděl si automatizace na dva druhy:

| Druh | Chování | Příklady v tomhle katalogu |
|------|----------|--------------------------|
| **Vždycky hlásí** | Běží a vždycky doručí — tu denní rutinu *chceš* | `daily-brief`, `end-of-day-wrap`, `weekly-review`, `weekly-revenue-snapshot`, `learn-daily` |
| **Ve výchozím stavu ticho** | Doručí **jen** když je něco zajímavého; jinak `[SKIP]` | `stale-deal-nudge`, `overdue-invoice-sweep`, `website-watch`, `competitor-watch`, `subscription-renewal-watch` |

Každý tichý recept níž končí přesně touhle větou — nech ji doslova:

> Pokud není nic, co by stálo za zmínku, odpověz přesně `[SKIP]` a nic nepiš ani neposílej.

**Nechtěj** po agentovi, aby se při tichých bězích vysvětloval („dnes se nic nezměnilo!") —
to celý smysl zabije. `[SKIP]` a ticho, o to přesně jde.

### Vzorec 2 — skript + agent (a nulová varianta `no-agent`)

U každého monitoru, který musí **něco stáhnout, porovnat to s minulem a zapamatovat si
stav mezi běhy**, nenechávej mechanickou část na agentovi. Tu nudnou deterministickou
práci — HTTP stažení, diff, sledování stavu — udělá drobný pomocný skript a vypíše
kompaktní výsledek na stdout. Ten stdout se stane kontextem agenta a agent dělá jen to
jediné, v čem je dobrý: úsudek („je tahle změna zajímavá, a proč?").

Skript si drží paměť v malém stavovém souboru na
**`~/.claude/<jmeno-ulohy>/state.json`** — jedna složka na úlohu, takže si monitory
navzájem nelezou do zelí.

**Ukázka v praxi — hlídání webové stránky / ceníku.**

Ulož si tenhle skript (stáhne URL, udělá hash, porovná s uloženým hashem a vypíše buď
`CHANGE DETECTED` s novým obsahem, nebo `NO_CHANGE`):

```python
# ~/.claude/website-watch/watch.py
import hashlib, json, os, sys, urllib.request

URL = "https://example.com/pricing"          # ← stránka, kterou hlídáš
STATE_DIR = os.path.expanduser("~/.claude/website-watch")
STATE_FILE = os.path.join(STATE_DIR, "state.json")
os.makedirs(STATE_DIR, exist_ok=True)

# 1. Stáhni aktuální obsah
req = urllib.request.Request(URL, headers={"User-Agent": "AICoS-Monitor/1.0"})
try:
    content = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")
except Exception as e:
    print(f"FETCH_ERROR {e}")            # ať agent posoudí, jestli chyba stahování vadí
    sys.exit(0)
current_hash = hashlib.sha256(content.encode()).hexdigest()

# 2. Načti předchozí stav
prev_hash = None
if os.path.exists(STATE_FILE):
    with open(STATE_FILE) as f:
        prev_hash = json.load(f).get("hash")

# 3. Ulož aktuální stav (kompaktně — jen to, co bude potřeba příští běh)
with open(STATE_FILE, "w") as f:
    json.dump({"hash": current_hash, "url": URL}, f)

# 4. Vypiš kompaktní diff pro agenta
if prev_hash and prev_hash != current_hash:
    print(f"CHANGE DETECTED on {URL}")
    print(f"Current content (first 2000 chars):\n{content[:2000]}")
elif prev_hash is None:
    print("NO_CHANGE (baseline saved — first run)")
else:
    print("NO_CHANGE")
```

Pak naplánuj úlohu, která tenhle skript spustí jako první a jeho stdout předá agentovi:

- **Skript:** `~/.claude/website-watch/watch.py` (spustí se pokaždé před promptem)
- **Prompt:** *„Dostal jsi stdout monitoru změn na stránce. Pokud je tam `CHANGE
  DETECTED`, shrň, co se na stránce změnilo a proč by mě to mohlo zajímat (nová cenová
  hladina, odebraná funkce, změna podmínek…), a odcituj příslušné řádky. Pokud je tam
  `NO_CHANGE` nebo `FETCH_ERROR`, odpověz přesně `[SKIP]` a nic nepiš ani
  neposílej."*
- **Rozvrh:** `0 */6 * * *` (každých 6 hodin)
- **Doručení:** tvůj chatovací kanál

Proč se tohle rozdělení vyplatí: stažení a porovnání je levné, deterministické a ve
skriptu spolehlivé; úsudek „je to zajímavé?" je přesně to, kvůli čemu model chceš. Navíc
za (běžné) tiché běhy neutratíš ani token, protože `[SKIP]` doručení zkratuje.

**Nulová varianta `no-agent`.** Když skript dokáže vyrobit *celou* finální zprávu sám —
čistý hlídač jako kontrola místa na disku nebo heartbeat, kde není co posuzovat — agenta
vůbec nepotřebuješ. Nech skript vypsat přesný text, který se má poslat (a nevypsat nic,
když je všechno v pořádku), a zaregistruj ho jako naplánovanou úlohu typu
**skript-only / `no-agent`**. Stejný plánovač, stejný vzorec se `state.json`, ale žádné
volání modelu a žádné tokeny — jen skript, jehož stdout se doručí doslova (prázdný stdout
= nic se nepošle). Po `no-agent` sáhni tam, kde je jasná hranice prošlo/neprošlo; po
hybridu tam, kde je potřeba něco interpretovat.

---

## Recepty

Seřazené podle oblastí. U každého: k čemu je, **samostatný prompt** k vložení do
naplánované úlohy, doporučený cron a kam jde výstup. Než to naplánuješ, doplň každý
`[placeholder]`.

> **Samostatný znamená samostatný.** Naplánované úlohy běží v čerstvé session bez paměti
> na tvoje chaty a preference. Každý prompt níž má v sobě zapečené *jaký nástroj použít*,
> *jaký formát vyrobit* a *kam to poslat* — takže funguje za studena. Když ho budeš
> upravovat, nech to tak.

---

### Denní rytmus

#### `daily-brief` — jeden přehledný digest na začátek dne
Stáhne dnešní kalendář, peníze, co ti někdo dluží, otevřené dealy a e-maily, co chtějí
reakci, do jednoho ranního čtení. (Hotová verze je v kitu jako
[`morning-briefing`](./morning-briefing/SKILL.md); tohle je forma na vložení jedním promptem.)

> **Prompt:**
> Jsi můj Chief of Staff a připravuješ dnešní brief. Pracuj s tím, co mám napojené —
> sekci, jejíž nástroj není k dispozici, potichu přeskoč. Vyrob JEDEN přehledný digest,
> přečtitelný do 90 vteřin:
> 1. **Kalendář** — použij moje kalendářové MCP (např. Google Calendar, Outlook). Vypiš
>    dnešní události jako `HH:MM–HH:MM Název`. Označ cokoli, co chce přípravu.
> 2. **Peníze** — použij moje fakturační MCP (např. Stripe, Fakturoid, QuickBooks). Vypiš
>    faktury po splatnosti (klient · částka · dní po splatnosti) a počet těch, co čekají
>    na zaplacení.
> 3. **Pipeline** — použij moje CRM MCP (např. HubSpot, Pipedrive). Celková hodnota
>    otevřené pipeline a každý deal, se kterým se 7+ dní nic nehnulo.
> 4. **E-mail** — použij moje e-mailové MCP (např. Gmail, Outlook). Koukni jen na
>    posledních 7 dní. Vypiš až ~12 vláken, co chtějí odpověď, rozdělených na
>    **Odpovědět dnes** / **Tento týden**, jeden řádek na každé. Newslettery a účtenky
>    shrň jako počet.
> Formátuj s nadpisy `##`. Žádná sekce „doporučené kroky" — priority jsou vidět z toho,
> co je nahoře.

- **Cron:** `0 7 * * 1-5` (07:00, všední dny)
- **Doručení:** tvůj chatovací kanál, volitelně uloženo do `docs/briefings/YYYY-MM-DD-briefing.md`

#### `end-of-day-wrap` — uzavři smyčku, než vypneš
Krátké večerní shrnutí: co se udělalo, co zůstalo otevřené a co má být zítra první
priorita.

> **Prompt:**
> Jsi můj Chief of Staff a píšeš mi shrnutí dne. Drž to krátké — za chvíli končím.
> S využitím toho, co mám napojené (chybějící potichu přeskoč):
> 1. **Dnes hotovo** — z mého MCP na úkoly/projekty (např. Notion, Linear, Todoist) vypiš
>    úkoly dokončené dnes. Z kalendářového MCP zmiň meetingy, které proběhly.
> 2. **Pořád otevřené** — úkoly, které měly být dnes hotové a nejsou, a každý e-mail
>    z posledních 2 dní (e-mailové MCP), co pořád čeká na moji odpověď.
> 3. **Zítřejší první tah** — vyber jednu jedinou nejdůležitější věc, kterou mám zítra
>    začít, na základě termínů a dnešních zbytků, a jednou větou řekni proč.
> Formát: tři krátké sekce `##`. Do 200 slov.

- **Cron:** `0 18 * * 1-5` (18:00, všední dny)
- **Doručení:** tvůj chatovací kanál

#### `on-this-day` — popostrčení z tvojí vlastní historie
Vytáhne, na čem jsi kolem tohohle data pracoval v minulých týdnech a měsících — jako
oživení paměti a kontrola ve stylu „dodělalo se to vůbec?".

> **Prompt:**
> Jsi můj Chief of Staff. Ohlédni se, co jsem dělal kolem tohohle data v minulosti.
> S tím, co je k dispozici: projdi git log mého workspace repa a uložené poznámky
> a briefingy v `docs/` za období zhruba před měsícem, před 3 měsíci a před rokem
> (nejbližší dostupná data). Vytáhni 2–4 věci, které jsou dneska zajímavé: projekt, co
> jsem pozastavil, rozhodnutí, co jsem udělal, cíl, co jsem si dal, nebo závazek, co mi
> možná propadl. U každé jeden řádek, co to bylo, a jeden řádek s otázkou, kterou to
> dneska vyvolává („platí to pořád?", „vyšlo to?"). Pokud fakt nic z minulých období
> nenajdeš, napiš to jednou větou. Drž to vlídné a krátké.

- **Cron:** `0 9 * * 1` (09:00, pondělí)
- **Doručení:** tvůj chatovací kanál

---

### Inbox a komunikace

#### `inbox-triage-digest` — tvůj inbox, roztříděný, jednou denně
Přečte poslední dny pošty a vrátí roztříděný digest, takže otevíráš schránku už s tím, že
víš, co je důležité.

> **Prompt:**
> Jsi můj Chief of Staff a třídíš mi inbox. Použij moje e-mailové MCP (např. Gmail,
> Outlook). Pokud mám víc schránek, projdi každou a u každé položky označ, ze které
> schránky je. Kouknij se **jen na posledních 7 dní** — pusť doplňující dotazy, ať nic
> neproklouzne (nepřečtené v inboxu, přečtené v inboxu, co může pořád čekat na odpověď,
> a odeslané kvůli kontextu vlákna). Roztřiď každé vlákno:
> - **Odpovědět dnes** — klienti, nabídky, cokoli časově omezeného nebo urgentního
> - **Tento týden** — méně urgentní, pořád chce odpověď
> - **Na vědomí / ignorovat** — newslettery, notifikace, účtenky (hlas jen jako počet
>   + 2–3 kategorie)
> Každé akční vlákno vypiš jako jeden řádek: `[odesílatel] · [předmět] — co chce /
> kontext / případný termín [označení schránky]`. Maximálně ~15 akčních vláken. Radši
> užitečný popis než strohý.

- **Cron:** `0 8 * * 1-5` (08:00, všední dny)
- **Doručení:** tvůj chatovací kanál

#### `meeting-followup` — z meetingu udělej úkoly a koncept odpovědi
Po meetingu stáhne přepis, vytáhne rozhodnutí a úkoly a napíše koncept follow-up e-mailu,
který si projdeš a odešleš.

> **Prompt:**
> Jsi můj Chief of Staff a řešíš follow-up k mému poslednímu meetingu s názvem
> `[název meetingu nebo "dnešní poslední hovor"]`. Postup:
> 1. Stáhni přepis/souhrn z mého MCP na zápisy z meetingů (např. Fireflies, Otter,
>    Fathom, nebo ze souboru s přepisem, na který tě navedu). Když sedí víc nedávných
>    meetingů, vezmi ten nejnovější a napiš, který jsi použil.
> 2. Vytáhni: **udělaná rozhodnutí**, **úkoly** (s tím, kdo je má a do kdy) a
>    **otevřené otázky**.
> 3. Napiš koncept follow-up e-mailu ostatním účastníkům: vlídné jednořádkové poděkování,
>    krátká rekapitulace rozhodnutí, jasný seznam kdo-co-do-kdy a jeden další krok.
> 4. Založ ho jako **koncept** přes moje e-mailové MCP, pokud to umí (NEODESÍLEJ). Jinak
>    mi koncept vypiš jako text, ať si ho zkopíruju.
> Úkoly nahlas jako checklist a pod něj dej koncept e-mailu. Nic mým jménem neodesílej.

- **Cron:** `0 17 * * 1-5` (17:00, všední dny — po denních meetinzích)
- **Doručení:** **koncept** e-mailu (nikdy neodesílat automaticky) + checklist do tvého chatovacího kanálu

---

### Byznys a peníze

#### `stale-deal-nudge` — popostrč dealy, které utichly
Najde otevřené CRM příležitosti, kde se víc než N dní nic nedělo — tedy ty, které
nejspíš propadnou — a ke každé napíše nakopnutí.

> **Prompt:**
> Jsi můj Chief of Staff a procházíš mi obchodní pipeline. Použij moje CRM MCP (např.
> HubSpot, Pipedrive, Salesforce). Najdi **otevřené** příležitosti, kde **za posledních
> `[N=14]` dní nebyla žádná aktivita**. U každého takového dealu dej: kontakt/firma ·
> hodnota dealu · fáze · počet dní od poslední aktivity · jednořádkový konkrétní návrh
> dalšího kroku (ne „ozvat se" — řekni, *s čím* se ozvat, podle poslední poznámky
> u dealu, pokud je k dispozici). Seřaď podle hodnoty, od nejvyšší. Omez se na top 10.
> Pokud není nic, co by stálo za zmínku, odpověz přesně `[SKIP]` a nic nepiš ani neposílej.

- **Cron:** `0 9 * * 1,4` (09:00, pondělí a čtvrtky)
- **Doručení:** tvůj chatovací kanál

#### `overdue-invoice-sweep` — chyť peníze, co mají zpoždění
Projede fakturační nástroj, najde faktury po splatnosti a označí je podle toho, jak moc
se opozdily — aby nic neleželo nezaplacené bez povšimnutí.

> **Prompt:**
> Jsi můj Chief of Staff a kontroluješ nezaplacené peníze. Použij moje fakturační/účetní
> MCP (např. Fakturoid, Stripe, QuickBooks, Xero). Pokud mám víc účtů nebo firem, projdi
> každou. Vypiš každou fakturu **po splatnosti**: číslo faktury · klient · částka ·
> datum splatnosti · dní po splatnosti. Seřaď od nejdéle po splatnosti a rozděl je do
> košů: **>30 dní** (eskalovat), **8–30 dní** (druhá upomínka), **1–7 dní** (jemné
> popostrčení). Dej celkovou částku po splatnosti. Každou jednotlivou fakturu nad
> `[hranice částky, např. 25 000 Kč]` výslovně označ. Když dotaz vrátí prázdno, ale
> čekal bys data, zkus to jednou zopakovat, než uzavřeš, že nic není.
> Pokud není nic, co by stálo za zmínku, odpověz přesně `[SKIP]` a nic nepiš ani neposílej.

- **Cron:** `0 9 * * 1-5` (09:00, všední dny)
- **Doručení:** tvůj chatovací kanál

#### `weekly-revenue-snapshot` — obrázek o penězích, jednou týdně
Týdenní finanční tep: co přišlo, co visí a co je v pipeline — takže vždycky znáš číslo,
aniž bys otevřel pět dashboardů.

> **Prompt:**
> Jsi můj Chief of Staff a skládáš můj týdenní přehled tržeb za posledních 7 dní.
> S tím, co mám napojené (chybějící sekce potichu přeskoč):
> 1. **Vybráno** — z mého fakturačního/platebního MCP (např. Fakturoid, Stripe) celkem
>    zaplaceno tento týden a počet zaplacených faktur.
> 2. **Visí** — celkem stále čeká na zaplacení a celkem po splatnosti.
> 3. **Pipeline** — z mého CRM MCP celková hodnota otevřené pipeline a počet otevřených
>    dealů; zmiň ty, co se tento týden vyhrály nebo prohrály.
> 4. **Čtení** — jedna dvě věty: jde trend nahoru, nebo dolů oproti normálnímu týdnu,
>    a které jedno číslo by mě mělo zajímat nejvíc?
> Formátuj jako kompaktní tabulku plus to dvouvětné čtení. Tohle je úloha, co hlásí
> vždycky — doruč i ve slabém týdnu.

- **Cron:** `0 8 * * 1` (08:00, pondělí)
- **Doručení:** tvůj chatovací kanál, volitelně `docs/reports/YYYY-MM-DD-revenue.md`

---

### Hlídání

> Tohle jsou recepty, které jsou ve výchozím stavu tiché. První dva používají **hybrid
> skript + agent** ze Vzorce 2 — pomocný skript si drží stav v
> `~/.claude/<uloha>/state.json` a agent jen posoudí, jestli změna něco znamená.

#### `website-watch` — ozve se, jen když se stránka změní
Hlídá konkrétní URL (ceník konkurence, stránku dokumentace, obchodní podmínky) a ozve se
jen tehdy, když se obsah opravdu změní. Používá ukázku ze Vzorce 2.

- **Skript:** `~/.claude/website-watch/watch.py` (skript na hlídání změn výše — nastav `URL` na `[stránku, co tě zajímá]`)
> **Prompt:**
> Dostal jsi stdout monitoru změn na stránce. Pokud je tam `CHANGE DETECTED`, shrň, co se
> na stránce změnilo a proč by mě to mohlo zajímat (nová cenová hladina, odebraná funkce,
> změněné podmínky…), a odcituj příslušné řádky. Pokud je tam `NO_CHANGE` nebo
> `FETCH_ERROR`, odpověz přesně `[SKIP]` a nic nepiš ani neposílej.

- **Cron:** `0 */6 * * *` (každých 6 hodin)
- **Doručení:** tvůj chatovací kanál

#### `competitor-watch` — sleduj veřejné tahy konkurence
Hlídá blog/changelog/RSS feed konkurenta (nebo jejich seznam) a vytáhne jen opravdu nové
a smysluplné položky. Stejný tvar jako `website-watch`, jen namířený na feed místo na
stránku.

- **Skript:** `~/.claude/competitor-watch/watch.py` — drobný skript, co stáhne každou URL feedu v `[seznam RSS/Atom nebo changelog URL]`, zapíše ID/odkazy viděných položek do `~/.claude/competitor-watch/state.json` a vypíše jen položky, co ještě neviděl (titulek + odkaz + prvních ~300 znaků), nebo `NO_NEW_ITEMS`.
> **Prompt:**
> Dostal jsi stdout monitoru feedů konkurence se seznamem položek publikovaných od
> posledního běhu. Pokud tam nové položky jsou, vyber ty, na kterých fakt záleží (launch,
> změna cen nebo positioningu, významný nábor, velká funkce) a každou shrň na jeden řádek
> i s odkazem; rutinní a triviální posty přeskoč. Pokud je výstup `NO_NEW_ITEMS` nebo tam
> není nic podstatného, odpověz přesně `[SKIP]` a nic nepiš ani neposílej.

- **Cron:** `0 8 * * 1-5` (08:00, všední dny)
- **Doručení:** tvůj chatovací kanál, volitelně přidáno do souboru s poznámkami

#### `subscription-renewal-watch` — žádné překvapivé obnovy
Upozorní tě pár dní předtím, než se obnoví předplatné nebo smlouva, ať stihneš zrušit
nebo vyjednat něco jiného, místo abys objevil strženou platbu až potom.

> **Prompt:**
> Jsi můj Chief of Staff a hlídáš nadcházející obnovy. Projdi zdroje, které mám napojené:
> opakované platby v mém platebním/účetním MCP (např. Fakturoid, Stripe, QuickBooks),
> e-maily o obnovení nebo účtenky v mém e-mailovém MCP za posledních 14 dní (např.
> vyhledávání v Gmailu na „obnov OR předplatné OR renew OR subscription OR receipt")
> a jakýkoli seznam obnov, co si vedu v `docs/`. Vytáhni všechno, co se **obnovuje
> v následujících `[N=7]` dnech**: služba · částka · datum obnovy · jak to zrušit nebo
> změnit, pokud to najdeš. Každou obnovu nad `[hranice částky]` označ k rozhodnutí.
> Obnovy dál než N dní ignoruj.
> Pokud není nic, co by stálo za zmínku, odpověz přesně `[SKIP]` a nic nepiš ani neposílej.

- **Cron:** `0 9 * * *` (09:00, denně)
- **Doručení:** tvůj chatovací kanál

---

#### `claude-whats-new` — novinky v Anthropicu/Claudovi, nahlášené tobě

Jednou týdně zkontroluje, co Anthropic vydal pro **Claude** (changelog Claude Code,
poznámky k vydání, dokumentace), a **napíše ti krátký digest „co je nového v Claudovi"** —
takže nemusíš sledovat nic a kdykoli se agenta zeptáš *„co se v Claudovi poslední dobou
změnilo?"*.

> **Prompt:**
> Jsi můj Chief of Staff a držíš mě v obraze **výhradně ohledně Claude / Anthropic**
> (nic jiného). Stáhni oficiální release notes / changelog Claude Code od Anthropicu
> a případnou stránku s aktualizacemi dokumentace. Porovnej to s tím, cos hlásil minule
> (viděné verze a data si drž v `~/.claude/claude-whats-new/state.json`, volitelně si
> stahovanou dokumentaci zrcadli lokálně do `docs/claude-docs/`). Pak napiš krátké
> **„Co je nového v Claudovi"** normální řečí: každá nová funkce, změna nebo oprava na
> jeden řádek — co to je a proč by mě to zajímalo — od nejnovějšího. Cokoli se od
> posledního běhu nezměnilo, přeskoč.
> Pokud fakt není nic nového, odpověz přesně `[SKIP]` a nic nepiš ani neposílej.

- **Cron:** `0 9 * * 1` (09:00, pondělí)
- **Doručení:** tvůj chatovací kanál a lokální zrcadlo dokumentace, ať se kdykoli můžeš zeptat *„co je nového v Claudovi?"*.

### Obsah

#### `content-idea-miner` — stálý přísun věcí, o kterých můžeš postovat
Doluje nápady na obsah z tvojí vlastní nedávné práce a z tvojí tématické oblasti, takže
nikdy nekoukáš na prázdnou stránku. Z toho, co jsi už udělal, dělá nápady k publikování.

> **Prompt:**
> Jsi můj Chief of Staff a generuješ nápady na obsah o `[moje téma, např. AI automatizace
> pro malé týmy]` pro `[moje kanály, např. LinkedIn / newsletter / YouTube]`. Čerpej ze
> dvou studní:
> 1. **Můj vlastní týden** — projdi git log mého workspace a poznámky nebo briefingy
>    v `docs/` za posledních 7 dní a hledej problémy, co jsem vyřešil, rozhodnutí, co jsem
>    udělal, nebo věci, co jsem se naučil. Z těchhle jsou nejautentičtější posty.
> 2. **Téma obecně** — pokud mám napojený nástroj na vyhledávání na webu, najdi 2–3
>    aktuálně diskutované úhly v mém tématu; když ho nemám, přeskoč.
> Vyrob **5 konkrétních nápadů**. U každého: hook/titulek, úhel jednou větou a formát
> (krátký post / vlákno / video / sekce newsletteru). Dávej přednost konkrétním nápadům
> ze zkušenosti před obecnými radami. Tohle je úloha, co hlásí vždycky.

- **Cron:** `0 10 * * 2` (10:00, úterky)
- **Doručení:** tvůj chatovací kanál, volitelně `docs/content-ideas/YYYY-MM-DD.md`

---

### Znalosti a ty sám

#### `learn-daily` — jedna věc, co stojí za to vědět, každý den
Malá denní dávka učení v tvém oboru: jedna nedávná novinka nebo myšlenka, krátce
vysvětlená, a proč se tě týká.

> **Prompt:**
> Jsi můj Chief of Staff a denní parťák na učení pro obor `[můj obor/zájem, např.
> aplikovaná AI]`. S nástrojem na vyhledávání na webu, pokud ho mám napojený, najdi JEDNU
> opravdu užitečnou novinku, koncept nebo zdroj z posledních dnů. Vysvětli mi to ve ~150
> slovech: co to je, proč na tom záleží a jeden konkrétní způsob, jak by se to dalo
> použít v mojí práci. Přilož odkaz na víc čtení. Drž se jediné myšlenky — radši do
> hloubky než do šířky. Pokud si vedu znalostní bázi (např. MCP na poznámky nebo složku
> `docs/`), přidej tam k tomu i odstavec, ať se to hromadí. Tohle je úloha, co hlásí
> vždycky.

- **Cron:** `0 8 * * 1-5` (08:00, všední dny)
- **Doručení:** tvůj chatovací kanál (plus přidaná poznámka, pokud si vedeš znalostní bázi)

#### `weekly-review` — poctivý týdenní krok zpátky
Strukturovaná týdenní revize: co jsi dokázal, co se zaseklo a na co se zaměřit příští
týden. Doplňuje audit [`weekly-improvement`](./weekly-improvement/SKILL.md), který je
zaměřený na systém — tenhle je o *tvojí práci*, ne o nastavení AI.

> **Prompt:**
> Jsi můj Chief of Staff a děláš moji týdenní revizi za posledních 7 dní. Čerpej z toho,
> co mám napojené (chybějící zdroje potichu přeskoč): dokončené i pořád otevřené položky
> z mého MCP na úkoly/projekty, meetingy, co proběhly (kalendářové MCP), obrázek o penězích
> (fakturační + CRM MCP) a git log mého workspace. Pak vyrob:
> 1. **Výhry** — 3–5 věcí, co se fakt udělaly nebo pohnuly dopředu.
> 2. **Zaseknuté** — co se nehnulo, ačkoli mělo, a (krátce) proč.
> 3. **Čísla** — jednořádkový tep: peníze dovnitř/ven, otevřené dealy, uzavřené vs.
>    otevřené úkoly.
> 4. **Fokus na příští týden** — top 3 priority na nadcházející týden, u každé první
>    konkrétní krok.
> Buď poctivý a konkrétní — tohle je skutečná retrospektiva, ne sestřih nejlepších
> momentů. Do 400 slov. Tohle je úloha, co hlásí vždycky.

- **Cron:** `0 17 * * 5` (17:00, pátky)
- **Doručení:** tvůj chatovací kanál, volitelně `docs/reviews/YYYY-MM-DD-weekly-review.md`

---

## Cron — rychlý přehled

Formát cronu je `minuta hodina den-v-měsíci měsíc den-v-týdnu`.

| Výraz | Význam |
|-----------|---------|
| `0 7 * * 1-5` | 07:00, pondělí–pátek |
| `0 8 * * 1` | 08:00, každé pondělí |
| `0 17 * * 5` | 17:00, každý pátek |
| `0 9 * * *` | 09:00, každý den |
| `0 9 * * 1,4` | 09:00, pondělí a čtvrtky |
| `0 */6 * * *` | Každých 6 hodin, vždy v celou |
| `*/30 * * * *` | Každých 30 minut |

**Úlohy, které zapisují do stejného repa, rozestup.** Když se dvě spustí na stejnou
minutu a obě commitnou do tvého workspace, můžou se poprat o git index. Dej jim radši
různé minuty a časy, než abys je odpálil všechny najednou.

## Kam doručovat

Kam jde výstup receptu, je na tobě. Obvyklé volby:

- **Tvůj chatovací kanál** — výchozí volba pro briefy, digesty a upozornění z monitorů,
  které chceš *vidět*.
- **Uložený soubor v `docs/`** — pro věci, které chceš hromadit jako prohledávatelnou
  historii (briefingy, revize, přehledy tržeb). Když úloha commituje soubor, nech ji
  commitnout **jen její vlastní výstupní soubor** a nikdy nespouštět destruktivní git
  příkazy (`checkout` / `reset` / `stash` / `clean` / `add -A`) — takhle je bezpečná
  vedle jiné práce ve stejném repu.
- **Koncept, nikdy neodeslaný automaticky** — pro cokoli, pod čím zůstane tvoje jméno
  (`meeting-followup`). Založ koncept a před odesláním si ho projdi.

## Zapnutí a testování

Jak z libovolného receptu udělat živou naplánovanou úlohu — a ten důležitý návyk **spustit
ji jednou ručně, než začneš věřit cronu** — najdeš v
[README → Jak je zapnout](./README.md#jak-je-zapnout) a
[README → Dvě konvence](./README.md#dvě-konvence). Naplánovaná úloha, kterou jsi nikdy
nespustil, je jen odhad; jeden ruční běh ti řekne, jestli je prompt fakt samostatný.
