# Prompt: REVIEW - AI pre-review of a test pull request

AI pre-review helps the human reviewer, it does not replace them.

---

Read `AGENTS.md` and `docs/04-review-checklist.md`.

Task: review the changes in **{{BRANCH or "git diff origin/main...HEAD -- tests project specs"}}**

For each changed test:
1. Open the linked spec (`// Source:` comment + TC ID in the title). Compare Expected lines with the
   assertions. List any Expected line with no matching assertion, and any assertion that checks less
   than the spec says (e.g. `toContainText` where the spec gives an exact message).
2. Go through every item of `docs/04-review-checklist.md` and mark pass / fail with the line number.
3. Check that test data is isolated (uniqueName + cleanup registered before creation).
4. Check that locators follow the order in AGENTS.md and live in Page Objects.
5. For healed tests: confirm the change is class A/B/C only. Flag any change to an expected value.

Output:

| File:line | Severity (blocker / major / minor) | Issue | Suggested fix |
|-----------|-----------------------------------|-------|---------------|

Finish with: "Approve", "Approve with minor fixes" or "Request changes", and why in one sentence.
