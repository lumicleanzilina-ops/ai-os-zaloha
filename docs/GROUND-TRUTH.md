# Ground truth — odkud se bere každé opakující se číslo

> **Přečti si tohle dřív, než napíšeš jakýkoliv report s čísly.** Základní pravidlo 5: nikdy neuvádět
> číslo, které jsi neověřil. Tenhle soubor je to, co dělá dodržování toho pravidla levné — u každé
> hodnoty, která se opakovaně vrací, říká, který systém je její **kanonický** zdroj a jak ji ověřit.

**Soubor se veze záměrně prázdný.** Vyplň ho během onboardingu a přidávej řádek pokaždé, když se ukáže, že
je nějaké číslo dvojznačné. Když si dva systémy o nějaké hodnotě odporují, řešením není udělat průměr —
řešením je zapsat sem, který z nich vyhrává a proč. Onboarding se na tvoje opakovaná čísla zeptá a vyplní první řádky; týdenní audit přidá řádek, kdykoli nějaké číslo dalo práci dohledat.

---

## Jak s tím pracovat

1. Před reportem: přečti si řádky k číslům, která se chystáš uvést.
2. Vytáhni hodnotu **živě** z kanonického zdroje. Ne z paměti, ne z předchozího reportu a ne z čísla,
   které uživatel mimochodem zmínil před třemi týdny.
3. Když se ke zdroji nedostaneš, napiš **„neověřeno"** — nikdy odhad.
4. Narazil jsi na číslo, které v téhle tabulce není, a dalo práci ho dohledat? **Přidej řádek.**

## Kontrolní otázka

Než report odejde, zeptej se sám sebe u každého čísla: *odkud přesně tohle je a dokázal bych ten zdroj
uživateli hned teď ukázat?* Když je odpověď „odvodil jsem to" nebo „bylo to v nějakém starším shrnutí",
tohle číslo ven nejde.

---

## Kanonické zdroje

| Údaj | Kanonický zdroj | Jak ověřit | Naposledy zkontrolováno |
|---|---|---|---|
| *např. tržby tenhle měsíc* | *tvoje platební brána* | *vytáhni živý zůstatek / seznam plateb, vyfiltruj podle data* | |
| *např. počet zákazníků* | *tvoje CRM nebo platební brána — vyber JEDNO a napiš to sem* | | |
| *např. aktuální ceny* | *tvůj fakturační nástroj / e-shop, nikdy stará nabídka* | | |
| *např. útrata za reklamu* | *reporting té reklamní platformy* | | |
| *např. počet odběratelů* | | | |

## Známé pasti

Doplňuj je, jak na ně budeš narážet. Tyhle se vyplatí zapsat hned napoprvé, co tě koupnou:

- **Období, které neskončilo, ještě není číslo.** Označ ho jako předběžné a orazítkuj, kdy jsi měřil.
- **Dva systémy, dvě odpovědi.** Zapiš, který je kanonický, aby to příští session nemusela řešit znovu.
- **Souhrnný endpoint umí odporovat detailu.** Když se liší, obvykle vyhrává detail — a poznamenej si
  sem, kterému z nich u tohohle údaje věříš.
- **Číslo uvedené ve starším dokumentu je historický fakt o tom dokumentu**, ne aktuální hodnota.
