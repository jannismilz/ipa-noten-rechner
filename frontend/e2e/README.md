# E2E Tests - IPA Noten Rechner

End-to-End Tests mit Playwright für kritische User Journeys.

## Voraussetzungen

1. **Backend-Datenbank muss initialisiert sein:**
   ```bash
   cd backend
   bun run migrate
   bun run seed
   ```

2. **Test-User Credentials (aus seed.js):**
   - Username: `test`
   - Password: `test`

## Setup

```bash
cd frontend
npm install
npx playwright install chromium
```

## Tests ausführen

Die Tests starten automatisch Backend und Frontend Server.

```bash
# Alle E2E Tests
npm run test:e2e

# Mit UI (interaktiv)
npm run test:e2e:ui

# Sichtbar im Browser
npm run test:e2e:headed

# Debug-Modus
npm run test:e2e:debug
```

## Test-Struktur

```
e2e/
├── fixtures.js                    # Test-Fixtures und Helpers
├── global-setup.js                # Globales Setup (Backend-Check)
├── e2e-01-login.spec.js           # E2E-01: Login-Flow
├── e2e-02-onboarding.spec.js      # E2E-02: Onboarding
├── e2e-03-criteria-evaluation.spec.js  # E2E-03: Criteria Evaluation
├── e2e-04-offline-mode.spec.js    # E2E-04: Offline Mode
├── e2e-05-sync-after-login.spec.js # E2E-05: Sync nach Login
├── e2e-06-export.spec.js          # E2E-06: Export-Funktion
├── e2e-07-live-calculation.spec.js # E2E-07: Live-Notenberechnung
└── e2e-08-navigation.spec.js      # E2E-08: Kategorie-Navigation
```

## Implementierte Tests (gemäss TESTKONZEPT.md)

| Test-ID | Testfall | Status |
|---------|----------|--------|
| E2E-01 | Vollständiger Login-Flow | ✅ |
| E2E-02 | Onboarding neuer User | ✅ |
| E2E-03 | Criteria Evaluation Workflow | ✅ |
| E2E-04 | Hybrid Storage - Offline Mode | ✅ |
| E2E-05 | Hybrid Storage - Sync nach Login | ✅ |
| E2E-06 | Export-Funktion | ✅ |
| E2E-07 | Live-Notenberechnung | ✅ |
| E2E-08 | Kategorie-basierte Navigation | ✅ |

## Fixtures

### `authenticatedPage`
Automatisch eingeloggter Page-Context:
```javascript
test('mein test', async ({ authenticatedPage: page }) => {
  // User ist bereits eingeloggt
});
```

### `cleanPage`
Page mit geleertem LocalStorage:
```javascript
test('mein test', async ({ cleanPage: page }) => {
  // LocalStorage ist leer
});
```

## Helpers

- `login(page, username, password)` - Programmatisch einloggen
- `clearStorage(page)` - LocalStorage leeren
- `waitForCriteriaLoad(page)` - Warten bis Criteria geladen
- `getFirstCheckbox(page)` - Erste Checkbox finden

## Troubleshooting

### Backend startet nicht
```bash
cd backend
bun run dev
```
Prüfen ob Port 3001 frei ist.

### Tests schlagen fehl wegen fehlender Daten
```bash
cd backend
bun run migrate
bun run seed
```

### Playwright Browser fehlt
```bash
npx playwright install chromium
```
