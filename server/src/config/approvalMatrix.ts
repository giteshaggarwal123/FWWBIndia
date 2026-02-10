import type { RoleType } from './roles.js';

/**
 * Approval matrix: who can approve what.
 * - leave: approve/reject → hr, management
 * - program_expense: verify → program, management; approve/reject → program (below threshold), management (always)
 * - admin_expense: approve/reject → admin, management
 * - travel: approve/reject → admin, management
 */

export type ApprovalRequestType = 'leave' | 'program_expense_verify' | 'program_expense_approve' | 'admin_expense' | 'travel';

/** Roles that can approve leave requests */
export const LEAVE_APPROVERS: RoleType[] = ['hr', 'management', 'admin'];

/** Roles that can verify program expenses (submitted → verified) */
export const EXPENSE_VERIFIERS: RoleType[] = ['program', 'management', 'admin'];

/** Roles that can approve program expenses (verified → approved) or reject. Management/admin always; program only below amount threshold */
export const EXPENSE_APPROVERS: RoleType[] = ['management', 'admin', 'program'];

/** Program expense amount (₹) above which only management can approve */
export const EXPENSE_APPROVE_MANAGEMENT_THRESHOLD = 100000;

/** Roles that can approve admin expenses */
export const ADMIN_EXPENSE_APPROVERS: RoleType[] = ['admin', 'management'];

/** Roles that can approve travel requests */
export const TRAVEL_APPROVERS: RoleType[] = ['admin', 'management'];

export function canApproveLeave(roleType: RoleType): boolean {
  return LEAVE_APPROVERS.includes(roleType);
}

export function canVerifyExpense(roleType: RoleType): boolean {
  return EXPENSE_VERIFIERS.includes(roleType);
}

export function canApproveExpense(roleType: RoleType, amount?: number): boolean {
  if (!EXPENSE_APPROVERS.includes(roleType)) return false;
  if (roleType === 'management' || roleType === 'admin') return true;
  if (roleType === 'program') {
    const amt = amount ?? 0;
    return amt < EXPENSE_APPROVE_MANAGEMENT_THRESHOLD;
  }
  return false;
}

export function canApproveAdminExpense(roleType: RoleType): boolean {
  return ADMIN_EXPENSE_APPROVERS.includes(roleType);
}

export function canApproveTravel(roleType: RoleType): boolean {
  return TRAVEL_APPROVERS.includes(roleType);
}

/** Roles that can approve stationery requests */
export const STATIONERY_APPROVERS: RoleType[] = ['admin', 'management'];

export function canApproveStationery(roleType: RoleType): boolean {
  return STATIONERY_APPROVERS.includes(roleType);
}

export function getApprovalPermissions(roleType: RoleType): {
  leave: boolean;
  expenseVerify: boolean;
  expenseApprove: boolean;
  adminExpense: boolean;
  travel: boolean;
  stationery: boolean;
} {
  return {
    leave: canApproveLeave(roleType),
    expenseVerify: canVerifyExpense(roleType),
    expenseApprove: EXPENSE_APPROVERS.includes(roleType),
    adminExpense: canApproveAdminExpense(roleType),
    travel: canApproveTravel(roleType),
    stationery: canApproveStationery(roleType),
  };
}
