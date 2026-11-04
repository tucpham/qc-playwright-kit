import { expect, test } from '../project/fixtures';

/**
 * Seed test for AI agents (Playwright planner/generator/healer and ai/prompts/*).
 * Agents run this first to get a logged-in browser in the right environment,
 * then explore or record from here. Keep it minimal and always green.
 */
test('[SEED] logged-in home page', { tag: '@smoke' }, async ({ tasksPage }) => {
  await tasksPage.open();
  await expect(tasksPage.ready).toBeVisible();
});
