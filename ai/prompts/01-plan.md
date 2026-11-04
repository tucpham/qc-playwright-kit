# Prompt: PLAN - explore a feature and draft test cases

Use when a project has no written test cases for a feature yet.
Output is a DRAFT for a human (QC/BA) to review. It is never used for generation until approved.

---

Read `AGENTS.md`, `project/app-map.md`, `specs/_TEMPLATE.md` and existing files in `specs/`.

Task: draft test cases for the feature: **{{FEATURE}}**
Requirement / notes from the team (may be empty): **{{REQUIREMENT}}**
Environment: the one in `.env` (`TEST_ENV`). Never production.

Steps:
1. Run `tests/seed.spec.ts` to get a logged-in browser, then explore the feature with the browser tools.
   Try each role listed in `project/app-map.md` that can reach it.
2. Cover, in this priority:
   - Main happy path(s) - P1
   - Permission differences between roles - P1
   - Validation and error messages - P2
   - Important edge cases (empty, max length, duplicates, special characters, pagination) - P2/P3
3. Write `specs/{{feature-slug}}.md` using the template exactly.
   - New IDs continue the existing numbering. Never reuse or renumber IDs.
   - Every TC gets `Status: draft`.
   - Expected results:
     - If the requirement states it: write it.
     - If you only observed it in the app: write it and add `[NEEDS CONFIRMATION - observed only]`.
       Observed behavior is not proof of correct behavior.
     - If anything looks wrong (typos, inconsistent messages, missing permission checks):
       list it under "Possible bugs" instead of turning it into an expected result.
4. Update `project/app-map.md` if you found screens or flows not listed there.
5. Do not write any test code in this step.

End with the report from AGENTS.md section 6, plus a list of questions for BA/PO.
