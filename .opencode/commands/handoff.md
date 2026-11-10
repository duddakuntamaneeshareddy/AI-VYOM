---
description: Produce an OpenCode Orchestration v2.2 capability-driven agent handoff report.
agent: worker
---

# Worker Handoff - $ARGUMENTS

Use the registry-driven handoff format:

```markdown
# Worker Handoff - [Feature]

## Status
[ ] Complete  [ ] Partial  [ ] Blocked

## Activated Capabilities
- [capability] - [why]

## Activated Skills
- [skill] - [why]

## Files Changed
- [path] - [what changed]

## Implemented
[summary]

## Acceptance Criteria Check
- [ ] [criterion] - met/not met - [reason]

## Quick Validation
- Level:
- Commands:
- Result:

## Left Undone
[items]

## Discovered Dependencies
[items]

## Recommended Next Action
[iterate, validate, approve, or commit]
```
