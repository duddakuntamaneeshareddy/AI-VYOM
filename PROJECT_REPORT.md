# Project Report — AI VYOM (AI-Powered E-Commerce Website)

> **Purpose:** This document gives any new agent (or developer) a complete understanding of the project: what it is, how it's built, where everything lives, and how the pieces connect. Read this first before making changes.

---

## 1. What This Project Is

**AI VYOM** is a **full-stack AI-powered e-commerce website** built as a **college mini project**. It has 9 compulsory AI features, a customer-facing storefront, a retailer portal, and an admin panel. The marketplace model lets retailers own and manage their own products while customers shop across all retailers. The home page (`/`) is now a role-selection landing page that routes visitors to either the customer storefront or the retailer portal. The design goal is a "100k dollar website" feel — bold minimal premium with bento grids, glassmorphism, and smooth motion.

### The 9 AI Features

| # | Feature | Where it lives | Depth |
|---|---------|----------------|-------|
| 1 | Cart abandonment follow-up | Notification system + email templates | Functional |
| 2 | Order tracking assistant | Floating AI bot (order_tracking intent) | Deep |
| 3 | Return/refund support | Returns pages + AI analysis API | Deep |
| 4 | Product recommendations | Floating AI bot (recommendation intent) + product detail page | Deep |
| 5 | Customer retention campaigns | Admin campaigns + email | Functional |
| 6 | Voice commerce assistant | Floating AI bot voice mode (STT→AI→TTS) | Deep |
| 7 | Inventory enquiry | Floating AI bot (inventory intent) | Functional |
| 8 | Delivery status notifications | Notification system + email | Functional |
| 9 | Retail customer engagement bot | Floating AI bot (general + cart intent) + engagement prompts | Functional |

**Path B strategy:** 4 deep features (order tracking, returns, recommendations, voice), 5 functional-but-simple.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Database + Auth | Supabase (PostgreSQL + Auth) |
| AI / LLM | NVIDIA NIM (build.nvidia.com API) — model: `meta/llama-3.1-8b-instruct` |
| TTS | Kokoro (Python FastAPI service, deployed on Render) |
| STT | Web Speech API (browser-native, no backend) |
| Email | Resend (`onboarding@resend.dev` for demo) |
| UI | Tailwind CSS 4 + shadcn/ui + Framer Motion |
| Style | Bold Minimal Premium (bento grid, glassmorphism, bold typography) |
| Deployment | Vercel (frontend) + Render (Kokoro TTS) — free tiers only |

---

## 3. Environment Variables (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://ujjqydaftazpxfcgeida.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NVIDIA_API_KEY=nvapi-...
NVIDIA_MODEL=meta/llama-3.1-8b-instruct
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
RESEND_API_KEY=re_...
KOKORO_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 4. Project Structure

```
actest/
├── src/
│   ├── app/                      # Next.js App Router pages + API routes
│   │   ├── (auth)/               # Auth layout group (login, signup)
│   │   ├── admin/                # Admin panel (dashboard, orders, products, returns, campaigns, notifications)
│   │   ├── api/                  # API routes (see section 6)
│   │   │   ├── products/[id]/reviews/  # Product reviews API
│   │   │   ├── retailer/         # Retailer products, orders, upload API
│   │   │   └── profile/          # Profile role API
│   │   ├── auth/                 # Auth callback
│   │   ├── cart/                 # Cart page
│   │   ├── checkout/             # Checkout page
│   │   ├── orders/               # Orders list + detail + confirmation
│   │   ├── products/             # Products list + detail
│   │   ├── retailer/             # Retailer portal: layout, page, products/, products/new/, orders/
│   │   ├── returns/              # Returns list + detail + new return form
│   │   ├── shop/                 # Customer storefront entry (hero + categories + featured grid)
│   │   ├── layout.tsx            # Root layout (providers, RouteShell wraps navbar/footer, floating bot)
│   │   ├── page.tsx              # Landing page (Customer/Retailer entry, no navbar)
│   │   ├── template.tsx          # Page transition wrapper
│   │   ├── loading.tsx           # Global loading state
│   │   ├── not-found.tsx         # 404 page
│   │   └── globals.css           # Tailwind + custom styles (glass-card, surface-bento, scrollbar)
│   ├── components/
│   │   ├── admin/                # 20 admin components (tables, forms, charts, dialogs)
│   │   ├── auth/                 # Login/signup forms
│   │   ├── bot/                  # Floating AI bot (chat-mode, voice-mode, message-bubble, voice-orb, floating-bot)
│   │   ├── cart/                 # Cart drawer + fly-to-cart animation
│   │   ├── email/                # Email template React components
│   │   ├── home/                 # Home page sections (hero)
│   │   ├── layout/               # Navbar + Footer + route-shell.tsx (gating wrapper)
│   │   ├── notifications/        # Notification bell + toast + engagement prompts
│   │   ├── orders/               # Order components
│   │   ├── product/              # Product cards + add-to-cart + product-detail-content.tsx
│   │   ├── retailer/             # Retailer portal components (retailer-layout-client, retailer-sidebar, retailer-dashboard)
│   │   ├── returns/              # Return form + status badges + timeline
│   │   ├── providers.tsx         # Client providers wrapper (Cart, Theme, Toast)
│   │   └── ui/                   # shadcn/ui primitives (button, input, sheet, etc.)
│   ├── hooks/
│   │   ├── use-cart.tsx          # Cart context (optimistic updates, clearCart)
│   │   └── use-voice.ts          # Voice hook (listen→think→speak→idle)
│   ├── lib/
│   │   ├── ai/                   # AI layer (see section 5)
│   │   ├── auth/                 # Supabase auth helpers (getCurrentUser, requireRetailer)
│   │   ├── db/                   # Supabase clients + queries + types + supabase-service.ts (service-role client)
│   │   ├── email/                # Email service abstraction (EmailService interface + Resend impl)
│   │   ├── notifications/        # Notification service
│   │   ├── stt/                  # Speech-to-text (Web Speech API wrapper)
│   │   ├── tts/                  # Text-to-speech (TTSService interface + Kokoro impl)
│   │   └── utils.ts              # cn() class merge helper
│   ├── middleware.ts             # Route protection (admin/orders/checkout/cart require auth)
│   └── types/                    # Global types
├── supabase/
│   ├── migrations/
│   │   ├── 001_init.sql          # Full DB schema + RLS + triggers
│   │   └── 002_product_detail_and_reviews.sql  # Product details, specs, reviews, retailer role, retailer RLS
│   └── seed.sql                  # 15 products with detailed descriptions/specs + 3 email templates
├── kokoro-service/               # Python FastAPI TTS service (deploy to Render)
│   ├── main.py                   # /synthesize, /warm, /voices, /synthesize/stream
│   ├── Dockerfile
│   ├── render.yaml
│   └── requirements.txt
├── .opencode/                    # OpenCode Orchestration config (agents, skills, policies)
├── .ai/                          # Project memory (current-milestone.md)
├── package.json
├── next.config.ts
├── tsconfig.json
└── tailwind config (in globals.css via Tailwind 4)
```

---

## 5. AI Layer (`src/lib/ai/`)

This is the heart of the AI features. All files are server-side only.

| File | Purpose |
|------|---------|
| `provider.ts` | `AIProvider` interface — `chat()` + `stream()` methods. Swappable. |
| `nvidia.ts` | NVIDIA NIM implementation. Handles chat + SSE streaming. Has a stateful `createStreamCleaner()` that strips `<think>`/`<thinking>` tags across chunk boundaries. |
| `index.ts` | Exports `aiProvider` (singleton `NvidiaNIMProvider` instance). |
| `prompts.ts` | System prompts per intent. Intents: `general`, `order_tracking`, `recommendation`, `inventory`, `return_refund`, `cart`. Each prompt has `{{CONTEXT}}` placeholder. |
| `intent-router.ts` | `detectIntent(message)` — keyword-based scoring. `extractEntities(message)` — pulls order IDs (UUIDs), product names (quoted), categories, budgets. |
| `context-builder.ts` | `buildContext(intent, userId, entities)` — fetches real-time data from DB: orders, cart contents, product catalog, stock. Called fresh per AI request. Also `buildProductContext(productId)` for product detail recommendations. |
| `action-resolver.ts` | Tier 1 deterministic action resolver (navigate, open product, open/add/remove cart, clear cart, list products) and Tier 2 screen awareness. |
| `types.ts` | Type definitions for AI actions and payloads. |
| `strip-markdown.ts` | Utility to strip markdown before sending to TTS. |

### Action Resolver Flow & Page Context

The AI uses a Tier 1 deterministic action resolver to control the website (navigate, open product, open/add/remove cart, clear cart, list products). It also features Tier 2 screen awareness, utilizing `use-page-context.tsx` to inform the AI about currently visible products on the user's screen.

### AI Request Flow

```
User message
  → /api/ai/chat (non-stream) OR /api/ai/stream (SSE stream)
    → detectIntent(message)           # pick intent by keywords
    → extractEntities(message)        # pull order IDs, product names, etc.
    → buildContext(intent, userId, entities)  # fetch REAL-TIME cart + orders + products from DB
    → PROMPTS_BY_INTENT[intent].replace('{{CONTEXT}}', context)  # build system prompt
    → aiProvider.chat(messages) or aiProvider.stream(messages)   # call NVIDIA NIM
    → cleanResponse (chat) or createStreamCleaner (stream)       # strip think tags
    → return response
```

### Intents

| Intent | Keywords (sample) | Context fetched |
|--------|-------------------|-----------------|
| `cart` | cart, my cart, remove, added, checkout | Real-time cart contents |
| `order_tracking` | track, order, shipment, where is | User's recent orders |
| `recommendation` | recommend, suggest, best, gift | Filtered products + FULL catalog + cart |
| `inventory` | stock, available, how many, restock | Product stock levels |
| `return_refund` | return, refund, exchange, damaged | User's recent orders |
| `general` | (fallback) | Cart + full catalog (if logged in) |

**Key point:** The cart context is fetched fresh on EVERY AI request, so the AI always knows the current cart state. The `cart` prompt explicitly tells the LLM to trust the real-time context over chat history.

---

## 6. API Routes (`src/app/api/`)

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/ai/chat` | POST | Non-streaming AI chat (returns full response). Unauthenticated users receive only "Please log in first." |
| `/api/ai/stream` | POST | SSE streaming AI chat (progressive token display). Unauthenticated users receive only "Please log in first." as a single SSE event |
| `/api/ai/recommend` | POST | Product recommendations for product detail page |
| `/api/ai/voice-log` | POST | Log voice conversation metadata |
| `/api/cart` | GET, POST, PATCH, DELETE | Cart CRUD (DELETE uses ?itemId query param) |
| `/api/cart/[itemId]` | DELETE | Delete cart item by ID |
| `/api/checkout` | POST | Place order (creates order + order_items, clears cart) |
| `/api/orders/[id]/status` | PATCH | Update order status (admin) |
| `/api/returns` | GET, POST | List/create returns |
| `/api/returns/[id]` | GET, PATCH | Get/update return by ID |
| `/api/returns/analyze` | POST | AI analysis of return reason |
| `/api/notifications` | GET | List notifications |
| `/api/notifications/[id]` | PATCH | Mark notification read |
| `/api/notifications/cart-abandonment` | POST | Trigger cart abandonment notification |
| `/api/notifications/delivery` | POST | Trigger delivery notification |
| `/api/notifications/engagement` | POST | Trigger engagement notification |
| `/api/campaigns` | GET, POST | List/create campaigns |
| `/api/campaigns/[id]` | GET, PATCH, DELETE | Campaign CRUD |
| `/api/products` | GET, POST | List/create products (admin) |
| `/api/products/[id]` | PATCH | Update product (admin, stock editing) |
| `/api/products/[id]/reviews` | GET, POST | Product reviews (public GET, auth POST with rating 1-5 + comment) |
| `/api/retailer/products` | GET, POST | Retailer's products (retailer role) |
| `/api/retailer/orders` | GET | Orders containing retailer's products (retailer role) |
| `/api/retailer/upload` | POST | Retailer image upload to Supabase Storage (retailer role) |
| `/api/profile/role` | PATCH | Set current user's role to customer/retailer (never admin) |
| `/api/tts` | POST | TTS proxy to Kokoro service (returns audio blob) |

---

## 7. Database Schema (`supabase/migrations/`)

12 tables, all with RLS enabled:

| Table | Purpose | Key columns |
|-------|---------|-------------|
| `profiles` | Extends `auth.users` | id, email, full_name, role (`customer` / `admin` / `retailer`) |
| `products` | Product catalog | name, price, category, image_url, stock, tags[], description, specifications (jsonb), retailer_id |
| `product_reviews` | Product reviews | id, product_id, user_id, rating (SMALLINT 1-5), comment, created_at, updated_at |
| `orders` | Orders | user_id, status, total, shipping_address (jsonb) |
| `order_items` | Order line items | order_id, product_id, quantity, price_at_purchase |
| `cart` | Shopping cart | user_id, product_id, quantity |
| `returns` | Return requests | order_id, order_item_id, reason, ai_analysis (jsonb), status |
| `notifications` | In-app + email notifications | user_id, type, channel, content (jsonb), status |
| `email_templates` | Email templates | name, subject, body, type |
| `campaigns` | Marketing campaigns | name, template_id, target_segment, status |
| `chat_logs` | AI conversation logs | user_id, mode (text/voice), messages (jsonb) |
| `voice_logs` | Voice conversation metadata | chat_log_id, duration_seconds, stt_text |

**RLS:** `is_admin()` and `is_retailer()` SECURITY DEFINER functions prevent recursion. Users access only their own data; admins access all; retailers can INSERT/UPDATE/DELETE their own products via `retailer_id = auth.uid()`. Products and product reviews are publicly readable.

**Trigger:** `handle_new_user()` auto-creates a profile on signup.

**Migrations:** `001_init.sql` creates the initial schema; `002_product_detail_and_reviews.sql` adds descriptions, specifications, reviews, the retailer role, retailer product-management policies, and backfills the 15 existing products.

**Seed:** `supabase/seed.sql` — 15 products with detailed descriptions and specifications (brand, SKU, weight, dimensions, material, color, warranty) across categories, plus 3 email templates.

**Realtime:** Supabase Realtime is intentionally NOT enabled on `product_reviews` (free-tier constraint). Reviews fetch on page load and update after a browser refresh.

---

## 8. Service Abstractions (Swappable)

All three external services have interface-based abstractions so implementations can be swapped:

### Email (`src/lib/email/`)
- `EmailService` interface — `send(params): Promise<EmailResult>`
- `ResendEmailService` implementation
- Swap by implementing the interface

### AI (`src/lib/ai/`)
- `AIProvider` interface — `chat()` + `stream()`
- `NvidiaNIMProvider` implementation
- Swap by implementing the interface and changing `index.ts`

### TTS (`src/lib/tts/`)
- `TTSService` interface — `synthesize(text, voice?, signal?): Promise<ArrayBuffer>`
- `KokoroTTSService` implementation
- Swap by implementing the interface

---

## 9. Voice Commerce Flow (STT → AI → TTS)

```
User taps mic (voice-mode.tsx)
  → useVoice hook starts Web Speech API recognition (web-speech.ts)
  → User speaks → transcript captured
  → onTranscript callback → calls onSend(text) from floating-bot
  → /api/ai/chat processes the text (same as text mode)
  → AI response returned
  → useVoice.speak(response) → POST /api/tts → Kokoro service → audio blob
  → Audio plays via HTMLAudioElement
  → If Kokoro fails → fallback to browser SpeechSynthesis
  → Optional auto-loop: listen again after speaking
```

The voice orb (`voice-orb.tsx`) animates based on state: idle / listening / thinking / speaking.

---

## 10. Frontend Architecture

### State Management
- **Cart:** `CartProvider` in `use-cart.tsx` — React Context with optimistic updates. Exposes `items`, `cartCount`, `cartTotal`, `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`, `refreshCart`.
- **Auth:** Supabase SSR auth via cookies. `getCurrentUser()` server helper.
- **Theme:** `next-themes` (dark/light).
- **Toasts:** `sonner`.

### Routing Protection (`middleware.ts`)
- `/retailer/**` — requires `retailer` role
- `/shop`, `/cart`, `/checkout`, `/orders`, `/returns` — require login
- `/admin/**` — requires `admin` role
- `/login`, `/signup` — redirect authenticated users away (to `/shop`, `/retailer`, or `/admin` by role)
- API routes are NOT matched by middleware

### Navbar Gating
Navbar and footer are hidden on the landing page (`/`), auth pages (`/login`, `/signup`), and retailer portal pages (`/retailer/**`) via the client `RouteShell` wrapper (`src/components/layout/route-shell.tsx`) that checks `usePathname()`. The floating AI bot remains global and is server-gated: unauthenticated visitors receive only "Please log in first." before any intent detection or NVIDIA call.

### Landing Page
`/` is a pure role-selection landing page with two glass bento entry cards: Customer → `/shop`, Retailer → `/retailer`. It has no navbar and no footer.

### UI System
- shadcn/ui primitives in `src/components/ui/`
- Custom: `glass-card`, `surface-bento` classes in `globals.css`
- Framer Motion for page transitions (`template.tsx`), scroll reveal, fly-to-cart, magnetic buttons
- Custom scrollbar styling

---

## 11. Admin Panel (`src/app/admin/`)

Interactive but mostly static (per project constraints):
- **Dashboard:** stat cards (count-up animation), revenue chart
- **Orders:** table + detail view, status updates
- **Products:** table with stock editing, create product dialog
- **Returns:** table + detail with AI analysis
- **Campaigns:** list, create, send dialog
- **Notifications:** list view

Admin layout uses a sidebar (`admin-sidebar.tsx`). Admin access controlled by `role = 'admin'` in profiles + RLS.

---

## 11b. Retailer Portal (`src/app/retailer/`)

A dedicated retailer workspace gated by `role = 'retailer'` in profiles, `requireRetailer()` server checks, and RLS policies. Each retailer owns products via `products.retailer_id` and sees only orders that contain their products.

- **Layout:** Sidebar layout (`retailer-layout-client.tsx` + `retailer-sidebar.tsx`) shared across `/retailer/**`.
- **Dashboard (`/retailer`)**: Stat cards with count-up animation, low-stock alerts, recent orders preview.
- **Products (`/retailer/products`)**: Retailer's own product list with stock warnings.
- **Add Product (`/retailer/products/new`)**: Form with single image upload to the Supabase Storage `product-images` bucket, title, in-depth description, price, category, stock, tags, and a dynamic key-value specifications editor with preset rows (brand, SKU, weight, dimensions, material, color, warranty). Submits via `/api/retailer/upload` then `POST /api/retailer/products`.
- **Orders (`/retailer/orders`)**: Orders containing the retailer's products, showing customer name/email, items, quantities, and status.

The marketplace model is additive: existing public product browsing and admin product management remain unchanged.

---

## 12. Kokoro TTS Service (`kokoro-service/`)

Separate Python FastAPI service for text-to-speech:
- `main.py` — endpoints: `/synthesize`, `/synthesize/stream`, `/warm`, `/voices`
- CORS enabled, GZIP, rate limiting
- Deploy to Render via `render.yaml` + `Dockerfile`
- Called by Next.js `/api/tts` route as a proxy
- Local dev: run on `http://localhost:8000`

---

## 13. Recent Fixes Applied (Session History)

These were fixed in the current session — a new agent should know they're done:

1. **AI streaming wired up** — `floating-bot.tsx` now uses `/api/ai/stream` (SSE) instead of `/api/ai/chat` for progressive text display.
2. **Markdown rendering** — `message-bubble.tsx` now uses `react-markdown` so `**bold**`, `` `code` ``, lists render properly instead of showing raw characters.
3. **Stream think-tag cleaner** — `nvidia.ts` `stream()` uses a stateful cleaner (`createStreamCleaner`) that strips `<think>`/`<thinking>` tags across chunk boundaries instead of per-chunk regex.
4. **Cart cleared after checkout** — `checkout/page.tsx` calls `clearCart()` after successful order.
5. **Cart optimistic updates** — `use-cart.tsx` removes/updates items instantly in UI state, no loading flicker.
6. **AI real-time cart awareness** — `context-builder.ts` fetches cart contents on every AI request for all intents.
7. **AI full catalog for recommendations** — recommendation intent now includes all product names, not just 10 filtered.
8. **Dedicated cart intent** — new `cart` intent with a prompt that tells the LLM to trust real-time context over chat history.
9. **Website Control Agent** — Built an AI action resolver allowing the bot to navigate, manage cart, and list products natively.
10. **Markdown Strip** — Added `strip-markdown.ts` to clean output before passing to TTS in voice mode.
11. **Concise Prompts** — Rewrote all 6 prompts for 1-3 sentence brevity.
12. **UI Softening** — Changed background `#fafafa` to `#f4f4f7`, added a subtle gradient mesh aurora, and made glass utilities more translucent.
13. **Local Product Images** — Switched from random `loremflickr.com` URLs to local `/images/products/*.png` files generated via AI.
14. **Product detail page enrichment** — Added stock-left indicator, in-depth description rendered via `react-markdown`, specifications bento table, and a reviews section.
15. **Product reviews system** — Rating + comment reviews, login-to-post, public read, refresh-based updates (no Realtime).
16. **AI auth gate** — `/api/ai/chat` and `/api/ai/stream` now check authentication first; unauthenticated users receive only "Please log in first."
17. **Landing page redesign** — `/` is now a pure role-selection landing page (Customer/Retailer entry cards) with no navbar or footer.
18. **Navbar/footer gating** — Hidden on landing, auth, and retailer pages via `RouteShell` (`usePathname()`); floating bot stays global.
19. **Retailer portal** — Dashboard, product list, add-product form (image upload + dynamic specs editor), and orders page.
20. **Retailer role + marketplace model** — `retailer_id` on products, `is_retailer()` helper, retailer RLS policies, and retailer-only API routes.
21. **Signup role picker** — New users choose Customer or Retailer; role persists via `PATCH /api/profile/role` after signup.
22. **Customer storefront** — New `/shop` page with hero, category chips, and featured product grid linking to `/products/[id]`.
23. **Migration 002 + seed update** — `002_product_detail_and_reviews.sql` adds reviews, specs, retailer role, and backfills all 15 products; `seed.sql` now has detailed descriptions and specifications.
24. **Retailer entry login redirect** — Login page now honors the `next` query param and the user's role after sign-in (retailer→`/retailer`, admin→`/admin`, customer→`/shop`), fixing the broken "Retailer Portal" entry from the landing page for unauthenticated visitors.
25. **Navbar Home link removed** — The customer navbar no longer shows a "Home" link; the logo still links to `/`.
26. **Cart drawer converted to page link** — The cart icon in the navbar is now a `<Link href="/cart">` instead of a `Sheet`/`CartDrawer` drawer; the floating bot's cart actions navigate to `/cart`; the `useCart` hook no longer exposes open-state APIs; `src/components/cart/cart-drawer.tsx` was deleted.

---

## 14. How to Run

```bash
# Install deps
npm install

# Dev server (frontend + API)
npm run dev

# Kokoro TTS (separate terminal, optional for voice)
cd kokoro-service
pip install -r requirements.txt
python main.py   # runs on :8000

# Build
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

**Supabase:** Run `001_init.sql` then `002_product_detail_and_reviews.sql` then `seed.sql` in Supabase SQL editor. Also create a `product-images` Storage bucket (public) for retailer image uploads.

---

## 15. Known Issues / Notes

- Full `npm run lint` now has 3 errors: 2 pre-existing errors in `send-campaign-dialog.tsx` and `navbar.tsx` (unrelated to recent work), plus 1 in the new `product-detail-content.tsx` (non-blocking; `tsc --noEmit` passes).
- ESLint cold-start is slow (~200s first run) — use a longer timeout.
- The NVIDIA model is `meta/llama-3.1-8b-instruct` (fast, small). The default in `nvidia.ts` is `nvidia/llama-3.3-nemotron-super-49b-v1` but `.env.local` overrides it.
- Llama 3.1 8B often ignores "plain text only" prompt instructions and emits markdown — that's why `message-bubble.tsx` renders markdown.
- Voice mode now uses streaming + actions (previously used non-streaming `/api/ai/chat`).
- Retailer image uploads require a `product-images` Supabase Storage bucket (public) — must be created manually in the Supabase dashboard.
- Product reviews are refresh-based, not realtime (Supabase Realtime intentionally not used to stay within free tier).
- If Supabase email confirmation is enabled, retailer self-signup defaults to `customer` until the role PATCH runs post-session.
- `.ai/` memory directory only has `current-milestone.md` — other memory files referenced by capabilities don't exist yet.

---

## 16. Key Files Quick Reference

| If you need to change... | Edit this file |
|--------------------------|----------------|
| AI prompts | `src/lib/ai/prompts.ts` |
| AI intent detection | `src/lib/ai/intent-router.ts` |
| AI context (what data the AI sees) | `src/lib/ai/context-builder.ts` |
| AI provider (model, API calls) | `src/lib/ai/nvidia.ts` |
| Floating bot UI | `src/components/bot/floating-bot.tsx` |
| Chat message rendering | `src/components/bot/message-bubble.tsx` |
| Voice mode UI | `src/components/bot/voice-mode.tsx` |
| Voice hook (STT/TTS logic) | `src/hooks/use-voice.ts` |
| Cart state | `src/hooks/use-cart.tsx` |
| DB queries | `src/lib/db/queries.ts` |
| DB types | `src/lib/db/types.ts` |
| DB schema | `supabase/migrations/001_init.sql` |
| DB migration 002 | `supabase/migrations/002_product_detail_and_reviews.sql` |
| Service-role Supabase client | `src/lib/db/supabase-service.ts` |
| Email service | `src/lib/email/resend.ts` |
| TTS service | `src/lib/tts/kokoro.ts` |
| Route protection | `src/middleware.ts` |
| Navbar gating | `src/components/layout/route-shell.tsx` |
| Global styles | `src/app/globals.css` |
| Root layout | `src/app/layout.tsx` |
| Action Resolver | `src/lib/ai/action-resolver.ts` |
| AI Types | `src/lib/ai/types.ts` |
| Strip Markdown | `src/lib/ai/strip-markdown.ts` |
| Page Context Hook | `src/hooks/use-page-context.tsx` |
| Product detail page UI | `src/components/product/product-detail-content.tsx` |
| Product reviews API | `src/app/api/products/[id]/reviews/route.ts` |
| Retailer portal | `src/app/retailer/` |
| Retailer add-product form | `src/app/retailer/products/new/page.tsx` |
| Retailer products/orders API | `src/app/api/retailer/products/route.ts`, `src/app/api/retailer/orders/route.ts` |
| Retailer image upload | `src/app/api/retailer/upload/route.ts` |
| Role update API | `src/app/api/profile/role/route.ts` |
| Retailer auth helper | `requireRetailer()` in `src/lib/auth/supabase-auth.ts` |
| Customer storefront | `src/app/shop/page.tsx` |

---

*Generated for project handoff. Read this before making any changes.*
