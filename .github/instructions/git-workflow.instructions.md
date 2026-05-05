
---
description: "Use when: commits, branching, pull requests, or release preparation"
applyTo: "**/*"
---

# Git-Workflow-Regeln

- Vor jedem Commit und push prüfe ob die Änderungen mit den getätigten Aufgaben übereinstimmen. Fall nicht gib dem User eine Rückmeldung. Ausnahme sind manuelle Änderungen des Users bezüglich strings und texte im Frontend. Diese dürfen vom LLM nicht zurückgeändert werden.
- Nutze Commit-Praefixe wie feat:, fix:, docs:, chore:, deploy:.
- Nutze das deploy: Präfix ausschließlich nach expliziter Aufforderung durch den User.
- Halte Commits klein und fachlich fokussiert.
- Schreibe Commit-Messages mit klarer Wirkung fuer den Nutzer.
- Verlinke relevante Issues oder Tickets in PR-Beschreibungen.
- Fuehre vor Merge einen kurzen Selbst-Review durch.
- Gebe ausschließlich die Befehle für git add, git commit und git push aus (kopierbar als Einzeiler für den User).
- Stelle sicher, dass alle technischen Änderungen (Dateien schreiben/ändern) abgeschlossen sind, bevor ein Commit-Befehl vorgeschlagen wird.

