# 06 - Governance

## Roles

| Task | QC team (kit owner) | Project | Project dev |
|---|---|---|---|
| Maintain `kit/`, `scripts/`, lint, CI templates, AGENTS.md, prompts | Responsible | Proposes | |
| Project adapter, Page Objects, API client | Supports | Responsible | Supports test APIs |
| Test cases + approving expected results | Supports | Project QC/BA responsible | |
| Generate + review tests | Reviews samples in the early phase | Responsible | |
| Testability (labels, data-testid, seed APIs, captcha off in test env) | Raises requests | Tracks | Responsible |
| Approve PRs blocked by guard (`qc-approved`) | QC lead | | |

## Kit versioning

- Semantic versioning: `MAJOR.MINOR.PATCH` (`KIT_VERSION` in `kit/index.ts`)
  - PATCH: bug fixes, no API change
  - MINOR: new helpers / rules (new lint rules ship at `warn` level for one version first)
  - MAJOR: fixture/config API changes; projects must update their code
- Every version has a changelog: what changed, what projects need to do.
- Early phase: released as a template repo + git tags. Once >= 3 projects use it: package `kit/` + `scripts/` + the eslint config as the internal package `@company/qc-playwright-kit` (internal npm registry / GitLab package registry); the template repo then only contains the adapter.
- Upgrading Playwright: QC tests it on a pilot project first, then bumps it in the kit, together with `npm run agents:init`.

## Pilot plan

1. Pick one project: existing test cases, clear flows, a stable test environment.
2. Duration: 2-3 weeks.
3. Measure before / after:

| Metric | How to measure | Reference target |
|---|---|---|
| Onboarding time (until seed + smoke run in CI) | Person-days | <= 2 days |
| TCs automated per person-day | Count merged tests | >= 10 |
| Share of AI-generated tests merged after review (not rewritten) | Merged tests / generated tests | >= 70% |
| Flaky rate | Nightly metrics | <= 2% |
| Smoke run time | PR metrics | <= 10 minutes |
| Regression bugs caught before release | Count from CI | Track |
| Maintenance time per week | Heal person-hours | Decreasing |

4. End of pilot: update the kit based on issues found, then roll out to the next 2-3 projects.

## Safety rules

- Never run data-creating suites on production (the kit blocks it when `isProduction: true`).
- Credentials only live in local `.env` and CI secrets.
- Test environments must not contain real customer data when AI agents explore them (agents can read page content).
- Only use AI tools the company has approved for internal source code.
