import { expect, test } from '../../project/fixtures';

// Source: specs/tasks.md

test.describe('Task management', { tag: '@regression' }, () => {
  test(
    '[TC-TASK-001] User can add a task',
    { tag: ['@smoke', '@critical'] },
    async ({ tasksPage, uniqueName, cleanup, adminApi }) => {
      const title = uniqueName('Task');
      cleanup.add(`delete ${title}`, () => adminApi.deleteTaskByTitle(title));

      await tasksPage.open();
      await tasksPage.addTask(title);

      await expect(tasksPage.item(title)).toBeVisible();
      await expect(tasksPage.doneCheckbox(title)).not.toBeChecked();
      await tasksPage.toast.expectMessage(`Task "${title}" added`);
      await expect(tasksPage.newTaskInput).toHaveValue('');
    },
  );

  test('[TC-TASK-002] Empty title is rejected', async ({ tasksPage }) => {
    await tasksPage.open();
    await tasksPage.addTask('   ');

    await expect(tasksPage.validationError).toHaveText('Task title is required');
    await expect(tasksPage.toast.root).toBeEmpty();
  });

  test('[TC-TASK-003] User can mark a task as done', async ({ tasksPage, api, adminApi, uniqueName, cleanup }) => {
    const title = uniqueName('Task');
    cleanup.add(`delete ${title}`, () => adminApi.deleteTaskByTitle(title));
    const task = await api.createTask(title);

    await tasksPage.open();
    await tasksPage.doneCheckbox(title).check();

    await expect(tasksPage.doneCheckbox(title)).toBeChecked();
    // Verify the change is saved, not only shown in the UI
    await expect.poll(async () => (await api.getTask(task.id))?.done).toBe(true);
  });

  test.describe('as admin', () => {
    test.use({ role: 'admin' });

    test('[TC-TASK-004] Admin can delete a task', { tag: '@critical' }, async ({ tasksPage, api, uniqueName, cleanup }) => {
      const title = uniqueName('Task');
      cleanup.add(`delete ${title}`, () => api.deleteTaskByTitle(title));
      const task = await api.createTask(title);

      await tasksPage.open();
      await tasksPage.deleteButton(title).click();

      await expect(tasksPage.item(title)).toHaveCount(0);
      await tasksPage.toast.expectMessage('Task deleted');
      await expect.poll(() => api.getTask(task.id)).toBeNull();
    });
  });

  test('[TC-TASK-005] Regular user cannot delete a task', async ({ tasksPage, api, adminApi, uniqueName, cleanup }) => {
    const title = uniqueName('Task');
    cleanup.add(`delete ${title}`, () => adminApi.deleteTaskByTitle(title));
    await api.createTask(title);

    await tasksPage.open();

    await expect(tasksPage.item(title)).toBeVisible();
    await expect(tasksPage.deleteButton(title)).toHaveCount(0);
  });
});
