# Projekt TODO - Modul 324 & 450

## Organisation und Zusammenarbeit im Team

- [x] Sie arbeiten im Team mit einem Partner
- [x] Sie nutzen ein Git-Repository und checken die Software regelmässig nach jedem Arbeitsschritt ein
- [x] Jeder im Team hat jeder Zeit Zugriff auf den aktuellen Stand der Dokumente des Teams (Arbeitplanung, Software, Tests, etc.)
- [x] Sie kommunizieren effizient, transparent über Ihr Vorgehen, geplante Arbeiten und Erledigtes
- [x] Jeder im Team ist fähig über alles im Projekt kompetent Auskunft zu geben
- [x] Ihr Projekt muss sich von den Projekten anderer Teams deutlich unterscheiden
- [x] Sie entwickeln das Projekt kontinuierlich stetig weiter. Kleine Schritte, die abgeschlossen sind. Agiles Vorgehen

## Dev-Ops (Modul 324)

- [x] Der Code muss bei jedem Commit automatisch gebaut werden
- [x] Fehlgeschlagene Builds sollen die Pipeline stoppen und eine Fehlermeldung zurückgeben
- [x] Alle Unit-Tests und Integrationstests werden automatisch ausgeführt
- [ ] Die Tests müssen beim Durchlaufen der Pipeline mindestens 80 % der definierten Testfälle bestehen
- [x] Testergebnisse sollen in der GitHub Actions-Übersicht dargestellt werden
- [x] Ein Linter überprüft den Code und meldet Fehler
- [x] Nach erfolgreichem Testen soll die Pipeline die App automatisch in eine Staging-Umgebung deployen
- [x] Sensible Daten wie API-Keys sollen sicher mit GitHub Secrets verwaltet werden
- [x] Jeder Schritt in der GitHub Actions-Konfiguration (YAML-Datei) muss kommentiert sein
- [x] Die Funktionsweise der Pipeline wird kurz im Projektbericht dokumentiert
- [x] Die Pipeline muss spezifische Fehlermeldungen ausgeben, z.B. bei fehlgeschlagenen Tests oder Builds

## Testing (Modul 450)

- [ ] Erstellen eines Testkonzepts mit Definition der Testarten (z.B. Unit-Tests, Integrationstests, E2E-Tests)
- [ ] Dokumentation der Testfälle mit Beschreibung von Vorbedingungen, Eingaben, erwarteten Ergebnissen und Nachbedingungen
- [ ] Nachvollziehbare Dokumentation der Testergebnisse, Testprotokolle
- [x] Implementierung und Ausführung automatisierter Tests mit einem Testframework (Jest, JUnit, Cypress...)
- [ ] Abdeckung von mindestens 80 % der User-Story-Anforderungen durch Tests
- [ ] Nutzung von Mocking-Tools oder Stubs, um Abhängigkeiten in Integrationstests zu simulieren
- [ ] Einhaltung der Clean-Code-Prinzipien, um Tests effizient und wartbar zu gestalten

## Custom

- [x] Favicon
- [x] Kriterienkatalog Spezifikation Checker CLI
- [x] Auf VPS hosten unter https://ipa.jannismilz.ch mit Testumgebung
- [ ] Ganzer Kriterienkatalog von https://www.ict-berufsbildung.ch/resources/Kriterienkatalog_QV_BiVO2021_DE-20251025.pdf in `criteria.json` einfügen
- [x] KI Nutzung dokumentieren