# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/)
und dieses Projekt hält sich an [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-05-30

### Hinzugefügt
- **KI-Schreibhilfe (Direkt-Generator)**: Vollständig integrierte, interaktive KI-Schreibhilfe zur automatischen Generierung von Döner-Bewertungen aus Stichpunkten.
- **Sicherheits-Proxy & Backend-Integration**: Verwendung einer sicheren Supabase Edge-Function (`generate-review`) zur Anbindung von Google Gemini 2.5 Flash (`gemini-2.5-flash`), wodurch API-Keys sicher im Backend verwahrt werden.
- **Sitzungsbasiertes Nutzungslimit**: Begrenzung der KI-Nutzung auf maximal 10 Versuche pro Nutzer und Browser-Sitzung (`sessionStorage`), um Missbrauch und hohe API-Kosten zu verhindern.
- **Visueller Versuchs-Counter**: Anzeige des aktuellen Limit-Status direkt im Interface (`X/10 Generierungen frei`).
- **Unit-Tests**: Dedizierte Unit-Tests (`tests/unit/ki-limit.test.js`) zur Absicherung des Sitzungslimits sowie Integrationstests für DOM-Elemente.

### Geändert
- **Layout & Mobile Optimierungen**: Responsive Anpassungen für Desktop und Mobilgeräte. Einheitliche Breiten für alle Funktionsbuttons (`155px` auf Desktop, Flexbox-Alignment auf Mobilgeräten) und kompakte Abstände (`6px` Spacing) zwischen Text und Eingabefeldern.
- **Cache-Buster**: Erhöhung der Version in `index.html` auf `v=5.15` zur unmittelbaren Bereitstellung der aktualisierten Styles und Skripte.

### Entfernt
- Redundante Überschrift `✨ KI-Schreibhilfe` im Container, um ein flacheres, moderneres UI-Design zu erzielen.
