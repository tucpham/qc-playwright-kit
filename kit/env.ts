import path from 'node:path';
import type { Credentials, ProjectConfig, ResolvedEnv } from './project';

/** Folder holding saved login sessions per role. Git-ignored. */
export const AUTH_DIR = path.resolve(process.cwd(), '.auth');

export function authFile(role: string): string {
  return path.join(AUTH_DIR, `${role}.json`);
}

/** Load .env if present (Node 20.12+). Real CI should inject variables as secrets instead. */
export function loadDotEnv(): void {
  try {
    process.loadEnvFile();
  } catch {
    // no .env file: fine, variables may come from the CI environment
  }
}

/** Pick the environment from TEST_ENV (or the project default). BASE_URL / API_URL can override. */
export function resolveEnv(project: ProjectConfig): ResolvedEnv {
  const name = process.env.TEST_ENV ?? project.defaultEnv;
  const env = project.environments[name];
  if (!env) {
    throw new Error(
      `[qc-kit] Unknown TEST_ENV "${name}". Known: ${Object.keys(project.environments).join(', ')}`,
    );
  }
  if (env.isProduction && process.env.ALLOW_PROD !== '1') {
    throw new Error(
      `[qc-kit] "${name}" is marked as production. Regression suites must not create data in production. ` +
        'Set ALLOW_PROD=1 only for an approved read-only smoke run.',
    );
  }
  const baseURL = process.env.BASE_URL ?? env.baseURL;
  return {
    ...env,
    name,
    baseURL,
    apiURL: process.env.API_URL ?? env.apiURL ?? baseURL,
  };
}

export function getCredentials(project: ProjectConfig, role: string): Credentials {
  const roleConfig = project.roles[role];
  if (!roleConfig) {
    throw new Error(`[qc-kit] Unknown role "${role}". Known: ${Object.keys(project.roles).join(', ')}`);
  }
  const username = process.env[roleConfig.usernameEnv];
  const password = process.env[roleConfig.passwordEnv];
  if (!username || !password) {
    throw new Error(
      `[qc-kit] Missing credentials for role "${role}". ` +
        `Set ${roleConfig.usernameEnv} and ${roleConfig.passwordEnv} in .env or CI secrets.`,
    );
  }
  return { username, password };
}
