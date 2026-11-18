> Převzato z anthropics/skills (mcp-builder), Copyright 2026 Anthropic, PBC, Apache License 2.0. Tento soubor je český překlad původního textu (změna podle § 4 licence); viz ../NOTICE a ../LICENSE.txt.

# Průvodce implementací MCP serveru v Node/TypeScriptu

## Přehled

Tento dokument popisuje best practices a vývojové předlohy specifické pro Node/TypeScript při implementaci MCP serverů pomocí MCP TypeScript SDK. Pokrývá strukturu projektu, nastavení serveru, vzory registrace toolů, validaci vstupů přes Zod a ošetření chyb.

Ukázky jsou vývojové předlohy: před použitím ověř API aktuálního SDK, doplň vlastní implementace
a testy. HTTP ukázky se vážou výhradně na loopback a neobsahují produkční autentizaci.
Nevystavuj je do sítě ani přes tunel. Vzdálený server potřebuje skutečnou autentizaci a autorizaci,
validaci Host/Origin a pravidla ze souboru mcp_best_practices.md. Anotace `readOnlyHint` není pojistka.

---

## Rychlý přehled

### Klíčové importy
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import { z } from "zod";
```

### Inicializace serveru
```typescript
const server = new McpServer({
  name: "service-mcp-server",
  version: "1.0.0"
});
```

### Vzor registrace toolu
```typescript
server.registerTool(
  "tool_name",
  {
    title: "Tool Display Name",
    description: "What the tool does",
    inputSchema: { param: z.string() },
    outputSchema: { result: z.string() }
  },
  async ({ param }) => {
    const output = { result: `Processed: ${param}` };
    return {
      content: [{ type: "text", text: JSON.stringify(output) }],
      structuredContent: output // Moderní vzor pro strukturovaná data
    };
  }
);
```

---

## MCP TypeScript SDK

Oficiální MCP TypeScript SDK nabízí:
- třídu `McpServer` pro inicializaci serveru
- metodu `registerTool` pro registraci toolů
- integraci Zod schémat pro runtime validaci vstupů
- type-safe implementace tool handlerů

**DŮLEŽITÉ — používej jen moderní API:**
- **POUŽÍVEJ**: `server.registerTool()`, `server.registerResource()`, `server.registerPrompt()`
- **NEPOUŽÍVEJ**: stará deprecated API jako `server.tool()`, `server.setRequestHandler(ListToolsRequestSchema, ...)` nebo ruční registraci handlerů
- Metody `register*` mají lepší typovou bezpečnost, řeší schémata automaticky a jsou doporučený postup

Kompletní detaily najdeš v dokumentaci MCP SDK v referencích.

## Konvence pojmenování serveru

MCP servery v Node/TypeScriptu musí dodržet tento vzor pojmenování:
- **Formát**: `{service}-mcp-server` (malými písmeny, s pomlčkami)
- **Příklady**: `github-mcp-server`, `jira-mcp-server`, `stripe-mcp-server`

Název má být:
- obecný (ne navázaný na konkrétní funkce)
- popisný vůči službě/API, které integruje
- snadno odvoditelný ze zadání
- bez čísel verzí a datumů

## Struktura projektu

Pro MCP servery v Node/TypeScriptu vytvoř tuto strukturu:

```
{service}-mcp-server/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts          # Hlavní vstupní bod s inicializací McpServer
│   ├── types.ts          # Definice TypeScript typů a interfaces
│   ├── tools/            # Implementace toolů (jeden soubor na doménu)
│   ├── services/         # API klienti a sdílené utility
│   ├── schemas/          # Zod validační schémata
│   └── constants.ts      # Sdílené konstanty (API_URL, CHARACTER_LIMIT atd.)
└── dist/                 # Sestavené JavaScript soubory (vstupní bod: dist/index.js)
```

## Implementace toolů

### Pojmenování toolů

Pro názvy toolů používej snake_case (např. "search_users", "create_project", "get_channel_info") — jasné názvy zaměřené na akci.

**Vyhni se kolizím názvů**: přidej kontext služby, ať se názvy nepřekrývají:
- Použij "slack_send_message" místo pouhého "send_message"
- Použij "github_create_issue" místo pouhého "create_issue"
- Použij "asana_list_tasks" místo pouhého "list_tasks"

### Struktura toolu

Tooly se registrují metodou `registerTool` a platí pro ně tyto požadavky:
- Pro runtime validaci vstupů a typovou bezpečnost používej Zod schémata
- Pole `description` musíš vyplnit explicitně — JSDoc komentáře se automaticky NEvytahují
- Explicitně uveď `title`, `description`, `inputSchema` a `annotations`
- `inputSchema` musí být Zod schéma (ne JSON schema)
- Všechny parametry a návratové hodnoty otypuj explicitně

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({
  name: "example-mcp",
  version: "1.0.0"
});

// Zod schéma pro validaci vstupu
const UserSearchInputSchema = z.object({
  query: z.string()
    .min(2, "Query must be at least 2 characters")
    .max(200, "Query must not exceed 200 characters")
    .describe("Search string to match against names/emails"),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe("Maximum results to return"),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe("Number of results to skip for pagination"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable")
}).strict();

// Definice typu odvozená ze Zod schématu
type UserSearchInput = z.infer<typeof UserSearchInputSchema>;

server.registerTool(
  "example_search_users",
  {
    title: "Search Example Users",
    description: `Search for users in the Example system by name, email, or team.

This tool searches across all user profiles in the Example platform, supporting partial matches and various search filters. It does NOT create or modify users, only searches existing ones.

Args:
  - query (string): Search string to match against names/emails
  - limit (number): Maximum results to return, between 1-100 (default: 20)
  - offset (number): Number of results to skip for pagination (default: 0)
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  For JSON format: Structured data with schema:
  {
    "total": number,           // Total number of matches found
    "count": number,           // Number of results in this response
    "offset": number,          // Current pagination offset
    "users": [
      {
        "id": string,          // User ID (e.g., "U123456789")
        "name": string,        // Full name (e.g., "John Doe")
        "email": string,       // Email address
        "team": string,        // Team name (optional)
        "active": boolean      // Whether user is active
      }
    ],
    "has_more": boolean,       // Whether more results are available
    "next_offset": number      // Offset for next page (if has_more is true)
  }

Examples:
  - Use when: "Find all marketing team members" -> params with query="team:marketing"
  - Use when: "Search for John's account" -> params with query="john"
  - Don't use when: You need to create a user (use example_create_user instead)

Error Handling:
  - Returns "Error: Rate limit exceeded" if too many requests (429 status)
  - Returns "No users found matching '<query>'" if search returns empty`,
    inputSchema: UserSearchInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: UserSearchInput) => {
    try {
      // Validaci vstupu řeší Zod schéma
      // Zavolej API s už zvalidovanými parametry
      const data = await makeApiRequest<any>(
        "users/search",
        "GET",
        undefined,
        {
          q: params.query,
          limit: params.limit,
          offset: params.offset
        }
      );

      const users = data.users || [];
      const total = data.total || 0;

      if (!users.length) {
        return {
          content: [{
            type: "text",
            text: `No users found matching '${params.query}'`
          }]
        };
      }

      // Připrav strukturovaný výstup
      const output = {
        total,
        count: users.length,
        offset: params.offset,
        users: users.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          ...(user.team ? { team: user.team } : {}),
          active: user.active ?? true
        })),
        has_more: total > params.offset + users.length,
        ...(total > params.offset + users.length ? {
          next_offset: params.offset + users.length
        } : {})
      };

      // Naformátuj textovou reprezentaci podle požadovaného formátu
      let textContent: string;
      if (params.response_format === ResponseFormat.MARKDOWN) {
        const lines = [`# User Search Results: '${params.query}'`, "",
          `Found ${total} users (showing ${users.length})`, ""];
        for (const user of users) {
          lines.push(`## ${user.name} (${user.id})`);
          lines.push(`- **Email**: ${user.email}`);
          if (user.team) lines.push(`- **Team**: ${user.team}`);
          lines.push("");
        }
        textContent = lines.join("\n");
      } else {
        textContent = JSON.stringify(output, null, 2);
      }

      return {
        content: [{ type: "text", text: textContent }],
        structuredContent: output // Moderní vzor pro strukturovaná data
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: handleApiError(error)
        }]
      };
    }
  }
);
```

## Zod schémata pro validaci vstupů

Zod zajišťuje runtime validaci typů:

```typescript
import { z } from "zod";

// Základní schéma s validací
const CreateUserSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters"),
  email: z.string()
    .email("Invalid email format"),
  age: z.number()
    .int("Age must be a whole number")
    .min(0, "Age cannot be negative")
    .max(150, "Age cannot be greater than 150")
}).strict();  // .strict() zakáže pole navíc

// Enumy
enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json"
}

const SearchSchema = z.object({
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format")
});

// Volitelná pole s výchozími hodnotami
const PaginationSchema = z.object({
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe("Maximum results to return"),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe("Number of results to skip")
});
```

## Volby formátu odpovědi

Kvůli flexibilitě podporuj víc výstupních formátů:

```typescript
enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json"
}

const inputSchema = z.object({
  query: z.string(),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable")
});
```

**Formát markdown**:
- Používej nadpisy, seznamy a formátování kvůli přehlednosti
- Časové značky převeď do lidsky čitelné podoby
- Zobrazuj zobrazované názvy s ID v závorce
- Vynech ukecaná metadata
- Logicky seskupuj související informace

**Formát JSON**:
- Vracej kompletní strukturovaná data vhodná pro programové zpracování
- Zahrň všechna dostupná pole a metadata
- Používej konzistentní názvy polí a typy

## Implementace pagination

Pro tooly, které vypisují seznamy zdrojů:

```typescript
const ListSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0)
});

async function listItems(params: z.infer<typeof ListSchema>) {
  const data = await apiRequest(params.limit, params.offset);

  const response = {
    total: data.total,
    count: data.items.length,
    offset: params.offset,
    items: data.items,
    has_more: data.total > params.offset + data.items.length,
    next_offset: data.total > params.offset + data.items.length
      ? params.offset + data.items.length
      : undefined
  };

  return JSON.stringify(response, null, 2);
}
```

## Limity znaků a ořezávání

Přidej konstantu CHARACTER_LIMIT, ať odpovědi nezahltí kontext:

```typescript
// Na úrovni modulu v constants.ts
export const CHARACTER_LIMIT = 25000;  // Maximální velikost odpovědi ve znacích

async function searchTool(params: SearchInput) {
  let result = generateResponse(data);

  // Zkontroluj limit znaků a v případě potřeby ořízni
  if (result.length > CHARACTER_LIMIT) {
    const truncatedData = data.slice(0, Math.max(1, data.length / 2));
    response.data = truncatedData;
    response.truncated = true;
    response.truncation_message =
      `Response truncated from ${data.length} to ${truncatedData.length} items. ` +
      `Use 'offset' parameter or add filters to see more results.`;
    result = JSON.stringify(response, null, 2);
  }

  return result;
}
```

## Ošetření chyb

Dodávej jasné a akceschopné chybové hlášky:

```typescript
import axios, { AxiosError } from "axios";

function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          return "Error: Resource not found. Please check the ID is correct.";
        case 403:
          return "Error: Permission denied. You don't have access to this resource.";
        case 429:
          return "Error: Rate limit exceeded. Please wait before making more requests.";
        default:
          return `Error: API request failed with status ${error.response.status}`;
      }
    } else if (error.code === "ECONNABORTED") {
      return "Error: Request timed out. Please try again.";
    }
  }
  return `Error: Unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`;
}
```

## Sdílené utility

Společnou funkcionalitu vytáhni do znovupoužitelných funkcí:

```typescript
// Sdílená funkce pro API požadavky
async function makeApiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: any,
  params?: any
): Promise<T> {
  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}/${endpoint}`,
      data,
      params,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
```

## Best practices pro async/await

Pro síťové požadavky a I/O operace vždycky používej async/await:

```typescript
// Dobře: asynchronní síťový požadavek
async function fetchData(resourceId: string): Promise<ResourceData> {
  const response = await axios.get(`${API_URL}/resource/${resourceId}`);
  return response.data;
}

// Špatně: řetězení promisů
function fetchData(resourceId: string): Promise<ResourceData> {
  return axios.get(`${API_URL}/resource/${resourceId}`)
    .then(response => response.data);  // Hůř se to čte i udržuje
}
```

## TypeScript best practices

1. **Používej striktní TypeScript**: v tsconfig.json zapni strict mode
2. **Definuj interfaces**: pro všechny datové struktury vytvoř jasné interface definice
3. **Vyhni se `any`**: použij pořádné typy nebo `unknown` místo `any`
4. **Zod pro runtime validaci**: externí data validuj Zod schématy
5. **Type guardy**: pro složitější kontrolu typů piš type guard funkce
6. **Ošetření chyb**: vždy try-catch a pořádná kontrola typu chyby
7. **Null safety**: používej optional chaining (`?.`) a nullish coalescing (`??`)

```typescript
// Dobře: type-safe se Zodem a interfaces
interface UserResponse {
  id: string;
  name: string;
  email: string;
  team?: string;
  active: boolean;
}

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  team: z.string().optional(),
  active: z.boolean()
});

type User = z.infer<typeof UserSchema>;

async function getUser(id: string): Promise<User> {
  const data = await apiCall(`/users/${id}`);
  return UserSchema.parse(data);  // Runtime validace
}

// Špatně: použití any
async function getUser(id: string): Promise<any> {
  return await apiCall(`/users/${id}`);  // Žádná typová bezpečnost
}
```

## Konfigurace balíčku

### package.json

Základ před doplněním závislostí. Vyber prověřené konkrétní verze MCP SDK, axios, zod,
express a vývojových nástrojů typescript, tsx, @types/node a @types/express z oficiálního
registru. Doplň přesné verze bez rozsahů, zkontroluj advisories a commitni lockfile.

```json
{
  "name": "{service}-mcp-server",
  "version": "1.0.0",
  "description": "MCP server for {Service} API integration",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "build": "tsc"
  },
  "engines": {
    "node": "24.x"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Kompletní příklad

```typescript
#!/usr/bin/env node
/**
 * MCP Server for Example Service.
 *
 * This server provides tools to interact with Example API, including user search,
 * project management, and data export capabilities.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import express from "express";

// Konstanty
const API_BASE_URL = "https://api.example.com/v1";
const CHARACTER_LIMIT = 25000;

// Enumy
enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json"
}

// Zod schémata
const UserSearchInputSchema = z.object({
  query: z.string()
    .min(2, "Query must be at least 2 characters")
    .max(200, "Query must not exceed 200 characters")
    .describe("Search string to match against names/emails"),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe("Maximum results to return"),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe("Number of results to skip for pagination"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable")
}).strict();

type UserSearchInput = z.infer<typeof UserSearchInputSchema>;

// Sdílené pomocné funkce
async function makeApiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: any,
  params?: any
): Promise<T> {
  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}/${endpoint}`,
      data,
      params,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          return "Error: Resource not found. Please check the ID is correct.";
        case 403:
          return "Error: Permission denied. You don't have access to this resource.";
        case 429:
          return "Error: Rate limit exceeded. Please wait before making more requests.";
        default:
          return `Error: API request failed with status ${error.response.status}`;
      }
    } else if (error.code === "ECONNABORTED") {
      return "Error: Request timed out. Please try again.";
    }
  }
  return `Error: Unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`;
}

// Vytvoř instanci MCP serveru
const server = new McpServer({
  name: "example-mcp",
  version: "1.0.0"
});

// Zaregistruj tooly
server.registerTool(
  "example_search_users",
  {
    title: "Search Example Users",
    description: `[Full description as shown above]`,
    inputSchema: UserSearchInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: UserSearchInput) => {
    // Implementace jako výše
  }
);

// Hlavní funkce
// Pro stdio (lokálně):
async function runStdio() {
  if (!process.env.EXAMPLE_API_KEY) {
    console.error("ERROR: EXAMPLE_API_KEY environment variable is required");
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server running via stdio");
}

// Pro streamable HTTP (vzdáleně):
async function runHTTP() {
  if (!process.env.EXAMPLE_API_KEY) {
    console.error("ERROR: EXAMPLE_API_KEY environment variable is required");
    process.exit(1);
  }

  const app = express();
  app.use(express.json());

  app.post('/mcp', async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true
    });
    res.on('close', () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  const port = parseInt(process.env.PORT || '3000');
  app.listen(port, '127.0.0.1', () => {
    console.error(`MCP server running on http://localhost:${port}/mcp`);
  });
}

// Vyber transport podle prostředí
const transport = process.env.TRANSPORT || 'stdio';
if (transport === 'http') {
  runHTTP().catch(error => {
    console.error("Server error:", error);
    process.exit(1);
  });
} else {
  runStdio().catch(error => {
    console.error("Server error:", error);
    process.exit(1);
  });
}
```

---

## Pokročilé funkce MCP

### Registrace resources

Data vystav jako resources, ať jsou efektivně dostupná přes URI:

```typescript
import { ResourceTemplate } from "@modelcontextprotocol/sdk/types.js";

// Zaregistruj resource s URI šablonou
server.registerResource(
  {
    uri: "file://documents/{name}",
    name: "Document Resource",
    description: "Access documents by name",
    mimeType: "text/plain"
  },
  async (uri: string) => {
    // Vytáhni parametr z URI
    const match = uri.match(/^file:\/\/documents\/(.+)$/);
    if (!match) {
      throw new Error("Invalid URI format");
    }

    const documentName = match[1];
    const content = await loadDocument(documentName);

    return {
      contents: [{
        uri,
        mimeType: "text/plain",
        text: content
      }]
    };
  }
);

// Dynamicky vypiš dostupné resources
server.registerResourceList(async () => {
  const documents = await getAvailableDocuments();
  return {
    resources: documents.map(doc => ({
      uri: `file://documents/${doc.name}`,
      name: doc.name,
      mimeType: "text/plain",
      description: doc.description
    }))
  };
});
```

**Kdy použít resources a kdy tooly:**
- **Resources**: pro přístup k datům s jednoduchými parametry v URI
- **Tooly**: pro komplexní operace, které potřebují validaci a byznys logiku
- **Resources**: když jsou data spíš statická nebo šablonovitá
- **Tooly**: když mají operace vedlejší efekty nebo složité workflow

### Volby transportu

TypeScript SDK podporuje dva hlavní transportní mechanismy:

#### Streamable HTTP (doporučeno pro vzdálené servery)

```typescript
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";

const app = express();
app.use(express.json());

app.post('/mcp', async (req, res) => {
  // Pro každý požadavek nový transport (bezstavové, brání kolizím request ID)
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });

  res.on('close', () => transport.close());

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.listen(3000, '127.0.0.1');
```

#### stdio (pro lokální integrace)

```typescript
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const transport = new StdioServerTransport();
await server.connect(transport);
```

**Výběr transportu:**
- **Streamable HTTP**: webové služby, vzdálený přístup, více klientů
- **stdio**: nástroje z příkazové řádky, lokální vývoj, integrace přes subproces

### Podpora notifikací

Dej klientům vědět, když se změní stav serveru:

```typescript
// Notifikace při změně seznamu toolů
server.notification({
  method: "notifications/tools/list_changed"
});

// Notifikace při změně resources
server.notification({
  method: "notifications/resources/list_changed"
});
```

Notifikace používej střídmě — jen když se schopnosti serveru opravdu změní.

---

## Best practices pro kód

### Kompozovatelnost a znovupoužitelnost kódu

Tvoje implementace MUSÍ klást důraz na kompozovatelnost a znovupoužití kódu:

1. **Vytáhni společnou funkcionalitu**:
   - Pro operace používané napříč tooly piš znovupoužitelné pomocné funkce
   - Místo duplikování kódu postav sdílené API klienty pro HTTP požadavky
   - Logiku ošetření chyb centralizuj do utility funkcí
   - Byznys logiku vytáhni do samostatných funkcí, které jdou skládat
   - Vytáhni i sdílený výběr a formátování polí pro markdown nebo JSON

2. **Vyhni se duplikaci**:
   - NIKDY nekopíruj podobný kód mezi tooly
   - Když píšeš podobnou logiku podruhé, vytáhni ji do funkce
   - Běžné operace jako pagination, filtrování, výběr polí a formátování mají být sdílené
   - Logika autentizace/autorizace patří na jedno centrální místo

## Build a spuštění

Před spuštěním vždycky svůj TypeScript kód sestav:

```bash
# Sestav projekt
npm run build

# Spusť server
npm start

# Vývoj s automatickým reloadem
npm run dev
```

Než implementaci označíš za hotovou, vždycky ověř, že `npm run build` proběhne bez chyb.

## Checklist kvality

Než finalizuješ implementaci MCP serveru v Node/TypeScriptu, ověř:

### Strategický návrh
- [ ] Tooly umožňují celá workflow, ne jen obalení API endpointů
- [ ] Názvy toolů odpovídají přirozenému dělení úkolů
- [ ] Formáty odpovědí šetří kontext agenta
- [ ] Tam, kde to dává smysl, se používají lidsky čitelné identifikátory
- [ ] Chybové hlášky navádějí agenta ke správnému použití

### Kvalita implementace
- [ ] SOUSTŘEDĚNÁ IMPLEMENTACE: implementované jsou nejdůležitější a nejhodnotnější tooly
- [ ] Všechny tooly jsou registrované přes `registerTool` s kompletní konfigurací
- [ ] Všechny tooly mají `title`, `description`, `inputSchema` a `annotations`
- [ ] Anotace jsou nastavené správně (readOnlyHint, destructiveHint, idempotentHint, openWorldHint)
- [ ] Všechny tooly používají Zod schémata pro runtime validaci vstupů s vynuceným `.strict()`
- [ ] Všechna Zod schémata mají pořádná omezení a popisné chybové hlášky
- [ ] Všechny tooly mají vyčerpávající popisy s explicitními vstupními/výstupními typy
- [ ] Popisy obsahují příklady návratových hodnot a kompletní dokumentaci schématu
- [ ] Chybové hlášky jsou jasné, akceschopné a poučné

### Kvalita TypeScriptu
- [ ] Pro všechny datové struktury jsou definované TypeScript interfaces
- [ ] V tsconfig.json je zapnutý striktní TypeScript
- [ ] Nikde se nepoužívá typ `any` — místo něj `unknown` nebo pořádné typy
- [ ] Všechny async funkce mají explicitní návratový typ Promise<T>
- [ ] Ošetření chyb používá pořádné type guardy (např. `axios.isAxiosError`, `z.ZodError`)

### Pokročilé funkce (kde dává smysl)
- [ ] Pro vhodné datové endpointy jsou zaregistrované resources
- [ ] Je nakonfigurovaný odpovídající transport (stdio nebo streamable HTTP)
- [ ] Pro dynamické schopnosti serveru jsou implementované notifikace
- [ ] Vše je type-safe vůči SDK interfaces

### Konfigurace projektu
- [ ] Package.json obsahuje všechny potřebné závislosti
- [ ] Build skript vyprodukuje funkční JavaScript ve složce dist/
- [ ] Hlavní vstupní bod je správně nastavený na dist/index.js
- [ ] Název serveru odpovídá formátu: `{service}-mcp-server`
- [ ] tsconfig.json je správně nakonfigurovaný se strict mode

### Kvalita kódu
- [ ] Tam, kde to dává smysl, je pořádně implementovaná pagination
- [ ] Velké odpovědi kontrolují konstantu CHARACTER_LIMIT a ořezávají se s jasnou hláškou
- [ ] Pro potenciálně velké výsledky jsou k dispozici volby filtrování
- [ ] Všechny síťové operace elegantně zvládají timeouty a chyby spojení
- [ ] Společná funkcionalita je vytažená do znovupoužitelných funkcí
- [ ] Návratové typy jsou u podobných operací konzistentní

### Testování a build
- [ ] `npm run build` proběhne bez chyb
- [ ] dist/index.js je vytvořený a spustitelný
- [ ] Server běží: `node dist/index.js --help`
- [ ] Všechny importy se správně resolvují
- [ ] Ukázková volání toolů fungují podle očekávání
