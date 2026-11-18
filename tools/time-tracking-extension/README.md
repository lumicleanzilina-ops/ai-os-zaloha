# 🎁 BONUS — Extension na měření času

Úplně jednoduchá Chrome extension, se kterou **si měříš odpracované hodiny přímo v prohlížeči** —
odlehčená náhrada Toggl a spol. U každého projektu spustíš a zastavíš stopky (nebo si minuty napíšeš
ručně), každý záznam dostane datum a na konci měsíce **všechno vyexportuješ do CSV**.

To CSV pak dáš svému Chief of Staff a řekneš, pro kterého klienta chceš dashboard — skill
`time-tracking-dashboard` z něj udělá **parádní interaktivní dashboard, který pošleš _s fakturou_**,
takže klient přesně vidí, *kdy* jsi dělal, na *jakém projektu* a *který den*. Čistý rozpad den po dni,
díky kterému faktura vypadá profesionálně a zabije dotazy typu „a co jsi vlastně dělal?".

## Celý koloběh

1. **Měř** — klikni na extension, přidej projekt, zmáčkni ▶ Start / ⏸ Stop (nebo zadej minuty ručně).
2. **Exportuj** — na konci měsíce otevři nastavení (⚙️) → **Export CSV**.
3. **Postav** — hoď CSV agentovi: *„postav mi time-tracking dashboard pro klienta X."*
4. **Pošli** — přilož dashboard k faktuře pro toho klienta. Hotovo.

## Instalace (2 minuty, nic se nekompiluje)

Extension je hotová — jen tuhle složku načteš do Chromu:

1. V Chromu klikni vpravo nahoře na ikonu se třemi tečkami → **Rozšíření** (Extensions) →
   **Spravovat rozšíření** (Manage Extensions). Nebo si do adresního řádku napiš `chrome://extensions/`
2. Vpravo nahoře zapni přepínač **Režim pro vývojáře** (Developer mode)
3. Klikni na **Načíst rozbalené** (Load unpacked)
4. Vyber složku **`time-tracking-extension/`**
5. Připni si ji: klikni v liště na ikonu puzzle a u extension zmáčkni špendlík, ať ji máš na jedno kliknutí

A to je celé — klikneš na ikonu a začneš měřit.

## Tvoje data zůstávají tvoje

Ukládá se to jen do tvého prohlížeče (Chrome Storage). Manifest si říká o **jediné oprávnění —
`storage`**. Žádné účty, žádné servery, žádná komunikace po síti. Nic neopustí tvůj počítač,
dokud CSV sám nevyexportuješ a nerozhodneš se z něj postavit dashboard.

> **Poznámka:** UI extension je v češtině (`Přidat`, `Start`/`Stop`, ⚙️ = nastavení, `Export CSV`).
> Je to drobnost a mluví to samo za sebe. Chceš ji v jiném jazyce nebo trochu jinak? Řekni
> agentovi, ať ti extension přestaví.

## Licence závislostí

Plná původní znění a notices jsou v [THIRD-PARTY-LICENSES.md](THIRD-PARTY-LICENSES.md); přesné verze a ověření bajtů v `license-inventory.json`.
