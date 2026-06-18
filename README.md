<div align="center">

<img src="./public/icons/icon-192.png" alt="AshesiMeals logo" width="80"/>

# AshesiMeals

### Your meal plan, in your pocket.

*A modern, mobile-first web app for Ashesi University students to manage their meal plan — proposed as a replacement for the current subscriber portal.*

<br/>

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![Status](https://img.shields.io/badge/status-proposal-orange?style=flat-square)

</div>

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Disclaimer](#disclaimer)
- [Author](#author)

---

## About

The current Ashesi meal plan portal works — but barely. It's not mobile-friendly, provides no spending insights, and requires students to navigate a clunky interface just to check their daily balance.

**AshesiMeals** is a community-built replacement built from the ground up with students in mind. It wraps the same backend API in a fast, responsive, installable PWA that feels at home on any device.

**What it does better:**

- Opens in under a second on mobile — no page reloads, no redirects
- Shows your daily balance at a glance with a visual ring indicator
- Surfaces 30-day spending analytics you never had before
- Works offline using cached data so you're never left without your balance
- Installable as a home-screen app on Android and iOS

---

## Features

| Feature | Description |
|---|---|
| 💳 **Balance Dashboard** | Live daily balance with a ring chart, usage bar, and quick stats — total loaded, spent today, daily limit |
| 📋 **Purchase History** | Full transaction log with filters: today, yesterday, pick a date, or custom date range |
| 📊 **Spending Analytics** | 30-day trends: daily chart, café rankings, top items, day-of-week breakdown, time-of-day split, and a "More insights" summary |
| 🔑 **PIN Reset** | One-tap PIN reset that delivers a new PIN straight to your Ashesi email |
| 📴 **Offline Support** | Cached balance and history remain visible when connectivity drops |
| 📱 **Responsive + Installable** | Mobile-first layout with a floating tab bar; installable as a PWA on any device |
| 🔄 **Smart Refetch** | Balance only re-fetches after 60 seconds of inactivity — avoids triggering unnecessary OTP emails |

---

## Tech Stack

| Technology | Why |
|---|---|
| **React 19** | Component model maps cleanly to the card-based UI; concurrent features enable smooth transitions |
| **TypeScript** | Strict typing catches API shape mismatches before they reach production |
| **Vite 8** | Sub-second HMR in development; optimised bundle splitting for production |
| **Tailwind CSS 4** | Utility-first styling keeps component files focused on structure, not style |
| **TanStack Query v5** | Server-state caching with stale-time control — critical for limiting OTP-triggering API calls |
| **React Router v7** | Nested routing with layout components and per-route lazy loading |
| **Framer Motion** | Declarative enter/exit animations without manual CSS keyframe management |
| **Recharts** | Composable chart primitives; lazy-loaded so the initial bundle stays lean |
| **Zustand** | Minimal global state for session persistence with zero boilerplate |
| **Vite PWA Plugin** | Service-worker generation and manifest injection with no manual configuration |

---

## How It Works

```
Student ID
    │
    ▼
Login Page ──► fetchBalance(id) ──► Validates against Ashesi API
    │                                        │
    │              (success)                 ▼
    └─────────────────────────► Zustand session store
                                    (persisted to localStorage)
                                             │
                                             ▼
                                   App layout mounts
                                             │
                         ┌───────────────────┼───────────────────┐
                         ▼                   ▼                   ▼
                   fetchBalance        fetchHistory        (lazy) Reports
                   (TanStack Q,        (TanStack Q,          bundle +
                    1hr cache)          60s cache)           Recharts
                         │                   │
                         ▼                   ▼
                   AppContext           Page state
                   (balanceData,        (filters,
                    toast, etc.)         date range)
                         │
                         ▼
                   UI Components
```

**Key behaviours:**

- On first load the balance is read from a localStorage cache (1-hour TTL) so the screen populates instantly with no API call.
- On dashboard navigation, the balance only re-fetches if cached data is older than 60 seconds — this prevents triggering a new OTP email on every tab switch.
- The `/reports` route is lazy-loaded; the Recharts bundle (~200 KB) is only downloaded when the student first visits the analytics screen.
- When offline, a banner is shown and all previously cached data remains accessible.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 9

```bash
npm install -g pnpm
```

### Clone and install

```bash
git clone https://github.com/Nana-Kojo801/ashesi-meal-plan.git
cd ashesi-meal-plan
pnpm install
```

### Environment variables

No environment variables are required to run the app in development — the API base URL points to the live Ashesi API by default.

To override (e.g. for a staging API), create a `.env.local` file:

```bash
VITE_API_BASE=https://your-staging-api.example.com/api
```

> `.env.local` is gitignored. Never commit environment files.

### Run the development server

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. Enter your Ashesi Student ID on the login screen.

### Build for production

```bash
pnpm build
```

Output is written to `dist/`. Deploy the contents to any static host (Netlify, Vercel, GitHub Pages).

> **Netlify note:** `public/_redirects` handles SPA routing automatically. No additional configuration required.

<details>
<summary><b>Troubleshooting</b></summary>

<br/>

**`pnpm install` fails with peer dependency warnings**

Run:
```bash
pnpm install --strict-peer-dependencies=false
```
Some sub-dependencies have loose peer ranges that don't affect runtime behaviour.

---

**Blank screen after login**

Open DevTools → Console. A CORS error means the API is blocking requests from your local origin. The production deployment on Netlify uses the correct origin — test there if needed.

---

**PWA install prompt doesn't appear**

The install prompt only shows over HTTPS or on `localhost`. It will not appear on a local network IP (`192.168.x.x`). Use `pnpm preview` after a build to test the full PWA locally.

---

**TypeScript errors after pulling**

```bash
pnpm exec tsc --noEmit
```

Ensure your editor's TypeScript server is using the workspace version (`node_modules/typescript`), not a globally installed one.

</details>

---

## Project Structure

```
ashesi-meal-plan/
├── public/
│   ├── _redirects              # Netlify SPA routing
│   └── manifest.webmanifest
├── src/
│   ├── api/                    # HTTP calls — one file per domain
│   │   ├── balance.ts
│   │   ├── history.ts
│   │   ├── pin.ts
│   │   └── index.ts
│   ├── components/             # Shared UI components (used across pages)
│   │   ├── bottom-nav.tsx
│   │   ├── error-boundary.tsx
│   │   ├── header.tsx
│   │   ├── ring.tsx
│   │   ├── skeleton.tsx
│   │   └── toast.tsx
│   ├── context/
│   │   └── app-context.tsx     # Runtime state — balance, toast, mobile flag
│   ├── hooks/
│   │   ├── use-balance-cache.ts
│   │   ├── use-mobile.ts
│   │   └── use-offline.ts
│   ├── lib/
│   │   └── utils.ts            # Date / time / greeting helpers
│   ├── pages/                  # One directory per route
│   │   ├── error/
│   │   │   └── error-page.tsx
│   │   ├── home/               # Dashboard — ring, stat cards, activity feed
│   │   │   ├── components/
│   │   │   │   ├── balance-ring-card.tsx
│   │   │   │   ├── fetching-outline.tsx
│   │   │   │   ├── recent-activity.tsx
│   │   │   │   └── stat-cards.tsx
│   │   │   └── home-page.tsx
│   │   ├── history/            # Transaction log with date filters
│   │   │   ├── components/
│   │   │   │   ├── date-range-picker.tsx
│   │   │   │   ├── filter-chips.tsx
│   │   │   │   └── transaction-list.tsx
│   │   │   └── history-page.tsx
│   │   ├── login/
│   │   │   └── login-page.tsx
│   │   ├── not-found/
│   │   │   └── not-found-page.tsx
│   │   ├── reports/            # Spending analytics (lazy-loaded)
│   │   │   ├── components/
│   │   │   │   ├── analytics-stats.tsx
│   │   │   │   ├── cafe-ranking.tsx
│   │   │   │   ├── chart-card.tsx
│   │   │   │   ├── chart-tooltip.tsx
│   │   │   │   ├── daily-trend-chart.tsx
│   │   │   │   ├── day-of-week-chart.tsx
│   │   │   │   ├── more-insights.tsx
│   │   │   │   ├── time-of-day.tsx
│   │   │   │   ├── top-items.tsx
│   │   │   │   └── weekly-comparison.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-analytics.ts
│   │   │   └── reports-page.tsx
│   │   └── settings/           # Profile, PIN reset, sign out
│   │       ├── components/
│   │       │   ├── action-cards.tsx
│   │       │   └── profile-card.tsx
│   │       └── settings-page.tsx
│   ├── stores/
│   │   └── session-store.ts    # Zustand — student ID persistence
│   ├── types/
│   │   └── index.ts
│   ├── app.tsx                 # Layout component — shell, context provider
│   ├── index.css
│   └── main.tsx                # Router, QueryClient, lazy-load wiring
├── .prettierrc
├── eslint.config.js
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Disclaimer

AshesiMeals is an **independent, community-built project** and is not affiliated with, endorsed by, or officially associated with Ashesi University or Akorno Services. It interfaces with the publicly accessible meal plan API to provide a better experience for students.

All student data remains entirely within the student's own browser. No data is collected, stored, or transmitted to any third-party server by this application.

This project is shared with the school as a proposed replacement for the current subscriber portal and is open for review and feedback.

---

## Author

Built by **Nana Kojo Atta-Benyah**.

If you're an Ashesi student, faculty member, or part of the IT or student services team and have feedback, questions, or interest in taking this further — open an issue or get in touch.

> *Contributions and suggestions are welcome. Every improvement makes this better for the entire Ashesi community.*
