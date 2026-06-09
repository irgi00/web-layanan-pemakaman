'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Beranda' },
  { href: '/cemeteries', label: 'Pemakaman' },
  { href: '/about', label: 'Tentang' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.5rem] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-sm shadow-primary/20">
              <span className="text-white font-bold text-sm">MC</span>
            </div>
            <div className="hidden sm:block">
              <span className="block text-lg font-semibold text-foreground">MemorialCare</span>
              <span className="block text-xs text-muted-foreground">
                Layanan pemakaman digital
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 p-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'relative rounded-full px-4 py-2 text-sm font-medium transition-all',
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute inset-x-0 -bottom-0.5 mx-auto h-1 w-1 rounded-full bg-primary" />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login">
              <Button variant="ghost" className="rounded-full px-5 text-foreground">
                Masuk
              </Button>
            </Link>
            <Link href="/register">
              <Button className="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90">
                Mulai Sekarang
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-xl border border-border/80 p-2.5 transition-colors hover:bg-muted md:hidden"
            aria-label={isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <nav className="space-y-2 border-t border-border/70 pb-5 pt-4 md:hidden">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'block rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-muted'
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-3">
              <Link href="/login">
                <Button variant="outline" className="w-full rounded-full border-border bg-background text-foreground">
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Mulai Sekarang
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
