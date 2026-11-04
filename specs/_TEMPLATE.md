# <Feature name>

<!--
STANDARD TEST CASE FORMAT - used by both human writers and AI agents.
- One file = one feature. File name: specs/<feature>.md
- TC ID: TC-<FEATURE>-<3 digits>. Never change or reuse an existing ID.
- Only TCs with Status: approved may be generated into tests.
- Expected results must come from requirements / BA / PO. Never use "what the app currently does" as expected.
- Where something is uncertain, write [NEEDS CONFIRMATION] and keep Status: draft.
-->

Owner: <responsible QC / BA>
Requirement: <Jira link / document>
Roles: <admin, user...>

## TC-XXX-001 <Short title describing the user behavior>

- Status: draft | approved | deprecated
- Priority: P1 | P2 | P3
- Tags: @smoke @regression @critical
- Role: user
- Preconditions:
  - <data / state required beforehand, created via API when possible>
- Steps:
  1. <user action>
  2. <...>
- Expected:
  - <verifiable business outcome: data, state, exact message>
  - <if needed: data is saved in the backend (check via API)>
- Notes: <optional>
