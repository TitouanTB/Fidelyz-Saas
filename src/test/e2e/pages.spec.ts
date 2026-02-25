import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should load dashboard page structure', async ({ page }) => {
    await page.goto('/dashboard');
    
    // The dashboard should redirect to login if not authenticated
    // Check that we get some kind of response
    const url = page.url();
    expect(url).toMatch(/login|dashboard/);
  });

  test('should have correct meta title', async ({ page }) => {
    await page.goto('/login');
    const title = await page.title();
    expect(title).toBeTruthy();
  });
});

test.describe('Public Pages', () => {
  test('should handle public page slugs', async ({ page }) => {
    await page.goto('/p/test-slug');
    
    // Just verify the page loads without crashing
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should handle auth error page', async ({ page }) => {
    await page.goto('/auth-error');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle forgot password page', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByRole('heading', { name: /reset/i })).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading structure on login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check that h1 exists
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });

  test('should have labels for form inputs on login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check that form inputs have associated labels
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();
    
    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toBeVisible();
  });

  test('should have submit button on login page', async ({ page }) => {
    await page.goto('/login');
    
    const submitButton = page.getByRole('button', { type: 'submit' });
    await expect(submitButton).toBeVisible();
  });
});
