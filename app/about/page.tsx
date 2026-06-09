import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Building2,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Target,
} from 'lucide-react';

import { BackButton } from '@/components/back-button';
import { FaqSection } from '@/components/faq-section';
import { Header } from '@/components/header';
import { PublicFooter } from '@/components/public-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Tentang | MemorialCare',
  description:
    'Pelajari MemorialCare, sistem layanan pemakaman dan booking lahan makam yang modern, transparan, dan mudah diakses.',
};

const services = [
  {
    title: 'Booking Lahan Makam',
    description:
      'Pengguna dapat melihat dan memesan lahan makam yang tersedia secara online.',
    icon: MapPin,
  },
  {
    title: 'Layanan Pemakaman',
    description:
      'Menyediakan berbagai layanan pemakaman mulai dari persiapan hingga proses pemakaman.',
    icon: HeartHandshake,
  },
  {
    title: 'Informasi Pemakaman',
    description:
      'Memberikan informasi detail terkait lokasi, fasilitas, dan layanan yang tersedia.',
    icon: BookOpen,
  },
  {
    title: 'Manajemen Data',
    description:
      'Membantu pengelola dalam mengelola data pemesanan, pelanggan, dan layanan.',
    icon: Building2,
  },
];

const missions = [
  'Memberikan kemudahan dalam proses booking lahan makam.',
  'Menyediakan informasi layanan pemakaman secara lengkap dan transparan.',
  'Membantu pengelolaan data pemakaman secara terstruktur.',
  'Menghadirkan layanan digital yang responsif dan mudah digunakan.',
  'Meningkatkan efisiensi pelayanan administrasi pemakaman.',
];

const values = [
  {
    title: 'Tenang',
    description: 'Tampilan disusun agar pengguna fokus pada informasi penting tanpa distraksi berlebihan.',
  },
  {
    title: 'Terpercaya',
    description: 'Setiap halaman publik diarahkan untuk terasa rapi, jelas, dan profesional.',
  },
  {
    title: 'Empatik',
    description: 'Bahasa dan presentasi visual dibuat sopan karena konteks layanan yang sensitif.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-border/70 bg-[linear-gradient(180deg,rgba(240,248,242,1),rgba(255,255,255,1))]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(39,128,79,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(84,179,120,0.12),transparent_30%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
            <div className="space-y-7">
              <Badge className="rounded-full bg-primary/10 px-4 py-1.5 text-primary hover:bg-primary/10">
                Tentang MemorialCare
              </Badge>
              <div className="space-y-5">
                <h1 className="max-w-3xl text-4xl font-bold leading-tight text-balance md:text-5xl lg:text-6xl">
                  Platform layanan pemakaman digital yang tertata dan mudah dipahami
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                  MemorialCare membantu masyarakat memperoleh informasi pemakaman dan melakukan
                  pemesanan layanan secara lebih mudah, cepat, dan terorganisir.
                </p>
                <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                  Halaman publik kami dirancang untuk memberikan pengalaman yang modern namun tetap
                  sopan, sehingga keluarga dapat mengambil keputusan penting dengan lebih tenang.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/cemeteries">
                  <Button size="lg" className="group w-full rounded-full sm:w-auto">
                    Lihat Lahan Tersedia
                    <ArrowRight className="transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full rounded-full border-primary/20 bg-background/80 sm:w-auto"
                  >
                    Mulai Sekarang
                  </Button>
                </Link>
              </div>
            </div>

            <Card className="rounded-[2rem] border-primary/15 bg-card/90 p-8 shadow-2xl shadow-primary/5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h2 className="mt-6 text-2xl font-semibold">Tujuan Sistem</h2>
              <p className="mt-4 leading-8 text-muted-foreground">
                Tujuan utama MemorialCare adalah memberi kemudahan kepada masyarakat dalam
                mengakses layanan pemakaman secara modern dan transparan, sekaligus membantu
                pengelola mengatur data, layanan, dan administrasi dengan lebih efektif.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-border/70 bg-background p-5">
                  <p className="text-sm text-muted-foreground">Fokus layanan</p>
                  <p className="mt-2 font-semibold">Kemudahan akses dan transparansi</p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background p-5">
                  <p className="text-sm text-muted-foreground">Arah pengalaman</p>
                  <p className="mt-2 font-semibold">Tertata, sopan, dan profesional</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-[1.75rem] border-border/80 bg-card p-8 shadow-sm">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold">Visi</h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Menjadi platform layanan pemakaman digital yang terpercaya, modern, dan mudah
                diakses oleh masyarakat.
              </p>
            </Card>

            <Card className="rounded-[1.75rem] border-border/80 bg-card p-8 shadow-sm">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold">Misi</h2>
              <ul className="mt-4 space-y-3 text-muted-foreground">
                {missions.map((mission) => (
                  <li key={mission} className="flex items-start gap-3 leading-7">
                    <span className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary" />
                    <span>{mission}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        <section id="services" className="border-y border-border/70 bg-card/50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mt-5 text-3xl font-bold md:text-4xl">
                Fondasi visual dan sistem yang menjaga pengalaman tetap terarah
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                MemorialCare dibangun untuk mendukung kebutuhan pengguna dan pengelola tanpa
                mengorbankan kejelasan informasi publik.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {values.map((value) => (
                <Card
                  key={value.title}
                  className="rounded-[1.75rem] border-border/80 bg-background p-6 shadow-sm"
                >
                  <h3 className="text-xl font-semibold">{value.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{value.description}</p>
                </Card>
              ))}
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {services.map((service) => {
                const Icon = service.icon;

                return (
                  <Card
                    key={service.title}
                    className="group rounded-[1.75rem] border-border/80 bg-background p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-6 text-xl font-semibold">{service.title}</h3>
                    <p className="mt-3 leading-7 text-muted-foreground">{service.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <Card className="rounded-[2rem] border-border/80 bg-[linear-gradient(180deg,rgba(242,249,244,1),rgba(255,255,255,1))] p-8 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-2xl font-semibold">Tim Pengembang dan Arah Pengembangan</h2>
                <p className="mt-4 text-lg leading-8 text-muted-foreground">
                  Sistem ini dikembangkan sebagai website layanan pemakaman berbasis web dengan
                  fokus pada kemudahan penggunaan, desain modern, dan pengelolaan data yang efisien.
                </p>
              </div>
              <Link href="/cemeteries">
                <Button variant="outline" className="rounded-full border-primary/20 bg-background px-6">
                  Lihat Pemakaman
                </Button>
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-border/70 bg-background p-5">
                <p className="text-sm text-muted-foreground">Pendekatan</p>
                <p className="mt-2 font-semibold">User-friendly</p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-background p-5">
                <p className="text-sm text-muted-foreground">Tampilan</p>
                <p className="mt-2 font-semibold">Modern dan profesional</p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-background p-5">
                <p className="text-sm text-muted-foreground">Manajemen</p>
                <p className="mt-2 font-semibold">Efisien dan terstruktur</p>
              </div>
            </div>
          </Card>
        </section>

        <FaqSection />

      </main>

      <PublicFooter />
    </div>
  );
}
