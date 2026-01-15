/**
 * E2E-03: Criteria Evaluation Workflow
 * 
 * Vorbedingung: User eingeloggt
 * Schritte: 1. Öffne Criteria, 2. Wähle Requirements, 3. Notiz hinzufügen, 4. Automatisches Speichern
 * Erwartetes Ergebnis: Daten persistiert, Note aktualisiert
 */
import { test, expect, waitForCriteriaLoad, getFirstCheckbox } from './fixtures.js';

test.describe('E2E-03: Criteria Evaluation Workflow', () => {
  test('sollte Requirements auswählen und automatisch speichern', async ({ authenticatedPage: page }) => {
    // 1. Criteria-Seite laden
    await page.goto('/');
    await waitForCriteriaLoad(page);
    
    // 2. Erstes Kriterium aufklappen (Kategorien sind standardmässig offen)
    const checkbox = await getFirstCheckbox(page);
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    
    // 3. Warten auf Auto-Save (kurze Pause)
    await page.waitForTimeout(1000);
    
    // 4. Seite neu laden um Persistenz zu prüfen
    await page.reload();
    await waitForCriteriaLoad(page);
    
    // 5. Kriterium wieder aufklappen
    await page.locator('.criteria-header').first().click();
    await page.waitForTimeout(300);
    
    // Checkbox sollte noch angekreuzt sein
    const checkboxAfterReload = page.locator('.criteria-content input[type="checkbox"], .criteria-content input[type="radio"]').first();
    await expect(checkboxAfterReload).toBeChecked();
  });

  test('sollte Notizen hinzufügen und speichern', async ({ authenticatedPage: page }) => {
    await page.goto('/');
    await waitForCriteriaLoad(page);
    
    // Kriterium aufklappen um Notizfeld zu sehen (Kategorien sind standardmässig offen)
    const criteriaHeader = page.locator('.criteria-header').first();
    await criteriaHeader.click();
    await page.waitForTimeout(300);
    
    // Notizfeld finden und Text eingeben
    const noteField = page.locator('.criteria-content textarea').first();
    await noteField.waitFor({ state: 'visible', timeout: 5000 });
    await noteField.fill('Test-Notiz für E2E-Test');
    await noteField.blur();
    
    // Warten auf Auto-Save
    await page.waitForTimeout(1000);
    
    // Seite neu laden
    await page.reload();
    await waitForCriteriaLoad(page);
    
    // Kriterium wieder aufklappen
    await page.locator('.criteria-header').first().click();
    await page.waitForTimeout(300);
    
    // Notiz sollte noch vorhanden sein
    const noteAfterReload = page.locator('.criteria-content textarea').first();
    await expect(noteAfterReload).toHaveValue('Test-Notiz für E2E-Test');
  });
});
