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

  const completedTodayCount = todaysBookings.filter(booking => booking.status === 'completed').length;

  const stats = [
    {
      label: "Today's Revenue",
      value: `$${todaysRevenue.toFixed(0)}`,
      sub: `${completedTodayCount} completed today`,
      subColor: "hsl(142 60% 35%)",
      iconClass: "stats-icon-revenue",
      Icon: DollarSign,
    },
    {
      label: "Bookings Today",
      value: `${todaysBookings.length}`,
      sub: `${pendingBookings} pending approval`,
      subColor: "var(--electric)",
      iconClass: "stats-icon-bookings",
      Icon: Calendar,
    },
    {
      label: "Customer Rating",
      value: `${provider?.rating || "0.0"}`,
      sub: `${provider?.reviewCount || 0} total reviews`,
      subColor: "hsl(43 80% 38%)",
      iconClass: "stats-icon-rating",
      Icon: Star,
    },
    {
      label: "Completion Rate",
      value: `${completionRate}%`,
      sub: completionRate >= 95 ? "Excellent" : completionRate >= 85 ? "Good" : "Needs improvement",
      subColor: "hsl(270 55% 50%)",
      iconClass: "stats-icon-completion",
      Icon: CheckCircle,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map(({ label, value, sub, subColor, iconClass, Icon }) => (
        <Card key={label} className="rounded-2xl border-0" style={{ boxShadow: "var(--shadow-card)" }}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs mt-1 font-medium" style={{ color: subColor }}>{sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-3 ${iconClass}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
