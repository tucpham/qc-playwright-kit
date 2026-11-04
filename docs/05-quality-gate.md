# 05 - Plugging the regression suite into the quality gate

The kit provides "sensors" so the gate can measure automatically. Default thresholds live in `scripts/metrics.mjs` and can be changed via environment variables.

## Gates by phase

| Phase | When | Automatic criteria | Command |
|---|---|---|---|
| Test code gate | Every PR that changes tests | Typecheck, lint, traceability, guard, new tests stabilize 5/5 | `npm run verify`, `guard`, `stabilize:changed` |
| PR gate | Every project PR | `@smoke` 100% pass, no `@critical` failures, flaky <= 5%, <= 10 minutes | `metrics -- --gate pr` |
| Nightly | Every night | Pass >= 95%, no `@critical` failures, flaky <= 3% | `metrics -- --gate nightly` |
| Release gate | Before release | `@regression` 100% pass, no `@critical` failures, flaky <= 2%, approved TC coverage meets target | `metrics -- --gate release`, `trace:check -- --strict` |

Change thresholds for a project: `MIN_PASS_RATE`, `MAX_FLAKY_RATE`, `MAX_DURATION_MIN` in CI variables.

## Suggested non-automatic criteria (add to the gate checklist)

- New features must have `approved` test cases before development is done (shift-left)
- New features have at least their P1 TCs automated before release
- New elements have a label/role or `data-testid` (fewer testability gaps)
- Bug fixes add a regression test that reproduces the bug

## Metrics for a shared dashboard

Each run produces:
- `metrics/latest.json`, `metrics/history/*.json`: total, pass/flaky/fail, pass rate, flaky rate, duration, failed tests, flaky tests, critical failures
- `metrics/traceability.json`: number of TCs, approved, draft, automated, coverage
- `test-results/junit.xml`: for GitLab / Jenkins / test management tools

Collect these files from each project's CI artifacts to build a cross-project dashboard (Grafana, Looker Studio, Google Sheets...).

## Adoption level by project risk

| Level | Project | Mandatory gates |
|---|---|---|
| Light | Internal, few users | Test code gate + PR gate (smoke) |
| Standard | Most projects | Light + nightly |
| Strict | Affects money, customer data, legal | Standard + release gate + P1 TC coverage = 100% |
