# Kurátor dovedností — hygiena podle reálného využití

Proč tohle existuje a podle jakých pravidel týdenní audit protřeďuje knihovnu dovedností.

## Proč kurace podle využití existuje

AI Chief of Staff si umí vytvářet vlastní dovednosti. Když smyčka sebezlepšování zaznamená postup,
který pořád dokola děláš ručně, napíše nový `SKILL.md` a hodí ho do `skills/`. To je dobře —
systém roste, aby ti seděl.

Má to ale jedno slabé místo: **hnití dovedností.** Automaticky vzniklé dovednosti se hromadí.
Některé se použijí jednou a pak už nikdy. Jiné se překrývají s dovedností, která vznikla o dva týdny
později a dělá skoro to samé. Když to nikdo nehlídá, složka `skills/` se zaplní mrtvými
a zdvojenými položkami, výběr dovednosti je pro agenta čím dál šumovatější a každý popis dovednosti
soupeří o pozornost modelu ve chvíli, kdy se rozhoduje, co spustit.

Kurátor dovedností je protitlak. Jednou týdně (jako **krok 3b** auditu `weekly-improvement`) se
podívá na to, *jak se dovednosti reálně používají*, a navrhne revizi těch, u kterých dlouho neviděl záznam — ale **jen
dovednosti, které si agent vytvořil sám.** Na cokoliv, co jsi napsal ručně, sahat nesmí.

## Dva mechanismy, na kterých to stojí

### 1. `skills/.usage.json` — kniha využití

Runtime soubor, který sleduje, jak často se která dovednost spustila a kdy naposledy. Zapisuje ho
hook PostToolUse pro nástroj Skill, ne ty ručně. Ruční čtení SKILL.md, jiné nástroje, Codex a další stroje tím nejsou pokryté. Chybějící záznam tedy není důkaz nepoužívání. Tvar:

```json
{
  "invoice-formatter": { "use_count": 12, "last_used": "2025-05-30" },
  "weekly-standup":    { "use_count": 1,  "last_used": "2025-02-14" }
}
```

- `use_count` — kolikrát celkem se dovednost spustila.
- `last_used` — `YYYY-MM-DD` posledního spuštění.

Je **záměrně v `.gitignore`** (viz [Proč `.usage.json` není v gitu](#proč-usagejson-není-v-gitu)).
To znamená, že na čerstvém klonu soubor ještě neexistuje. Kurátor si s chybějící nebo prázdnou
knihou poradí: přeskočí kontroly podle stáří a pustí aspoň sken duplicit z frontmatteru.

### 2. Značka `origin: agent-created` — bezpečnostní plot

Každá dovednost, kterou vytvoří smyčka sebezlepšování, tohle nese ve frontmatteru svého `SKILL.md`:

```yaml
---
name: invoice-formatter
description: ...
metadata:
  origin: agent-created
  created: "2025-02-14"
---
```

- `metadata.origin: agent-created` — tuhle dovednost zplodil agent, ne ty.
- `metadata.created` — datum vzniku; neprokazuje první ani poslední použití.

**Ručně psané dovednosti — ty od uživatele — žádnou takovou značku nemají.** Ta absence je signál,
že dovednost přidal vědomě člověk — takže na ni kurátor nikdy nesmí sáhnout.

## Životní cyklus: zapadlá → archiv

Kurátor zařadí každou **automaticky vzniklou** dovednost podle stáří posledního doloženého záznamu `last_used`. Když záznam chybí, je využití NEZNÁMÉ; datum `created` se za `last_used` nedosazuje:

| Stáří doloženého záznamu | Zařazení | Akce |
|---|---|---|
| ≤ 30 dní | Aktivní | Nech ji být. |
| > 30 dní | **Zapadlá** | **Jen označit** — nahlásit jako kandidáta v týdenním plánu. Nic se nepřesouvá. |
| > 90 dní | **Kandidát k ověření** | Zeptej se na používání mimo měření; archivaci pouze navrhni. Přesun až po výslovném souhlasu. |
| Bez záznamu | Neznámé využití | Žádné závěry o nepoužívání ani automatické přesuny. |

Skoro-duplikáty se řeší zvlášť: když dvě nebo víc automaticky vzniklých dovedností dělají zjevně to
samé, kurátor v reportu **navrhne** sloučit je do jedné zastřešující — nikdy je nesloučí sám.

### Co se provede samo a co se jen navrhne

Automaticky se provede jen analýza a seznam návrhů. Archivace mění dostupnost dovednosti i když je vratná; neprovádí se pouze podle stáří ani podle chybějící telemetrie. Každý přesun nebo sloučení vyžaduje výslovný souhlas uživatele s konkrétními dovednostmi.

## Pravidlo „na uživatelovy dovednosti se nesahá"

Tohle je jediné pravidlo, které kurátor nesmí porušit:

> Po potvrzení uživatelem smíš archivovat, slučovat nebo měnit výhradně dovednosti, které mají ve frontmatteru `SKILL.md`
> řádek `metadata.origin: agent-created`. Dovednost bez značky `origin` napsal uživatel a kurátor ji
> **nikdy** nearchivuje, neslučuje, nemaže ani needituje — bez ohledu na to, jak nepoužívaně vypadá.

Proč: nepoužitá *automaticky vzniklá* dovednost je jen úklid po vlastní produkci agenta. Nepoužitá
*uživatelova* dovednost může být záměrný nástroj, který se hodí jen zřídka a držíš si ho schválně
(workflow na roční daně, postup při havárii). O jejím osudu rozhoduje uživatel, ne agent. Když si
kurátor není jistý, nechá ji být a jen ji zmíní v reportu.

Tím zůstává kurátor v souladu s **Tvrdým pravidlem 0 kitu (nikdy nemaž natvrdo)**: archivace je
*přesun*, nikdy mazání, takže se nikdy nic neztratí — ani ty automaticky vzniklé dovednosti, které
vyřadí.

## Jak vrátit dovednost ze `skills/.archive/`

Archivace je obyčejný přesun složky, takže obnova je přesun opačným směrem — žádné speciální
nástroje:

```bash
# Co je v archivu
ls skills/.archive/

# Vrátit jednu dovednost zpátky do provozu
mv skills/.archive/<skill-name> skills/<skill-name>
```

Od příští session je dovednost zase živá. Když si ji chceš nechat a zároveň zabránit tomu, aby ji
kurátor později znovu zaarchivoval, smaž z jejího frontmatteru řádek
`metadata.origin: agent-created` — tím se z ní stane uživatelova dovednost, na kterou už kurátor
nikdy nesáhne.

Nic ve `skills/.archive/` audit nikdy nesmaže. Když chceš mít dovednost pryč doopravdy, je to ruční
rozhodnutí na tobě — a podle Tvrdého pravidla 0 ji přesuň do koše, ne `rm`.

## Proč `.usage.json` není v gitu

`skills/.usage.json` jsou **runtime data**, ne zdroják. Mění se při každém spuštění dovednosti
a váže se na historii využití jednoho konkrétního stroje — commitovat ho by znamenalo neustálé
bezobsažné diffy a konflikty při slučování napříč session. Proto je v `.gitignore` a zůstává
lokálně.

`skills/.archive/` je přesný opak: v gitu **je** (díky `.gitkeep`), takže složka archivu i všechny
dovednosti, které do ní putovaly, jsou verzované a obnovitelné jako všechno ostatní v kitu.
