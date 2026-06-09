'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { DashboardSection } from '@/components/dashboard-shell';
import { PortalShell } from '@/components/portal-shell';
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

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  cemeteryId?: string | null;
}

interface PlotItem {
  id: string;
  plotNumber: string;
  section: string;
  row: string;
  status: string;
  cemeteryId: string;
  price?: number | null;
}

const defaultPlotForm = {
  plotNumber: '',
  section: '',
  row: '',
  status: 'available',
};

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

export default function AdminPlotsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [plots, setPlots] = useState<PlotItem[]>([]);
  const [plotForm, setPlotForm] = useState(defaultPlotForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlots = async () => {
    const plotsResponse = await fetch('/api/admin/plots', {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    const plotsBody = await readResponseBody(plotsResponse);

    if (!plotsResponse.ok) {
      console.error('Admin plots request failed', {
        endpoint: '/api/admin/plots',
        status: plotsResponse.status,
        statusText: plotsResponse.statusText,
        error: plotsBody,
      });
      setError(
        `Data plot gagal dimuat (${plotsResponse.status}): ${getErrorMessageFromBody(
          plotsBody,
          'Terjadi kesalahan pada endpoint plot.'
        )}`
      );
      setPlots([]);
    } else {
      setPlots(((plotsBody as { plots?: PlotItem[] } | null)?.plots || []) as PlotItem[]);
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
          router.push('/superadmin/plots');
          return;
        }

        if (me.role !== 'CEMETERY_ADMIN') {
          router.push('/login');
          return;
        }

        setUser(me);
        await loadPlots();
      } catch (loadError) {
        console.error('Admin plots bootstrap error', loadError);
        setError('Terjadi kesalahan saat memuat data plot.');
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
      await loadPlots();
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

      await loadPlots();
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

      await loadPlots();
    } catch (deleteError) {
      console.error(deleteError);
      setError('Terjadi kesalahan saat menghapus plot.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_34%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(246,248,251,1))] px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <Card className="border-white/70 bg-white/90 p-8">Memuat data plot...</Card>
        </div>
      </div>
    );
  }

  return (
    <PortalShell
      role="CEMETERY_ADMIN"
      roleLabel="Cemetery Admin"
      title="Kelola Plot Makam"
      description="Tambah plot baru, ubah status ketersediaan, atau hapus data yang tidak lagi dipakai."
      userEmail={user?.email}
      onLogout={handleLogout}
    >
      <div className="mx-auto max-w-7xl">
        {error && (
          <Card className="mb-6 border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </Card>
        )}

        <DashboardSection
          title="Daftar Plot"
          description="Daftar semua plot yang ada di cemetery yang Anda kelola."
        >
          <form onSubmit={handleCreatePlot} className="mb-6 grid gap-3 md:grid-cols-2">
            <Input
              placeholder="Nomor plot"
              value={plotForm.plotNumber}
              onChange={(event) =>
                setPlotForm((prev) => ({ ...prev, plotNumber: event.target.value }))
              }
              required
              className="h-11 rounded-xl bg-background/80 shadow-sm"
            />
            <Input
              placeholder="Section"
              value={plotForm.section}
              onChange={(event) =>
                setPlotForm((prev) => ({ ...prev, section: event.target.value }))
              }
              required
              className="h-11 rounded-xl bg-background/80 shadow-sm"
            />
            <Input
              placeholder="Row"
              value={plotForm.row}
              onChange={(event) =>
                setPlotForm((prev) => ({ ...prev, row: event.target.value }))
              }
              required
              className="h-11 rounded-xl bg-background/80 shadow-sm"
            />
            <select
              value={plotForm.status}
              onChange={(event) =>
                setPlotForm((prev) => ({ ...prev, status: event.target.value }))
              }
              className="h-11 rounded-xl border border-input bg-background/80 px-3 text-sm text-foreground shadow-sm"
            >
              <option value="available">available</option>
              <option value="booked">booked</option>
            </select>
            <div className="md:col-span-2">
              <Button type="submit" disabled={submitting} className="h-11 rounded-xl px-5">
                <Plus className="mr-2 h-4 w-4" />
                {submitting ? 'Menyimpan...' : 'Tambah Plot'}
              </Button>
            </div>
          </form>

          <div className="overflow-hidden rounded-[24px] border border-border/70">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
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
                    <TableRow key={plot.id} className="bg-white/70">
                      <TableCell className="font-medium">{plot.plotNumber}</TableCell>
                      <TableCell>{plot.section}</TableCell>
                      <TableCell>{plot.row}</TableCell>
                      <TableCell>
                        <select
                          value={plot.status}
                          onChange={(event) =>
                            handlePlotStatusChange(plot.id, event.target.value)
                          }
                          className="h-10 rounded-xl border border-input bg-background/80 px-3 text-sm text-foreground shadow-sm"
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
                          className="rounded-xl"
                          onClick={() => handleDeletePlot(plot.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {plots.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        Belum ada plot untuk cemetery ini.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DashboardSection>
      </div>
    </PortalShell>
  );
}
