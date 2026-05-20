import { getCurrentUser } from '@/lib/jwt';
import { getSql } from '@/lib/neon';
import { isAdminRole } from '@/lib/roles';

export interface AdminActor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  cemeteryId: string | null;
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

export function isSuperAdmin(actor: Pick<AdminActor, 'role'> | null | undefined) {
  return actor?.role === 'SUPER_ADMIN';
}

export function getScopedCemeteryId(
  actor: AdminActor,
  requestedCemeteryId?: string | null
) {
  if (isSuperAdmin(actor)) {
    return requestedCemeteryId ?? null;
  }

  return actor.cemeteryId;
}

export function canAccessCemetery(
  actor: AdminActor,
  cemeteryId: string | null | undefined
) {
  if (!cemeteryId) {
    return false;
  }

  if (isSuperAdmin(actor)) {
    return true;
  }

  return actor.cemeteryId === cemeteryId;
}
