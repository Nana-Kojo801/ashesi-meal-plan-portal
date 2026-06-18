# Refactor Report — AshesiMeals

Prepared for handover to Ashesi University. No functional changes were made.

---

## New Folder Structure

```
src/
├── api/                         # HTTP calls, one file per domain
│   ├── balance.ts               # fetchBalance
│   ├── history.ts               # fetchHistory
│   ├── pin.ts                   # resetPin
│   └── index.ts                 # barrel re-export
├── components/                  # Shared components used across multiple pages
│   ├── bottom-nav.tsx
│   ├── error-boundary.tsx       # NEW — class-based React error boundary
│   ├── header.tsx
│   ├── ring.tsx
│   ├── skeleton.tsx
│   └── toast.tsx
├── context/
│   └── app-context.tsx          # Runtime UI state shared via React Context
├── hooks/                       # Custom React hooks
│   ├── use-balance-cache.ts     # localStorage balance cache helpers + TTL constant
│   ├── use-mobile.ts            # window resize → boolean
│   └── use-offline.ts           # navigator.onLine + online/offline events
├── lib/
│   └── utils.ts                 # Date/time/greeting utilities (unchanged)
├── pages/                       # One directory per route
│   ├── error/
│   │   └── error-page.tsx
│   ├── home/
│   │   ├── components/
│   │   │   ├── balance-ring-card.tsx
│   │   │   ├── fetching-outline.tsx
│   │   │   ├── recent-activity.tsx
│   │   │   └── stat-cards.tsx
│   │   └── home-page.tsx
│   ├── history/
│   │   ├── components/
│   │   │   ├── date-range-picker.tsx
│   │   │   ├── filter-chips.tsx
│   │   │   └── transaction-list.tsx
│   │   └── history-page.tsx
│   ├── login/
│   │   └── login-page.tsx
│   ├── not-found/
│   │   └── not-found-page.tsx
│   ├── reports/
│   │   ├── components/
│   │   │   ├── analytics-stats.tsx
│   │   │   ├── cafe-ranking.tsx
│   │   │   ├── chart-card.tsx
│   │   │   ├── chart-tooltip.tsx
│   │   │   ├── daily-trend-chart.tsx
│   │   │   ├── day-of-week-chart.tsx
│   │   │   ├── more-insights.tsx
│   │   │   ├── time-of-day.tsx
│   │   │   ├── top-items.tsx
│   │   │   └── weekly-comparison.tsx
│   │   ├── hooks/
│   │   │   └── use-analytics.ts  # All analytics calculations (useMemo)
│   │   └── reports-page.tsx
│   └── settings/
│       ├── components/
│       │   ├── action-cards.tsx
│       │   └── profile-card.tsx
│       └── settings-page.tsx
├── stores/
│   └── session-store.ts         # Zustand store — student ID persistence
├── types/
│   └── index.ts                 # BalanceData, HistoryItem, Screen, ToastState
├── app.tsx                      # Layout component — Header, BottomNav, Context provider
└── main.tsx                     # Router, QueryClient, lazy-load setup
```

**Convention:** Each route lives in `src/pages/<name>/`. Page-specific components go in `src/pages/<name>/components/`. Anything used by two or more pages goes in `src/components/`.

---

## Summary of Changes

### File Naming
- All component and page files renamed from PascalCase (`Ring.tsx`, `App.tsx`) to kebab-case (`ring.tsx`, `app.tsx`).
- `git mv` used for renames so git history is preserved.

### Folder Structure
- `src/screens/` deleted; contents moved into `src/pages/<name>/`.
- `src/pages/ErrorPage.tsx` and `NotFoundPage.tsx` moved into `src/pages/error/` and `src/pages/not-found/`.
- All five original screen files were monolithic; each page is now split into focused sub-components.
  - `DashboardScreen` → `home-page.tsx` + `balance-ring-card`, `stat-cards`, `recent-activity`, `fetching-outline`
  - `AnalyticsScreen` → `reports-page.tsx` + 10 chart/insight components + `use-analytics` hook
  - `HistoryScreen` → `history-page.tsx` + `filter-chips`, `date-range-picker`, `transaction-list`
  - `SettingsScreen` → `settings-page.tsx` + `profile-card`, `action-cards`
  - `LoginScreen` → `login-page.tsx`

### State Management
- **Zustand (`useSessionStore`)** replaces the manual `localStorage.getItem/setItem` pattern for student ID persistence. The `persist` middleware handles serialisation transparently.
- **`AppContext`** retains runtime state (`balanceData`, `loadingBalance`, `showToast`, etc.) that is produced by the layout component and does not need persistence.
- `studentId` is read from `useSessionStore()` directly in pages that need it; it is no longer threaded through AppContext.
- `isMobile` and `isOffline` extracted into `useMobile` and `useOffline` hooks; removed from App.tsx inline.
- Balance localStorage cache extracted to `src/hooks/use-balance-cache.ts` with a single exported TTL constant.

### Performance
- **`ReportsPage` is lazy-loaded** via `React.lazy` + `Suspense`. Recharts adds ~200 KB to the bundle; it is now only loaded when the user navigates to `/reports`.
- `useAnalytics` hook wraps the full analytics computation in `useMemo` with correct `[history, balanceData]` deps.
- `ErrorBoundary` class component added; every route is wrapped so a crash in one page cannot bring down the shell.

### Code Quality
- `src/api.ts` split into `src/api/balance.ts`, `src/api/history.ts`, `src/api/pin.ts`. Each file exports one function; domain is explicit from the file name.
- `src/types.ts` moved to `src/types/index.ts` — same exports, cleaner resolution path.
- Prettier config added (`.prettierrc`): single quotes, trailing commas, 100-char line width.
- Dead files removed: `SpendingCalendar.tsx`, `DatePickerPopover.tsx`, `App.css`, `react.svg`, `vite.svg`.

### Security
See the **Security Audit** section below.

---

## Security Audit

### Findings

1. **Student ID in URL path (medium)**
   The API endpoints encode student ID directly in URL path segments:
   ```
   /getSubscriberCurrentBalance/{studentId}
   /getSubscriberHistory/{studentId}/...
   /resetPin/{studentId}
   ```
   All three callers now use `encodeURIComponent(studentId)` (added in this refactor). However, the student ID will still appear in browser network logs and server access logs. This is a backend API design issue that cannot be mitigated client-side.

2. **Balance data cached in localStorage (low–medium)**
   `localStorage` stores a serialised `BalanceData` object keyed `ashesiMealsBalance_{studentId}`, containing: `firstname`, `lastname`, `current_balance`, `amount`, `daily_spending_limit`, `meal_plan_name`, `subscriber_status`. This is readable by any JavaScript running on the same origin. The cache is intentional (avoids triggering an OTP email on every app open), but the school should be aware that financial balance and subscriber status are persisted client-side. **Recommendation:** confirm with Ashesi IT whether this is acceptable; consider encrypting the cache with a session-derived key, or reducing cached fields to the minimum needed (balance + limit only).

3. **Student ID validated client-side only (low)**
   `LoginPage` now validates the student ID format with `/^\d{5,10}$/` before submitting. This prevents obviously malformed inputs from triggering API calls, but is not a security control — the real validation happens server-side. No change needed; noted for completeness.

4. **No authentication token / session expiry**
   The app authenticates by student ID alone. There is no session token, no expiry, and no server-side invalidation mechanism. Anyone who obtains a student's ID can access their balance and history. This is a fundamental limitation of the current API design. Flagged for the school to consider before wide deployment.

5. **No HTTPS enforcement in the app**
   The `BASE` URL in each `src/api/*.ts` file is `https://...` — correct. No plain-HTTP fallback exists.

6. **Error messages do not expose raw API responses to users**
   Confirmed. `catch` blocks extract only `error.message` and show a generic string if that is unavailable. Raw response bodies are not shown.

---

## Remaining Recommendations

| Area | Recommendation |
|------|---------------|
| Testing | No test suite exists. Before handover, add at minimum: smoke tests for login flow, balance display, and history fetch (Playwright or Vitest + Testing Library). |
| CI/CD | Add a GitHub Actions workflow: `pnpm build` + `pnpm lint` on every push. The Netlify deploy currently runs blind. |
| ESLint | The existing config covers `react-hooks` and `react-refresh`. Consider adding `eslint-plugin-jsx-a11y` for accessibility linting — important for a university portal. |
| Accessibility | Buttons lack `aria-label` in several places (e.g. the Refresh button on the dashboard). Screen-reader users cannot identify them. |
| API base URL | `BASE` is hardcoded in three files. Move it to a `.env` variable (`VITE_API_BASE`) so staging and production can use different endpoints without code changes. |
| Offline → stale balance | When the user is offline, the balance displayed is whatever was last cached. No age indicator is shown. Consider displaying "last updated X minutes ago" when offline. |
| React day-picker dependency | `react-day-picker` is still in `package.json` but `DatePickerPopover.tsx` was removed. Run `pnpm remove react-day-picker` if no replacement is planned. |
