import { test, expect } from '@playwright/test';

/**
 * Smoke tests to verify basic app functionality
 * These tests don't require authentication and just verify the app loads
 */

test.describe('Smoke Tests', () => {
  test('app should load home page', async ({ page }) => {
    await page.goto('/');

    // Should redirect to login or show landing page
    await expect(page).toHaveURL(/\/(login|$)/);

    // Page should have a title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('login page should be accessible', async ({ page }) => {
    await page.goto('/login');

    // Should have login form elements
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
  });

  test('sign up page should be accessible', async ({ page }) => {
    await page.goto('/signup');

    // Should have sign up form
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible({ timeout: 5000 });
  });

  test('app should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Check for viewport meta tag (responsive)
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });
});
