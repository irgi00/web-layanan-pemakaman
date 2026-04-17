'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error(error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-32 w-full mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground text-sm">Manage your bookings and profile</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-border text-foreground hover:bg-muted"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Card */}
        <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome, {user?.firstName} {user?.lastName}
          </h2>
          <p className="text-muted-foreground mb-6">
            {user?.email}
          </p>
          <Link href="/cemeteries">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Start New Booking
            </Button>
          </Link>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-card border-border">
            <div className="text-muted-foreground text-sm font-medium mb-2">Active Bookings</div>
            <div className="text-3xl font-bold text-foreground">0</div>
          </Card>
          <Card className="p-6 bg-card border-border">
            <div className="text-muted-foreground text-sm font-medium mb-2">Total Bookings</div>
            <div className="text-3xl font-bold text-foreground">0</div>
          </Card>
          <Card className="p-6 bg-card border-border">
            <div className="text-muted-foreground text-sm font-medium mb-2">Account Status</div>
            <div className="text-lg font-bold text-primary">Active</div>
          </Card>
        </div>

        {/* Bookings Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-4">Your Bookings</h3>
            <Card className="p-12 text-center bg-card border-border">
              <p className="text-muted-foreground mb-4">
                No bookings yet. Start by browsing available cemeteries.
              </p>
              <Link href="/cemeteries">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Browse Cemeteries
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
