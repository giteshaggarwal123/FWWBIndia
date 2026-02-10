# Screenshots for Portal Demo

Place all images in this folder structure. The HTML presentation loads them by path (e.g. `screenshots/web/login.png`). Use PNG or JPG; keep filenames exactly as below.

## Folder structure

```
docs/demo/screenshots/
├── overview.png          (optional) Web + mobile side by side
├── web/
│   ├── login.png
│   ├── dashboard.png
│   ├── approvals.png
│   ├── analytics.png
│   ├── donor-portal.png
│   ├── donor-mgmt.png
│   ├── user-mgmt.png
│   ├── audit.png
│   ├── settings.png
│   ├── programs.png
│   ├── partners.png
│   ├── lfa.png
│   ├── beneficiaries.png
│   ├── activities.png
│   ├── form-builder.png
│   ├── monitoring.png
│   ├── budget.png
│   ├── expenses.png
│   ├── reports.png
│   ├── documents.png
│   ├── employees.png
│   ├── attendance.png
│   ├── leave.png
│   ├── recruitment.png
│   ├── performance.png
│   ├── payroll.png
│   ├── engagement.png
│   ├── calendar.png
│   ├── letters.png
│   ├── ess.png
│   ├── assets.png
│   ├── stationery.png
│   ├── travel.png
│   ├── insurance.png
│   └── admin-expenses.png
└── mobile/
    ├── login.png
    ├── home.png
    ├── attendance.png
    ├── leave.png
    ├── activities.png
    ├── activity-form.png
    ├── expenses.png
    ├── expense-form.png
    ├── forms.png
    ├── monitoring.png
    ├── more.png
    └── profile.png
```

## How to capture

- **Web:** Run the client (`npm run dev`), open in browser, log in, then visit each route and capture full-page or main content. Save with the exact filename (e.g. `approvals.png` for the Pending Approvals page). Landscape/browser aspect is fine.
- **Mobile:** Run the app in an emulator or on a **physical device in portrait orientation**. Capture each screen (login, home, attendance, leave, etc.) in **portrait, mobile aspect ratio** (e.g. 9:19.5 or your device resolution like 375×812). Do **not** use landscape or web-style aspect ratio—the presentation displays mobile screens in a phone-shaped portrait frame. Save as `home.png`, `attendance.png`, etc.
- **Optional:** Use `docs/demo/capture-web-screenshots.js` (with Puppeteer) to automate web screenshots.
