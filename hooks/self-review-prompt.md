Kontrola sebezlepšení (self-review smyčka kitu). Než skončíš, ohlédni se za touhle session a zachyť cokoliv TRVALÉHO — pak pokračuj.

1. KOREKCE → PRAVIDLA. Opravil tě uživatel, přebil tvoje rozhodnutí, nebo dal najevo trvalou preferenci (tón, formát, nástroj, který máš nebo nemáš používat, nějakou hranici)? Pokud ano:
   a) NEJDŘÍV HLEDEJ, jestli k tématu pravidlo už není. Prohledej docs/learnings/INDEX.md i složku docs/learnings/ (grep na klíčová slova tématu), potom docs/playbook/INDEX.md. Tovární pravidlo z playbooku nepřepisuj: oprava uživatele patří do docs/learnings/ a má přednost.
   b) PRAVIDLO K TÉMATU EXISTUJE → DOPLŇ HO, nový soubor nezakládej. Připiš do něj sekci „## Doplněno __TODAY__“: co se stalo, co teď platí a proč. Dva learningy k jednomu tématu se časem rozejdou a začnou si odporovat; sessions pak jednají podle obou.
   c) ŽÁDNÉ NEEXISTUJE → založ krátký nový soubor v docs/learnings/ (jeden soubor na téma). Vždycky napiš i „proč“: precedens je to, co pravidlu dá váhu ještě za půl roku. POTOM k němu přidej řádek do docs/learnings/INDEX.md. Levý sloupec je SPOUŠTĚČ („Když děláš X…“), ne téma; pravý sloupec je odkaz plus pointa na jeden řádek. Index se načítá na začátku každé session, takže každá věta v něm se platí pořád dokola.
   Řádek v indexu u nového pravidla (c) není volitelný: SessionStart hook injektuje INDEX, ne složku. Pravidlo bez řádku v indexu se nikdy nepřečte, a nepřečtené pravidlo je dražší než žádné. U doplnění (b) řádek mění jen tehdy, když se změnil spouštěč nebo pointa.

2. OPAKOVANÝ POSTUP → DOVEDNOST. Provedl jsi vícekrokový postup, který se bude opakovat? Pokud ano, založ novou dovednost v skills/<název>/SKILL.md. Označ ji jako vygenerovanou agentem, aby ji týdenní kurátor dovedností uměl spravovat — do frontmatteru dej:
   ---
   name: <název>
   description: <kdy se má spustit>
   metadata:
     origin: agent-created
     created: "__TODAY__"
   ---
   Drž ji malou a konkrétní; kurátor ji vyřadí, když se nebude používat.

3. NEZACHYCUJ tohle (jinak si systém otráví vlastní paměť):
   • Nic, co platí jen pro tenhle stroj nebo prostředí (cesta, která existuje jen tady, jednorázový výpadek, nestabilní síťové volání).
   • Žádná tvrzení typu „nástroj X je rozbitý / nefunguje" — dočasné selhání není trvalá pravda a další verze se může chovat jinak. Zachycuj, JAK se nástroj používá, nikdy plošný zápor.
   • Nic, co už pokrývá ústava AGENTS.md, existující learning nebo historie gitu.
   • Nic, co mělo význam jen pro tenhle jeden rozhovor.

Když není co trvalého zachytit, odpověz přesně [SKIP] a skonči. Nevymýšlej si práci.
