'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GoogleMap,
  InfoWindowF,
  MarkerF,
  useJsApiLoader,
  type Libraries,
} from '@react-google-maps/api';
import { LocateFixed, MapPinned, Navigation, TriangleAlert } from 'lucide-react';
import { Header } from '@/components/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CemeteryMapItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string | null;
}

const libraries: Libraries = [];

const defaultCenter = {
  lat: -6.2088,
  lng: 106.8456,
};

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  clickableIcons: false,
  fullscreenControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  zoomControl: true,
};

export default function CemeteriesMapPage() {
  const router = useRouter();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const [cemeteries, setCemeteries] = useState<CemeteryMapItem[]>([]);
  const [selectedCemetery, setSelectedCemetery] = useState<CemeteryMapItem | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'cemeteries-google-map-script',
    googleMapsApiKey: apiKey || '',
    libraries,
    preventGoogleFontsLoading: true,
  });

  useEffect(() => {
    const fetchAllCemeteries = async () => {
      try {
        setDataLoading(true);
        setDataError(null);

        const firstResponse = await fetch('/api/cemeteries?page=1&limit=100');
        const firstData = await firstResponse.json();

        if (!firstResponse.ok) {
          throw new Error(firstData.error || 'Gagal memuat lokasi pemakaman');
        }

        let allCemeteries: CemeteryMapItem[] = firstData.cemeteries || [];
        const totalPages = firstData.pagination?.pages || 1;

        if (totalPages > 1) {
          const pageRequests = Array.from({ length: totalPages - 1 }, (_, index) =>
            fetch(`/api/cemeteries?page=${index + 2}&limit=100`).then(async (response) => {
              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.error || 'Gagal memuat lokasi pemakaman');
              }

              return data.cemeteries || [];
            })
          );

          const pages = await Promise.all(pageRequests);
          allCemeteries = allCemeteries.concat(...pages);
        }

        setCemeteries(allCemeteries);
      } catch (error) {
        console.error(error);
        setDataError(
          error instanceof Error ? error.message : 'Gagal memuat lokasi pemakaman'
        );
      } finally {
        setDataLoading(false);
      }
    };

    fetchAllCemeteries();
  }, []);

  useEffect(() => {
    if (!map || !isLoaded || cemeteries.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();

    cemeteries.forEach((cemetery) => {
      bounds.extend({
        lat: cemetery.latitude,
        lng: cemetery.longitude,
      });
    });

    if (userLocation) {
      bounds.extend(userLocation);
    }

    map.fitBounds(bounds);

    const listener = window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
      if ((map.getZoom() || 0) > 14) {
        map.setZoom(14);
      }
    });

    return () => {
      if (listener) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, [cemeteries, isLoaded, map, userLocation]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Browser ini tidak mendukung geolocation.');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setUserLocation(nextLocation);

        if (map) {
          map.panTo(nextLocation);
          map.setZoom(14);
        }

        setLocationLoading(false);
      },
      (error) => {
        console.error(error);
        setLocationError('Lokasi tidak bisa diambil. Izinkan akses lokasi lalu coba lagi.');
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const totalMarkersLabel = useMemo(() => {
    if (dataLoading) return 'Memuat...';
    return `${cemeteries.length} lokasi`;
  }, [cemeteries.length, dataLoading]);

  const renderContent = () => {
    if (!apiKey) {
      return (
        <Card className="border-amber-300 bg-amber-50 p-6">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 text-amber-700" />
            <div className="space-y-2">
              <h2 className="font-semibold text-amber-900">Google Maps API key belum diatur</h2>
              <p className="text-sm text-amber-800">
                Isi `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` di file environment lalu restart dev server.
              </p>
            </div>
          </div>
        </Card>
      );
    }

    if (loadError) {
      return (
        <Card className="border-destructive bg-destructive/10 p-6">
          <p className="font-medium text-destructive">
            Gagal memuat Google Maps script. Cek API key, domain restrictions, dan koneksi internet.
          </p>
        </Card>
      );
    }

    if (!isLoaded) {
      return (
        <div className="flex h-[70vh] items-center justify-center rounded-3xl border border-border bg-card">
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">Memuat Google Maps...</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Script peta sedang dipersiapkan.
            </p>
          </div>
        </div>
      );
    }

    if (dataError) {
      return (
        <Card className="border-destructive bg-destructive/10 p-6">
          <p className="font-medium text-destructive">{dataError}</p>
        </Card>
      );
    }

    return (
      <div className="cemeteries-map grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Peta TPU</h2>
              <p className="text-sm text-muted-foreground">
                Klik marker untuk melihat detail singkat dan buka halaman makam.
              </p>
            </div>

            <Button onClick={handleUseMyLocation} disabled={locationLoading}>
              <LocateFixed className="mr-2 h-4 w-4" />
              {locationLoading ? 'Mengambil lokasi...' : 'Gunakan lokasi saya'}
            </Button>
          </div>

          <div className="relative h-[70vh]">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={userLocation || defaultCenter}
              zoom={11}
              options={mapOptions}
              onLoad={(loadedMap) => setMap(loadedMap)}
              onUnmount={() => setMap(null)}
              onClick={() => setSelectedCemetery(null)}
            >
              {cemeteries.map((cemetery) => (
                <MarkerF
                  key={cemetery.id}
                  position={{
                    lat: cemetery.latitude,
                    lng: cemetery.longitude,
                  }}
                  title={cemetery.name}
                  onClick={() => setSelectedCemetery(cemetery)}
                />
              ))}

              {userLocation && (
                <MarkerF
                  position={userLocation}
                  title="Lokasi Anda"
                  label="Saya"
                />
              )}

              {selectedCemetery && (
                <InfoWindowF
                  position={{
                    lat: selectedCemetery.latitude,
                    lng: selectedCemetery.longitude,
                  }}
                  options={{
                    maxWidth: 320,
                    pixelOffset: new window.google.maps.Size(0, -10),
                  }}
                  onCloseClick={() => setSelectedCemetery(null)}
                >
                  <div className="w-[min(18rem,calc(100vw-4.5rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:w-72">
                    <div className="pr-8">
                      <h3 className="text-base font-semibold leading-snug text-slate-900">
                        {selectedCemetery.name}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {selectedCemetery.description || 'Tidak ada deskripsi singkat.'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="mt-4 min-h-10 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-emerald-500"
                      onClick={() => router.push(`/cemeteries/${selectedCemetery.id}`)}
                    >
                      Lihat Detail
                    </Button>
                  </div>
                </InfoWindowF>
              )}
            </GoogleMap>

            {dataLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[2px]">
                <div className="rounded-2xl border border-border bg-card px-5 py-4 text-center shadow-sm">
                  <p className="font-medium text-foreground">Memuat marker TPU...</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Data lokasi sedang diambil dari API.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total lokasi aktif</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{totalMarkersLabel}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MapPinned className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-foreground">Navigasi cepat</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Buka daftar TPU atau kembali ke halaman list standar.
                </p>
              </div>
              <Badge variant="outline">Tampilan Peta</Badge>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <Button asChild variant="outline">
                <Link href="/cemeteries">
                  <Navigation className="mr-2 h-4 w-4" />
                  Kembali ke daftar
                </Link>
              </Button>
            </div>
          </Card>

          <Card className="border-border bg-card p-5">
            <h2 className="font-semibold text-foreground">Panduan Peta</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Klik marker TPU untuk melihat informasi singkat lokasi.</li>
              <li>Gunakan tombol “Lihat Detail” untuk membuka halaman pemakaman.</li>
              <li>Tekan “Lokasi saya” untuk menampilkan posisi Anda di peta.</li>
              <li>Gunakan “Kembali ke daftar” untuk melihat TPU dalam bentuk daftar.</li>
            </ul>
          </Card>

          {locationError && (
            <Card className="border-amber-300 bg-amber-50 p-5">
              <p className="text-sm font-medium text-amber-900">{locationError}</p>
            </Card>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,0.9),_rgba(255,255,255,1))]">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <Badge className="bg-emerald-700 hover:bg-emerald-700">Google Maps</Badge>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Peta Lokasi TPU
              </h1>
              <p className="mt-2 max-w-3xl text-muted-foreground">
                Lihat persebaran lokasi TPU langsung di peta, temukan yang paling dekat,
                lalu buka detail makam dari marker yang dipilih.
              </p>
            </div>
          </div>
        </section>

        {renderContent()}
      </main>

      <style jsx global>{`
        .cemeteries-map .gm-style .gm-style-iw-c {
          padding: 0 !important;
          border-radius: 1rem !important;
          background: #ffffff !important;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.18) !important;
        }

        .cemeteries-map .gm-style .gm-style-iw-d {
          overflow: hidden !important;
          max-width: 20rem !important;
        }

        .cemeteries-map .gm-style .gm-style-iw-tc::after {
          background: #ffffff !important;
          box-shadow: -4px 4px 16px rgba(15, 23, 42, 0.12) !important;
        }

        .cemeteries-map .gm-style button.gm-ui-hover-effect {
          top: 0.5rem !important;
          right: 0.5rem !important;
          opacity: 1 !important;
          border-radius: 9999px !important;
          background: #ffffff !important;
        }
      `}</style>
    </div>
  );
}
