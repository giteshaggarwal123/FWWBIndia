# Critical Gaps and Bugs – Web & Mobile Portal

**Audit date:** Based on codebase review (web client, mobile app, server).  
**Purpose:** Single reference for critical gaps and bugs that affect usability, correctness, or production readiness.

---

## Fixes applied in this audit

| Item | Portal | Fix |
|------|--------|-----|
| **Expense status “Settle”** | Web | **Fixed.** Added “Settle” button for approved expenses (same permission as Approve). Mobile already had it. |
| **Donor program 404** | Web | **Fixed.** Donor Program Detail now shows “Program not found.” on 404 and a generic error message on other failures instead of endless “Loading…”. |

---

## Critical gaps & bugs

### 1. **Mobile – Production API URL placeholder (Critical)**

**Where:** `mobile/src/config.ts`  
**Issue:** In non-`__DEV__` builds, `API_BASE_URL` is set to `'https://your-production-api.com/api'`. The app will fail all API calls in production until this is set to the real backend URL.

**Action:** Before releasing the mobile app, set `API_BASE_URL` via environment (e.g. EAS env vars) or replace the placeholder with the actual production API base URL. Similarly, set `WEB_PORTAL_URL` for “Open in browser” links in the More screen.

---

### 2. **Web – No user feedback when save/update fails (Medium)**

**Where:** Most pages using `useMutation` (Activities, Budget, Donors, Reports, Leave, etc.)  
**Issue:** Mutations typically have no `onError` or toast. If the API returns 4xx/5xx, the user may see no message; the modal might close or the list might not refresh, with no explanation.

**Action:** Add global error handling (e.g. toast or inline error state) for mutations, or add `onError` to each mutation that shows `response?.data?.message` or a generic “Save failed” message.

---

### 3. **Web – Expense “Settle” was missing (Fixed)**

**Where:** `client/src/pages/ExpensesPage.tsx`  
**Status:** **Fixed.** “Settle” button is now shown for approved expenses when the user has expense-approve permission. API already supported `status: 'settled'`.

---

### 4. **Web – Donor program detail error/404 handling (Fixed)**

**Where:** `client/src/pages/DonorProgramDetailPage.tsx`  
**Status:** **Fixed.** The page now uses `isError` and `error` from `useQuery` and shows “Program not found.” for 404 and “Failed to load program. Please try again.” for other errors, instead of showing “Loading…” indefinitely.

---

### 5. **Mobile – Refresh token in body (OK)**

**Where:** `server/src/routes/auth.ts` (POST `/auth/refresh`)  
**Status:** Server accepts `req.body?.refreshToken` in addition to cookie, so mobile (which sends refresh token in body) works. No change needed.

---

### 6. **Web – 401 and redirect to login (OK)**

**Where:** `client/src/api/client.ts`  
**Status:** Axios interceptor refreshes via cookie on 401 and redirects to `/login` if refresh fails. Behaviour is correct.

---

## Other observations (lower priority)

- **Login (web):** Error message is shown from catch block; good.
- **Mobile login:** Uses `result.ok` from AuthContext; error shown via `Alert.alert`. Good.
- **BulkImportModal (web):** Has `onError` and shows alert on import failure. Good.
- **LFA page (web):** Handles 404 and shows appropriate message. Good.
- **Documents:** Type and tags exist (model, API, UI). No gap.
- **Settings:** Org profile and FY list endpoints exist and persist. No gap.

---

## Summary

| Severity | Count | Notes |
|----------|-------|-------|
| **Critical** | 1 | Mobile production API URL must be set before release. |
| **Medium** | 1 | Web: mutation errors often not shown to user. |
| **Fixed** | 2 | Web: Expense Settle button; Donor program 404/error handling. |

For full feature/module gaps (donor reporting, LFA link, etc.), see `docs/FWWB_PLATFORM_GAP_REVIEW.md`.
