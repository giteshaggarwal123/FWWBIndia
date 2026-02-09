# Portal review (FWWB web + mobile)

## Web portal

- **Stack**: React (Vite, TypeScript), React Router, React Query, Recharts. Backend: Express, MongoDB, JWT (access + refresh), RBAC.
- **Auth**: Login returns `accessToken` (and now `refreshToken` in body for mobile). Refresh accepts cookie or `refreshToken` in body. Roles: management, program, hr, admin, employee, donor.
- **Dashboard**: Stats (projects, activities, allocated, spent), activity budget vs expenses bar chart, budget-by-head bar chart, utilization % by head pie chart. Alerts section. Data from `/api/dashboard`; when DB has data, `budgetSummary` includes computed `utilizationPct` and `spent`.
- **Analytics**: Overall utilization, recommendations, participants-by-activity bar chart, utilization-by-budget-head pie chart. Same dashboard API.
- **Program-relevant modules**: Activities, Budget, Expenses, Monitoring, Reports, Leave, Attendance (program role has access). Projects list for dropdowns.
- **Utilization graphs**: Fixed so both Dashboard and Analytics show utilization pies (backend sends `utilizationPct`; frontend falls back to computed from allocated/spent).
- **CORS**: Allows `localhost`, no origin (native app), and `exp://` for Expo.
- **Demo data**: When MongoDB is disconnected or empty, backend uses `suprajaDemo` (SUPRAJA_ACTIVITIES, SUPRAJA_BUDGET, DEMO_EXPENSES, etc.). Seed script populates full Supraja + FWWB team.

## Mobile app (program team)

- **Purpose**: Program team can feed and view data on the go; same backend as web.
- **Tech**: Expo (React Native), React Navigation (stack + bottom tabs), SecureStore for tokens, shared API client with refresh.
- **Screens**: Login → Dashboard (stats, log out), Activities (list + add/edit), Expenses (list + add/edit), Attendance (view), Leave (view).
- **Auth**: Same credentials; login/refresh return `refreshToken` in JSON for mobile; CORS allows app requests.
- **Data**: Activities and expenses created/updated on the app appear on the web (and vice versa). Supraja data: run `npm run seed` from repo root so DB has projects, activities, budget, expenses; app uses same `/api` endpoints.
- **API URL**: Configurable in `mobile/src/config.ts` (localhost for simulator, 10.0.2.2 for Android emulator, LAN IP for physical device).

## Summary

- Portal and mobile share one backend and one dataset.
- Supraja data is populated via `npm run seed` (and/or demo fallback when DB empty).
- Utilization charts fixed; mobile app added and documented.
