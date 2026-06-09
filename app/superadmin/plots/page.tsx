'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Trees } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CemeteryItem {
  id: string;
  name: string;
  location: string | null;
}

interface PlotItem {
  id: string;
  plotNumber: string;
  section: string;
  row: string;
  status: string;
  cemeteryId: string;
}

const defaultPlotForm = {
  plotNumber: '',
  section: '',
  row: '',
  status: 'available',
};

export default function SuperadminPlotsPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cemeteries, setCemeteries] = useState<CemeteryItem[]>([]);
  const [plots, setPlots] = useState<PlotItem[]>([]);
  const [selectedCemeteryId, setSelectedCemeteryId] = useState('');
  const [plotForm, setPlotForm] = useState(defaultPlotForm);
  const [submittingPlot, setSubmittingPlot] = useState(false);

  const selectedCemetery = useMemo(
    () => cemeteries.find((c) => c.id === selectedCemeteryId) || null,
    [cemeteries, selectedCemeteryId]
  );

  const loadPlots = async (cemeteryId: string) => {
    if (!cemeteryId) {
      setPlots([]);
      return;
    }
    const response = await fetch(`/api/admin/plots?cemeteryId=${cemeteryId}`);
    if (!response.ok) throw new Error('Gagal memuat plot');
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
        setUserEmail(me.email);

        const cemRes = await fetch('/api/superadmin/cemeteries');
        if (!cemRes.ok) throw new Error('Gagal memuat data cemetery');
        const cemData = await cemRes.json();
        const list: CemeteryItem[] = cemData.cemeteries || [];
        setCemeteries(list);

        if (list.length > 0) {
          setSelectedCemeteryId(list[0].id);
        }
      } catch (err) {
        console.error(err);
        setError('Terjadi kesalahan saat memuat data.');
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [router]);

  useEffect(() => {
    if (!selectedCemeteryId) return;
    loadPlots(selectedCemeteryId).catch((err) => {
      console.error(err);
      setError('Terjadi kesalahan saat memuat plot.');
    });
  }, [selectedCemeteryId]);

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
        body: JSON.stringify({ ...plotForm, cemeteryId: selectedCemeteryId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Gagal menambah plot');
        return;
      }
      setPlotForm(defaultPlotForm);
      await loadPlots(selectedCemeteryId);
    } catch (err) {
      console.error(err);
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
      await loadPlots(selectedCemeteryId);
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan saat memperbarui plot.');
    }
  };

  const handleDeletePlot = async (plotId: string) => {
    try {
      const response = await fetch(`/api/admin/plots/${plotId}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Gagal menghapus plot');
        return;
      }
      await loadPlots(selectedCemeteryId);
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan saat menghapus plot.');
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
          <Card className="border-white/70 bg-white/90 p-8">Memuat data plot...</Card>
        </div>
      </div>
    );
  }

  const availableCount = plots.filter((p) => p.status === 'available').length;

  return (
    <PortalShell
      role="SUPER_ADMIN"
      roleLabel="Super Admin"
      title="Kelola Plot Global"
      description="Operasikan plot di seluruh cemetery dari satu tempat."
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
            title="Pengelolaan Plot Global"
            description="Pilih cemetery untuk melihat, menambah, mengubah status, atau menghapus plot yang tersedia."
          />

          <div className="grid gap-4 md:grid-cols-3">
            <DashboardStatCard
              label="Total Plot"
              value={plots.length}
              description="Semua plot di cemetery ini."
              icon={Trees}
            />
            <DashboardStatCard
              label="Tersedia"
              value={availableCount}
              description="Plot yang bisa dipesan."
              icon={Trees}
              accentClassName="bg-emerald-500/10 text-emerald-600"
            />
            <DashboardStatCard
              label="Terpakai"
              value={plots.length - availableCount}
              description="Plot booked / occupied / reserved."
              icon={Trees}
              accentClassName="bg-rose-500/10 text-rose-600"
            />
          </div>

          <DashboardSection
            title="Kelola Plot"
            description="Operasikan plot berdasarkan cemetery yang sedang dipilih."
            action={
              <select
                value={selectedCemeteryId}
                onChange={(event) => setSelectedCemeteryId(event.target.value)}
                className="h-11 rounded-xl border border-input bg-background/80 px-3 text-sm text-foreground shadow-sm"
              >
                <option value="">Pilih cemetery</option>
                {cemeteries.map((cemetery) => (
                  <option key={cemetery.id} value={cemetery.id}>
                    {cemetery.name}
                  </option>
                ))}
              </select>
            }
          >
            {selectedCemetery && (
              <div className="mb-5 rounded-[24px] border border-primary/10 bg-primary/[0.05] px-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Mengelola plot untuk{' '}
                  <span className="font-medium text-foreground">{selectedCemetery.name}</span>
                </p>
              </div>
            )}

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
                <Button type="submit" disabled={submittingPlot} className="h-11 rounded-xl px-5">
                  <Plus className="mr-2 h-4 w-4" />
                  {submittingPlot ? 'Menyimpan...' : 'Tambah Plot'}
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
                          {selectedCemeteryId
                            ? 'Belum ada plot untuk cemetery ini.'
                            : 'Pilih cemetery untuk melihat plot.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DashboardSection>
        </div>
      </div>
    </PortalShell>
  );
}
