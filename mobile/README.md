# FWWB Program Team Mobile App

Mobile app for the **program team** to feed activities, expenses, and view attendance & leave. Fully connected to the same backend as the web portal — data syncs in real time.

## Features

- **Login** — Same credentials as web (e.g. `program.user` / `demo123`)
- **Dashboard** — Projects, activities, expenses count; total allocated & spent
- **Activities** — List, add, edit activities (name, project, budget, status, location, participants)
- **Expenses** — List, add, edit expenses (project, activity, amount, category, description, date)
- **Attendance** — View attendance records (read-only; managed on web or future mobile entry)
- **Leave** — View leave requests (read-only)

All data is stored on the **same backend** as the web portal. Create an activity or expense on the app and it appears on the web (and vice versa).

## Prerequisites

- Node.js 18+
- Backend and (optionally) MongoDB running (see root README)
- **Supraja demo data**: run seed so the app has projects and sample data

## Populate with Supraja data

From the **project root** (not `mobile/`):

```bash
# Ensure MongoDB is running, then:
cd server
npm run seed
```

This creates:

- Demo users: `admin`, `program.user`, `hr.user`, `admin.user`, `employee`, `donor` (password: `demo123`)
- Supraja Foundation project and partner
- 7 Supraja activities (trainings, partner meet, workbook, etc.)
- Budget heads and expenses
- FWWB team employees, attendance, leave, and other demo data

Without the seed, the backend falls back to in-memory demo data (Supraja activities/budget/expenses) when MongoDB is empty, but logging in as a **real** user (e.g. `program.user`) works best after seeding.

## API URL (connect to backend)

The app talks to the **same API** as the web portal.

- **iOS Simulator**: `http://localhost:5000/api`
- **Android Emulator**: `http://10.0.2.2:5000/api`
- **Physical device**: Use your computer’s LAN IP, e.g. `http://192.168.1.5:5000/api`

To change the URL, edit `mobile/src/config.ts`. For a device, ensure the phone and the machine running the server are on the same network and that the backend is listening on `0.0.0.0` (e.g. `PORT=5000 node server`).

## Run the app

```bash
cd mobile
npm install
npx expo start
```

Then:

- Press **i** for iOS simulator (macOS only)
- Press **a** for Android emulator
- Scan the QR code with **Expo Go** on a physical device (and set the API URL to your machine’s IP in `src/config.ts` if needed)

## Logout

There is no logout in the tab UI in this version. You can clear the app data (or add a Settings tab with Logout that calls the auth context’s `logout()` and clears stored tokens).

## Project structure

```
mobile/
├── App.tsx                 # Entry: AuthProvider + AppNavigator
├── src/
│   ├── api/client.ts      # API client, tokens, refresh
│   ├── config.ts          # API_BASE_URL
│   ├── context/AuthContext.tsx
│   ├── navigation/AppNavigator.tsx  # Stack + Tabs
│   └── screens/
│       ├── LoginScreen.tsx
│       ├── DashboardScreen.tsx
│       ├── ActivitiesScreen.tsx
│       ├── ActivityFormScreen.tsx
│       ├── ExpensesScreen.tsx
│       ├── ExpenseFormScreen.tsx
│       ├── AttendanceScreen.tsx
│       └── LeaveScreen.tsx
├── app.json
└── package.json
```

## Backend changes for mobile

The backend already supports:

- **CORS**: Allows requests with no `Origin` (native app) and `exp://` (Expo).
- **Auth**: Login and refresh responses include `refreshToken` in the JSON body so the app can store it and refresh without cookies.
- Same **JWT** and **role** checks; program role has access to activities, expenses, attendance, leave, dashboard, projects, budget (read).
