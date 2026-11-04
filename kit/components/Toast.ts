import { expect, type Locator, type Page } from '@playwright/test';

/** Status / notification messages. Default target: role="status". Override for custom libraries. */
export class Toast {
  readonly root: Locator;

  constructor(page: Page, root?: Locator) {
    this.root = root ?? page.getByRole('status');
  }

  async expectMessage(text: string | RegExp): Promise<void> {
    await expect(this.root).toContainText(text);
  }
}
