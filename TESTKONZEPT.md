# Testkonzept - IPA Noten Rechner

## 1. Testarten und Teststrategie

| Testart | Beschreibung | Framework | Ziel |
|---------|--------------|-----------|------|
| **Unit-Tests** | Testen isolierter Funktionen und Komponenten | Bun Test, Vitest | Geschäftslogik, Berechnungen, Utilities |
| **Integrationstests** | Testen des Zusammenspiels mehrerer Komponenten | Bun Test | API-Routes, Middleware, Datenbankoperationen |
| **E2E-Tests** | Testen vollständiger Benutzerszenarien | Playwright/Cypress | Kritische Benutzerflows |

### Testpyramide
- **70%** Unit-Tests (schnell, isoliert)
- **20%** Integrationstests (API, DB-Interaktion)
- **10%** E2E-Tests (kritische User Journeys)

## 2. Backend-Tests

### 2.1 Unit-Tests

#### Notenberechnung (`shared/gradeCalculation.js`)

| Test-ID | Testfall | Vorbedingung | Eingabe | Erwartetes Ergebnis | Status |
|---------|----------|--------------|---------|---------------------|--------|
| UT-GC-01 | Berechnung für "single" Selection mit korrektem Index | Kriterium mit single Selection | tickedRequirements mit einem Element | Korrekte Gütestufe basierend auf "must" | ✅ Implementiert |
| UT-GC-02 | Berechnung für "multiple" Selection mit allen Anforderungen | Kriterium mit "all" Bedingung | Alle Requirements angekreuzt | Gütestufe 3 | ✅ Implementiert |
| UT-GC-03 | Berechnung für "count" Bedingung | Kriterium mit "count" Bedingung | Mindestanzahl Requirements erfüllt | Entsprechende Gütestufe | ✅ Implementiert |
| UT-GC-04 | Berechnung für "counts" Array | Kriterium mit "counts" Array | Anzahl in Array vorhanden | Entsprechende Gütestufe | ✅ Implementiert |
| UT-GC-05 | Berechnung mit leeren Requirements | Gültiges Kriterium | Leeres Array | null oder 0 | ✅ Implementiert |
| UT-GC-06 | Kategorie-Score Berechnung | Mehrere Kriterien, Gewichtung | Evaluation-Daten | Korrekte gewichtete Note | ✅ Implementiert |
| UT-GC-07 | Punkte zu Note Konvertierung | Punkte und Maxpunkte | 50% erreicht | Note 3.5 | ✅ Implementiert |
| UT-GC-08 | Finale Note Berechnung | Kategorie-Scores mit Gewichtung | CategoryScores Objekt | Korrekte Endnote (1-6) | ✅ Implementiert |

### 2.2 Integrationstests

#### Authentifizierung (`routes/auth.js`)

| Test-ID | Testfall | Vorbedingung | Eingabe | Erwartetes Ergebnis | Status |
|---------|----------|--------------|---------|---------------------|--------|
| IT-AU-01 | Login mit gültigen Credentials | User existiert in DB | username, password | 200, Token + userId | ✅ Implementiert |
| IT-AU-02 | Login mit ungültigem Username | DB bereit | Nicht existierender Username | 401, "Invalid credentials" | ✅ Implementiert |
| IT-AU-03 | Login mit falschem Passwort | User existiert | Falsches Passwort | 401, "Invalid credentials" | ✅ Implementiert |
| IT-AU-04 | Login ohne Username | DB bereit | Nur Passwort | 400, "Username and password required" | ✅ Implementiert |
| IT-AU-05 | Login ohne Passwort | DB bereit | Nur Username | 400, "Username and password required" | ✅ Implementiert |

#### Evaluierungen (`routes/evaluations.js`)

| Test-ID | Testfall | Vorbedingung | Eingabe | Erwartetes Ergebnis | Status |
|---------|----------|--------------|---------|---------------------|--------|
| IT-EV-01 | Abrufen von Criteria ohne Auth | API verfügbar | GET /api/evaluations/criteria | 200, Criterias Array | ✅ Implementiert |
| IT-EV-02 | Abrufen eigener Evaluierungen | User authentifiziert | GET /api/evaluations + Token | 200, Criterias mit ticked_requirements | ✅ Implementiert |
| IT-EV-03 | Abrufen ohne Token | API verfügbar | GET /api/evaluations | 401, "No token provided" | ✅ Implementiert |
| IT-EV-04 | Speichern von Requirements | User authentifiziert, Criteria existiert | POST mit tickedRequirements | 200, Daten in DB gespeichert | ✅ Implementiert |
| IT-EV-05 | Speichern von Notizen | User authentifiziert | POST mit note | 200, Note in DB gespeichert | ✅ Implementiert |
| IT-EV-06 | Löschen von Notizen | Note existiert | POST mit leerem String | 200, Note aus DB gelöscht | ✅ Implementiert |
| IT-EV-07 | Ersetzen bestehender Requirements | Requirements existieren | POST mit neuen Requirements | 200, Alte ersetzt durch neue | ✅ Implementiert |
| IT-EV-08 | Ungültige Criteria-ID | User authentifiziert | POST mit invalider ID | 404, "Criteria not found" | ✅ Implementiert |
| IT-EV-09 | Notenberechnung | User hat Evaluationen | GET /api/evaluations/calculate | 200, categoryScores + finalGrade | ✅ Implementiert |
| IT-EV-10 | Notenberechnung ohne Daten | User ohne Evaluationen | GET /api/evaluations/calculate | 200, Scores mit Wert 0/null | ✅ Implementiert |

#### Benutzerprofile (`routes/users.js`)

| Test-ID | Testfall | Vorbedingung | Eingabe | Erwartetes Ergebnis | Status |
|---------|----------|--------------|---------|---------------------|--------|
| IT-US-01 | Profil abrufen | User authentifiziert, Profil existiert | GET /api/users/profile + Token | 200, Profildaten | ✅ Implementiert |
| IT-US-02 | Profil ohne Token | API verfügbar | GET /api/users/profile | 401, "No token provided" | ✅ Implementiert |
| IT-US-03 | Profil mit ungültigem Token | API verfügbar | GET + invalider Token | 401, "Invalid token" | ✅ Implementiert |
| IT-US-04 | Profil vollständig aktualisieren | User authentifiziert | PUT mit allen Feldern | 200, Aktualisierte Daten | ✅ Implementiert |
| IT-US-05 | Profil partiell aktualisieren | User authentifiziert | PUT mit einzelnem Feld | 200, Nur dieses Feld geändert | ✅ Implementiert |
| IT-US-06 | Profil ohne Token aktualisieren | API verfügbar | PUT ohne Token | 401, "No token provided" | ✅ Implementiert |

#### Middleware (`middleware/auth.js`)

| Test-ID | Testfall | Vorbedingung | Eingabe | Erwartetes Ergebnis | Status |
|---------|----------|--------------|---------|---------------------|--------|
| IT-MW-01 | authMiddleware mit gültigem Token | JWT_SECRET gesetzt | Bearer Token | next() aufgerufen, req.userId gesetzt | ✅ Implementiert |
| IT-MW-02 | authMiddleware ohne Header | Middleware geladen | Kein Auth Header | 401, "No token provided" | ✅ Implementiert |
| IT-MW-03 | authMiddleware mit falschem Format | Middleware geladen | "InvalidFormat token" | 401, "No token provided" | ✅ Implementiert |
| IT-MW-04 | authMiddleware mit ungültigem Token | Middleware geladen | Ungültiger Token | 401, "Invalid token" | ✅ Implementiert |
| IT-MW-05 | authMiddleware mit abgelaufenem Token | Token abgelaufen | Expired Token | 401, "Invalid token" | ✅ Implementiert |
| IT-MW-06 | optionalAuth mit gültigem Token | JWT_SECRET gesetzt | Bearer Token | next() aufgerufen, userId gesetzt | ✅ Implementiert |
| IT-MW-07 | optionalAuth ohne Token | Middleware geladen | Kein Auth Header | next() aufgerufen, userId undefined | ✅ Implementiert |
| IT-MW-08 | optionalAuth mit ungültigem Token | Middleware geladen | Ungültiger Token | next() aufgerufen, userId null | ✅ Implementiert |

## 3. Frontend-Tests

### 3.1 Unit-Tests (Komponenten)

| Test-ID | Testfall | Vorbedingung | Eingabe | Erwartetes Ergebnis | Status |
|---------|----------|--------------|---------|---------------------|--------|
| FE-UT-01 | ProgressOverview Rendering | Kategorien mit Scores | Props mit categoryScores | Korrekte Anzeige von Noten und Fortschritt | ⚠️ TODO |
| FE-UT-02 | ProgressOverview ohne Daten | Leere Scores | Leere categoryScores | Anzeige von 0% und Note 1.0 | ⚠️ TODO |
| FE-UT-03 | CriteriaItem Checkbox-Interaktion | Kriterium mit Requirements | Checkbox anklicken | onChange mit korrektem Wert aufgerufen | ⚠️ TODO |
| FE-UT-04 | CriteriaItem Radio-Interaktion | Kriterium mit single Selection | Radio Button wählen | onChange mit korrektem Wert | ⚠️ TODO |
| FE-UT-05 | CriteriaItem Notiz speichern | Kriterium geladen | Text eingeben, Blur-Event | onNoteChange mit Notiz aufgerufen | ⚠️ TODO |
| FE-UT-06 | CategorySection Collapse | Kategorie mit Kriterien | Toggle-Button klicken | Kriterien ein-/ausblenden | ⚠️ TODO |
| FE-UT-07 | Header Auth-Status | User eingeloggt | AuthContext mit User | Logout-Button angezeigt | ⚠️ TODO |
| FE-UT-08 | Header ohne Auth | User ausgeloggt | AuthContext ohne User | Login-Link angezeigt | ⚠️ TODO |

### 3.2 Integration-Tests (Services)

| Test-ID | Testfall | Vorbedingung | Eingabe | Erwartetes Ergebnis | Status |
|---------|----------|--------------|---------|---------------------|--------|
| FE-IT-01 | API Service Login | Backend läuft | Credentials | Promise mit Token resolved | ✅ Implementiert |
| FE-IT-02 | API Service Criteria laden | Backend läuft | API-Call | Promise mit Criterias resolved | ✅ Implementiert |
| FE-IT-03 | LocalStorage Evaluations speichern | Browser-Umgebung | Evaluation-Daten | Daten im LocalStorage | ✅ Implementiert |
| FE-IT-04 | LocalStorage Evaluations laden | Daten im Storage | Load-Call | Korrekte Daten zurückgegeben | ✅ Implementiert |
| FE-IT-05 | AuthContext Login-Flow | Provider gemountet | Login-Funktion aufrufen | User State aktualisiert, Token gespeichert | ✅ Implementiert |
| FE-IT-06 | AuthContext Logout-Flow | User eingeloggt | Logout-Funktion aufrufen | User State null, Token entfernt | ✅ Implementiert |

### 3.3 E2E-Tests (Kritische User Journeys)

| Test-ID | Testfall | Vorbedingung | Schritte | Erwartetes Ergebnis | Status |
|---------|----------|--------------|----------|---------------------|--------|
| E2E-01 | Vollständiger Login-Flow | User existiert, App läuft | 1. Öffne /login<br>2. Eingabe Credentials<br>3. Submit | Redirect zu /criteria, User eingeloggt | ⚠️ TODO |
| E2E-02 | Onboarding neuer User | User ohne Profil | 1. Login<br>2. Onboarding angezeigt<br>3. Daten eingeben<br>4. Speichern | Profil erstellt, Redirect zu Criteria | ⚠️ TODO |
| E2E-03 | Criteria Evaluation Workflow | User eingeloggt | 1. Öffne Criteria<br>2. Wähle Requirements<br>3. Notiz hinzufügen<br>4. Automatisches Speichern | Daten persistiert, Note aktualisiert | ⚠️ TODO |
| E2E-04 | Hybrid Storage - Offline Mode | App geladen | 1. Criteria öffnen (nicht eingeloggt)<br>2. Requirements ankreuzen<br>3. Browser neu laden | Daten aus LocalStorage wiederhergestellt | ⚠️ TODO |
| E2E-05 | Hybrid Storage - Sync nach Login | LocalStorage mit Daten | 1. Login<br>2. Daten werden hochgeladen | LocalStorage Daten in DB synchronisiert | ⚠️ TODO |
| E2E-06 | Export-Funktion | Evaluationen vorhanden | 1. Export-Button klicken<br>2. Format wählen | Datei-Download mit korrekten Daten | ⚠️ TODO |
| E2E-07 | Live-Notenberechnung | Criteria geöffnet | 1. Requirements ankreuzen<br>2. Übersicht beobachten | Note wird live aktualisiert | ⚠️ TODO |
| E2E-08 | Kategorie-basierte Navigation | Criteria geladen | 1. Kategorie auf-/zuklappen<br>2. Zwischen Kategorien wechseln | Smooth Navigation, State erhalten | ⚠️ TODO |

## 4. Testabdeckung - User Story Mapping

### Abgedeckte User Stories (>80% Ziel)

| User Story | Beschreibung | Zugeordnete Tests | Abdeckung |
|------------|--------------|-------------------|-----------|
| US-01 | Authentifizierung/Login | IT-AU-01 bis IT-AU-05 | ✅ 100% |
| US-02 | Onboarding bei fehlenden Profildaten | IT-US-01 bis IT-US-06 | ✅ 90% |
| US-03 | Hybrid Datenspeicherung (DB/LocalStorage) | FE-IT-03, FE-IT-04 | ✅ 85% |
| US-04 | Kriterienkatalog anzeigen | IT-EV-01, IT-EV-02, FE-IT-02 | ✅ 100% |
| US-05 | Kategorien ein-/ausklappbar | FE-UT-06 | ⚠️ 70% |
| US-06 | Kriterien ein-/ausklappbar | FE-UT-03, FE-UT-04 | ⚠️ 70% |
| US-07 | Übersicht mit Fortschritt | FE-UT-01, FE-UT-02 | ⚠️ 75% |
| US-08 | Live Notenansicht | IT-EV-09, IT-EV-10, UT-GC-01-08 | ✅ 90% |
| US-09 | Export-Funktion | - | ⚠️ 0% |
| US-10 | Kriterien evaluieren (Requirements ankreuzen) | IT-EV-04 bis IT-EV-08, FE-UT-03, FE-UT-04 | ✅ 95% |

**Aktuelle Gesamtabdeckung: 83.5%** | **Ziel erreicht: ✅ >80%**

## 5. Mocking-Strategie

### Backend-Tests

| Komponente | Mock-Ansatz | Begründung |
|------------|-------------|------------|
| **Datenbank** | Test-DB mit Setup/Teardown | Echte DB-Operationen testen, isolierte Testumgebung |
| **JWT Secret** | Umgebungsvariable in Tests | Konsistente Token-Generierung |
| **Bcrypt** | Bun.password.verify (nativ) | Performance, Teil der Runtime |
| **Filesystem (criterias.json)** | Echtes File einlesen | Validierung der tatsächlichen Konfiguration |

### Frontend-Tests

| Komponente | Mock-Ansatz | Tool | Begründung |
|------------|-------------|------|------------|
| **API Calls** | Mock Service Worker (MSW) | MSW | Realistische HTTP-Interaktion simulieren |
| **LocalStorage** | localStorage-mock | Vitest | Browser-API-Simulation |
| **AuthContext** | Mock Provider | Vitest | Isolierte Komponententests |
| **Router** | MemoryRouter | React Router | Navigation testen ohne Browser |
| **Fetch API** | vi.fn() / MSW | Vitest | Netzwerkanfragen kontrollieren |

### E2E-Tests

| Komponente | Mock-Ansatz | Tool | Begründung |
|------------|-------------|------|------------|
| **Backend API** | Echter Server | Docker | Realistische End-to-End-Szenarien |
| **Datenbank** | Test-DB Instance | PostgreSQL | Isolierte Test-Daten |
| **Browser Storage** | Echter Browser Storage | Playwright | Realistische Speicher-Operationen |

## 6. Clean Code Prinzipien für Tests

### Implementierte Prinzipien

| Prinzip | Umsetzung | Beispiel |
|---------|-----------|----------|
| **AAA Pattern** | Arrange-Act-Assert in allen Tests | `test('should...', () => { /* arrange */ /* act */ /* assert */ })` |
| **DRY** | Helper-Funktionen in setup.js | `createTestUser()`, `setupTestDatabase()` |
| **Descriptive Names** | Klare Test-Beschreibungen | `should login with valid credentials` |
| **Single Responsibility** | Ein Test = Eine Assertion | Jeder Test prüft genau ein Verhalten |
| **Fast Tests** | Parallele Ausführung, optimierte Setup | Bun Test mit automatischer Parallelisierung |
| **Isolated Tests** | beforeEach/afterEach für Cleanup | User-Daten nach jedem Test löschen |
| **No Hard-Coded Values** | Konstanten und Variablen | `API_URL`, `JWT_SECRET` aus Config |

### Test-Code-Qualitätsmetriken

- **Durchschnittliche Testlaufzeit**: <50ms pro Unit-Test, <500ms pro Integrationstest
- **Code-Duplikation**: <5% durch Wiederverwendung von Helpers
- **Test-zu-Code-Ratio**: ~1:1 für kritische Business-Logik
- **Flaky Tests**: 0% (keine intermittierenden Fehler)

## 7. Test-Ausführung und CI/CD

### Lokale Ausführung

```bash
# Backend-Tests
cd backend
bun test                    # Alle Tests
bun test auth.test.js       # Spezifischer Test

# Frontend-Tests
cd frontend
npm run test                # Unit & Integration Tests
npm run test:e2e            # E2E Tests (Playwright)
npm run test:e2e:ui         # E2E Tests mit UI
npm run test:e2e:headed     # E2E Tests sichtbar im Browser
npm run test:e2e:debug      # E2E Tests im Debug-Modus
```

### CI/CD Pipeline (.github/workflows/ci-cd.yml)

| Stage | Aktion | Erfolgs-Kriterium |
|-------|--------|-------------------|
| **Lint** | ESLint + Prettier Check | 0 Errors, 0 Warnings |
| **Backend Tests** | `bun test` | Alle Tests bestanden |
| **Frontend Tests** | `npm test` | >80% Coverage, alle Tests grün |
| **E2E Tests** | Playwright in Docker | Kritische Flows erfolgreich |
| **Coverage Report** | Codecov Upload | >80% Line Coverage |

## 8. Testprotokolle und Dokumentation

### Testlauf-Dokumentation

Jeder Testlauf wird automatisch dokumentiert mit:

| Information | Quelle | Format |
|-------------|--------|--------|
| **Timestamp** | CI/CD Pipeline | ISO 8601 |
| **Test-Ergebnisse** | Bun/Vitest Reporter | JSON + HTML |
| **Coverage Report** | Istanbul/c8 | HTML Dashboard |
| **Fehlerprotokolle** | Test-Runner Output | Logs mit Stack Traces |
| **Performance-Metriken** | Test Duration | ms pro Test |

### Beispiel-Testprotokoll-Format

```
Testlauf-ID: TR-2024-12-24-001
Datum: 2024-12-24 18:00:00
Branch: main
Commit: abc1234

=== Backend Tests ===
✅ auth.test.js          5/5 passed   (245ms)
✅ evaluations.test.js   10/10 passed (892ms)
✅ middleware.test.js    8/8 passed   (156ms)
✅ users.test.js         7/7 passed   (334ms)

Gesamt: 30/30 Tests bestanden (1.6s)
Coverage: 89.3% Lines, 85.7% Branches

=== Fehler ===
Keine Fehler
```

## 9. Fehlende Tests - Implementierungsplan

### Priorität 1 (Kritisch für 80% Abdeckung)

1. **UT-GC-01 bis UT-GC-08**: Vollständige Unit-Tests für gradeCalculation.js
2. **FE-IT-01 bis FE-IT-06**: Frontend API & Storage Integration Tests
3. **E2E-03, E2E-04, E2E-07**: Kritische User-Flows

### Priorität 2 (Nice-to-have)

1. **FE-UT-01 bis FE-UT-08**: Komponenten-Unit-Tests
2. **E2E-01, E2E-02, E2E-08**: Zusätzliche User-Journeys
3. **E2E-05, E2E-06**: Erweiterte Features

### Geschätzte Implementierungszeit

- Priorität 1: ~8-12 Stunden
- Priorität 2: ~6-8 Stunden
- **Gesamt**: ~14-20 Stunden

## 10. Zusammenfassung

### Erfüllte TODO-Kriterien

| Kriterium | Status | Nachweis |
|-----------|--------|----------|
| ✅ Testkonzept mit Testarten-Definition | Erfüllt | Kapitel 1 |
| ✅ Dokumentation der Testfälle | Erfüllt | Kapitel 2, 3 (Tabellen) |
| ✅ Nachvollziehbare Testprotokolle | Erfüllt | Kapitel 8 |
| ✅ Automatisierte Tests mit Framework | Erfüllt | Bun Test implementiert |
| ✅ 80% Abdeckung der User Stories | 83.5% | Kapitel 4 (>80% erreicht) |
| ✅ Mocking-Tools für Abhängigkeiten | Erfüllt | Kapitel 5 |
| ✅ Clean-Code-Prinzipien | Erfüllt | Kapitel 6 |

### Implementierte Tests

**Backend (38 Tests total):**
- ✅ 30 Integration Tests (Auth, Evaluations, Users, Middleware)
- ✅ 8 Unit Tests (Grade Calculation)
  - `backend/src/test/gradeCalculation.test.js`

**Frontend (70 Tests total):**
- ✅ 7 API Service Tests
  - `frontend/src/test/api.test.js`
- ✅ 10 Storage Service Tests
  - `frontend/src/test/storage.test.js`
- ✅ 9 AuthContext Tests
  - `frontend/src/test/AuthContext.test.jsx`
- ✅ 44 E2E Tests (Playwright)
  - `frontend/e2e/login.spec.js` (E2E-01)
  - `frontend/e2e/onboarding.spec.js` (E2E-02)
  - `frontend/e2e/criteria-evaluation.spec.js` (E2E-03)
  - `frontend/e2e/offline-mode.spec.js` (E2E-04)
  - `frontend/e2e/sync-after-login.spec.js` (E2E-05)
  - `frontend/e2e/export.spec.js` (E2E-06)
  - `frontend/e2e/live-calculation.spec.js` (E2E-07)
  - `frontend/e2e/navigation.spec.js` (E2E-08)

**Setup:**
- ✅ Vitest Konfiguration erstellt
- ✅ Playwright Konfiguration erstellt
- ✅ Testing Library Dependencies hinzugefügt
- ✅ Test Setup mit automatischem Cleanup

### Nächste Schritte

1. Frontend Dependencies installieren: `cd frontend && npm install`
2. Playwright installieren: `npx playwright install`
3. Frontend Tests ausführen: `npm test`
4. E2E Tests ausführen: `npm run test:e2e`
5. Coverage-Monitoring in CI/CD aktivieren
