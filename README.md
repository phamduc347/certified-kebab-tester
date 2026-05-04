# Pham Certified Kebab Tester

Ein datengetriebener, minimalistischer und interaktiver Döner-Vergleich, basierend auf strengen Bewertungskriterien.

## Features
- **Spinnendiagramm (Radar Chart)**: Visueller Vergleich verschiedener Spots über Metriken wie Fleisch, Gemüse, Soße, Brot, Balance, Auswahl, Portion, Hygiene und Service.
- **Minimalistisches Design**: Monochromes, elegantes und modernes UI.
- **Performance**: Lädt blitzschnell als statische Webseite.
- **Community-Kommentare pro Review**: Kommentare werden über Supabase geladen und gespeichert.

## Supabase Setup fuer Kommentare
1. Lege in Supabase ein Projekt an.
2. Fuehre das SQL aus [supabase-comments.sql](supabase-comments.sql) im SQL Editor aus.
3. Trage in [index.html](index.html) bei `window.SUPABASE_CONFIG` deine Werte fuer `url` und `anonKey` ein.
4. Stelle sicher, dass in Supabase unter Authentication > URL Configuration deine Website-Domain erlaubt ist.

### Spam-Schutz (aktiv)
- Clientseitig: 30s Cooldown zwischen Kommentaren, Duplikat-Block, lokale Ratenbegrenzung mit temporaerer Sperre.
- Clientseitig: Honeypot-Feld gegen einfache Bot-Formular-Fills.
- Supabase-seitig: Mindestlaenge fuer Autor/Kommentar, Link-Block (`http`, `https`, `www`) und max. 3 Inserts pro Autor in 10 Minuten.

### Moderation (aktiv)
- Neue Kommentare werden mit `is_approved = false` gespeichert.
- Oeffentlich angezeigt werden nur Kommentare mit `is_approved = true`.
- Freigabe in Supabase SQL Editor:

```sql
update public.review_comments
set is_approved = true
where id = <kommentar_id>;
```

- Alle wartenden Kommentare anzeigen:

```sql
select id, spot_id, author, comment_text, created_at
from public.review_comments
where is_approved = false
order by created_at desc;
```

## Deployment via GitHub Pages
Diese Website ist für das automatische Deployment via GitHub Pages konfiguriert.
Sobald du diese Dateien in den `main` oder `master` Branch eines GitHub Repositories hochlädst, kümmert sich die konfigurierte GitHub Action (`.github/workflows/pages.yml`) automatisch um das Hosting und die Veröffentlichung deiner Seite.

## Lokale Entwicklung
Um die Website lokal zu testen, öffne einfach die `index.html` Datei in einem beliebigen Webbrowser. Es wird kein lokaler Server benötigt.
