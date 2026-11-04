# Prompt: IMPORT - convert existing test cases (Excel / Jira / docs) to the standard spec format

Use when a project already has test cases in another format. For a plain CSV export, try
`npm run tc:import -- <file.csv> <feature-slug>` first, then use this prompt to clean the result.

---

Read `specs/_TEMPLATE.md`.

Task: convert the test cases in **{{SOURCE_FILE_OR_PASTED_TEXT}}** into `specs/{{feature-slug}}.md`.

Rules:
1. Keep the meaning of every step and expected result. Do not add, drop or "improve" business rules.
2. Keep the original IDs if they exist (note them as `Notes: legacy ID ...`) and assign
   standard IDs `TC-<FEATURE>-NNN`.
3. Split vague expected results ("works correctly", "displays properly") into concrete checks only
   if the source states the details elsewhere. Otherwise keep them and mark
   `[NEEDS CONFIRMATION - expected result not specific]`.
4. Status: `approved` only if the source marks the case as reviewed/approved; otherwise `draft`.
5. Map priority and tags: P1 + main flow -> `@smoke`; release blockers -> `@critical`; all -> `@regression`.

End with a table: source ID -> new ID -> status -> what needs confirmation.
