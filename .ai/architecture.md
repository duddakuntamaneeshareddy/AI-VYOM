# Architecture

## System Overview
Full-stack Next.js application with AI features for e-commerce.

## Primary Architecture
- Next.js App Router handles both frontend pages and API routes (single deployment)
- Supabase provides PostgreSQL database + authentication
- NVIDIA NIM provides AI chat capabilities (OpenAI-compatible API)
- Kokoro TTS runs as a separate Python FastAPI service on Render
- Resend handles transactional emails (cart abandonment, delivery, campaigns)
- All external services abstracted behind interfaces (EmailService, AIProvider, TTSService)

## Module Structure
- Module A: Floating AI Bot (text + voice) - order tracking, recommendations, inventory, voice commerce
- Module B: Return/Refund flow with AI analysis
- Module C: Product recommendation engine (AI function calling)
- Module D: Notification system (cart abandonment, delivery, engagement)
- Module E: Retention campaigns (admin-triggered)
- Module F: Admin panel (dashboard, orders, products, returns, campaigns, notifications)

## Key Directories
- app/ - Next.js App Router (pages + API routes)
- components/ - React components (bot, ui, product, cart, orders, admin, email templates)
- lib/ - Service abstractions, DB client, AI provider, TTS, STT, auth, utils
- hooks/ - Custom React hooks
- kokoro-service/ - Python FastAPI service for TTS (deployed to Render)
- supabase/migrations/ - SQL migration files

## Principles
- Swappable service interfaces (Email, AI, TTS)
- Customer side 100% functional, admin panel interactive but mostly static
- Bold Minimal Premium UI (bento grid, glassmorphism accents, bold typography)
- Web search before implementing unfamiliar APIs
