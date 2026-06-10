# Certified Kebab Tester

Ein datengetriebener, minimalistischer und interaktiver Döner-Vergleich, basierend auf strengen Bewertungskriterien.

## Features
- **Spinnendiagramm (Radar Chart)**: Visueller Vergleich verschiedener Spots über Metriken wie Fleisch, Gemüse, Soße, Brot, Balance, Auswahl, Portion, Hygiene und Service.
- **Minimalistisches Design**: Monochromes, elegantes und modernes UI.
- **Performance**: Lädt blitzschnell als statische Webseite.
- **Community-Kommentare pro Review**: Kommentare werden über Supabase geladen und gespeichert.

## Supabase Setup (Kommentare)
Die Supabase-Anbindung ist bereits eingerichtet. Die Zugangsdaten (`url` und `anonKey`) sind direkt in [index.html](index.html) unter `window.SUPABASE_CONFIG` hinterlegt.

Falls du das Projekt neu aufsetzen oder in ein eigenes Supabase-Projekt migrieren möchtest:

1. Lege in Supabase ein neues Projekt an.
2. Führe das SQL aus [database/supabase-comments.sql](database/supabase-comments.sql) im SQL Editor aus.
3. Trage in [index.html](index.html) bei `window.SUPABASE_CONFIG` deine Werte für `url` und `anonKey` ein.
4. Stelle sicher, dass unter **Authentication → URL Configuration** deine Website-Domain als erlaubte Redirect-URL eingetragen ist.

### Spam-Schutz (aktiv)
- Clientseitig: 30s Cooldown zwischen Kommentaren, Duplikat-Block, lokale Ratenbegrenzung mit temporärer Sperre.
- Clientseitig: Honeypot-Feld gegen einfache Bot-Formular-Fills.
- Supabase-seitig: Mindestlänge für Autor/Kommentar, Link-Block (`http`, `https`, `www`) und max. 3 Inserts pro Autor in 10 Minuten.

### Moderation (automatisch)
- Neue Beiträge und Kommentare werden sofort veröffentlicht (`is_approved = true`).
- Der Betreiber behält sich vor, unpassende Inhalte nachträglich zu entfernen.

### Community Reviews mit Bild-Upload (neu)
- Nutzer koennen einen kompletten Review-Beitrag mit Bewertungskriterien und genau einem Bild einreichen.
- Das Submit-Modal ist als 3-Schritt-Flow aufgebaut (Basisdaten -> Bild & Kommentar -> Bewertung) inklusive Fortschrittsanzeige.
- Bilder werden im Bucket `community-review-images` gespeichert.

## Deployment via GitHub Pages
Diese Website wird als statische Seite über GitHub Pages gehostet. Um sie zu deployen:

1. Lade die Dateien in ein GitHub Repository hoch.
2. Gehe zu **Settings → Pages** und wähle den `main`-Branch als Quelle aus.
3. GitHub Pages veröffentlicht die Seite automatisch unter `https://<dein-username>.github.io/<repo-name>/`.

## Lokale Entwicklung
Für die lokale Entwicklung wird aufgrund von ES-Modulen und CORS-Richtlinien bei API-Aufrufen ein lokaler Webserver empfohlen. Starte diesen z. B. über:
```bash
npx serve .
```
oder
```bash
python3 -m http.server 8000
```
Öffne anschließend die Adresse (z. B. `http://localhost:3000` bzw. `http://localhost:8000`) in deinem Browser.

## Tests ausführen
- Windows (PowerShell): `./run_tests.ps1`
- macOS/Linux (Bash): `./run_tests.sh`

Beide Skripte führen die Unit-Tests im `tests`-Ordner aus und nutzen einen stabilen Reporter, damit die Ausgabe in verschiedenen Terminaltypen zuverlässig sichtbar ist.

## Git Commit-Message Hook
Im Repo liegt ein `commit-msg` Hook unter `.githooks/commit-msg`, der den Commit-Betreff prueft:
- Erlaubte Praefixe: `feat`, `fix`, `docs`, `chore`, `deploy`, `refactor`, `test`, `style`, `perf`, `ci`, `build`, `revert`
- Format: `<prefix>: <text>`
- Nur Kleinbuchstaben im Betreff
- Maximale Laenge des Betreffs: 72 Zeichen

Aktivierung (einmal pro lokalem Clone):
```bash
git config core.hooksPath .githooks
```
