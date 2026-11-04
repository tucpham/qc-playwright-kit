import type { Page } from '@playwright/test';

/**
 * Contract between the shared kit (owned by QC) and each project (owned by the project team).
 * A project only fills this in via `project/project.config.ts`. Nothing in `kit/` should
 * contain project-specific knowledge.
 */

export interface EnvironmentConfig {
  /** UI base URL, e.g. https://staging.my-app.company.vn */
  baseURL: string;
  /** API base URL used for test data setup/cleanup. Defaults to baseURL. */
  apiURL?: string;
  /** Mark production-like environments. The kit refuses to run there unless ALLOW_PROD=1. */
  isProduction?: boolean;
}

export interface RoleConfig {
  /** Name of the env variable holding the username (never hard-code credentials). */
  usernameEnv: string;
  /** Name of the env variable holding the password. */
  passwordEnv: string;
  description?: string;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface ResolvedEnv extends EnvironmentConfig {
  name: string;
  apiURL: string;
}

/** How the project logs in through the UI. Must end on a page that proves login succeeded. */
export type LoginFn = (page: Page, credentials: Credentials, env: ResolvedEnv) => Promise<void>;

export interface ProjectConfig {
  /** Short project code, used in reports and metrics. */
  name: string;
  environments: Record<string, EnvironmentConfig>;
  defaultEnv: string;
  roles: Record<string, RoleConfig>;
  /** Role used when a test does not set one. Use the reserved role "anonymous" for logged-out tests. */
  defaultRole: string;
  login: LoginFn;
  /** Attribute used by page.getByTestId(). Default: data-testid */
  testIdAttribute?: string;
  /** Optional: start the app locally before tests (dev/demo only). */
  webServer?: {
    command: string;
    url: string;
    timeout?: number;
  };
  timeouts?: {
    test?: number;
    expect?: number;
    action?: number;
    navigation?: number;
  };
}

/** Reserved role: no stored session. */
export const ANONYMOUS_ROLE = 'anonymous';

/** Identity helper so project configs get type-checking and autocomplete. */
export function defineProject<T extends ProjectConfig>(config: T): T {
  return config;
}
