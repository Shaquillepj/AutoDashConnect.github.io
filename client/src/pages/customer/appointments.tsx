import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/navigation/header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { useUser } from "@/hooks/use-user";
import { Calendar, Clock, MapPin, Car } from "lucide-react";
import { Booking } from "@shared/schema";

export default function CustomerAppointments() {
  const { user } = useUser();

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings/customer', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/bookings/customer/${user.id}`);
      return response.json();
    },
    enabled: !!user?.id
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓';
      case 'confirmed': return '📅';
      case 'in_progress': return '🔧';
      case 'pending': return '⏳';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const upcomingBookings = bookings?.filter(b => 
    b.status === 'confirmed' || b.status === 'pending'
  ).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()) || [];

  const pastBookings = bookings?.filter(b => 
    b.status === 'completed' || b.status === 'cancelled'
  ).sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
          <p className="text-gray-600">Track and manage your service bookings</p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-16 h-16 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-3 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Appointments */}
            {upcomingBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <Card key={booking.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Car className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-gray-900">Service Appointment</h3>
                                <Badge className={getStatusColor(booking.status)}>
                                  {getStatusIcon(booking.status)} {booking.status}
                                </Badge>
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(booking.scheduledAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{new Date(booking.scheduledAt).toLocaleTimeString()}</span>
                                </div>
                                {booking.customerLocation && (
                                  <div className="flex items-center space-x-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{(booking.customerLocation as any).address}</span>
                                  </div>
                                )}
                              </div>
                              {booking.notes && (
                                <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                                  {booking.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900 mb-2">
                              ${booking.totalAmount}
                            </div>
                            <div className="space-y-2">
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                              {booking.status === 'pending' && (
                                <Button size="sm" variant="destructive" className="block w-full">
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Past Appointments */}
            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Appointments</h2>
                <div className="space-y-4">
                  {pastBookings.map((booking) => (
                    <Card key={booking.id} className="opacity-75">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Car className="w-8 h-8 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-gray-900">Service Appointment</h3>
                                <Badge className={getStatusColor(booking.status)}>
                                  {getStatusIcon(booking.status)} {booking.status}
                                </Badge>
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(booking.scheduledAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900 mb-2">
                              ${booking.totalAmount}
                            </div>
                            {booking.status === 'completed' && (
                              <Button size="sm" variant="outline">
                                Leave Review
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && bookings?.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments yet</h3>
                  <p className="text-gray-600 mb-4">Book your first auto service to get started</p>
                  <Button onClick={() => window.location.href = '/'}>
                    Browse Services
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
