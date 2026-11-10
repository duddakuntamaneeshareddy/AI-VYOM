---
name: handoff
description: Produce structured OpenCode Orchestration v2 worker handoff reports after feature implementation.
compatibility: opencode
---

## What This Skill Does

Use this skill at the end of every worker feature implementation to report exactly what changed, which skills were active, what quick validation ran, what remains, and what the next worker or orchestrator should know.

## Required Handoff Format

```markdown
# Worker Handoff - Feature [N]: [Name]

## Status
[ ] Complete  [ ] Partial  [ ] Blocked

## Files Changed
- [path] - [what changed and why]

## Implemented
[Precise description of what was built. Be specific enough that someone with no codebase access understands it.]

## Acceptance Criteria Check
- [ ] [Criterion from spec] - met / not met - [reason]

## Active Skills Used
- [skill] - [why it was activated]

## Validation Status
- Level requested:
- Commands run:
- Result:

## Left Intentionally Undone
[Anything in the spec not implemented, with reason]

## Discovered Issues / Dependencies
[Anything that came up during implementation that the orchestrator should know about or scope as a follow-up]

## Terminal Commands Run
- `[command]` -> exit [code]

## Recommended Next Actions
[iterate, approve, or validate]
```

## Rules

- Include every command run and its exit code.
- Mark unfinished acceptance criteria clearly.
- Call out dependencies that need their own worker spec.
- Keep the report factual and scoped to the feature.
- Do not claim deeper validation ran unless it was explicitly requested.
