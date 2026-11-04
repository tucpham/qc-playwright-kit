import { test as base, type TestInfo } from '@playwright/test';
import { authFile, resolveEnv } from './env';
import { ANONYMOUS_ROLE, type ProjectConfig, type ResolvedEnv } from './project';

/**
 * Collects cleanup steps during a test and runs them afterwards (last in, first out),
 * even when the test fails. Register cleanup BEFORE creating data, so a failure
 * halfway through still leaves the environment clean.
 */
export class Cleanup {
  private readonly steps: { name: string; fn: () => Promise<unknown> }[] = [];

  add(name: string, fn: () => Promise<unknown>): void {
    this.steps.push({ name, fn });
  }

  async run(testInfo: TestInfo): Promise<void> {
    for (const step of this.steps.reverse()) {
      try {
        await step.fn();
      } catch (error) {
        // Cleanup problems must be visible, but should not hide the real test result.
        testInfo.annotations.push({
          type: 'cleanup-failed',
          description: `${step.name}: ${(error as Error).message}`,
        });
      }
    }
  }
}

export type KitOptions = {
  /** Which stored session the page starts with. Set per describe block: test.use({ role: 'admin' }). */
  role: string;
};

export type KitFixtures = {
  env: ResolvedEnv;
  cleanup: Cleanup;
  /** Unique, readable test data names so parallel tests never collide. */
  uniqueName: (prefix: string) => string;
};

/** Build the base `test` for a project. Projects extend it further in project/fixtures.ts. */
export function createTest(project: ProjectConfig) {
  return base.extend<KitOptions & KitFixtures>({
    role: [project.defaultRole, { option: true }],

    storageState: async ({ role }, use) => {
      await use(role === ANONYMOUS_ROLE ? { cookies: [], origins: [] } : authFile(role));
    },

    env: async ({}, use) => {
      await use(resolveEnv(project));
    },

    cleanup: async ({}, use, testInfo) => {
      const cleanup = new Cleanup();
      await use(cleanup);
      await cleanup.run(testInfo);
    },

    uniqueName: async ({}, use, testInfo) => {
      let counter = 0;
      const run = Date.now().toString(36);
      await use((prefix) => `${prefix} ${run}-w${testInfo.workerIndex}-${counter++}`);
    },
  });
}
