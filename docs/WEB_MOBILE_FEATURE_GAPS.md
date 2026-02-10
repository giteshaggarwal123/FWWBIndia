# Web vs Mobile – Feature & Module Gaps

This document lists **module and feature gaps** between the **web portal** and the **mobile app**: what exists on one platform but not the other, and what’s incomplete in shared modules.

---

## 1. Modules only on WEB (missing on mobile)

| Module | Web route | Mobile | Note |
|--------|-----------|--------|------|
| **Dashboard (program-wise)** | `/dashboard` | Has basic dashboard | Web has **program-wise KPIs** table; mobile has org-level + “My analytics” only. |
| **Pending Approvals** | `/approvals` | ❌ | Leave/expense/travel/stationery/admin-expense approvals are **web only**. |
| **AI Insights / Analytics** | `/analytics` | ❌ | — |
| **Donor Portal** | `/donor-portal`, `/donor-portal/program/:id` | ❌ | — |
| **Donor Management** | `/donor-mgmt` | ❌ | Donors, grants, agreements. |
| **User Management** | `/user-mgmt` | ❌ | — |
| **Audit Log** | `/audit` | ❌ | Web has Export CSV. |
| **Partner Management** | `/partners` | ❌ | — |
| **LFA (Logical Framework)** | `/lfa` | ❌ | — |
| **Beneficiaries & Impact** | `/beneficiaries` | ❌ | — |
| **Settings** | `/settings` | ❌ | Org profile, FY, etc. |
| **Programs** | `/programs` | ❌ | Create/edit programs. |
| **Budget** | `/budget` | ❌ | — |
| **Reports** | `/reports` | ❌ | — |
| **Documents** | `/documents` | ❌ | — |
| **Form Builder** | `/form-builder` | ❌ | Mobile has **Forms** (fill & submit), not create/edit forms. |
| **Recruitment** | `/recruitment` | ❌ | — |
| **Employees** | `/employees` | ❌ | — |
| **Attendance (admin)** | `/attendance` | Has Attendance tab | Web: full team list, reports; mobile: my punch + team list (no admin reports). |
| **Leave (admin)** | `/leave` | Has Leave tab | Web: full leave management + **approve/reject**; mobile: apply + my list + **team list view only** (no approve/reject). |
| **Performance** | `/performance` | ❌ | — |
| **Payroll** | `/payroll` | ❌ | — |
| **Engagement** | `/engagement` | ❌ | — |
| **Calendar** | `/calendar` | ❌ | — |
| **Letters** | `/letters` | ❌ | Templates, generate, view, download. |
| **ESS** | `/ess` | ❌ | — |
| **Assets** | `/assets` | ❌ | — |
| **Insurance** | `/insurance` | ❌ | — |
| **Travel** | `/travel` | ❌ | Request + approve. |
| **Stationery** | `/stationery` | ❌ | — |
| **Admin Expenses** | `/admin-expenses` | ❌ | — |

---

## 2. Shared modules – feature gaps (web has it, mobile doesn’t)

### Activities
| Feature | Web | Mobile |
|---------|-----|--------|
| List + filter by project | ✅ | ✅ (list only, no project filter) |
| Add/Edit activity | ✅ | ✅ |
| **Project filter dropdown** | ✅ | ❌ |
| **Budget head** (column + form) | ✅ | ❌ (form doesn’t send `budgetHead`) |
| **Quarter, start/end date** | ✅ | ❌ (form has quarter in type but not sent in body in some flows) |
| **Download Excel** | ✅ | ❌ |
| **Import from Excel** | ✅ | ❌ |

### Expenses
| Feature | Web | Mobile |
|---------|-----|--------|
| List + project/status filter | ✅ | ✅ (list only, no filters) |
| Add/Edit expense | ✅ | ✅ |
| **Project filter** | ✅ | ❌ |
| **Status filter** | ✅ | ❌ |
| **Budget head** (for utilization) | ✅ | ❌ (form has category only, no `budgetHead`) |
| **Bill/receipt upload** | ✅ | ❌ |
| **Verify/Approve/Reject/Settle** (in list) | ✅ | ❌ (view only) |
| **Import from Excel** | ✅ | ❌ |

### Leave
| Feature | Web | Mobile |
|---------|-----|--------|
| Apply leave | ✅ | ✅ |
| My leave list | ✅ | ✅ |
| Team leave list | ✅ | ✅ |
| **Approve / Reject** (for managers) | ✅ | ❌ (team list is view-only) |

### Attendance
| Feature | Web | Mobile |
|---------|-----|--------|
| Check-in / Check-out (with location) | ✅ (web can have) | ✅ |
| My attendance / today | ✅ | ✅ |
| Team list | ✅ | ✅ |
| **Admin reports / calendar view** | ✅ | ❌ |

### Dashboard
| Feature | Web | Mobile |
|---------|-----|--------|
| Org-level counts (projects, activities, expenses, allocated, spent) | ✅ | ✅ |
| **Program-wise summary** (KPIs by program) | ✅ | ❌ |
| My analytics (attendance, leave, forms) | ✅ | ✅ |

### Monitoring
| Feature | Web | Mobile |
|---------|-----|--------|
| List entries | ✅ | ✅ |
| Add entry (form) | ✅ | ✅ (MonitoringFormScreen) |
| **Project filter** | ✅ | ❌ |
| **Indicators / LFA link** (if any on web) | Web may have more fields | Mobile form is basic |

### Forms (data collection)
| Feature | Web | Mobile |
|---------|-----|--------|
| **Create / edit forms** (Form Builder) | ✅ | ❌ (mobile only fills & submits) |
| List forms, submit response | ✅ | ✅ |
| My submissions | ✅ | ✅ |
| **Analytics by form** | Web has list/download | Mobile: list only |

### Profile
| Feature | Web | Mobile |
|---------|-----|--------|
| View profile, change password | ✅ (e.g. ESS/settings) | ✅ (ProfileScreen) |

---

## 3. Summary – what’s “left” as gaps

### Mobile app – missing or weaker

1. **No approvals on mobile** – Leave approve/reject, expense verify/approve, travel/stationery/admin-expense approvals are web-only. Mobile shows team leave but no actions.
2. **No project/status filters** on Activities and Expenses lists.
3. **No budget head** on mobile Activity and Expense forms (utilization tracking is web-only for these).
4. **No Excel** – Download or Import from Excel for activities/expenses on mobile.
5. **No bill/receipt upload** on expense submit from mobile.
6. **Dashboard** – No program-wise KPIs on mobile.
7. **All admin/config modules** – Donors, Programs, Budget, Settings, LFA, Beneficiaries, Reports, Documents, Letters, User/Employee/Recruitment, Payroll, Performance, Engagement, Calendar, ESS, Assets, Insurance, Travel, Stationery, Admin Expenses, Audit, Partners, Form Builder (create forms), Analytics – **web only**.

### Web portal – optional enhancements (from MODULE_WISE_NGO_MIS_GAPS.md)

- Dashboard: role-based widgets, impact snapshot, alerts (overdue reports, expiring grants).
- LFA: indicator targets/baseline, progress entry, activity ↔ LFA link.
- Beneficiaries: full disaggregation in UI filters/charts.
- Reports: templates, due dates, generate PDF/Excel.
- Documents: document type/tags in upload and filters.
- Employee: reporting-to, employee type in UI.
- Others as in `docs/MODULE_WISE_NGO_MIS_GAPS.md`.

---

## 4. Recommended priority for closing gaps

**High (mobile – field usability)**  
- Add **project filter** to Activities and Expenses on mobile.  
- Add **budget head** to Activity and Expense forms on mobile (and optionally show in list).  
- Add **Leave approve/reject** on mobile for managers (e.g. from team leave list).  
- Optional: **Expense verify/approve** on mobile for program managers.

**Medium (mobile – parity)**  
- **Program-wise summary** on mobile dashboard (same API as web).  
- **Bill/receipt upload** when submitting expense from mobile.  
- **Status filter** on Expenses list on mobile.

**Lower**  
- Excel export/import on mobile is lower priority (often done on web).  
- New mobile screens for Donors, Programs, Budget, etc. only if field staff need them; otherwise web-only is acceptable.

---

*Generated from current codebase: web routes in `client/src/App.tsx`, mobile tabs/stack in `mobile/src/navigation/AppNavigator.tsx`, and feature comparison of shared screens.*
