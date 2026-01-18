# Contributing / Development Setup

## Voraussetzungen

- [Node.js](https://nodejs.org/) (für Frontend)
- [Bun](https://bun.sh/) (für Backend)
- [PostgreSQL](https://www.postgresql.org/) oder Docker

## Installation

### 1. Repository klonen und Dependencies installieren

```bash
git clone https://github.com/bbwheroes/324-ruts-ipa_noten_rechner-jannismilz
cd 324-ruts-ipa_noten_rechner-jannismilz

# Frontend Dependencies
npm --prefix ./frontend install ./frontend

# Backend Dependencies
bun install --cwd ./backend
```

### 2. Umgebungsvariablen konfigurieren

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Passe die `.env` Dateien nach Bedarf an (Datenbank-Verbindung, JWT Secret, etc.).

### 3. Datenbank einrichten

```bash
cd backend
bun run migrate    # Datenbank-Migrationen ausführen
bun run seed       # (Optional) Testdaten einfügen
```

### 4. Benutzer erstellen

```bash
cd backend
bun run create-user
```

Interaktives CLI zum Erstellen eines neuen Benutzers.

## Development Server starten

### Backend

```bash
cd backend
bun run dev    # Mit Hot Reload auf Port 3001
# oder
bun run start  # Produktionsmodus
```

### Frontend

```bash
cd frontend
npm run dev    # Vite Dev Server auf Port 5173
```

## Docker

Alternativ kann das Backend mit PostgreSQL via Docker gestartet werden:

```bash
docker-compose up -d      # Starten
docker-compose down       # Stoppen
```

## Linting & Formatting

### Frontend

```bash
cd frontend
npm run lint          # Fehler prüfen
npm run lint:fix      # Fehler automatisch beheben
npm run format        # Code formatieren
npm run format:check  # Formatierung prüfen
```

### Backend

```bash
cd backend
bun run lint          # Fehler prüfen
bun run lint:fix      # Fehler automatisch beheben
bun run format        # Code formatieren
bun run format:check  # Formatierung prüfen
```

## Tests ausführen

### Backend

```bash
cd backend
bun test              # Alle Tests
bun test --watch      # Watch Mode
```

### Frontend

```bash
cd frontend
npm run test          # Unit & Integration Tests
npm run test:e2e      # E2E Tests (Playwright)
npm run test:e2e:ui   # E2E Tests mit UI
```

Siehe [Testkonzept](./docs/TESTKONZEPT.md) für Details.

## API Endpoints

| Endpoint | Methode | Beschreibung | Auth |
|----------|---------|--------------|------|
| `/api/auth/login` | POST | Benutzer anmelden | - |
| `/api/users/profile` | GET | Profil abrufen | ✅ |
| `/api/users/profile` | PUT | Profil aktualisieren | ✅ |
| `/api/evaluations/criteria` | GET | Kriterienkatalog laden | - |
| `/api/evaluations` | GET | Evaluierungen abrufen | ✅ |
| `/api/evaluations/:id` | POST | Evaluierung speichern | ✅ |
| `/api/evaluations/calculate` | GET | Noten berechnen | ✅ |

Authentifizierung erfolgt via JWT Token im `Authorization: Bearer <token>` Header.

## Projektstruktur

```
├── backend/
│   ├── src/
│   │   ├── db/           # Datenbank (Migrations, Seeds)
│   │   ├── middleware/   # Express Middleware
│   │   ├── routes/       # API Routes
│   │   └── test/         # Backend Tests
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   # React Komponenten
│   │   ├── context/      # React Context (Auth)
│   │   ├── pages/        # Seiten-Komponenten
│   │   ├── services/     # API & Storage Services
│   │   └── test/         # Frontend Tests
│   ├── e2e/              # Playwright E2E Tests
│   └── Dockerfile
├── shared/               # Geteilter Code (Notenberechnung)
├── docs/                 # Dokumentation
└── criterias.json        # Kriterienkatalog
```

## Git Workflow

1. Feature-Branch erstellen: `git checkout -b feature/mein-feature`
2. Änderungen committen mit aussagekräftigen Messages
3. Pull Request erstellen
4. Code Review abwarten
5. Nach Approval: Merge in `main`

## CI/CD

Bei jedem Push werden automatisch ausgeführt:
- Linting (ESLint, Prettier)
- Backend Tests (Bun)
- Frontend Tests (Vitest)
- E2E Tests (Playwright)
- Deployment auf Staging (bei erfolgreichem Build)
