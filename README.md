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

### Moderation (aktiv)
- Neue Kommentare werden mit `is_approved = false` gespeichert.
- Öffentlich angezeigt werden nur Kommentare mit `is_approved = true`.
- Freigabe im Supabase SQL Editor:

```sql
UPDATE public.review_comments
SET is_approved = true
WHERE id = <kommentar_id>;
```

- Alle wartenden Kommentare anzeigen:

```sql
SELECT id, spot_id, author, comment_text, created_at
FROM public.review_comments
WHERE is_approved = false
ORDER BY created_at DESC;
```

### Community Reviews mit Bild-Upload (neu)
- Nutzer koennen einen kompletten Review-Beitrag mit Bewertungskriterien und genau einem Bild einreichen.
- Neue Beitraege landen mit `is_approved = false` in `public.community_reviews`.
- Bilder werden im Bucket `community-review-images` gespeichert.
- Sichtbar auf der Website sind nur freigegebene Beitraege (`is_approved = true`).

Freigabe von Community Reviews im Supabase SQL Editor:

```sql
UPDATE public.community_reviews
SET is_approved = true
WHERE id = <review_id>;
```

Wartende Community Reviews anzeigen:

```sql
SELECT id, reviewer_name, spot_name, city, created_at
FROM public.community_reviews
WHERE is_approved = false
ORDER BY created_at DESC;
```

## Deployment via GitHub Pages
Diese Website wird als statische Seite über GitHub Pages gehostet. Um sie zu deployen:

1. Lade die Dateien in ein GitHub Repository hoch.
2. Gehe zu **Settings → Pages** und wähle den `main`-Branch als Quelle aus.
3. GitHub Pages veröffentlicht die Seite automatisch unter `https://<dein-username>.github.io/<repo-name>/`.

## Lokale Entwicklung
Um die Website lokal zu testen, öffne einfach die `index.html` Datei in einem beliebigen Webbrowser. Es wird kein lokaler Server benötigt.

## Tests ausführen
- Windows (PowerShell): `./run_tests.ps1`
- macOS/Linux (Bash): `./run_tests.sh`

Beide Skripte führen die Unit-Tests im `tests`-Ordner aus und nutzen einen stabilen Reporter, damit die Ausgabe in verschiedenen Terminaltypen zuverlässig sichtbar ist.
