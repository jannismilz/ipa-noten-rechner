# IPA Noten Rechner

Die Voraussetzungen für dieses Projekt sind zum Teil in [Projektbeschreibung](Projektbeschreibung.html) beschrieben. 

**Zudem soll folgendes implementiert werden:**
- Optionale Authentifizierung/Login (nur für uns, keine Registrierung möglich)
- Onboarding (optional nach Anmeldung) soll kommen, wenn Personendaten noch nicht erfasst wurden
- Hybridge Datenspeicherung (wenn angemeldet, über API in DB und sonst im LocalStorage mit Export funktion)
- Es wird ein langer Kriterienkatalog zusammengetragen in einer JSON Datei, welche dann angezeigt wird
- Jedes Kriterium soll in seine Kategorien eingeteilt werden
- Jedes Kriterium und jede Kategorie soll zusammenklappbar sein
- Am Anfang dieses Formulars soll eine kleine Übersicht sein, die den Fortschritt anzeigt und den Fortschritt in die Kategorien aufteilt
- Es soll möglich sein, die Noten live anzusehen in der Übersicht am Anfang

## Get Started

Dependencies for
```
npm, bun
```

Install
```bash
git clone https://github.com/bbwheroes/324-ruts-ipa_noten_rechner-jannismilz
npm --prefix ./frontend install ./frontend && bun install --cwd ./backend
```


## Linter & Formatter

*Frontend:*
```bash
npm run lint          # Check for errors
npm run lint:fix      # Auto-fix errors
npm run format        # Format code
npm run format:check  # Check formatting
```

*Backend:*
```bash
bun run lint          # Check for errors
bun run lint:fix      # Auto-fix errors
bun run format        # Format code
bun run format:check  # Check formatting
```

## Kriterienkatalog Spezifikation

```json
{
    "categories_with_weigth": [
        {
            "id": "hkb", // Eindeutige ID
            "name": "Handlungskompetenzen",
            "weight": 0.5, // 50% Gewichtung
            "part": "Teil 1" // Teil 1 oder 2 für die Notenberechnung
        },
    ],
    "criterias": [
        {
            "id": "A01", // Eindeutige ID
            // id aus categories_with_weigth
            "category": "hkb",
            "title": "Auftragsanalyse und Wahl einer Projektmethode",
            "subtitle": "Wie erfolgt die Auftragsanalyse? Welche Projektmethode kommtzum Einsatz?",
            "selection": "multiple", // multiple (checkbox), single (radio)
            // Selbe Reihenfolge wie im Kriterienkatalog
            "requirements": [
                "Der Projektauftrag wurde analysiert und die Erkenntnisse mittels geeigneter Darstellungsmethoden (z. B. Zielstruktur, Use-Case- oder Kontextdiagramm, Anforderungstabelle) schriftlich dokumentiert.",
                "Dokumentation aus Punkt 1 liefert die Grundlage, um die Projektziele konsequent zu verfolgen.",
                "Eine zur Aufgabe passende Projektmethode wurde ausgewählt.",
                "Die Wahl der Projektmethode ist nachvollziehbar und schriftlich begründet."
            ],
            "stages": {
                // Gütestufe 3
                "3": {
                    // Alle Felder sind optional, aber es muss mindestens ein Feld definiert sein
                    "all": true, // Alle Bedingungen erfüllt
                    "count": 1, // 1 Bedingung erfüllt
                    "counts": [2, 3], // 2 oder 3 Bedingungen erfüllt
                    "count_less_than": 2, // Weniger als 2 Bedingungen erfüllt
                    "must": 4 // Genau Bedingung 4 erfüllt
                },
                // ...
                "0": {
                    // ...
                }
            }
        }
        // ...
    ]
}
```

### Validierung

```bash
npm run helpers/validate-criterias.js
# oder
bun run helpers/validate-criterias.js
```
