import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { connectDB } from './config/db.js';
import { authRoutes } from './routes/auth.js';
import { usersRoutes } from './routes/users.js';
import { healthRoutes } from './routes/health.js';
import { projectRoutes } from './routes/projects.js';
import { activityRoutes } from './routes/activities.js';
import { budgetRoutes } from './routes/budget.js';
import { expenseRoutes } from './routes/expenses.js';
import { monitoringRoutes } from './routes/monitoring.js';
import { reportRoutes } from './routes/reports.js';
import { employeeRoutes } from './routes/employees.js';
import { attendanceRoutes } from './routes/attendance.js';
import { leaveRoutes } from './routes/leave.js';
import { recruitmentRoutes } from './routes/recruitment.js';
import { performanceRoutes } from './routes/performance.js';
import { payrollRoutes } from './routes/payroll.js';
import { engagementRoutes } from './routes/engagement.js';
import { calendarRoutes } from './routes/calendar.js';
import { letterRoutes } from './routes/letters.js';
import { assetRoutes } from './routes/assets.js';
import { insuranceRoutes } from './routes/insurance.js';
import { travelRoutes } from './routes/travel.js';
import { stationeryRoutes } from './routes/stationery.js';
import { adminExpenseRoutes } from './routes/adminExpenses.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { fileRoutes } from './routes/files.js';
import { exportRoutes } from './routes/export.js';
import { lfaRoutes } from './routes/lfa.js';
import { partnerRoutes } from './routes/partners.js';
import { donorPortalRoutes } from './routes/donorPortal.js';
import { donorRoutes } from './routes/donors.js';
import { alertsRoutes } from './routes/alerts.js';
import { assetMovementRoutes } from './routes/assetMovements.js';
import { bulkImportRoutes } from './routes/bulkImport.js';
import { formRoutes } from './routes/forms.js';
import { beneficiaryRoutes } from './routes/beneficiaries.js';
import { auditRoutes } from './routes/audit.js';
import { settingsRoutes } from './routes/settings.js';
import { grantRoutes } from './routes/grants.js';

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const app = express();
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) cb(null, true);
      else if (/^https?:\/\/localhost(:\d+)?$/.test(origin) || /^exp:\/\//.test(origin)) cb(null, true);
      else if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) cb(null, true);
      else if (/\.vercel\.app$/.test(origin) || /\.onrender\.com$/.test(origin)) cb(null, true);
      else cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const API = '/api';

app.use(`${API}/health`, healthRoutes);
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, usersRoutes);
app.use(`${API}/dashboard`, dashboardRoutes);
app.use(`${API}/files`, fileRoutes);
app.use(`${API}/export`, exportRoutes);
app.use(`${API}/lfa`, lfaRoutes);
app.use(`${API}/partners`, partnerRoutes);
app.use(`${API}/donor-portal`, donorPortalRoutes);
app.use(`${API}/donors`, donorRoutes);
app.use(`${API}/alerts`, alertsRoutes);
app.use(`${API}/asset-movements`, assetMovementRoutes);
app.use(`${API}/bulk-import`, bulkImportRoutes);
app.use(`${API}/forms`, formRoutes);
app.use(`${API}/beneficiaries`, beneficiaryRoutes);
app.use(`${API}/audit`, auditRoutes);
app.use(`${API}/settings`, settingsRoutes);
app.use(`${API}/grants`, grantRoutes);

app.use(`${API}/projects`, projectRoutes);
app.use(`${API}/activities`, activityRoutes);
app.use(`${API}/budget`, budgetRoutes);
app.use(`${API}/expenses`, expenseRoutes);
app.use(`${API}/monitoring`, monitoringRoutes);
app.use(`${API}/reports`, reportRoutes);

app.use(`${API}/employees`, employeeRoutes);
app.use(`${API}/attendance`, attendanceRoutes);
app.use(`${API}/leave`, leaveRoutes);
app.use(`${API}/recruitment`, recruitmentRoutes);
app.use(`${API}/performance`, performanceRoutes);
app.use(`${API}/payroll`, payrollRoutes);
app.use(`${API}/engagement`, engagementRoutes);
app.use(`${API}/calendar`, calendarRoutes);
app.use(`${API}/letters`, letterRoutes);

app.use(`${API}/assets`, assetRoutes);
app.use(`${API}/insurance`, insuranceRoutes);
app.use(`${API}/travel`, travelRoutes);
app.use(`${API}/stationery`, stationeryRoutes);
app.use(`${API}/admin-expenses`, adminExpenseRoutes);

// Catch-all error handler (for next(err) from routes)
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Route error:', err?.message ?? err);
  res.status(500).json({ message: err?.message ?? 'Internal server error' });
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

async function start() {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
