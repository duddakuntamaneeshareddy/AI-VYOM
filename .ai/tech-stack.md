# Tech Stack

## Framework
- Next.js 15+ (App Router) with TypeScript
- React 19+
- Tailwind CSS 4+ with shadcn/ui components
- Framer Motion for animations
- Lucide React for icons

## Database & Auth
- Supabase (PostgreSQL) - serverless, free tier
- Supabase Auth (customer + admin roles via profiles table)

## AI
- NVIDIA NIM (build.nvidia.com API) - OpenAI-compatible endpoint
- Used for: chat bot, product recommendations, return analysis, intent routing

## Voice
- STT: Web Speech API (browser-native, free)
- TTS: Kokoro 82M model via Python FastAPI service on Render

## Email
- Resend (free tier, onboarding@resend.dev sender for demo)
- Swappable via EmailService interface

## Deployment
- Frontend + API: Vercel (free)
- Kokoro TTS service: Render (free tier)

## Build & Package
- npm (or pnpm)
- Next.js built-in build system
