import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, MapPin } from "lucide-react";
import { ServiceSelection } from "@/components/booking/service-selection";
import { DateTimeSelection } from "@/components/booking/datetime-selection";
import { BookingDetails } from "@/components/booking/booking-details";
import { PaymentForm } from "@/components/booking/payment-form";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Service, AddOnService, ServiceProvider } from "@shared/schema";

type BookingStep = 'service' | 'datetime' | 'details' | 'payment';

interface BookingData {
  serviceId: string;
  addOnIds: string[];
  scheduledAt: Date | null;
  customerLocation: {
    lat: number;
    lng: number;
    address: string;
  } | null;
  vehicleInfo: {
    make: string;
    model: string;
    year: string;
    color: string;
    plateNumber: string;
  } | null;
  notes: string;
  totalAmount: number;
}

export default function BookingFlow() {
  const [match] = useRoute("/booking/:providerId/:serviceId");
  const { user } = useUser();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [bookingData, setBookingData] = useState<BookingData>({
    serviceId: match?.params.serviceId || '',
    addOnIds: [],
    scheduledAt: null,
    customerLocation: null,
    vehicleInfo: null,
    notes: '',
    totalAmount: 0
  });

  const { data: provider } = useQuery<ServiceProvider>({
    queryKey: ['/api/providers', match?.params.providerId],
    enabled: !!match?.params.providerId
  });

  const { data: services } = useQuery<Service[]>({
    queryKey: ['/api/providers', match?.params.providerId, 'services'],
    enabled: !!match?.params.providerId
  });

  const { data: addOns } = useQuery<AddOnService[]>({
    queryKey: ['/api/services', bookingData.serviceId, 'addons'],
    enabled: !!bookingData.serviceId
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/bookings', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/customer'] });
      toast({
        title: "Booking confirmed!",
        description: "Your appointment has been scheduled successfully.",
      });
      // Navigate back to home or appointments
      window.location.href = '/';
    },
    onError: () => {
      toast({
        title: "Booking failed",
        description: "There was an error creating your booking. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleStepComplete = (stepData: any) => {
    setBookingData(prev => ({ ...prev, ...stepData }));
    
    const steps: BookingStep[] = ['service', 'datetime', 'details', 'payment'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBookingSubmit = async () => {
    if (!user || !provider || !bookingData.scheduledAt || !bookingData.customerLocation) {
      return;
    }

    const bookingPayload = {
      customerId: user.id,
      providerId: provider.id,
      serviceId: bookingData.serviceId,
      scheduledAt: bookingData.scheduledAt.toISOString(),
      status: 'pending',
      totalAmount: bookingData.totalAmount.toString(),
      customerLocation: bookingData.customerLocation,
      vehicleInfo: bookingData.vehicleInfo,
      addOns: bookingData.addOnIds,
      notes: bookingData.notes
    };

    createBookingMutation.mutate(bookingPayload);
  };

  const goBack = () => {
    const steps: BookingStep[] = ['service', 'datetime', 'details', 'payment'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    } else {
      window.history.back();
    }
  };

  const getStepNumber = (step: BookingStep): number => {
    const steps: BookingStep[] = ['service', 'datetime', 'details', 'payment'];
    return steps.indexOf(step) + 1;
  };

  const selectedService = services?.find(s => s.id === bookingData.serviceId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={goBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">Book Service</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {['Service', 'Date & Time', 'Details', 'Payment'].map((label, index) => {
              const stepNum = index + 1;
              const isActive = stepNum === getStepNumber(currentStep);
              const isCompleted = stepNum < getStepNumber(currentStep);
              
              return (
                <div key={label} className="flex items-center">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isActive ? 'bg-blue-600 text-white' : 
                      isCompleted ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {stepNum}
                    </div>
                    <span className={`ml-2 text-sm ${
                      isActive ? 'font-medium text-blue-600' : 
                      isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {label}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className={`w-12 h-0.5 ml-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'service' && (
          <ServiceSelection
            services={services || []}
            addOns={addOns || []}
            selectedServiceId={bookingData.serviceId}
            selectedAddOnIds={bookingData.addOnIds}
            onComplete={handleStepComplete}
          />
        )}

        {currentStep === 'datetime' && (
          <DateTimeSelection
            service={selectedService}
            onComplete={handleStepComplete}
          />
        )}

        {currentStep === 'details' && (
          <BookingDetails
            onComplete={handleStepComplete}
          />
        )}

        {currentStep === 'payment' && (
          <PaymentForm
            bookingData={bookingData}
            service={selectedService}
            addOns={addOns?.filter(addon => bookingData.addOnIds.includes(addon.id)) || []}
            onComplete={handleBookingSubmit}
            isLoading={createBookingMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}
