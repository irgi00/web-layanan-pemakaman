'use client';

import Link from 'next/link';
import { Heart, MapPin, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/header';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-balance">
                  Dignified Final Resting Places
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground">
                  MemorialCare makes planning and booking cemetery services simple, respectful, and compassionate. We honor memories with care.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/cemeteries">
                  <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                    Browse Cemeteries
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary text-foreground hover:bg-primary/10">
                    Learn More
                  </Button>
                </Link>
              </div>

              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">100% Secure & Confidential</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Trusted by Thousands</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">500+ Cemeteries Available</span>
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl h-96 flex items-center justify-center border border-primary/20">
                <div className="text-center space-y-4">
                  <Heart className="w-24 h-24 text-primary mx-auto opacity-60" />
                  <p className="text-muted-foreground">Compassionate Service</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Why Choose MemorialCare</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide a thoughtful, organized approach to end-of-life planning
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 bg-background border-border hover:border-primary transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Easy Search & Discovery</h3>
              <p className="text-muted-foreground">
                Find cemetery plots in your area with detailed information, photos, and real-time availability.
              </p>
            </Card>

            <Card className="p-8 bg-background border-border hover:border-accent transition-colors">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Secure Booking</h3>
              <p className="text-muted-foreground">
                Book plots and arrange services with peace of mind. All transactions are encrypted and confidential.
              </p>
            </Card>

            <Card className="p-8 bg-background border-border hover:border-primary transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Comprehensive Services</h3>
              <p className="text-muted-foreground">
                From plot selection to monument installation, we offer a full range of memorial services.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
            Ready to Honor Your Loved One?
          </h2>
          <p className="text-lg text-primary-foreground/90">
            Start your search today. Browse available cemetery plots and arrange the perfect tribute.
          </p>
          <Link href="/cemeteries">
            <Button size="lg" className="bg-primary-foreground hover:bg-primary-foreground/90 text-primary">
              Explore Cemeteries Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MC</span>
                </div>
                <span className="font-semibold text-foreground">MemorialCare</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Honoring memories with dignity and compassion.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/" className="hover:text-foreground transition">Home</Link></li>
                <li><Link href="/cemeteries" className="hover:text-foreground transition">Cemeteries</Link></li>
                <li><Link href="/about" className="hover:text-foreground transition">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/contact" className="hover:text-foreground transition">Contact</Link></li>
                <li><Link href="/faq" className="hover:text-foreground transition">FAQ</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground transition">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/terms" className="hover:text-foreground transition">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground transition">Privacy Policy</Link></li>
                <li><Link href="/cookies" className="hover:text-foreground transition">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8">
            <p className="text-sm text-muted-foreground text-center">
              &copy; 2024 MemorialCare. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
