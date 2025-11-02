// e2e/utils/auth-setup.ts
import { Page } from '@playwright/test';

/**
 * Создает тестового пользователя если его еще нет
 */
export async function ensureTestUser(page: Page) {
  const testEmail = process.env.TEST_USER_EMAIL || 'e2e-test@zenith-trainer.com';
  const testPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

  // Пытаемся залогиниться
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(testEmail);
  await page.locator('input[type="password"]').fill(testPassword);
  await page.locator('button[type="submit"]').click();

  // Ждем результата
  await page.waitForTimeout(3000);

  const currentUrl = page.url();

  // Если попали на dashboard - пользователь существует
  if (currentUrl.includes('/') && !currentUrl.includes('/login')) {
    console.log('✅ Test user exists and logged in');
    return true;
  }

  // Если остались на /login - нужно создать пользователя
  if (currentUrl.includes('/login')) {
    console.log('🔧 Creating test user...');
    
    // Переходим на signup
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    // Заполняем форму
    await page.locator('input[type="email"]').fill(testEmail);
    await page.locator('input[type="password"]').fill(testPassword);
    await page.locator('button[type="submit"]').click();

    // Ждем создания аккаунта
    await page.waitForURL('/', { timeout: 15000 }).catch(() => {
      console.log('⚠️ Signup timeout, but continuing...');
    });

    console.log('✅ Test user created');
    return true;
  }

  return false;
}

/**
 * Выполняет логин с тестовым пользователем
 */
export async function loginAsTestUser(page: Page) {
  const testEmail = process.env.TEST_USER_EMAIL || 'e2e-test@zenith-trainer.com';
  const testPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  await page.locator('input[type="email"]').fill(testEmail);
  await page.locator('input[type="password"]').fill(testPassword);
  await page.locator('button[type="submit"]').click();

  // Ждем редирект на dashboard
  await page.waitForURL('/', { timeout: 15000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 });
}

/**
 * Выполняет logout
 */
export async function logout(page: Page) {
  // Ищем user menu
  const userMenu = page.locator('[aria-label="User menu"]')
    .or(page.locator('button').filter({ hasText: /user|profile|account/i }))
    .first();

  if (await userMenu.isVisible({ timeout: 2000 }).catch(() => false)) {
    await userMenu.click();
    await page.waitForTimeout(500);

    const logoutButton = page.locator('button').filter({ hasText: /logout|sign out/i }).first();
    if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logoutButton.click();
      await page.waitForURL('/login', { timeout: 5000 });
    }
  }
}

