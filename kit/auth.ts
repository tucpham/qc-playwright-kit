import fs from 'node:fs';
import type { TestType } from '@playwright/test';
import { AUTH_DIR, authFile, getCredentials, resolveEnv } from './env';
import type { ProjectConfig } from './project';

/**
 * Registers one setup test per role: log in through the UI once, save the session,
 * and let every other test reuse it. Limit roles with AUTH_ROLES=admin,user if needed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function defineAuthSetup(setup: TestType<any, any>, project: ProjectConfig): void {
  const only = process.env.AUTH_ROLES?.split(',').map((r) => r.trim()).filter(Boolean);
  const roles = Object.keys(project.roles).filter((role) => !only || only.includes(role));

  for (const role of roles) {
    setup(`authenticate as ${role}`, async ({ browser }) => {
      const env = resolveEnv(project);
      const credentials = getCredentials(project, role);
      fs.mkdirSync(AUTH_DIR, { recursive: true });

      const context = await browser.newContext({ baseURL: env.baseURL });
      const page = await context.newPage();
      await project.login(page, credentials, env);
      await context.storageState({ path: authFile(role) });
      await context.close();
    });
  }
}
