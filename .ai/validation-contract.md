# Validation Contract - Rename AI Commerce → AI VYOM

## Summary
Rename the website brand from "AI Commerce" to "AI VYOM" across all source, config, seed, and documentation files. Includes display text, metadata titles, email template signatures, localStorage keys, custom event names, service names, and package name.

## Classification
- Project type: Branding rename across frontend + infrastructure + docs
- Complexity: low (mechanical string replacement)
- Risk: low (no behavior/logic changes; localStorage key rename resets stored state for existing users — acceptable)

## Dynamic Routing
- Capabilities: frontend, infrastructure, documentation
- Skills: (none required — pure string replacement, no UI/UX design work)
- Dispatch agents: @worker (source/config), @documentation-agent (README)
- Runtime models: opencode-go/kimi-k2.7-code (worker), opencode-go/deepseek-v4-flash (docs)
- Validators/reviewers: @validator Level 1 (quick)

## Features
- Brand rename: "AI Commerce" → "AI VYOM" everywhere

## Acceptance Criteria
- Zero remaining occurrences of "AI Commerce" / "ai-commerce" / "ai commerce" in source, config, seed, and docs (excluding generated graphify-out/ and package-lock.json).
- `npx tsc --noEmit` passes.
- `npm run lint` does not introduce NEW errors beyond the 3 pre-existing known errors.
- Display text, metadata, email signatures, service names, package name, localStorage keys, and custom event names all consistently use "AI VYOM" / "ai-vyom".

## Out Of Scope
- graphify-out/ (generated knowledge graph — regenerated via `graphify update .` later if needed)
- package-lock.json (generated)
- No logic, behavior, schema, or routing changes.
- No new features.

## Agent Packet Constraints
- Files to modify (Dispatch 1 - @worker):
  - package.json
  - kokoro-service/render.yaml
  - kokoro-service/main.py
  - kokoro-service/test_service.py
  - supabase/seed.sql
  - src/app/layout.tsx
  - src/app/loading.tsx
  - src/components/layout/footer.tsx
  - src/components/admin/admin-sidebar.tsx
  - src/components/retailer/retailer-sidebar.tsx
  - src/app/(auth)/signup/page.tsx
  - src/app/api/campaigns/[id]/send/route.ts
  - src/components/notifications/engagement-prompts.tsx
- Files to modify (Dispatch 2 - @documentation-agent):
  - kokoro-service/README.md
- Files to avoid: graphify-out/**, package-lock.json, all other files.
- Relevant memory: PROJECT_REPORT.md (project structure), .ai/current-milestone.md
- Relevant discovery output: grep results listing all 14 source files + README with exact line numbers.

## Branding Replacement Map
- "AI Commerce" (display/metadata text) → "AI VYOM"
- "AI Commerce Team" (email signatures) → "AI VYOM Team"
- "AI Commerce TTS" (service title) → "AI VYOM TTS"
- "AI Commerce Next.js app" → "AI VYOM Next.js app"
- "ai-commerce-tts" (render service name) → "ai-vyom-tts"
- "ai-commerce-tts.onrender.com" → "ai-vyom-tts.onrender.com"
- "ai-commerce-last-prompt" → "ai-vyom-last-prompt"
- "ai-commerce-returning-user" → "ai-vyom-returning-user"
- "ai-commerce:open-bot" → "ai-vyom:open-bot"
- "next-ai-commerce" (package name) → "ai-vyom"
- General rule: every "AI Commerce" → "AI VYOM", every "ai-commerce" → "ai-vyom"

## Validation Plan
- Default: Level 1 quick validation
- Commands: `npx tsc --noEmit`, `npm run lint` (long timeout), `rg -i "ai[\s_-]?commerce" --glob '!graphify-out/**' --glob '!package-lock.json'` (expect zero matches)
- Optional requested validation: none
