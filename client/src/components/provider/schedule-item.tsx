import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Car, User } from "lucide-react";
import { Booking } from "@shared/schema";

interface ScheduleItemProps {
  booking: Booking;
  isLast?: boolean;
  showDate?: boolean;
}

export function ScheduleItem({ booking, isLast = false, showDate = true }: ScheduleItemProps) {
  const scheduledTime = new Date(booking.scheduledAt);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionButton = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            Confirm
          </Button>
        );
      case 'confirmed':
        return (
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            Start
          </Button>
        );
      case 'in_progress':
        return (
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
            Complete
          </Button>
        );
      default:
        return (
          <Button size="sm" variant="outline">
            Details
          </Button>
        );
    }
  };

  return (
    <div className={`p-6 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {scheduledTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: false 
              })}
            </div>
            {showDate && (
              <div className="text-sm text-gray-500">
                {scheduledTime.toLocaleDateString('en-US', { 
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            )}
          </div>
          <div className="border-l border-gray-200 h-12"></div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-gray-900">Service Appointment</h3>
              <Badge className={getStatusColor(booking.status)}>
                {booking.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Customer</span>
                </span>
                {booking.vehicleInfo && (
                  <span className="flex items-center space-x-1">
                    <Car className="w-4 h-4" />
                    <span>
                      {(booking.vehicleInfo as any).year} {(booking.vehicleInfo as any).make} {(booking.vehicleInfo as any).model}
                    </span>
                  </span>
                )}
              </div>
              {booking.customerLocation && (
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{(booking.customerLocation as any).address}</span>
                </div>
              )}
            </div>
            {booking.notes && (
              <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                <strong>Notes:</strong> {booking.notes}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900 mb-2">
            ${booking.totalAmount}
          </div>
          <div className="space-x-2">
            {getActionButton(booking.status)}
            <Button size="sm" variant="outline">
              Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
