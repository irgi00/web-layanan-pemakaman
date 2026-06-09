'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

const faqItems = [
  {
    question: 'Bagaimana cara booking makam?',
    answer:
      'Pilih area pemakaman yang tersedia, tentukan lahan dan layanan yang dibutuhkan, lalu lanjutkan proses booking melalui sistem MemorialCare.',
  },
  {
    question: 'Apakah layanan dapat dipilih sesuai kebutuhan?',
    answer:
      'Ya. Pengguna dapat menyesuaikan layanan pemakaman berdasarkan kebutuhan keluarga, mulai dari persiapan hingga layanan pendukung lainnya.',
  },
  {
    question: 'Bagaimana mengetahui status lahan makam?',
    answer:
      'Setiap lahan menampilkan status ketersediaan secara langsung pada halaman pemakaman sehingga pengguna bisa melihat apakah plot masih tersedia atau sudah terpesan.',
  },
  {
    question: 'Apakah pembayaran tersedia secara online?',
    answer:
      'Tersedia. Sistem mendukung proses pembayaran online agar pemesanan dapat dilakukan lebih cepat dan praktis tanpa harus datang langsung.',
  },
];

export function FaqSection() {
  return (
    <section
      id="faq"
      className="border-y border-border/70 bg-[linear-gradient(180deg,rgba(242,249,244,0.9),rgba(255,255,255,1))]"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/90 px-4 py-2 text-sm text-primary shadow-sm">
            <HelpCircle className="h-4 w-4" />
            Pertanyaan Umum
          </div>
          <h2 className="mt-5 text-3xl font-bold md:text-4xl">Jawaban singkat yang mudah dipahami</h2>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Jawaban singkat untuk membantu Anda memahami proses booking makam, layanan
            pemakaman, pembayaran, dan status lahan.
          </p>
        </div>

        <Card className="mx-auto mt-12 max-w-4xl rounded-[2rem] border-border/80 bg-background/95 p-6 shadow-xl shadow-primary/5 sm:p-8">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={`item-${index}`}
                className="rounded-2xl border border-transparent px-1 transition-colors data-[state=open]:border-primary/10 data-[state=open]:bg-primary/5"
              >
                <AccordionTrigger className="px-4 py-5 text-left text-base font-semibold text-foreground hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 text-base leading-7 text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>
    </section>
  );
}
