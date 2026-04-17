'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MC</span>
            </div>
            <span className="font-semibold text-lg text-foreground hidden sm:inline">MemorialCare</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/cemeteries" className="text-foreground hover:text-primary transition-colors">
              Cemeteries
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-foreground">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Get Started
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <Link href="/" className="block px-4 py-2 text-foreground hover:bg-muted rounded">
              Home
            </Link>
            <Link href="/cemeteries" className="block px-4 py-2 text-foreground hover:bg-muted rounded">
              Cemeteries
            </Link>
            <Link href="/about" className="block px-4 py-2 text-foreground hover:bg-muted rounded">
              About
            </Link>
            <Link href="/contact" className="block px-4 py-2 text-foreground hover:bg-muted rounded">
              Contact
            </Link>
            <div className="flex flex-col gap-2 px-4 pt-4">
              <Link href="/login">
                <Button variant="outline" className="w-full text-foreground border-border">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
