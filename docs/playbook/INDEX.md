# Rejstřík playbooku — řemeslná pravidla, se kterými se kit veze

> **Co to je.** Dvacet osm provozních pravidel destilovaných z reálných incidentů v produkčním
> systému, ze kterého tenhle kit vznikl — jak dodávat práci, jak ověřit číslo, kde nástroje selhávají
> potichu, co zkontrolovat, než něco zničíš.
>
> **Tohle není tvoje paměť.** Tvoje vlastní pravidla — ta, co vzniknou z toho, jak opravuješ *svého*
> agenta na *své* práci — patří do [`../learnings/`](../learnings/), která začíná záměrně prázdná.
> Tahle složka je tovární nastavení; ta druhá se stane tvojí.
>
> **Jak to používat:** než sáhneš na doménu níže, přečti si pravidla z toho řádku. Řádky jsou psané
> jako **spouštěče** („když děláš X"), ne jako témata. Ta nejdůležitější pravidla odsud už jsou
> v ústavě, takže si nemusíš pamatovat, že se sem máš podívat — tohle je hloubka za nimi.
>
> **Cokoliv tady můžeš změnit nebo smazat.** Je to výchozí pozice, ne svěrací kazajka. Když ti
> pravidlo nesedí k tomu, jak pracuješ, přepiš ho.

---

## 🔴 Meta — platí na všechno

| Kdy | Pravidlo |
|---|---|
| Než sáhneš na **jakoukoliv doménu níže** | [an-unread-rule-is-worth-nothing](an-unread-rule-is-worth-nothing.md) ⚠️ — nejdražší selhání v sebezlepšujícím se systému je pravidlo, které se napsalo a nikdy nepřečetlo. Nové pravidlo = soubor **+ řádek sem** |
| Chystáš se říct **„X neexistuje / to nejde / na to není nástroj"** | [search-before-claiming-it-doesnt-exist](search-before-claiming-it-doesnt-exist.md) ⚠️ — tvoje trénovací data tě tlačí k „neexistuje". Když uživatel tvrdí, že to existuje, hledej dál; když všechny varianty selžou úplně stejně, podezřívej to, co mají **společné** |
| Chystáš se **položit uživateli otázku** | [one-question-at-a-time](one-question-at-a-time.md) — nejdřív prohledej projekt; pak se zeptej na **jednu** věc, ne na balík |
| Uživatel ti v jedné zprávě dal **víc faktů** (jména, data, čísla, podmínky) a ty s nimi budeš pracovat přes víc kroků nebo subagentů | [write-facts-down-before-asking](write-facts-down-before-asking.md) ⚠️ — nejdřív je zapiš doslova do souboru projektu a před každou otázkou ten soubor prohledej; subagentům je předej doslova, hypotéza není fakt |
| **Vyhodnocuješ cizí repo / kit / skill**, ze kterého chceš čerpat | [read-the-license-before-you-reuse-code](read-the-license-before-you-reuse-code.md) ⚠️ — `LICENSE` a `NOTICE` **před** funkční analýzou. Hlídej zákazy přebalení a nepřenositelnost. **Žádný licenční soubor = plné autorské právo**, ne volnost |
| **Shrnuješ nebo doporučuješ cizí dokument** | [translate-or-flag-borrowed-jargon](translate-or-flag-borrowed-jargon.md) — přelož jejich žargon nebo ho označ za jejich; než něco pochválíš, promysli si jejich argument sám |

## 📦 Dodávka práce

| Kdy | Pravidlo |
|---|---|
| Právě jsi **vyrobil soubor** — obrázek, PDF, prezentaci, report, export | [deliver-dont-announce](deliver-dont-announce.md) ⚠️ — absolutní cesta + náhled v chatu + otevřít složku, a to ve **stejné** odpovědi. „Kde to je?" je tvoje selhání |
| Chystáš se prohlásit úkol za **hotový** | [a-deliverable-must-survive-the-session](a-deliverable-must-survive-the-session.md) ⚠️ — chat, `localhost` ani odpojená branch se nepočítají. Pracuješ ve worktree? Zkopíruj to do hlavní branche a commitni **tam** |
| Uživatel si řekl o výstup a ty máš chuť si nejdřív **zasyncovat / commitnout / uklidit** | [deliverable-before-maintenance](deliverable-before-maintenance.md) — nejdřív ta věc, infrastruktura potom |
| **Uklízíš** složku nebo spouštíš **hromadný** destruktivní příkaz | [understand-before-you-destroy](understand-before-you-destroy.md) ⚠️ — má to hodnotu → **přesuň**, nemaž. Výpis cílů je samostatný krok, který si **přečteš**; rozbitý filtr selže naprázdno a pustí skrz všechno |
| Chystáš se vypnout / smazat / archivovat cokoliv **blízko peněz** | [dont-touch-anything-that-can-take-a-payment](dont-touch-anything-that-can-take-a-payment.md) ⚠️ — „mohla by tudy projít platba?" Ano nebo nevíš → zeptej se. Mrtvý zdroj příjmů selhává potichu |

## 🔢 Čísla a tvrzení

| Kdy | Pravidlo |
|---|---|
| Píšeš do reportu **jakékoliv číslo** | [an-incomplete-total-is-worse-than-a-missing-line](an-incomplete-total-is-worse-than-a-missing-line.md) ⚠️ — všechno aktivní dovnitř, všechno neaktivní ven; neověřené označ, místo abys ho zahodil |
| Výsledek je **čistá nula** nebo jinak podezřele dobrý | [a-suspiciously-good-zero](a-suspiciously-good-zero.md) ⚠️ — správné pole? měřeno až po dokončení? tichá chyba dotazu? druhý zdroj? |
| Vytáhl jsi číslo přes **klíč, který jsi našel nebo zdědil** | [dont-trust-a-working-key-to-be-the-right-account](dont-trust-a-working-key-to-be-the-right-account.md) ⚠️ — platná odpověď dokazuje, že klíč funguje, ne čí účet čte |
| Třetí strana tvrdí **„to nemáme / to nevidím"** | [a-third-partys-limitation-is-not-a-fact](a-third-partys-limitation-is-not-a-fact.md) ⚠️ — to je tvrzení o jejich evidenci, ne o realitě. Obzvlášť když jim ta mezera vyhovuje |
| **Metrika vyskočila nebo spadla** a ty hledáš proč | [when-a-metric-moves-check-the-measurement-first](when-a-metric-moves-check-the-measurement-first.md) ⚠️ — nezměnil se měřicí aparát? Jeden čistý den kolem deploye to oddělí |
| Spoléháš na **starší závěr** („tohle je rozbité", „tamto je zastaralé") | [metadata-is-not-proof-of-correctness](metadata-is-not-proof-of-correctness.md) — místo obhajoby ho přeměř; data souborů nedokazují nic |
| Něco **prošlo do půlky** — platba proběhla, klik dorazil, zpráva byla přijata | [verify-the-whole-chain-not-the-visible-half](verify-the-whole-chain-not-the-visible-half.md) ⚠️ — poslední snadno ověřitelný bod vypadá jako cílová páska a je to půlka cesty |

## 🔐 Bezpečnost

| Kdy | Pravidlo |
|---|---|
| Přidáváš do repa **cokoliv, co vypadá jako přístupový údaj**, nebo píšeš `.gitignore` | [secret-scanning-must-cover-the-whole-file-family](secret-scanning-must-cover-the-whole-file-family.md) ⚠️ — `.env` nesedí na `.env.bak.2026-01-01`. Ověř přes `git check-ignore -v`. Uniklo = **rotovat**, ne smazat |

## 🔌 Nástroje, co selhávají potichu

| Kdy | Pravidlo |
|---|---|
| Chystáš se **automatizovat klikání v prohlížeči** | [prefer-the-api-over-clicking-in-a-browser](prefer-the-api-over-clicking-in-a-browser.md) — nejdřív si vypiš, co umí API; „to nejde" potřebuje důkaz, ne dojem |
| Pamatuješ si, že **konektor něco neumí** | [your-notes-about-a-tool-go-stale](your-notes-about-a-tool-go-stale.md) ⚠️ — než začneš stavět obezličku, zkontroluj živý seznam nástrojů. To, že už nějakou obezličku máš, je právě ten signál ke kontrole |
| **Klíč nebo konfigurace od uživatele nefunguje** | [dont-blame-the-user-before-the-vendor](dont-blame-the-user-before-the-vendor.md) — vyčerpej technickou diagnostiku dřív, než naznačíš, že udělal chybu |

## ✍️ Psaní a výzkum

| Kdy | Pravidlo |
|---|---|
| Píšeš **postup v UI** nebo píšeš **pro publikum** | [dont-guess-a-ui-path-or-an-audience](dont-guess-a-ui-path-or-an-audience.md) ⚠️ — nikdy klikací cestu po paměti; zjisti, na co tenhle kus navazuje, a sáhni po reálných datech o publiku |
| Píšeš **status update nebo report** | [a-report-reads-like-a-sentence](a-report-reads-like-a-sentence.md) — nejdřív důsledek, surový výstup do souboru, na konci další krok |
| Dokument prošel **zhruba třemi a víc koly úprav** a chystá se ven | [a-series-of-correct-edits-can-break-the-whole](a-series-of-correct-edits-can-break-the-whole.md) ⚠️ — jeden vyhrazený průchod na křížové odkazy, přesunutá čísla, osiřelé kusy a nosné podmínky |
| Publikuješ **texty v jazyce nebo doméně, kde jsi slabý** | [verify-in-your-weak-spots](verify-in-your-weak-spots.md) — nech to nejdřív zkontrolovat nástrojem, který je v tom silnější; jen na texty, co jdou ven |
| Plánuješ **deep research napříč několika modely** | [multi-model-research-needs-two-rounds](multi-model-research-needs-two-rounds.md) ⚠️ — rozbíhavé kolo, pak vyhrazený recenzent. Shoda mezi modely je hypotéza, ne důkaz |
| Uživatel tě staví **nad odborníka s titulem** | [take-the-role-keep-the-calibration](take-the-role-keep-the-calibration.md) — vezmi tu roli a pak pojmenuj, kde by tvoje selhání nebylo vidět |
