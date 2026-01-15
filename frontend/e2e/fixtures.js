/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect } from '@playwright/test';

/**
 * Test user credentials (must exist in database via `bun run seed`)
 */
export const TEST_USER = {
  username: 'test',
  password: 'test',
};

/**
 * Extended test fixture with authentication helpers
 */
export const test = base.extend({
  /**
   * Authenticated page - logs in before test
   */
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', TEST_USER.username);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // If still on login page, login failed
    if (page.url().includes('/login')) {
      throw new Error('Login failed - still on login page');
    }
    
    await use(page);
  },

  /**
   * Clean page - clears localStorage before test
   */
  cleanPage: async ({ page }, use) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await use(page);
  },
});

export { expect };

/**
 * Helper to login programmatically
 */
export async function login(page, username = TEST_USER.username, password = TEST_USER.password) {
  await page.goto('/login');
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });
}

/**
 * Helper to clear localStorage
 */
export async function clearStorage(page) {
  await page.evaluate(() => localStorage.clear());
}

/**
 * Helper to wait for criteria page to load
 */
export async function waitForCriteriaLoad(page) {
  await page.waitForSelector('.categories-container', { timeout: 15000 });
}

/**
 * Helper to expand first criteria and get first checkbox/radio
 * Categories are open by default, but criteria items are closed
 */
export async function expandFirstCriteriaAndGetInput(page) {
  await waitForCriteriaLoad(page);
  
  // Click first criteria header to expand it
  const criteriaHeader = page.locator('.criteria-header').first();
  await criteriaHeader.click();
  await page.waitForTimeout(300);
  
  // Get first input (checkbox or radio)
  const input = page.locator('.criteria-content input[type="checkbox"], .criteria-content input[type="radio"]').first();
  await input.waitFor({ state: 'visible', timeout: 5000 });
  return input;
}

/**
 * Helper to get first checkbox in criteria (legacy - use expandFirstCriteriaAndGetInput)
 */
export async function getFirstCheckbox(page) {
  return expandFirstCriteriaAndGetInput(page);
}
