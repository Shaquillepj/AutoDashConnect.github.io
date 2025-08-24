import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Camera, MapPin, Phone, Car, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { apiRequest } from "@/lib/queryClient";
import type { InsertEmergencyRequest, ServiceProvider } from "@shared/schema";

const emergencyRequestSchema = z.object({
  issueType: z.string().min(1, "Please select an issue type"),
  description: z.string().min(10, "Please provide a detailed description"),
  urgencyLevel: z.enum(["low", "medium", "high", "critical"]),
  customerLocation: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().min(1, "Address is required")
  }),
  vehicleInfo: z.object({
    make: z.string().min(1, "Vehicle make is required"),
    model: z.string().min(1, "Vehicle model is required"),
    year: z.number().min(1900).max(new Date().getFullYear() + 1),
    color: z.string().min(1, "Vehicle color is required"),
    plateNumber: z.string().optional()
  }),
  issuePhoto: z.string().optional()
});

type EmergencyRequestForm = z.infer<typeof emergencyRequestSchema>;

interface EmergencyResponse {
  request: any;
  nearbyProviders: ServiceProvider[];
}

export default function EmergencyBookingPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const form = useForm<EmergencyRequestForm>({
    resolver: zodResolver(emergencyRequestSchema),
    defaultValues: {
      issueType: "",
      description: "",
      urgencyLevel: "medium",
      vehicleInfo: {
        make: "",
        model: "",
        year: new Date().getFullYear(),
        color: "",
        plateNumber: ""
      }
    }
  });

  const createEmergencyRequest = useMutation({
    mutationFn: async (data: InsertEmergencyRequest): Promise<EmergencyResponse> => {
      const response = await fetch('/api/emergency-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to create emergency request');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Emergency request submitted!",
        description: `Found ${data.nearbyProviders.length} nearby providers. Help is on the way!`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emergency-requests'] });
      setLocation('/customer/emergency-tracking/' + data.request.id);
    },
    onError: () => {
      toast({
        title: "Failed to submit request",
        description: "Please try again",
        variant: "destructive"
      });
    }
  });

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Please enter your address manually",
        variant: "destructive"
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        
        // Reverse geocoding (simplified - in production use proper geocoding service)
        try {
          const address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setLocationAddress(address);
          form.setValue('customerLocation', {
            lat: latitude,
            lng: longitude,
            address: address
          });
        } catch (error) {
          setLocationAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setIsGettingLocation(false);
      },
      (error) => {
        toast({
          title: "Location access denied",
          description: "Please enter your address manually",
          variant: "destructive"
        });
        setIsGettingLocation(false);
      }
    );
  };

  const onSubmit = (data: EmergencyRequestForm) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit an emergency request",
        variant: "destructive"
      });
      return;
    }

    createEmergencyRequest.mutate({
      ...data,
      customerId: user.id
    });
  };

  const issueTypes = [
    { value: "flat_tire", label: "Flat Tire", icon: "🚗" },
    { value: "dead_battery", label: "Dead Battery", icon: "🔋" },
    { value: "lockout", label: "Locked Out", icon: "🔒" },
    { value: "towing", label: "Need Towing", icon: "🚛" },
    { value: "engine_trouble", label: "Engine Trouble", icon: "⚙️" },
    { value: "accident", label: "Accident", icon: "⚠️" },
    { value: "other", label: "Other Issue", icon: "❓" }
  ];

  const urgencyColors = {
    low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Emergency Roadside Assistance
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Need immediate help? Submit your request and we'll connect you with the nearest available service provider.
        </p>
      </div>

      <Card className="mb-6 border-l-4 border-l-red-500">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="font-semibold text-red-700 dark:text-red-400">Emergency Service</h3>
              <p className="text-sm text-red-600 dark:text-red-300">
                For life-threatening emergencies, call 911 immediately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Issue Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                What's the problem?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="issueType"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select the type of issue" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {issueTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <span className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              {type.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please describe the issue in detail..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="urgencyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgency Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">
                          <Badge className={urgencyColors.low}>Low - Can wait</Badge>
                        </SelectItem>
                        <SelectItem value="medium">
                          <Badge className={urgencyColors.medium}>Medium - Within 2 hours</Badge>
                        </SelectItem>
                        <SelectItem value="high">
                          <Badge className={urgencyColors.high}>High - Within 1 hour</Badge>
                        </SelectItem>
                        <SelectItem value="critical">
                          <Badge className={urgencyColors.critical}>Critical - Immediate</Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Your Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="flex-1"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {isGettingLocation ? "Getting location..." : "Use Current Location"}
                </Button>
              </div>

              <FormField
                control={form.control}
                name="customerLocation.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your current address"
                        value={locationAddress || field.value}
                        onChange={(e) => {
                          setLocationAddress(e.target.value);
                          field.onChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vehicleInfo.make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make</FormLabel>
                      <FormControl>
                        <Input placeholder="Toyota, Honda, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleInfo.model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="Camry, Civic, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vehicleInfo.year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1900"
                          max={new Date().getFullYear() + 1}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleInfo.color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input placeholder="Red, Blue, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="vehicleInfo.plateNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Plate (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="ABC-1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Issue Photo (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Camera className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Take a photo of the issue to help providers understand the situation
                </p>
                <Button type="button" variant="outline" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/customer')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createEmergencyRequest.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {createEmergencyRequest.isPending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Request Emergency Help
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}