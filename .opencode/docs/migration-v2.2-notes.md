# Migration Notes - v2.2

## What Changed

- Removed `.opencode/config/model-registry.md`.
- Added `@database-agent` with `opencode-go/glm-5.2`.
- Added `@documentation-agent` with `opencode-go/deepseek-v4-flash`.
- Kept `@worker` as the broad implementation agent on `opencode-go/kimi-k2.7-code`.
- Kept `@validator` as the scope-driven review/validation agent on `opencode-go/deepseek-v4-pro`.
- Kept `@architecture-reviewer` on `opencode-go/glm-5.2`.
- Updated the Capability Registry to route capabilities to real agents and runtime models.
- Updated prompts, commands, memory, and docs to remove Model Registry references.

## Current Routing

- Frontend/backend/API/infrastructure/mobile/AI/general implementation -> `@worker`
- Database design/schema/migrations/queries -> `@database-agent`
- Documentation -> `@documentation-agent`
- Code/security/performance/UX validation -> `@validator`
- Architecture review -> `@architecture-reviewer`

## How To Add A Capability

1. Add or update an entry in `.opencode/config/capability-registry.md`.
2. Route it to an existing real agent when possible.
3. Add a new agent only when a distinct runtime model or responsibility boundary is genuinely needed.
4. Add required skills through `.opencode/skills/registry.md`.

## How To Change Models

Edit the `model:` frontmatter in the relevant real agent under `.opencode/agents/`.

No separate model registry exists.

## How To Add A Skill

1. Add the skill folder.
2. Add one entry to `.opencode/skills/registry.md`.
3. Reference it from relevant capabilities.

No agent prompt change is required unless the skill changes the agent's core responsibility.
