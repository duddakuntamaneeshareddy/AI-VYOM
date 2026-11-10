# Validation Policy

This is the single source of truth for validation levels, scopes, and approval gates.

## Default

After implementation, run Level 1 Quick Validation only, then ask the developer:

```text
Would you like to iterate, validate, approve, or commit?
```

Do not automatically run browser validation, end-to-end tests, accessibility scans, security review, performance analysis, or release validation.

## Levels

### Level 0 - No Validation

- Use for docs-only, comments-only, or planning-only changes.
- Output changed files and reason validation was skipped.

### Level 1 - Quick Validation

- Default after implementation.
- Run configured build, syntax, type, lint, or import checks.
- Keep commands cheap and local.

### Level 2 - Standard Validation

- Run Level 1.
- Add code review and unit tests for requested scopes.
- Use for behavior changes, shared logic, and test updates.

### Level 3 - Advanced Validation

- Run Level 2.
- Add requested architecture, security, performance, backend, frontend, or integration review.
- Use for high-risk changes or explicit user request.

### Level 4 - Release Validation

- Run Level 3.
- Add requested end-to-end, browser, accessibility, deployment, or release smoke checks.
- Use only for release preparation or explicit user request.

## Scopes

- Code: static review, lint/type/build/test quality.
- Backend: APIs, services, business logic, database-adjacent behavior.
- Frontend: UI code, component behavior, routing, state, build output.
- Security: auth, authorization, input handling, secrets, dependency risk.
- Performance: runtime cost, bundle size, query efficiency, profiling.
- UX: user flows, accessibility, responsive behavior, browser checks.
- Everything: all applicable scopes for selected capabilities.

## Browser Validation

Browser validation requires `.opencode/config/browser-manager.md`.

- Detect installed tooling.
- Report missing tooling as `NOT RUN`.
- Do not install browser dependencies without explicit approval.

## Approval Gate

After Level 1:

1. Show implementation summary.
2. Show changed files.
3. Show quick validation results.
4. Show worker handoff.
5. Ask the developer to choose: iterate, validate, approve, or commit.
