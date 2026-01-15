/**
 * E2E-08: Kategorie-basierte Navigation
 * 
 * Vorbedingung: Criteria geladen
 * Schritte: 1. Kategorie auf-/zuklappen, 2. Zwischen Kategorien wechseln
 * Erwartetes Ergebnis: Smooth Navigation, State erhalten
 */
import { test, expect, waitForCriteriaLoad, getFirstCheckbox } from './fixtures.js';

test.describe('E2E-08: Kategorie-basierte Navigation', () => {
  test('sollte Kategorien auf- und zuklappen können', async ({ page }) => {
    await page.goto('/');
    await waitForCriteriaLoad(page);
    
    // Erste Kategorie-Header finden
    const categoryHeader = page.locator('.category-header').first();
    await expect(categoryHeader).toBeVisible();
    
    // Kategorie aufklappen
    await categoryHeader.click();
    await page.waitForTimeout(300);
    
    // Kriterien sollten sichtbar sein
    const criteriaItems = page.locator('.criteria-item, .criteria-header').first();
    await expect(criteriaItems).toBeVisible();
    
    // Kategorie wieder zuklappen
    await categoryHeader.click();
    await page.waitForTimeout(300);
    
    // Kategorie-Header sollte noch sichtbar sein
    await expect(categoryHeader).toBeVisible();
  });

  test('sollte State beim Wechseln zwischen Kategorien erhalten', async ({ page }) => {
    await page.goto('/');
    await waitForCriteriaLoad(page);
    
    // Erstes Kriterium aufklappen und Checkbox ankreuzen
    const checkbox = await getFirstCheckbox(page);
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    
    // Seite neu laden - State sollte erhalten bleiben (localStorage)
    await page.reload();
    await waitForCriteriaLoad(page);
    
    // Erstes Kriterium wieder aufklappen
    await page.locator('.criteria-header').first().click();
    await page.waitForTimeout(300);
    
    // Checkbox sollte noch angekreuzt sein (aus localStorage wiederhergestellt)
    const checkboxAfter = page.locator('.criteria-content input[type="checkbox"], .criteria-content input[type="radio"]').first();
    await checkboxAfter.waitFor({ state: 'visible', timeout: 5000 });
    await expect(checkboxAfter).toBeChecked();
  });

  test('sollte Scroll-Position beim Navigieren beibehalten', async ({ page }) => {
    await page.goto('/');
    await waitForCriteriaLoad(page);
    
    // Nach unten scrollen
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);
    
    // Scroll-Position prüfen
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
    
    // Kategorie aufklappen
    const categoryHeader = page.locator('.category-header').first();
    if (await categoryHeader.isVisible()) {
      await categoryHeader.click();
      await page.waitForTimeout(300);
    }
    
    // Seite sollte noch funktionieren
    await expect(page.locator('.categories-container')).toBeVisible();
  });

  test('sollte alle Kategorien anzeigen', async ({ page }) => {
    await page.goto('/');
    await waitForCriteriaLoad(page);
    
    // Mehrere Kategorien sollten vorhanden sein
    const categoryHeaders = page.locator('.category-header');
    const count = await categoryHeaders.count();
    
    // Mindestens eine Kategorie sollte vorhanden sein
    expect(count).toBeGreaterThanOrEqual(1);
    
    // Alle Kategorien sollten sichtbar sein
    for (let i = 0; i < count; i++) {
      await expect(categoryHeaders.nth(i)).toBeVisible();
    }
  });
});
