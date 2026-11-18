# ZAČNI TADY — AI OS KIT 4.4

Nemusíš umět programovat, používat terminál ani číst celý kit. Technickou práci udělá agent a průběžně vysvětlí, co nastavujete a proč.

## 1. OTEVŘI AGENTA
Použij aktuální Claude Code nebo Codex s přístupem k místním souborům. U Claude Desktopu otevři záložku Code, pod polem pro zprávu zvol prostředí Local a ve výběru složky Open folder… (podrobně v [oficiálním začátku](https://code.claude.com/docs/en/desktop-quickstart)). U Codexu použij [oficiální začátek](https://learn.chatgpt.com/docs/quickstart). Stačí jeden agent; přístup k AI službě se řídí tvým účtem.

Na tarifu Claude Pro přepni model na Sonnet: šetří limit využití. Vybereš ho pod polem pro zprávu (na Macu Cmd+Shift+I). Opus nech na náročné úkoly.

Když se Claude zeptá, zda složce důvěřuješ, potvrď to: jinak kit nemůže předschválit čtecí příkazy a bude se ptát častěji.

## 2. ROZBAL ZIP
Na Macu na stažený ZIP dvakrát klikni, složka se rozbalí vedle něj. Na Windows na něj klikni pravým tlačítkem, zvol Extrahovat vše… a potvrď. Vlastní pracovní složku `AI-OS` ti založí agent přímo v tvé domovské složce (Mac `~/AI-OS`, Windows `C:\Users\TVE_JMENO\AI-OS`), ne v Ploše ani v Dokumentech, které se mohou synchronizovat do iCloudu či OneDrive. Zálohu řeší kit přes Git a GitHub, ne synchronizace složky. Nový uživatel otevře v agentovi tu složku, ve které přímo leží START.md (jmenuje se AI OS Kit 4.4.0; na Windows může být o úroveň níž). Pokud už vlastní AI OS používáš (V.03 nebo V.04), otevři svou dosavadní pracovní složku a novou distribuci nech vedle ní; v Claude Code ji agentovi zpřístupníš přes + vedle pole pro zprávu → Add folder. Nevidí-li agent novou složku, sděl mu, kam jsi ZIP rozbalil. Nic přes původní práci nepřepisuj.

## 3. NAPIŠ JEDNU VĚTU
> Přečti si START.md v nové složce kitu a proveď mě dalším krokem.

Je-li agent otevřený ve staré pracovní složce, přidej cestu k novému START.md. Cestu můžeš vložit přes výběr souboru v agentovi; zástupné jméno níže nahraď svou skutečnou cestou:
- Mac: ~/Downloads/AI OS Kit 4.4.0/START.md
- Windows: C:\Users\TVE_JMENO\Downloads\AI OS Kit 4.4.0\START.md

Agent zjistí, zda začínáš, pokračuješ, nebo už máš V.03 či V.04. Pokud už Kit máš, nejdřív jen přečte START a [novinky](CHANGELOG.md), vysvětlí je a nabídne výběr. Můžeš rovnou dodat: „Používám V.03 (nebo V.04); ukaž mi novinky jen nástroji pro čtení souborů, bez terminálu, a zatím nic neměň.“ Agent pak nic nespouští; ve starém workspace se může zeptat na povolení čtecího příkazu (ls, grep), který nic nezapisuje. Dotaz nic nemění ani nespouští upgrade.

## 4. ODPOVÍDEJ V ROZHOVORU
Agent postupně projde tvou práci, pravidla, dovednosti, nástroje, paměť, rutiny a zálohu. U každé možnosti můžeš odpovědět „nastavit teď“, „později“ nebo „nepotřebuji“. První hotový úkol ještě není konec: agent pak pokračuje dalšími oblastmi. Volby i návrat ukládá agent. „Nevím“ znamená, že ti možnosti vysvětlí a doporučí další krok.

Pro technické nástroje Kitu bude potřeba Node 24 a Git. Agent je nejprve zkontroluje a podle [SETUP](docs/SETUP.md) připraví; pokud instalace vyžaduje tvé kliknutí nebo souhlas systému, ukáže jeden konkrétní krok. Pojistky aktivuje až potom. Nejsou funkční jen tím, že rozbalíš ZIP.

Hesla a přihlašovací kódy zadáváš přímo do přihlášení služby, nikdy do chatu. Každý placený účet vybíráš ty.

## KDYKOLI PŘERUŠ A VRAŤ SE
Agent připraví tvoji vlastní pracovní složku a ukáže její cestu. Příště ji otevři a napiš: „Načti můj profil a stav nastavení a pokračuj dalším krokem.“ Dokončené části se neopakují.

Po dokončení celého Kitu 4.4 může následovat Dashboard 4.4 ze samostatného druhého ZIPu; je volitelný a je to beta. Doporučená je nová session ve stejné pracovní složce; hotovou první zprávu s cestami ti připraví agent. Profil už znovu nevyplňuješ.

## Stav
Kit 4.4; [známá omezení](docs/ZNAME-LIMITY.md). V.03 není podmínkou prvního použití.

Průvodce pro agenta: [START.md](START.md).
