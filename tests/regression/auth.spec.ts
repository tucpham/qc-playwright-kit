import { expect, test } from '../../project/fixtures';

// Source: specs/auth.md

test.describe('Authentication', { tag: '@regression' }, () => {
  test.use({ role: 'anonymous' });

  test('[TC-AUTH-001] Wrong password shows an error', { tag: '@smoke' }, async ({ loginPage, page }) => {
    await loginPage.open();
    await loginPage.signIn('user', 'wrong-password');

    await expect(loginPage.error).toHaveText('Invalid username or password');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('[TC-AUTH-002] Logged-out user is redirected to login', async ({ page, loginPage }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/login$/);
    await loginPage.expectOpened();
  });
});
