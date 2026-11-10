# Skill Registry

This is the single source of truth for skill metadata. Agents discover skills through this file and should not need prompt edits when a skill is added, removed, or changed.

## Registry Rules

- A skill is activated only when selected capability entries or mission requirements match its activation rules.
- A skill is deactivated when its deactivation rules match or its task is complete.
- Agents load the skill's own `SKILL.md` only after this registry selects it.
- Adding a skill requires adding the skill folder and one registry entry.
- If a skill is unavailable, use its fallback behavior and record the fallback.

## Skills

### graphify

- Name: graphify
- Purpose: repository knowledge graph discovery and focused architectural investigation
- Description: Helps agents understand repository structure, dependencies, changed areas, and impact without broad file reading.
- Activation rules:
  - selected capability requires repository structure or dependency context
  - affected files or module boundaries are unknown
  - architecture assumptions need targeted verification
  - validator or reviewer needs changed-area context
- Deactivation rules:
  - relevant subgraph or finding has been extracted
  - affected files are known
  - task is local and fully specified
- Dependencies: `.opencode/skills/graphify/SKILL.md`, optional `graphify-out/graph.json`
- Supported capabilities: frontend, backend, database, infrastructure, testing, security, performance, api, devops, mobile, ai
- Estimated token cost: low for focused query, medium for broad report
- Priority: high for discovery, low when `.ai/` memory already answers the question
- Fallback behavior: use `.ai/directory-map.md`, `.ai/dependency-map.md`, then targeted file reads

### handoff

- Name: handoff
- Purpose: structured implementation reporting
- Description: Produces the worker report used by the orchestrator approval gate.
- Activation rules:
  - any worker implementation completes
  - any worker blocks or partially completes
- Deactivation rules:
  - handoff has been delivered
- Dependencies: `.opencode/skills/handoff/SKILL.md`
- Supported capabilities: frontend, backend, database, infrastructure, documentation, testing, security, performance, ui, api, devops, mobile, ai
- Estimated token cost: low
- Priority: required after implementation
- Fallback behavior: use the handoff format embedded in the Worker Packet

### ui-ux-pro-max

- Name: ui-ux-pro-max
- Purpose: UI, UX, accessibility, responsive, layout, interaction, visual-quality, and design-system guidance
- Description: Searchable design intelligence for web and mobile interfaces.
- Activation rules:
  - selected capability is frontend, ui, or mobile
  - task changes visual design, interaction, accessibility, responsive behavior, forms, dashboards, charts, navigation, or animation
  - validation scope includes UX
- Deactivation rules:
  - design guidance has been translated into implementation constraints
  - static UX validation is complete
  - task is non-visual
- Dependencies: `.opencode/skills/ui-ux-pro-max/SKILL.md`
- Supported capabilities: frontend, ui, mobile
- Estimated token cost: medium
- Priority: high for user-facing UI work
- Fallback behavior: use `.ai/coding-standards.md` and standard accessibility/responsive checks

## Skill Addition Template

```markdown
### [skill-name]

- Name:
- Purpose:
- Description:
- Activation rules:
- Deactivation rules:
- Dependencies:
- Supported capabilities:
- Estimated token cost:
- Priority:
- Fallback behavior:
```
