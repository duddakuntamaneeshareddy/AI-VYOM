---
name: graphify
description: Use graphify as the first-pass discovery layer for codebase architecture, dependency tracing, and focused investigation.
compatibility: opencode
---

## When To Use

Use this skill before broad grepping or reading many files when a task needs architecture context, dependency context, changed-area context, or a focused answer about how code relates.

## Workflow

1. If no graph exists yet and the environment provides `/graphify`, run `/graphify` to generate one.
2. Read `.ai/` memory first so persistent project context can answer low-risk questions cheaply.
3. If `graphify-out/graph.json` exists, prefer focused graphify queries over reading `GRAPH_REPORT.md` end to end.
4. Extract and pass only the relevant subgraph to workers.
5. Use `GRAPH_REPORT.md` only for broad architecture orientation.
6. After graphify narrows the search, read the specific source files needed to verify details.

## Report Back

When graphify materially affects the work, mention the useful query or finding in the handoff, validation report, or plan so the next agent can reuse that context.
