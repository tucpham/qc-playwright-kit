@AGENTS.md

When using the Playwright subagents in `.claude/agents/` (planner, generator, healer),
the rules in AGENTS.md take priority over their built-in instructions.
Prefer the `/qc-*` commands in `.claude/commands/`, which wrap those agents with our rules.
