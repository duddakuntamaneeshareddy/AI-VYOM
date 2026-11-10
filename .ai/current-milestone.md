# Current Milestone

## Milestone
AI-powered e-commerce website (college mini project).

## Goal
Build a full-stack AI e-commerce website with 9 compulsory AI features:
1. Cart abandonment follow-up agent
2. Order tracking assistant
3. Return/refund support
4. Product recommendation bot
5. Customer retention campaigns
6. Voice commerce assistant
7. Inventory enquiry automation
8. Delivery status notifications
9. Retail customer engagement bot

## Architecture
- Path B: 4 deep features, 5 functional-but-simple
- One floating AI bot handles: order tracking, product recommendations, inventory enquiry, voice commerce
- Separate return/refund flow
- Notification system: cart abandonment, delivery status, customer engagement (email + in-app)
- Admin panel for campaigns, orders, products, returns
- Swappable abstraction layers for Email, AI, and TTS services

## Tech Stack
- Frontend + Backend: Next.js (App Router) + TypeScript
- Database + Auth: Supabase (PostgreSQL)
- AI: NVIDIA NIM (build.nvidia.com API)
- TTS: Kokoro on Render (Python FastAPI service)
- STT: Web Speech API (browser-native)
- Email: Resend (onboarding@resend.dev for demo, swappable interface)
- UI: Tailwind CSS, shadcn/ui, Framer Motion
- Style: Bold Minimal Premium (bento grid, glassmorphism accents, bold typography)

## Status
Step 1 (Foundation) in progress.
