export const USER_ROLE = 'CUSTOMER';
export const MEMBER_DASHBOARD_PATH = '/member/dashboard';
export const ADMIN_DASHBOARD_PATH = '/admin/dashboard';
export const SUPERADMIN_DASHBOARD_PATH = '/superadmin/dashboard';

export type LoginRoleOption = 'MEMBER' | 'ADMIN';

export function isAdminRole(role: string | null | undefined) {
  return role === 'CEMETERY_ADMIN' || role === 'SUPER_ADMIN';
}

export function isUserRole(role: string | null | undefined) {
  return role === USER_ROLE;
}

export function getRedirectPathByRole(role: string | null | undefined) {
  if (role === 'SUPER_ADMIN') {
    return SUPERADMIN_DASHBOARD_PATH;
  }

  if (role === 'CEMETERY_ADMIN') {
    return ADMIN_DASHBOARD_PATH;
  }

  return MEMBER_DASHBOARD_PATH;
}

export function matchesLoginRoleOption(
  selectedRole: LoginRoleOption,
  actualRole: string | null | undefined
) {
  if (selectedRole === 'ADMIN') {
    return isAdminRole(actualRole);
  }

  return isUserRole(actualRole);
}
