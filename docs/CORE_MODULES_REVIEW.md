# Web & Mobile Portal – Core Modules & Features Review

Thorough review of both web and mobile from **Program Management**, **HRMS**, **Analytics**, and general parity.  
*Generated from codebase review.*

---

## 1. WEB PORTAL – Module inventory

### Main
| Module | Route | Status | Notes |
|--------|--------|--------|------|
| Dashboard | `/dashboard` | ✅ Full | Program-wise KPIs, budget charts, activity/expense counts, alerts (insurance, travel, stationery, admin expenses). Uses `/dashboard` + `/alerts`. |
| Pending Approvals | `/approvals` | ✅ Full | Cards for leave, program expenses, admin expenses, travel, stationery; links to each module to act. Permission-based. |
| AI Insights / Analytics | `/analytics` | ✅ Full | Charts (activities, budget utilization), key metrics, over/under budget, achievement rates. Uses dashboard data. |
| Donor Portal | `/donor-portal` | ✅ | Donor view of programs. |
| Donor Management | `/donor-mgmt` | ✅ | Donors, grants. |
| User Management | `/user-mgmt` | ✅ | Users list, create/edit, link employee. |
| Audit Log | `/audit` | ✅ | Log list, export. |
| Settings | `/settings` | ✅ | Organization profile, FY; edit with user-mgmt/settings. |

### Program Management
| Module | Route | Status | Notes |
|--------|--------|--------|------|
| Programs | `/programs` | ✅ Full | CRUD projects, donor/partner, status, dates, budget ceiling. |
| Partner Management | `/partners` | ✅ | Partners CRUD. |
| LFA | `/lfa` | ✅ Full | Goal + objectives per project, indicators, target, baseline, progress entries. |
| Beneficiaries & Impact | `/beneficiaries` | ✅ | Entries by program, type, category, count, activity link. |
| Activities | `/activities` | ✅ Full | List, filters, add/edit, budget head, quarter, dates, Excel download/import. |
| Form Builder | `/form-builder` | ✅ Full | Create/edit forms, fields, view submissions, download .doc. |
| Monitoring | `/monitoring` | ✅ | Entries list, add/edit, project filter. |
| Budget | `/budget` | ✅ Full | Budget heads by project, add/edit, allocation/utilization. |
| Expenses & Bills | `/expenses` | ✅ Full | List, project/status filter, add/edit, verify/approve/reject/settle, upload. |
| Reports | `/reports` | ✅ Full | List, create report, project/type filter, Excel exports (activities, budget, team, submissions, monitoring). |
| Documents | `/documents` | ✅ | List, upload, filter. |

### HRMS
| Module | Route | Status | Notes |
|--------|--------|--------|------|
| Employees | `/employees` | ✅ Full | List, search, view, link to user. |
| Attendance | `/attendance` | ✅ | Team list, reports. |
| Leave | `/leave` | ✅ Full | Apply, my list, team list, **approve/reject**. |
| Recruitment | `/recruitment` | ✅ | Jobs, applications (API-backed). |
| Performance | `/performance` | ✅ | Reviews list, add/edit (API-backed). |
| Payroll | `/payroll` | ✅ | Payroll runs, process (API-backed). |
| Engagement | `/engagement` | ✅ | Surveys list, add/edit (API-backed). |
| HR Calendar | `/calendar` | ✅ | Events list, add/edit (API-backed). |
| Letters | `/letters` | ✅ Full | Templates, generate letter, view, download .doc. |
| ESS | `/ess` | ✅ | Profile + links to Leave, Attendance, Engagement, Calendar. |

### Administration
| Module | Route | Status | Notes |
|--------|--------|--------|------|
| Assets | `/assets` | ✅ | List, add/edit. |
| Stationery | `/stationery` | ✅ | Requests, approve. |
| Travel | `/travel` | ✅ | Requests, approve. |
| Insurance | `/insurance` | ✅ | Policies. |
| Admin Expenses | `/admin-expenses` | ✅ | List, approve. |

**Web summary:** All nav modules have dedicated pages and APIs. Dashboard, Analytics, Approvals, Programs, Activities, Budget, Expenses, Reports, Leave, Letters, Form Builder, LFA are feature-rich; Performance, Payroll, Engagement, Calendar, Recruitment are list + CRUD with backend.

---

## 2. MOBILE APP – What exists

### Tabs (role-based)
| Tab | Screen | Purpose |
|-----|--------|---------|
| Home | DashboardScreen | My analytics (attendance, leave, forms, pending leave), org counts (projects, activities, expenses, allocated, spent), **KPIs by program**, **alerts** (insurance, travel, stationery, admin). |
| Attendance | AttendanceScreen | My punch, team list (no approve; view only). |
| Leave | LeaveScreen | Apply leave, my leave, team leave (view only; **no approve/reject**). |
| Activities | ActivitiesScreen | List, add/edit (ActivityFormScreen). **No project filter.** Form may miss budget head / quarter. |
| Expenses | ExpensesScreen | List, add/edit (ExpenseFormScreen). **No project/status filter.** No verify/approve; no bill upload. |
| Forms | FormsScreen | Fill forms, submit; **My submissions** (view full, edit/resubmit). No form builder. |
| Monitoring | MonitoringScreen | List, add entry (MonitoringFormScreen). **No project filter.** |
| More | MoreScreen | Profile, change password, **links to full web portal** (Dashboard, Approvals, Programs, Budget, Reports, etc.), Logout. |

### Stack (detail screens)
- ActivityFormScreen, ExpenseFormScreen, MonitoringFormScreen, ProfileScreen.

**Mobile summary:** Field-focused: dashboard (with program KPIs + alerts), attendance, leave, activities, expenses, forms, monitoring. Approvals and admin/config are web-only via “More” links.

---

## 3. GAPS BY PERSPECTIVE

### 3.1 Program Management

| Need | Web | Mobile | Gap |
|------|-----|--------|-----|
| Program-wise dashboard | ✅ Full | ✅ Has program KPIs | None. |
| Create/edit programs | ✅ | ❌ | Mobile: use web (More → Programs). |
| LFA (goal, objectives, indicators) | ✅ | ❌ | Mobile: use web. |
| Beneficiaries & impact | ✅ | ❌ | Mobile: use web. |
| Activities (list, add/edit, filters) | ✅ Full | ✅ List + add/edit | Mobile: **no project filter**; activity form may omit **budget head / quarter** (see WEB_MOBILE_FEATURE_GAPS.md). |
| Form builder (create forms) | ✅ | ❌ | Mobile: fill & submit only; create on web. |
| Monitoring entries | ✅ | ✅ | Mobile: **no project filter**. |
| Budget (heads, allocation) | ✅ | ❌ | Mobile: use web. |
| Expenses (list, submit, verify/approve) | ✅ Full | ✅ List + submit | Mobile: **no project/status filter**; **no verify/approve**; **no bill/receipt upload**. |
| Reports & Excel exports | ✅ | ❌ | Mobile: use web. |
| Documents | ✅ | ❌ | Mobile: use web. |
| Donors / Partners | ✅ | ❌ | Mobile: use web. |

**Core program gaps (mobile):** Project filter on Activities, Expenses, Monitoring; budget head (and quarter where relevant) in activity/expense forms; expense verify/approve and bill upload on mobile if program managers are to act from the field.

---

### 3.2 HRMS

| Need | Web | Mobile | Gap |
|------|-----|--------|-----|
| Leave apply + my list | ✅ | ✅ | None. |
| Leave approve/reject | ✅ | ❌ | Mobile: team leave is **view only**; managers must use web (or add approve/reject in app). |
| Attendance (punch, my/team list) | ✅ | ✅ | Mobile: no admin reports/calendar view (web has). |
| Employees list | ✅ | ❌ | Mobile: use web (More). |
| Recruitment | ✅ | ❌ | Mobile: use web. |
| Performance reviews | ✅ | ❌ | Mobile: use web. |
| Payroll | ✅ | ❌ | Mobile: use web. |
| Engagement surveys | ✅ | ❌ | Mobile: use web. |
| HR Calendar / events | ✅ | ❌ | Mobile: use web. |
| Letters (templates, generate, download) | ✅ | ❌ | Mobile: use web. |
| ESS (profile + shortcuts) | ✅ | ✅ (Profile in More) | Mobile: profile + change password; ESS links only on web. |

**Core HRMS gap (mobile):** **Leave approve/reject** not on mobile; everything else HRMS is either on mobile (leave apply, attendance) or intentionally web-only (employees, recruitment, payroll, etc.).

---

### 3.3 Analytics & insights

| Need | Web | Mobile | Gap |
|------|-----|--------|-----|
| AI Insights / Analytics page | ✅ Full | ❌ | Mobile: no dedicated analytics; dashboard has counts + program KPIs + alerts. |
| Dashboard (org + program-wise) | ✅ | ✅ | Mobile has program-wise KPIs and alerts. |
| Alerts (insurance, travel, stationery, admin) | ✅ | ✅ | Both use `/alerts`. |
| Charts (budget, activities) | ✅ (Dashboard + Analytics) | ❌ | Mobile: numbers only, no charts. |

**Core analytics gap (mobile):** No **Analytics / AI Insights** screen (charts, over/under budget, achievement). Dashboard gives key numbers and program KPIs but not the full analytics view.

---

### 3.4 Approvals

| Need | Web | Mobile | Gap |
|------|-----|--------|-----|
| Pending approvals hub | ✅ | ❌ | Mobile: use web (More → Pending Approvals). |
| Leave approve/reject | ✅ | ❌ | Mobile: no action. |
| Expense verify/approve | ✅ | ❌ | Mobile: no action. |
| Admin expense / travel / stationery approve | ✅ | ❌ | Mobile: use web. |

**Core approvals gap (mobile):** All approval actions are **web-only**. Mobile shows team leave but no approve/reject; no expense or other approval flows on mobile.

---

## 4. WEB PORTAL – Possible gaps / enhancements

- **Dashboard:** Role-based widgets, impact snapshot, overdue reports / expiring grants (as in MODULE_WISE_NGO_MIS_GAPS.md) – not required for “core,” but useful.
- **LFA:** Indicator targets/baseline, progress entry, activity–LFA link – partially there; can be deepened.
- **Beneficiaries:** Disaggregation in filters/charts – can be enhanced.
- **Reports:** Templates, due dates, generate PDF – list + Excel exists; templates/PDF optional.
- **ESS:** Currently profile + links; could add payslips, documents, leave balance summary if APIs exist.

No **missing core module** on web; all nav items have a page and backend. Some modules (e.g. Performance, Payroll, Engagement, Calendar) are list + CRUD and can be extended later.

---

## 5. Summary table – Core modules

| Area | Web | Mobile | Main mobile gaps |
|------|-----|--------|-------------------|
| **Program mgmt** | Full (programs, LFA, beneficiaries, activities, budget, expenses, monitoring, reports, form builder, documents) | Dashboard + activities + expenses + forms + monitoring | Project filter (activities, expenses, monitoring); budget head/quarter in forms; expense verify/approve + bill upload. |
| **HRMS** | Full (employees, attendance, leave, recruitment, performance, payroll, engagement, calendar, letters, ESS) | Attendance, leave (apply + view), profile | Leave **approve/reject** on mobile. |
| **Analytics** | Dashboard + AI Insights (charts, metrics, alerts) | Dashboard (counts, program KPIs, alerts) | No **Analytics / AI Insights** screen; no charts on mobile. |
| **Approvals** | Approvals hub + leave/expense/admin/travel/stationery actions | None (links to web) | All approval actions web-only. |

---

## 6. Recommended priorities (from review)

**High (mobile – field usability)**  
1. **Leave approve/reject** on mobile (from team leave list).  
2. **Project filter** on Activities, Expenses, and Monitoring lists (mobile).  
3. **Budget head** (and quarter where applicable) in Activity and Expense forms on mobile.

**Medium (mobile – parity)**  
4. **Expense verify/approve** on mobile (for program managers).  
5. **Bill/receipt upload** when submitting expense from mobile.  
6. **Status filter** on Expenses list on mobile.  
7. **Analytics / AI Insights** on mobile (simplified charts + key metrics, or deep link to web).

**Lower**  
8. Excel export/import on mobile (often done on web).  
9. New mobile screens for Programs, Budget, Donors, Reports, etc. only if field staff need them; otherwise “More” → web is enough.

---

*Review based on: `client/src/config/nav.ts`, `client/src/App.tsx`, `mobile/src/navigation/AppNavigator.tsx`, `mobile/src/screens/*`, and `docs/WEB_MOBILE_FEATURE_GAPS.md`.*
