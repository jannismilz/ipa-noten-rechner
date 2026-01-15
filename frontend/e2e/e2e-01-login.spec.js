/**
 * E2E-01: Vollständiger Login-Flow
 * 
 * Vorbedingung: User existiert, App läuft
 * Schritte: 1. Öffne /login, 2. Eingabe Credentials, 3. Submit
 * Erwartetes Ergebnis: Redirect zu /criteria, User eingeloggt
 */
import { test, expect, TEST_USER } from './fixtures.js';

test.describe('E2E-01: Vollständiger Login-Flow', () => {
  test('sollte mit gültigen Credentials einloggen und zur Startseite weiterleiten', async ({ page }) => {
    // 1. Öffne /login
    await page.goto('/login');
    await expect(page.locator('.login-card h1')).toContainText('IPA Noten Rechner');
    
    // 2. Eingabe Credentials
    await page.fill('input[name="username"]', TEST_USER.username);
    await page.fill('input[name="password"]', TEST_USER.password);
    
    // 3. Submit
    await page.click('button[type="submit"]');
    
    // Warten auf Netzwerk-Antwort
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Erwartetes Ergebnis: Redirect (entweder zu / oder /onboarding)
    // Falls Login fehlschlägt, prüfen ob Fehlermeldung angezeigt wird
    const errorVisible = await page.locator('.error-message').isVisible().catch(() => false);
    if (errorVisible) {
      const errorText = await page.locator('.error-message').textContent();
      throw new Error(`Login failed: ${errorText}`);
    }
    
    await expect(page).not.toHaveURL(/.*login/);
    
    // Verify user is logged in (logout button visible in header)
    await expect(page.locator('button:has-text("Abmelden")')).toBeVisible();
  });

  test('sollte Fehlermeldung bei ungültigen Credentials anzeigen', async ({ page }) => {
    await page.goto('/login');
    
    // Ungültige Credentials eingeben
    await page.fill('input[name="username"]', 'invaliduser');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Sollte auf Login-Seite bleiben und Fehler anzeigen
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/.*login/);
  });

  test('sollte ohne Anmeldung fortfahren können', async ({ page }) => {
    await page.goto('/login');
    
    // "Ohne Anmeldung fortfahren" klicken
    await page.click('button:has-text("Ohne Anmeldung fortfahren")');
    
    // Sollte zur Startseite weiterleiten
    await page.waitForURL('/', { timeout: 5000 });
    
    // Criteria sollten geladen werden
    await expect(page.locator('.categories-container')).toBeVisible({ timeout: 10000 });
  });
});
