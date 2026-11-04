# 02 - Test writing conventions

Most conventions are checked automatically (lint, traceability, guard). The rest are in the review checklist.

## Naming and traceability

| Item | Convention | Checked by |
|---|---|---|
| Test case ID | `TC-<FEATURE>-<3 digits>`, never changed, never reused | trace:check |
| Test name | `[TC-ORD-001] <same as the title in the spec>` | trace:check |
| 1 TC = 1 test | Do not merge several TCs into one test | trace:check |
| Test file | `tests/regression/<feature>.spec.ts`, first line `// Source: specs/<feature>.md` | review |
| Tags | Only `@smoke @regression @critical @slow`; a test must have the tags its spec requires | lint + trace:check |
| Only `approved` TCs have tests | | trace:check |

## Locators (priority order)

1. `getByRole('button', { name: 'Save' })`
2. `getByLabel('Email')`
3. `getByPlaceholder(...)`, `getByText(...)`
4. `getByTestId('order-total')` (attribute configured in `project.config.ts > testIdAttribute`)

Forbidden: XPath, long CSS chains, `:nth-child`, locators based on generated class names. (lint)
No stable locator -> ask dev to add a `data-testid`, and record it in `app-map.md`.

Locators and actions live in Page Objects (`project/pages/`). Tests only call Page Objects and assert.

## Assertions

- Every **Expected** line in the spec must have at least one `expect`.
- If a message/text is in the spec, compare it **exactly** (`toHaveText`); do not use `toContainText` for convenience.
- Use web-first assertions: `await expect(locator).toHaveText(...)`. Never `expect(await locator.textContent())`. (lint)
- Spec says "saved" / "check backend" -> verify through the API: `await expect.poll(() => api.getX(id)).toMatchObject(...)`.
- Do not only check that "the page loads". Smoke tests must also check a business outcome.

## Waiting

- No `waitForTimeout`, `waitForSelector`, `networkidle`. (lint)
- No `{ force: true }`. (lint)
- Do not increase timeouts inside tests. If needed, change it in the project config and explain why. (guard)

## Test data

- Create preconditions via the API (fixtures `api` / `adminApi`), not through the UI.
- Data names: `uniqueName('Order')` so parallel runs never collide.
- Register cleanup **before creating**: `cleanup.add('delete X', () => adminApi.deleteX(...))`.
- Independent tests: no dependency on other tests, run order, or the total number of records in shared lists.
- Do not use pre-existing data in the environment (others may change it), except agreed-upon fixed master data.

## Roles

- Default is `defaultRole`. Change with `test.use({ role: 'admin' })` inside a `describe`.
- `role: 'anonymous'` for logged-out tests.
- Login happens only once per role in `auth.setup.ts`; other tests reuse the session.

## Skip / fixme

- Never add `test.skip/fixme/only/fail` on your own. (guard + lint)
- When the app has a known bug: the QC lead decides whether to use `test.fail()` with a bug link, or keep the test red. Apply the `qc-approved` label to the PR.
