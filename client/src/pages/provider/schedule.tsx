import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/navigation/header";
import { ScheduleItem } from "@/components/provider/schedule-item";
import { useUser } from "@/hooks/use-user";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { ServiceProvider, Booking } from "@shared/schema";

export default function ProviderSchedule() {
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: provider } = useQuery<ServiceProvider>({
    queryKey: ['/api/providers/user', user?.id],
    enabled: !!user?.id
  });

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings/provider', provider?.id],
    enabled: !!provider?.id
  });

  const getBookingsForDate = (date: Date) => {
    return bookings?.filter(booking => {
      const bookingDate = new Date(booking.scheduledAt);
      return bookingDate.toDateString() === date.toDateString();
    }).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()) || [];
  };

  const selectedDateBookings = getBookingsForDate(selectedDate);

  const getDateBookingCount = (date: Date) => {
    return getBookingsForDate(date).length;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getStatusStats = () => {
    const today = new Date();
    const todayBookings = getBookingsForDate(today);
    
    return {
      total: todayBookings.length,
      pending: todayBookings.filter(b => b.status === 'pending').length,
      confirmed: todayBookings.filter(b => b.status === 'confirmed').length,
      completed: todayBookings.filter(b => b.status === 'completed').length,
    };
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule</h1>
          <p className="text-gray-600">Manage your appointments and availability</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Today's Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
              <div className="text-sm text-gray-600">Confirmed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
                modifiers={{
                  hasBookings: (date) => getDateBookingCount(date) > 0
                }}
                modifiersStyles={{
                  hasBookings: { 
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    fontWeight: 'bold'
                  }
                }}
              />
              <div className="mt-4 text-center">
                <Button onClick={goToToday} variant="outline" size="sm">
                  Go to Today
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Schedule */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <CardTitle>
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </CardTitle>
                  <Badge variant="secondary">
                    {selectedDateBookings.length} appointment{selectedDateBookings.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="w-16 h-16" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : selectedDateBookings.length > 0 ? (
                <div className="space-y-0">
                  {selectedDateBookings.map((booking, index) => (
                    <ScheduleItem 
                      key={booking.id} 
                      booking={booking} 
                      isLast={index === selectedDateBookings.length - 1}
                      showDate={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments scheduled</h3>
                  <p className="text-gray-600">
                    {selectedDate.toDateString() === new Date().toDateString() 
                      ? "You have no appointments today" 
                      : "No appointments scheduled for this date"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
