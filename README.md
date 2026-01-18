# IPA Noten Rechner

Eine Web-Applikation zur Selbstbewertung anhand des offiziellen [IPA Kriterienkatalogs](https://www.ict-berufsbildung.ch/resources/Kriterienkatalog_QV_BiVO2021_DE-20251025.pdf).

## Features

- 📋 Vollständiger Kriterienkatalog mit allen Bewertungskriterien
- 📊 Live-Notenberechnung mit Fortschrittsanzeige
- 💾 Hybride Datenspeicherung (LocalStorage oder Datenbank)
- 🔐 Optionale Authentifizierung
- 📤 Export/Import Funktionalität
- 🎯 Unterstützung für Agile und Lineare Projektmethoden

## Quick Start

```bash
# Repository klonen
git clone https://github.com/bbwheroes/324-ruts-ipa_noten_rechner-jannismilz
cd 324-ruts-ipa_noten_rechner-jannismilz

# Dependencies installieren
npm --prefix ./frontend install ./frontend
bun install --cwd ./backend

# Umgebungsvariablen konfigurieren
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Datenbank einrichten
cd backend && bun run migrate

# Server starten
bun run dev          # Backend (Port 3001)
cd ../frontend && npm run dev  # Frontend (Port 5173)
```

Für detaillierte Anweisungen siehe [CONTRIBUTING.md](./CONTRIBUTING.md).

## Dokumentation

| Dokument | Beschreibung |
|----------|--------------|
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Setup, Development, API Endpoints |
| [Kriterienkatalog Spezifikation](./docs/KRITERIENKATALOG.md) | JSON-Format des Kriterienkatalogs |
| [Testkonzept](./docs/TESTKONZEPT.md) | Teststrategie, Testfälle, Abdeckung |
| [KI-Nutzung](./docs/KI_NUTZUNG.md) | Dokumentation der KI-Unterstützung |
| [Backend README](./backend/README.md) | Backend-spezifische Dokumentation |

## Projektstruktur

```
├── backend/          # Express.js API mit Bun
├── frontend/         # React + Vite
├── shared/           # Geteilte Logik (Notenberechnung)
├── docs/             # Dokumentation
└── criterias.json    # Kriterienkatalog
```

## Tech Stack

- **Frontend:** React, Vite, Lucide Icons
- **Backend:** Express.js, Bun, PostgreSQL
- **Testing:** Bun Test, Vitest, Playwright
- **CI/CD:** GitHub Actions, Docker
