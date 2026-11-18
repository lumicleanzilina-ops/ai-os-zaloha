# Generování obrázků — dvě cesty

Tvůj Chief of Staff umí dělat obrázky dvěma způsoby. Vyber podle toho, o co jde.

## 1. Rychle a v konverzaci — přes MCP (snadná výchozí volba)

Napojíš obrázkové MCP a prostě si v chatu řekneš: *„vygeneruj obrázek…"*, *„uprav tuhle fotku…"*. Žádný kód.

- **Gemini „nano-banana"** — rychlé generování a úpravy přímo v konverzaci.
- **Higgsfield** — obrázky *i* video, 30+ modelů.

Obojí najdeš v [`../mcp-integrations/RECOMMENDED-MCPS.md`](../mcp-integrations/RECOMMENDED-MCPS.md) —
nainstaluješ příkazem `/connect-mcp nano-banana`. **Nejlepší na:** jednorázovky, hledání nápadů, rychlé úpravy.

## 2. Plná kontrola — skript proti OpenAI API (`gpt-image-2`)

Když potřebuješ přesné parametry, dávkový výstup nebo pracovat z **referenční fotky**, dá ti malý
Python skript volající OpenAI Images API víc kontroly než MCP.

> Autor tohohle kitu přesně takhle generuje **obrázky sebe sama z referenčních fotek** — na posty na
> sítě, na profilovku nebo na scény typu „já v něčem". Používá `images.edit` (ne `generate`) s
> `model="gpt-image-2"`: vezme referenční fotku a přestylizuje ji, v dávkách, v pevné velikosti a
> kvalitě. Proto je to skript, a ne dotaz v chatu.

### Jednorázové nastavení

1. Jdi na **[platform.openai.com](https://platform.openai.com)** a **přihlas se svým OpenAI účtem**.
2. **Billing → dobij kredit** (na začátek stačí pár dolarů — obrázky se účtují po kusech).
3. **API keys → Create**, a pak klíč vlož do souboru `.env` jako `OPENAI_API_KEY`. Do chatu ho nevkládej a **nikdy ho necommituj** (`.gitignore` na `.env` pamatuje).

Bez kreditu na účtu vrací API chybu — samotný klíč nestačí, zůstatek musí být dobitý.

### Minimální ukázka

Skript **spouští agent**, ne ty — tohle je tu jako reference, ať víš, co se pod pokličkou děje:

```python
# pip install openai pillow
import base64
from openai import OpenAI

client = OpenAI()  # načte OPENAI_API_KEY z prostředí

# Přestylizuje referenční fotku do nového obrázku tebe (dávka po 2)
result = client.images.edit(
    model="gpt-image-2",
    image=open("reference.png", "rb"),   # musí být PNG — JPG převeď nejdřív Pillowem na PNG
    prompt="editorial portrait of the subject for social media, bold lighting, punchy colors",
    size="1024x1024",
    quality="medium",
    n=2,                                  # až 4
)

for i, item in enumerate(result.data):
    with open(f"me_{i}.png", "wb") as f:
        f.write(base64.b64decode(item.b64_json))
```

### Kdy sáhnout po skriptu a kdy po MCP

| | MCP (nano-banana / Higgsfield) | Skript (`gpt-image-2`) |
|---|---|---|
| Použij na | „udělej mi teď obrázek", úpravy v chatu | opakovatelný postup (např. dávku obrázků tebe) |
| Vstup | prompt | **referenční fotka** + prompt |
| Výstup | jeden obrázek v chatu | **dávka**, pevná velikost a kvalita, uložená na disk |
| Náročnost | nula kódu | malý skript + kredit u OpenAI |

**Pravidlo palce:** MCP na *„udělej mi teď obrázek"*, skript na *„vygeneruj mi dávku obrázků mě samotného."*
