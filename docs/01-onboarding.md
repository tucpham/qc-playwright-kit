# 01 - Onboarding a project onto the kit

Goal: within 1-2 days, the project has a smoke suite running in CI. Then expand gradually with approved test cases.

## Step 0 - Check prerequisites (testability)

Without these, the suite will be flaky. Fix them first; do not try to write tests around them.

| Prerequisite | Required | If missing |
|---|---|---|
| Stable test environment (dev/staging), not production | Yes | Ask dev/DevOps to set one up |
| Dedicated test accounts for each role | Yes | Request them; never use personal accounts |
| Automatable login (no captcha; OTP can be bypassed in the test environment) | Yes | Dev disables captcha / provides a fixed OTP for test accounts |
| Create / delete test data via API or seed script | Strongly recommended | Add to the dev backlog; create via UI in the meantime |
| Key elements have clear labels/roles or a `data-testid` | Strongly recommended | List them in `app-map.md > Known testability gaps` |
| Existing test cases (Excel/Jira/doc) | Recommended | Use `/qc-plan` to let AI explore and draft them |

## Step 1 - Install the kit into the repo

Early phase (no internal package yet): copy these folders into the project repo (usually under `e2e/`):

```
kit/  scripts/  eslint.config.mjs  tsconfig.json  playwright.config.ts
AGENTS.md  CLAUDE.md  ai/  .claude/  .mcp.json  .env.example  .gitignore
.github/workflows/qc-regression.yml   (or ci/gitlab-ci.yml)
```

Copy as templates and then edit: `project/`, `specs/_TEMPLATE.md`, `tests/auth.setup.ts`, `tests/seed.spec.ts`.
Do not copy `demo-app/`; remove `webServer` from `project.config.ts` if testing against a deployed environment.

Once the kit is an internal package (see docs/06): `npm i -D @company/qc-playwright-kit` and change the `'../kit'` imports to `'@company/qc-playwright-kit'`.

```bash
npm i -D @playwright/test typescript @types/node eslint typescript-eslint eslint-plugin-playwright
npx playwright install chromium
```

## Step 2 - Fill in the project adapter (~1-2 hours)

1. `project/project.config.ts`: project name, environments (mark prod with `isProduction: true`), roles and the env variable names holding their accounts.
2. `project/login.ts`: login steps, ending with an `expect` that proves you are inside the app.
3. `.env` (local) and CI secrets: accounts for each role.
4. `project/api.ts`: data create/cleanup client (API login to get a token, create/delete functions the tests need).
5. `project/pages/`: 1-2 Page Objects for the main screens, registered in `project/fixtures.ts`.
6. `tests/seed.spec.ts`: open the main screen after login.
7. `project/app-map.md`: list screens, URLs, roles, main flows.

Check: if `npx playwright test tests/seed.spec.ts` is green, the adapter is correct.

## Step 3 - Prepare test cases

- Have Excel/CSV: `npm run tc:import -- testcases.csv orders --feature ORD`, then `/qc-import` to let AI clean it up.
- Have nothing: `/qc-plan "Order management" <requirement link>` to let AI explore and draft.
- QC/BA review `specs/<feature>.md`: fix expected results, resolve `[NEEDS CONFIRMATION]` items, set `Status: approved` for finalized cases.

> Expected results must come from requirements, not from "what the app currently does". This is where AI most often goes wrong.

## Step 4 - Generate tests

```
/qc-generate specs/orders.md TC-ORD-001,TC-ORD-002
```

Start with 3-5 P1 cases to validate the adapter and Page Objects, then generate in bulk.

## Step 5 - Stabilization gate (automatic in the prompt + CI)

```bash
npm run stabilize -- tests/regression/orders.spec.ts   # 5/5 green, no retries
npm run verify                                          # typecheck + lint + traceability
```

## Step 6 - Review

Reviewers use [04-review-checklist.md](04-review-checklist.md). You can run `/qc-review` to let AI pre-review.
Focus: do the assertions check the business behavior in the spec?

## Step 7 - Add to CI

- Copy the workflow, declare secrets (`ADMIN_USER`...) and the `TEST_ENV` variable.
- PR: verify + guard + stabilize new tests + smoke.
- Nightly: full regression. Before release: run manually with the `release` gate.
- Create a `qc-approved` label (only QC leads may apply it) to approve changes blocked by guard.

## Step 8 - Maintenance

- Failing test: `/qc-heal <test>`. AI may only fix locators/timing/data (A/B/C). If behavior differs from the spec (D), report a bug; do not change the test.
- Upgrade Playwright: `npm i -D @playwright/test@latest && npm run agents:init`, then re-check `.mcp.json`.
- Upgrade the kit: follow the kit changelog (docs/06).

## Time estimate (medium project, standard web app)

| Task | Time |
|---|---|
| Steps 0-2: install kit + adapter + green seed | 0.5-1 day |
| Import/draft + approve test cases for 1 feature | 0.5-1 day (depends on BA) |
| Generate + stabilize + review 10 cases | 0.5 day |
| Wire up CI | 1-2 hours |
