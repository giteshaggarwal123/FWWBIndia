import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { BudgetPage } from './pages/BudgetPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { LeavePage } from './pages/LeavePage';
import { TravelPage } from './pages/TravelPage';
import { AdminExpensesPage } from './pages/AdminExpensesPage';
import { RecruitmentPage } from './pages/RecruitmentPage';
import { DonorPortalPage } from './pages/DonorPortalPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { ReportsPage } from './pages/ReportsPage';
import { AttendancePage } from './pages/AttendancePage';
import { PerformancePage } from './pages/PerformancePage';
import { PayrollPage } from './pages/PayrollPage';
import { EngagementPage } from './pages/EngagementPage';
import { CalendarPage } from './pages/CalendarPage';
import { LettersPage } from './pages/LettersPage';
import { ESSPage } from './pages/ESSPage';
import { AssetsPage } from './pages/AssetsPage';
import { InsurancePage } from './pages/InsurancePage';
import { StationeryPage } from './pages/StationeryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { FormBuilderPage } from './pages/FormBuilderPage';
import { ProgramsPage } from './pages/ProgramsPage';
import { SettingsPage } from './pages/SettingsPage';
import { DonorProgramDetailPage } from './pages/DonorProgramDetailPage';
import { DonorManagementPage } from './pages/DonorManagementPage';
import { PartnerManagementPage } from './pages/PartnerManagementPage';
import { LFAPage } from './pages/LFAPage';
import { BeneficiariesPage } from './pages/BeneficiariesPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { useAuth } from './hooks/useAuth';
import { ProgramFilterProvider } from './context/ProgramFilterContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MutationErrorToast } from './components/MutationErrorToast';
import { getModuleKeyByPath, getFirstAllowedPath } from './config/nav';

/** Scroll window to top whenever the route (module) changes. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
        <div style={{ padding: 24, textAlign: 'center', color: '#4a5568' }}>Loading...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Redirect to dashboard if allowed, else first allowed module (e.g. employee → ess, donor → donor-portal). */
function DefaultRedirect() {
  const { hasPermission } = useAuth();
  const target = hasPermission('dashboard') ? '/dashboard' : getFirstAllowedPath(hasPermission);
  return <Navigate to={target} replace />;
}

/** Gate route by module permission; redirect to first allowed path if no access. */
function RequireModulePermission({ children }: { children: React.ReactNode }) {
  const { hasPermission } = useAuth();
  const { pathname } = useLocation();
  const key = getModuleKeyByPath(pathname);
  if (key && !hasPermission(key)) {
    return <Navigate to={getFirstAllowedPath(hasPermission)} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <MutationErrorToast />
        <ScrollToTop />
        <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ProgramFilterProvider>
                <DashboardLayout />
              </ProgramFilterProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<DefaultRedirect />} />
          <Route path="dashboard" element={<RequireModulePermission><DashboardPage /></RequireModulePermission>} />
          <Route path="approvals" element={<RequireModulePermission><ApprovalsPage /></RequireModulePermission>} />
          <Route path="analytics" element={<RequireModulePermission><AnalyticsPage /></RequireModulePermission>} />
          <Route path="donor-portal" element={<RequireModulePermission><DonorPortalPage /></RequireModulePermission>} />
          <Route path="donor-portal/program/:id" element={<RequireModulePermission><DonorProgramDetailPage /></RequireModulePermission>} />
          <Route path="donor-mgmt" element={<RequireModulePermission><DonorManagementPage /></RequireModulePermission>} />
          <Route path="user-mgmt" element={<RequireModulePermission><UserManagementPage /></RequireModulePermission>} />
          <Route path="audit" element={<RequireModulePermission><AuditLogPage /></RequireModulePermission>} />
          <Route path="partners" element={<RequireModulePermission><PartnerManagementPage /></RequireModulePermission>} />
          <Route path="lfa" element={<RequireModulePermission><LFAPage /></RequireModulePermission>} />
          <Route path="beneficiaries" element={<RequireModulePermission><BeneficiariesPage /></RequireModulePermission>} />
          <Route path="settings" element={<RequireModulePermission><SettingsPage /></RequireModulePermission>} />
          <Route path="programs" element={<RequireModulePermission><ProgramsPage /></RequireModulePermission>} />
          <Route path="activities" element={<RequireModulePermission><ActivitiesPage /></RequireModulePermission>} />
          <Route path="budget" element={<RequireModulePermission><BudgetPage /></RequireModulePermission>} />
          <Route path="expenses" element={<RequireModulePermission><ExpensesPage /></RequireModulePermission>} />
          <Route path="monitoring" element={<RequireModulePermission><MonitoringPage /></RequireModulePermission>} />
          <Route path="reports" element={<RequireModulePermission><ReportsPage /></RequireModulePermission>} />
          <Route path="documents" element={<RequireModulePermission><DocumentsPage /></RequireModulePermission>} />
          <Route path="form-builder" element={<RequireModulePermission><FormBuilderPage /></RequireModulePermission>} />
          <Route path="recruitment" element={<RequireModulePermission><RecruitmentPage /></RequireModulePermission>} />
          <Route path="employees" element={<RequireModulePermission><EmployeesPage /></RequireModulePermission>} />
          <Route path="attendance" element={<RequireModulePermission><AttendancePage /></RequireModulePermission>} />
          <Route path="leave" element={<RequireModulePermission><LeavePage /></RequireModulePermission>} />
          <Route path="performance" element={<RequireModulePermission><PerformancePage /></RequireModulePermission>} />
          <Route path="payroll" element={<RequireModulePermission><PayrollPage /></RequireModulePermission>} />
          <Route path="engagement" element={<RequireModulePermission><EngagementPage /></RequireModulePermission>} />
          <Route path="calendar" element={<RequireModulePermission><CalendarPage /></RequireModulePermission>} />
          <Route path="letters" element={<RequireModulePermission><LettersPage /></RequireModulePermission>} />
          <Route path="ess" element={<RequireModulePermission><ESSPage /></RequireModulePermission>} />
          <Route path="assets" element={<RequireModulePermission><AssetsPage /></RequireModulePermission>} />
          <Route path="insurance" element={<RequireModulePermission><InsurancePage /></RequireModulePermission>} />
          <Route path="travel" element={<RequireModulePermission><TravelPage /></RequireModulePermission>} />
          <Route path="stationery" element={<RequireModulePermission><StationeryPage /></RequireModulePermission>} />
          <Route path="admin-expenses" element={<RequireModulePermission><AdminExpensesPage /></RequireModulePermission>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
