---
description: Continue from the developer approval gate after Level 1 quick validation.
agent: orchestrator
---

# Approval Gate

**Decision:** $ARGUMENTS

Accepted decisions:

- iterate
- validate
- approve
- commit

Workflow:

1. Read latest handoff and quick validation result.
2. For `iterate`, create a corrective Worker Packet.
3. For `validate`, ask for level and scope unless already provided.
4. For `approve`, update current milestone and ask whether documentation or commit is desired.
5. For `commit`, confirm final approval before any git commit command.

Never commit, merge, install browser tooling, or run expensive validation without explicit user approval.
