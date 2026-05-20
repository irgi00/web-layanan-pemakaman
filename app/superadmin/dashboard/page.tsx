'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Plus, Trash2 } from 'lucide-react';
import { BackButton } from '@/components/back-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatRupiah } from '@/lib/utils';

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

interface CemeteryItem {
  id: string;
  name: string;
  location: string | null;
  city?: string | null;
  province?: string | null;
  totalPlots?: number;
  availablePlots?: number;
  totalBookings?: number;
  totalRevenue?: number;
  admins?: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  }>;
}

interface PlotItem {
  id: string;
  plotNumber: string;
  section: string;
  row: string;
  status: string;
  cemeteryId: string;
  cemetery?: {
    name: string;
    location: string | null;
  };
}

interface BookingItem {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  cemetery: {
    id: string;
    name: string;
    location: string | null;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  plot: {
    plotNumber: string;
  };
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

const defaultPlotForm = {
  plotNumber: '',
  section: '',
  row: '',
  status: 'available',
};

const defaultAdminForm = {
  email: '',
  firstName: '',
  lastName: '',
  password: '',
};

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<{
    stats: {
      totalCemeteries: number;
      totalPlots: number;
      availablePlots: number;
      totalBookings: number;
      totalUsers: number;
      totalRevenue: number;
      totalCemeteryAdmins: number;
    };
  } | null>(null);
  const [cemeteries, setCemeteries] = useState<CemeteryItem[]>([]);
  const [admins, setAdmins] = useState<CemeteryAdminItem[]>([]);
  const [plots, setPlots] = useState<PlotItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [selectedCemeteryId, setSelectedCemeteryId] = useState('');
  const [plotForm, setPlotForm] = useState(defaultPlotForm);
  const [adminForm, setAdminForm] = useState(defaultAdminForm);
  const [submittingPlot, setSubmittingPlot] = useState(false);
  const [submittingAdmin, setSubmittingAdmin] = useState(false);

  const selectedCemetery = useMemo(
    () => cemeteries.find((cemetery) => cemetery.id === selectedCemeteryId) || null,
    [cemeteries, selectedCemeteryId]
  );

  const loadOverview = async () => {
    const [overviewResponse, cemeteriesResponse, adminsResponse, bookingsResponse] =
      await Promise.all([
        fetch('/api/superadmin/overview'),
        fetch('/api/superadmin/cemeteries'),
        fetch('/api/superadmin/admins'),
        fetch('/api/admin/bookings'),
      ]);

    if (
      !overviewResponse.ok ||
      !cemeteriesResponse.ok ||
      !adminsResponse.ok ||
      !bookingsResponse.ok
    ) {
      throw new Error('Gagal memuat dashboard super admin');
    }

    const overviewData = await overviewResponse.json();
    const cemeteriesData = await cemeteriesResponse.json();
    const adminsData = await adminsResponse.json();
    const bookingsData = await bookingsResponse.json();

    setOverview(overviewData);
    setCemeteries(cemeteriesData.cemeteries || []);
    setAdmins(adminsData.admins || []);
    setBookings(bookingsData.bookings || []);

    if (!selectedCemeteryId && cemeteriesData.cemeteries?.length) {
      setSelectedCemeteryId(cemeteriesData.cemeteries[0].id);
    }
  };

  const loadPlots = async (cemeteryId: string) => {
    if (!cemeteryId) {
      setPlots([]);
      return;
    }

    const response = await fetch(`/api/admin/plots?cemeteryId=${cemeteryId}`);

    if (!response.ok) {
      throw new Error('Gagal memuat plot cemetery');
    }

    const data = await response.json();
    setPlots(data.plots || []);
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

        setUser(me);
        await loadOverview();
      } catch (loadError) {
        console.error(loadError);
        setError('Terjadi kesalahan saat memuat dashboard super admin.');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [router]);

  useEffect(() => {
    if (!selectedCemeteryId) {
      return;
    }

    loadPlots(selectedCemeteryId).catch((loadError) => {
      console.error(loadError);
      setError('Terjadi kesalahan saat memuat plot cemetery.');
    });
  }, [selectedCemeteryId]);

  const refreshAll = async () => {
    await loadOverview();
    if (selectedCemeteryId) {
      await loadPlots(selectedCemeteryId);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

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
        body: JSON.stringify({
          ...adminForm,
          cemeteryId: selectedCemeteryId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Gagal menambah admin');
        return;
      }

      setAdminForm(defaultAdminForm);
      await refreshAll();
    } catch (submitError) {
      console.error(submitError);
      setError('Terjadi kesalahan saat menambah admin.');
    } finally {
      setSubmittingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    try {
      const response = await fetch(`/api/superadmin/admins/${adminId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Gagal menghapus admin');
        return;
      }

      await refreshAll();
    } catch (deleteError) {
      console.error(deleteError);
      setError('Terjadi kesalahan saat menghapus admin.');
    }
  };

  const handleCreatePlot = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!selectedCemeteryId) {
      setError('Pilih cemetery terlebih dahulu.');
      return;
    }

    try {
      setSubmittingPlot(true);
      const response = await fetch('/api/admin/plots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...plotForm,
          cemeteryId: selectedCemeteryId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Gagal menambah plot');
        return;
      }

      setPlotForm(defaultPlotForm);
      await refreshAll();
    } catch (submitError) {
      console.error(submitError);
      setError('Terjadi kesalahan saat menambah plot.');
    } finally {
      setSubmittingPlot(false);
    }
  };

  const handlePlotStatusChange = async (plotId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/plots/${plotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Gagal memperbarui status plot');
        return;
      }

      await refreshAll();
    } catch (updateError) {
      console.error(updateError);
      setError('Terjadi kesalahan saat memperbarui plot.');
    }
  };

  const handleDeletePlot = async (plotId: string) => {
    try {
      const response = await fetch(`/api/admin/plots/${plotId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Gagal menghapus plot');
        return;
      }

      await refreshAll();
    } catch (deleteError) {
      console.error(deleteError);
      setError('Terjadi kesalahan saat menghapus plot.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <Card className="p-8">Memuat dashboard super admin...</Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Super Admin</h1>
            <p className="text-sm text-muted-foreground">
              Akses penuh ke seluruh cemetery, plot, booking, dan akun admin
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
              {user?.email}
            </Badge>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <BackButton fallbackHref="/" className="mb-6" />

        {error && (
          <Card className="mb-6 border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </Card>
        )}

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Total Plot</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {overview?.stats.totalPlots ?? 0}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Jumlah Booking</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {overview?.stats.totalBookings ?? 0}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Jumlah User</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {overview?.stats.totalUsers ?? 0}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Pendapatan Global</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {formatRupiah(overview?.stats.totalRevenue ?? 0)}
            </p>
          </Card>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Total Cemetery</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {overview?.stats.totalCemeteries ?? 0}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Plot Tersedia</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {overview?.stats.availablePlots ?? 0}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Cemetery Admin</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {overview?.stats.totalCemeteryAdmins ?? 0}
            </p>
          </Card>
        </div>

        <div className="mb-8 grid gap-8 xl:grid-cols-[1.05fr,0.95fr]">
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground">Manage Cemetery</h2>
              <p className="text-sm text-muted-foreground">
                Lihat semua cemetery beserta plot, booking, dan admin yang ditugaskan
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cemetery</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Total Plot</TableHead>
                  <TableHead>Tersedia</TableHead>
                  <TableHead>Booking</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cemeteries.map((cemetery) => (
                  <TableRow key={cemetery.id}>
                    <TableCell className="font-medium">{cemetery.name}</TableCell>
                    <TableCell>{cemetery.location || '-'}</TableCell>
                    <TableCell>{cemetery.totalPlots ?? 0}</TableCell>
                    <TableCell>{cemetery.availablePlots ?? 0}</TableCell>
                    <TableCell>{cemetery.totalBookings ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground">Manage Admin</h2>
              <p className="text-sm text-muted-foreground">
                Tambah atau hapus Cemetery Admin dan tetapkan berdasarkan lokasi cemetery
              </p>
            </div>

            <form onSubmit={handleCreateAdmin} className="mb-6 grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Email admin"
                value={adminForm.email}
                onChange={(event) =>
                  setAdminForm((prev) => ({ ...prev, email: event.target.value }))
                }
                required
              />
              <Input
                placeholder="Nama depan"
                value={adminForm.firstName}
                onChange={(event) =>
                  setAdminForm((prev) => ({ ...prev, firstName: event.target.value }))
                }
                required
              />
              <Input
                placeholder="Nama belakang"
                value={adminForm.lastName}
                onChange={(event) =>
                  setAdminForm((prev) => ({ ...prev, lastName: event.target.value }))
                }
                required
              />
              <Input
                placeholder="Password dummy/testing"
                type="password"
                value={adminForm.password}
                onChange={(event) =>
                  setAdminForm((prev) => ({ ...prev, password: event.target.value }))
                }
                required
              />
              <div className="md:col-span-2">
                <select
                  value={selectedCemeteryId}
                  onChange={(event) => setSelectedCemeteryId(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                >
                  <option value="">Pilih cemetery</option>
                  {cemeteries.map((cemetery) => (
                    <option key={cemetery.id} value={cemetery.id}>
                      {cemetery.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={submittingAdmin} className="bg-emerald-600 text-white hover:bg-emerald-700">
                  <Plus className="mr-2 h-4 w-4" />
                  {submittingAdmin ? 'Menyimpan...' : 'Tambah Cemetery Admin'}
                </Button>
              </div>
            </form>

            <div className="space-y-3">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
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
                    onClick={() => handleDeleteAdmin(admin.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="mb-8 grid gap-8 xl:grid-cols-[1.05fr,0.95fr]">
          <Card className="p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Manage Plot</h2>
                <p className="text-sm text-muted-foreground">
                  Tambah, ubah status, dan hapus plot berdasarkan cemetery terpilih
                </p>
              </div>
              <select
                value={selectedCemeteryId}
                onChange={(event) => setSelectedCemeteryId(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                <option value="">Pilih cemetery</option>
                {cemeteries.map((cemetery) => (
                  <option key={cemetery.id} value={cemetery.id}>
                    {cemetery.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCemetery && (
              <p className="mb-4 text-sm text-muted-foreground">
                Mengelola plot untuk <span className="font-medium text-foreground">{selectedCemetery.name}</span>
              </p>
            )}

            <form onSubmit={handleCreatePlot} className="mb-6 grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Nomor plot"
                value={plotForm.plotNumber}
                onChange={(event) =>
                  setPlotForm((prev) => ({ ...prev, plotNumber: event.target.value }))
                }
                required
              />
              <Input
                placeholder="Section"
                value={plotForm.section}
                onChange={(event) =>
                  setPlotForm((prev) => ({ ...prev, section: event.target.value }))
                }
                required
              />
              <Input
                placeholder="Row"
                value={plotForm.row}
                onChange={(event) =>
                  setPlotForm((prev) => ({ ...prev, row: event.target.value }))
                }
                required
              />
              <select
                value={plotForm.status}
                onChange={(event) =>
                  setPlotForm((prev) => ({ ...prev, status: event.target.value }))
                }
                className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                <option value="available">available</option>
                <option value="booked">booked</option>
              </select>
              <div className="md:col-span-2">
                <Button type="submit" disabled={submittingPlot} className="bg-emerald-600 text-white hover:bg-emerald-700">
                  <Plus className="mr-2 h-4 w-4" />
                  {submittingPlot ? 'Menyimpan...' : 'Tambah Plot'}
                </Button>
              </div>
            </form>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plot</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Row</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plots.map((plot) => (
                  <TableRow key={plot.id}>
                    <TableCell className="font-medium">{plot.plotNumber}</TableCell>
                    <TableCell>{plot.section}</TableCell>
                    <TableCell>{plot.row}</TableCell>
                    <TableCell>
                      <select
                        value={plot.status}
                        onChange={(event) =>
                          handlePlotStatusChange(plot.id, event.target.value)
                        }
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                      >
                        <option value="available">available</option>
                        <option value="booked">booked</option>
                        <option value="reserved">reserved</option>
                        <option value="occupied">occupied</option>
                      </select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePlot(plot.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {plots.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                      Belum ada plot untuk cemetery ini.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground">Booking History</h2>
              <p className="text-sm text-muted-foreground">
                Riwayat booking makam dari semua user dan semua cemetery
              </p>
            </div>
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div key={booking.id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        {booking.user.firstName} {booking.user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{booking.user.email}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {booking.cemetery.name} • Plot {booking.plot.plotNumber}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <Badge variant="outline" className="mb-2">
                        {booking.status}
                      </Badge>
                      <p className="text-sm font-semibold text-foreground">
                        {formatRupiah(booking.totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Belum ada booking di seluruh sistem.
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
