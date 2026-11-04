import { ANONYMOUS_ROLE, createTest, getCredentials } from '../kit';
import { TasksApi } from './api';
import { LoginPage } from './pages/LoginPage';
import { TasksPage } from './pages/TasksPage';
import project from './project.config';

/**
 * The ONLY import tests should use:  import { test, expect } from '../../project/fixtures';
 * Add a fixture here for every new Page Object or data client.
 */
export const test = createTest(project).extend<{
  /** API client logged in as the same role as the page. */
  api: TasksApi;
  /** Privileged API client for setup/cleanup, independent of the test role. */
  adminApi: TasksApi;
  tasksPage: TasksPage;
  loginPage: LoginPage;
}>({
  api: async ({ playwright, env, role }, use) => {
    const request = await playwright.request.newContext({ baseURL: env.apiURL });
    const api = new TasksApi(request);
    if (role !== ANONYMOUS_ROLE) await api.login(getCredentials(project, role));
    await use(api);
    await request.dispose();
  },

  adminApi: async ({ playwright, env }, use) => {
    const request = await playwright.request.newContext({ baseURL: env.apiURL });
    const api = new TasksApi(request);
    await api.login(getCredentials(project, 'admin'));
    await use(api);
    await request.dispose();
  },

  tasksPage: async ({ page }, use) => {
    await use(new TasksPage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { expect } from '@playwright/test';
export { Tag } from '../kit';
export { project };
