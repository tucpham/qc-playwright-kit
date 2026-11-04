# Prompt: HEAL - fix failing or flaky tests (as a reviewable change)

Healing always produces a diff for a human to review. Never heal inside a CI run.

---

Read `AGENTS.md` (mandatory, especially section 5).

Task: investigate **{{FAILING_TESTS or "all failing tests in the last run"}}**
Evidence available: `test-results/results.json`, traces in `test-results/artifacts/`.

Steps:
1. Run the failing test(s) alone with `--retries=0`. Note whether it fails every time (broken)
   or only sometimes (flaky): run `npm run stabilize -- <file>`.
2. Debug with the browser tools: snapshot the page at the failing step, compare with what the
   test expects.
3. Classify the cause as A / B / C / D (AGENTS.md section 5). Write down the evidence.
4. Fix only A, B, C:
   - A: change the locator in the Page Object, not in the test, unless it is test-local.
   - B: remove the root cause of flakiness (bad wait, shared data, order dependency).
     More retries or longer timeouts are not a fix.
   - C: fix data setup / cleanup.
5. For D: change nothing in the test. Report it.
6. Never touch `expect` values, never remove assertions, never add skip/fixme/only.
   `npm run guard` will flag these and block the merge.
7. Re-validate: run the file, `npm run stabilize -- <file>`, `npm run verify`.

Report table:

| Test | Class (A/B/C/D) | Evidence | Change made |
|------|-----------------|----------|-------------|

Then the AGENTS.md section 6 report.
