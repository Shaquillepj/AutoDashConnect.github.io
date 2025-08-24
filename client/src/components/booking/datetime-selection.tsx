import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar as CalendarIcon } from "lucide-react";
import { Service } from "@shared/schema";

interface DateTimeSelectionProps {
  service?: Service;
  onComplete: (data: { scheduledAt: Date }) => void;
}

export function DateTimeSelection({ service, onComplete }: DateTimeSelectionProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Generate available time slots for the selected date
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8; // 8 AM
    const endHour = 18; // 6 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(2024, 0, 1, hour, minute).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        slots.push({ value: timeString, display: displayTime });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);
      
      onComplete({ scheduledAt: scheduledDateTime });
    }
  };

  const isDateAvailable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const getNextAvailableDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  return (
    <div className="space-y-6">
      {/* Service Summary */}
      {service && (
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                <p className="text-sm text-gray-600 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Estimated {Math.round(service.duration / 60)} hour{service.duration >= 120 ? 's' : ''}
                </p>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">${service.basePrice}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Date Selection */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            Select Date
          </h2>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => !isDateAvailable(date)}
              className="rounded-md border"
              initialFocus
            />
          </div>
          {selectedDate && (
            <div className="mt-4 text-center">
              <Badge variant="secondary">
                Selected: {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Selection */}
      {selectedDate && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Select Time
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.value}
                  variant={selectedTime === slot.value ? "default" : "outline"}
                  onClick={() => setSelectedTime(slot.value)}
                  className={`text-sm ${selectedTime === slot.value ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                >
                  {slot.display}
                </Button>
              ))}
            </div>
            {selectedTime && (
              <div className="mt-4 text-center">
                <Badge variant="secondary">
                  Selected: {timeSlots.find(s => s.value === selectedTime)?.display}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Booking Summary */}
      {selectedDate && selectedTime && (
        <Card className="bg-green-50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Appointment Summary</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-medium">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span className="font-medium">
                  {timeSlots.find(s => s.value === selectedTime)?.display}
                </span>
              </div>
              {service && (
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">
                    {Math.round(service.duration / 60)} hour{service.duration >= 120 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedDate || !selectedTime}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          Continue to Details
        </Button>
      </div>
    </div>
  );
}
