'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Plot {
  id: string;
  label: string;
  location: string;
  price: number;
  status: 'available' | 'reserved' | 'sold';
  description: string;
}

const plots: Plot[] = [
  {
    id: 'plot-101',
    label: 'Blok A1 - Lahan 101',
    location: 'Tepi utara, dekat jalan utama',
    price: 3250000,
    status: 'available',
    description: 'Lahan makam yang nyaman dengan akses mudah dan pemandangan hijau.',
  },
  {
    id: 'plot-102',
    label: 'Blok A1 - Lahan 102',
    location: 'Tepi utara, bangku kedua',
    price: 3150000,
    status: 'available',
    description: 'Lahan yang tenang di area berjarak pendek dari area parkir.',
  },
  {
    id: 'plot-103',
    label: 'Blok A1 - Lahan 103',
    location: 'Tepi selatan, sebelah pohon maple',
    price: 3350000,
    status: 'reserved',
    description: 'Posisi khusus dengan sedikit privasi ekstra dan pemandangan tanaman.',
  },
  {
    id: 'plot-104',
    label: 'Blok B2 - Lahan 104',
    location: 'Tengah taman, dekat kolam air',
    price: 3450000,
    status: 'sold',
    description: 'Lahan makam premium dengan akses terbaik dan lingkungan asri.',
  },
  {
    id: 'plot-105',
    label: 'Blok B2 - Lahan 105',
    location: 'Tengah taman, baris paling depan',
    price: 3200000,
    status: 'available',
    description: 'Pilihan ekonomis yang tetap berada di lokasi strategis taman makam.',
  },
  {
    id: 'plot-106',
    label: 'Blok C3 - Lahan 106',
    location: 'Area baru, sudut timur',
    price: 3100000,
    status: 'available',
    description: 'Lahan baru di bagian yang lebih tenang dari kompleks.',
  },
];

export default function CemeteryDetailPage() {
  const [selectedPlot, setSelectedPlot] = useState<string>('plot-101');
  const selectedPlotData = plots.find((plot) => plot.id === selectedPlot) ?? plots[0];

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">Pilih Lahan Makam</h1>
          <p className="max-w-2xl text-muted-foreground">
            Pilih lahan makam yang Anda inginkan. Klik kartu lahan untuk melihat detail dan
            melanjutkan pemesanan.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {plots.map((plot) => {
            const isSelected = plot.id === selectedPlot;
            const available = plot.status === 'available';
            const statusLabel =
              plot.status === 'available'
                ? 'Tersedia'
                : plot.status === 'reserved'
                ? 'Dipesan'
                : 'Terjual';

            return (
              <Card
                key={plot.id}
                className={cn(
                  'cursor-pointer transition-shadow duration-200 ease-in-out hover:shadow-lg',
                  !available && 'opacity-70 pointer-events-none',
                  isSelected && 'border-primary bg-primary/10 shadow-lg',
                )}
                onClick={() => available && setSelectedPlot(plot.id)}
              >
                <CardHeader className="space-y-2 px-6 pt-6">
                  <CardTitle>{plot.label}</CardTitle>
                  <CardDescription>{plot.location}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 px-6 pb-6">
                  <div className="flex items-center justify-between rounded-2xl bg-muted p-4 text-sm text-foreground">
                    <span>Status</span>
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                        plot.status === 'available' && 'bg-emerald-100 text-emerald-700',
                        plot.status === 'reserved' && 'bg-amber-100 text-amber-700',
                        plot.status === 'sold' && 'bg-destructive/10 text-destructive',
                      )}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>{plot.description}</p>
                    <p>
                      Harga: <span className="font-semibold text-foreground">Rp {plot.price.toLocaleString('id-ID')}</span>
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="px-6 pb-6 pt-0">
                  <Button
                    variant={isSelected ? 'secondary' : 'outline'}
                    className="w-full"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (available) setSelectedPlot(plot.id);
                    }}
                    disabled={!available}
                  >
                    {available ? (isSelected ? 'Sedang Dipilih' : 'Pilih Lahan') : 'Tidak tersedia'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="space-y-2 px-6 pt-6">
            <CardTitle>Ringkasan Lahan Terpilih</CardTitle>
            <CardDescription>Pilihan Anda akan ditampilkan di sini sebelum melanjutkan pemesanan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Lahan</p>
                <p className="text-base font-semibold text-foreground">{selectedPlotData.label}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lokasi</p>
                <p className="text-base font-semibold text-foreground">{selectedPlotData.location}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-base font-semibold text-foreground">
                  {selectedPlotData.status === 'available'
                    ? 'Tersedia'
                    : selectedPlotData.status === 'reserved'
                    ? 'Dipesan'
                    : 'Terjual'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Harga</p>
                <p className="text-base font-semibold text-foreground">Rp {selectedPlotData.price.toLocaleString('id-ID')}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
              {selectedPlotData.description}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Pastikan lahan sudah sesuai sebelum melanjutkan ke proses pemesanan.
              </p>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Lanjutkan Pesanan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
