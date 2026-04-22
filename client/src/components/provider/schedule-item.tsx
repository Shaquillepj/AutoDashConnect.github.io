import { Button } from "@/components/ui/button";
import { Clock, MapPin, Car, User } from "lucide-react";
import { Booking } from "@shared/schema";

interface ScheduleItemProps {
  booking: Booking;
  isLast?: boolean;
  showDate?: boolean;
}

export function ScheduleItem({ booking, isLast = false, showDate = true }: ScheduleItemProps) {
  const scheduledTime = new Date(booking.scheduledAt);

  const statusClass = (status: string) => {
    switch (status) {
      case 'pending':     return 'status-pending';
      case 'confirmed':   return 'status-confirmed';
      case 'in_progress': return 'status-progress';
      case 'completed':   return 'status-completed';
      case 'cancelled':   return 'status-cancelled';
      default:            return 'status-pending';
    }
  };

  const getActionButton = (status: string) => {
    switch (status) {
      case 'pending':
        return <Button size="sm" className="rounded-xl bg-electric text-white hover:bg-electric-dim h-8 text-xs">Confirm</Button>;
      case 'confirmed':
        return <Button size="sm" className="rounded-xl h-8 text-xs" style={{ background: "hsl(142 60% 40%)", color: "#fff" }}>Start</Button>;
      case 'in_progress':
        return <Button size="sm" className="rounded-xl h-8 text-xs" style={{ background: "hsl(270 55% 50%)", color: "#fff" }}>Complete</Button>;
      default:
        return <Button size="sm" variant="outline" className="rounded-xl h-8 text-xs">Details</Button>;
    }
  };

  return (
    <div className={`px-5 py-4 ${!isLast ? 'border-b border-border' : ''}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Time block */}
          <div className="text-center shrink-0 w-14">
            <div className="text-lg font-bold text-foreground leading-none">
              {scheduledTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })}
            </div>
            {showDate && (
              <div className="text-xs text-muted-foreground mt-0.5">
                {scheduledTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            )}
          </div>

          <div className="w-px h-12 bg-border shrink-0" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-semibold text-foreground text-sm">Service Appointment</h3>
              <span className={statusClass(booking.status)}>{booking.status.replace('_', ' ')}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> Customer</span>
              {booking.vehicleInfo && (
                <span className="flex items-center gap-1">
                  <Car className="w-3.5 h-3.5" />
                  {(booking.vehicleInfo as any).year} {(booking.vehicleInfo as any).make} {(booking.vehicleInfo as any).model}
                </span>
              )}
              {booking.customerLocation && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {(booking.customerLocation as any).address}
                </span>
              )}
            </div>
            {booking.notes && (
              <p className="text-xs text-muted-foreground mt-2 tile rounded-lg px-3 py-1.5">
                <strong className="text-foreground">Note:</strong> {booking.notes}
              </p>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-base font-bold text-foreground mb-2">${booking.totalAmount}</div>
          <div className="flex gap-2">
            {getActionButton(booking.status)}
            <Button size="sm" variant="outline" className="rounded-xl h-8 text-xs">Details</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
