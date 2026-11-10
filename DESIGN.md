---
name: Intelligent Boutique
description: Bold, precision-engineered AI shopping storefront. Dark-first, multi-color premium palette. Vercel/Raycast-inspired product UI meets luxury commerce.
register: product
colors:
  # Primary brand — electric amber/gold-copper that reads as premium commerce, not AI SaaS
  primary: "oklch(0.72 0.17 52)"
  primary-foreground: "oklch(0.10 0.01 52)"
  # Accent — saturated rose-coral for AI moments and CTAs
  accent: "oklch(0.65 0.20 22)"
  accent-foreground: "oklch(0.98 0.005 22)"
  # Background hierarchy (dark-first)
  background: "oklch(0.09 0.005 264)"
  surface: "oklch(0.12 0.006 264)"
  card: "oklch(0.14 0.007 264)"
  elevated: "oklch(0.17 0.008 264)"
  # Foreground hierarchy
  foreground: "oklch(0.97 0.004 264)"
  muted-foreground: "oklch(0.60 0.012 264)"
  subtle-foreground: "oklch(0.40 0.010 264)"
  # Borders
  border: "oklch(0.22 0.006 264)"
  border-strong: "oklch(0.30 0.008 264)"
  # Functional
  destructive: "oklch(0.60 0.22 25)"
  success: "oklch(0.65 0.18 145)"
  # Light mode overrides
  light-background: "oklch(0.99 0.002 264)"
  light-surface: "oklch(0.97 0.003 264)"
  light-card: "oklch(0.995 0.002 264)"
  light-border: "oklch(0.88 0.008 264)"
typography:
  display:
    fontFamily: "'Geist', 'Inter', ui-sans-serif, system-ui, sans-serif"
    weight: 700
    letterSpacing: "-0.025em"
  body:
    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif"
    size: "1rem"
    lineHeight: 1.6
  mono:
    fontFamily: "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace"
rounded:
  sm: "0.375rem"
  md: "0.625rem"
  lg: "0.875rem"
  xl: "1.25rem"
  2xl: "1.75rem"
  full: "9999px"
spacing:
  base: "1rem"
  section: "5rem"
  container-max: "1280px"
motion:
  level: rich
  easing: "cubic-bezier(0.16, 1, 0.3, 1)"
  duration-fast: "150ms"
  duration-base: "300ms"
  duration-slow: "500ms"
glass:
  background: "color-mix(in oklch, var(--card) 60%, transparent)"
  blur: "blur(20px) saturate(150%)"
  border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)"
  shadow: "0 8px 32px -8px rgb(0 0 0 / 0.4)"
---

# Design System: The Intelligent Boutique

## 1. Creative North Star

**"Vercel precision. Commerce soul."**

A shopping experience that looks and feels like a $100,000 product — not because of excess, but because every detail is considered. Dark, rich, typographically sharp. The aesthetic communicates technical credibility and premium taste simultaneously. Glassmorphism is present but disciplined; color is rich but controlled; motion is deliberate and smooth.

This is what Vercel would look like if it sold physical goods.

## 2. Color System

### Philosophy
The palette uses **oklch** throughout for perceptual uniformity. The brand is built on two anchor colors — an **amber-gold primary** (premium, commerce, warmth in a dark context) and a **rose-coral accent** (AI presence, urgency, energy) — against a deep **blue-grey near-black** canvas. This avoids the AI SaaS purple-gradient trap while remaining unmistakably premium.

### Dark Mode (Identity)

| Token | Value | Use |
|---|---|---|
| `--background` | `oklch(0.09 0.005 264)` | Page canvas — deep blue-grey near-black |
| `--surface` | `oklch(0.12 0.006 264)` | Subtle elevation above background |
| `--card` | `oklch(0.14 0.007 264)` | Cards, panels |
| `--elevated` | `oklch(0.17 0.008 264)` | Dropdowns, modals, popovers |
| `--primary` | `oklch(0.72 0.17 52)` | Brand amber-gold — buttons, active states, price highlights |
| `--primary-foreground` | `oklch(0.10 0.01 52)` | Text on primary |
| `--accent` | `oklch(0.65 0.20 22)` | Rose-coral — AI moments, badges, alerts |
| `--foreground` | `oklch(0.97 0.004 264)` | Primary text |
| `--muted-foreground` | `oklch(0.60 0.012 264)` | Secondary text, descriptions |
| `--subtle-foreground` | `oklch(0.40 0.010 264)` | Tertiary, disabled states |
| `--border` | `oklch(0.22 0.006 264)` | Default borders |
| `--border-strong` | `oklch(0.30 0.008 264)` | Active, focused borders |

### Light Mode (Premium Counterpart)
Light mode uses the same typographic system and accent colors, but swaps the canvas to a clean, cool near-white. It should feel like a luxury print catalog — not the usual "light mode as default" SaaS pattern.

| Token | Value |
|---|---|
| `--background` | `oklch(0.99 0.002 264)` |
| `--surface` | `oklch(0.97 0.003 264)` |
| `--card` | `oklch(0.995 0.002 264)` |
| `--border` | `oklch(0.88 0.008 264)` |

Primary and accent remain identical in both modes. Foreground adjusts to `oklch(0.08 0.005 264)` in light.

### The $100k Signal Rule
Color communicates price. Amber-gold (`--primary`) is reserved for price displays, primary CTAs, and brand marks. Rose-coral (`--accent`) signals AI presence and urgency without screaming. Never use either gratuitously — scarcity of use increases their signal value.

### Background Mesh
The page canvas has a fixed radial gradient mesh — three soft blooms (primary, accent, deep cyan) bleeding in from corners. In dark mode they are visible and dramatic. In light mode they are whisper-subtle.

```css
body::before {
  background:
    radial-gradient(60% 50% at 15% 0%, color-mix(in oklch, var(--primary) 10%, transparent), transparent 70%),
    radial-gradient(55% 45% at 88% 8%, color-mix(in oklch, var(--accent) 8%, transparent), transparent 70%),
    radial-gradient(50% 40% at 50% 100%, color-mix(in oklch, oklch(0.60 0.18 200) 6%, transparent), transparent 70%);
}
```

## 3. Typography

### Font Pairing
- **Display / Headings:** Geist (geometric, hyper-clean, technically precise — the Vercel font)
- **Body:** Inter (the gold standard for readable UI text)
- **Mono:** Geist Mono (for prices, SKUs, order numbers, code snippets)

Load via: `@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Inter:wght@400;450;500;600&family=Geist+Mono:wght@400;500&display=swap');`

*Note: Geist may need to be sourced via `next/font/local` or `next/font/google` — verify availability.*

### Type Scale

| Level | Size | Weight | Tracking | Use |
|---|---|---|---|---|
| Display | `clamp(3rem, 6vw, 5.5rem)` | 700 | `-0.03em` | Hero headlines only |
| Headline | `clamp(1.75rem, 3vw, 2.5rem)` | 700 | `-0.025em` | Page titles, product names |
| Title | `1.25rem` | 600 | `-0.015em` | Section headers, card titles |
| Body | `1rem` | 400 | `0` | Product descriptions, UI text |
| Small | `0.875rem` | 450 | `0.005em` | Metadata, timestamps |
| Label | `0.75rem` | 500 | `0.02em` | Badges, tags, micro-copy |
| Mono | `0.875rem` | 400–500 | `0` | Prices, order IDs, numeric data |

### Rules
- `text-wrap: balance` on Display and Headline to prevent orphaned words
- Body line length capped at 70ch
- Price displays use Geist Mono with tabular-nums for alignment
- Display ceiling: 5.5rem max — never shout

## 4. Elevation & Glass

### Glassmorphism (Disciplined)
Glass is used for floating/overlay elements and AI surfaces. Not as a default card style. The glass recipe:

```css
.glass {
  background: color-mix(in oklch, var(--card) 60%, transparent);
  backdrop-filter: blur(20px) saturate(150%);
  border: 1px solid color-mix(in oklch, var(--foreground) 8%, transparent);
  box-shadow: 0 8px 32px -8px rgb(0 0 0 / 0.4);
}
```

### Shadow Vocabulary

| Name | Value | Use |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgb(0 0 0 / 0.3)` | Subtle card lift |
| `shadow-md` | `0 4px 12px -2px rgb(0 0 0 / 0.4)` | Hover state lift |
| `shadow-lg` | `0 8px 32px -8px rgb(0 0 0 / 0.5)` | Floating elements |
| `shadow-glow` | `0 0 0 1px var(--primary), 0 4px 20px -4px color-mix(in oklch, var(--primary) 40%, transparent)` | Active state, focused ring on primary CTA |

### Z-Index Scale
```
dropdown  → 100
sticky    → 200
modal-bg  → 300
modal     → 400
toast     → 500
tooltip   → 600
```

## 5. Components

### Buttons
- **Primary:** Amber-gold background (`--primary`), dark foreground, rounded-lg, slight shadow. On hover: `translateY(-1px)` + glow shadow.
- **Secondary:** Transparent with `--border` border. On hover: `--surface` background.
- **Ghost:** No border, no background. Text + icon only.
- **Destructive:** Rose-coral background.
- **Shape:** `border-radius: var(--rounded-lg)` default, `--rounded-full` for pill variants (search, AI input).

### Cards
- **Standard card:** `--card` background, `--border` border, `--rounded-xl`. Hover: `translateY(-2px)` + `shadow-md`.
- **Glass card:** Glassmorphism recipe above. Used for AI bot, floating panels, overlays.
- **Bento surface:** `--rounded-2xl`, `--card` background, `--border` border, generous internal padding `1.5rem`. Used for feature/category sections.
- **Product card:** Standard card with an aspect-ratio image area (4:3 or 1:1), name in Title style, price in Geist Mono amber.

### Inputs / Fields
- **Background:** `--surface`
- **Border:** `--border` at rest, `--border-strong` on focus
- **Focus ring:** `shadow-glow` with primary color
- **Border radius:** `--rounded-lg`
- **AI input (chat bar):** `--rounded-full`, glass background, slightly larger, rose-coral send button

### Badges / Tags
- **Default:** `--surface` background, `--border` border, Label type
- **AI/active:** Rose-coral tint
- **Price:** Amber-gold tint, Geist Mono
- **Status:** Green/red functional tints (success/destructive)

### Navigation
- Sticky top nav with glass effect
- Logo in Geist 600, no other decorative marks
- Active route: primary amber underline or bold weight shift
- Mobile: slide-in drawer, glass background

### AI Assistant (Floating Bot)
- Glass orb / panel floating bottom-right
- Rose-coral accent for listening/active states (not the primary amber)
- Subtle radial glow behind it in dark mode
- Transitions: spring physics for appear/dismiss, smooth typing indicator

## 6. Motion

### Motion Energy: Rich
Motion is deliberate and purposeful. Every interactive element has a response. Entrances use eased slide-up + fade. Exits use fade-out. Hover states use micro-lifts. The overall feeling is "alive but controlled" — not jittery, not sluggish.

### Easing Standard
All transitions use: `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out) — fast into position, precision landing. No bounce. No elastic.

### Keyframe Library
```css
/* Entrance */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Shimmer (skeletons) */
@keyframes shimmer {
  to { background-position: 200% center; }
}

/* Mesh pulse (background) */
@keyframes mesh-drift {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

/* Button ripple */
@keyframes ripple {
  from { transform: scale(0); opacity: 0.4; }
  to   { transform: scale(2.5); opacity: 0; }
}
```

### Reduced Motion
Every animation must have an alternative:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 7. Do's and Don'ts

### Do
- **Do** use Geist for all headings and Geist Mono for all numeric/price data
- **Do** keep glassmorphism reserved for floating/overlay elements and the AI interface
- **Do** use the amber-gold primary sparingly — its value comes from scarcity
- **Do** ensure every interactive element has a visible, on-brand focus ring
- **Do** vary card sizes in bento layouts — no identical-card grids
- **Do** test dark mode first; light mode must be equally considered
- **Do** use the background mesh gradient — it adds premium depth without visual noise

### Don't
- **Don't** use purple gradient text or glowing orbs — this is not AI SaaS
- **Don't** use cream/sand/beige backgrounds in light mode — use the cool near-white
- **Don't** use side-stripe borders (`border-left > 1px` as a colored accent)
- **Don't** use the same card pattern repeated grid-endlessly — vary the layout
- **Don't** use numbered eyebrows (01/02/03) as section scaffolding
- **Don't** use overly minimal / zero-personality layouts — this should feel like a $100k product
- **Don't** animate layout properties (width, height, top, left)
- **Don't** use arbitrary z-index values like 999 or 9999 — use the semantic scale above
