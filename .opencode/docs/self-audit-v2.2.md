# Self-Audit - OpenCode Orchestration v2.2

## Requirement Checklist

- [x] Agents are stored in `.opencode/agents/` for OpenCode project-agent discovery.
- [x] Runtime models are enforced through agent `model` frontmatter.
- [x] Model Registry was removed.
- [x] Capability Registry routes to real agents and runtime models.
- [x] Skill Registry remains plug-and-play.
- [x] Validation remains policy-driven.
- [x] Browser Manager remains no-install by default.
- [x] Database work has a real GLM-5.2 specialist agent.
- [x] Documentation work has a real DeepSeek V4 Flash specialist agent.
- [x] General implementation remains on Kimi K2.7 Code.
- [x] Validator covers code, security, performance, and UX scopes through policy.
- [x] Architecture review remains separate.
- [x] Startup overhead is minimized by loading only capability, skill, validation, and current milestone policy first.
- [x] No obsolete split validator references remain.
- [x] Existing `/mission`, `/validate`, `/handoff`, and `/approve` commands remain available.

## Runtime Note

OpenCode Go must expose the model IDs used in `.opencode/agents/*.md` frontmatter. If a model name changes in OpenCode Go, update the relevant agent frontmatter directly.
