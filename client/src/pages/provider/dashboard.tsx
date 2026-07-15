import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/navigation/header";
import { StatsCards } from "@/components/provider/stats-cards";
import { ScheduleItem } from "@/components/provider/schedule-item";
import { OnboardingForm } from "@/components/provider/onboarding-form";
import { useUser } from "@/hooks/use-user";
import { Plus, Package, Star } from "lucide-react";
import { ServiceProvider, Booking, Service, Inventory, Review } from "@shared/schema";

export default function ProviderDashboard() {
  const { user } = useUser();
  const [, setLocation] = useLocation();

  const { data: provider, isLoading: providerLoading, isError: providerError } = useQuery<ServiceProvider>({
    queryKey: ['/api/providers/user', user?.id],
    enabled: !!user?.id
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings/provider', provider?.id],
    enabled: !!provider?.id
  });

  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ['/api/providers', provider?.id, 'services'],
    enabled: !!provider?.id
  });

  const { data: inventory, isLoading: inventoryLoading } = useQuery<Inventory[]>({
    queryKey: ['/api/providers', provider?.id, 'inventory'],
    enabled: !!provider?.id
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ['/api/providers', provider?.id, 'reviews'],
    enabled: !!provider?.id
  });

  const todaysBookings = bookings?.filter(booking => {
    const today = new Date();
    const bookingDate = new Date(booking.scheduledAt);
    return bookingDate.toDateString() === today.toDateString();
  }).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()) || [];

  const getInventoryStatus = (item: Inventory) => {
    if (item.currentStock === 0) return { color: 'hsl(0 65% 50%)' };
    if (item.minStock != null && item.currentStock <= item.minStock) return { color: 'hsl(43 80% 38%)' };
    return { color: 'hsl(142 60% 35%)' };
  };

  if (providerLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-1/3 mb-2 rounded-xl" />
          <Skeleton className="h-4 w-1/4 mb-8 rounded-xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if ((providerError || !provider) && user?.id) {
    return <OnboardingForm userId={user.id} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Welcome back, <span className="font-semibold text-foreground">{provider?.businessName}</span>
            </p>
          </div>
          <Button
            onClick={() => setLocation('/services')}
            className="rounded-xl bg-electric text-white hover:bg-electric-dim font-semibold"
            style={{ boxShadow: "var(--shadow-glow)" }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>

        {/* Stats */}
        <StatsCards bookings={bookings || []} provider={provider} />

        {/* Today's Schedule */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Today's Schedule</h2>
          <div className="card-surface rounded-2xl overflow-hidden">
            {bookingsLoading ? (
              <div className="p-5 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="w-14 h-14 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : todaysBookings.length > 0 ? (
              <>
                {todaysBookings.map((booking, index) => (
                  <ScheduleItem
                    key={booking.id}
                    booking={booking}
                    isLast={index === todaysBookings.length - 1}
                  />
                ))}
                <div className="px-5 py-3 border-t border-border">
                  <button type="button" className="text-sm link-electric" onClick={() => setLocation('/schedule')}>View full schedule</button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No appointments scheduled for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Service management + Inventory */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="rounded-2xl border-0" style={{ boxShadow: "var(--shadow-card)" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-foreground">Service Management</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {servicesLoading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                </div>
              ) : (
                <div className="space-y-2">
                  {services?.slice(0, 3).map((service) => (
                    <div key={service.id}
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: "var(--surface-raised)" }}>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm">{service.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{service.description}</p>
                      </div>
                      <div className="text-right ml-3 shrink-0">
                        <p className="font-bold text-foreground text-sm">${service.basePrice}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button onClick={() => setLocation('/services')} className="w-full mt-4 rounded-xl bg-electric text-white hover:bg-electric-dim font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Add New Service
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0" style={{ boxShadow: "var(--shadow-card)" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-foreground">Inventory Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {inventoryLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {inventory?.map((item) => {
                    const { color } = getInventoryStatus(item);
                    const isLow = item.minStock != null && item.currentStock <= item.minStock;
                    const isOut = item.currentStock === 0;
                    return (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                          <span className="text-sm font-medium text-foreground">{item.itemName}</span>
                        </div>
                        <span className="text-xs font-medium" style={{ color }}>
                          {item.currentStock} {item.unit}
                          {isOut ? ' — Out of stock' : isLow ? ' — Low' : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              <Button variant="outline" disabled className="w-full mt-4 rounded-xl border-border font-semibold">
                <Package className="w-4 h-4 mr-2" />
                Manage Inventory (coming soon)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Reviews */}
        <Card className="rounded-2xl border-0" style={{ boxShadow: "var(--shadow-card)" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-foreground">Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {reviewsLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.slice(0, 3).map((review, index) => (
                  <div key={review.id}
                    className={`flex gap-3 ${index < reviews.length - 1 ? 'pb-4 border-b border-border' : ''}`}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white"
                      style={{ background: "var(--electric)" }}>
                      C
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">Customer</span>
                        <div className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i}
                              aria-hidden="true"
                              className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-border'}`}
                            />
                          ))}
                        </div>
                        {review.createdAt && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No reviews yet</p>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
