# FWWB Platform – Full Gap Review (Web + Mobile)

**Purpose:** Single reference for feature and module gaps from an FWWB (Friends of Women's World Banking) NGO perspective, after a full pass over the web and mobile codebase.

**Context:** FWWB India needs an integrated MIS for programme cycle (design → budget → activities → monitoring → expenses → donor reporting), HR, admin, donor visibility, and field staff on mobile.

---

## 1. Current State Summary

### 1.1 Web portal – modules present

| Section | Modules | Status |
|--------|---------|--------|
| **Main** | Dashboard, Pending Approvals, AI Insights, Donor Portal, Donor Management, User Management, Audit Log, Settings | All present; Dashboard/Analytics role-gated; Donor Portal filters by donor when user is donor type. |
| **Program Management** | Programs, Partner Management, LFA, Beneficiaries & Impact, Activities, Form Builder, Monitoring, Budget, Expenses & Bills, Reports, Documents | All present; Programs has Donor + Partner dropdowns. |
| **HRMS** | Employees, Attendance, Leave, Recruitment, Performance, Payroll, Engagement, HR Calendar, Letters, ESS | All present. |
| **Administration** | Assets, Stationery, Travel, Insurance, Admin Expenses | All present. |

**Web:** No missing core module. Role-based access (management, program, hr, admin, employee, donor) and route-level permission checks are in place.

### 1.2 Mobile app – modules present

| Area | Screens / features | Status |
|------|--------------------|--------|
| **Tabs** | Home, Attendance, Leave, Activities, Expenses, Forms, Monitoring, More | All present; tabs shown by permission. |
| **Home** | Org counts, program-wise KPIs, alerts (insurance, travel, stationery, admin), my analytics | Present. |
| **Activities** | List, project filter, add/edit, budget head, quarter, start/end date | Present. |
| **Expenses** | List, project + status filters, add/edit, budget head, bill/receipt upload, verify/approve/reject/settle | Present. |
| **Leave** | Apply, my leave, team leave, **approve/reject** (for managers) | Present. |
| **Forms** | List by project, fill & submit, my submissions (view full, edit/resubmit) | Present. |
| **Monitoring** | List, project filter, add entry | Present. |
| **More** | Profile, change password, links to full web portal, logout | Present. |

**Mobile:** Field-focused parity is largely in place: project filters, budget head/quarter in forms, leave approve/reject, expense actions and bill upload, monitoring with project filter.

---

## 2. Gaps from FWWB Perspective

### 2.1 Programme & design

| Gap | Web | Mobile | Priority | Notes |
|-----|-----|--------|----------|------|
| **Program ↔ Partner** | ✅ Programs has Partner dropdown; Partners page exists | N/A | — | Done. |
| **LFA (framework per program)** | ✅ LFA page exists | ❌ | Low | Field staff use web for LFA if needed. |
| **Grant period / budget ceiling** | ✅ Programs has grant dates, budget ceiling | N/A | — | Done. |
| **Activity ↔ LFA link** | Partial | N/A | Medium | Activity has `lfaObjectiveRef`; UI dropdown “Link to LFA output” in Activity form would improve traceability. |
| **Budget head dropdown in Activity (web)** | Partial | ✅ Mobile has budget head in form | Low | Web activity form could offer dropdown from program budget heads instead of free text. |

### 2.2 Donors & accountability

| Gap | Web | Mobile | Priority | Notes |
|-----|-----|--------|----------|------|
| **Donor Portal – filter by donor** | ✅ | N/A | — | Backend filters programs by `donorName` when user is donor type. |
| **Donor Management – grant/tranche tracking** | ❌ | N/A | Medium | Donors are contact entities; no “grant amount”, “grant period”, “tranches”, “pledge vs received”. |
| **Donor reporting schedule** | ❌ | N/A | Medium | No “due reports” or “reporting calendar” per donor/program. |
| **Donor report template** | ❌ | N/A | Medium | Reports are generic; no “Donor report” type pulling program + budget + expenses + beneficiary summary. |
| **Agreement/MoU link per donor** | ❌ | N/A | Low | No link to document (e.g. agreement) per donor. |

### 2.3 Beneficiaries & impact

| Gap | Web | Mobile | Priority | Notes |
|-----|-----|--------|----------|------|
| **Beneficiaries module** | ✅ Page exists | ❌ | — | Web-only is acceptable; field data can be entered on web or via forms. |
| **Disaggregation (gender, age, geography, social category)** | Partial | N/A | Medium | Beneficiary type/category exist; gender, age band, geography, SC/ST/OBC as structured fields would help donor/statutory reporting. |
| **Impact dashboard** | ❌ | N/A | Medium | No summary “beneficiaries by program/partner/type” with simple charts. |
| **Beneficiary/outcome in Donor Portal** | ❌ | N/A | Medium | Donor program detail shows activities, budget, expenses; no beneficiary or outcome summary. |
| **Activity → beneficiary count / type** | Partial | N/A | Low | Activity has participants; no structured link to Beneficiary module for aggregation. |

### 2.4 M&E and reporting

| Gap | Web | Mobile | Priority | Notes |
|-----|-----|--------|----------|------|
| **Monitoring ↔ LFA indicators** | Partial | N/A | Medium | Monitoring has entries; no structured “indicator id → value” linked to LFA. |
| **Report templates & due dates** | ❌ | N/A | Medium | No report templates (e.g. “Quarterly Donor Report”), no reporting schedule or overdue flag. |
| **Generate report document (PDF/Excel)** | Partial | N/A | Medium | “Generate Report” creates a record; actual PDF/Excel from template and “Download generated report” not verified. |
| **Form submissions analytics** | Partial | N/A | Low | Submissions list/download exist; “responses by question” or simple analytics per form would help. |
| **Export audit log** | ❌ | N/A | Low | Audit log list exists; no “Export audit log” (Excel/CSV) for compliance. |

### 2.5 Finance

| Gap | Web | Mobile | Priority | Notes |
|-----|-----|--------|----------|------|
| **Budget utilization from expenses** | Partial | N/A | Medium | Budget has allocated/utilized; clarify if utilized is auto-updated from approved expenses by head; “sync from expenses” if not. |
| **Donor-wise / grant-wise budget** | ❌ | N/A | Low | Budget is project-wise; no “donor” or “grant” dimension for multi-donor programs. |
| **Expense settlement (payment date, voucher)** | Partial | N/A | Low | Status includes “settled”; optional payment date/voucher number for finance closure. |
| **FY selector (global)** | Partial | N/A | Low | Budget uses financialYear; no central “current FY” or FY dropdown in header/settings. |

### 2.6 HRMS

| Gap | Web | Mobile | Priority | Notes |
|-----|-----|--------|----------|------|
| **User ↔ Employee link in UI** | Partial | N/A | Medium | Link (userId) exists; explicit “link user to employee” in User Management would help leave/attendance/payroll consistency. |
| **Letters ↔ recruitment/exit** | Partial | N/A | Low | Letters module exists; link to recruitment (offer) / exit (experience) may be partial. |
| **Org chart / reporting-to** | ❌ | N/A | Low | No “reporting to” or org chart view. |
| **Employee photo / document** | ❌ | N/A | Low | No employee photo or ID proof upload. |

### 2.7 Administration & governance

| Gap | Web | Mobile | Priority | Notes |
|-----|-----|--------|----------|------|
| **Documents – folders / taxonomy / tags** | Partial | N/A | Low | Files by refModel/refId; no folders or “document type” (proposal, agreement, report); no tags for filtering. |
| **Compliance checklist** | ❌ | N/A | Low | No checklist (e.g. FCRA, audit) or due-date reminders. |
| **Settings – org profile** | Partial | N/A | Low | Org name/FY may be in settings; no editable “Organization profile” from backend (e.g. logo, FY list, default currency). |

### 2.8 Dashboard & analytics

| Gap | Web | Mobile | Priority | Notes |
|-----|-----|--------|----------|------|
| **Program-wise / donor-wise KPIs on dashboard** | Partial | ✅ Mobile has program KPIs | Low | Web dashboard has org-level and program-wise; optional donor-wise drill-down. |
| **Role-based dashboard widgets** | ❌ | N/A | Low | Same view for all; optional “My pending items” or “Programs I manage”. |
| **Impact snapshot on dashboard** | ❌ | N/A | Medium | No beneficiary/outcome summary (e.g. “X beneficiaries reached this quarter”). |
| **AI Insights – LFA/indicator trends** | ❌ | N/A | Low | Charts use activity/budget; no LFA indicator progress or outcome trends. |
| **Analytics / AI Insights on mobile** | N/A | ❌ | Low | Mobile has dashboard with counts and program KPIs; no dedicated Analytics screen (optional deep link to web). |

---

## 3. Priority Overview (FWWB)

### High (programme & donor accountability)

- **Donor report template / schedule:** Structured donor report type and reporting due dates per program/donor.
- **Donor Management – grant/tranche tracking:** Grant amount, period, tranches, pledge vs received.
- **Impact snapshot / beneficiary summary for donors:** Beneficiary or outcome summary in Donor Portal and optionally on main dashboard.

### Medium (M&E, impact, finance, HR)

- **Activity ↔ LFA link in UI:** Dropdown in Activity form to link to LFA output/objective.
- **Beneficiaries – disaggregation:** Gender, age band, geography, social category as structured fields.
- **Monitoring ↔ LFA indicators:** Structured progress against LFA indicators in monitoring.
- **Report templates and “Generate report” output:** Templates (e.g. quarterly donor report), generate and download PDF/Excel.
- **Budget utilization sync:** Ensure utilized is driven by approved expenses by head (or add sync).
- **User Management – link to employee:** Explicit “link user to employee” in UI.

### Low (polish, compliance, optional)

- **Export audit log** (CSV/Excel).
- **Documents – document type and tags.**
- **Settings – org profile and FY list.**
- **Donor Portal – agreement/MoU link per donor.**
- **Expense settlement – payment date/voucher.**
- **AI Insights – LFA/indicator trends.**
- **Analytics on mobile** (or deep link to web).

---

## 4. What Is Already in Place (No Gap)

- **Web:** All nav modules (Main, Program, HRMS, Admin) have pages and APIs; role-based access; Donor Portal filters by donor for donor users; Programs has Donor + Partner; Approvals, Leave, Expenses, Form Builder, Letters, etc. are feature-complete for core use.
- **Mobile:** Project filters (Activities, Expenses, Monitoring); budget head and quarter in Activity/Expense forms; leave approve/reject; expense verify/approve/reject/settle and bill/receipt upload; Forms with submissions view/edit; Monitoring with project filter; profile and change password; links to full web portal from More.
- **Donor Portal:** Backend filters programs by donor when user is donor type with `donorName`.
- **Partners & LFA:** Partner Management and LFA pages exist; Programs linked to partners.

---

## 5. Suggested Next Steps (in order)

1. **Donor reporting:** Add report template “Donor report” (program + budget + expenses + beneficiary summary) and optional reporting schedule (due dates per program/donor).
2. **Donor Management:** Add grant amount, grant period, tranches, pledge vs received (fields or sub-entity).
3. **Impact:** Add impact snapshot on dashboard and beneficiary/outcome summary in Donor Portal; extend Beneficiaries with disaggregation fields (gender, age, geography, social category).
4. **Activity ↔ LFA:** Add LFA output/objective dropdown in Activity form (web).
5. **Reports:** Introduce report templates and ensure “Generate report” produces a downloadable document (PDF/Excel).
6. **User Management:** Add “Link to employee” in user create/edit and ensure leave/attendance/payroll use it.
7. **Budget:** Confirm or implement auto-update of utilization from approved expenses by budget head.
8. **Audit log export:** Add “Export audit log” (CSV/Excel).
9. **Settings:** Editable org profile and financial year list from backend.

---

*Review based on: `client/src/config/nav.ts`, `client/src/App.tsx`, `mobile/src/navigation/AppNavigator.tsx`, `mobile/src/screens/*`, `server/src/routes/donorPortal.ts`, `server/src/config/roles.ts`, and existing docs (CORE_MODULES_REVIEW.md, WEB_MOBILE_FEATURE_GAPS.md, GAP_ANALYSIS_FWWB_NGO.md, MODULE_WISE_NGO_MIS_GAPS.md).*
