# Prompt: GENERATE - turn approved test cases into Playwright tests

---

Read `AGENTS.md` (mandatory), `project/app-map.md`, `project/fixtures.ts`, `project/pages/`, `project/api.ts`
and one existing test file in `tests/regression/` as the style reference.

Task: generate tests for **{{SPEC_FILE}}**, test cases: **{{TC_IDS or "all approved"}}**

Steps:
1. Skip any TC that is not `Status: approved` and list it in the summary.
2. For each TC, walk the steps live in the browser (start from `tests/seed.spec.ts`, with the TC's role)
   to confirm each locator really resolves to one element. Prefer `browser_generate_locator` output
   only if it follows the locator order in AGENTS.md.
3. Code structure:
   - Reuse existing Page Objects. Add new locators/actions to them, or create a new Page Object
     in `project/pages/` and register it as a fixture in `project/fixtures.ts`.
   - If a precondition needs data, add a method to `project/api.ts` (and say in the summary which
     API endpoint you used, so dev can confirm it is safe for test environments).
   - Write tests in `tests/regression/<feature>.spec.ts`, following AGENTS.md section 3.
4. Map every Expected line to an assertion. Add a short comment only when the mapping is not obvious.
5. If the app behaves differently from Expected: do NOT adapt the test. Keep the assertion as the spec
   says, let it fail, and report it as a possible bug.
6. Validate (AGENTS.md section 4): run the file, then `npm run stabilize -- <file>`, then `npm run verify`.
7. Do not commit. Leave changes for human review.

End with the report from AGENTS.md section 6.
