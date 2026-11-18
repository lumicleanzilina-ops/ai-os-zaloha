> Převzato z anthropics/skills (mcp-builder), Copyright 2026 Anthropic, PBC, Apache License 2.0. Tento soubor je český překlad původního textu (změna podle § 4 licence); viz ../NOTICE a ../LICENSE.txt.

# Průvodce implementací MCP serveru v Pythonu

## Přehled

Tenhle dokument shrnuje osvědčené postupy a příklady pro implementaci MCP serverů v Pythonu pomocí MCP Python SDK. Pokrývá nastavení serveru, patterny registrace toolů, validaci vstupů přes Pydantic, ošetření chyb a kompletní funkční příklady.

---

## Rychlá reference

### Klíčové importy
```python
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List, Dict, Any
from enum import Enum
import httpx
```

### Inicializace serveru
```python
mcp = FastMCP("service_mcp")
```

### Pattern registrace toolu
```python
@mcp.tool(name="tool_name", annotations={...})
async def tool_function(params: InputModel) -> str:
    # Implementace
    pass
```

---

## MCP Python SDK a FastMCP

Oficiální MCP Python SDK obsahuje FastMCP — high-level framework pro stavbu MCP serverů. Dostaneš z něj:
- Automatické generování description a inputSchema ze signatur funkcí a docstringů
- Integraci Pydantic modelů pro validaci vstupů
- Registraci toolů přes dekorátor `@mcp.tool`

**Kompletní dokumentaci SDK si načti přes WebFetch:**
`https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md`

## Konvence pojmenování serveru

Python MCP servery musí dodržet tenhle pattern:
- **Formát**: `{service}_mcp` (malá písmena, podtržítka)
- **Příklady**: `github_mcp`, `jira_mcp`, `stripe_mcp`

Jméno má být:
- Obecné (nevázané na konkrétní featury)
- Popisné vůči službě/API, které integruje
- Snadno odvoditelné ze zadání
- Bez čísel verzí a datumů

## Implementace toolů

### Pojmenování toolů

Pro názvy toolů používej snake_case (např. "search_users", "create_project", "get_channel_info") — jasně a s důrazem na akci.

**Vyhni se kolizím názvů**: zahrň do jména kontext služby, ať se toolům nepřekrývají názvy:
- Použij "slack_send_message" místo pouhého "send_message"
- Použij "github_create_issue" místo pouhého "create_issue"
- Použij "asana_list_tasks" místo pouhého "list_tasks"

### Struktura toolu ve FastMCP

Tooly se definují dekorátorem `@mcp.tool` a Pydantic modely pro validaci vstupů:

```python
from pydantic import BaseModel, Field, ConfigDict
from mcp.server.fastmcp import FastMCP

# Inicializace MCP serveru
mcp = FastMCP("example_mcp")

# Pydantic model pro validaci vstupů
class ServiceToolInput(BaseModel):
    '''Input model for service tool operation.'''
    model_config = ConfigDict(
        str_strip_whitespace=True,  # Automaticky odstraní bílé znaky z řetězců
        validate_assignment=True,    # Validuje i při přiřazení
        extra='forbid'              # Zakáže pole navíc
    )

    param1: str = Field(..., description="First parameter description (e.g., 'user123', 'project-abc')", min_length=1, max_length=100)
    param2: Optional[int] = Field(default=None, description="Optional integer parameter with constraints", ge=0, le=1000)
    tags: Optional[List[str]] = Field(default_factory=list, description="List of tags to apply", max_items=10)

@mcp.tool(
    name="service_tool_name",
    annotations={
        "title": "Human-Readable Tool Title",
        "readOnlyHint": True,     # Tool nemění prostředí
        "destructiveHint": False,  # Tool neprovádí destruktivní operace
        "idempotentHint": True,    # Opakované volání nemá další efekt
        "openWorldHint": False     # Tool nekomunikuje s vnějšími entitami
    }
)
async def service_tool_name(params: ServiceToolInput) -> str:
    '''Tool description automatically becomes the 'description' field.

    This tool performs a specific operation on the service. It validates all inputs
    using the ServiceToolInput Pydantic model before processing.

    Args:
        params (ServiceToolInput): Validated input parameters containing:
            - param1 (str): First parameter description
            - param2 (Optional[int]): Optional parameter with default
            - tags (Optional[List[str]]): List of tags

    Returns:
        str: JSON-formatted response containing operation results
    '''
    # Sem přijde implementace
    pass
```

## Klíčové vlastnosti Pydantic v2

- Používej `model_config` místo vnořené třídy `Config`
- Používej `field_validator` místo zastaralého `validator`
- Používej `model_dump()` místo zastaralého `dict()`
- Validátory vyžadují dekorátor `@classmethod`
- Metody validátorů musí mít type hinty

```python
from pydantic import BaseModel, Field, field_validator, ConfigDict

class CreateUserInput(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True
    )

    name: str = Field(..., description="User's full name", min_length=1, max_length=100)
    email: str = Field(..., description="User's email address", pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    age: int = Field(..., description="User's age", ge=0, le=150)

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Email cannot be empty")
        return v.lower()
```

## Volby formátu odpovědi

Podporuj víc výstupních formátů, ať máš flexibilitu:

```python
from enum import Enum

class ResponseFormat(str, Enum):
    '''Output format for tool responses.'''
    MARKDOWN = "markdown"
    JSON = "json"

class UserSearchInput(BaseModel):
    query: str = Field(..., description="Search query")
    response_format: ResponseFormat = Field(
        default=ResponseFormat.MARKDOWN,
        description="Output format: 'markdown' for human-readable or 'json' for machine-readable"
    )
```

**Formát markdown**:
- Používej nadpisy, seznamy a formátování kvůli přehlednosti
- Převáděj timestampy do čitelné podoby (např. "2024-01-15 10:30:00 UTC" místo epochu)
- Zobrazuj jména spolu s ID v závorce (např. "@john.doe (U123456)")
- Vynechávej upovídaná metadata (např. jen jednu URL profilové fotky, ne všechny velikosti)
- Logicky seskupuj související informace

**Formát JSON**:
- Vracej kompletní strukturovaná data vhodná ke strojovému zpracování
- Zahrň všechna dostupná pole a metadata
- Drž konzistentní názvy a typy polí

## Implementace pagination

Pro tooly, které vypisují seznamy zdrojů:

```python
class ListInput(BaseModel):
    limit: Optional[int] = Field(default=20, description="Maximum results to return", ge=1, le=100)
    offset: Optional[int] = Field(default=0, description="Number of results to skip for pagination", ge=0)

async def list_items(params: ListInput) -> str:
    # Zavolej API s parametry pagination
    data = await api_request(limit=params.limit, offset=params.offset)

    # Vrať informace o pagination
    response = {
        "total": data["total"],
        "count": len(data["items"]),
        "offset": params.offset,
        "items": data["items"],
        "has_more": data["total"] > params.offset + len(data["items"]),
        "next_offset": params.offset + len(data["items"]) if data["total"] > params.offset + len(data["items"]) else None
    }
    return json.dumps(response, indent=2)
```

## Ošetření chyb

Dodávej jasné chybové hlášky, se kterými se dá něco dělat:

```python
def _handle_api_error(e: Exception) -> str:
    '''Consistent error formatting across all tools.'''
    if isinstance(e, httpx.HTTPStatusError):
        if e.response.status_code == 404:
            return "Error: Resource not found. Please check the ID is correct."
        elif e.response.status_code == 403:
            return "Error: Permission denied. You don't have access to this resource."
        elif e.response.status_code == 429:
            return "Error: Rate limit exceeded. Please wait before making more requests."
        return f"Error: API request failed with status {e.response.status_code}"
    elif isinstance(e, httpx.TimeoutException):
        return "Error: Request timed out. Please try again."
    return f"Error: Unexpected error occurred: {type(e).__name__}"
```

## Sdílené utility

Společnou funkcionalitu vytáhni do znovupoužitelných funkcí:

```python
# Sdílená funkce pro API requesty
async def _make_api_request(endpoint: str, method: str = "GET", **kwargs) -> dict:
    '''Reusable function for all API calls.'''
    async with httpx.AsyncClient() as client:
        response = await client.request(
            method,
            f"{API_BASE_URL}/{endpoint}",
            timeout=30.0,
            **kwargs
        )
        response.raise_for_status()
        return response.json()
```

## Async/await — osvědčené postupy

Pro síťové requesty a I/O operace používej vždycky async/await:

```python
# Dobře: asynchronní síťový request
async def fetch_data(resource_id: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{API_URL}/resource/{resource_id}")
        response.raise_for_status()
        return response.json()

# Špatně: synchronní request
def fetch_data(resource_id: str) -> dict:
    response = requests.get(f"{API_URL}/resource/{resource_id}")  # Blokuje
    return response.json()
```

## Type hinty

Používej type hinty všude:

```python
from typing import Optional, List, Dict, Any

async def get_user(user_id: str) -> Dict[str, Any]:
    data = await fetch_user(user_id)
    return {"id": data["id"], "name": data["name"]}
```

## Docstringy toolů

Každý tool musí mít vyčerpávající docstring s explicitními typy:

```python
async def search_users(params: UserSearchInput) -> str:
    '''
    Search for users in the Example system by name, email, or team.

    This tool searches across all user profiles in the Example platform,
    supporting partial matches and various search filters. It does NOT
    create or modify users, only searches existing ones.

    Args:
        params (UserSearchInput): Validated input parameters containing:
            - query (str): Search string to match against names/emails (e.g., "john", "@example.com", "team:marketing")
            - limit (Optional[int]): Maximum results to return, between 1-100 (default: 20)
            - offset (Optional[int]): Number of results to skip for pagination (default: 0)

    Returns:
        str: JSON-formatted string containing search results with the following schema:

        Success response:
        {
            "total": int,           # Total number of matches found
            "count": int,           # Number of results in this response
            "offset": int,          # Current pagination offset
            "users": [
                {
                    "id": str,      # User ID (e.g., "U123456789")
                    "name": str,    # Full name (e.g., "John Doe")
                    "email": str,   # Email address (e.g., "john@example.com")
                    "team": str     # Team name (e.g., "Marketing") - optional
                }
            ]
        }

        Error response:
        "Error: <error message>" or "No users found matching '<query>'"

    Examples:
        - Use when: "Find all marketing team members" -> params with query="team:marketing"
        - Use when: "Search for John's account" -> params with query="john"
        - Don't use when: You need to create a user (use example_create_user instead)
        - Don't use when: You have a user ID and need full details (use example_get_user instead)

    Error Handling:
        - Input validation errors are handled by Pydantic model
        - Returns "Error: Rate limit exceeded" if too many requests (429 status)
        - Returns "Error: Invalid API authentication" if API key is invalid (401 status)
        - Returns formatted list of results or "No users found matching 'query'"
    '''
```

## Kompletní příklad

Níže je kompletní příklad MCP serveru v Pythonu:

```python
#!/usr/bin/env python3
'''
MCP Server for Example Service.

This server provides tools to interact with Example API, including user search,
project management, and data export capabilities.
'''

from typing import Optional, List, Dict, Any
from enum import Enum
import httpx
from pydantic import BaseModel, Field, field_validator, ConfigDict
from mcp.server.fastmcp import FastMCP

# Inicializace MCP serveru
mcp = FastMCP("example_mcp")

# Konstanty
API_BASE_URL = "https://api.example.com/v1"

# Enumy
class ResponseFormat(str, Enum):
    '''Output format for tool responses.'''
    MARKDOWN = "markdown"
    JSON = "json"

# Pydantic modely pro validaci vstupů
class UserSearchInput(BaseModel):
    '''Input model for user search operations.'''
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True
    )

    query: str = Field(..., description="Search string to match against names/emails", min_length=2, max_length=200)
    limit: Optional[int] = Field(default=20, description="Maximum results to return", ge=1, le=100)
    offset: Optional[int] = Field(default=0, description="Number of results to skip for pagination", ge=0)
    response_format: ResponseFormat = Field(default=ResponseFormat.MARKDOWN, description="Output format")

    @field_validator('query')
    @classmethod
    def validate_query(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Query cannot be empty or whitespace only")
        return v.strip()

# Sdílené pomocné funkce
async def _make_api_request(endpoint: str, method: str = "GET", **kwargs) -> dict:
    '''Reusable function for all API calls.'''
    async with httpx.AsyncClient() as client:
        response = await client.request(
            method,
            f"{API_BASE_URL}/{endpoint}",
            timeout=30.0,
            **kwargs
        )
        response.raise_for_status()
        return response.json()

def _handle_api_error(e: Exception) -> str:
    '''Consistent error formatting across all tools.'''
    if isinstance(e, httpx.HTTPStatusError):
        if e.response.status_code == 404:
            return "Error: Resource not found. Please check the ID is correct."
        elif e.response.status_code == 403:
            return "Error: Permission denied. You don't have access to this resource."
        elif e.response.status_code == 429:
            return "Error: Rate limit exceeded. Please wait before making more requests."
        return f"Error: API request failed with status {e.response.status_code}"
    elif isinstance(e, httpx.TimeoutException):
        return "Error: Request timed out. Please try again."
    return f"Error: Unexpected error occurred: {type(e).__name__}"

# Definice toolů
@mcp.tool(
    name="example_search_users",
    annotations={
        "title": "Search Example Users",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True
    }
)
async def example_search_users(params: UserSearchInput) -> str:
    '''Search for users in the Example system by name, email, or team.

    [Full docstring as shown above]
    '''
    try:
        # Zavolej API s validovanými parametry
        data = await _make_api_request(
            "users/search",
            params={
                "q": params.query,
                "limit": params.limit,
                "offset": params.offset
            }
        )

        users = data.get("users", [])
        total = data.get("total", 0)

        if not users:
            return f"No users found matching '{params.query}'"

        # Naformátuj odpověď podle požadovaného formátu
        if params.response_format == ResponseFormat.MARKDOWN:
            lines = [f"# User Search Results: '{params.query}'", ""]
            lines.append(f"Found {total} users (showing {len(users)})")
            lines.append("")

            for user in users:
                lines.append(f"## {user['name']} ({user['id']})")
                lines.append(f"- **Email**: {user['email']}")
                if user.get('team'):
                    lines.append(f"- **Team**: {user['team']}")
                lines.append("")

            return "\n".join(lines)

        else:
            # Strojově čitelný JSON formát
            import json
            response = {
                "total": total,
                "count": len(users),
                "offset": params.offset,
                "users": users
            }
            return json.dumps(response, indent=2)

    except Exception as e:
        return _handle_api_error(e)

if __name__ == "__main__":
    mcp.run()
```

---

## Pokročilé funkce FastMCP

### Injektáž parametru Context

FastMCP umí toolům automaticky injektovat parametr `Context` — otevře ti to pokročilé schopnosti jako logování, hlášení průběhu, čtení resources a interakci s uživatelem:

```python
from mcp.server.fastmcp import FastMCP, Context

mcp = FastMCP("example_mcp")

@mcp.tool()
async def advanced_search(query: str, ctx: Context) -> str:
    '''Advanced tool with context access for logging and progress.'''

    # Hlaš průběh u dlouhých operací
    await ctx.report_progress(0.25, "Starting search...")

    # Loguj informace pro debugging
    await ctx.log_info("Processing query", {"query": query, "timestamp": datetime.now()})

    # Proveď vyhledávání
    results = await search_api(query)
    await ctx.report_progress(0.75, "Formatting results...")

    # Přístup ke konfiguraci serveru
    server_name = ctx.fastmcp.name

    return format_results(results)

@mcp.tool()
async def interactive_tool(resource_id: str, ctx: Context) -> str:
    '''Tool that can request additional input from users.'''

    # Vyžádej si citlivou informaci, až když je potřeba
    api_key = await ctx.elicit(
        prompt="Please provide your API key:",
        input_type="password"
    )

    # Použij dodaný klíč
    return await api_call(resource_id, api_key)
```

**Co Context umí:**
- `ctx.report_progress(progress, message)` — hlášení průběhu u dlouhých operací
- `ctx.log_info(message, data)` / `ctx.log_error()` / `ctx.log_debug()` — logování
- `ctx.elicit(prompt, input_type)` — vyžádání vstupu od uživatele
- `ctx.fastmcp.name` — přístup ke konfiguraci serveru
- `ctx.read_resource(uri)` — čtení MCP resources

### Registrace resources

Vystav data jako resources — efektivní přístup přes šablony:

```python
@mcp.resource("file://documents/{name}")
async def get_document(name: str) -> str:
    '''Expose documents as MCP resources.

    Resources are useful for static or semi-static data that doesn't
    require complex parameters. They use URI templates for flexible access.
    '''
    document_path = f"./docs/{name}"
    with open(document_path, "r") as f:
        return f.read()

@mcp.resource("config://settings/{key}")
async def get_setting(key: str, ctx: Context) -> str:
    '''Expose configuration as resources with context.'''
    settings = await load_settings()
    return json.dumps(settings.get(key, {}))
```

**Kdy resources a kdy tooly:**
- **Resources**: přístup k datům s jednoduchými parametry (URI šablony)
- **Tooly**: komplexní operace s validací a byznys logikou

### Strukturované návratové typy

FastMCP podporuje i jiné návratové typy než řetězce:

```python
from typing import TypedDict
from dataclasses import dataclass
from pydantic import BaseModel

# TypedDict pro strukturované návratové hodnoty
class UserData(TypedDict):
    id: str
    name: str
    email: str

@mcp.tool()
async def get_user_typed(user_id: str) -> UserData:
    '''Returns structured data - FastMCP handles serialization.'''
    return {"id": user_id, "name": "John Doe", "email": "john@example.com"}

# Pydantic modely pro komplexní validaci
class DetailedUser(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime
    metadata: Dict[str, Any]

@mcp.tool()
async def get_user_detailed(user_id: str) -> DetailedUser:
    '''Returns Pydantic model - automatically generates schema.'''
    user = await fetch_user(user_id)
    return DetailedUser(**user)
```

### Správa lifespanu

Inicializuj zdroje, které mají přežít napříč requesty:

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def app_lifespan():
    '''Manage resources that live for the server's lifetime.'''
    # Naváž spojení, načti konfiguraci apod.
    db = await connect_to_database()
    config = load_configuration()

    # Zpřístupni všem toolům
    yield {"db": db, "config": config}

    # Úklid při vypnutí
    await db.close()

mcp = FastMCP("example_mcp", lifespan=app_lifespan)

@mcp.tool()
async def query_data(query: str, ctx: Context) -> str:
    '''Access lifespan resources through context.'''
    db = ctx.request_context.lifespan_state["db"]
    results = await db.query(query)
    return format_results(results)
```

### Volby transportu

FastMCP podporuje dva hlavní transportní mechanismy:

```python
# transport stdio (pro lokální nástroje) - výchozí
if __name__ == "__main__":
    mcp.run()

# transport Streamable HTTP (pro vzdálené servery)
if __name__ == "__main__":
    mcp.run(transport="streamable_http", port=8000)
```

**Jak vybrat transport:**
- **stdio**: nástroje z příkazové řádky, lokální integrace, běh jako subproces
- **Streamable HTTP**: webové služby, vzdálený přístup, víc klientů najednou

---

## Osvědčené postupy pro kód

### Kompozovatelnost a znovupoužitelnost kódu

Tvoje implementace MUSÍ dávat přednost kompozovatelnosti a znovupoužití kódu:

1. **Vytáhni společnou funkcionalitu**:
   - Vytvoř znovupoužitelné pomocné funkce pro operace, které používá víc toolů
   - Postav sdílené API klienty pro HTTP requesty místo duplikování kódu
   - Centralizuj logiku ošetření chyb do utility funkcí
   - Vytáhni byznys logiku do vyhrazených funkcí, které jdou skládat dohromady
   - Vytáhni sdílený výběr a formátování polí pro markdown i JSON

2. **Nezanášej kód duplikáty**:
   - NIKDY nekopíruj podobný kód mezi tooly
   - Když píšeš podobnou logiku podruhé, vytáhni ji do funkce
   - Běžné operace jako pagination, filtrování, výběr polí a formátování mají být sdílené
   - Autentizační a autorizační logika patří na jedno místo

### Postupy specifické pro Python

1. **Používej type hinty**: vždycky anotuj parametry funkcí i návratové hodnoty
2. **Pydantic modely**: definuj jasné Pydantic modely pro veškerou validaci vstupů
3. **Nevaliduj ručně**: nech validaci vstupů na Pydanticu a jeho constraintech
4. **Pořádné importy**: seskupuj je (standardní knihovna, third-party, lokální)
5. **Ošetření chyb**: používej konkrétní typy výjimek (httpx.HTTPStatusError, ne obecný Exception)
6. **Asynchronní context managery**: pro zdroje, které potřebují úklid, používej `async with`
7. **Konstanty**: definuj konstanty na úrovni modulu VELKÝMI_PÍSMENY

## Checklist kvality

Než svou implementaci MCP serveru v Pythonu uzavřeš, ověř:

### Strategický návrh
- [ ] Tooly pokrývají celé workflow, ne jenom obalují jednotlivé API endpointy
- [ ] Názvy toolů odpovídají přirozenému dělení úkolů
- [ ] Formáty odpovědí jsou optimalizované na kontextovou efektivitu agenta
- [ ] Tam, kde to dává smysl, se používají lidsky čitelné identifikátory
- [ ] Chybové hlášky navádějí agenta ke správnému použití

### Kvalita implementace
- [ ] SOUSTŘEDĚNÁ IMPLEMENTACE: jsou hotové ty nejdůležitější a nejhodnotnější tooly
- [ ] Všechny tooly mají popisné názvy a dokumentaci
- [ ] Návratové typy jsou konzistentní napříč podobnými operacemi
- [ ] Ošetření chyb je implementované u všech externích volání
- [ ] Jméno serveru odpovídá formátu `{service}_mcp`
- [ ] Všechny síťové operace používají async/await
- [ ] Společná funkcionalita je vytažená do znovupoužitelných funkcí
- [ ] Chybové hlášky jsou jasné, akční a poučné
- [ ] Výstupy jsou správně validované a naformátované

### Konfigurace toolů
- [ ] Všechny tooly mají v dekorátoru 'name' a 'annotations'
- [ ] Anotace jsou nastavené správně (readOnlyHint, destructiveHint, idempotentHint, openWorldHint)
- [ ] Všechny tooly validují vstup přes Pydantic BaseModel s definicemi Field()
- [ ] Všechna Pydantic Field mají explicitní typy, popisy a constrainty
- [ ] Všechny tooly mají vyčerpávající docstringy s explicitními vstupními a výstupními typy
- [ ] Docstringy obsahují kompletní strukturu schématu u návratů typu dict/JSON
- [ ] Validaci vstupů řeší Pydantic modely (ruční validace není potřeba)

### Pokročilé funkce (kde dává smysl)
- [ ] Injektáž Contextu použitá pro logování, průběh nebo elicitaci
- [ ] Resources zaregistrované pro vhodné datové endpointy
- [ ] Správa lifespanu implementovaná pro trvalá spojení
- [ ] Použité strukturované návratové typy (TypedDict, Pydantic modely)
- [ ] Nastavený vhodný transport (stdio nebo streamable HTTP)

### Kvalita kódu
- [ ] Soubor má správné importy včetně těch z Pydanticu
- [ ] Pagination je implementovaná tam, kde dává smysl
- [ ] U potenciálně velkých výsledků jsou k dispozici možnosti filtrování
- [ ] Všechny asynchronní funkce jsou správně definované přes `async def`
- [ ] HTTP klient se používá asynchronně a se správnými context managery
- [ ] Type hinty jsou použité v celém kódu
- [ ] Konstanty jsou definované na úrovni modulu VELKÝMI_PÍSMENY

### Testování
- [ ] Server se úspěšně spustí: `python your_server.py --help`
- [ ] Všechny importy se vyřeší správně
- [ ] Ukázková volání toolů fungují podle očekávání
- [ ] Chybové scénáře jsou ošetřené elegantně
