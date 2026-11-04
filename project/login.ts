import { expect } from '@playwright/test';
import type { LoginFn } from '../kit';

/**
 * How a user logs in to this project. Adapt to SSO / OTP / captcha setups:
 * - SSO: log in on the identity provider page here, end on the app home page.
 * - OTP: use a test account with a fixed OTP, or a test-only OTP endpoint (ask dev).
 * - Captcha: must be disabled in test environments. Do NOT try to automate it.
 */
export const login: LoginFn = async (page, { username, password }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible();
};
