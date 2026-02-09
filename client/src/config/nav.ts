/** Sidebar order: Main (overview) → Program (field work) → HRMS (people & time) → Administration (ops). */
export const NAV_SECTIONS: { title: string; modules: { key: string; label: string; path: string }[] }[] = [
  {
    title: 'Main',
    modules: [
      { key: 'dashboard', label: 'Dashboard', path: '/dashboard' },
      { key: 'approvals', label: 'Pending Approvals', path: '/approvals' },
      { key: 'analytics', label: 'AI Insights', path: '/analytics' },
      { key: 'donor-portal', label: 'Donor Portal', path: '/donor-portal' },
      { key: 'donor-mgmt', label: 'Donor Management', path: '/donor-mgmt' },
      { key: 'user-mgmt', label: 'User Management', path: '/user-mgmt' },
      { key: 'audit', label: 'Audit Log', path: '/audit' },
      { key: 'settings', label: 'Settings', path: '/settings' },
    ],
  },
  {
    title: 'Program Management',
    modules: [
      { key: 'programs', label: 'Programs', path: '/programs' },
      { key: 'partners', label: 'Partner Management', path: '/partners' },
      { key: 'lfa', label: 'Logical Framework (LFA)', path: '/lfa' },
      { key: 'beneficiaries', label: 'Beneficiaries & Impact', path: '/beneficiaries' },
      { key: 'activities', label: 'Activities', path: '/activities' },
      { key: 'form-builder', label: 'Form Builder (Data Collection)', path: '/form-builder' },
      { key: 'monitoring', label: 'Monitoring', path: '/monitoring' },
      { key: 'budget', label: 'Budget', path: '/budget' },
      { key: 'expenses', label: 'Expenses & Bills', path: '/expenses' },
      { key: 'reports', label: 'Reports', path: '/reports' },
      { key: 'documents', label: 'Documents', path: '/documents' },
    ],
  },
  {
    title: 'HRMS',
    modules: [
      { key: 'employees', label: 'Employees', path: '/employees' },
      { key: 'attendance', label: 'Attendance', path: '/attendance' },
      { key: 'leave', label: 'Leave', path: '/leave' },
      { key: 'recruitment', label: 'Recruitment', path: '/recruitment' },
      { key: 'performance', label: 'Performance', path: '/performance' },
      { key: 'payroll', label: 'Payroll', path: '/payroll' },
      { key: 'engagement', label: 'Engagement', path: '/engagement' },
      { key: 'calendar', label: 'HR Calendar', path: '/calendar' },
      { key: 'letters', label: 'Letters', path: '/letters' },
      { key: 'ess', label: 'Self Service', path: '/ess' },
    ],
  },
  {
    title: 'Administration',
    modules: [
      { key: 'assets', label: 'Assets', path: '/assets' },
      { key: 'stationery', label: 'Stationery', path: '/stationery' },
      { key: 'travel', label: 'Travel', path: '/travel' },
      { key: 'insurance', label: 'Insurance', path: '/insurance' },
      { key: 'admin-expenses', label: 'Admin Expenses', path: '/admin-expenses' },
    ],
  },
];
