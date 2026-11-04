import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Base for all Page Objects.
 * Rules (see docs/02-conventions.md):
 * - Page Objects expose locators and user actions, not assertions about business results.
 *   Business assertions live in the test so reviewers can see them.
 * - Every page declares `ready`: one element that proves the page is loaded.
 */
export abstract class BasePage {
  protected abstract readonly path: string;
  abstract readonly ready: Locator;

  constructor(readonly page: Page) {}

  async open(): Promise<this> {
    await this.page.goto(this.path);
    await this.expectOpened();
    return this;
  }

  async expectOpened(): Promise<void> {
    await expect(this.ready).toBeVisible();
  }
}
