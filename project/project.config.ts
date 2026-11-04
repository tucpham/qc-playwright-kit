import { defineProject } from '../kit';
import { login } from './login';

/**
 * PROJECT ADAPTER - the main file each project fills in.
 * This example points at the bundled demo app. Replace with your project's values.
 */
export default defineProject({
  name: 'demo-tasks',

  environments: {
    local: { baseURL: 'http://localhost:4173' },
    dev: { baseURL: 'https://dev.example.internal' },
    staging: { baseURL: 'https://staging.example.internal', apiURL: 'https://staging-api.example.internal' },
    production: { baseURL: 'https://app.example.com', isProduction: true },
  },
  defaultEnv: 'local',

  // Credentials come from env variables (.env locally, secrets in CI). Never commit them.
  roles: {
    admin: { usernameEnv: 'ADMIN_USER', passwordEnv: 'ADMIN_PASS', description: 'Can delete tasks' },
    user: { usernameEnv: 'USER_USER', passwordEnv: 'USER_PASS', description: 'Regular member' },
  },
  defaultRole: 'user',

  login,

  // Demo only: start the bundled app automatically. Real projects usually remove this
  // and test against a deployed environment.
  webServer: {
    command: 'node demo-app/server.mjs',
    url: 'http://localhost:4173/health',
  },
});
