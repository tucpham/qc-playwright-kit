# Changelog

## 1.0.0 - 2026-11-04

First version.

- Core kit: `createConfig`, role-based auth setup, fixtures (`role`, `env`, `cleanup`, `uniqueName`), `BasePage`, `Toast`, `DataTable`, `fillForm`, standard tags
- Production guard (`isProduction` + `ALLOW_PROD`)
- Lint rules for stable, reviewable tests (eslint-plugin-playwright + custom locator rules)
- Scripts: traceability, stabilize, guard, CSV import, metrics + quality gates (pr / nightly / release)
- AI layer: AGENTS.md rules, prompts (plan / generate / heal / review / import), Claude Code `/qc-*` commands, Playwright 1.64 test agents + MCP config
- CI templates: GitHub Actions, GitLab CI
- Demo app + sample specs/tests
