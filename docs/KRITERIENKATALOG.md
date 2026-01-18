# Kriterienkatalog Spezifikation

Dieses Dokument beschreibt die Struktur und das Format der `criterias.json` Datei, welche den [offiziellen Kriterienkatalog](https://www.ict-berufsbildung.ch/resources/Kriterienkatalog_QV_BiVO2021_DE-20251025.pdf) abbildet.

## JSON-Struktur

```json
{
    "categories_with_weigth": [
        {
            "id": "hkb",
            "name": "Handlungskompetenzen",
            "weight": 0.5,
            "part": "Teil 1"
        }
    ],
    "criterias": [
        {
            "id": "A01",
            "category": "hkb",
            "title": "Auftragsanalyse und Wahl einer Projektmethode",
            "subtitle": "Wie erfolgt die Auftragsanalyse? Welche Projektmethode kommt zum Einsatz?",
            "selection": "multiple",
            "requirements": [
                "Anforderung 1...",
                "Anforderung 2..."
            ],
            "stages": {
                "3": { "all": true },
                "2": { "count": 3 },
                "1": { "count": 2 },
                "0": { "count_less_than": 2 }
            }
        }
    ]
}
```

## Felder

### Kategorien (`categories_with_weigth`)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | string | Eindeutige ID der Kategorie |
| `name` | string | Anzeigename der Kategorie |
| `weight` | number | Gewichtung (0.0 - 1.0), z.B. 0.5 = 50% |
| `part` | string | "Teil 1" oder "Teil 2" für die Notenberechnung |

### Kriterien (`criterias`)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | string | Eindeutige ID des Kriteriums (z.B. "A01") |
| `category` | string | Referenz auf `categories_with_weigth.id` |
| `title` | string | Titel des Kriteriums |
| `subtitle` | string | Untertitel/Fragestellung |
| `selection` | string | `"multiple"` (Checkbox) oder `"single"` (Radio) |
| `requirements` | array | Liste der Anforderungen (strings oder objects) |
| `stages` | object | Gütestufen-Definitionen (3, 2, 1, 0) |

### Anforderungen (`requirements`)

Anforderungen können als einfache Strings oder als Objekte mit Projektmethoden-Filter definiert werden:

```json
"requirements": [
    "Einfache Anforderung als String",
    { "text": "Anforderung nur für Linear", "projectMethod": "Linear" },
    { "text": "Anforderung nur für Agil", "projectMethod": "Agil" }
]
```

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `text` | string | Text der Anforderung |
| `projectMethod` | string | Optional: "Linear" oder "Agil" |

### Gütestufen (`stages`)

Jede Gütestufe (3, 2, 1, 0) kann folgende Bedingungen haben:

| Bedingung | Typ | Beschreibung |
|-----------|-----|--------------|
| `all` | boolean | Alle Anforderungen müssen erfüllt sein |
| `count` | number | Mindestanzahl erfüllter Anforderungen |
| `counts` | array | Eine der Anzahlen muss erfüllt sein (z.B. [2, 3]) |
| `count_less_than` | number | Weniger als X Anforderungen erfüllt |
| `must` | number | Genau diese Anforderung (1-basiert) muss erfüllt sein |

**Hinweis:** Mindestens eine Bedingung muss pro Gütestufe definiert sein.

## Validierung

Die Struktur der `criterias.json` kann mit folgendem Befehl validiert werden:

```bash
bun run helpers/validate-criterias.js
```

## Beispiel

```json
{
    "id": "A12",
    "category": "hkb",
    "title": "Testdurchführung und Dokumentation",
    "subtitle": "Wie wurde die Testdurchführung organisiert und dokumentiert?",
    "selection": "multiple",
    "requirements": [
        "Es wurde eine Beschreibung der Testinfrastruktur bereitgestellt.",
        "Verbesserungspotential wurde identifiziert.",
        { "text": "Relevante Testszenarien sind beschrieben.", "projectMethod": "Linear" },
        { "text": "Tests wurden basierend auf Testszenarien durchgeführt.", "projectMethod": "Linear" },
        { "text": "Es existiert eine Definition of Done (DoD).", "projectMethod": "Agil" },
        { "text": "Tests wurden basierend auf der DoD durchgeführt.", "projectMethod": "Agil" }
    ],
    "stages": {
        "3": { "count": 4 },
        "2": { "count": 3 },
        "1": { "count": 2 },
        "0": { "count_less_than": 2 }
    }
}
```
