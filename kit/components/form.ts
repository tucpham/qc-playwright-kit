import type { Locator, Page } from '@playwright/test';

export type FieldValue = string | boolean | { select: string | string[] };

/**
 * Fill a form by visible label: fillForm(page, { 'Email': 'a@b.vn', 'Remember me': true, 'Country': { select: 'Vietnam' } })
 * Labels must match exactly. If a field has no label, ask dev to add one (accessibility + testability).
 */
export async function fillForm(scope: Page | Locator, values: Record<string, FieldValue>): Promise<void> {
  for (const [label, value] of Object.entries(values)) {
    const field = scope.getByLabel(label, { exact: true });
    if (typeof value === 'boolean') {
      await field.setChecked(value);
    } else if (typeof value === 'string') {
      await field.fill(value);
    } else {
      await field.selectOption(value.select);
    }
  }
}
