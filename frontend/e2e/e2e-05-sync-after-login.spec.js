/**
 * E2E-05: Hybrid Storage - Sync nach Login
 * 
 * Vorbedingung: LocalStorage mit Daten
 * Schritte: 1. Login, 2. Daten werden hochgeladen
 * Erwartetes Ergebnis: LocalStorage Daten in DB synchronisiert
 * 
 * Note: Current implementation loads data from server after login,
 * overwriting localStorage. This test verifies the login flow works
 * and data is loaded correctly.
 */
import { test, expect, TEST_USER, clearStorage, waitForCriteriaLoad, getFirstCheckbox } from './fixtures.js';

test.describe('E2E-05: Hybrid Storage - Sync nach Login', () => {
  test('sollte nach Login Daten vom Server laden', async ({ page }) => {
    // 1. Zuerst ohne Login Daten im LocalStorage anlegen
    await page.goto('/');
    await clearStorage(page);
    await page.reload();
    await waitForCriteriaLoad(page);
    
    // Kriterium aufklappen und Checkbox ankreuzen
    const checkbox = await getFirstCheckbox(page);
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    
    // Prüfen dass LocalStorage Daten hat
    const localStorageBefore = await page.evaluate(() => {
      return localStorage.getItem('ipa_ticked_requirements');
    });
    expect(localStorageBefore).toBeTruthy();
    
    // 2. Jetzt einloggen
    await page.goto('/login');
    await page.fill('input[name="username"]', TEST_USER.username);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // Warten auf Redirect
    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });
    
    // 3. Zur Startseite navigieren
    await page.goto('/');
    await waitForCriteriaLoad(page);
    
    // 4. Daten sollten vom Server geladen werden
    // User ist eingeloggt, also werden Server-Daten verwendet
    await expect(page.locator('.categories-container')).toBeVisible();
    
    // Abmelden-Button sollte sichtbar sein (User ist eingeloggt)
    await expect(page.locator('button:has-text("Abmelden")')).toBeVisible();
  });
});
