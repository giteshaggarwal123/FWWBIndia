# FWWB India – Integrated Management System

**Friends of Women's World Banking India** – Full-stack MIS: web portal, mobile app (Expo), and Node/Express API.  
Repo: [github.com/giteshaggarwal123/FWWBIndia](https://github.com/giteshaggarwal123/FWWBIndia)

- **Web**: React (Vite) – dashboard, programs, activities, budget, expenses, HRMS, admin, donor portal, approvals, reports.
- **Mobile**: Expo (React Native) – login, dashboard, activities, expenses, attendance, leave, forms (same API).
- **Backend**: Node.js, Express, MongoDB, JWT auth, RBAC, file upload, Excel export, bulk import.

## Setup

1. **Prerequisites**: Node 18+, MongoDB (local or Docker).

2. **Install dependencies**:
   ```bash
   npm run install:all
   ```

3. **Environment**: Copy `.env.example` to `.env` and set `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL` (e.g. `http://localhost:5173`).

4. **Run**:
   - Backend: `npm run server` (port 5000)
   - Frontend: `npm run client` (port 5173)
   - Both: `npm run dev`

5. **Seed demo data and users** (Supraja + FWWB team):
   ```bash
   npm run seed
   ```
   Demo logins: admin/demo123, program.user/demo123, hr.user/demo123, admin.user/demo123, employee/demo123, donor/demo123.

6. **Mobile app (program team)**:
   ```bash
   cd mobile && npm install && npx expo start
   ```
   Same backend; use `program.user` / `demo123` to add activities and expenses from the app. See `mobile/README.md` for API URL (device vs emulator) and Supraja data.

## Hosting (Web + Mobile + Backend)

- **Backend**: Deploy the `server/` (e.g. Render, Railway, Fly.io). Set env: `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL` (your web URL), `PORT`.
- **Web**: Build with `cd client && npm run build`; deploy `client/dist` to Vercel, Netlify, or static host. Set API proxy or `VITE_API_URL` to your backend URL.
- **Mobile**: Build with EAS (`eas build`) or Expo; point `mobile/src/config.ts` (or env) `API_BASE_URL` to your deployed backend `/api`. Publish to stores or internal distribution.
- **MongoDB**: Use Atlas or any hosted MongoDB; set `MONGODB_URI`. Run `npm run seed` once for demo users and data.

## Docker

- **Run with Docker Compose** (Mongo + API + client):
  ```bash
  export JWT_SECRET=your-secret
  export JWT_REFRESH_SECRET=your-refresh-secret
  docker-compose up --build
  ```
  - API: http://localhost:5000
  - Client: http://localhost:3000 (nginx proxies /api to server)
  - MongoDB: localhost:27017

## Tests

- Server: `cd server && npm test` (health route test).

## Project structure

- `server/` - Express API (TypeScript), MongoDB/Mongoose, JWT auth, RBAC, CRUD for all modules, file upload, Excel export, LFA, Donor Portal, alerts, bulk import.
- `client/` - React SPA (TypeScript), Vite, React Router, React Query, role-based nav, module screens.
- `mobile/` - Expo (React Native) app for program team: login, dashboard, activities, expenses, attendance, leave; same API as web.

See `REQUIREMENTS_COVERAGE.md` for mapping to the Software Workflow Requirement document.
