'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

interface ServiceItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  isActive: boolean;
  cemeteryId: string;
  createdAt: string;
  updatedAt: string;
}

interface ServiceFormState {
  name: string;
  description: string;
  price: string;
  category: string;
  isActive: boolean;
}

const emptyForm: ServiceFormState = {
  name: '',
  description: '',
  price: '',
  category: '',
  isActive: true,
};

export default function AdminServicesPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);
  const [form, setForm] = useState<ServiceFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const activeCount = useMemo(
    () => services.filter((service) => service.isActive).length,
    [services]
  );

  const inactiveCount = services.length - activeCount;

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const meResponse = await fetch('/api/admin/me');
        if (!meResponse.ok) {
          router.push('/admin/login');
          return;
        }

        const me = await meResponse.json();
        if (me.role !== 'CEMETERY_ADMIN' && me.role !== 'SUPER_ADMIN') {
          router.push('/dashboard');
          return;
        }

        setUser(me);
        await fetchServices();
      } catch (fetchError) {
        console.error(fetchError);
        setError('Gagal memuat layanan admin');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [router]);

  const fetchServices = async () => {
    const response = await fetch('/api/admin/services');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Gagal memuat layanan');
    }

    setServices(data.services || []);
  };

  const openCreateDialog = () => {
    setEditingService(null);
    setForm(emptyForm);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (service: ServiceItem) => {
    setEditingService(service);
    setForm({
      name: service.name,
      description: service.description || '',
      price: String(service.price),
      category: service.category === 'general' ? '' : service.category,
      isActive: service.isActive,
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;
    try {
      setDeleting(true);
      setError(null);
      const response = await fetch(`/api/admin/services/${serviceToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghapus layanan');
      }

      await fetchServices();
      setServiceToDelete(null);
    } catch (deleteError) {
      console.error(deleteError);
      setError(deleteError instanceof Error ? deleteError.message : 'Gagal menghapus layanan');
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim()) {
      setFormError('Nama layanan wajib diisi');
      return;
    }

    if (!form.price || Number(form.price) < 0) {
      setFormError('Harga harus bernilai nol atau lebih');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category.trim(),
        isActive: form.isActive,
      };

      const response = await fetch(
        editingService
          ? `/api/admin/services/${editingService.id}`
          : '/api/admin/services',
        {
          method: editingService ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menyimpan layanan');
      }

      await fetchServices();
      setDialogOpen(false);
      setEditingService(null);
      setForm(emptyForm);
    } catch (submitError) {
      console.error(submitError);
      setFormError(submitError instanceof Error ? submitError.message : 'Gagal menyimpan layanan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-24 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-32 w-full" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <Card className="overflow-hidden border-border bg-card">
          <div className="flex flex-col gap-6 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 px-6 py-8 text-white md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white/90">
                <ShieldCheck className="h-3.5 w-3.5" />
                Layanan Admin
              </div>
              <div>
                <h1 className="text-3xl font-bold">Kelola Layanan Pemakaman</h1>
                <p className="mt-2 max-w-2xl text-sm text-emerald-50/90">
                  Atur layanan seperti Reguler, VIP, VVIP, termasuk deskripsi, harga,
                  kategori, dan status aktif yang tampil pada alur booking.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={() => router.push('/admin/dashboard')}
              >
                Kembali ke Dasbor
              </Button>
              <Button
                className="bg-white text-emerald-900 hover:bg-emerald-50"
                onClick={openCreateDialog}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah layanan
              </Button>
            </div>
          </div>
        </Card>

        {error && (
          <Card className="border-destructive bg-destructive/10 p-4">
            <p className="text-sm font-medium text-destructive">{error}</p>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total layanan</p>
            <p className="mt-3 text-3xl font-bold text-foreground">{services.length}</p>
          </Card>
          <Card className="border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Layanan aktif</p>
            <p className="mt-3 text-3xl font-bold text-emerald-600">{activeCount}</p>
          </Card>
          <Card className="border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Layanan nonaktif</p>
            <p className="mt-3 text-3xl font-bold text-amber-600">{inactiveCount}</p>
          </Card>
        </div>

        <Card className="border-border bg-card p-4 sm:p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Daftar layanan</h2>
              <p className="text-sm text-muted-foreground">
                Semua layanan untuk cemetery yang dikelola admin ini.
              </p>
            </div>
          </div>

          {services.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
              <Wrench className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">Belum ada layanan</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Tambahkan layanan pertama agar bisa dipilih saat proses booking.
              </p>
              <Button className="mt-6" onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah layanan
              </Button>
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama layanan</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell className="max-w-md whitespace-normal text-sm text-muted-foreground">
                          {service.description || 'Tidak ada deskripsi'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{service.category}</Badge>
                        </TableCell>
                        <TableCell>Rp {service.price.toLocaleString('id-ID')}</TableCell>
                        <TableCell>
                          <Badge
                            variant={service.isActive ? 'default' : 'secondary'}
                            className={service.isActive ? 'bg-emerald-600 hover:bg-emerald-600' : ''}
                          >
                            {service.isActive ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(service)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setServiceToDelete(service)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid gap-4 md:hidden">
                {services.map((service) => (
                  <Card key={service.id} className="border-border bg-card p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{service.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {service.description || 'Tidak ada deskripsi'}
                        </p>
                      </div>
                      <Badge
                        variant={service.isActive ? 'default' : 'secondary'}
                        className={service.isActive ? 'bg-emerald-600 hover:bg-emerald-600' : ''}
                      >
                        {service.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{service.category}</Badge>
                      <Badge variant="outline">Rp {service.price.toLocaleString('id-ID')}</Badge>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => openEditDialog(service)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => setServiceToDelete(service)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingService(null);
            setForm(emptyForm);
            setFormError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Edit layanan' : 'Tambah layanan baru'}
            </DialogTitle>
            <DialogDescription>
              Isi informasi layanan yang akan tampil pada alur booking customer.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {formError && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                {formError}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="service-name">Nama layanan</Label>
                <Input
                  id="service-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Reguler, VIP, VVIP"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="service-description">Deskripsi</Label>
                <Textarea
                  id="service-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="Deskripsikan fasilitas atau layanan yang didapat customer"
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-price">Harga</Label>
                <Input
                  id="service-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, price: event.target.value }))
                  }
                  placeholder="500000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-category">Kategori</Label>
                <Input
                  id="service-category"
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, category: event.target.value }))
                  }
                  placeholder="Opsional, default ke umum"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <div>
                    <Label htmlFor="service-active">Status aktif</Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Jika nonaktif, layanan tidak akan ditawarkan di proses booking.
                    </p>
                  </div>
                  <Switch
                    id="service-active"
                    checked={form.isActive}
                    onCheckedChange={(checked) =>
                      setForm((current) => ({ ...current, isActive: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : editingService ? (
                  'Simpan perubahan'
                ) : (
                  'Tambah layanan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(serviceToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setServiceToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus layanan ini?</AlertDialogTitle>
            <AlertDialogDescription>
              {serviceToDelete
                ? `Layanan "${serviceToDelete.name}" akan dihapus dari sistem. Tindakan ini tidak bisa dibatalkan.`
                : 'Tindakan ini tidak bisa dibatalkan.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                'Ya, hapus layanan'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
