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
2. Führe das SQL aus [supabase-comments.sql](supabase-comments.sql) im SQL Editor aus.
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

## Deployment via GitHub Pages
Diese Website wird als statische Seite über GitHub Pages gehostet. Um sie zu deployen:

1. Lade die Dateien in ein GitHub Repository hoch.
2. Gehe zu **Settings → Pages** und wähle den `main`-Branch als Quelle aus.
3. GitHub Pages veröffentlicht die Seite automatisch unter `https://<dein-username>.github.io/<repo-name>/`.

## Lokale Entwicklung
Um die Website lokal zu testen, öffne einfach die `index.html` Datei in einem beliebigen Webbrowser. Es wird kein lokaler Server benötigt.
