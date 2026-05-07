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
- Nutze die git-workflow md aus dem instructions Ordner.

## Tests
- Aendere produktiven Code nur mit passender Validierung.
- Führe vor jedem Commit zwingend die run_tests.sh aus.
- Priorisiere das Aktualisieren von Tests gegenüber dem Löschen. Ziel ist eine hohe Test-Coverage.
- Dokumentiere bekannte Risiken kurz im PR/Commit.

## Kommunikation
- Antworte praezise und umsetzungsorientiert.
- Nenne betroffene Dateien und relevante Auswirkungen.
- Gebe für Git-Schritte kopierbare Einzelbefehle aus (keine Ketten).

## Tool-Interaktion
- Probiere stets die Terminalausführung über `run_command` aus, auch wenn es zuvor technische Fehler gab.
- Falls Standardbefehle (wie git) fehlschlagen, nutze `which <befehl>`, um den absoluten Pfad zu ermitteln und verwende diesen für weitere Versuche.

## (WICHTIG!) Grundlegender Workflow bei neuer oder geänderte Funktionalität und/oder UI Elementen
1. **Funktion prüfen:** Bevor eine neue Funktion implementiert wird, muss im Code überprüft werden, ob es für diese Funktion bereits eine ähnliche Implementierung an anderer Stelle gibt. Ziel ist es, vorhandene Muster und Bibliotheken zu nutzen, um Redundanzen zu vermeiden und Konsistenz zu gewährleisten.
2. **UI-Komponenten erstellen:** Falls keine passende UI-Komponente existiert, muss im Verzeichnis `ui/components` eine neue erstellt werden. Neue UI-Komponenten müssen in der Datei `ui/main.js` integriert werden, um die maximale Kompatibilität und Funktionalität sicherzustellen.
3. **Testing:** Nach der Implementierung der Funktion muss sichergestellt werden, dass ein entsprechender Test case dafür existiert. Falls nicht, muss ein Test case erstellt werden. Falls eine Funktion geändert wird, dürfen die Testerwartungen niemals automatisch angepasst werden, sondern müssen vom User reviewed werden. Bei FAILED tests, muss entweder die Funktion an die Testerwartung angepasst oder die Testerwartung an die Funktion angepasst werden (nach Absprache mit User).
4. **Deployment:** Nach erfolgreichen Tests muss dem User eine kurze Zusammenfassung der Änderungen gegeben werden. Falls der User manuelle Änderungen im workspace vornimmt, sollen diese auch dokumentiert und erläutert werden. Was wurde geändert und warum. Kurz und prägnant. Anschließend darf der commit bash-Befehl ausgeführt werden.
