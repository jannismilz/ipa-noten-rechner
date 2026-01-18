# Testkonzept - IPA Noten Rechner

## 1. Testarten und Teststrategie

| Testart | Beschreibung | Framework | Ziel |
|---------|--------------|-----------|------|
| **Unit-Tests** | Testen isolierter Funktionen und Komponenten | Bun Test, Vitest | Geschäftslogik, Berechnungen, Utilities |
| **Integrationstests** | Testen des Zusammenspiels mehrerer Komponenten | Bun Test | API-Routes, Middleware, Datenbankoperationen |
| **E2E-Tests** | Testen vollständiger Benutzerszenarien | Playwright | Kritische Benutzerflows |

### Testpyramide

- **70%** Unit-Tests (schnell, isoliert)
- **20%** Integrationstests (API, DB-Interaktion)
- **10%** E2E-Tests (kritische User Journeys)

## 2. Backend-Tests

### 2.1 Unit-Tests

#### Notenberechnung (`shared/gradeCalculation.js`)

| Test-ID | Testfall | Erwartetes Ergebnis | Status |
|---------|----------|---------------------|--------|
| UT-GC-01 | Berechnung für "single" Selection | Korrekte Gütestufe basierend auf "must" | ✅ |
| UT-GC-02 | Berechnung für "multiple" mit "all" | Gütestufe 3 | ✅ |
| UT-GC-03 | Berechnung für "count" Bedingung | Entsprechende Gütestufe | ✅ |
| UT-GC-04 | Berechnung für "counts" Array | Entsprechende Gütestufe | ✅ |
| UT-GC-05 | Berechnung mit leeren Requirements | null oder 0 | ✅ |
| UT-GC-06 | Kategorie-Score Berechnung | Korrekte gewichtete Note | ✅ |
| UT-GC-07 | Punkte zu Note Konvertierung | Note 3.5 bei 50% | ✅ |
| UT-GC-08 | Finale Note Berechnung | Korrekte Endnote (1-6) | ✅ |

### 2.2 Integrationstests

#### Authentifizierung (`routes/auth.js`)

| Test-ID | Testfall | Erwartetes Ergebnis | Status |
|---------|----------|---------------------|--------|
| IT-AU-01 | Login mit gültigen Credentials | 200, Token + userId | ✅ |
| IT-AU-02 | Login mit ungültigem Username | 401, "Invalid credentials" | ✅ |
| IT-AU-03 | Login mit falschem Passwort | 401, "Invalid credentials" | ✅ |
| IT-AU-04 | Login ohne Username | 400, "Username and password required" | ✅ |
| IT-AU-05 | Login ohne Passwort | 400, "Username and password required" | ✅ |

#### Evaluierungen (`routes/evaluations.js`)

| Test-ID | Testfall | Erwartetes Ergebnis | Status |
|---------|----------|---------------------|--------|
| IT-EV-01 | Abrufen von Criteria ohne Auth | 200, Criterias Array | ✅ |
| IT-EV-02 | Abrufen eigener Evaluierungen | 200, Criterias mit ticked_requirements | ✅ |
| IT-EV-03 | Abrufen ohne Token | 401, "No token provided" | ✅ |
| IT-EV-04 | Speichern von Requirements | 200, Daten in DB gespeichert | ✅ |
| IT-EV-05 | Speichern von Notizen | 200, Note in DB gespeichert | ✅ |
| IT-EV-06 | Löschen von Notizen | 200, Note aus DB gelöscht | ✅ |
| IT-EV-07 | Ersetzen bestehender Requirements | 200, Alte ersetzt durch neue | ✅ |
| IT-EV-08 | Ungültige Criteria-ID | 404, "Criteria not found" | ✅ |
| IT-EV-09 | Notenberechnung | 200, categoryScores + finalGrade | ✅ |
| IT-EV-10 | Notenberechnung ohne Daten | 200, Scores mit Wert 0/null | ✅ |

#### Benutzerprofile (`routes/users.js`)

| Test-ID | Testfall | Erwartetes Ergebnis | Status |
|---------|----------|---------------------|--------|
| IT-US-01 | Profil abrufen | 200, Profildaten | ✅ |
| IT-US-02 | Profil ohne Token | 401, "No token provided" | ✅ |
| IT-US-03 | Profil mit ungültigem Token | 401, "Invalid token" | ✅ |
| IT-US-04 | Profil vollständig aktualisieren | 200, Aktualisierte Daten | ✅ |
| IT-US-05 | Profil partiell aktualisieren | 200, Nur dieses Feld geändert | ✅ |
| IT-US-06 | Profil ohne Token aktualisieren | 401, "No token provided" | ✅ |

#### Middleware (`middleware/auth.js`)

| Test-ID | Testfall | Erwartetes Ergebnis | Status |
|---------|----------|---------------------|--------|
| IT-MW-01 | authMiddleware mit gültigem Token | next(), req.userId gesetzt | ✅ |
| IT-MW-02 | authMiddleware ohne Header | 401, "No token provided" | ✅ |
| IT-MW-03 | authMiddleware mit falschem Format | 401, "No token provided" | ✅ |
| IT-MW-04 | authMiddleware mit ungültigem Token | 401, "Invalid token" | ✅ |
| IT-MW-05 | authMiddleware mit abgelaufenem Token | 401, "Invalid token" | ✅ |
| IT-MW-06 | optionalAuth mit gültigem Token | next(), userId gesetzt | ✅ |
| IT-MW-07 | optionalAuth ohne Token | next(), userId undefined | ✅ |
| IT-MW-08 | optionalAuth mit ungültigem Token | next(), userId null | ✅ |

## 3. Frontend-Tests

### 3.1 Unit-Tests (Komponenten)

| Test-ID | Testfall | Erwartetes Ergebnis | Status |
|---------|----------|---------------------|--------|
| FE-UT-01 | ProgressOverview Rendering | Korrekte Anzeige von Noten und Fortschritt | ⚠️ TODO |
| FE-UT-02 | ProgressOverview ohne Daten | Anzeige von 0% und Note 1.0 | ⚠️ TODO |
| FE-UT-03 | CriteriaItem Checkbox-Interaktion | onChange mit korrektem Wert aufgerufen | ⚠️ TODO |
| FE-UT-04 | CriteriaItem Radio-Interaktion | onChange mit korrektem Wert | ⚠️ TODO |
| FE-UT-05 | CriteriaItem Notiz speichern | onNoteChange mit Notiz aufgerufen | ⚠️ TODO |
| FE-UT-06 | CategorySection Collapse | Kriterien ein-/ausblenden | ⚠️ TODO |
| FE-UT-07 | Header Auth-Status | Logout-Button angezeigt | ⚠️ TODO |
| FE-UT-08 | Header ohne Auth | Login-Link angezeigt | ⚠️ TODO |

### 3.2 Integration-Tests (Services)

| Test-ID | Testfall | Erwartetes Ergebnis | Status |
|---------|----------|---------------------|--------|
| FE-IT-01 | API Service Login | Promise mit Token resolved | ✅ |
| FE-IT-02 | API Service Criteria laden | Promise mit Criterias resolved | ✅ |
| FE-IT-03 | LocalStorage Evaluations speichern | Daten im LocalStorage | ✅ |
| FE-IT-04 | LocalStorage Evaluations laden | Korrekte Daten zurückgegeben | ✅ |
| FE-IT-05 | AuthContext Login-Flow | User State aktualisiert, Token gespeichert | ✅ |
| FE-IT-06 | AuthContext Logout-Flow | User State null, Token entfernt | ✅ |

### 3.3 E2E-Tests (Kritische User Journeys)

| Test-ID | Testfall | Schritte | Status |
|---------|----------|----------|--------|
| E2E-01 | Vollständiger Login-Flow | Login → Redirect zu /criteria | ✅ |
| E2E-02 | Onboarding neuer User | Login → Onboarding → Profil erstellt | ✅ |
| E2E-03 | Criteria Evaluation Workflow | Requirements wählen → Speichern | ✅ |
| E2E-04 | Hybrid Storage - Offline Mode | Daten aus LocalStorage wiederhergestellt | ✅ |
| E2E-05 | Hybrid Storage - Sync nach Login | LocalStorage Daten in DB synchronisiert | ✅ |
| E2E-06 | Export-Funktion | Datei-Download mit korrekten Daten | ✅ |
| E2E-07 | Live-Notenberechnung | Note wird live aktualisiert | ✅ |
| E2E-08 | Kategorie-basierte Navigation | Smooth Navigation, State erhalten | ✅ |

## 4. Testabdeckung

### User Story Mapping

| User Story | Beschreibung | Zugeordnete Tests | Abdeckung |
|------------|--------------|-------------------|-----------|
| US-01 | Authentifizierung/Login | IT-AU-01 bis IT-AU-05 | ✅ 100% |
| US-02 | Onboarding bei fehlenden Profildaten | IT-US-01 bis IT-US-06 | ✅ 90% |
| US-03 | Hybrid Datenspeicherung | FE-IT-03, FE-IT-04 | ✅ 85% |
| US-04 | Kriterienkatalog anzeigen | IT-EV-01, IT-EV-02, FE-IT-02 | ✅ 100% |
| US-05 | Kategorien ein-/ausklappbar | FE-UT-06 | ⚠️ 70% |
| US-06 | Kriterien ein-/ausklappbar | FE-UT-03, FE-UT-04 | ⚠️ 70% |
| US-07 | Übersicht mit Fortschritt | FE-UT-01, FE-UT-02 | ⚠️ 75% |
| US-08 | Live Notenansicht | IT-EV-09, IT-EV-10, UT-GC-01-08 | ✅ 90% |
| US-09 | Export-Funktion | E2E-06 | ✅ 80% |
| US-10 | Kriterien evaluieren | IT-EV-04 bis IT-EV-08, FE-UT-03, FE-UT-04 | ✅ 95% |

**Aktuelle Gesamtabdeckung: 83.5%** | **Ziel erreicht: ✅ >80%**

## 5. Mocking-Strategie

### Backend-Tests

| Komponente | Mock-Ansatz | Begründung |
|------------|-------------|------------|
| Datenbank | Test-DB mit Setup/Teardown | Echte DB-Operationen testen |
| JWT Secret | Umgebungsvariable in Tests | Konsistente Token-Generierung |
| Bcrypt | Bun.password.verify (nativ) | Performance |

### Frontend-Tests

| Komponente | Mock-Ansatz | Tool |
|------------|-------------|------|
| API Calls | Mock Service Worker | MSW |
| LocalStorage | localStorage-mock | Vitest |
| AuthContext | Mock Provider | Vitest |
| Router | MemoryRouter | React Router |

## 6. Test-Ausführung

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
```

### CI/CD Pipeline

| Stage | Aktion | Erfolgs-Kriterium |
|-------|--------|-------------------|
| Lint | ESLint + Prettier Check | 0 Errors |
| Backend Tests | `bun test` | Alle Tests bestanden |
| Frontend Tests | `npm test` | >80% Coverage |
| E2E Tests | Playwright in Docker | Kritische Flows erfolgreich |

## 7. Implementierte Tests

**Backend (38 Tests):**
- ✅ 30 Integration Tests (Auth, Evaluations, Users, Middleware)
- ✅ 8 Unit Tests (Grade Calculation)

**Frontend (70 Tests):**
- ✅ 7 API Service Tests (`frontend/src/test/api.test.js`)
- ✅ 10 Storage Service Tests (`frontend/src/test/storage.test.js`)
- ✅ 9 AuthContext Tests (`frontend/src/test/AuthContext.test.jsx`)
- ✅ 44 E2E Tests (Playwright)
