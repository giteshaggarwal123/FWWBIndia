# Web Portal – Features / Modules Still Missing

This list covers what is **still missing or incomplete** on the **web** portal (as of current codebase). It does not cover mobile.

---

## Already implemented (present on web)

- **Settings**: Org profile (GET/PATCH), financial years list, FY dropdown on Budget.
- **Programs**: Partner dropdown, donor, grant start/end, budget ceiling.
- **Donors / Grants**: Grant CRUD, reporting frequency, agreement attachment (backend).
- **Beneficiaries**: Disaggregation fields (gender, ageBand, socialCategory, state, district, activity).
- **Budget**: FY filter; expense approval/settle updates utilization by head.
- **Expenses**: Budget head field, payment date, voucher number; verify/approve/reject/settle; bill upload.
- **Dashboard**: Program-wise KPIs table, alerts block.
- **Audit**: Export CSV button.
- **Letters**: Templates + generated; view and download (template + generated).
- **Bulk import**: In-module (Activities & Expenses) – Import from Excel.
- **Documents**: Upload with refModel/refId (Project, Donor); list and download. Backend supports `documentType` and `tags` – **UI does not yet expose them**.

---

## Still missing or incomplete (web)

### Main / overview

| Item | Status | Note |
|------|--------|------|
| **Dashboard – role-based widgets** | Missing | No “My pending items” or “Programs I manage” for program staff; same view for all roles. |
| **Dashboard – impact snapshot** | Missing | No beneficiary/outcome summary (e.g. “X beneficiaries this quarter”). |
| **AI Insights – LFA / outcome charts** | Missing | Charts use activity/budget only; no LFA indicator progress or beneficiary trends. |
| **Donor Portal – reporting schedule** | Missing | No “due reports” or reporting calendar per donor/program. |
| **Donor Portal – beneficiary/impact for donor** | Missing | Donor program detail has activities, budget, expenses; no beneficiary or outcome summary. |
| **User Management – user ↔ employee link** | Missing | No UI to link a user to an employee record (needed for leave/attendance/payroll). |

### Program management

| Item | Status | Note |
|------|--------|------|
| **LFA – indicator targets / baseline** | Missing | LFA has indicators (text); no target value, baseline, or frequency per indicator. |
| **LFA – progress entry** | Missing | No “enter progress against indicator” (actual vs target); monitoring has free-form text only. |
| **Activities – LFA link in form** | Missing | Activity has `lfaObjectiveRef`; form has no dropdown to link to LFA output/activity. |
| **Activities – budget head dropdown** | Missing | Budget head is free text; no dropdown from program budget heads. |
| **Activities – evidence/photo upload** | Missing | No per-activity evidence upload (only generic file by refModel/refId elsewhere). |
| **Beneficiaries – impact dashboard** | Missing | No summary “beneficiaries by program/partner/type” with charts. |
| **Monitoring – LFA indicator link** | Missing | Monitoring has free-form indicatorsData; no structured link to LFA indicators. |
| **Monitoring – map view** | Missing | lat/lng exist; no map view on web for monitoring entries. |
| **Monitoring – monitoring plan** | Missing | No visit schedule or due dates per program. |

### Reports & documents

| Item | Status | Note |
|------|--------|------|
| **Reports – templates** | Missing | No report templates (e.g. “Quarterly Donor Report”) or standard report-type dropdown. |
| **Reports – due dates / schedule** | Missing | No reporting schedule or “overdue” flag per program/donor. |
| **Reports – generate PDF/Excel** | Missing | “Generate Report” creates a record only; no actual PDF/Excel from template or “Download generated report”. |
| **Reports – donor report type** | Missing | No dedicated donor report (program + budget + expenses + beneficiary summary). |
| **Documents – document type & tags in UI** | Missing | Backend supports `documentType` and `tags`; upload form and list filters do not use them. |

### HRMS

| Item | Status | Note |
|------|--------|------|
| **Employees – user link in UI** | Missing | No “link to user” or “link to employee” in User/Employee forms. |
| **Employees – reporting to / employee type** | Missing | Model has `reportingTo`, `employeeType`; form and table do not show them. |
| **Leave – types & balance** | Missing | Leave types and balance per employee (and carry-forward / yearly reset) not in UI. |
| **Leave – holiday list** | Missing | No org holiday list affecting leave/attendance. |
| **Attendance – policy / summary export** | Missing | No attendance policy (e.g. grace time); no “attendance summary by month/department” export. |
| **Payroll – salary structure / payslip** | Missing | PayrollRun exists; no employee-level salary components (basic, HRA, etc.) or payslip detail. |
| **Payroll – statutory** | Missing | No PF/ESI/tax computation or statutory report placeholders. |
| **Performance – appraisal cycle** | Missing | No “appraisal cycle” (e.g. April–March) or due date for review. |
| **Recruitment – pipeline** | Missing | No clear pipeline (screening → interview → offer) or stage-wise view. |

### Administration

| Item | Status | Note |
|------|--------|------|
| **Donor Management – grant/pledge in UI** | Missing | Grant amount, period, tranches, pledge vs received not fully in donor UI. |
| **Partners – agreement / programs list** | Missing | No agreement date/document link; partner page does not show “Programs using this partner”. |
| **Assets – custody / movement in UI** | Missing | No “issued to” (employee) or movement history per asset in UI. |
| **Stationery – inventory** | Missing | No stock or reorder level; only request/approve flow. |
| **Insurance – renewal UI** | Missing | Renewal/expiry visible in alerts; no dedicated renewal/expiry view on Insurance page. |

### Cross-cutting

| Item | Status | Note |
|------|--------|------|
| **Pagination** | Missing | Most list APIs return all; no `page`/`limit` for activities, expenses, employees, audit, beneficiaries. |
| **Notifications** | Missing | No in-app or email notifications (e.g. “Leave approved”, “Expense pending your approval”). |
| **Compliance checklist** | Missing | No FCRA/audit/compliance checklist or due-dates module. |
| **Documents – production API base** | Check | Upload uses relative `/api`; ensure production uses same base (e.g. `VITE_API_URL`). |

---

## Quick priority (if implementing next)

**High (core MIS)**  
1. Documents: add **document type** and **tags** to upload form and list filters.  
2. Employees: add **reporting to** and **employee type** to form and table.  
3. Activities: **budget head dropdown** from program budget heads (optional LFA dropdown).  
4. User Management: **link user to employee** in UI.

**Medium**  
5. Reports: **report templates** and **due date** (and optionally “Generate PDF/Excel”).  
6. LFA: **indicator targets/baseline** and **progress entry**.  
7. Dashboard: **impact snapshot** (beneficiary count/summary).  
8. Pagination on large lists (activities, expenses, employees, audit).

**Lower**  
9. Donor Portal: reporting schedule; beneficiary/impact for donor.  
10. Payroll: salary structure / payslip detail; statutory placeholders.  
11. Leave: types & balance; holiday list.  
12. Notifications; compliance checklist.

---

*Source: `docs/MODULE_WISE_NGO_MIS_GAPS.md` + codebase check (client + server).*
