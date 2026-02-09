# Module-wise gaps – NGO MIS (e.g. FWWB) perspective

This list is from the perspective of an NGO like FWWB using the portal as an **integrated MIS**. It covers what is **still missing or incomplete** in each module.

---

## Main

### Dashboard
- **Program-wise / donor-wise KPIs**: Dashboard shows org-level counts and budget summary; no drill-down by program or donor (e.g. “Program X: 80% utilization”).
- **Role-based widgets**: Same view for all roles; no “My pending items” or “Programs I manage” for program staff.
- **Impact snapshot**: No beneficiary/outcome summary (e.g. “X beneficiaries reached this quarter”) on dashboard.
- **Alerts**: Admin expenses count is shown; optional: overdue reports, expiring grants, compliance due dates.

### Pending Approvals
- **Done**: Leave, program expenses (verify/approve), admin expenses, travel, stationery with role-based actions.

### AI Insights (Analytics)
- **Indicator-based charts**: Charts use activity/budget from dashboard; no LFA indicator progress or outcome trends.
- **Donor / program comparison**: No “compare programs” or “donor-wise utilization” view.
- **Beneficiary/impact trends**: No charts for beneficiary count over time or disaggregation (e.g. by type, geography).

### Donor Portal
- **Donor filter**: When user is donor type with `donorName`, programs are filtered; ensure all donor-facing views (including financial summary) respect this.
- **Donor reporting schedule**: No list of “due reports” or “reporting calendar” per donor/program.
- **Beneficiary/impact for donor**: Donor program detail shows activities, budget, expenses; no beneficiary or outcome summary for donor view.

### Donor Management
- **Grant/pledge tracking**: Donors are contact entities only; no “grant amount”, “grant period”, “tranches” or “pledge vs received”.
- **Reporting preferences**: No “reporting frequency” or “report template” per donor.
- **Agreement/MoU link**: No link to document (e.g. agreement) per donor.

### User Management
- **User ↔ Employee link**: No explicit “link to employee record” in UI; needed for leave/attendance/payroll consistency.
- **Invite / onboarding**: No invite-by-email or role assignment flow documented in UI.

### Audit Log
- **Coverage**: Audit is recorded in many routes; ensure all critical actions (user create/update, budget/activity/expense status changes, donor/partner edits) are covered.
- **Export**: No “Export audit log” (Excel/CSV) for compliance.

### Settings
- **Org profile**: Name, address, FY are hardcoded (e.g. in SettingsPage); no editable “Organization profile” from backend.
- **Financial year list**: Budget uses `financialYear`; no central “current FY” or list of FYs in Settings; no FY selector in header/filter.
- **Currency / locale**: Single currency (₹) and locale; no config for multiple currencies if needed for donors.

---

## Program Management

### Programs
- **Partner dropdown**: Project has `partner` (ObjectId); ensure Programs create/edit form has **Partner** dropdown (like Donor) and list shows partner name.
- **Donor as ref**: Program has `donor` (string); consider donor as ObjectId ref for consistency and donor-wise reports.
- **Grant period / funding**: No “grant start/end”, “funding tranche” or “budget ceiling” per program/donor on program entity.
- **Program status workflow**: Status is active/completed/on-hold; no “proposal → approved → active → closed” if needed.

### Partner Management
- **Agreement / MoU**: No “agreement date”, “document id” or link to file.
- **Reporting obligation**: No “reporting frequency” or “due report” per partner.
- **Program linkage**: Programs link to partner; partner page could show “Programs using this partner”.

### Logical Framework (LFA)
- **Indicator targets**: LFA has indicators (text); no **target value**, **baseline**, **frequency** (e.g. quarterly) per indicator.
- **Progress entry**: No “enter progress against indicator” (e.g. actual vs target); monitoring has free-form indicatorsData (string), not structured by LFA indicator.
- **Activity ↔ LFA**: Activity has `lfaObjectiveRef` (string); no dropdown “Link to LFA output/activity” in Activity form for traceability.

### Beneficiaries & Impact
- **Disaggregation**: Beneficiary has type (individual, SHG, FPO, etc.) and category; no **gender**, **age band**, **social category** (e.g. SC/ST/OBC) or **geography** as structured fields—needed for donor and statutory reporting.
- **Cumulative / period**: Count and period exist; no “cumulative vs incremental” or “baseline vs current” for outcome reporting.
- **Link to activity**: No “activity” ref on beneficiary entry; cannot easily say “this training reached X beneficiaries”.
- **Impact dashboard**: No summary view “beneficiaries by program/partner/type” with simple charts.

### Activities
- **LFA link in UI**: Activity has `lfaObjectiveRef`; ensure form has selector/dropdown from LFA (by project) so activities are traceable to framework.
- **Budget head**: Activity has `budgetHead` (text); no dropdown from program budget heads for consistency.
- **Photos/attachments**: No “evidence” or photo upload per activity (only generic file upload by refModel/refId elsewhere).
- **Beneficiary count**: Activity has expected/actual participants; no “beneficiary type” or link to Beneficiary module for aggregation.

### Form Builder (Data Collection)
- **Indicator mapping**: Forms capture data; no “map form field to LFA indicator” for auto-aggregation.
- **Offline / mobile**: Mobile can submit forms; offline queue and sync (if any) not verified.
- **Analytics**: Submissions are list/download; no “responses by question” or simple analytics per form.

### Monitoring
- **LFA indicator link**: Monitoring has `indicatorsData` (string); no structured “indicator id → value” linked to LFA.
- **Monitoring plan**: No “monitoring plan” or “visit schedule” per program with due dates.
- **Mobile**: No Monitoring entry create/edit on mobile (field staff cannot log visits from app).
- **Geo**: lat/lng and location exist; no map view on web for monitoring entries.

### Budget
- **Utilization source**: Budget has `allocated` and `utilized`; utilized is not auto-updated from approved expenses by head; may be manual or separate process—clarify or add “sync from expenses”.
- **Donor-wise budget**: Budget is project-wise and by head; no “donor” or “grant” dimension for multi-donor programs.
- **Revision history**: No “budget revision” (v1, v2) or approval of revisions.
- **FY selector**: Filter by financialYear exists; ensure UI (Budget page, Reports) has FY dropdown and optionally “current FY” from settings.

### Expenses & Bills
- **Budget head**: Expense has category (text); no “budget head” ref so spend is traceable to budget line and can auto-update utilization.
- **Donor tag**: For donor reporting, expense might need “donor” or “grant” tag when project is funded by multiple donors.
- **Settlement**: Status includes “settled”; no “payment date” or “voucher number” for finance closure.
- **Bill/receipt**: Upload exists; ensure list/detail shows “View attachment” where present.

### Reports
- **Templates**: Reports are “name, type, project, period”; no **report templates** (e.g. “Quarterly Donor Report”) or “report type” dropdown with standard types.
- **Due dates / schedule**: Optional “reporting schedule” (e.g. quarterly due dates per program/donor) and “overdue” flag.
- **Generate document**: “Generate Report” creates a record but no actual PDF/Excel generation from template; no “Download generated report” from stored output.
- **Donor report**: No dedicated “Donor report” type that pulls program + budget + expenses + beneficiary summary for a donor.

### Documents
- **Folders / taxonomy**: Files are listed by refModel/refId (e.g. Project, Donor); no folders or “document type” (proposal, agreement, report, audit).
- **Tags**: No tags (e.g. “FCRA”, “FY24-25”) for filtering.
- **Production API base**: Documents upload uses relative `/api`; ensure production uses same API base as rest of client (configurable base URL).

---

## HRMS

### Employees
- **Employee ↔ User**: Link (userId) exists; UI to “link user to employee” and ensure leave/attendance/payroll use same identity.
- **Org chart / reporting**: No “reporting to” or “department head”; no org chart view.
- **Contract / DOJ**: joiningDate exists; no “contract end”, “notice period” or “employee type” (full-time/consultant).
- **Photo / document**: No employee photo or document (e.g. ID proof) upload.

### Attendance
- **Policy**: No “attendance policy” (e.g. grace time, WFH rules) in settings; only raw check-in/out.
- **Leave deduction**: No automatic “absent = leave deduction” or link to leave balance.
- **Reports**: No “attendance summary by month/department” export.

### Leave
- **Leave types / balance**: Leave types and balance per employee (if any) not verified; balance carry-forward and yearly reset.
- **Holiday list**: No “organization holiday list” that affects leave/attendance (e.g. optional holiday calendar).

### Recruitment
- **Stages**: Job postings and applications (if any); no clear “pipeline” (screening → interview → offer) or stage-wise view.
- **Offer letter**: Link to Letters module for “offer letter” template and generate from recruitment.

### Performance
- **Goals ↔ LFA**: No link between performance goals and program/LFA for program staff.
- **Cycle**: No “appraisal cycle” (e.g. April–March) or “due date” for review.
- **Rating consistency**: No org-wide “rating scale” or calibration.

### Payroll
- **Salary structure**: PayrollRun has month, year, totalAmount, payslipCount; no employee-level salary components (basic, HRA, etc.) or payslip detail in system.
- **Statutory**: No PF/ESI/tax computation or statutory report placeholders.
- **Integration**: No “mark attendance → payroll” or “leave without pay” deduction from salary.

### Engagement / Calendar / Letters / ESS
- **Engagement**: Basic CRUD; no surveys or pulse checks.
- **Calendar**: Events exist; no “leave on calendar” or “organization events” vs “personal”.
- **Letters**: Templates and generated letters; link to Recruitment (offer), Exit (experience letter) not verified.
- **ESS**: Profile and links; “change password” or “update profile” on mobile not verified.

---

## Administration

### Assets
- **Custody / location**: Asset has fields; no “issued to” (employee) or “location” history for tracking.
- **Depreciation**: No depreciation or “asset life” for accounting.
- **Movements**: Asset movements API exists; ensure UI shows “movement history” per asset.

### Stationery
- **Inventory**: No “stock” or “reorder level”; only request/approve flow.
- **Vendor**: No “preferred vendor” or “rate” for stationery items.

### Travel
- **Policy**: No “travel policy” (e.g. entitlement by grade) or “approval by amount”.
- **Ticket upload**: Implemented; ensure all create/edit flows support attachment and list shows it.

### Insurance
- **Renewal alerts**: Alerts may include insurance; ensure “renewal date” and “alert before expiry” are visible.
- **Family members**: Model supports family; UI for adding/editing family members on policy.

### Admin Expenses
- **Receipt upload**: Implemented; ensure list/detail shows attachment.
- **Category list**: No standard “admin expense categories”; free text or dropdown to be consistent.
- **Cost centre**: No “cost centre” or “department” for admin expense if needed for internal allocation.

---

## Cross-cutting

- **Pagination**: Most list APIs return all; add optional `page`/`limit` for activities, expenses, employees, audit, beneficiaries when data grows.
- **Notifications**: No in-app or email notifications (e.g. “Leave approved”, “Expense pending your approval”).
- **Mobile parity**: Monitoring, Budget, Reports, Donor/Partner management are web-only; optional “view only” or key actions on mobile for field/management.
- **Compliance checklist**: No FCRA/audit/compliance “checklist” or “due dates” module.
- **Multi-language**: UI is single language; no localization for regional use.

---

## Summary table (quick scan)

| Module           | What’s missing (NGO MIS) |
|------------------|---------------------------|
| **Dashboard**    | Program/donor-wise KPIs; impact snapshot; role-based widgets |
| **Donor Portal** | Donor filter verified; reporting schedule; beneficiary/impact for donor |
| **Donor Mgmt**   | Grant/pledge; reporting prefs; agreement link |
| **Programs**     | Partner dropdown in form; donor ref; grant period/funding |
| **Partners**     | Agreement/MoU; reporting obligation; programs list |
| **LFA**          | Indicator targets/baseline; progress entry; link from activities |
| **Beneficiaries**| Gender/age/geography disaggregation; link to activity; impact dashboard |
| **Activities**   | LFA link in UI; budget head dropdown; evidence upload; beneficiary link |
| **Monitoring**   | LFA indicator link; monitoring plan; mobile entry; map view |
| **Budget**       | Auto-utilization from expenses; donor dimension; revision; FY in UI |
| **Expenses**     | Budget head ref; donor tag; settlement fields; attachment in list |
| **Reports**      | Templates; schedule/due; generate PDF/Excel; donor report type |
| **Documents**    | Folders/types; tags; production API base |
| **HRMS**         | User–employee link UI; org chart; payroll detail; statutory placeholders |
| **Admin**        | Asset custody/depreciation; stationery stock; travel policy; insurance renewal UI |
| **Settings**     | Editable org profile; FY list/current; currency/locale |
| **Audit**        | Full coverage; export |
| **Global**       | Pagination; notifications; compliance checklist; optional mobile parity |

Use this list to prioritize by “must have for FWWB-style MIS” vs “nice to have” and phase implementations accordingly.
