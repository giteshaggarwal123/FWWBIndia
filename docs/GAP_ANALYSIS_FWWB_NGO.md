# FWWB-Type NGO Platform – Gap Analysis

## 1. What We’re Building (Basis)

**FWWB India Management System** is an integrated MIS for a grant-making / capacity-building NGO that:

- Runs **multiple programmes** (donor-funded, with partners/sub-grantees).
- Manages **programme cycle**: design → budget → activities → field monitoring → expenses → donor reporting.
- Operates **HR** (staff, attendance, leave, payroll, letters, recruitment, performance).
- Runs **admin** (assets, travel, stationery, insurance, admin expenses).
- Gives **donors** a view-only portal (funded programs, utilization).
- Supports **field staff** on mobile (attendance, leave, data collection, activities, expenses).

**Roles:** Management, Program, HR, Admin, Employee, Donor.

---

## 2. What Exists Today

### Web (sidebar modules)

| Section | Modules | Notes |
|--------|---------|--------|
| **Main** | Dashboard, AI Insights, Donor Portal, Donor Management, Settings | Dashboard has KPIs, budget chart, alerts. Donor Portal = donor view. Donor Mgmt = CRUD donors. |
| **Program Management** | Programs, Activities, Form Builder, Monitoring, Budget, Expenses, Reports | Programs linked to donors (dropdown). Activities/Budget/Expenses filter by project. Form Builder + submissions. Monitoring = entries. Reports = list + generate. |
| **HRMS** | Employees, Attendance, Leave, Recruitment, Performance, Payroll, Engagement, Calendar, Letters, ESS | ESS = self-service links. |
| **Administration** | Assets, Insurance, Travel, Stationery, Admin Expenses | |

**Backend but no web UI in nav:**

- **Partners** – API exists (`/api/partners`), Project has `partner` (ObjectId). **No “Partner Management” page**; Programs form does not have partner dropdown.
- **LFA (Logical Framework)** – API + model exist. **No “LFA” or “Project Framework” page** for goals/outcomes/outputs/indicators.

### Mobile

- **Tabs:** Home (dashboard), Attendance, Leave, Activities, Expenses, Forms, More.
- **Home:** Org stats + “My analytics” (my submissions, attendance, leave).
- **Forms:** Fill forms + “My submissions”, forms grouped by project.
- **Attendance / Leave:** Check-in/out, apply leave, geotagging; synced with web.
- **Activities / Expenses:** List + add (with project/activity selection).
- **No mobile:** Programs list, Donor Management, Budget, Monitoring, Reports, HR (employees, recruitment, payroll, letters, performance, calendar), Admin (assets, travel, stationery, etc.), Settings (except via More).

---

## 3. Module & Feature Gaps (Missing or Incomplete)

### 3.1 Backend exists, no / wrong web surface

| Gap | Detail | Link to rest |
|-----|--------|----------------|
| **Partner Management** | Partners API + model exist; no nav item, no page. Programs do not let you select a **partner** (implementing org e.g. Supraja). | Programs should have Partner dropdown (like Donor). Donor Portal shows partner name. |
| **LFA / Project framework** | LFA API + model (objectives → outcomes → outputs → activities). No LFA page to attach to a program. | Links to program design; Reports / donor reports could reference indicators. |

### 3.2 Program–Donor–Partner chain

| Gap | Detail |
|-----|--------|
| **Program ↔ Partner** | Program has `partner` (ref) but web Programs page has no partner field. Partner Management missing. |
| **Donor ↔ Program** | Done (Donor Management + Programs donor dropdown). |
| **Donor Portal filtering** | Donor Portal shows all programs. If donor user should see only “their” programs, need to filter by donor (e.g. by user or by donor id). |

### 3.3 Beneficiaries & impact

| Gap | Detail |
|-----|--------|
| **Beneficiaries** | No dedicated beneficiary module (count, type, geography, baseline). Form submissions can capture beneficiary data but there is no aggregated “Beneficiaries” or “Impact” view. |
| **Impact / outcome indicators** | LFA has indicators; no UI to enter or report against them. No simple “impact dashboard” (e.g. beneficiaries reached, outcomes by program). |

### 3.4 M&E and reporting

| Gap | Detail |
|-----|--------|
| **Monitoring depth** | Monitoring = generic entries. No link to LFA indicators, no “monitoring plan” per program. |
| **Donor / statutory reports** | Reports are generic (name, type, project, period). No templates (e.g. quarterly donor report), no “reporting schedule” or due dates. |
| **Export** | Activities, Budget, Employees export exist. No exports for donors, partners, form submissions, or monitoring. |

### 3.5 Finance

| Gap | Detail |
|-----|--------|
| **Budget vs actual by program** | Budget and expenses exist; dashboard shows utilization. May be thin on “by donor” or “by financial year” roll-ups. |
| **Multi-year / grant periods** | Program has start/end; budget has financialYear. No explicit “grant period” or “funding tranche” per donor. |
| **Approval workflow** | Expenses may have status; no clear “approval chain” or “delegation” (e.g. program approves, finance clears). |

### 3.6 HRMS (depth)

| Gap | Detail |
|-----|--------|
| **Employee ↔ User** | Some linking for attendance/leave; not every user may have employee record in all flows. |
| **Letters** | Letters module exists; link to recruitment (offer letter) / exit (experience letter) may be partial. |
| **Payroll / Performance** | Pages exist; integration (e.g. salary slip from payroll, goals from performance) not verified. |

### 3.7 Administration

| Gap | Detail |
|-----|--------|
| **Document repository** | Files/upload exist; no “Documents” or “Library” module (proposals, agreements, reports) with tags/folders by program/donor. |
| **Compliance / audit** | No checklist (e.g. FCRA, audit), no audit log of who changed what. |

### 3.8 Settings & config

| Gap | Detail |
|-----|--------|
| **Org profile** | Settings may be minimal; no “Organisation profile” (name, logo, FY start, default currency). |
| **Financial years** | Budget uses financialYear; no central list of FYs or “current FY”. |
| **User management** | Users API may exist; no “User management” page (invite, roles, link user ↔ employee). |

---

## 4. Web vs Mobile Parity

| Area | Web | Mobile | Gap |
|------|-----|--------|-----|
| Programs | Full CRUD | None | Mobile cannot list/create programs. |
| Donors | Full CRUD | None | Donor Management web-only is OK. |
| Partners | No page | None | Both missing. |
| Activities | Full + export | List + add | Mobile has no edit/export. |
| Budget | Full | None | Budget web-only is OK. |
| Expenses | Full | List + add | Mobile has no edit/approval view. |
| Forms & submissions | Form Builder + submissions | Fill + My submissions | Good parity. |
| Monitoring | List + add | None | Monitoring could be on mobile for field. |
| Reports | List + generate + export | None | Reports web-only is OK. |
| Attendance / Leave | Yes | Yes, synced | Good. |
| Employees | Full | None | HR web-only is OK. |
| Dashboard | Org + (future: role-based) | Org + “My analytics” | Mobile dashboard is field-focused; good. |
| Settings | Page | Only in More (logout) | Mobile could have profile/change password. |

---

## 5. Logical Gaps (FWWB-type NGO)

1. **Programme structure**  
   Program → Donor (done) and Program → **Partner** (implementing org) are core. Partner Management + Programs partner dropdown are missing.

2. **Design → delivery**  
   **LFA** (or similar) per program is standard. Backend exists; no UI to maintain framework and link to activities/monitoring.

3. **Who did what, where**  
   **Beneficiaries / impact** are not first-class: no aggregate view, no indicators dashboard. Form data is there but not structured as “beneficiaries” or “outcomes”.

4. **Accountability to donors**  
   Donor Portal shows programs and utilization. Gaps: no “donor-specific” program filter (for donor users), no structured **donor reporting** (templates, schedule, due dates).

5. **Field → office**  
   **Monitoring** on mobile would close the loop (field staff add monitoring entries from site). Forms already do part of this.

6. **Governance and control**  
   **Audit trail**, **approval workflows** (e.g. expenses), **user management** (roles, link user–employee) are typical for a mature NGO MIS.

7. **Documents and compliance**  
   **Document library** (proposals, MoUs, reports) and **compliance checklist** (e.g. FCRA, audit) are often needed but not present.

---

## 6. Suggested Implementation Order

**Phase 1 – Programme & partners (web)**  
- Add **Partner Management** (nav + page, CRUD).  
- Add **Partner** dropdown to Programs (like Donor) and show partner in list/detail.  
- Optional: **LFA** page (per program) so framework is visible and editable.

**Phase 2 – Donor and reporting**  
- Donor Portal: filter programs by donor (e.g. when donor user is logged in).  
- Reports: simple “donor report” template or reporting schedule (due dates).  
- Optional: export for form submissions / monitoring.

**Phase 3 – Impact & M&E**  
- **Beneficiaries** (or “Impact”) module: aggregate from form data or manual entries; show by program/partner.  
- **Monitoring on mobile**: add monitoring entry from field (like forms).  
- Link monitoring to program (and optionally to LFA indicators).

**Phase 4 – Governance & docs**  
- **User management** page (list users, assign role, link to employee).  
- **Audit log** (key actions: who, when, what).  
- **Documents** module (upload, tag program/donor, list/download).

**Phase 5 – Polish**  
- Settings: org profile, financial years.  
- Mobile: profile/change password in More.  
- Expense approval workflow (if required).

---

## 7. Summary Table (Quick reference)

| Gap | Web | Mobile | Priority |
|-----|-----|--------|----------|
| Partner Management | Missing (API exists) | N/A | High |
| Program ↔ Partner link | Missing on Programs page | N/A | High |
| LFA / Project framework UI | Missing (API exists) | N/A | Medium |
| Donor Portal filter by donor | Not implemented | N/A | Medium |
| Beneficiaries / impact view | Missing | N/A | Medium |
| Monitoring on mobile | N/A | Missing | Medium |
| Donor report templates / schedule | Thin | N/A | Low–Medium |
| User management page | Missing | N/A | Medium |
| Document library | Thin (files only) | N/A | Low |
| Audit log | Missing | N/A | Low |
| Mobile profile / settings | Minimal (More) | Add profile | Low |

This gives a clear basis for what we’re building, what’s missing, and what to implement next across web and mobile.
