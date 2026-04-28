import { getCurrentUser } from '@/lib/jwt';
import { getSql } from '@/lib/neon';

export interface AdminActor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  cemeteryId: string | null;
}

export function isAdminRole(role: string | null | undefined) {
  return role === 'CEMETERY_ADMIN' || role === 'SUPER_ADMIN';
}

export async function getAdminActor(): Promise<AdminActor | null> {
  const currentUser = await getCurrentUser();

  if (!currentUser || !isAdminRole(currentUser.role)) {
    return null;
  }

  const sql = getSql();
  const users = await sql`
    SELECT
      id,
      email,
      "firstName",
      "lastName",
      role,
      "cemeteryId"
    FROM "User"
    WHERE id = ${currentUser.userId}
    LIMIT 1
  `;

  const user = users[0];

  if (!user || !isAdminRole(user.role)) {
    return null;
  }

  return user as AdminActor;
}
