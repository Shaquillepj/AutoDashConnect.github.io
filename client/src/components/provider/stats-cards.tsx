import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Calendar, Star, CheckCircle } from "lucide-react";
import { Booking, ServiceProvider } from "@shared/schema";

interface StatsCardsProps {
  bookings: Booking[];
  provider?: ServiceProvider;
}

export function StatsCards({ bookings, provider }: StatsCardsProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaysBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.scheduledAt);
    return bookingDate.toDateString() === today.toDateString();
  });

  const todaysRevenue = todaysBookings
    .filter(booking => booking.status === 'completed')
    .reduce((sum, booking) => sum + parseFloat(booking.totalAmount), 0);

  const pendingBookings = todaysBookings.filter(booking => booking.status === 'pending').length;

  const completedBookings = bookings.filter(booking => booking.status === 'completed').length;
  const totalBookings = bookings.length;
  const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;

  const yesterdaysRevenue = 435; // Mock data for comparison
  const revenueChange = todaysRevenue > yesterdaysRevenue ? 
    `+${Math.round(((todaysRevenue - yesterdaysRevenue) / yesterdaysRevenue) * 100)}%` : 
    `${Math.round(((todaysRevenue - yesterdaysRevenue) / yesterdaysRevenue) * 100)}%`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Today's Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${todaysRevenue.toFixed(0)}</p>
              <p className="text-sm text-green-600 mt-1">{revenueChange} from yesterday</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Bookings Today</p>
              <p className="text-2xl font-bold text-gray-900">{todaysBookings.length}</p>
              <p className="text-sm text-blue-600 mt-1">{pendingBookings} pending approval</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Customer Rating</p>
              <p className="text-2xl font-bold text-gray-900">{provider?.rating || "0.0"}</p>
              <p className="text-sm text-yellow-600 mt-1">{provider?.reviewCount || 0} total reviews</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
              <p className="text-sm text-green-600 mt-1">
                {completionRate >= 95 ? "Excellent performance" : 
                 completionRate >= 85 ? "Good performance" : "Needs improvement"}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
