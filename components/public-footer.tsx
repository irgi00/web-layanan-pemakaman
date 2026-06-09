import Link from 'next/link';

const footerLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/cemeteries', label: 'Pemakaman' },
  { href: '/about', label: 'Tentang' },
  { href: '/about#faq', label: 'FAQ' },
  { href: '/login', label: 'Masuk' },
  { href: '/register', label: 'Mulai Sekarang' },
];

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/80 bg-card">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-sm shadow-primary/20">
                MC
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">MemorialCare</p>
                <p className="text-sm text-muted-foreground">
                  Layanan pemakaman digital yang tertata, sopan, dan terpercaya.
                </p>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              Kami membantu keluarga menyiapkan proses pemesanan lahan makam dan layanan
              pendukung dengan pengalaman yang lebih jelas, rapi, dan penuh penghormatan.
            </p>
          </div>

          <div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Navigasi
              </h3>
              <div className="mt-4 flex flex-col gap-3">
                {footerLinks.map((link) => (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border/70 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} MemorialCare. Seluruh hak cipta dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
