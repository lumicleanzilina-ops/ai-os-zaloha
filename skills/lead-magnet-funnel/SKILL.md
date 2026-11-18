---
name: lead-magnet-funnel
description: Postav lead magnet funnel na vlastním webu — squeeze page, která sbírá e-maily, upsert do CRM + tag, doručovací e-mail, gated obsah za opt-inem a tracking přes pixel reklamní platformy. Použij, když chce uživatel něco dát zdarma výměnou za e-mail, postavit lead magnet pro cold traffic nebo přidat sběr e-mailů pod YouTube video či jiný obsah.
---

# Lead Magnet Funnel

Funnel na sběr leadů, který žije na tvojí vlastní doméně místo uvnitř landing-page builderu nebo
přímo na checkout/komunitní platformě.

## Architektura

```
reklama / popis videa → /<magnet>              squeeze page, indexovaná, JEDNA akce = dej e-mail
                            ↓ POST /api/<magnet>-lead
                       CRM upsert + tag           → doručovací e-mail (odeslaný přes tvoje CRM/ESP)
                            ↓
                       success stav + Lead pixel  → /<magnet>/<content>   gated, noindex
                            ↓
                       sekce "další krok" → /<your-core-offer> (utm_source=<magnet>)
```

**Proč je squeeze page samostatný krok, a ne přímý odkaz na gated obsah:** zachycení e-mailu
na tvojí vlastní doméně ti umožní nastavit vlastní first-party ad-tracking cookies (Meta `_fbc`/`_fbp`,
nebo ekvivalent pro tu reklamní platformu, na které jedeš) a hned tam odpálit **Lead** event. To řeší
běžný attribution bug: když je první zastávka návštěvníka na cizí checkout nebo komunitní platformě,
její vlastní řetězec přesměrování velmi často shodí ad-click id (třeba `fbclid`), ještě než vůbec
dorazí na tvůj pixel, takže reálný prodej z reklamy nakonec vypadá jako neatribuovaný. Zachyť lead na
vlastní stránce nejdřív, a reklamní platforma má signál, na který může optimalizovat, ještě než
návštěvník opustí tvoji doménu.

## Struktura webu

- Nová stránka je nový soubor ve zdrojáku tvého webu — většina moderních statických/SSR setupů (webpack,
  Next.js, Astro…) si ho vezme automaticky; neupravuj kvůli tomu ručně build config.
- Snippety pixelu/analytiky dej do sdílené partial included v `<head>`, ne copy-paste na každou stránku.
- Design zkopíruj z **živého webu**, ne ze zdrojového assetu, který může být zastaralý — zkontroluj, co je
  reálně nasazené, než postavíš novou stránku ve stejném stylu.
- Přidej rewrite na clean URL (`/<magnet>` → skutečný soubor) plus redirecty ze všech starších/alternativních
  cest, které nahrazuješ.
- Když jedeš lokální dev server oddělený od statického buildu, zrcadli tam route taky — nenech lokál a prod
  potichu rozejít.
- Gated obsah (to, co je za opt-inem) dostane `noindex,nofollow` a zůstane mimo sitemap. Samotná squeeze page
  zůstává indexovaná a v sitemap — to je stránka, která má rankovat.

## Capture endpoint

Zrcadli jakýkoli funkční endpoint na odesílání formuláře, který už na webu máš, pokud nějaký je — stejná
validace, stejný tvar, míň se debuguje od nuly. Klíčové kusy:

| Kus | Jak |
|---|---|
| Validace | Schema-validuj vstup (třeba `zod`), plus honeypot pole s nesmyslným jménem (třeba `hp_check`) — když je vyplněné, vrať fake `{"ok":true}`, nic neukládej a zásah zaloguj bez osobních údajů. **Nikdy** ho nepojmenuj `company`, `firma`, `organization`, `name`, `email`, `phone`, `address`, `website` ani `url`: prohlížeč tam při automatickém vyplňování doplní údaje z uloženého profilu i do skrytého pole (`autocomplete="off"` ignoruje) a formulář pak potichu zahodí skutečného člověka. Při přejmenování musí server ignorovat i staré jméno, stránky otevřené před nasazením ho posílají dál. |
| CRM kontakt | Upsertni kontakt podle e-mailu v CRM, se zdrojem leadu a tagem, který identifikuje tenhle konkrétní magnet. Upsert, ne create — nikdy nesmí vytvořit duplicitní kontakt, jen přidat tag na existující |
| Doručovací e-mail | Odeslaný přes transakční nebo conversation-send API tvého CRM/ESP, s použitím contact id, které vrátil upsert call |
| Odolnost | Selhaný doručovací e-mail nesmí **nikdy** shodit zachycení leadu — zaloguj chybu na serveru a i tak vrať `{"ok":true}` do prohlížeče. Ztracený e-mail je vratný (pošli ho znovu); ztracený záznam leadu ne |
| Nikdy nezahoď lead potichu | Zaloguj e-mailovou adresu jako úplně první věc, co handler udělá, ještě před čímkoli, co může spadnout — ať je greppovatelná v logách tvé deploy platformy, i kdyby všechno downstream selhalo |
| Env proměnné | Ověř, že API klíč k CRM a workspace/location id jsou reálně nastavené v deploy prostředí, než budeš předpokládat, že endpoint tam funguje |

Pro HTML doručovacího e-mailu: drž to jednoduché (světlá karta, jedno jasné CTA tlačítko) a **vždy** nastav
`<meta charset="utf-8">` — bez toho se jakýkoli non-ASCII znak (diakritika, ne-anglický text) může v některých
schránkách zobrazit jako rozbité symboly. Na CTA odkaz dej UTM parametry (třeba
`utm_source=email&utm_medium=delivery`), ať se tenhle kanál v analytice ukazuje zvlášť.

## Copy na squeeze page

Napiš ji **svým vlastním hlasem** — viz skill `tone-of-voice-maker` v tomhle kitu
(`../tone-of-voice-maker/SKILL.md`), pokud voice profile ještě neexistuje. Stránka musí pokrýt: přesně
co návštěvník dostane, **proč je tohle živá stránka, a ne statický soubor** ("dej si to do záložek" — živá
stránka se po publikaci pořád zlepšuje, PDF je zmražené v momentě stažení), GDPR/consent řádek u formuláře,
jedno ověřené trust číslo, pokud nějaké máš (nikdy neodhaduj — vynech ho, když ho neumíš ověřit), a druhý
formulář níž na stránce pro lidi, co odscrollují přes první, aniž by cokoli udělali.

Na samotné stránce s gated obsahem přidej capture bar pro návštěvníky, kteří přišli přes sdílený odkaz, ne
přes reklamu — něco jako "poslal ti to někdo?". Sdílený odkaz je zdroj leadů zdarma; nenech ho slepě
skončit bez vlastního bodu na zachycení.

## End-to-end test — bez tohohle to není hotové

1. Pushni, pak počkej, až se deploy fakt dokončí — polluj, dokud se nový obsah neobjeví, nehádej dobu čekání.
2. `curl -X POST` na živý endpoint → ověř, že dostaneš zpět success odpověď.
3. **Kontakt se objeví v tvém CRM** — zkontroluj to přímo v CRM, s aplikovaným tagem. Důkaz ze systému, ve
   kterém se akce stala, ne jen success odpověď z tvého vlastního kódu.
4. **Doručovací e-mail reálně dorazil** — zkontroluj přes svůj e-mailový nástroj. Hledej **bez jakýchkoli
   diakritických nebo speciálních znaků** (podle jména/domény odesílatele) — dotaz s diakritikou může vrátit
   nula výsledků, i když e-mail leží přímo tam. Pokud tvoje ESP/CRM vystavuje status zprávy (delivered /
   opened / clicked), zkontroluj i to, ne jen přítomnost v inboxu.
5. Odešli přes **živou stránku v prohlížeči**, ne jen `curl` — plus honeypot cestu, neplatný e-mail a každý
   redirect, který jsi přidal. Jednou formulář vyplň **automatickým vyplněním prohlížeče** z profilu s uloženou
   firmou a adresou: ruční psaní neodhalí, že prohlížeč plní i skryté pole.
6. **Ukliď všechny testovací tagy**, které jsi vytvořil, ať reálný segment začíná na nule.

## Po launchi

Tag, který tenhle funnel aplikuje, krmí nurture sekvenci — vždy s vyloučením kohokoli, kdo už koupil (tuhle
nabídku i jakoukoli sousední dražší nabídku, pokud existuje). Platební platformy velmi často nesynchronizují
nákupy zpátky do tvého CRM automaticky, takže ten vylučovací tag se obvykle musí aplikovat zvlášť — ověř, že
se reálně aplikuje, než mu začneš věřit.

Postavení audience segmentu pro tu nurture sekvenci je skoro vždy feature jen v UI CRM — většina CRM API
neumí filtrovat kontakty podle tagu. Když to API neumí, postav segment ve vlastním UI CRM (přes browser
automatizaci, pokud ji máš, jinak provedeš uživatele jednou a uložíš přesný click-path) a **vždy vyluč tag
"koupil"**, ať kupující nikdy nedostanou pitch.

## Stav

Ověřeno end-to-end na reálném launchi produktu: postavené, nasazené a otestované proti každému kroku
checklistu výše, než se to prohlásilo za hotové.
