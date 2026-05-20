'use client';

import { Star } from 'lucide-react';

import { Card } from '@/components/ui/card';

const reviews = [
  {
    name: 'Siti Rahma',
    rating: 5,
    comment:
      'Proses booking sangat mudah dan pelayanan sangat membantu saat keluarga kami membutuhkan pendampingan.',
  },
  {
    name: 'Budi Santoso',
    rating: 5,
    comment:
      'Informasi lahan makam yang tersedia sangat jelas, jadi kami bisa mengambil keputusan dengan lebih tenang.',
  },
  {
    name: 'Maria Jonathan',
    rating: 4,
    comment:
      'Tim responsif, alur pemesanan rapi, dan pembaruan status layanan diberikan dengan cepat.',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Penilaian ${rating} dari 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-transparent text-muted-foreground/40'
          }`}
        />
      ))}
    </div>
  );
}

export function ReviewSection() {
  return (
    <section className="border-t border-border bg-gradient-to-b from-background via-card/50 to-background py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Ulasan Pengguna
            </p>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Apa Kata Pengguna Kami
            </h2>
            <p className="text-lg leading-8 text-muted-foreground">
              Pengalaman keluarga yang telah menggunakan MemorialCare untuk booking lahan makam
              dan pengaturan layanan pemakaman.
            </p>
          </div>

          <Card className="w-full max-w-sm rounded-3xl border-primary/15 bg-background p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Penilaian rata-rata</p>
            <div className="mt-3 flex items-end gap-3">
              <span className="text-4xl font-bold text-foreground">4.8/5</span>
              <span className="pb-1 text-sm text-muted-foreground">dari ulasan pengguna</span>
            </div>
            <div className="mt-4">
              <StarRating rating={5} />
            </div>
          </Card>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review) => (
            <Card
              key={review.name}
              className="group rounded-3xl border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/30 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-foreground">{review.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Pengguna MemorialCare</p>
                </div>
                <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {review.rating}.0
                </div>
              </div>
              <div className="mt-5">
                <StarRating rating={review.rating} />
              </div>
              <p className="mt-5 leading-7 text-muted-foreground">"{review.comment}"</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
