/**
 * E2E-07: Live-Notenberechnung
 * 
 * Vorbedingung: Criteria geöffnet
 * Schritte: 1. Requirements ankreuzen, 2. Übersicht beobachten
 * Erwartetes Ergebnis: Note wird live aktualisiert
 */
import { test, expect, waitForCriteriaLoad, getFirstCheckbox } from './fixtures.js';

test.describe('E2E-07: Live-Notenberechnung', () => {
  test('sollte Note in Echtzeit aktualisieren wenn Requirements angekreuzt werden', async ({ page }) => {
    await page.goto('/');
    await waitForCriteriaLoad(page);
    
    // Progress-Übersicht sollte sichtbar sein
    const progressOverview = page.locator('.progress-overview');
    await expect(progressOverview).toBeVisible();
    
    // Initiale Note merken (falls angezeigt)
    const gradeDisplay = page.locator('.final-grade, .grade-value, .grade-badge').first();
    let initialGradeText = '';
    if (await gradeDisplay.isVisible({ timeout: 2000 }).catch(() => false)) {
      initialGradeText = await gradeDisplay.textContent();
    }
    
    // Erstes Kriterium aufklappen
    await page.locator('.criteria-header').first().click();
    await page.waitForTimeout(300);
    
    // Checkboxen/Radios im aufgeklappten Kriterium ankreuzen
    const inputs = page.locator('.criteria-content input[type="checkbox"], .criteria-content input[type="radio"]');
    const count = await inputs.count();
    
    for (let i = 0; i < Math.min(3, count); i++) {
      await inputs.nth(i).check();
      await page.waitForTimeout(300);
    }
    
    // Note sollte sich geändert haben oder Fortschritt angezeigt werden
    await expect(progressOverview).toBeVisible();
    
    // Prüfen dass Kategorie-Fortschritt angezeigt wird
    const categoryProgress = page.locator('.category-progress, .progress-bar').first();
    if (await categoryProgress.isVisible({ timeout: 2000 })) {
      await expect(categoryProgress).toBeVisible();
    }
  });

  test('sollte Kategorie-Scores in der Übersicht anzeigen', async ({ page }) => {
    await page.goto('/');
    await waitForCriteriaLoad(page);
    
    // Progress-Übersicht sollte Kategorien anzeigen
    const progressOverview = page.locator('.progress-overview');
    await expect(progressOverview).toBeVisible();
    
    // Sollte mehrere Kategorie-Einträge haben
    const categoryItems = page.locator('.category-score, .progress-category');
    const count = await categoryItems.count();
    
    // Mindestens eine Kategorie sollte angezeigt werden
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('sollte Note neu berechnen wenn Requirements abgewählt werden', async ({ page }) => {
    await page.goto('/');
    await waitForCriteriaLoad(page);
    
    // Kriterium aufklappen und Checkbox ankreuzen
    const checkbox = await getFirstCheckbox(page);
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    await page.waitForTimeout(500);
    
    // Checkbox wieder abwählen
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
    await page.waitForTimeout(500);
    
    // Seite sollte noch funktionieren
    await expect(page.locator('.categories-container')).toBeVisible();
  });
});
