export type RoleType = 'management' | 'program' | 'hr' | 'admin' | 'employee' | 'donor';

/**
 * Role-based module access. Keys must match client nav keys (dashboard, approvals, programs, etc.).
 * - Dashboard: only management and program.
 * - HR: no dashboard, no program modules; has approvals, user-mgmt, audit, HRMS.
 * - Admin: no dashboard; has analytics, approvals, and all other modules.
 * - Employee: only settings, ess, leave, attendance, engagement, calendar.
 * - Donor: only donor-portal and settings.
 * requireRole() uses these keys only (do not pass role types like 'management' or 'hr').
 */
export const ROLE_PERMISSIONS: Record<RoleType, string[]> = {
  management: [
    'dashboard', 'analytics', 'settings', 'approvals', 'donor-portal', 'donor-mgmt', 'partners', 'user-mgmt', 'audit',
    'programs', 'lfa', 'beneficiaries', 'activities', 'budget', 'expenses', 'monitoring', 'reports', 'documents',
    'recruitment', 'employees', 'attendance', 'leave', 'performance', 'payroll', 'engagement', 'calendar', 'letters', 'ess',
    'assets', 'insurance', 'travel', 'stationery', 'admin-expenses', 'form-builder',
  ],
  program: [
    'dashboard', 'settings', 'ess', 'approvals',
    'programs', 'lfa', 'beneficiaries', 'activities', 'budget', 'expenses', 'monitoring', 'reports', 'documents', 'donor-mgmt', 'partners',
    'leave', 'attendance', 'form-builder',
  ],
  hr: [
    'settings', 'ess', 'approvals', 'user-mgmt', 'audit',
    'recruitment', 'employees', 'attendance', 'leave', 'performance', 'payroll', 'engagement', 'calendar', 'letters',
  ],
  admin: [
    'analytics', 'settings', 'approvals', 'donor-portal', 'donor-mgmt', 'partners', 'user-mgmt', 'audit',
    'programs', 'lfa', 'beneficiaries', 'activities', 'budget', 'expenses', 'monitoring', 'reports', 'documents',
    'recruitment', 'employees', 'attendance', 'leave', 'performance', 'payroll', 'engagement', 'calendar', 'letters', 'ess',
    'assets', 'insurance', 'travel', 'stationery', 'admin-expenses', 'form-builder',
  ],
  employee: [
    'settings', 'ess', 'leave', 'attendance', 'engagement', 'calendar',
  ],
  donor: ['donor-portal', 'settings'],
};

export function hasPermission(roleType: RoleType, moduleKey: string): boolean {
  const perms = ROLE_PERMISSIONS[roleType];
  return perms ? perms.includes(moduleKey) : false;
}
