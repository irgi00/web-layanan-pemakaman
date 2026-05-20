export const USER_ROLE = 'CUSTOMER';

export function isAdminRole(role: string | null | undefined) {
  return role === 'CEMETERY_ADMIN' || role === 'SUPER_ADMIN';
}

export function isUserRole(role: string | null | undefined) {
  return role === USER_ROLE;
}

export function getRedirectPathByRole(role: string | null | undefined) {
  return isAdminRole(role) ? '/admin/dashboard' : '/dashboard';
}
