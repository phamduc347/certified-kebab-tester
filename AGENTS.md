# Globale Agenten-Regeln

## Geltungsbereich
- Diese Regeln gelten fuer alle Agenten im Workspace (z. B. Copilot, Antigravity, Gemini, Claude).

## Code-Style
- Nutze konsistente Namensgebung.
- Halte Funktionen klein und klar.
- Erklaere nur komplexe Logik mit kurzen Kommentaren.

## Sicherheit
- Niemals Secrets, Tokens oder Passwoerter committen.
- Im Frontend nur oeffentliche Schluessel (z. B. Supabase anon key) verwenden.

## Git-Workflow
- Verwende Commit-Praefixe wie feat:, fix:, docs:, chore:, deploy:.
- Nutze das deploy: Präfix ausschließlich nach expliziter Aufforderung.
- Halte Commits klein und fachlich fokussiert.
- Führe git add, git commit und git push niemals gemeinsam aus.
- Workflow: git add -> git status -> (Prüfen) -> git commit -> git push.

## Tests
- Aendere produktiven Code nur mit passender Validierung.
- Führe vor jedem Commit zwingend die run_tests.sh aus.
- Dokumentiere bekannte Risiken kurz im PR/Commit.

## Kommunikation
- Antworte praezise und umsetzungsorientiert.
- Nenne betroffene Dateien und relevante Auswirkungen.
- Gebe für Git-Schritte kopierbare Einzelbefehle aus (keine Ketten).

## Tool-Interaktion
- Probiere stets die Terminalausführung über `run_command` aus, auch wenn es zuvor technische Fehler gab.