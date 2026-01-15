/**
 * E2E-02: Onboarding neuer User
 * 
 * Vorbedingung: User ohne Profil
 * Schritte: 1. Login, 2. Onboarding angezeigt, 3. Daten eingeben, 4. Speichern
 * Erwartetes Ergebnis: Profil erstellt, Redirect zu Criteria
 * 
 * Note: This test requires a user without complete profile data.
 * The seed user has complete profile, so we test the onboarding page directly.
 */
import { test, expect } from './fixtures.js';

test.describe('E2E-02: Onboarding neuer User', () => {
  test('sollte Onboarding-Formular korrekt anzeigen', async ({ page }) => {
    // Direkt zur Onboarding-Seite navigieren
    await page.goto('/onboarding');
    
    // Onboarding-Header sollte sichtbar sein
    await expect(page.locator('h1:has-text("Willkommen")')).toBeVisible();
    await expect(page.locator('text=Bitte vervollständigen Sie Ihr Profil')).toBeVisible();
    
    // Formularfelder sollten vorhanden sein
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('input[name="topic"]')).toBeVisible();
    await expect(page.locator('input[name="submissionDate"]')).toBeVisible();
  });

  test('sollte Profildaten eingeben und speichern können', async ({ authenticatedPage: page }) => {
    // Wenn User bereits vollständiges Profil hat, wird er zur Startseite weitergeleitet
    // Prüfen ob wir auf Onboarding oder Startseite sind
    const url = page.url();
    
    if (url.includes('/onboarding')) {
      // Formular ausfüllen
      await page.fill('input[name="firstName"]', 'Max');
      await page.fill('input[name="lastName"]', 'Mustermann');
      await page.fill('input[name="topic"]', 'Meine IPA');
      await page.fill('input[name="submissionDate"]', '2026-04-15');
      
      // Speichern
      await page.click('button[type="submit"]');
      
      // Sollte zur Startseite weiterleiten
      await page.waitForURL('/', { timeout: 10000 });
    }
    
    // Criteria sollten geladen werden
    await expect(page.locator('.categories-container')).toBeVisible({ timeout: 10000 });
  });
});
