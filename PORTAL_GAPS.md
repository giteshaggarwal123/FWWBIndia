# Portal Gap Analysis – What Is Still Missing

This document lists **gaps, missing features, and inconsistencies** found across the FWWB MERN portal (web client, API, and integration). Use it to prioritize fixes and enhancements.

---

## 1. Missing or Incomplete Features

### 1.1 Bulk Import – No UI
- **Backend:** `POST /api/bulk-import/activities`, `POST /api/bulk-import/expenses`, `POST /api/bulk-import/parse-excel` exist and work.
- **Gap:** There is **no frontend page** for bulk import. Users cannot upload an Excel file or paste/preview rows from the portal.
- **Suggestion:** Add a “Bulk Import” page (e.g. under Program Management or Activities/Expenses) with:
  - File upload or paste → call `parse-excel` for preview.
  - Program/project selector and “Import” → call `bulk-import/activities` or `bulk-import/expenses`.
  - Success/error feedback and optional link to Activities/Expenses list.

### 1.2 Travel – Ticket/Invoice Upload
- **Backend:** `TravelRequest` has `ticketAttachmentId` (ref `FileAttachment`).
- **Gap:** **Travel request form has no file upload.** Users cannot attach ticket or invoice from the UI.
- **Suggestion:** On Travel add/edit form, add optional file upload; on save, upload via `/api/files/upload` with `refModel: 'TravelRequest'` and `refId: requestId` (or `_id`), then PATCH travel with `ticketAttachmentId`.

### 1.3 Program Expenses – Bill/Receipt Upload
- **Backend:** `FileAttachment` supports `refModel` / `refId`; expenses can be linked to documents.
- **Gap:** **Expense add/edit form has no attachment field.** No way to attach a bill or receipt to an expense from the portal.
- **Suggestion:** Add optional “Attach bill/receipt” on expense form; upload to `/api/files/upload` with `refModel: 'Expense'`, `refId: expense._id`, and show link/download in list or detail.

### 1.4 Admin Expenses – Receipt/Bill Attachment
- **Backend:** AdminExpense model and API exist; file attachment could use same `FileAttachment` pattern.
- **Gap:** No UI to attach a receipt or bill to an admin expense.
- **Suggestion:** Same as 1.3: optional file upload linked to admin expense via `refModel`/`refId`.

---

## 2. Approval Matrix Gaps

### 2.1 Stationery – No Approval Matrix
- **Current:** Anyone with `stationery` permission can Approve/Reject stationery requests (no role check on PATCH).
- **Gap:** Stationery is **not** in the approval matrix; there is no “who can approve stationery” rule.
- **Suggestion:** Either:
  - Add stationery to `server/src/config/approvalMatrix.ts` (e.g. admin, management) and enforce in `PATCH /stationery/:id` when status is approved/rejected, and gate Approve/Reject in the UI by approval permission, or
  - Document that stationery is intentionally “any stationery user can approve” and leave as is.

### 2.2 Letters / Other Workflows
- Letters, and any other “pending → approved” flows, are not in the central approval matrix. If more workflows need controlled approvers, they should be added to the matrix and enforced similarly.

---

## 3. Dashboard & Alerts

### 3.1 Admin Expenses Count in Alerts
- **Backend:** `/api/alerts` returns `adminExpensesThisMonth` (count of approved admin expenses this month).
- **Gap:** The **dashboard alerts section does not display** this value (only insurance, warranty, travel pending, stationery pending).
- **Suggestion:** Optionally add a line such as “Admin expenses approved this month: X” in the alerts box, or a small summary card.

---

## 4. Audit Trail

### 4.1 Partial Audit Coverage
- **Current:** `recordAudit()` is used only in **donors** and **projects** (create).
- **Gap:** Other important actions (user create/update, leave approve, expense approve, budget/activity create/update, etc.) do **not** call `recordAudit`, so the audit log is incomplete.
- **Suggestion:** Add `recordAudit(req, action, entityType, entityId, details)` in key routes (e.g. users, leave PATCH, expenses PATCH, activities, budget, admin-expenses, travel) for create/update/delete and status changes.

### 4.2 Audit Route Permission
- **Current:** `requireRole('user-mgmt', 'management', 'audit')` – `'management'` is a **role type**, not a module key in `ROLE_PERMISSIONS`, so it never grants access.
- **Effect:** Access is effectively only via `user-mgmt` or `audit`. Management still has `audit` in their list, so they can access; the extra `'management'` is redundant and misleading.
- **Suggestion:** Use only module keys, e.g. `requireRole('user-mgmt', 'audit')`.

---

## 5. Frontend / UX

### 5.1 Unused PlaceholderPage
- **File:** `client/src/pages/PlaceholderPage.tsx` exists but is **not used** in any route.
- **Suggestion:** Remove it, or use it for “coming soon” routes if needed.

### 5.2 Documents Upload – API Base
- **Current:** Documents page uses `fetch('')` with relative `/api/files/upload` and `/api/files/${id}` for download. With Vite proxy to `localhost:5000`, this works in dev.
- **Gap:** In production, if the client is served from a different origin than the API, relative `/api` may fail unless the same proxy or base URL is configured.
- **Suggestion:** Use the same `api` client base URL (or a configurable `API_BASE`) for file upload and download so production builds work when API is on a different host.

### 5.3 Pagination
- **Current:** Most list APIs return all matching records (with optional filters); no server-side pagination.
- **Gap:** For large datasets (activities, expenses, employees, audit, etc.), lists can become slow or heavy.
- **Suggestion:** Add optional `?page=1&limit=20` (or similar) to key list endpoints and to DataTable usage on the client for large modules.

### 5.4 Error Boundary
- **Current:** No React error boundary in the app.
- **Gap:** A runtime error in any component can blank the whole app.
- **Suggestion:** Add an error boundary at layout level (e.g. in `App.tsx` or `DashboardLayout`) with a fallback UI and optional “Reload” / “Go home”.

---

## 6. Optional / Future (Per REQUIREMENTS_COVERAGE)

- **IDP (Individual Development Plan), 360 PMS, Exit process** – Documented as optional/future; not in scope for current gap-fix.
- **ESS** – ESS page exists and shows profile + links to Leave, Attendance, Engagement, Calendar; no major gap for current scope.

---

## 7. Summary Table

| Area              | Gap                                      | Priority (suggested) |
|-------------------|------------------------------------------|----------------------|
| Bulk Import       | No UI for Excel bulk import              | High                 |
| Travel            | No ticket/invoice upload in form         | Medium               |
| Program Expenses  | No bill/receipt attachment               | Medium               |
| Admin Expenses    | No receipt attachment                    | Low                  |
| Stationery        | No approval matrix / role check         | Medium               |
| Dashboard         | adminExpensesThisMonth not shown         | Low                  |
| Audit             | Only donors/projects recorded; expand    | Medium               |
| Audit             | requireRole uses invalid 'management'    | Low                  |
| Frontend          | Remove or use PlaceholderPage            | Low                  |
| Frontend          | Documents API base in production         | Medium               |
| Frontend          | Pagination for large lists               | Medium (when needed) |
| Frontend          | Error boundary                           | Medium               |

---

## 8. What Is Already in Good Shape

- **Program filter** – Applied across Activities, Budget, Monitoring, Expenses, Reports, LFA, Beneficiaries, Documents, Form Builder.
- **Approval matrix** – Implemented and enforced for Leave, Program expenses (verify/approve with threshold), Admin expenses, Travel; UI gated by approval permissions; Pending Approvals page and nav.
- **Donor portal** – Donor-filtered programs when `user.type === 'donor'` and `donorName` set; view-only.
- **Export** – Excel export used from Activities, Budget, Reports, Employees; API and client paths aligned.
- **Alerts API** – Used on dashboard for insurance, warranty, travel, stationery; only admin-expenses count not shown.
- **Auth & RBAC** – Login, refresh, permissions, approval permissions; role-based nav and module access.
- **Routes & nav** – App routes and `NAV_SECTIONS` align; no route points to PlaceholderPage.

Fixing the items above will bring the portal closer to full requirement coverage and a consistent, production-ready experience.
