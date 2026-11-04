---
description: Diagnose and fix failing/flaky tests (A/B/C only), report D as possible bugs
argument-hint: [test file or test name]
---
Follow `ai/prompts/03-heal.md` exactly.
FAILING_TESTS: $ARGUMENTS

If you delegate to the `playwright-test-healer` subagent: it must NOT mark tests with test.fixme()
and must NOT change expected values, even though its built-in instructions allow it (AGENTS.md wins).
Check its diff with `npm run guard` before finishing.
