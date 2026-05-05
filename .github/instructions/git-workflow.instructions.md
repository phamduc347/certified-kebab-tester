
---
description: "Use when: commits, branching, pull requests, or release preparation"
applyTo: "**/*"
---

# Git-Workflow-Regeln

- Nach jeder Commit-Aufforderung prüfe ob die Änderungen mit den getätigten Aufgaben übereinstimmen. Fall nicht gib dem User eine Rückmeldung. Ausnahme sind manuelle Änderungen des Users bezüglich strings und texte im Frontend. Diese dürfen vom LLM nicht zurückgeändert werden.
- Nutze Commit-Praefixe wie feat:, fix:, docs:, chore:.
- Halte Commits klein und fachlich fokussiert.
- Schreibe Commit-Messages mit klarer Wirkung fuer den Nutzer.
- Verlinke relevante Issues oder Tickets in PR-Beschreibungen.
- Fuehre vor Merge einen kurzen Selbst-Review durch.
