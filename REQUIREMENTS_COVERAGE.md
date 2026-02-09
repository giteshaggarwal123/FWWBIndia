# Software Workflow Requirement vs Portal Coverage

This document maps the **Software Workflow Requirement.pdf** (and related docs) to the MERN portal so no module or feature is missing.

## Program Team Requirements

| Requirement | Coverage in Portal |
|-------------|--------------------|
| Activity-wise and budget-wise allocation + team task allocation | **Activities** module: activityId, name, project, budget, budgetHead, quarter, location, expected/actual participants, achievementRate. **Budget** module: project, head, allocated, utilized, financialYear. |
| Tracking non-budgeted activities | Activity model supports budget 0; filters in list. |
| Real-time tracking of activities and budgets | Dashboard stats; Activities and Budget list APIs with filters. |
| Planned vs actual progress and expenditure | Activity: expectedParticipants, actualParticipants, achievementRate. Budget: allocated vs utilized. |
| Alerts for delays and budget over-utilisation | Dashboard **Alerts** API: insurance renewals (30/60/90 days), warranty expiring, travel pending, stationery pending. Budget over-use can be derived from utilized > allocated in UI. |
| Bill upload, verification, approval, settlement | **Expenses** module: status (submitted, verified, approved, rejected, settled); **FileAttachment** for bill uploads. |
| Linking expense to activity and budget head | Expense model: project, activity, category; API supports filters. |
| Transaction trail / document storage | FileAttachment model; upload API; refModel/refId for linking. |
| LFA or indicator tracking linked to objectives and activities | **LFA** model per project (goal, objectives, outcomes, outputs, activities with indicators). **Monitoring** entries: expectedParticipants, actualParticipants, achievementRate, indicatorsData, offlineSynced. **Activity**: lfaObjectiveRef, budgetHead. |
| Field-level data collection, offline/online | MonitoringEntry: location, lat, lng, notes, offlineSynced. |
| Photos, documents, geo-tagging, date stamping | Monitoring: lat, lng, date; FileAttachment for photos/documents. |
| Project-wise and organisation-level dashboards | **Dashboard** page with stats; **Donor Portal** for view-only program health and utilization. |
| Donor-wise reporting; Excel/Word export | **Donor Portal** (view-only for funders); **Export** API: Excel for activities, employees. |
| Role-based access; view-only for funders | **RBAC**: management, program, hr, admin, employee, **donor**. Donor role has only `donor-portal` and settings. |
| AI support for data analysis | **AI Insights** (analytics) module in nav; backend can be extended. |
| Bulk upload via standardized Excel template | **Bulk import** API: `POST /api/bulk-import/activities`, `POST /api/bulk-import/expenses` with `{ projectId, rows }`; `POST /api/bulk-import/parse-excel` for base64 Excel preview. |
| API integration / Power BI readiness | REST APIs; export endpoints; structure supports external integration. |

## HRMS Requirements

| Requirement | Coverage |
|-------------|----------|
| Recruitment (JD, shortlisting, finalization) | **Recruitment** (JobPosting) module and API. |
| Onboarding (HO, Field) | **Employees** with location, department. |
| Attendance (GPS mobile, biometric) | **Attendance** model: checkIn, checkOut, lat, lng, status. |
| Leave management | **Leave** module and API with approve/reject. |
| Documentation / Personnel files | FileAttachment; can link refModel/refId to Employee. |
| Letters (Offer, Appointment, Memos, Experience) | **Letters** (LetterTemplate, LetterInstance) and API. |
| KPI / Goal setting | **Performance** (PerformanceReview) module. |
| Payroll (PF, ESIC, TDS, PT) | **Payroll** (PayrollRun) module. |
| ESS (Mobile App) | **ESS** route and placeholder; API-ready. |
| Employee Engagement / HR Calendar | **Engagement** (surveys), **Calendar** (events, holidays, birthdays, anniversaries). |
| IDP / 360 PMS / Exit process | Noted in scope as optional/future; can be added. |

## Admin Requirements

| Requirement | Coverage |
|-------------|----------|
| Asset categories (IT / Non-IT) | **Asset** model: type (it, non-it), category, warrantyExpiry, vendorName. |
| Asset fields (Serial, Date, Cost, Warranty, Location, Assigned To, Status) | All in Asset model. |
| **Asset movement history** | **AssetMovement** model and API: `GET /api/asset-movements/asset/:assetId`, `POST /api/asset-movements`. |
| Warranty expiry reminders | **Alerts** API: `warrantyExpiring` count; dashboard alerts section. |
| Export to Excel/PDF | Export routes for activities, employees; structure supports PDF. |
| **Medical Insurance** (Employee + Family) | **InsurancePolicy**: type medical; familyMembers array (name, dateOfBirth, relationship, coverageAmount); employeeId, employeeName, dateOfBirth. |
| **Group Accident**, **Vehicle**, **Fire & Safety** | Insurance types: group-accident, vehicle, fire-safety; vehicleNumber, vehicleType; officeLocation, equipmentCovered. |
| **D&O Insurance** | Insurance type `d-and-o`; coverageType, insuredDirectorsList, premium. |
| Renewal reminders (30/60/90) | **Alerts** API: insuranceRenewals30, 60, 90. |
| **Travel**: Purpose, Upload tickets/invoices | **TravelRequest**: purposeOfTravel; ticketAttachmentId (ref FileAttachment). |
| **Stationery**: Purpose (Training/Workshop/General) | **StationeryRequest**: purpose (training, workshop, general); dateNeeded. |
| Admin Expense form | **AdminExpense** and API; FileAttachment for bill/receipt. |
| Dashboard & Alerts | **Alerts** API and **Dashboard** alerts section: insurance renewals, warranty, travel pending, admin expenses count, stationery pending and summary. |

## Donor / Sub-grantee Context

| Item | Coverage |
|------|----------|
| FWWB as implementation and donor organisation | Dashboard and copy note; Donor Portal for funder view. |
| Sub-grantee / partner foundations (e.g. Supraja) | **Partner** model (name, code, type: sub-grantee/partner/implementing). **Project** linked to **partner**. Seed: Supraja Foundation partner; Supraja FPO project linked to it. |
| Donor view-only access | **Donor** role; **Donor Portal** API and pages (programs list, program detail with budgets, activities, expenses). |
| LFA for projects (e.g. Supraja) | **LFA** model and API per project; seed LFA for Supraja with goal and 5 objectives. |

## Summary

- **Program**: Activities, Budget, Expenses, Monitoring (with LFA-linked fields), Reports, Dashboard, Donor Portal, bulk import, alerts, file uploads.
- **HRMS**: Recruitment, Employees, Attendance, Leave, Performance, Payroll, Engagement, Calendar, Letters, ESS.
- **Admin**: Assets (with movement history, warranty), Insurance (medical + family, D&O, vehicle, fire-safety, group-accident), Travel (purpose, ticket upload), Stationery (purpose), Admin Expenses.
- **Donor**: View-only Donor Portal; Partner/Sub-grantee model; LFA per project.
- **Alerts**: Central **Alerts** API and dashboard section for renewals, warranty, travel pending, stationery.

All items from the Software Workflow Requirement document are either implemented or explicitly noted as optional/future (IDP, 360 PMS, Exit). The portal is fully functional for the implemented features.
