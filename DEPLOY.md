# Deploy FWWB India – Web, Mobile, Backend

Use this guide to host the **backend**, **web app**, and **mobile app** (or run everything with Docker).

---

## Option A: Render (Backend) + Vercel (Web) + MongoDB Atlas

### 1. MongoDB Atlas (database)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a **free cluster** (e.g. M0).
3. **Database Access** → Add user (username + password). Note the password.
4. **Network Access** → Add IP `0.0.0.0/0` (allow from anywhere) for Render.
5. **Database** → Connect → **Drivers** → copy connection string. It looks like:
   `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/fwwb?retryWrites=true&w=majority`
6. Replace `USER` and `PASS` with your DB user and password. Use this as `MONGODB_URI`.

### 2. Backend on Render

1. Go to [render.com](https://render.com) and sign in (GitHub).
2. **New** → **Blueprint** → connect repo `giteshaggarwal123/FWWBIndia`.
3. Render will read `render.yaml`. If you prefer a manual service:
   - **New** → **Web Service** → connect **FWWBIndia**.
   - **Root Directory**: `server`.
   - **Build Command**: `npm install && npm run build`.
   - **Start Command**: `node dist/index.js`.
   - **Environment**:
     - `NODE_ENV` = `production`
     - `PORT` = `5000`
     - `MONGODB_URI` = (your Atlas connection string)
     - `JWT_SECRET` = (generate a long random string)
     - `JWT_REFRESH_SECRET` = (another long random string)
     - `CLIENT_URL` = (your web app URL, e.g. `https://your-app.vercel.app`)
4. Deploy. Note the backend URL, e.g. `https://fwwb-api.onrender.com`.

### 3. Web app on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub).
2. **Add New** → **Project** → import **FWWBIndia**.
3. **Root Directory**: leave as repo root.
4. **Build and Output**:
   - **Build Command**: `cd client && npm ci && npm run build`
   - **Output Directory**: `client/dist`
5. **Environment variables** (add before first deploy):
   - `VITE_API_URL` = `https://fwwb-api.onrender.com/api` (your Render backend URL + `/api`)
6. In **Render** backend, set **CLIENT_URL** = `https://your-project.vercel.app` (your Vercel URL) so CORS allows the web app.
7. Deploy. Your web app will be at `https://your-project.vercel.app`. Login and all API calls go to your Render backend.

### 4. Seed demo data (once)

After the backend is live and connected to Atlas:

- Either run locally: `MONGODB_URI="your-atlas-uri" npm run seed` (from repo root, or `cd server && npm run seed`).
- Or use Render **Shell** (if available) and run `npm run seed` in the `server` directory with the same env.

Demo logins: `admin` / `demo123`, `program.user` / `demo123`, etc.

### 5. Mobile app (Expo)

1. In **FWWBIndia** repo, open `mobile/src/config.ts`.
2. Set production API URL, e.g.:
   ```ts
   return 'https://fwwb-api.onrender.com/api';
   ```
   (or use an env variable / app config for different builds.)
3. Build and publish:
   - `cd mobile && npm install && npx eas build` (Expo EAS).
   - Or run `npx expo start` and use Expo Go with the same backend URL for testing.

---

## Option B: Docker (all-in-one on a VPS)

On a server with Docker and Docker Compose:

1. Clone the repo and `cd FWWBIndia`.
2. Create a `.env` file:
   ```env
   JWT_SECRET=your-secret
   JWT_REFRESH_SECRET=your-refresh-secret
   CLIENT_URL=http://localhost:3000
   ```
3. Run:
   ```bash
   docker-compose up --build -d
   ```
4. Open **http://YOUR_SERVER_IP:3000** for the web app. API: **http://YOUR_SERVER_IP:5000**.
5. Seed (one-off):  
   `docker-compose exec server node dist/scripts/seed.js`  
   or run seed script in a one-off container with same `MONGODB_URI`.

---

## Checklist

| Step | What to do |
|------|------------|
| DB | Create Atlas cluster, get `MONGODB_URI` |
| Backend | Deploy `server` on Render (or Docker), set env vars, get backend URL |
| Web | Deploy `client` on Vercel, set `VITE_API_URL`, add `/api` rewrite to backend |
| Seed | Run `npm run seed` once against production DB |
| Mobile | Point `mobile/src/config.ts` (or build env) to backend `/api` and build with EAS |

After this, the portal (web + mobile) and full backend are hosted and usable.
