# Globale Agenten-Regeln

## Geltungsbereich
- Diese Regeln gelten für alle Agenten im Workspace (z. B. Copilot, Antigravity, Gemini, Claude).

## Wichtig: Single Source of Truth
Alle fachlichen, technischen und organisatorischen Verhaltensregeln sind in den entsprechenden Instruktionsdateien im Verzeichnis `.github/instructions/` definiert. Diese müssen zwingend beachtet und angewendet werden:

- **Projekt-Richtlinien, Code-Style & Grundlegender Workflow:**
  Siehe [.github/instructions/project-rules.instructions.md](file:///Users/pham/Antigravity/certified-kebab-tester/.github/instructions/project-rules.instructions.md)
- **Git-Workflow & Commit-Berechtigungen:**
  Siehe [.github/instructions/git-workflow.instructions.md](file:///Users/pham/Antigravity/certified-kebab-tester/.github/instructions/git-workflow.instructions.md)
- **Frontend- & UI-Entwicklung:**
  Siehe [.github/instructions/frontend.instructions.md](file:///Users/pham/Antigravity/certified-kebab-tester/.github/instructions/frontend.instructions.md)
- **Datenbank & Supabase-Edge-Functions:**
  Siehe [.github/instructions/database.instructions.md](file:///Users/pham/Antigravity/certified-kebab-tester/.github/instructions/database.instructions.md)
- **Deployment-Regeln:**
  Siehe [.github/instructions/deployment.instructions.md](file:///Users/pham/Antigravity/certified-kebab-tester/.github/instructions/deployment.instructions.md)

---

## Globale Meta-Regeln (Kommunikation & Interaktion)

### Kommunikation
- Antworte präzise und umsetzungsorientiert.
- Nenne betroffene Dateien und relevante Auswirkungen.
- Gib für Git-Schritte kopierbare Einzelbefehle aus (keine Ketten).

### Tool-Interaktion
- Probiere stets die Terminalausführung über `run_command` aus, auch wenn es zuvor technische Fehler gab.
- Falls Standardbefehle (wie `git`) fehlschlagen, nutze `which <befehl>`, um den absoluten Pfad zu ermitteln, und verwende diesen für weitere Versuche.
