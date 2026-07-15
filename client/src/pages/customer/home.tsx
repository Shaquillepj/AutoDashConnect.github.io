import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/navigation/header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { ServiceCategories } from "@/components/customer/service-categories";
import { ProviderCard } from "@/components/customer/provider-card";
import { useUser } from "@/hooks/use-user";
import { MapPin, Calendar, Search, Gift, AlertTriangle, Phone } from "lucide-react";
import { ServiceProvider, Booking } from "@shared/schema";
import { useLocation } from "wouter";

export default function CustomerHome() {
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const [searchLocation, setSearchLocation] = useState("");
  const [date, setDate] = useState("");

  const { data: providers, isLoading: providersLoading } = useQuery<ServiceProvider[]>({
    queryKey: ['/api/providers?lat=40.7128&lng=-74.0060&radius=25'],
  });

  const { data: recentBookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings/customer', user?.id],
    enabled: !!user?.id
  });

  const statusClass = (status: string) => {
    switch (status) {
      case 'completed':   return 'status-completed';
      case 'confirmed':   return 'status-confirmed';
      case 'in_progress': return 'status-progress';
      case 'cancelled':   return 'status-cancelled';
      default:            return 'status-pending';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 mobile-bottom-nav-spacing">

        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">What do you need today?</p>
        </div>

        {/* Emergency banner */}
        <div
          className="mb-6 rounded-2xl p-4 flex items-center justify-between gap-3"
          style={{
            background: "hsl(0 65% 50% / 0.06)",
            border: "1px solid hsl(0 65% 50% / 0.15)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "hsl(0 65% 50% / 0.10)" }}>
              <AlertTriangle className="w-5 h-5" style={{ color: "hsl(0 65% 45%)" }} />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Need Emergency Help?</p>
              <p className="text-xs text-muted-foreground">Flat tire · Dead battery · Lockout</p>
            </div>
          </div>
          <Button
            onClick={() => setLocation('/customer/emergency-booking')}
            className="shrink-0 h-9 text-sm font-semibold rounded-xl text-white"
            style={{ background: "hsl(0 65% 50%)" }}
          >
            <Phone className="w-3.5 h-3.5 mr-1.5" />
            SOS
          </Button>
        </div>

        {/* Search bar — Uber-style grey pill */}
        <div className="mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
              <Input
                placeholder="Enter your location"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="pl-10 h-12 rounded-2xl bg-surface-raised border-0 text-sm focus-visible:ring-2 focus-visible:ring-electric/30 focus-visible:ring-offset-0"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-10 h-12 rounded-2xl bg-surface-raised border-0 text-sm focus-visible:ring-2 focus-visible:ring-electric/30 focus-visible:ring-offset-0 w-[160px]"
              />
            </div>
            <Button
              aria-label="Search"
              className="h-12 px-5 rounded-2xl bg-electric text-white hover:bg-electric-dim font-semibold shrink-0"
              style={{ boxShadow: "var(--shadow-glow)" }}
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Service categories */}
        <ServiceCategories />

        {/* Top-rated providers */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Top-Rated Providers</h2>
            <button type="button" className="text-sm link-electric">View all</button>
          </div>

          {providersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card-surface rounded-2xl overflow-hidden">
                  <Skeleton className="h-44 w-full rounded-none" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : providers && providers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          ) : (
            <div className="tile rounded-2xl p-8 text-center">
              <p className="text-muted-foreground text-sm">No providers found in your area.</p>
            </div>
          )}
        </div>

        {/* Recent bookings */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Recent Bookings</h2>
          <div className="card-surface rounded-2xl overflow-hidden">
            {bookingsLoading ? (
              <div className="p-5 space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-1/2" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            ) : recentBookings && recentBookings.length > 0 ? (
              <>
                {recentBookings.slice(0, 3).map((booking, index) => (
                  <div
                    key={booking.id}
                    className={`px-5 py-4 flex items-center justify-between gap-3 ${
                      index < recentBookings.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: "hsl(204 70% 53% / 0.1)" }}
                      >
                        <Search className="w-4 h-4" style={{ color: "var(--electric)" }} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">Service Booking</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.scheduledAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={statusClass(booking.status)}>{booking.status}</span>
                      <p className="text-sm font-bold text-foreground mt-1">${booking.totalAmount}</p>
                    </div>
                  </div>
                ))}
                <div className="px-5 py-3 border-t border-border">
                  <button type="button" className="text-sm link-electric">View all bookings</button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No recent bookings</p>
              </div>
            )}
          </div>
        </div>

        {/* Rewards — unique gradient tile */}
        <div
          className="rounded-2xl p-5 flex items-center justify-between gap-4"
          style={{
            background: "linear-gradient(135deg, hsl(204 70% 53%) 0%, hsl(225 70% 55%) 100%)",
          }}
        >
          <div>
            <h3 className="text-base font-bold text-white mb-0.5">AutoDash Rewards</h3>
            <p className="text-sm text-white/75 mb-4">Earn points with every booking</p>
            <div className="flex items-center gap-3">
              {/* Metallic silver stat tiles */}
              <div className="rounded-xl px-4 py-2.5" style={{
                background: "linear-gradient(145deg, #d8dce2 0%, #f4f5f7 35%, #c8ccd4 65%, #dde0e6 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85), 0 2px 6px rgba(0,0,0,0.18)",
                border: "1px solid rgba(255,255,255,0.6)",
              }}>
                <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "hsl(220 15% 45%)" }}>Points</p>
                <p className="text-xl font-bold" style={{ color: "hsl(220 20% 18%)" }}>{user?.rewardPoints ?? 0}</p>
              </div>
              <div className="rounded-xl px-4 py-2.5" style={{
                background: "linear-gradient(145deg, #d8dce2 0%, #f4f5f7 35%, #c8ccd4 65%, #dde0e6 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85), 0 2px 6px rgba(0,0,0,0.18)",
                border: "1px solid rgba(255,255,255,0.6)",
              }}>
                <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "hsl(220 15% 45%)" }}>Next Reward</p>
                <p className="text-base font-bold" style={{ color: "hsl(220 20% 18%)" }}>$10 Credit</p>
              </div>
            </div>
          </div>
          <div className="hidden md:block opacity-20">
            <Gift className="w-16 h-16 text-white" />
          </div>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
