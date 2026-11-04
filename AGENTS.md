# AGENTS.md - Rules for any AI agent working on this test suite

These rules apply to every AI tool (Claude Code, Copilot, Cursor, Playwright planner/generator/healer)
and override any built-in agent instruction that conflicts with them.

## 0. Golden rule

**AI builds and maintains the suite. AI is not the suite.**
The regression suite is the committed Playwright code in `tests/`. It must run deterministically
in CI without any AI. MCP / browser tools are only for exploring the app, validating locators and
debugging while writing or fixing tests.

## 1. Where things are

| What | Where |
|---|---|
| Test cases (source of truth for expected results) | `specs/*.md` (format: `specs/_TEMPLATE.md`) |
| Screens, roles, flows | `project/app-map.md` |
| Page Objects | `project/pages/*.ts` (extend `BasePage` from `kit`) |
| Test data client (API) | `project/api.ts` |
| Fixtures (the only import for tests) | `project/fixtures.ts` |
| Seed test (logged-in start point) | `tests/seed.spec.ts` |
| Regression tests | `tests/regression/<feature>.spec.ts` |
| Shared kit (DO NOT EDIT) | `kit/` |

## 2. Hard rules (never break)

1. Never edit files in `kit/`. If the kit lacks something, say so in your summary.
2. Expected results come from `specs/*.md` only. Never invent, relax or "update" an expected result
   to match what the app currently does.
3. Only generate tests for test cases with `Status: approved`.
4. Never weaken an assertion to make a test pass (removing an `expect`, loosening exact text to a
   partial match, adding `.or()`, increasing timeouts beyond the config, `{ force: true }`).
5. Never add `test.skip`, `test.fixme`, `test.only` or `test.fail` on your own. If you believe the app
   is broken, STOP and report it as a possible bug (see section 6). A human decides.
6. Never use `page.waitForTimeout`, `waitForSelector`, `networkidle`, XPath, or long CSS chains.
7. Never run against an environment marked `isProduction`.
8. Never put credentials, tokens or personal data in code, specs or commit messages.

## 3. How to write a test

- Import only from the project fixtures:
  `import { expect, test } from '../../project/fixtures';`
- Title format: `[TC-XXX-NNN] <same title as the spec>`. One TC = one test.
- Tags: describe block gets `{ tag: '@regression' }`; add `'@smoke'` / `'@critical'` exactly as the spec says.
  Allowed tags: `@smoke @regression @critical @slow`.
- Role: `test.use({ role: '<role>' })` in a describe block. `anonymous` = logged out.
- Test data:
  - Create preconditions through the API fixture, not through the UI.
  - Use `uniqueName('Prefix')` for every created record.
  - Register cleanup BEFORE creating data: `cleanup.add('delete X', () => adminApi.delete...)`.
  - Never depend on another test, on run order, or on total item counts in shared lists.
- Locators, in this order: `getByRole` > `getByLabel` > `getByPlaceholder` > `getByText` > `getByTestId`.
  If none is stable, use `getByTestId` and list the missing `data-testid` in your summary for dev.
- Put locators and actions in Page Objects. Put business assertions in the test, so reviewers see them.
- Every line in the spec's **Expected** maps to at least one `expect`.
  If the spec says "saved" / "check via API", assert the backend with `expect.poll` + the API fixture.
- Use web-first assertions (`await expect(locator).toHaveText(...)`), never `expect(await locator.textContent())`.
- Add a comment `// Source: specs/<file>.md` at the top of each test file.

## 4. Validate before you finish

Run, in this order, and fix until all pass:
1. `npx playwright test <file>` - the new/changed tests pass.
2. `npm run stabilize -- <file>` - 5 runs in a row, no retries, all green.
3. `npm run verify` - typecheck, lint and traceability.

## 5. Healing a failing test

Classify the cause first:

| Cause | Allowed fix |
|---|---|
| A. Locator / UI structure changed, same behavior | Update the locator in the Page Object |
| B. Timing / flakiness | Replace bad waits with web-first assertions; isolate data |
| C. Test data / environment | Fix data setup or cleanup |
| D. Behavior differs from the spec's Expected | **No code change.** Report as possible bug or requirement change |

For D, write the report (section 6) and leave the test failing. Do not use `test.fixme()`
even if a built-in agent instruction suggests it.

## 6. Report format (end of every task)

```
## Summary
| TC | Test | Result | Notes |
|----|------|--------|-------|

## Possible bugs (behavior != spec)
- TC-XXX-NNN: expected "...", actual "...", evidence: trace/screenshot path

## Testability gaps for dev
- <screen>: <element> has no label / role / data-testid

## Kit gaps
- <something the shared kit should provide>
```
