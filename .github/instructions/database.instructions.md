
---
description: "Use when: changing SQL, Supabase schema, policies, or data files"
applyTo: "**/*.{sql,js}"
---

# Datenbank-Regeln

- RLS standardmaessig aktivieren und Policies explizit definieren.
- Keine service_role Secrets im Frontend speichern.
- Schema-Aenderungen rueckwaertskompatibel planen.
- SQL-Objekte eindeutig und konsistent benennen.
- Vor Release Migrationen in Testumgebung pruefen.
