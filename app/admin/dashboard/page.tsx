'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, LogOut, Plus, Settings } from 'lucide-react';
import { BackButton } from '@/components/back-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRupiah } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  cemeteryId?: string;
}

interface DashboardStats {
  totalPlots: number;
  availablePlots: number;
  totalBookings: number;
  totalRevenue: number;
}

interface ServicePreview {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  isActive: boolean;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [services, setServices] = useState<ServicePreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/admin/me');
        if (!response.ok) {
          router.push('/admin/login');
          return;
        }
        const userData = await response.json();
        
        // Check if user is admin
        if (userData.role !== 'CEMETERY_ADMIN' && userData.role !== 'SUPER_ADMIN') {
          router.push('/dashboard');
          return;
        }

        setUser(userData);
        
        // Fetch cemetery stats
        await fetchStats(userData);
        await fetchServicesPreview();
      } catch (error) {
        console.error(error);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async (userData: User) => {
      try {
        // In production, fetch real stats from API
        setStats({
          totalPlots: 500,
          availablePlots: 480,
          totalBookings: 20,
          totalRevenue: 10000,
        });
      } catch (error) {
        console.error(error);
      }
    };

    const fetchServicesPreview = async () => {
      try {
        const response = await fetch('/api/admin/services');
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setServices((data.services || []).slice(0, 4));
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-32 w-full mb-8" />
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'CEMETERY_ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dasbor Admin</h1>
              <p className="text-muted-foreground text-sm">Manajemen Pemakaman</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-border text-foreground hover:bg-muted"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BackButton fallbackHref="/" className="mb-8" />
        {/* Quick Stats */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="p-6 bg-card border-border">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-muted-foreground text-sm font-medium mb-2">Total Lahan</div>
                  <div className="text-3xl font-bold text-foreground">{stats.totalPlots}</div>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-muted-foreground text-sm font-medium mb-2">Lahan Tersedia</div>
                  <div className="text-3xl font-bold text-accent">{stats.availablePlots}</div>
                </div>
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-accent" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-muted-foreground text-sm font-medium mb-2">Total Pemesanan</div>
                  <div className="text-3xl font-bold text-primary">{stats.totalBookings}</div>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-muted-foreground text-sm font-medium mb-2">Total Pendapatan</div>
                  <div className="text-3xl font-bold text-foreground">{formatRupiah(stats.totalRevenue)}</div>
                </div>
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-accent" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Management Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Plot Management */}
          <Card className="p-8 bg-card border-border">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Manajemen Lahan</h2>
                <p className="text-muted-foreground">Kelola lahan pemakaman dan status ketersediaannya</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Lahan
              </Button>
            </div>

            <div className="space-y-4">
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-medium text-foreground mb-3">Aksi Cepat</h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Lihat Semua Lahan
                  </button>
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Impor Lahan dari CSV
                  </button>
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Perbarui Status Lahan
                  </button>
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Ekspor Laporan Lahan
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Booking Management */}
          <Card className="p-8 bg-card border-border">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Manajemen Pemesanan</h2>
                <p className="text-muted-foreground">Tinjau dan kelola pemesanan pelanggan</p>
              </div>
              <Button variant="outline" className="border-border text-foreground hover:bg-muted">
                <Settings className="w-4 h-4 mr-2" />
                Pengaturan
              </Button>
            </div>

            <div className="space-y-4">
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-medium text-foreground mb-3">Aksi Cepat</h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Lihat Semua Pemesanan
                  </button>
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Konfirmasi Tertunda
                  </button>
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Riwayat Pembayaran
                  </button>
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Buat Invoice
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Services Management */}
          <Card className="p-8 bg-card border-border">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Manajemen Layanan</h2>
                <p className="text-muted-foreground">Atur layanan pemakaman yang tersedia</p>
              </div>
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/admin/services">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Layanan
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-medium text-foreground mb-3">Aksi Cepat</h3>
                <div className="space-y-2">
                  <Link
                    href="/admin/services"
                    className="block w-full rounded px-4 py-2 text-left text-foreground transition-colors hover:bg-muted"
                  >
                    Lihat Semua Layanan
                  </Link>
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Perbarui Harga
                  </button>
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Analitik Layanan
                  </button>
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Aktifkan/Nonaktifkan Layanan
                  </button>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">Pratinjau Layanan</h3>
                  <Link
                    href="/admin/services"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Kelola semua
                  </Link>
                </div>

                {services.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-5 text-sm text-muted-foreground">
                    Belum ada layanan yang ditampilkan. Tambahkan layanan baru untuk mulai mengelola pemesanan layanan.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="rounded-lg border border-border bg-muted/20 px-4 py-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-medium text-foreground">{service.name}</h4>
                              <Badge
                                variant={service.isActive ? 'default' : 'secondary'}
                                className={service.isActive ? 'bg-emerald-600 hover:bg-emerald-600' : ''}
                              >
                                {service.isActive ? 'Aktif' : 'Nonaktif'}
                              </Badge>
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                              {service.description || 'Tidak ada deskripsi'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-foreground">
                              Rp {service.price.toLocaleString('id-ID')}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                              {service.category}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Reports & Analytics */}
          <Card className="p-8 bg-card border-border">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Laporan & Analitik</h2>
                <p className="text-muted-foreground">Lihat metrik performa dan insight operasional</p>
              </div>
              <Button variant="outline" className="border-border text-foreground hover:bg-muted">
                <BarChart3 className="w-4 h-4 mr-2" />
                Lihat
              </Button>
            </div>

            <div className="space-y-4">
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-medium text-foreground mb-3">Laporan Tersedia</h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Laporan Pendapatan
                  </button>
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Tren Pemesanan
                  </button>
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Laporan Okupansi
                  </button>
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Log Audit
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Settings Section */}
        <Card className="p-8 bg-card border-border mt-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Pengaturan Pemakaman</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Informasi Umum</h3>
              <div className="space-y-3 text-foreground">
                <p><span className="font-medium">Nama:</span> Peaceful Rest Cemetery</p>
                <p><span className="font-medium">Lokasi:</span> Springfield, IL</p>
                <p><span className="font-medium">Kontak:</span> info@peacefulrest.com</p>
                <p><span className="font-medium">Telepon:</span> +1-217-555-0100</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Administrasi</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start border-border text-foreground hover:bg-muted">
                  Edit Info Pemakaman
                </Button>
                <Button variant="outline" className="w-full justify-start border-border text-foreground hover:bg-muted">
                  Kelola Admin
                </Button>
                <Button variant="outline" className="w-full justify-start border-border text-foreground hover:bg-muted">
                  Pengaturan API
                </Button>
                <Button variant="outline" className="w-full justify-start border-border text-foreground hover:bg-muted">
                  Integrasi
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
