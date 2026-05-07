
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
- Fuehre vor Merge einen kurzen Selbst-Review durch.
- Git-Befehler können als Einzeiler oder im Batch gegeben werden.
- Stelle sicher, dass alle technischen Änderungen (Dateien schreiben/ändern) abgeschlossen sind, bevor ein Commit-Befehl vorgeschlagen wird.