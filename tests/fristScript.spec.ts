import { test, expect } from '@playwright/test';

/**
 * Test Suite for Flutter Web Counter
 * Purpose: To verify that the UI correctly interacts with the underlying Flutter Canvas/Semantics.
 */
test('Counterincrement', async ({ page }) => {
    
    // 1. Navigate to the target Flutter Web application
    await page.goto('https://flutter-angular.web.app/#/');

    // 2. Wait for the network to be idle to ensure the Flutter engine has fully rendered the Canvas
    await page.waitForLoadState('networkidle');

    /** * Identify the counter text element. 
     * In Flutter Web, we look for a paragraph containing "Index:" as a stable anchor.
     */
    const counterLocator = page.locator('p').filter({ hasText: 'Index:' });

    // 3. Assertion: Verify the initial state is zero before any interaction
    await expect(counterLocator).toContainText('0');

    /**
     * 4. Perform the click action.
     * We use getByRole with the 'Increment' name, which corresponds to the aria-label in Flutter.
     * { force: true } is used because Flutter elements are sometimes technically 'covered' by a transparent canvas.
     */
    await page.getByRole('button', { name: 'Increment' }).click({ force: true });

    /**
     * 5. Assertion: Verify the counter incremented.
     * Playwright will automatically retry this assertion until it passes or times out (Auto-wait).
     */
    await expect(counterLocator).toContainText('1');
});
/////////////////////////////


test('Solve Flutter Canvas visibility', async ({ page }) => {
    await page.goto('https://flutter-angular.web.app/#/');
    await page.waitForLoadState('networkidle');

    // 1. الضغط على زر تفعيل الـ Semantics المخفي في فلاتر
    // فلاتر ويب غالباً بيضع زر شفاف في بداية الصفحة لتفعيلAccessibility
    await page.keyboard.press('Tab'); 
    await page.keyboard.press('Enter');

    // 2. انتظر قليلاً حتى يبني فلاتر شجرة العناصر (Semantics Tree)
    await page.waitForTimeout(2000);

    // 3. الآن جرب البحث عن النص
    const counter = page.getByText(/Index: \d+/);
    await expect(counter).toBeVisible({ timeout: 10000 });
});