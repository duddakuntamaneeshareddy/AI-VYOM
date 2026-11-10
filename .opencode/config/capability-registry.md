# Capability Registry

This is the single source of truth for capability-based routing. Capabilities route to real OpenCode agents with real `model` frontmatter. There is no separate model registry.

## Real Agent Set

| Agent | Runtime Model | Primary Use |
|-------|---------------|-------------|
| `@orchestrator` | `opencode-go/glm-5.2` | Mission planning, routing, clarification, approval gates |
| `@worker` | `opencode-go/kimi-k2.7-code` | General frontend, backend, API, CLI, infrastructure, mobile, AI implementation |
| `@database-agent` | `opencode-go/glm-5.2` | Database design, schema, migrations, queries, data integrity |
| `@validator` | `opencode-go/deepseek-v4-pro` | Code review, security review, performance review, UX/static validation by scope |
| `@architecture-reviewer` | `opencode-go/glm-5.2` | Architecture consistency and maintainability review |
| `@documentation-agent` | `opencode-go/deepseek-v4-flash` | README, migration notes, developer docs, release notes |

## Registry Rules

- Capabilities are selected by the orchestrator and confirmed by the receiving agent.
- A capability is active only while its activation conditions match the current packet.
- Capabilities list skill names, but agents resolve skill behavior through `.opencode/skills/registry.md`.
- Capabilities route to actual agents; do not invent model overrides or temporary worker identities.
- Adding a capability should require editing this file and, only if truly necessary, adding a real agent with a strong architectural reason.

## Capabilities

### frontend

- Description: Browser-facing UI, components, routing, client state, styling, accessibility, and responsive behavior.
- Activation conditions: UI surface, page, component, form, dashboard, navigation, chart, frontend state, or browser interaction changes.
- Dispatch agent: `@worker`
- Runtime model: `opencode-go/kimi-k2.7-code`
- Required skills: ui-ux-pro-max
- Required project memory: `.ai/architecture.md`, `.ai/coding-standards.md`, `.ai/tech-stack.md`
- Validation requirements: Level 1 build/types/lint; optional UX scope by request; Level 4 for release user flows.
- Estimated token cost: medium

### backend

- Description: APIs, services, server-side logic, CLI behavior, integrations, background jobs, and business rules.
- Activation conditions: endpoint, service, CLI, integration, authentication flow, authorization flow, or business logic changes.
- Dispatch agent: `@worker`
- Runtime model: `opencode-go/kimi-k2.7-code`
- Required skills:
- Required project memory: `.ai/architecture.md`, `.ai/api-contracts.md`, `.ai/coding-standards.md`, `.ai/tech-stack.md`
- Validation requirements: Level 1 build/types/lint; Level 2 unit tests for behavior changes.
- Estimated token cost: medium

### database

- Description: Schema design, migrations, queries, indexes, persistence contracts, data integrity, and seed data.
- Activation conditions: migration, schema, ORM model, SQL query, index, transaction, persistence, or data migration changes.
- Dispatch agent: `@database-agent`
- Runtime model: `opencode-go/glm-5.2`
- Required skills:
- Required project memory: `.ai/database-schema.md`, `.ai/dependency-map.md`, `.ai/coding-standards.md`
- Validation requirements: Level 2 migration/query tests; Level 3 for destructive or production data changes.
- Estimated token cost: medium

### infrastructure

- Description: CI, deployment, environment variables, containers, hosting, build pipelines, package managers, and runtime configuration.
- Activation conditions: CI file, Dockerfile, deployment config, package script, environment config, or runtime setup changes.
- Dispatch agent: `@worker`
- Runtime model: `opencode-go/kimi-k2.7-code`
- Required skills:
- Required project memory: `.ai/tech-stack.md`, `.ai/dependency-map.md`, `.ai/coding-standards.md`
- Validation requirements: Level 1 config/build checks; Level 3 for deployment or CI behavior changes.
- Estimated token cost: medium

### documentation

- Description: README, developer docs, API docs, migration notes, comments, and operational guidance.
- Activation conditions: documentation-only work or documentation required after code changes.
- Dispatch agent: `@documentation-agent`
- Runtime model: `opencode-go/deepseek-v4-flash`
- Required skills:
- Required project memory: `.ai/architecture.md`, `.ai/current-milestone.md`, `.ai/design-decisions.md`
- Validation requirements: Level 0 for docs-only; Level 1 link/format sanity when configured.
- Estimated token cost: low

### testing

- Description: Unit, integration, contract, fixture, snapshot, and end-to-end test design.
- Activation conditions: adding, updating, or reviewing tests; coverage gaps; acceptance criteria verification.
- Dispatch agent: `@worker` for test implementation, `@validator` for test review.
- Runtime model: `opencode-go/kimi-k2.7-code` for implementation, `opencode-go/deepseek-v4-pro` for review.
- Required skills:
- Required project memory: `.ai/validation-contract.md`, `.ai/tech-stack.md`, `.ai/coding-standards.md`
- Validation requirements: Level 2 by default; Level 4 for release end-to-end flows.
- Estimated token cost: medium

### security

- Description: Authentication, authorization, secrets, input validation, dependency risk, threat modeling, and secure coding.
- Activation conditions: auth, permissions, secrets, payments, user data, external input, shell execution, SQL, eval, cryptography, or dependency security changes.
- Dispatch agent: `@worker` for implementation, `@validator` for security review.
- Runtime model: `opencode-go/kimi-k2.7-code` for implementation, `opencode-go/deepseek-v4-pro` for review.
- Required skills:
- Required project memory: `.ai/api-contracts.md`, `.ai/dependency-map.md`, `.ai/coding-standards.md`
- Validation requirements: Level 3 by default; Level 4 for release-critical security flows.
- Estimated token cost: high

### performance

- Description: Runtime speed, bundle size, rendering cost, memory use, query efficiency, caching, and throughput.
- Activation conditions: performance requirement, regression, large lists, expensive queries, caching, profiling, or optimization work.
- Dispatch agent: `@worker` for implementation, `@validator` for performance review.
- Runtime model: `opencode-go/kimi-k2.7-code` for implementation, `opencode-go/deepseek-v4-pro` for review.
- Required skills:
- Required project memory: `.ai/dependency-map.md`, `.ai/tech-stack.md`, `.ai/coding-standards.md`
- Validation requirements: Level 3 performance scope when requested; benchmark only when configured and approved.
- Estimated token cost: high

### ui

- Description: Visual quality, layout, typography, interaction states, accessibility, and product experience.
- Activation conditions: visual design, UX quality, accessibility, responsive layout, animation, or design system work.
- Dispatch agent: `@worker` for UI implementation, `@validator` for UX validation.
- Runtime model: `opencode-go/kimi-k2.7-code` for implementation, `opencode-go/deepseek-v4-pro` for validation.
- Required skills: ui-ux-pro-max
- Required project memory: `.ai/coding-standards.md`, `.ai/tech-stack.md`
- Validation requirements: Static UX review by request; browser validation only by request or release level.
- Estimated token cost: medium

### api

- Description: HTTP, RPC, SDK, webhooks, schemas, request/response contracts, error contracts, and versioning.
- Activation conditions: endpoint contract, API client, webhook, schema, external API integration, or compatibility work.
- Dispatch agent: `@worker`
- Runtime model: `opencode-go/kimi-k2.7-code`
- Required skills:
- Required project memory: `.ai/api-contracts.md`, `.ai/architecture.md`, `.ai/tech-stack.md`
- Validation requirements: Level 2 contract/unit tests; Level 3 for external integrations.
- Estimated token cost: medium

### devops

- Description: Operational automation, observability, release process, deployment safety, and environment management.
- Activation conditions: release scripts, monitoring, logging, secrets management, deployment, or operational runbooks.
- Dispatch agent: `@worker`
- Runtime model: `opencode-go/kimi-k2.7-code`
- Required skills:
- Required project memory: `.ai/dependency-map.md`, `.ai/tech-stack.md`, `.ai/current-milestone.md`
- Validation requirements: Level 3 for release-impacting changes.
- Estimated token cost: medium

### mobile

- Description: Native or cross-platform mobile UI, navigation, gestures, device APIs, and app-store constraints.
- Activation conditions: mobile app, native UI, React Native, Flutter, SwiftUI, Jetpack Compose, or mobile-specific UX.
- Dispatch agent: `@worker`
- Runtime model: `opencode-go/kimi-k2.7-code`
- Required skills: ui-ux-pro-max
- Required project memory: `.ai/tech-stack.md`, `.ai/coding-standards.md`
- Validation requirements: Level 2 static/platform checks; Level 4 for release user flows when tooling exists.
- Estimated token cost: medium

### ai

- Description: AI prompts, model calls, tool use, retrieval, embeddings, evaluation, and agent workflows.
- Activation conditions: LLM integration, prompt engineering, retrieval, agent orchestration, tool use, or evaluation work.
- Dispatch agent: `@worker` for implementation, `@architecture-reviewer` for architecture-sensitive review.
- Runtime model: `opencode-go/kimi-k2.7-code` for implementation, `opencode-go/glm-5.2` for review.
- Required skills:
- Required project memory: `.ai/architecture.md`, `.ai/api-contracts.md`, `.ai/dependency-map.md`
- Validation requirements: Level 2 for deterministic code; Level 3 for evaluation or safety-sensitive behavior.
- Estimated token cost: high

## Capability Addition Template

```markdown
### [capability]

- Description:
- Activation conditions:
- Dispatch agent:
- Runtime model:
- Required skills:
- Required project memory:
- Validation requirements:
- Estimated token cost:
```
