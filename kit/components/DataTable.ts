import { expect, type Locator } from '@playwright/test';

/**
 * Generic helper for accessible tables (role=table / grid with columnheader + cell).
 * Columns are addressed by header text so tests survive column re-ordering.
 */
export class DataTable {
  constructor(readonly root: Locator) {}

  rows(): Locator {
    // skip the header row
    return this.root.getByRole('row').filter({ has: this.root.page().getByRole('cell') });
  }

  row(text: string | RegExp): Locator {
    return this.rows().filter({ hasText: text });
  }

  async columnIndex(header: string): Promise<number> {
    const headers = (await this.root.getByRole('columnheader').allInnerTexts()).map((h) => h.trim());
    const index = headers.indexOf(header);
    if (index < 0) throw new Error(`[qc-kit] Column "${header}" not found. Columns: ${headers.join(' | ')}`);
    return index;
  }

  async cell(rowText: string | RegExp, header: string): Promise<Locator> {
    return this.row(rowText).getByRole('cell').nth(await this.columnIndex(header));
  }

  async expectCell(rowText: string | RegExp, header: string, value: string | RegExp): Promise<void> {
    await expect(await this.cell(rowText, header)).toHaveText(value);
  }
}
