import type { Locator } from '@playwright/test';
import { BasePage, Toast } from '../../kit';

export class TasksPage extends BasePage {
  protected readonly path = '/';
  readonly ready = this.page.getByRole('heading', { name: 'Tasks' });

  readonly newTaskInput = this.page.getByLabel('New task');
  readonly addButton = this.page.getByRole('button', { name: 'Add' });
  readonly validationError = this.page.getByRole('alert');
  readonly list = this.page.getByRole('list', { name: 'Task list' });
  readonly toast = new Toast(this.page);

  item(title: string): Locator {
    return this.list.getByRole('listitem').filter({ hasText: title });
  }

  doneCheckbox(title: string): Locator {
    return this.item(title).getByRole('checkbox');
  }

  deleteButton(title: string): Locator {
    return this.item(title).getByRole('button', { name: 'Delete' });
  }

  async addTask(title: string): Promise<void> {
    await this.newTaskInput.fill(title);
    await this.addButton.click();
  }
}
