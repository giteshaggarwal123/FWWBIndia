# Holistic review – fixes applied

One-time review of the portal (web + mobile) for missing features and bugs. Summary of what was fixed.

---

## Bugs fixed

### Mobile

1. **Activities list empty** – The app uses a custom `fetch` API that returns `{ data, ok, status }`. When the server returns a **paginated** shape `{ data: [], total }` (e.g. from another client), the code was treating the whole object as the list. **Fix:** Normalize response so the list is always an array (use `data` when response is `{ data, total }`, otherwise use the response itself if it’s an array).

2. **Expenses list and filters** – Same pattern: ensure list state is set from an array. **Fix:** Use `Array.isArray(res.data)` and add try/catch so failed requests don’t leave stale state.

3. **Leave apply / approve–reject** – Leave apply and approve/reject were using `res.ok` (which is correct for the mobile API). **Fix:** Wrapped in try/catch so errors are shown and loading state is cleared; use `res.status >= 200 && res.status < 300` where applicable for consistency.

4. **ActivityFormScreen / ExpenseFormScreen** – Projects and activities load could fail silently. **Fix:** try/catch and handle both array and `{ data }` response for activities when project filter is used.

5. **Expense status update (mobile)** – On PATCH failure, show server message. **Fix:** try/catch and read `response.data.message` from error.

### Web

1. **Documents upload in production** – Upload and download used a fixed empty `API_BASE`, so in production (or when API is on another origin) upload could hit the wrong host. **Fix:** Use `VITE_API_URL` when set, otherwise fall back to `window.location.origin` so upload and download use the same base as the rest of the app.

2. **User Management in demo mode** – Editing a user and “Link to employee” call APIs that return 400 when the database is not connected (demo mode). **Fix:** Detect demo users (`_id.startsWith('demo-')`), show an explanatory message, disable form fields and Save so users don’t think the action failed for no reason.

---

## Features already present (no change)

- **Mobile:** Project and status filters on Activities and Expenses, Leave approve/reject on team list, budget head and bill upload on forms (already implemented in earlier work).
- **Web:** Documents (type + tags), Employees (reportingTo, employeeType), Activities (budget head dropdown), User Management (link employee), Reports (type/due), LFA (targets/progress), Dashboard (impact snapshot), Pagination (activities, employees).

---

## Not changed (by design)

- **Mobile:** Other screens (Dashboard, Monitoring, Forms, Attendance, Profile, etc.) use the same custom API that returns `{ data, ok, status }`; `.ok` is correct there. Only list/array responses that might be paginated were normalized.
- **Web:** No change to auth, routing, or other list pages beyond the items above.
- **Gap docs:** `WEB_FEATURES_STILL_MISSING.md` and `WEB_MOBILE_FEATURE_GAPS.md` still describe medium/lower priority items (e.g. role-based dashboard, notifications, payroll detail, map view). Those are left for future work.

---

*Review date: one-time holistic pass. Re-run as needed after major changes.*
