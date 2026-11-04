# 04 - Test review checklist

Applies to every PR that changes `tests/`, `project/`, `specs/`. Items marked (auto) are checked by CI; reviewers only need to look at the result.

## A. Business correctness (most important, only humans can do this)

- [ ] The test matches the TC in the spec (ID, title, role, tags)
- [ ] Every Expected line has a corresponding assertion
- [ ] Assertions check the **business outcome** (data, state, exact message), not just "is displayed"
- [ ] If the spec requires a backend check, the test verifies it via the API
- [ ] No expected result was inferred by AI from app behavior without approval
- [ ] The test will **fail** if the feature breaks (ask yourself: if the message changes or the save step is removed, does the test go red?)

## B. Stability

- [ ] (auto) Stabilize 5/5 green, no retries
- [ ] (auto) No hard waits, no force, no networkidle
- [ ] Data created via API, names use `uniqueName`, cleanup registered before creating
- [ ] No dependency on other tests / run order / total record counts

## C. Structure

- [ ] Imports from `project/fixtures`
- [ ] Locators live in Page Objects, following the priority order (role > label > ... > testid)
- [ ] (auto) No XPath / long CSS
- [ ] No edits to files in `kit/`
- [ ] No credentials / tokens / personal data

## D. Traceability and gate

- [ ] (auto) `trace:check` green
- [ ] (auto) `guard` green, or the `qc-approved` label has been applied after a QC lead reviewed each finding
- [ ] Testability gaps (if any) are recorded in `app-map.md` / the dev backlog

## Verdict

- **Approve**: A, B, C, D all pass
- **Approve with minor fixes**: only presentation issues, no impact on reliability
- **Request changes**: any item in A or B fails
