import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Header } from "@/components/navigation/header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Calendar, Clock, MapPin, Car } from "lucide-react";
import { Booking, Location } from "@shared/schema";

export default function CustomerAppointments() {
  const { user } = useUser();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings/customer', user?.id],
    enabled: !!user?.id
  });

  const cancelBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await apiRequest('PATCH', `/api/bookings/${bookingId}`, { status: 'cancelled' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/customer', user?.id] });
      toast({ title: "Appointment cancelled" });
    },
    onError: () => {
      toast({
        title: "Couldn't cancel appointment",
        description: "Please try again.",
        variant: "destructive",
      });
    }
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

  const upcomingBookings = bookings?.filter(b =>
    b.status === 'confirmed' || b.status === 'pending'
  ).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()) || [];

  const pastBookings = bookings?.filter(b =>
    b.status === 'completed' || b.status === 'cancelled'
  ).sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mobile-bottom-nav-spacing">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">My Appointments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track and manage your service bookings</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card-surface rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Appointments */}
            {upcomingBookings.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">Upcoming Appointments</h2>
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => {
                    const location = booking.customerLocation as Location | null;
                    return (
                    <div key={booking.id} className="card-surface rounded-2xl p-6" style={{ borderLeft: "4px solid var(--electric)" }}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(204 70% 53% / 0.10)" }}>
                            <Car className="w-8 h-8" style={{ color: "var(--electric)" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground text-sm">Service Appointment</h3>
                              <span className={statusClass(booking.status)}>{booking.status.replace('_', ' ')}</span>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(booking.scheduledAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{new Date(booking.scheduledAt).toLocaleTimeString()}</span>
                              </div>
                              {location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  <span>{location.address}</span>
                                </div>
                              )}
                            </div>
                            {booking.notes && (
                              <p className="text-sm text-muted-foreground mt-2 tile p-2 rounded-lg">
                                {booking.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-lg font-bold text-foreground mb-2">
                            ${booking.totalAmount}
                          </div>
                          {booking.status === 'pending' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="block w-full"
                                  disabled={cancelBooking.isPending}
                                >
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This can't be undone. You'll need to book again if you change your mind.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep appointment</AlertDialogCancel>
                                  <AlertDialogAction
                                    className={buttonVariants({ variant: "destructive" })}
                                    onClick={() => cancelBooking.mutate(booking.id)}
                                  >
                                    Yes, cancel it
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past Appointments */}
            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">Past Appointments</h2>
                <div className="space-y-4">
                  {pastBookings.map((booking) => (
                    <div key={booking.id} className="card-surface rounded-2xl p-6 opacity-75">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 bg-surface-raised">
                            <Car className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground text-sm">Service Appointment</h3>
                              <span className={statusClass(booking.status)}>{booking.status.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(booking.scheduledAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-lg font-bold text-foreground mb-2">
                            ${booking.totalAmount}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && bookings?.length === 0 && (
              <div className="card-surface rounded-2xl p-12 text-center">
                <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No appointments yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Book your first auto service to get started</p>
                <Button onClick={() => setLocation('/')} className="bg-electric text-white hover:bg-electric-dim">
                  Browse Services
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
