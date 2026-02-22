# Deploy Mobile App (Web) to Vercel

The mobile app can run in the browser. Deploy it as a separate Vercel project.

## Step 1: Create New Vercel Project

1. Go to **https://vercel.com** → **Add New** → **Project**
2. Import the **FWWBIndia** repository (same repo as web portal)
3. Configure:
   - **Project Name:** `fwwb-mobile` (or any name)
   - **Root Directory:** Click **Edit** → set to `mobile`
   - **Framework Preset:** Other
   - **Build Command:** `npm ci && npx expo export --platform web`
   - **Output Directory:** `dist`
4. **Environment Variables:** None required (API URL is in config)
5. Click **Deploy**

## Step 2: Update Render CORS (if needed)

The backend allows `*.vercel.app` origins. If your mobile URL is `https://fwwb-mobile.vercel.app`, it will work automatically.

## Step 3: Access the Mobile App

Open your Vercel URL (e.g. `https://fwwb-mobile.vercel.app`) in a browser or on a phone.

**Login:** Use `program.user` / `demo123` (or other demo users).

## URLs Summary

| App | URL |
|-----|-----|
| Web Portal | https://fwwb-india.vercel.app |
| Mobile App (Web) | https://fwwb-mobile.vercel.app |
| Backend API | https://fwwbindia.onrender.com |
