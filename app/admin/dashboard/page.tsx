'use client';

import { useEffect, useState } from 'react';
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
  firstName: string;
  lastName: string;
  role: string;
  cemeteryId?: string | null;
}

interface CemeterySummary {
  id: string;
  name: string;
  location: string | null;
  city: string | null;
  province: string | null;
}

interface OverviewResponse {
  role: string;
  cemetery: CemeterySummary | null;
  stats: {
    totalPlots: number;
    availablePlots: number;
    totalBookings: number;
    totalRevenue: number;
  };
}

interface PlotItem {
  id: string;
  plotNumber: string;
  section: string;
  row: string;
  status: string;
  cemeteryId: string;
  price?: number | null;
  cemetery?: {
    name: string;
    location: string | null;
  };
}

interface BookingItem {
  id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
  };
  plot: {
    plotNumber: string;
    section: string;
    row: string;
  };
}

const defaultPlotForm = {
  plotNumber: '',
  section: '',
  row: '',
  status: 'available',
};

function getOverviewEndpointByRole(role: string | null | undefined) {
  return role === 'SUPER_ADMIN' ? '/api/superadmin/overview' : '/api/admin/overview';
}

async function readResponseBody(response: Response) {
  const rawText = await response.text();

  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText);
  } catch {
    return rawText;
  }
}

function getErrorMessageFromBody(body: unknown, fallbackMessage: string) {
  if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
    return body.error;
  }

  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  return fallbackMessage;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [plots, setPlots] = useState<PlotItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [plotForm, setPlotForm] = useState(defaultPlotForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async (role: string) => {
    const overviewEndpoint = getOverviewEndpointByRole(role);
    const [overviewResponse, plotsResponse, bookingsResponse] = await Promise.all([
      fetch(overviewEndpoint, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      }),
      fetch('/api/admin/plots', {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      }),
      fetch('/api/admin/bookings', {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      }),
    ]);

    const [overviewBody, plotsBody, bookingsBody] = await Promise.all([
      readResponseBody(overviewResponse),
      readResponseBody(plotsResponse),
      readResponseBody(bookingsResponse),
    ]);

    const loadErrors: string[] = [];

    if (!overviewResponse.ok) {
      console.error('Admin dashboard overview request failed', {
        endpoint: overviewEndpoint,
        status: overviewResponse.status,
        statusText: overviewResponse.statusText,
        error: overviewBody,
      });
      loadErrors.push(
        `Overview admin gagal dimuat (${overviewResponse.status}): ${getErrorMessageFromBody(
          overviewBody,
          'Terjadi kesalahan pada endpoint overview.'
        )}`
      );
      setOverview(null);
    } else {
      console.log('Admin dashboard overview request succeeded', {
        endpoint: overviewEndpoint,
        status: overviewResponse.status,
      });
      setOverview(overviewBody as OverviewResponse);
    }

    if (!plotsResponse.ok) {
      console.error('Admin dashboard plots request failed', {
        endpoint: '/api/admin/plots',
        status: plotsResponse.status,
        statusText: plotsResponse.statusText,
        error: plotsBody,
      });
      loadErrors.push(
        `Data plot gagal dimuat (${plotsResponse.status}): ${getErrorMessageFromBody(
          plotsBody,
          'Terjadi kesalahan pada endpoint plot.'
        )}`
      );
      setPlots([]);
    } else {
      setPlots(((plotsBody as { plots?: PlotItem[] } | null)?.plots || []) as PlotItem[]);
    }

    if (!bookingsResponse.ok) {
      console.error('Admin dashboard bookings request failed', {
        endpoint: '/api/admin/bookings',
        status: bookingsResponse.status,
        statusText: bookingsResponse.statusText,
        error: bookingsBody,
      });
      loadErrors.push(
        `Data booking gagal dimuat (${bookingsResponse.status}): ${getErrorMessageFromBody(
          bookingsBody,
          'Terjadi kesalahan pada endpoint booking.'
        )}`
      );
      setBookings([]);
    } else {
      setBookings(
        (((bookingsBody as { bookings?: BookingItem[] } | null)?.bookings || []) as BookingItem[])
      );
    }

    if (loadErrors.length > 0) {
      setError(loadErrors.join(' '));
    } else {
      setError(null);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const meResponse = await fetch('/api/admin/me', {
          method: 'GET',
          credentials: 'include',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });

        if (!meResponse.ok) {
          router.push('/admin/login');
          return;
        }

        const me = await meResponse.json();

        if (me.role === 'SUPER_ADMIN') {
          router.push('/superadmin/dashboard');
          return;
        }

        if (me.role !== 'CEMETERY_ADMIN') {
          router.push('/login');
          return;
        }

        setUser(me);
        await loadDashboard(me.role);
      } catch (loadError) {
        console.error('Admin dashboard bootstrap error', loadError);
        setError('Terjadi kesalahan saat memuat dashboard.');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleCreatePlot = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!user?.role) {
      setError('Role admin tidak ditemukan. Silakan login ulang.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/admin/plots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plotForm),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Gagal menambah plot');
        return;
      }

      setPlotForm(defaultPlotForm);
      await loadDashboard(user.role);
    } catch (submitError) {
      console.error(submitError);
      setError('Terjadi kesalahan saat menambah plot.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlotStatusChange = async (plotId: string, status: string) => {
    if (!user?.role) {
      setError('Role admin tidak ditemukan. Silakan login ulang.');
      return;
    }

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

      await loadDashboard(user.role);
    } catch (updateError) {
      console.error(updateError);
      setError('Terjadi kesalahan saat memperbarui plot.');
    }
  };

  const handleDeletePlot = async (plotId: string) => {
    if (!user?.role) {
      setError('Role admin tidak ditemukan. Silakan login ulang.');
      return;
    }

    try {
      const response = await fetch(`/api/admin/plots/${plotId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Gagal menghapus plot');
        return;
      }

      await loadDashboard(user.role);
    } catch (deleteError) {
      console.error(deleteError);
      setError('Terjadi kesalahan saat menghapus plot.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <Card className="p-8">Memuat dashboard admin...</Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Cemetery Admin</h1>
            <p className="text-sm text-muted-foreground">
              Kelola data cemetery sesuai lokasi penugasan Anda
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </Button>
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
            <p className="text-sm text-muted-foreground">Plot Tersedia</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {overview?.stats.availablePlots ?? 0}
            </p>
          </Card>
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
            <p className="text-sm text-muted-foreground">Pendapatan Lokasi</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {formatRupiah(overview?.stats.totalRevenue ?? 0)}
            </p>
          </Card>
        </div>

        <Card className="mb-8 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {overview?.cemetery?.name || 'Cemetery belum ditugaskan'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {overview?.cemetery?.location ||
                  [overview?.cemetery?.city, overview?.cemetery?.province]
                    .filter(Boolean)
                    .join(', ') ||
                  'Tidak ada lokasi tersedia'}
              </p>
            </div>
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
              {user?.email}
            </Badge>
          </div>
        </Card>

        <div className="grid gap-8 xl:grid-cols-[1.1fr,0.9fr]">
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Manage Plot</h2>
                <p className="text-sm text-muted-foreground">
                  Tambah, ubah status, dan hapus plot pada cemetery Anda
                </p>
              </div>
            </div>

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
                <Button type="submit" disabled={submitting} className="bg-emerald-600 text-white hover:bg-emerald-700">
                  <Plus className="mr-2 h-4 w-4" />
                  {submitting ? 'Menyimpan...' : 'Tambah Plot'}
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
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">Booking List</h2>
              <p className="text-sm text-muted-foreground">
                Daftar booking yang terjadi pada cemetery Anda saja
              </p>
            </div>

            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        {booking.user.firstName} {booking.user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{booking.user.email}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Plot {booking.plot.plotNumber} • {booking.plot.section} • {booking.plot.row}
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
                  Belum ada booking pada cemetery ini.
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
