# Graph Report - actest  (2026-07-06)

## Corpus Check
- 203 files · ~396,606 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1156 nodes · 2346 edges · 88 communities (72 shown, 16 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 55 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `760a054d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_notification-service.ts|notification-service.ts]]
- [[_COMMUNITY_createServerSupabaseClient|createServerSupabaseClient]]
- [[_COMMUNITY_main.py|main.py]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_utils.ts|utils.ts]]
- [[_COMMUNITY_button.tsx|button.tsx]]
- [[_COMMUNITY_dependencies|dependencies]]
- [[_COMMUNITY_Project Report — AI-Powered E-Commerce Website|Project Report — AI-Powered E-Commerce Website]]
- [[_COMMUNITY_queries.ts|queries.ts]]
- [[_COMMUNITY_requireAdmin|requireAdmin]]
- [[_COMMUNITY_Kokoro TTS Service|Kokoro TTS Service]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_components.json|components.json]]
- [[_COMMUNITY_cn|cn]]
- [[_COMMUNITY_navbar.tsx|navbar.tsx]]
- [[_COMMUNITY_floating-bot.tsx|floating-bot.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_admin-dashboard.tsx|admin-dashboard.tsx]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_Capabilities|Capabilities]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_action-resolver.ts|action-resolver.ts]]
- [[_COMMUNITY_DesignSystemGenerator|DesignSystemGenerator]]
- [[_COMMUNITY_create-product-dialog.tsx|create-product-dialog.tsx]]
- [[_COMMUNITY_design_system.py|design_system.py]]
- [[_COMMUNITY_types.ts|types.ts]]
- [[_COMMUNITY_status-badge.tsx|status-badge.tsx]]
- [[_COMMUNITY__sync_all.py|_sync_all.py]]
- [[_COMMUNITY_use-cart.tsx|use-cart.tsx]]
- [[_COMMUNITY_Validation Contract — AI Website Control Agent|Validation Contract — AI Website Control Agent]]
- [[_COMMUNITY_admin-layout-client.tsx|admin-layout-client.tsx]]
- [[_COMMUNITY_Levels|Levels]]
- [[_COMMUNITY_index.ts|index.ts]]
- [[_COMMUNITY_speech.d.ts|speech.d.ts]]
- [[_COMMUNITY_core.py|core.py]]
- [[_COMMUNITY_Quick Reference|Quick Reference]]
- [[_COMMUNITY_voice-mode.tsx|voice-mode.tsx]]
- [[_COMMUNITY_sheet.tsx|sheet.tsx]]
- [[_COMMUNITY_fly-to-cart.tsx|fly-to-cart.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_AGENTS|AGENTS.md]]
- [[_COMMUNITY_Tech Stack|Tech Stack]]
- [[_COMMUNITY_test_service.py|test_service.py]]
- [[_COMMUNITY_orchestrator|orchestrator.md]]
- [[_COMMUNITY_OpenCode Orchestration v2.2 Architecture|OpenCode Orchestration v2.2 Architecture]]
- [[_COMMUNITY_BM25|BM25]]
- [[_COMMUNITY_UIUX Pro Max - Design Intelligence|UI/UX Pro Max - Design Intelligence]]
- [[_COMMUNITY_use-voice.ts|use-voice.ts]]
- [[_COMMUNITY_Skill Registry|Skill Registry]]
- [[_COMMUNITY_format_ascii_box|format_ascii_box]]
- [[_COMMUNITY_stat-card.tsx|stat-card.tsx]]
- [[_COMMUNITY_Architecture|Architecture]]
- [[_COMMUNITY_Current Milestone|Current Milestone]]
- [[_COMMUNITY_worker|worker.md]]
- [[_COMMUNITY_Migration Notes - v2.2|Migration Notes - v2.2]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_chat-mode.tsx|chat-mode.tsx]]
- [[_COMMUNITY_Browser Manager|Browser Manager]]
- [[_COMMUNITY_Pre-Delivery Checklist|Pre-Delivery Checklist]]
- [[_COMMUNITY_How to Use This Skill|How to Use This Skill]]
- [[_COMMUNITY_logout-button.tsx|logout-button.tsx]]
- [[_COMMUNITY_validator|validator.md]]
- [[_COMMUNITY_Common Rules for Professional UI|Common Rules for Professional UI]]
- [[_COMMUNITY_Example Workflow|Example Workflow]]
- [[_COMMUNITY_ai-recommendations.tsx|ai-recommendations.tsx]]
- [[_COMMUNITY_middleware.ts|middleware.ts]]
- [[_COMMUNITY_Dependency Map|Dependency Map]]
- [[_COMMUNITY_Design Decisions|Design Decisions]]
- [[_COMMUNITY_documentation-agent|documentation-agent.md]]
- [[_COMMUNITY_Self-Audit - OpenCode Orchestration v2.2|Self-Audit - OpenCode Orchestration v2.2]]
- [[_COMMUNITY_SKILL|SKILL.md]]
- [[_COMMUNITY_SKILL|SKILL.md]]
- [[_COMMUNITY_README|README.md]]
- [[_COMMUNITY_opencode.json|opencode.json]]
- [[_COMMUNITY_dependencies|dependencies]]
- [[_COMMUNITY_api-contracts|api-contracts.md]]
- [[_COMMUNITY_coding-standards|coding-standards.md]]
- [[_COMMUNITY_database-schema|database-schema.md]]
- [[_COMMUNITY_directory-map|directory-map.md]]
- [[_COMMUNITY_known-bugs|known-bugs.md]]
- [[_COMMUNITY_eslint.config.mjs|eslint.config.mjs]]
- [[_COMMUNITY_start.sh|start.sh]]
- [[_COMMUNITY_next.config.ts|next.config.ts]]
- [[_COMMUNITY_postcss.config.mjs|postcss.config.mjs]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 92 edges
2. `createServerSupabaseClient()` - 76 edges
3. `requireAdmin()` - 46 edges
4. `Button()` - 45 edges
5. `getCurrentUser()` - 44 edges
6. `Product` - 29 edges
7. `Badge()` - 18 edges
8. `Project Report — AI-Powered E-Commerce Website` - 17 edges
9. `compilerOptions` - 16 edges
10. `useCart()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `_generate_intelligent_overrides()` --calls--> `search()`  [INFERRED]
  .opencode/skills/ui-ux-pro-max/scripts/design_system.py → .opencode/skills/ui-ux-pro-max/scripts/core.py
- `CampaignDetailPage()` --calls--> `NotFound()`  [INFERRED]
  src/app/admin/campaigns/[id]/page.tsx → src/app/not-found.tsx
- `CampaignDetailPage()` --calls--> `requireAdmin()`  [INFERRED]
  src/app/admin/campaigns/[id]/page.tsx → src/lib/auth/supabase-auth.ts
- `OrderDetailPage()` --calls--> `NotFound()`  [INFERRED]
  src/app/admin/orders/[id]/page.tsx → src/app/not-found.tsx
- `OrdersAdminPage()` --calls--> `requireAdmin()`  [INFERRED]
  src/app/admin/orders/page.tsx → src/lib/auth/supabase-auth.ts

## Import Cycles
- None detected.

## Communities (88 total, 16 thin omitted)

### Community 0 - "notification-service.ts"
Cohesion: 0.06
Nodes (53): buildNavigateToActions(), extractDistinctiveKeywords(), findCategory(), findProduct(), findProductByName(), findProductByOrdinal(), hasAddToCartIntent(), hasClearCartIntent() (+45 more)

### Community 1 - "createServerSupabaseClient"
Cohesion: 0.07
Nodes (27): NotificationChannel, NotificationStatus, NotificationType, CartAbandonmentEmail(), CartAbandonmentEmailProps, DeliveryUpdateEmail(), DeliveryUpdateEmailProps, statusColor (+19 more)

### Community 2 - "main.py"
Cohesion: 0.08
Nodes (41): BaseModel, FastAPI, _check_espeak(), _client_ip(), _get_device(), health(), HealthResponse, lifespan() (+33 more)

### Community 3 - "route.ts"
Cohesion: 0.10
Nodes (30): CampaignForm(), SEGMENT_OPTIONS, stripHtml(), channelOptions, typeOptions, OrderDetailClient(), statusOrder, OrdersTableProps (+22 more)

### Community 4 - "utils.ts"
Cohesion: 0.10
Nodes (27): AdminLayoutClient(), AdminLayoutClientProps, NavbarProps, navLinks, cn(), DialogOverlay(), DropdownMenu(), DropdownMenuCheckboxItem() (+19 more)

### Community 5 - "button.tsx"
Cohesion: 0.13
Nodes (25): getCurrentUser(), getUserProfile(), requireAuth(), DELETE(), GET(), PATCH(), POST(), POST() (+17 more)

### Community 6 - "dependencies"
Cohesion: 0.06
Nodes (35): dependencies, @base-ui/react, class-variance-authority, clsx, framer-motion, lucide-react, next, next-themes (+27 more)

### Community 7 - "Project Report — AI-Powered E-Commerce Website"
Cohesion: 0.07
Nodes (27): 10. Frontend Architecture, 11. Admin Panel (`src/app/admin/`), 12. Kokoro TTS Service (`kokoro-service/`), 13. Recent Fixes Applied (Session History), 14. How to Run, 15. Known Issues / Notes, 16. Key Files Quick Reference, 1. What This Project Is (+19 more)

### Community 8 - "queries.ts"
Cohesion: 0.07
Nodes (27): VisibleProduct, inter, metadata, RootLayout(), spaceGrotesk, FloatingBot(), FlyToCartContext, FlyToCartContextValue (+19 more)

### Community 9 - "requireAdmin"
Cohesion: 0.08
Nodes (24): AdminDashboard(), AdminDashboardProps, generateSparkline(), RevenueChart(), RevenueChartProps, OrderStatusBadge(), orderStatusStyles, returnStatusStyles (+16 more)

### Community 10 - "Kokoro TTS Service"
Cohesion: 0.08
Nodes (24): API Documentation, Cold starts / first request is slow, CUDA errors, Deploy to Render (Docker), Deploy to Render (Native Python), Environment Variables, `espeak-ng` not found, Features (+16 more)

### Community 11 - "route.ts"
Cohesion: 0.10
Nodes (26): StatusBadgeProps, NotFound(), OrderConfirmationPage(), OrderConfirmationPageProps, getOrderById(), getReturnById(), getReturnsByOrderId(), getReturnsByUser() (+18 more)

### Community 12 - "route.ts"
Cohesion: 0.13
Nodes (21): CartDrawer(), useFlyToCart(), CartPage(), CheckoutPage(), CartItem, Product, CartContext, CartContextValue (+13 more)

### Community 13 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 14 - "cn"
Cohesion: 0.12
Nodes (23): CampaignCard(), CampaignCardProps, SEGMENT_LABELS, CampaignDetailClient(), CampaignDetailClientProps, SEGMENT_LABELS, CampaignFormProps, CampaignList() (+15 more)

### Community 15 - "navbar.tsx"
Cohesion: 0.16
Nodes (16): CreateProductDialogProps, SEGMENT_LABELS, SendResult, LogoutButton(), createClient(), LoginPage(), SignupPage(), Button() (+8 more)

### Community 16 - "floating-bot.tsx"
Cohesion: 0.10
Nodes (21): stripMarkdown(), ChatMode(), ChatModeProps, Message, SUGGESTED_PROMPTS, markdownComponents, MessageBubble(), MessageBubbleProps (+13 more)

### Community 17 - "page.tsx"
Cohesion: 0.12
Nodes (20): AdminLayout(), ReturnsTable(), requireAdmin(), CampaignsAdminPage(), GET(), POST(), VALID_SEGMENTS, POST() (+12 more)

### Community 18 - "admin-dashboard.tsx"
Cohesion: 0.14
Nodes (20): AdminSidebar(), AdminSidebarProps, NavItem, navItems, OrderDetailClientProps, ReturnDetailClientProps, ReturnsTableProps, StatusFilter (+12 more)

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 20 - "Capabilities"
Cohesion: 0.13
Nodes (20): NotificationsList(), OrdersTable(), AdminDashboardData(), AdminPage(), createNotification(), createReturn(), getAbandonedCarts(), getAdminStats() (+12 more)

### Community 21 - "layout.tsx"
Cohesion: 0.18
Nodes (18): deleteCampaign(), getCampaignById(), getCampaignNotifications(), getEmailTemplateById(), getUsersBySegment(), updateCampaign(), CampaignDetailPage(), CampaignDetailPageProps (+10 more)

### Community 22 - "action-resolver.ts"
Cohesion: 0.11
Nodes (18): ai, api, backend, Capabilities, Capability Addition Template, Capability Registry, database, devops (+10 more)

### Community 23 - "DesignSystemGenerator"
Cohesion: 0.15
Nodes (18): ansi_ljust(), format_ascii_box(), format_markdown(), format_master_md(), format_page_override_md(), generate_design_system(), hex_to_ansi(), persist_design_system() (+10 more)

### Community 24 - "create-product-dialog.tsx"
Cohesion: 0.16
Nodes (9): DesignSystemGenerator, Select best matching result based on priority keywords., Extract results list from search result dict., Generate complete design system recommendation., Generates design system recommendations from aggregated searches., Load reasoning rules from CSV., Execute searches across multiple domains., Find matching reasoning rule for a category. (+1 more)

### Community 25 - "design_system.py"
Cohesion: 0.29
Nodes (13): blend(), derive_row(), derive_ui_reasoning(), h2r(), is_dark(), lum(), on_color(), r2h() (+5 more)

### Community 26 - "types.ts"
Cohesion: 0.22
Nodes (11): AnalyzeRequestBody, getDefaultAnalysis(), parseAnalysisResponse(), POST(), ReturnAnalysis, ReturnConfidence, ReturnResolution, AIAnalysisCard() (+3 more)

### Community 27 - "status-badge.tsx"
Cohesion: 0.17
Nodes (11): Approval Gate, Browser Validation, Default, Level 0 - No Validation, Level 1 - Quick Validation, Level 2 - Standard Validation, Level 3 - Advanced Validation, Level 4 - Release Validation (+3 more)

### Community 28 - "_sync_all.py"
Cohesion: 0.25
Nodes (10): detect_domain(), _load_csv(), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, Main search function with auto-domain detection, Search stack-specific guidelines, search() (+2 more)

### Community 29 - "use-cart.tsx"
Cohesion: 0.27
Nodes (4): ttsService, KokoroTTSService, TTSRequestBody, TTSService

### Community 30 - "Validation Contract — AI Website Control Agent"
Cohesion: 0.15
Nodes (12): Acceptance Criteria, Agent Packet Constraints, Classification, Dynamic Routing, Features, Out Of Scope, Shared, Summary (+4 more)

### Community 31 - "admin-layout-client.tsx"
Cohesion: 0.18
Nodes (11): 10. Charts & Data (LOW), 1. Accessibility (CRITICAL), 2. Touch & Interaction (CRITICAL), 3. Performance (HIGH), 4. Style Selection (HIGH), 5. Layout & Responsive (HIGH), 6. Typography & Color (MEDIUM), 7. Animation (MEDIUM) (+3 more)

### Community 32 - "Levels"
Cohesion: 0.22
Nodes (8): Approval Gate, Clarification Gate, Completion, Context Rules, Dispatch, Dynamic Mission Planning, Startup Budget, Validation Contract

### Community 33 - "index.ts"
Cohesion: 0.22
Nodes (8): Agent Set, Mission Flow, OpenCode Orchestration v2.2 Architecture, Production Readiness Checklist, Registries And Policy, Summary, Token Efficiency, Why This Shape

### Community 34 - "speech.d.ts"
Cohesion: 0.28
Nodes (5): BM25, BM25 ranking algorithm for text search, Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query

### Community 35 - "core.py"
Cohesion: 0.22
Nodes (8): SpeechRecognition, SpeechRecognitionAlternative, SpeechRecognitionConstructor, SpeechRecognitionErrorEvent, SpeechRecognitionEvent, SpeechRecognitionResult, SpeechRecognitionResultList, Window

### Community 36 - "Quick Reference"
Cohesion: 0.22
Nodes (8): Available Domains, Available Stacks, How to Use, Output Formats, Prerequisites, Rule Categories by Priority, Search Reference, UI/UX Pro Max - Design Intelligence

### Community 37 - "voice-mode.tsx"
Cohesion: 0.32
Nodes (6): CampaignFormData, CreateCampaignClient(), CreateCampaignClientProps, CreateCampaignPage(), getEmailTemplates(), CampaignSegment

### Community 38 - "sheet.tsx"
Cohesion: 0.29
Nodes (5): CountUp(), CountUpProps, colorStyles, StatCardProps, StatColor

### Community 39 - "fly-to-cart.tsx"
Cohesion: 0.25
Nodes (7): graphify, handoff, Registry Rules, Skill Addition Template, Skill Registry, Skills, ui-ux-pro-max

### Community 40 - "page.tsx"
Cohesion: 0.33
Nodes (6): CreateProductDialog(), ProductsTable(), Home(), getCategories(), ProductsAdminPage(), ProductsPage()

### Community 41 - "AGENTS.md"
Cohesion: 0.22
Nodes (7): Core Workflow, graphify, Model Routing, Project Status, Required Policy Files, Token Efficiency Rules, Web Research

### Community 42 - "Tech Stack"
Cohesion: 0.22
Nodes (8): AI, Build & Package, Database & Auth, Deployment, Email, Framework, Tech Stack, Voice

### Community 43 - "test_service.py"
Cohesion: 0.50
Nodes (8): main(), Simple integration test for the Kokoro TTS service.  Run the service first (e.g., test_health(), test_stream(), test_synthesize(), test_voices(), test_warm(), _url()

### Community 44 - "orchestrator.md"
Cohesion: 0.29
Nodes (6): Capability Activation, Context Rules, Handoff, Implementation Rules, Quick Validation, Required Inputs

### Community 45 - "OpenCode Orchestration v2.2 Architecture"
Cohesion: 0.29
Nodes (6): Current Routing, How To Add A Capability, How To Add A Skill, How To Change Models, Migration Notes - v2.2, What Changed

### Community 46 - "BM25"
Cohesion: 0.33
Nodes (5): Browser Manager, Detection Checklist, Report Fields, Responsibilities, Validator Behavior

### Community 47 - "UI/UX Pro Max - Design Intelligence"
Cohesion: 0.33
Nodes (6): Accessibility, Interaction, Layout, Light/Dark Mode, Pre-Delivery Checklist, Visual Quality

### Community 48 - "use-voice.ts"
Cohesion: 0.33
Nodes (6): How to Use This Skill, Step 1: Analyze User Requirements, Step 2: Generate Design System (REQUIRED), Step 2b: Persist Design System (Master + Overrides Pattern), Step 3: Supplement with Detailed Searches (as needed), Step 4: Stack Guidelines (match your framework)

### Community 49 - "Skill Registry"
Cohesion: 0.50
Nodes (4): ReturnDetailClient(), getReturnByIdAdmin(), ReturnDetailPage(), ReturnDetailPageProps

### Community 50 - "format_ascii_box"
Cohesion: 0.40
Nodes (4): Browser Rules, Report, Required Inputs, Scope Options

### Community 51 - "stat-card.tsx"
Cohesion: 0.40
Nodes (5): Common Rules for Professional UI, Icons & Visual Elements, Interaction (App), Layout & Spacing, Light/Dark Mode Contrast

### Community 52 - "Architecture"
Cohesion: 0.29
Nodes (6): Architecture, Key Directories, Module Structure, Primary Architecture, Principles, System Overview

### Community 53 - "Current Milestone"
Cohesion: 0.29
Nodes (6): Architecture, Current Milestone, Goal, Milestone, Status, Tech Stack

### Community 54 - "worker.md"
Cohesion: 0.40
Nodes (5): Example Workflow, Step 1: Analyze Requirements, Step 2: Generate Design System (REQUIRED), Step 3: Supplement with Detailed Searches (as needed), Step 4: Stack Guidelines

### Community 55 - "Migration Notes - v2.2"
Cohesion: 0.50
Nodes (3): Report, Required Inputs, Review Criteria

### Community 56 - "page.tsx"
Cohesion: 0.50
Nodes (3): Handoff, Required Inputs, Rules

### Community 57 - "chat-mode.tsx"
Cohesion: 0.50
Nodes (3): Handoff, Required Inputs, Rules

### Community 59 - "Pre-Delivery Checklist"
Cohesion: 0.50
Nodes (3): Requirement Checklist, Runtime Note, Self-Audit - OpenCode Orchestration v2.2

### Community 60 - "How to Use This Skill"
Cohesion: 0.50
Nodes (3): Report Back, When To Use, Workflow

### Community 61 - "logout-button.tsx"
Cohesion: 0.50
Nodes (3): Required Handoff Format, Rules, What This Skill Does

### Community 62 - "validator.md"
Cohesion: 0.50
Nodes (4): _detect_page_type(), _generate_intelligent_overrides(), Generate intelligent overrides based on page type using layered search., Detect page type from context and search results.

### Community 63 - "Common Rules for Professional UI"
Cohesion: 0.50
Nodes (4): Common Sticking Points, Pre-Delivery Checklist, Query Strategy, Tips for Better Results

### Community 64 - "Example Workflow"
Cohesion: 0.50
Nodes (4): Must Use, Recommended, Skip, When to Apply

### Community 66 - "middleware.ts"
Cohesion: 0.40
Nodes (3): authRoutes, config, protectedRoutes

### Community 67 - "Dependency Map"
Cohesion: 0.50
Nodes (3): Dependency Map, Orchestration Dependencies, Runtime Dependencies

### Community 68 - "Design Decisions"
Cohesion: 0.50
Nodes (3): Design Decisions, Orchestration v2.2, Rationale

### Community 77 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 79 - "opencode.json"
Cohesion: 0.50
Nodes (3): lsp, plugin, $schema

## Knowledge Gaps
- **409 isolated node(s):** `$schema`, `lsp`, `plugin`, `@opencode-ai/plugin`, `$schema` (+404 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Button()` connect `navbar.tsx` to `notification-service.ts`, `route.ts`, `utils.ts`, `voice-mode.tsx`, `queries.ts`, `requireAdmin`, `route.ts`, `route.ts`, `cn`, `floating-bot.tsx`, `admin-dashboard.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `cn()` connect `utils.ts` to `route.ts`, `sheet.tsx`, `requireAdmin`, `route.ts`, `route.ts`, `cn`, `navbar.tsx`, `Skill Registry`, `admin-dashboard.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `createServerSupabaseClient()` connect `button.tsx` to `notification-service.ts`, `createServerSupabaseClient`, `voice-mode.tsx`, `page.tsx`, `route.ts`, `cn`, `page.tsx`, `Skill Registry`, `Capabilities`, `layout.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `createServerSupabaseClient()` (e.g. with `DELETE()` and `PATCH()`) actually correct?**
  _`createServerSupabaseClient()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `requireAdmin()` (e.g. with `CampaignDetailPage()` and `OrdersAdminPage()`) actually correct?**
  _`requireAdmin()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `getCurrentUser()` (e.g. with `OrdersPage()` and `ReturnsPage()`) actually correct?**
  _`getCurrentUser()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `lsp`, `plugin` to the rest of the system?**
  _456 weakly-connected nodes found - possible documentation gaps or missing edges._