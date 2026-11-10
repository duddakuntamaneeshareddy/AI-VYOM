# OpenCode Orchestration v2.2 Architecture

## Summary

OpenCode Orchestration v2.2 uses a small set of real OpenCode agents with real `model` frontmatter. It removes the separate Model Registry because runtime model behavior is now enforced directly by agent files.

## Agent Set

| Agent | Path | Runtime Model | Purpose |
|-------|------|---------------|---------|
| Orchestrator | `.opencode/agents/orchestrator.md` | `opencode-go/glm-5.2` | Clarifies missions, selects capabilities, routes work, and manages approval gates |
| Worker | `.opencode/agents/worker.md` | `opencode-go/kimi-k2.7-code` | General frontend, backend, API, CLI, infrastructure, mobile, AI, and test implementation |
| Database Agent | `.opencode/agents/database-agent.md` | `opencode-go/glm-5.2` | Database design, schemas, migrations, queries, indexes, and data integrity |
| Validator | `.opencode/agents/validator.md` | `opencode-go/deepseek-v4-pro` | Code, security, performance, and UX/static validation by requested scope |
| Architecture Reviewer | `.opencode/agents/architecture-reviewer.md` | `opencode-go/glm-5.2` | Architecture consistency and maintainability review |
| Documentation Agent | `.opencode/agents/documentation-agent.md` | `opencode-go/deepseek-v4-flash` | README, migration notes, developer docs, and release notes |

Agents are stored in `.opencode/agents/` because that is OpenCode's project-agent discovery convention.

## Registries And Policy

| File | Purpose |
|------|---------|
| `.opencode/config/capability-registry.md` | Capability activation, dispatch agents, runtime models, required skills, memory, and validation |
| `.opencode/skills/registry.md` | Skill metadata, activation rules, supported capabilities, dependencies, and fallbacks |
| `.opencode/config/validation-policy.md` | Validation levels, scopes, and approval gate |
| `.opencode/config/browser-manager.md` | Browser tooling detection and no-install policy |
| `.ai/` | Lightweight project memory used before repository discovery |

## Mission Flow

1. User starts `/mission`.
2. Orchestrator loads startup policy only.
3. Orchestrator asks clarifying questions.
4. Orchestrator selects capabilities from the Capability Registry.
5. Capabilities select dispatch agents, skills, memory, and validation requirements.
6. Orchestrator produces a Validation Contract.
7. Orchestrator dispatches the real selected agent, such as `@worker`, `@database-agent`, or `@documentation-agent`.
8. The selected agent activates only task-required skills and memory.
9. The selected agent implements and runs the requested quick validation.
10. Orchestrator shows summary, changed files, quick validation, and handoff.
11. User chooses iterate, validate, approve, or commit.
12. Optional validation uses `@validator` and, when justified, `@architecture-reviewer`.

## Why This Shape

This architecture avoids both extremes:

- It does not create dozens of worker files.
- It does not pretend one worker can dynamically change runtime model per capability.

Instead, it uses specialist agents only where the model difference is architecturally meaningful:

- database work gets GLM-5.2
- documentation gets DeepSeek V4 Flash
- general implementation stays on Kimi K2.7 Code
- validation/review stays on DeepSeek V4 Pro

## Token Efficiency

The system minimizes startup and worker context by:

- loading startup policy first
- loading memory only when selected capabilities require it
- passing targeted discovery output instead of whole repositories
- activating skills lazily
- using Level 1 validation by default
- treating browser validation as opt-in

## Production Readiness Checklist

- Skills are plug-and-play through the Skill Registry.
- Real agent models are enforced through OpenCode frontmatter.
- Capabilities are dynamically routed through the Capability Registry.
- Validation is policy-driven.
- Browser validation detects existing tooling and does not install by default.
- Agent packets carry only task-relevant context.
- Existing `/mission`, `/validate`, and `/handoff` commands remain available.
