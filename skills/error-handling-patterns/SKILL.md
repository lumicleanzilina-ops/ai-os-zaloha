---
name: error-handling-patterns
description: Zvládni patterny ošetření chyb napříč jazyky — exceptions, Result types, propagace chyb a graceful degradation pro odolné aplikace. Použij, když řešíš ošetření chyb, padá ti to na neošetřené výjimce, navrhuješ API nebo chceš, aby appka nespadla při každém výpadku.
---

# Patterny ošetření chyb

Stav odolné aplikace díky robustnímu ošetření chyb, které elegantně zvládne selhání a zároveň ti dá skvělý zážitek při debuggingu.

## Kdy tuhle dovednost použít
- Implementuješ ošetření chyb v nové funkcionalitě
- Navrhuješ API odolné vůči chybám
- Debuguješ problémy v produkci
- Zvyšuješ spolehlivost aplikace
- Tvoříš lepší chybové hlášky pro uživatele i vývojáře
- Implementuješ retry a circuit breaker patterny
- Řešíš chyby v asynchronním/souběžném kódu
- Stavíš fault-tolerant distribuované systémy

## Workflow

Když máš implementovat nebo zrevidovat ošetření chyb, postupuj takhle:
1.  **Analyzuj kontext**: Urči, kde se dá čekat selhání (např. síť, uživatelský vstup, externí API).
2.  **Urči typ chyby**: Rozhodni, jestli je chyba zotavitelná (např. timeout sítě), nebo nezotavitelná (např. OOM).
3.  **Vyber pattern**: Zvol vhodný pattern (např. Result types, Circuit Breaker, retry) podle jazyka a situace.
4.  **Naimplementuj ošetření**: Napiš logiku ošetření chyb podle best practices níže.
5.  **Dodej kontext**: Postarej se, aby chyby byly zabalené do smysluplných hlášek a kontextu pro debugging.

## Základní koncepty

### 1. Filozofie ošetření chyb
- **Exceptions vs. Result types:**
  - *Exceptions:* Klasický try-catch, narušuje tok řízení. Nejlepší na nečekané chyby a výjimečné stavy.
  - *Result types:* Explicitní úspěch/selhání, funkcionální přístup. Nejlepší na očekávané chyby a selhání validace.
- **Chybové kódy:** Styl z C, vyžaduje disciplínu.
- **Option/Maybe typy:** Pro hodnoty, které můžou být prázdné.
- **Paniky/pády:** Nezotavitelné chyby, programátorské bugy.

### 2. Kategorie chyb
- **Zotavitelné chyby:** Timeouty sítě, chybějící soubory, neplatný vstup od uživatele, rate limity API.
- **Nezotavitelné chyby:** Došlá paměť, přetečení zásobníku, programátorské bugy (null pointer apod.).

## Patterny podle jazyka

### Ošetření chyb v Pythonu
**Vlastní hierarchie výjimek a její použití:**
```python
class ApplicationError(Exception):
    """Base exception for all application errors."""
    def __init__(self, message: str, code: str = None, details: dict = None):
        super().__init__(message)
        self.code = code
        self.details = details or {}
        self.timestamp = datetime.utcnow()

class NotFoundError(ApplicationError):
    pass

def get_user(user_id: str) -> User:
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise NotFoundError(f"User not found", code="USER_NOT_FOUND", details={"user_id": user_id})
    return user
```

**Context managery a retry:**
Na úklid používej `@contextmanager` a na síťová volání naimplementuj retry dekorátory s exponenciálním backoffem.

### Ošetření chyb v TypeScriptu/JavaScriptu
**Vlastní error třídy a práce s asynchronním kódem:**
```typescript
class ApplicationError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 500, public details?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Result type pro explicitní ošetření chyb
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
```

### Ošetření chyb v Rustu
Opři se naplno o typy `Result` a `Option`. Na elegantní propagaci chyb používej operátor `?`. Vlastní chyby implementuj přes `enum` a trait `From`, ať se konverze dějí samy.

### Ošetření chyb v Go
Vždycky vracej chyby explicitně. Používej sentinel errors na porovnávání (`errors.Is`) a zabalování chyb (`fmt.Errorf("... %w", err)`). Když potřebuješ víc kontextu, naimplementuj vlastní chybový typ jako struct.

## Univerzální patterny

### Pattern 1: Circuit breaker
Zabraň kaskádovým selháním v distribuovaných systémech tím, že volání obalíš stavovým automatem (CLOSED -> OPEN -> HALF_OPEN).
- **CLOSED:** Normální provoz.
- **OPEN:** Selhává, odmítej požadavky.
- **HALF_OPEN:** Testuje se, jestli je to zase v pořádku.

### Pattern 2: Agregace chyb
Posbírej víc chyb naráz (např. validace formuláře), místo abys spadl na první z nich, a pak vyhoď jednu agregovanou chybu.

### Pattern 3: Graceful degradation
Když nastane chyba, nabídni náhradní funkčnost (např. fallback logika z cache -> databáze -> výchozí hodnoty).

## Best practices
- **Fail fast:** Validuj vstup brzo, padej rychle.
- **Zachovej kontext:** Přibal stack trace, metadata, časová razítka.
- **Smysluplné hlášky:** Vysvětli, co se stalo a jak to spravit.
- **Loguj s rozmyslem:** Chyba = zaloguj, očekávané selhání = nezahlcuj logy.
- **Ošetři na správné úrovni:** Chytej tam, kde s tím umíš smysluplně naložit.
- **Uklízej zdroje:** Používej try-finally, context managery, defer.
- **Nepolykej chyby:** Zaloguj je nebo je vyhoď dál, nikdy je tiše neignoruj.
- **Typově bezpečné chyby:** Kde to jde, používej typované chyby.

## Časté chyby
- **Chytáš příliš široce:** `except Exception` zamaskuje bugy.
- **Prázdné catch bloky:** Tiché spolknutí chyby.
- **Logování a vyhození dál:** Vznikají duplicitní záznamy v logu.
- **Neuklízíš:** Zapomenuté zavření souborů a spojení.
- **Mizerné chybové hlášky:** „Nastala chyba“ nikomu nepomůže.

> Původ: wshobson/agents, dovednost error-handling-patterns (MIT, Copyright (c) 2024 Seth Hobson); zkráceno a přeloženo do češtiny. Licence a změny: THIRD-PARTY-NOTICES.md v kořeni kitu.
