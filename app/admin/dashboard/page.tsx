'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, LogOut, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  cemeteryId?: string;
}

interface DashboardStats {
  totalPlots: number;
  availablePlots: number;
  totalBookings: number;
  totalRevenue: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        const userData = await response.json();
        
        // Check if user is admin
        if (userData.role !== 'CEMETERY_ADMIN' && userData.role !== 'SUPER_ADMIN') {
          router.push('/dashboard');
          return;
        }

        setUser(userData);
        
        // Fetch cemetery stats
        await fetchStats(userData);
      } catch (error) {
        console.error(error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async (userData: User) => {
      try {
        // In production, fetch real stats from API
        setStats({
          totalPlots: 500,
          availablePlots: 480,
          totalBookings: 20,
          totalRevenue: 10000,
        });
      } catch (error) {
        console.error(error);
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
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'CEMETERY_ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm">Cemetery Management</p>
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
        {/* Quick Stats */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="p-6 bg-card border-border">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-muted-foreground text-sm font-medium mb-2">Total Plots</div>
                  <div className="text-3xl font-bold text-foreground">{stats.totalPlots}</div>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-muted-foreground text-sm font-medium mb-2">Available Plots</div>
                  <div className="text-3xl font-bold text-accent">{stats.availablePlots}</div>
                </div>
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-accent" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-muted-foreground text-sm font-medium mb-2">Total Bookings</div>
                  <div className="text-3xl font-bold text-primary">{stats.totalBookings}</div>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-muted-foreground text-sm font-medium mb-2">Total Revenue</div>
                  <div className="text-3xl font-bold text-foreground">${(stats.totalRevenue / 1000).toFixed(1)}K</div>
                </div>
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-accent" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Management Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Plot Management */}
          <Card className="p-8 bg-card border-border">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Plot Management</h2>
                <p className="text-muted-foreground">Manage cemetery plots and availability</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Plot
              </Button>
            </div>

            <div className="space-y-4">
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-medium text-foreground mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    View All Plots
                  </button>
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Import Plots from CSV
                  </button>
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Update Plot Status
                  </button>
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Export Plot Report
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Booking Management */}
          <Card className="p-8 bg-card border-border">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Booking Management</h2>
                <p className="text-muted-foreground">Review and manage customer bookings</p>
              </div>
              <Button variant="outline" className="border-border text-foreground hover:bg-muted">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>

            <div className="space-y-4">
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-medium text-foreground mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    View All Bookings
                  </button>
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Pending Confirmations
                  </button>
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Payment History
                  </button>
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Generate Invoices
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Services Management */}
          <Card className="p-8 bg-card border-border">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Services Management</h2>
                <p className="text-muted-foreground">Configure available cemetery services</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>

            <div className="space-y-4">
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-medium text-foreground mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    View All Services
                  </button>
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Update Pricing
                  </button>
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Service Analytics
                  </button>
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Enable/Disable Services
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Reports & Analytics */}
          <Card className="p-8 bg-card border-border">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Reports & Analytics</h2>
                <p className="text-muted-foreground">View performance metrics and insights</p>
              </div>
              <Button variant="outline" className="border-border text-foreground hover:bg-muted">
                <BarChart3 className="w-4 h-4 mr-2" />
                View
              </Button>
            </div>

            <div className="space-y-4">
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-medium text-foreground mb-3">Available Reports</h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Revenue Report
                  </button>
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Booking Trends
                  </button>
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Occupancy Report
                  </button>
                  <button className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded transition-colors">
                    Audit Log
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Settings Section */}
        <Card className="p-8 bg-card border-border mt-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Cemetery Settings</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">General Information</h3>
              <div className="space-y-3 text-foreground">
                <p><span className="font-medium">Name:</span> Peaceful Rest Cemetery</p>
                <p><span className="font-medium">Location:</span> Springfield, IL</p>
                <p><span className="font-medium">Contact:</span> info@peacefulrest.com</p>
                <p><span className="font-medium">Phone:</span> +1-217-555-0100</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Administration</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start border-border text-foreground hover:bg-muted">
                  Edit Cemetery Info
                </Button>
                <Button variant="outline" className="w-full justify-start border-border text-foreground hover:bg-muted">
                  Manage Admins
                </Button>
                <Button variant="outline" className="w-full justify-start border-border text-foreground hover:bg-muted">
                  API Settings
                </Button>
                <Button variant="outline" className="w-full justify-start border-border text-foreground hover:bg-muted">
                  Integrations
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
