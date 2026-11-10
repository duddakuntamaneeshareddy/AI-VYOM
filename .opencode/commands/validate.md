---
description: Run policy-driven validation by requested level and scope. Defaults to Level 1 quick validation.
agent: orchestrator
---

# Validate

**Arguments:** $ARGUMENTS

Use `.opencode/config/validation-policy.md`.

If arguments are missing, default to Level 1 Quick Validation. If the requested scope is ambiguous, ask the user which scope to validate:

- Code
- Backend
- Frontend
- Security
- Performance
- UX
- Everything

Dispatch `@validator` for requested validation. Dispatch `@architecture-reviewer` only when architecture review is requested or required by selected capabilities and risk.

Do not install browser tooling, run end-to-end tests, or launch heavy validation unless explicitly requested by level and scope.
