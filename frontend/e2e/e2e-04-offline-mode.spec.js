/**
 * E2E-04: Hybrid Storage - Offline Mode
 * 
 * Vorbedingung: App geladen
 * Schritte: 1. Criteria öffnen (nicht eingeloggt), 2. Requirements ankreuzen, 3. Browser neu laden
 * Erwartetes Ergebnis: Daten aus LocalStorage wiederhergestellt
 */
import { test, expect, clearStorage, waitForCriteriaLoad, getFirstCheckbox } from './fixtures.js';

test.describe('E2E-04: Hybrid Storage - Offline Mode', () => {
  test('sollte Daten im LocalStorage speichern wenn nicht eingeloggt', async ({ page }) => {
    // 1. Zur Startseite navigieren (nicht eingeloggt)
    await page.goto('/');
    await clearStorage(page);
    await page.reload();
    await waitForCriteriaLoad(page);
    
    // 2. Kriterium aufklappen und Requirement ankreuzen
    // Categories are open by default, but criteria items are closed
    const checkbox = await getFirstCheckbox(page);
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    
    // 4. Prüfen ob Daten im LocalStorage sind
    const localStorageData = await page.evaluate(() => {
      return localStorage.getItem('ipa_ticked_requirements');
    });
    expect(localStorageData).toBeTruthy();
    
    // 5. Seite neu laden
    await page.reload();
    await waitForCriteriaLoad(page);
    
    // 6. Kriterium wieder aufklappen
    await page.locator('.criteria-header').first().click();
    await page.waitForTimeout(300);
    
    // 7. Checkbox sollte noch angekreuzt sein (aus LocalStorage wiederhergestellt)
    const checkboxAfterReload = page.locator('.criteria-content input[type="checkbox"], .criteria-content input[type="radio"]').first();
    await expect(checkboxAfterReload).toBeChecked();
  });

  test('sollte ohne Netzwerk funktionieren nach initialem Laden', async ({ page, context }) => {
    // 1. Seite laden
    await page.goto('/');
    await clearStorage(page);
    await page.reload();
    await waitForCriteriaLoad(page);
    
    // 2. Kriterium aufklappen und Checkbox ankreuzen (vor offline gehen)
    const checkbox = await getFirstCheckbox(page);
    
    // 3. Offline gehen
    await context.setOffline(true);
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    
    // 4. Wieder online gehen
    await context.setOffline(false);
    
    // 5. Seite neu laden
    await page.reload();
    await waitForCriteriaLoad(page);
    
    // 6. Daten sollten noch da sein - Kriterium wieder aufklappen
    await page.locator('.criteria-header').first().click();
    await page.waitForTimeout(300);
    const checkboxAfterReload = page.locator('.criteria-content input[type="checkbox"], .criteria-content input[type="radio"]').first();
    await expect(checkboxAfterReload).toBeChecked();
  });
});
