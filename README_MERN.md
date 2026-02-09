# FWWB India - MERN Stack

Integrated Management System (MERN: MongoDB, Express, React, Node).

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

5. **Seed demo data and users**:
   ```bash
   npm run seed
   ```
   Demo logins: admin/demo123, program.user/demo123, hr.user/demo123, admin.user/demo123, employee/demo123.

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

- Server: `cd server && npm test` (health route test; requires `supertest` and Node test runner).

## Project structure

- `server/` - Express API (TypeScript), MongoDB/Mongoose, JWT auth, RBAC, CRUD for all modules, file upload, Excel export.
- `client/` - React SPA (TypeScript), Vite, React Router, React Query, role-based nav, module screens.
- `index.html` - Original wireframe reference.

## API

- Base: `http://localhost:5000/api` (dev) or same origin when using Vite proxy.
- Auth: `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`, `GET /api/auth/permissions`.
- Modules: `/api/projects`, `/api/activities`, `/api/budget`, `/api/expenses`, `/api/monitoring`, `/api/reports`, `/api/employees`, `/api/attendance`, `/api/leave`, `/api/recruitment`, `/api/performance`, `/api/payroll`, `/api/engagement`, `/api/calendar`, `/api/letters`, `/api/assets`, `/api/insurance`, `/api/travel`, `/api/stationery`, `/api/admin-expenses`, `/api/dashboard`, `/api/files`, `/api/export/activities`, `/api/export/employees`.
