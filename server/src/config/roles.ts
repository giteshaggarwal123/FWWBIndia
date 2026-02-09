export type RoleType = 'management' | 'program' | 'hr' | 'admin' | 'employee' | 'donor';

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
    'dashboard', 'settings', 'ess', 'approvals', 'user-mgmt', 'audit',
    'recruitment', 'employees', 'attendance', 'leave', 'performance', 'payroll', 'engagement', 'calendar', 'letters',
    'form-builder',
  ],
  admin: [
    'dashboard', 'settings', 'ess', 'approvals',
    'assets', 'insurance', 'travel', 'stationery', 'admin-expenses',
    'leave', 'attendance',
    'form-builder',
  ],
  employee: [
    'dashboard', 'settings',
    'ess', 'leave', 'attendance', 'engagement', 'calendar',
    'form-builder',
  ],
  donor: ['donor-portal', 'settings'],
};

export function hasPermission(roleType: RoleType, moduleKey: string): boolean {
  const perms = ROLE_PERMISSIONS[roleType];
  return perms ? perms.includes(moduleKey) : false;
}
