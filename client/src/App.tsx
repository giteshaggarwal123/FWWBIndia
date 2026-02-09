import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
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
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="approvals" element={<ApprovalsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="donor-portal" element={<DonorPortalPage />} />
          <Route path="donor-portal/program/:id" element={<DonorProgramDetailPage />} />
          <Route path="donor-mgmt" element={<DonorManagementPage />} />
          <Route path="user-mgmt" element={<UserManagementPage />} />
          <Route path="audit" element={<AuditLogPage />} />
          <Route path="partners" element={<PartnerManagementPage />} />
          <Route path="lfa" element={<LFAPage />} />
          <Route path="beneficiaries" element={<BeneficiariesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="programs" element={<ProgramsPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="monitoring" element={<MonitoringPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="form-builder" element={<FormBuilderPage />} />
          <Route path="recruitment" element={<RecruitmentPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="leave" element={<LeavePage />} />
          <Route path="performance" element={<PerformancePage />} />
          <Route path="payroll" element={<PayrollPage />} />
          <Route path="engagement" element={<EngagementPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="letters" element={<LettersPage />} />
          <Route path="ess" element={<ESSPage />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="insurance" element={<InsurancePage />} />
          <Route path="travel" element={<TravelPage />} />
          <Route path="stationery" element={<StationeryPage />} />
          <Route path="admin-expenses" element={<AdminExpensesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
