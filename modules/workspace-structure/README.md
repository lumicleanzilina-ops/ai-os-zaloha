# Modul: Workspace Structure

> Dej každé práci její místo. Tenhle modul nechá tvého AI Chief of Staffa **navrhnout a postavit složkovou strukturu na míru tobě** — aby nic neleželo v náhodné složce Stažené a agent vždycky věděl, kam co patří.

## Proč

AI asistent je mnohem užitečnější, když mají tvoje soubory jasnou a předvídatelnou strukturu. Ví, kam ukládat výstupy, kde hledat kontext a kam patří nový projekt. Bez toho se všechno rozsype po disku a agent (i ty) tráví čas hledáním.

Pravidlo zní: **všechno má svoje místo a každé místo má README**, které vysvětluje, co to je.

## Jak to vypadá

> **Stav uvnitř zvoleného vlastního workspace**, který obsahuje ústavu AGENTS.md. Návaznost určuje
> [START](../../START.md); [ONBOARDING, sekce 0](../../ONBOARDING.md#0-navázat-na-skutečný-systém) a
> [SETUP](../../docs/SETUP.md) připravují novou pracovní kopii jen pro nového uživatele. Existující workspace
> zachovej, nepřejmenovávej a nezakládej další. Jeho současná struktura má přednost před ukázkou níže.
> Nové složky přidávej podle skutečné práce do tohoto workspace; páteřní soubory a napojený externí vault
> nech na jejich místě. Čistý distribuční kit nepersonalizuj.

Dva koše na nejvyšší úrovni, a *uvnitř* nich rozdělení podle toho, jak o své práci reálně přemýšlíš:

```
AI-OS/                         # ← uživatelova kopie (má AGENTS.md), doporučeně ~/AI-OS — jeho složky stav sem
├── work/                      # všechno pracovní
│   ├── clients/               # jedna složka na klienta (pokud klienty máš)
│   │   └── [client-name]/
│   ├── projects/              # tvoje vlastní projekty / produkty
│   │   └── [project-name]/
│   ├── content/               # články, posty, videa, prezentace…
│   ├── admin/                 # fakturace, účetnictví, smlouvy, provoz
│   └── README.md
├── personal/                  # všechno osobní
│   ├── finance/
│   ├── health/
│   ├── learning/
│   ├── projects/              # vedlejší projekty, koníčky
│   └── README.md
├── reference-photos/          # ~10 fotek tebe → generování obrázků sebe sama (je v kitu)
└── README.md                  # mapa celého workspace na nejvyšší úrovni
```

> Kit už složku `reference-photos/` obsahuje — viz [`../../reference-photos/README.md`](../../reference-photos/README.md).
> Nech uživatele nasypat tam ~10 různorodých fotek sebe sama, aby agent uměl generovat obrázky
> jeho samotného (posty na sítě, profilovka, scény typu „já v X") přes generátor obrázků od OpenAI.

Tohle je **výchozí tvar, ne pravidlo**. Konkrétní sekce vycházejí z *tvého* kontextu — freelancer, zakladatel, tvůrce a student každý dostane jiné rozložení. Agent navrhne, ty schválíš nebo upravíš.

### Každá složka dostane README

Minimální formát — drž to krátké:

```markdown
# [Název složky]
Co to je a proč to existuje.
## Obsah
## Stav
```

Kdykoliv agent vytvoří novou složku nebo projekt, README napíše automaticky.

### Každý projekt jede podle šablony

Nové projekty vznikají podle tvaru `projects/project-template/` z kitu (`inputs/`, `outputs/`, `docs/`, `README.md`), takže agent vždycky ví, kde leží podklady a kde hotové výstupy.

## Nastavení — nech to na svojí AI

Prostě řekni:

> „Přečti si `modules/workspace-structure/README.md` a navrhni mi složkovou strukturu pro můj workspace podle toho, co o mně víš. Rozděl to na pracovní a osobní, uvnitř to uspořádej podle mých projektů a oblastí a do každé složky přidej README."

Tvůj Claude pak:
1. Použije, co se dozvěděl při onboardingu (tvoje role, klienti, projekty, osobní oblasti), a **navrhne konkrétní strukturu** — se skutečnými názvy sekcí, které sedí na tebe, ne s obecnými.
2. Ukáže ti navržený strom a zeptá se na úpravy.
3. Po schválení vytvoří složky, do každé napíše README a připraví šablonu projektu tam, kde budou vznikat nové projekty.
4. Od té chvíle ukládá výstupy rovnou na správné místo a drží strukturu v pořádku.

> Tip: pojmenuj složky v jazyce, který používáš denně. Agent se přizpůsobí.

## Jak to udržet čisté

- Nový výstup → jde do správné složky, ne do rootu workspace.
- Nový projekt → dostane šablonu a README.
- Občasný úklid: zeptej se *„leží něco na špatném místě?"* a agent navrhne přesuny (nikdy nemaže — vždycky do koše a jen s tvým souhlasem).

## Ověření skutečné zálohy

Práce v work/clients, work/projects, work/content a work/admin patří do zálohy; ignorují se jen jasně označené dočasné cesty work/tmp a work/cache a soukromé upgrade receipty. Agent po vytvoření prvního výsledku ověří `git check-ignore`, skutečný commit a obnovu konkrétního souboru do jiné složky. Samotný úspěšný push není důkaz pokrytí. Vnořené samostatné repozitáře, externí vault a tajemství mají vlastní zálohu. Velká média podle potřeby zálohuj mimo Git a ověř obnovu tam; nevydávej vynechaná data za uložená.
