'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ShieldPlus, Trash2 } from 'lucide-react';
import {
  DashboardHero,
  DashboardAsideCard,
  DashboardSection,
  DashboardStatCard,
} from '@/components/dashboard-shell';
import { PortalShell } from '@/components/portal-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

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
  cemetery: {
    id: string;
    name: string;
    location: string | null;
  } | null;
}

const defaultAdminForm = {
  email: '',
  firstName: '',
  lastName: '',
  password: '',
};

export default function SuperadminAdminsPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cemeteries, setCemeteries] = useState<CemeteryItem[]>([]);
  const [admins, setAdmins] = useState<CemeteryAdminItem[]>([]);
  const [selectedCemeteryId, setSelectedCemeteryId] = useState('');
  const [adminForm, setAdminForm] = useState(defaultAdminForm);
  const [submittingAdmin, setSubmittingAdmin] = useState(false);

  const loadData = async () => {
    const [cemRes, adminsRes] = await Promise.all([
      fetch('/api/superadmin/cemeteries'),
      fetch('/api/superadmin/admins'),
    ]);
    if (!cemRes.ok || !adminsRes.ok) throw new Error('Gagal memuat data');
    const cemData = await cemRes.json();
    const adminsData = await adminsRes.json();
    setCemeteries(cemData.cemeteries || []);
    setAdmins(adminsData.admins || []);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const meResponse = await fetch('/api/admin/me');
        if (!meResponse.ok) {
          router.push('/admin/login');
          return;
        }
        const me = await meResponse.json();
        if (me.role !== 'SUPER_ADMIN') {
          router.push('/admin/dashboard');
          return;
        }
        setUserEmail(me.email);
        await loadData();
      } catch (err) {
        console.error(err);
        setError('Terjadi kesalahan saat memuat data admin.');
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [router]);

  const handleCreateAdmin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!selectedCemeteryId) {
      setError('Pilih cemetery terlebih dahulu untuk menugaskan admin.');
      return;
    }
    try {
      setSubmittingAdmin(true);
      const response = await fetch('/api/superadmin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...adminForm, cemeteryId: selectedCemeteryId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Gagal menambah admin');
        return;
      }
      setAdminForm(defaultAdminForm);
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan saat menambah admin.');
    } finally {
      setSubmittingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    try {
      const response = await fetch(`/api/superadmin/admins/${adminId}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Gagal menghapus admin');
        return;
      }
      await loadData();
    } catch (err) {
      console.error(err);
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
      description="Tambah atau hapus akun Cemetery Admin dan pasangkan ke lokasi yang sesuai."
      userEmail={userEmail}
      onLogout={handleLogout}
      headerSlot={
        <Badge className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
          {userEmail}
        </Badge>
      }
    >
      <div className="mx-auto max-w-7xl">
        {error && (
          <Card className="mb-6 border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </Card>
        )}

        <div className="space-y-8">
          <DashboardHero
            eyebrow="Master Data"
            title="Manajemen Cemetery Admin"
            description="Buat akun admin baru dan tugaskan ke cemetery tertentu, atau hapus akun yang sudah tidak aktif."
          />

          <DashboardStatCard
            label="Total Cemetery Admin"
            value={admins.length}
            description="Akun admin yang terdaftar di sistem."
            icon={ShieldPlus}
            accentClassName="bg-rose-500/10 text-rose-600"
          />

          <DashboardSection
            title="Tambah Cemetery Admin"
            description="Buat akun baru dan pasangkan langsung ke cemetery yang dipilih."
          >
            <form onSubmit={handleCreateAdmin} className="grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Email admin"
                value={adminForm.email}
                onChange={(event) =>
                  setAdminForm((prev) => ({ ...prev, email: event.target.value }))
                }
                required
                className="h-11 rounded-xl bg-background/80 shadow-sm"
              />
              <Input
                placeholder="Nama depan"
                value={adminForm.firstName}
                onChange={(event) =>
                  setAdminForm((prev) => ({ ...prev, firstName: event.target.value }))
                }
                required
                className="h-11 rounded-xl bg-background/80 shadow-sm"
              />
              <Input
                placeholder="Nama belakang"
                value={adminForm.lastName}
                onChange={(event) =>
                  setAdminForm((prev) => ({ ...prev, lastName: event.target.value }))
                }
                required
                className="h-11 rounded-xl bg-background/80 shadow-sm"
              />
              <Input
                placeholder="Password"
                type="password"
                value={adminForm.password}
                onChange={(event) =>
                  setAdminForm((prev) => ({ ...prev, password: event.target.value }))
                }
                required
                className="h-11 rounded-xl bg-background/80 shadow-sm"
              />
              <div className="md:col-span-2">
                <select
                  value={selectedCemeteryId}
                  onChange={(event) => setSelectedCemeteryId(event.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background/80 px-3 text-sm text-foreground shadow-sm"
                >
                  <option value="">Pilih cemetery untuk ditugaskan</option>
                  {cemeteries.map((cemetery) => (
                    <option key={cemetery.id} value={cemetery.id}>
                      {cemetery.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={submittingAdmin} className="h-11 rounded-xl px-5">
                  <Plus className="mr-2 h-4 w-4" />
                  {submittingAdmin ? 'Menyimpan...' : 'Tambah Cemetery Admin'}
                </Button>
              </div>
            </form>
          </DashboardSection>

          <DashboardSection
            title="Daftar Cemetery Admin"
            description="Seluruh akun admin yang terdaftar beserta cemetery yang ditangani."
          >
            <div className="space-y-3">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex flex-col gap-3 rounded-[24px] border border-border/70 bg-white/70 p-4 shadow-[0_12px_30px_-28px_rgba(15,23,42,0.8)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">
                      {admin.firstName} {admin.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {admin.cemetery?.name || 'Belum ditugaskan'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => handleDeleteAdmin(admin.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
    </PortalShell>
  );
}
