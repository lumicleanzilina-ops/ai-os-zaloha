> Převzato z anthropics/skills (mcp-builder), Copyright 2026 Anthropic, PBC, Apache License 2.0. Tento soubor je český překlad původního textu (změna podle § 4 licence); viz ../NOTICE a ../LICENSE.txt.

# Best practices pro MCP server

## Rychlý přehled

### Pojmenování serveru
- **Python**: `{service}_mcp` (např. `slack_mcp`)
- **Node/TypeScript**: `{service}-mcp-server` (např. `slack-mcp-server`)

### Pojmenování toolů
- Používej snake_case s prefixem služby
- Formát: `{service}_{action}_{resource}`
- Příklad: `slack_send_message`, `github_create_issue`

### Formáty odpovědí
- Podporuj JSON i Markdown
- JSON na strojové zpracování
- Markdown na čitelnost pro člověka

### Pagination
- Vždy respektuj parametr `limit`
- Vracej `has_more`, `next_offset`, `total_count`
- Výchozí hodnota 20–50 položek

### Transport
- **Streamable HTTP**: pro vzdálené servery a scénáře s víc klienty
- **stdio**: pro lokální integrace a nástroje z příkazové řádky
- Vyhni se SSE (je deprecated, nahradilo ho streamable HTTP)

---

## Konvence pojmenování serveru

Drž se těchto standardizovaných vzorů:

**Python**: formát `{service}_mcp` (malá písmena, podtržítka)
- Příklady: `slack_mcp`, `github_mcp`, `jira_mcp`

**Node/TypeScript**: formát `{service}-mcp-server` (malá písmena, pomlčky)
- Příklady: `slack-mcp-server`, `github-mcp-server`, `jira-mcp-server`

Název má být obecný, popisující integrovanou službu, snadno odvoditelný ze zadání a bez čísel verzí.

---

## Pojmenování a návrh toolů

### Pojmenování toolů

1. **Používej snake_case**: `search_users`, `create_project`, `get_channel_info`
2. **Přidej prefix služby**: počítej s tím, že tvůj MCP server poběží vedle dalších MCP serverů
   - Použij `slack_send_message`, ne jen `send_message`
   - Použij `github_create_issue`, ne jen `create_issue`
3. **Vycházej z akce**: začínej slovesem (get, list, search, create atd.)
4. **Buď konkrétní**: vyhni se obecným názvům, které by mohly kolidovat s jinými servery

### Návrh toolů

- Popisy toolů musí úzce a jednoznačně popisovat, co tool dělá
- Popisy musí přesně odpovídat skutečné funkčnosti
- Dodej anotace toolů (readOnlyHint, destructiveHint, idempotentHint, openWorldHint)
- Drž operace toolů soustředěné a atomické

---

## Formáty odpovědí

Všechny tools, které vracejí data, by měly podporovat víc formátů:

### JSON formát (`response_format="json"`)
- Strukturovaná data čitelná strojem
- Zahrň všechna dostupná pole a metadata
- Konzistentní názvy a typy polí
- Pro strojové zpracování

### Markdown formát (`response_format="markdown"`, typicky výchozí)
- Naformátovaný text čitelný pro člověka
- Používej nadpisy, seznamy a formátování pro přehlednost
- Timestampy převeď do čitelné podoby
- Zobrazuj názvy s ID v závorkách
- Vynech ukecaná metadata

---

## Pagination

Pro tools, které vypisují resources:

- **Vždy respektuj parametr `limit`**
- **Implementuj pagination**: použij `offset` nebo cursor-based pagination
- **Vracej metadata o stránkování**: zahrň `has_more`, `next_offset`/`next_cursor`, `total_count`
- **Nikdy nenačítej všechny výsledky do paměti**: u velkých datasetů to platí dvojnásob
- **Nastav rozumné výchozí limity**: obvyklých je 20–50 položek

Příklad odpovědi se stránkováním:
```json
{
  "total": 150,
  "count": 20,
  "offset": 0,
  "items": [...],
  "has_more": true,
  "next_offset": 20
}
```

---

## Možnosti transportu

### Streamable HTTP

**Nejlepší pro**: vzdálené servery, webové služby, scénáře s víc klienty

**Vlastnosti**:
- Obousměrná komunikace přes HTTP
- Podporuje víc současných klientů
- Dá se nasadit jako webová služba
- Umožňuje notifikace ze serveru ke klientovi

**Použij, když**:
- Obsluhuješ víc klientů zároveň
- Nasazuješ to jako cloudovou službu
- Integruješ to s webovými aplikacemi

### stdio

**Nejlepší pro**: lokální integrace, nástroje z příkazové řádky

**Vlastnosti**:
- Komunikace přes standardní vstup/výstup
- Jednoduché nastavení, není potřeba síťová konfigurace
- Běží jako podproces klienta

**Použij, když**:
- Stavíš nástroje pro lokální vývojové prostředí
- Integruješ to s desktopovými aplikacemi
- Jde o jednoho uživatele a jednu session

**Pozn.**: stdio servery NESMÍ logovat do stdout (na logování používej stderr)

### Výběr transportu

| Kritérium | stdio | Streamable HTTP |
|-----------|-------|-----------------|
| **Nasazení** | Lokální | Vzdálené |
| **Klienti** | Jeden | Víc |
| **Složitost** | Nízká | Střední |
| **Real-time** | Ne | Ano |

---

## Bezpečnostní best practices

### Autentizace a autorizace

**OAuth 2.1**:
- Používej bezpečné OAuth 2.1 s certifikáty od uznávaných autorit
- Před zpracováním requestu ověř access token
- Přijímej jen tokeny určené konkrétně pro tvůj server

**API klíče**:
- API klíče drž v proměnných prostředí, nikdy ne v kódu
- Ověř klíče při startu serveru
- Když autentizace selže, vrať srozumitelnou chybovou hlášku

### Validace vstupů

- Sanitizuj cesty k souborům, aby nešlo procházet adresáře (directory traversal)
- Validuj URL a externí identifikátory
- Kontroluj velikosti a rozsahy parametrů
- Zabraň command injection v systémových voláních
- Na všechny vstupy použij validaci schématem (Pydantic/Zod)

### Ošetření chyb

- Neodhaluj klientům interní chyby
- Bezpečnostně relevantní chyby loguj na straně serveru
- Chybové hlášky ať pomáhají, ale nic neprozrazují
- Po chybě ukliď prostředky

### Ochrana proti DNS rebindingu

Pro streamable HTTP servery běžící lokálně:
- Zapni ochranu proti DNS rebindingu
- Validuj hlavičku `Origin` u všech příchozích spojení
- Naslouchej na `127.0.0.1`, ne na `0.0.0.0`

---

## Anotace toolů

Anotacemi pomůžeš klientům pochopit, jak se tool chová:

| Anotace | Typ | Výchozí | Popis |
|-----------|------|---------|-------------|
| `readOnlyHint` | boolean | false | Tool nemění své prostředí |
| `destructiveHint` | boolean | true | Tool může provádět destruktivní změny |
| `idempotentHint` | boolean | false | Opakovaná volání se stejnými argumenty už nemají další efekt |
| `openWorldHint` | boolean | true | Tool komunikuje s externími entitami |

**Důležité**: anotace jsou nápověda, ne bezpečnostní záruka. Klienti by neměli dělat bezpečnostně kritická rozhodnutí jen na základě anotací.

---

## Ošetření chyb

- Používej standardní JSON-RPC chybové kódy
- Chyby toolů hlaš uvnitř result objektů (ne jako chyby na úrovni protokolu)
- Vracej užitečné, konkrétní chybové hlášky s návrhem dalšího kroku
- Neodhaluj detaily interní implementace
- Při chybě pořádně ukliď prostředky

Příklad ošetření chyb:
```typescript
try {
  const result = performOperation();
  return { content: [{ type: "text", text: result }] };
} catch (error) {
  return {
    isError: true,
    content: [{
      type: "text",
      text: `Error: ${error.message}. Try using filter='active_only' to reduce results.`
    }]
  };
}
```

---

## Požadavky na testování

Pořádné testování má pokrýt:

- **Funkční testování**: ověř správný běh s platnými i neplatnými vstupy
- **Integrační testování**: otestuj komunikaci s externími systémy
- **Bezpečnostní testování**: ověř autentizaci, sanitizaci vstupů, rate limiting
- **Výkonnostní testování**: zkontroluj chování pod zátěží a timeouty
- **Ošetření chyb**: ujisti se, že chyby jsou správně hlášené a po nich se uklidí

---

## Požadavky na dokumentaci

- Dodej srozumitelnou dokumentaci všech toolů a schopností
- Zahrň funkční příklady (aspoň 3 na každou hlavní funkci)
- Zdokumentuj bezpečnostní aspekty
- Uveď potřebná oprávnění a úrovně přístupu
- Zdokumentuj rate limity a výkonnostní charakteristiky
