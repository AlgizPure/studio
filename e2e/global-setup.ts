// e2e/global-setup.ts
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E tests setup...');
  console.log('🔥 Firebase Environment:', process.env.PLAYWRIGHT_TEST === '1' ? 'TEST' : 'UNKNOWN');
  console.log('🔥 Firebase Project:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const testEmail = process.env.TEST_USER_EMAIL || 'e2e-test@zenith-trainer.com';
  const testPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

  console.log(`👤 Test user: ${testEmail}`);

  try {
    // Пытаемся создать тестового пользователя если его нет
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:9002';
    
    console.log('🔐 Attempting to login with test user...');
    await page.goto(`${baseURL}/login`);
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="email"]').fill(testEmail);
    await page.locator('input[type="password"]').fill(testPassword);
    await page.locator('button[type="submit"]').click();

    await page.waitForTimeout(3000);

    const currentUrl = page.url();

    if (currentUrl.includes('/login')) {
      console.log('🔧 Test user does not exist, creating...');
      
      await page.goto(`${baseURL}/signup`);
      await page.waitForLoadState('networkidle');

      await page.locator('input[type="email"]').fill(testEmail);
      await page.locator('input[type="password"]').fill(testPassword);
      await page.locator('button[type="submit"]').click();

      await page.waitForTimeout(5000);
      console.log('✅ Test user created successfully');
    } else {
      console.log('✅ Test user already exists');
    }
  } catch (error) {
    console.error('⚠️ Setup error (continuing anyway):', error);
  } finally {
    await browser.close();
  }

  console.log('✅ E2E tests setup complete');
}

export default globalSetup;

