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

import { FaqSection } from '@/components/faq-section';
import { BackButton } from '@/components/back-button';
import { Header } from '@/components/header';
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

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/12 via-background to-accent/12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(45,212,191,0.12),transparent_28%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-28">
            <div className="space-y-8">
              <BackButton fallbackHref="/" className="text-foreground/80 hover:text-primary" />
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-card/80 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur">
                Layanan Pemakaman Digital yang Modern dan Terorganisir
              </div>
              <div className="space-y-5">
                <h1 className="max-w-3xl text-4xl font-bold leading-tight text-balance md:text-5xl lg:text-6xl">
                  Tentang Kami
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                  MemorialCare merupakan sistem layanan pemakaman dan booking lahan makam yang dirancang untuk membantu masyarakat dalam memperoleh informasi serta melakukan pemesanan layanan pemakaman secara lebih mudah, cepat, dan terorganisir.
                </p>
                <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                  Sistem ini hadir sebagai solusi digital untuk mempermudah proses pencarian lahan makam, pemesanan layanan pemakaman, hingga pengelolaan data pemakaman secara efisien. Dengan adanya platform ini, pengguna dapat melakukan proses pemesanan tanpa harus datang langsung ke lokasi.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/cemeteries">
                  <Button
                    size="lg"
                    className="group w-full bg-primary text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 hover:bg-primary/90 sm:w-auto"
                  >
                    Lihat Lahan Tersedia
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-primary/20 bg-background/70 transition-colors hover:bg-primary/5 sm:w-auto"
                  >
                    Mulai Sekarang
                  </Button>
                </Link>
              </div>
            </div>

            <Card className="flex h-full flex-col justify-between rounded-3xl border-primary/15 bg-card/85 p-8 shadow-xl shadow-primary/5 backdrop-blur">
              <div className="space-y-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold">Tujuan Sistem</h2>
                  <p className="leading-8 text-muted-foreground">
                    Tujuan utama dari MemorialCare adalah memberikan kemudahan kepada masyarakat dalam mengakses layanan pemakaman secara modern dan transparan. Selain itu, sistem ini juga membantu pengelola pemakaman dalam mengatur data, layanan, dan proses administrasi dengan lebih efektif.
                  </p>
                </div>
              </div>
              <div className="mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
                <div className="rounded-2xl bg-primary/8 p-4">
                  <p className="text-sm text-muted-foreground">Fokus layanan</p>
                  <p className="mt-2 font-semibold">Kemudahan akses dan transparansi</p>
                </div>
                <div className="rounded-2xl bg-accent/10 p-4">
                  <p className="text-sm text-muted-foreground">Nilai utama</p>
                  <p className="mt-2 font-semibold">Responsif, terstruktur, dan efisien</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="rounded-3xl border-border bg-card p-8 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold">Visi</h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Menjadi platform layanan pemakaman digital yang terpercaya, modern, dan mudah diakses oleh masyarakat.
              </p>
            </Card>

            <Card className="rounded-3xl border-border bg-card p-8 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
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

        <section id="services" className="border-y border-border bg-card/50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                Layanan Tersedia
              </p>
              <h2 className="mt-4 text-3xl font-bold md:text-4xl">
                Solusi lengkap untuk kebutuhan layanan pemakaman
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                MemorialCare menyediakan fitur dan layanan inti yang membantu pengguna sekaligus mempermudah pengelola dalam menjalankan operasional secara efisien.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {services.map((service) => {
                const Icon = service.icon;

                return (
                  <Card
                    key={service.title}
                    className="group rounded-3xl border-border bg-background p-6 shadow-sm transition-all duration-200 hover:-translate-y-2 hover:border-primary/30 hover:shadow-xl"
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
          <Card className="rounded-3xl border-border bg-gradient-to-br from-background to-primary/5 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold">Tim Pengembang</h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Sistem ini dikembangkan sebagai proyek pengembangan website layanan pemakaman
              berbasis web dengan fokus pada kemudahan penggunaan, desain modern, dan
              pengelolaan data yang efisien.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Pendekatan</p>
                <p className="mt-2 font-semibold">User-friendly</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Tampilan</p>
                <p className="mt-2 font-semibold">Modern & profesional</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Manajemen</p>
                <p className="mt-2 font-semibold">Efisien & terstruktur</p>
              </div>
            </div>
          </Card>
        </section>

        <FaqSection />
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                MC
              </div>
              <div>
                <p className="font-semibold">MemorialCare</p>
                <p className="text-sm text-muted-foreground">
                  Layanan pemakaman digital yang tertata dan terpercaya.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              Beranda
            </Link>
            <Link href="/cemeteries" className="transition-colors hover:text-foreground">
              Pemakaman
            </Link>
            <Link href="/about#services" className="transition-colors hover:text-foreground">
              Layanan
            </Link>
            <Link href="/about" className="transition-colors hover:text-foreground">
              Tentang
            </Link>
            <Link href="/about#faq" className="transition-colors hover:text-foreground">
              Pertanyaan Umum
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
