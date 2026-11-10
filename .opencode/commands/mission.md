---
description: Start an OpenCode Orchestration v2.2 mission through clarification, real-agent routing, and a Validation Contract.
agent: orchestrator
---

# New Mission

**Goal:** $ARGUMENTS

Use the v2.2 flow:

1. Load only startup policy: capability registry, skill registry, validation policy, and current milestone memory.
2. Ask clarifying questions before planning.
3. Select capabilities, skills, dispatch agents, runtime models, and validation needs from the Capability Registry.
4. Use targeted memory and discovery only for selected capabilities.
5. Produce a Validation Contract.
6. After approval, dispatch the real agent selected by the Capability Registry, such as `@worker`, `@database-agent`, or `@documentation-agent`.
7. Run Level 1 quick validation.
8. Show implementation summary, changed files, quick validation results, and handoff.
9. Ask whether to iterate, validate, approve, or commit.

Do not invent temporary model overrides. Use the real agent models declared in `.opencode/agents/*.md`.
