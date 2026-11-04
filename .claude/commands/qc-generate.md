---
description: Generate Playwright tests from approved test cases in a spec file
argument-hint: <specs/file.md> [TC-IDs]
---
Follow `ai/prompts/02-generate.md` exactly.
SPEC_FILE and TC_IDS: $ARGUMENTS

You may delegate one TC at a time to the `playwright-test-generator` subagent. When you do, pass it:
the TC block from the spec, seed file `tests/seed.spec.ts`, the target file in `tests/regression/`,
and the instruction "Follow AGENTS.md; import from project/fixtures; use existing Page Objects".
Review its output against AGENTS.md before moving on.
