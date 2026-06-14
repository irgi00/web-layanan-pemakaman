'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Pencil, Plus, ShieldPlus, Trash2, UserCog } from 'lucide-react';
import {
  DashboardHero,
  DashboardSection,
  DashboardStatCard,
} from '@/components/dashboard-shell';
import { PortalShell } from '@/components/portal-shell';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PasswordInput } from '@/components/password-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CemeteryItem {
  id: string;
  name: string;
  location: string | null;
}

interface CemeteryAdminItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  cemeteryId: string | null;
  createdAt: string;
  updatedAt: string;
  cemetery: {
    id: string;
    name: string;
    location: string | null;
  } | null;
}

interface AdminMe {
  id: string;
  email: string;
  role: string;
}

const UNASSIGNED_VALUE = '__UNASSIGNED__';
const PASSWORD_MISMATCH_MESSAGE = 'Konfirmasi password tidak sama dengan password.';

const defaultAdminForm = {
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
  cemeteryId: UNASSIGNED_VALUE,
};

const defaultEditForm = {
  id: '',
  email: '',
  firstName: '',
  lastName: '',
  cemeteryId: UNASSIGNED_VALUE,
  password: '',
  confirmPassword: '',
};

const defaultResetForm = {
  password: '',
  confirmPassword: '',
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getRequestError(body: unknown, fallback: string) {
  if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
    return body.error;
  }

  return fallback;
}

function getPasswordConfirmationError(
  password: string,
  confirmPassword: string,
  options?: { optional?: boolean }
) {
  if (options?.optional && !password && !confirmPassword) {
    return null;
  }

  if (!options?.optional && !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : PASSWORD_MISMATCH_MESSAGE;
}

export default function SuperadminAdminsPage() {
  const router = useRouter();
  const [me, setMe] = useState<AdminMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cemeteries, setCemeteries] = useState<CemeteryItem[]>([]);
  const [admins, setAdmins] = useState<CemeteryAdminItem[]>([]);
  const [adminForm, setAdminForm] = useState(defaultAdminForm);
  const [editForm, setEditForm] = useState(defaultEditForm);
  const [resetForm, setResetForm] = useState(defaultResetForm);
  const [submittingAdmin, setSubmittingAdmin] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [submittingReset, setSubmittingReset] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<CemeteryAdminItem | null>(null);
  const [resettingAdmin, setResettingAdmin] = useState<CemeteryAdminItem | null>(null);

  const loadData = async () => {
    const [cemRes, adminsRes] = await Promise.all([
      fetch('/api/superadmin/cemeteries', { cache: 'no-store' }),
      fetch('/api/superadmin/admins', { cache: 'no-store' }),
    ]);

    const [cemData, adminsData] = await Promise.all([cemRes.json(), adminsRes.json()]);

    if (!cemRes.ok || !adminsRes.ok) {
      throw new Error(
        !cemRes.ok
          ? getRequestError(cemData, 'Gagal memuat data cemetery.')
          : getRequestError(adminsData, 'Gagal memuat data admin.')
      );
    }

    setCemeteries(cemData.cemeteries || []);
    setAdmins(adminsData.admins || []);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const meResponse = await fetch('/api/admin/me', { cache: 'no-store' });
        if (!meResponse.ok) {
          router.push('/admin/login');
          return;
        }

        const meData = await meResponse.json();
        if (meData.role !== 'SUPER_ADMIN') {
          router.push('/admin/dashboard');
          return;
        }

        setMe({
          id: meData.id,
          email: meData.email,
          role: meData.role,
        });

        await loadData();
      } catch (loadError) {
        console.error(loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Terjadi kesalahan saat memuat data admin.'
        );
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [router]);

  const assignedAdminsCount = useMemo(
    () => admins.filter((admin) => Boolean(admin.cemeteryId)).length,
    [admins]
  );

  const unassignedAdminsCount = admins.length - assignedAdminsCount;

  const resetFeedback = () => {
    setError(null);
    setSuccess(null);
  };

  const adminPasswordError = getPasswordConfirmationError(
    adminForm.password,
    adminForm.confirmPassword
  );
  const editPasswordError = getPasswordConfirmationError(
    editForm.password,
    editForm.confirmPassword,
    { optional: true }
  );
  const resetPasswordError = getPasswordConfirmationError(
    resetForm.password,
    resetForm.confirmPassword
  );

  const toCemeteryPayload = (cemeteryId: string) =>
    cemeteryId === UNASSIGNED_VALUE ? null : cemeteryId;

  const handleCreateAdmin = async (event: React.FormEvent) => {
    event.preventDefault();
    resetFeedback();

    if (adminPasswordError) {
      return;
    }

    try {
      setSubmittingAdmin(true);
      const response = await fetch('/api/superadmin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminForm.email,
          firstName: adminForm.firstName,
          lastName: adminForm.lastName,
          password: adminForm.password,
          confirmPassword: adminForm.confirmPassword,
          cemeteryId: toCemeteryPayload(adminForm.cemeteryId),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(getRequestError(data, 'Gagal menambah admin.'));
        return;
      }

      setAdminForm(defaultAdminForm);
      setSuccess('Cemetery Admin berhasil ditambahkan.');
      await loadData();
    } catch (submitError) {
      console.error(submitError);
      setError('Terjadi kesalahan saat menambah admin.');
    } finally {
      setSubmittingAdmin(false);
    }
  };

  const openEditDialog = (admin: CemeteryAdminItem) => {
    resetFeedback();
    setEditingAdmin(admin);
    setEditForm({
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      cemeteryId: admin.cemeteryId ?? UNASSIGNED_VALUE,
      password: '',
      confirmPassword: '',
    });
  };

  const handleEditAdmin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingAdmin) {
      return;
    }

    resetFeedback();

    if (editPasswordError) {
      return;
    }

    try {
      setSubmittingEdit(true);
      const response = await fetch(`/api/superadmin/admins/${editingAdmin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editForm.email,
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          cemeteryId: toCemeteryPayload(editForm.cemeteryId),
          password: editForm.password,
          confirmPassword: editForm.confirmPassword,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(getRequestError(data, 'Gagal memperbarui admin.'));
        return;
      }

      setEditingAdmin(null);
      setEditForm(defaultEditForm);
      setSuccess(
        editForm.password
          ? 'Data admin dan password berhasil diperbarui.'
          : 'Data Cemetery Admin berhasil diperbarui.'
      );
      await loadData();
    } catch (submitError) {
      console.error(submitError);
      setError('Terjadi kesalahan saat memperbarui admin.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const openResetDialog = (admin: CemeteryAdminItem) => {
    resetFeedback();
    setResettingAdmin(admin);
    setResetForm(defaultResetForm);
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resettingAdmin) {
      return;
    }

    resetFeedback();

    if (!resetForm.password) {
      setError('Password baru wajib diisi.');
      return;
    }

    if (resetPasswordError) {
      return;
    }

    try {
      setSubmittingReset(true);
      const response = await fetch(
        `/api/superadmin/admins/${resettingAdmin.id}/reset-password`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resetForm),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        setError(getRequestError(data, 'Gagal mereset password admin.'));
        return;
      }

      setResettingAdmin(null);
      setResetForm(defaultResetForm);
      setSuccess(`Password untuk ${resettingAdmin.email} berhasil direset.`);
    } catch (submitError) {
      console.error(submitError);
      setError('Terjadi kesalahan saat mereset password admin.');
    } finally {
      setSubmittingReset(false);
    }
  };

  const handleDeleteAdmin = async (admin: CemeteryAdminItem) => {
    resetFeedback();

    try {
      const response = await fetch(`/api/superadmin/admins/${admin.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        setError(getRequestError(data, 'Gagal menghapus admin.'));
        return;
      }

      setSuccess(`Akun ${admin.email} berhasil dihapus.`);
      await loadData();
    } catch (deleteError) {
      console.error(deleteError);
      setError('Terjadi kesalahan saat menghapus admin.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_34%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(246,248,251,1))] px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <Card className="border-white/70 bg-white/90 p-8">Memuat data admin...</Card>
        </div>
      </div>
    );
  }

  return (
    <PortalShell
      role="SUPER_ADMIN"
      roleLabel="Super Admin"
      title="Kelola Admin Cemetery"
      description="Tambah, edit, ubah assignment cemetery, reset password, dan hapus akun Cemetery Admin."
      userEmail={me?.email}
      onLogout={handleLogout}
      headerSlot={
        <Badge className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
          {me?.email}
        </Badge>
      }
    >
      <div className="mx-auto max-w-7xl">
        {error && (
          <Card className="mb-6 border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </Card>
        )}

        {success && (
          <Card className="mb-6 border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {success}
          </Card>
        )}

        <div className="space-y-8">
          <DashboardHero
            eyebrow="Master Data"
            title="Manajemen Cemetery Admin"
            description="Super Admin dapat membuat akun admin baru, memperbarui identitas admin, memindahkan assignment cemetery, dan mengelola reset password secara terpusat."
          />

          <div className="grid gap-4 md:grid-cols-3">
            <DashboardStatCard
              label="Total Cemetery Admin"
              value={admins.length}
              description="Semua akun admin makam yang terdaftar."
              icon={ShieldPlus}
              accentClassName="bg-rose-500/10 text-rose-600"
            />
            <DashboardStatCard
              label="Sudah Ditugaskan"
              value={assignedAdminsCount}
              description="Admin yang sudah memiliki cemetery."
              icon={UserCog}
              accentClassName="bg-emerald-500/10 text-emerald-600"
            />
            <DashboardStatCard
              label="Belum Ditugaskan"
              value={unassignedAdminsCount}
              description="Admin yang masih menunggu assignment."
              icon={UserCog}
              accentClassName="bg-amber-500/10 text-amber-600"
            />
          </div>

          <DashboardSection
            title="Tambah Cemetery Admin"
            description="Buat akun admin baru. Anda bisa langsung menugaskan ke cemetery atau menyimpannya sebagai belum ditugaskan."
          >
            <form onSubmit={handleCreateAdmin} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="admin-first-name">Nama depan</Label>
                <Input
                  id="admin-first-name"
                  placeholder="Nama depan admin"
                  value={adminForm.firstName}
                  onChange={(event) =>
                    setAdminForm((prev) => ({ ...prev, firstName: event.target.value }))
                  }
                  required
                  className="h-11 rounded-xl bg-background/80 shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-last-name">Nama belakang</Label>
                <Input
                  id="admin-last-name"
                  placeholder="Nama belakang admin"
                  value={adminForm.lastName}
                  onChange={(event) =>
                    setAdminForm((prev) => ({ ...prev, lastName: event.target.value }))
                  }
                  required
                  className="h-11 rounded-xl bg-background/80 shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  placeholder="Email admin"
                  type="email"
                  value={adminForm.email}
                  onChange={(event) =>
                    setAdminForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  required
                  className="h-11 rounded-xl bg-background/80 shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-cemetery">Cemetery</Label>
                <select
                  id="admin-cemetery"
                  value={adminForm.cemeteryId}
                  onChange={(event) =>
                    setAdminForm((prev) => ({ ...prev, cemeteryId: event.target.value }))
                  }
                  className="h-11 w-full rounded-xl border border-input bg-background/80 px-3 text-sm text-foreground shadow-sm"
                >
                  <option value={UNASSIGNED_VALUE}>Belum ditugaskan</option>
                  {cemeteries.map((cemetery) => (
                    <option key={cemetery.id} value={cemetery.id}>
                      {cemetery.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <PasswordInput
                  id="admin-password"
                  placeholder="Minimal 6 karakter"
                  value={adminForm.password}
                  onChange={(event) =>
                    setAdminForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  required
                  className="h-11 rounded-xl bg-background/80 shadow-sm"
                  aria-invalid={Boolean(adminPasswordError)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-confirm-password">Konfirmasi password</Label>
                <PasswordInput
                  id="admin-confirm-password"
                  placeholder="Ulangi password"
                  value={adminForm.confirmPassword}
                  onChange={(event) =>
                    setAdminForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                  }
                  required
                  className="h-11 rounded-xl bg-background/80 shadow-sm"
                  aria-invalid={Boolean(adminPasswordError)}
                />
                {adminPasswordError && (
                  <p className="text-sm text-destructive">{adminPasswordError}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Button
                  type="submit"
                  disabled={submittingAdmin || Boolean(adminPasswordError)}
                  className="h-11 rounded-xl px-5"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {submittingAdmin ? 'Menyimpan...' : 'Tambah Cemetery Admin'}
                </Button>
              </div>
            </form>
          </DashboardSection>

          <DashboardSection
            title="Daftar Cemetery Admin"
            description="Kelola data akun, assignment cemetery, dan reset password untuk setiap admin."
          >
            <div className="space-y-4">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="rounded-[24px] border border-border/70 bg-white/70 p-5 shadow-[0_12px_30px_-28px_rgba(15,23,42,0.8)]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-foreground">
                          {admin.firstName} {admin.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{admin.email}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="rounded-full px-3 py-1">
                          CEMETERY_ADMIN
                        </Badge>
                        <Badge variant="outline" className="rounded-full px-3 py-1">
                          Aktif
                        </Badge>
                        {!admin.cemeteryId && (
                          <Badge className="rounded-full bg-amber-100 px-3 py-1 text-amber-800 hover:bg-amber-100">
                            Belum ditugaskan
                          </Badge>
                        )}
                      </div>

                      <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                        <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            Cemetery
                          </p>
                          <p className="mt-1 font-medium text-foreground">
                            {admin.cemetery?.name || 'Belum ditugaskan'}
                          </p>
                          <p className="mt-1 text-xs">
                            {admin.cemetery?.location || 'Assignment dapat diatur oleh Super Admin.'}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            Metadata
                          </p>
                          <p className="mt-1">Dibuat: {formatDateTime(admin.createdAt)}</p>
                          <p className="mt-1">Diubah: {formatDateTime(admin.updatedAt)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => openEditDialog(admin)}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => openResetDialog(admin)}
                      >
                        <KeyRound className="h-4 w-4" />
                        Reset Password
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button type="button" variant="destructive" className="rounded-xl">
                            <Trash2 className="h-4 w-4" />
                            Hapus
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Cemetery Admin?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Aksi ini akan menghapus akun {admin.email}. Jika akun memiliki riwayat
                              data terkait, sistem akan menolak penghapusan untuk menjaga histori.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-white hover:bg-destructive/90"
                              onClick={() => handleDeleteAdmin(admin)}
                            >
                              Hapus akun
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}

              {admins.length === 0 && (
                <div className="rounded-[24px] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Belum ada cemetery admin yang terdaftar.
                </div>
              )}
            </div>
          </DashboardSection>
        </div>
      </div>

      <Dialog open={Boolean(editingAdmin)} onOpenChange={(open) => !open && setEditingAdmin(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Cemetery Admin</DialogTitle>
            <DialogDescription>
              Perbarui identitas admin, ubah assignment cemetery, atau isi password baru jika ingin
              mengganti kata sandi sekaligus.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditAdmin} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-first-name">Nama depan</Label>
              <Input
                id="edit-first-name"
                value={editForm.firstName}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, firstName: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-last-name">Nama belakang</Label>
              <Input
                id="edit-last-name"
                value={editForm.lastName}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, lastName: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, email: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cemetery">Cemetery</Label>
              <select
                id="edit-cemetery"
                value={editForm.cemeteryId}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, cemeteryId: event.target.value }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value={UNASSIGNED_VALUE}>Belum ditugaskan</option>
                {cemeteries.map((cemetery) => (
                  <option key={cemetery.id} value={cemetery.id}>
                    {cemetery.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Password baru opsional</Label>
              <PasswordInput
                id="edit-password"
                placeholder="Kosongkan jika tidak diubah"
                value={editForm.password}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, password: event.target.value }))
                }
                aria-invalid={Boolean(editPasswordError)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-confirm-password">Konfirmasi password baru</Label>
              <PasswordInput
                id="edit-confirm-password"
                placeholder="Ulangi password baru"
                value={editForm.confirmPassword}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                }
                aria-invalid={Boolean(editPasswordError)}
              />
              {editPasswordError && (
                <p className="text-sm text-destructive">{editPasswordError}</p>
              )}
            </div>
            <DialogFooter className="md:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingAdmin(null)}
                className="rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submittingEdit || Boolean(editPasswordError)}
                className="rounded-xl"
              >
                {submittingEdit ? 'Menyimpan...' : 'Simpan perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(resettingAdmin)}
        onOpenChange={(open) => !open && setResettingAdmin(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Reset Password Cemetery Admin</DialogTitle>
            <DialogDescription>
              Password lama tidak ditampilkan. Masukkan password baru untuk{' '}
              <span className="font-medium text-foreground">{resettingAdmin?.email}</span>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="reset-password">Password baru</Label>
              <PasswordInput
                id="reset-password"
                placeholder="Minimal 6 karakter"
                value={resetForm.password}
                onChange={(event) =>
                  setResetForm((prev) => ({ ...prev, password: event.target.value }))
                }
                required
                aria-invalid={Boolean(resetPasswordError)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-confirm-password">Konfirmasi password baru</Label>
              <PasswordInput
                id="reset-confirm-password"
                placeholder="Ulangi password baru"
                value={resetForm.confirmPassword}
                onChange={(event) =>
                  setResetForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                }
                required
                aria-invalid={Boolean(resetPasswordError)}
              />
              {resetPasswordError && (
                <p className="text-sm text-destructive">{resetPasswordError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setResettingAdmin(null)}
                className="rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submittingReset || Boolean(resetPasswordError)}
                className="rounded-xl"
              >
                {submittingReset ? 'Menyimpan...' : 'Reset password'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PortalShell>
  );
}
