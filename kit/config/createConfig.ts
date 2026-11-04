import { defineConfig, devices, type PlaywrightTestConfig, type ReporterDescription } from '@playwright/test';
import { loadDotEnv, resolveEnv } from '../env';
import type { ProjectConfig } from '../project';

/**
 * Standard Playwright config for every project.
 * Projects call `createConfig(project)` and should rarely need `overrides`.
 * If many projects need the same override, change it here (in the kit) instead.
 */
export function createConfig(project: ProjectConfig, overrides: PlaywrightTestConfig = {}) {
  loadDotEnv();
  const env = resolveEnv(project);
  const isCI = !!process.env.CI;

  const reporter: ReporterDescription[] = [
    [isCI ? 'line' : 'list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ];

  // BROWSER_CHANNEL=chrome lets machines without downloaded Playwright browsers use installed Chrome.
  const channel = process.env.BROWSER_CHANNEL || undefined;

  return defineConfig({
    testDir: './tests',
    outputDir: 'test-results/artifacts',
    fullyParallel: true,
    forbidOnly: isCI,
    // 1 retry in CI so flaky tests show up as "flaky" in the report instead of hiding.
    // Stabilization runs always use --retries=0.
    retries: isCI ? 1 : 0,
    workers: isCI ? 2 : undefined,
    timeout: project.timeouts?.test ?? 30_000,
    expect: { timeout: project.timeouts?.expect ?? 5_000 },
    reporter,
    metadata: { project: project.name, env: env.name, baseURL: env.baseURL },
    use: {
      baseURL: env.baseURL,
      testIdAttribute: project.testIdAttribute ?? 'data-testid',
      actionTimeout: project.timeouts?.action ?? 10_000,
      navigationTimeout: project.timeouts?.navigation ?? 15_000,
      trace: 'retain-on-failure',
      screenshot: 'only-on-failure',
      // PW_VIDEO=off on machines without ffmpeg (video needs `npx playwright install`)
      video: process.env.PW_VIDEO === 'off' ? 'off' : 'retain-on-failure',
    },
    projects: [
      {
        name: 'setup',
        testMatch: /.*\.setup\.ts/,
        use: { channel },
      },
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'], channel },
        dependencies: ['setup'],
        testIgnore: /.*\.setup\.ts/,
      },
    ],
    webServer: project.webServer
      ? {
          command: project.webServer.command,
          url: project.webServer.url,
          reuseExistingServer: !isCI,
          timeout: project.webServer.timeout ?? 60_000,
        }
      : undefined,
    ...overrides,
  });
}
