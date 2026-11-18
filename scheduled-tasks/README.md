# Scheduled Tasks (naplánované úlohy)

Recepty pro opakovanou práci tvého AI Chief of Staffa. Každá úloha je jeden `SKILL.md` s instrukcemi; samotný soubor ani jeho zkopírování nikam neregistruje rozvrh. Agent je může napojit na scheduler skutečně dostupný v tvém prostředí; v Claude Desktopu je ověřený postup [níže](#ranní-rutina-v-claude-desktopu). Aktivní úloha potřebuje ověřený ruční i skutečný plánovaný běh podle [SETUP](../docs/SETUP.md).

## Úlohy

| Úloha | Co dělá | Doporučený rozvrh |
|------|-------------|----------------------|
| [`morning-briefing`](./morning-briefing/SKILL.md) | Jeden přehledný digest dneška: kalendář, faktury po splatnosti i čekající, obchodní pipeline, e-maily, které chtějí reakci, otevřené úkoly. | Každý všední den, brzy ráno |
| [`weekly-improvement`](./weekly-improvement/SKILL.md) | Sebeaudit ústavy AGENTS.md, learningů, skillů, paměti, druhého mozku, git historie a posledních sessions → uložený plán s nejdůležitějšími vylepšeními. Návrh, který se objeví potřetí, se provede, zruší, nebo jde jako ano/ne do registru otevřených bodů; s vaultem opraví rozpory ve wiki a přidá zdroje čísel do `docs/GROUND-TRUTH.md`. | Týdně (např. v pondělí ráno) |
| [`workspace-tidy`](./workspace-tidy/SKILL.md) | Večerní úklid workspace. Najde deliverables, co se válí na špatném místě, přesune je tam, kam patří (`outputs/` pro hotové věci, `work/` pro pomocné), pošle systémový balast do koše a napíše krátký report. **Přesouvá, nemaže.** | Denně (večer, ~20:00) |
| [`daily-end-session`](./daily-end-session/SKILL.md) | Automatické uzavření dne — projde, co se za den udělalo, zachytí learningy, doplní záznamy sessions (jedna session = jeden soubor) a pošle krátké shrnutí. S druhým mozkem navíc připíše den do `log.md` a do stránky projektu ve wiki. **Takže nikdy nemusíš psát `/end` sám.** | Denně (večer, ~22:00) |
| [`nightly-backup`](./nightly-backup/SKILL.md) | Commitne a pushne tvůj workspace (a vault druhého mozku) do **privátního GitHub repa** — celý systém je tak verzovaný a zazálohovaný mimo tvůj počítač. Viz [`modules/github-backup/`](../modules/github-backup/README.md). | Denně (pozdě večer, ~23:00) |
| [`second-brain-declutter`](./second-brain-declutter/SKILL.md) | Měsíční úklid druhého mozku. Sesbírá všechno, co se brain za poslední měsíc naučil, rozdělí to podle oblastí a provede tě ~10minutovou revizí ve stylu nechat / uklidit / vyhodit. **Nikdy nic nemaže sám** — navrhuje, rozhoduješ ty, a „vyhodit" znamená přesun do koše. | Měsíčně (1. v měsíci, ~10:00) |

Když potřebná integrace není napojená, agent označí příslušnou část jako přeskočenou nebo neověřenou. Nevydává chybějící data za prázdný výsledek. Po přidání integrace znovu ověř vstupy a výstup úlohy.

**Chceš víc?** Tyto recepty jsou podkladem pro konfiguraci a ověření. Menu dalších receptů,
ze kterých si můžeš vybrat a zapnout je — denní brief, třídění inboxu, popostrčení uvadajících
dealů, přehled faktur po splatnosti, follow-up po meetingu, hlídání změn, doly na nápady na
obsah a další — najdeš v [`BLUEPRINTS.md`](./BLUEPRINTS.md). Každý blueprint je samostatný
prompt, který jen vložíš do naplánované úlohy.

## Doporučené cron rozvrhy

Formát cronu je `minuta hodina den-v-měsíci měsíc den-v-týdnu`.

| Úloha | Cron | Kdy |
|------|------|------|
| `morning-briefing` | `0 7 * * 1-5` | 07:00, po–pá |
| `weekly-improvement` | `0 9 * * 1` | 09:00, každé pondělí |
| `workspace-tidy` | `0 20 * * *` | 20:00, každý den |
| `daily-end-session` | `0 22 * * *` | 22:00, každý den |
| `nightly-backup` | `0 23 * * *` | 23:00, každý den (po end-session) |
| `second-brain-declutter` | `0 10 1 * *` | 10:00, 1. den v měsíci |

V Claude Desktopu místo cronu zvolíš předvolbu (**Weekdays**, **Daily**, **Weekly**, **Hourly**) a čas; vlastní cron jde zadat až ve formuláři **Edit** v režimu **Custom** (čas se počítá podle tvých hodin, dny a měsíce se píšou čísly, neděle je `0`).

**Úlohy, které zapisují do stejného repa, rozestup.** Když se dvě spustí na stejnou minutu
a obě commitnou do tvého workspace, můžou se poprat o git index. Dej jim radši různé časy
(jako v tabulce výše), než abys je odpálil všechny najednou.

Vyber si časy, co sedí tvému dni — briefing má smysl jen tehdy, když dorazí dřív, než
začneš pracovat.

## JAK JE ZAPNOUT

Řekni agentovi například „chci ranní briefing každý všední den v 7:00“. Agent s tebou zvolí časovou zónu, rozvrh, přesný workspace, účty a oprávnění, formát a místo výstupu. Recept přečte a připraví samostatný prompt s konkrétními cestami k potřebným instrukcím, profilu a zdrojům. Zachová tvá existující nastavení; nový rozvrh nesmí omylem vytvořit druhou kopii stejné úlohy.

Nejprve proveďte ruční test. Pak se úloha zaregistruje v plánovači aplikace a ověří se jeden skutečný plánovaný běh: název nebo ID registrace, čas, výsledek a cesta či stav v cílovém systému. Ruční test sám neprokazuje funkční rozvrh. Zjistěte také, jak úlohu pozastavit a zrušit.

**Claude Desktop (záložka Code):** postup je ověřený a stojí v další sekci. Úlohu v appce zakládáš ty, protože je to trvalé nastavení tvého účtu; agent tě vede, připraví instrukce a běh s tebou ověří. Kit nedodává univerzální slash příkaz `/schedule` a úlohy neregistruje zkopírováním souborů do `~/.claude/scheduled-tasks/`.

**Jiná aplikace (Codex, Cursor…):** agent nejdřív zjistí její plánovač a aktuální postup z dokumentace nebo z obrazovky, klikání nehádá a stejný mechanismus neslibuje. Není-li vhodný plánovač dostupný, recept spustí na vyžádání a automatizaci označí jako neověřenou.

## RANNÍ RUTINA V CLAUDE DESKTOPU

Postup je ověřený podle oficiální dokumentace Claude Code Desktop (16. 11. 2026) a platí pro každou lokální úlohu z tohoto katalogu; ranní briefing je jen nejčastější příklad. Agent úlohu v appce nezakládá sám: vede tě krok za krokem a pomůže s textem, vytvoříš ji ty.

### Co musí platit

- Claude Desktop 1.1.5368 nebo novější, záložka Code. Funguje i na tarifu Pro.
- Lokální úloha běží jen se spuštěnou aplikací a probuzeným počítačem. Spí-li počítač v čase spuštění, běh se přeskočí; po probuzení nebo po spuštění aplikace se zmeškaný běh dožene jednou (poslední zmeškaný termín). Zavřené víko notebooku počítač uspí. Pomáhá zapnout **Keep computer awake** (Settings → Desktop app, nebo Settings → This computer → System). Úloha se může spustit s prodlevou několika minut po zvoleném čase.
- Úloha, která má běžet i při vypnutém počítači, musí být cloudová. Cloudová úloha ale pracuje s čerstvou kopií repozitáře z GitHubu, ne s tvou pracovní složkou, takže tento postup (lokální úloha nad pracovní složkou AI OS) nenahrazuje.
- Nejdřív proběhne ruční test (viz výše) a doladí se obsah briefingu.

### Postup

1. **Agent připraví text instrukcí.** Úloha běží v čerstvé session bez paměti na tvoje chaty, takže prompt musí být samostatný. Pro ranní briefing například (hodnoty v hranatých závorkách agent doplní):

   > Pracovní složka je [ABSOLUTNÍ CESTA K WORKSPACE]. Přečti `docs/profil/user-preferences.md` a `docs/profil/user-systems.md` a podle `scheduled-tasks/morning-briefing/SKILL.md` připrav dnešní ranní briefing z mých napojených zdrojů ([VYBRANÉ ZDROJE]). Ulož ho do `docs/briefings/[RRRR-MM-DD]-briefing.md` a v odpovědi ho shrň. Nic neodesílej a nic nemaž; zdroj, který není dostupný, přeskoč a napiš to.

2. **Otevři stránku úloh.** V Claude Desktopu v záložce Code klikni v postranním panelu na **Scheduled** (nebo v jeho nabídce **More**). Zobrazuje-li tvoje verze místo toho **Routines** (starší název téhož), klikni na **Routines** a potom na **New routine**; formulář pak nese tytéž položky na jedné stránce (Name, Description, Instructions s volbou režimu oprávnění, modelu a složky, Schedule).
3. **Založ úlohu.** Klikni na **New task**. Otevře se dialog **New scheduled task**. Nabídne-li se menu **Create with Claude** / **Set up manually**, zvol **Set up manually**. Je-li nahoře v dialogu přepínač **Only on this computer**, zapni ho hned, než cokoli vyplníš. Nabídne-li se menu **Local** / **Cloud**, zvol **Local**.
4. **Pojmenuj ji.** Do pole **Name** napiš například `ranni-briefing`. Desktop ho převede na malá písmena s pomlčkami a použije jako název složky úlohy, takže musí být mezi tvými úlohami unikátní. Nabízí-li tvůj formulář pole **Description**, vyplň ho; bez něj zůstane **Create** nedostupné.
5. **Vlož instrukce.** Do pole s instrukcemi pod názvem vlož text z kroku 1.
6. **Only on this computer a složka.** Pod kartou **Trigger** rozbal **Advanced settings**, na záložce **General** zapni **Only on this computer** a v řádku **Local folder** vyber pracovní složku AI OS (workspace). Bez složky zůstane **Create** nedostupné.
7. **Rozvrh.** V kartě **Trigger** vyber **Weekdays** (všední dny) a čas, případně **Daily**; k dispozici jsou ještě **Hourly** a **Weekly**. Čas je tvůj místní.
8. **Režim oprávnění a model** vyber v liště pod polem s instrukcemi. Ukládá-li briefing soubor do `docs/briefings/`, nastav režim **Accept edits**. Na tarifu Pro doporuč model Sonnet, který šetří limit využití.
9. **Vytvoř úlohu.** Klikni na **Create**. Pokud složce ještě nedůvěřuješ, Desktop se v tuto chvíli zeptá; potvrď. Otevře se detail úlohy.
10. **Run now.** Na detailu úlohy klikni na **Run now**, potom na řádek vzniklého běhu v seznamu **History** a ve session u každé žádosti o oprávnění zvol „always allow“. Bez toho by ranní běh visel na dialogu a nic by nevzniklo. Schválená oprávnění můžeš na detailu úlohy zkontrolovat a odvolat v panelu **Always allowed**.
11. **Agent ověří výsledek** podle uloženého souboru a odpovědi a zapíše do instalačního protokolu název úlohy, rozvrh, čas a výsledek Run now. Rutina je hotová až teď: ručně spuštěný recept ani vytvořená úloha bez úspěšného Run now ji nedokazují.

**Místo klikání lze úlohu zadat větou.** Do session otevřené v kořeni workspace napiš například: „Založ mi naplánovanou úlohu: každý všední den v 7:00 spusť ranní briefing podle `scheduled-tasks/morning-briefing/SKILL.md`.“ Claude úlohu vytvoří. Pak ji otevři v seznamu **Scheduled** (nebo **Routines**), zkontroluj název, složku, rozvrh a zapnuté **Only on this computer** a krok 10 (Run now a „always allow“) udělej stejně.

### Správa a omezení

- Detail úlohy nabízí **Run now**, **Status** (Active, Paused), **Edit** (instrukce, rozvrh, složka), historii běhů včetně přeskočených (po najetí myší vidíš důvod), panel **Always allowed** a **Delete**. Smazáním úlohy se její session archivují; složka s jejím `SKILL.md` zůstane na disku v `~/.claude/scheduled-tasks/<název>/` a odstraníš ji sám.
- Úloha, která volá MCP nástroj označený `requiresUserInteraction`, se při každém běhu zastaví, protože u něj „always allow“ není. Takový zdroj do ranní rutiny nedávej.
- Pravidla `allow` z `~/.claude/settings.json` platí i pro úlohy.
- Neověřené zůstává nativní Windows a cloudové úlohy pro uživatele bez repozitáře na GitHubu, viz [ZNAME-LIMITY](../docs/ZNAME-LIMITY.md).

## Jak si úlohu upravit

- **Změň chování** — edituj `SKILL.md` dané úlohy. Vyhoď nebo přidej sekce, změň formát
  výstupu nebo váhy skórování.
- **Nasměruj ji na svoje nástroje** — úlohy odkazují na *kategorie* nástrojů (kalendář,
  fakturace, CRM, e-mail, správce úkolů, vyhledávání na webu), ne na konkrétní značky.
  Použijí ty MCP servery, které máš napojené; jména konkrétních nástrojů v souborech jsou
  jen příklady.
- **Přidej si vlastní** — založ tu novou složku se `SKILL.md` a naplánuj ji stejným
  způsobem. Nebo začni od receptu v [`BLUEPRINTS.md`](./BLUEPRINTS.md) — vlož jeho
  samostatný prompt do naplánované úlohy, žádnou složku k tomu nepotřebuješ.

## Dvě konvence

Dva návyky dělají z naplánovaných úloh něco, na co se dá spolehnout. Všech šest úloh
v tomhle kitu už je dodržuje a každý recept v [`BLUEPRINTS.md`](./BLUEPRINTS.md) je podle
nich napsaný.

**Samostatné prompty.** Naplánovaná úloha běží v *čerstvé session* bez jakékoli paměti na
tvoje chaty, tvoje preference a na cokoli, co jsi kdy nastavil. Ví jen to, co jí říká její
prompt. Takže do něj zapeč všechno: *jaký nástroj použít* (pojmenuj kategorii — „moje CRM
MCP" — ne jen „mrkni na pipeline"), *jaký formát vyrobit* (přesné sekce, tvar tabulky,
počet slov) a *kam to poslat* (cíl doručení). Prompt, co zní jako poznámka pro sebe („udělej
tu obvyklou ranní věc"), v 7:00 tiše selže; prompt, co popisuje celou práci, funguje
za studena. Když váháš, radši přespecifikuj.

**Než to naplánuješ, vyzkoušej to.** Než úlohu svěříš cronu, spusť ji jednou ručně a přečti
si výstup. Úloha, kterou jsi nikdy nespustil, je jen odhad — v promptu může chybět odkaz na
nástroj, formát může vyjít špatně, dotaz může vrátit prázdno. Jeden ruční běh tohle všechno
odhalí během pár vteřin, zatímco rozbitý cron job jen každé ráno potichu vyrábí nesmysly
(nebo nic), dokud si toho nevšimneš. Spusť to, koukni na výsledek, uprav prompt — a *pak*
teprve naplánuj.

## Kam jdou výstupy

- `morning-briefing` → volitelně uloženo do `docs/briefings/YYYY-MM-DD-briefing.md`
- `weekly-improvement` → `docs/plans/YYYY-MM-DD-weekly-improvement.md`
- `workspace-tidy` → `docs/plans/YYYY-MM-DD-workspace-tidy.md`
- `daily-end-session` → `docs/plans/YYYY-MM-DD-daily-end.md` (s druhým mozkem: co se povýšilo do wiki, co se založilo a co se přeskočilo a proč; + learningy do `docs/learnings/`)
- `second-brain-declutter` → digest ti dorazí do kanálu; změny se dějí až po tvém schválení
- `nightly-backup` → žádný soubor, výstupem je commit a push

Každá úloha commitne **jen svůj vlastní výstupní soubor** a nikdy nespouští destruktivní
git příkazy (`checkout` / `reset` / `stash` / `clean` / `add -A`) — takže je bezpečné ji
nechat běžet, i když zrovna pracuješ ve stejném repu.

Jediná záměrná výjimka je [`nightly-backup`](./nightly-backup/SKILL.md): jeho celá práce je
záloha celého stromu, takže `git add -A` a push **dělá**. Pořád ale nikdy nespustí
destruktivní git — jen přidává, commitne a pushne. Doporučený čas je 23:00, po ostatních úlohách. Skutečné rozvrhy a délku běhů ověř; různé časy spuštění samy nezaručují, že se zápisy nepřekryjí.
