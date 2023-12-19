import { test, expect } from '@playwright/test';

test.beforeEach( async({page}) => {
  await page.goto('https://angular.realworld.how/')
})
test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});
