import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/navigation/header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { ServiceCategories } from "@/components/customer/service-categories";
import { ProviderCard } from "@/components/customer/provider-card";
import { useUser } from "@/hooks/use-user";
import { MapPin, Calendar, Search, Gift, Star, AlertTriangle, Phone } from "lucide-react";
import { ServiceProvider, Booking } from "@shared/schema";
import { useLocation } from "wouter";

export default function CustomerHome() {
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const [searchLocation, setSearchLocation] = useState("");
  const [date, setDate] = useState("");

  const { data: providers, isLoading: providersLoading } = useQuery<ServiceProvider[]>({
    queryKey: ['/api/providers'],
    queryFn: async () => {
      const response = await fetch('/api/providers?lat=40.7128&lng=-74.0060&radius=25');
      return response.json();
    }
  });

  const { data: recentBookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings/customer', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/bookings/customer/${user.id}`);
      return response.json();
    },
    enabled: !!user?.id
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        {/* Emergency Button */}
        <Card className="mb-6 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <h3 className="font-bold text-red-800 dark:text-red-200">Need Emergency Help?</h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Flat tire, dead battery, lockout? Get immediate roadside assistance.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setLocation('/customer/emergency-booking')}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Phone className="w-4 h-4 mr-2" />
                Emergency Help
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find auto services near you</h1>
          <p className="text-gray-600 mb-6">Professional mobile detailing and mechanic services at your location</p>
          
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Enter your location"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Search className="w-4 h-4 mr-2" />
                  Search Services
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Categories */}
        <ServiceCategories />

        {/* Featured Service Providers */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Top-Rated Providers</h2>
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
              View all
            </Button>
          </div>
          
          {providersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full mb-3" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers?.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Bookings</h2>
          <Card>
            {bookingsLoading ? (
              <CardContent className="p-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </CardContent>
            ) : recentBookings && recentBookings.length > 0 ? (
              <CardContent className="p-0">
                {recentBookings.slice(0, 3).map((booking, index) => (
                  <div key={booking.id} className={`p-6 ${index !== recentBookings.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Search className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Service Booking</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.scheduledAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={booking.status === 'completed' ? 'default' : 'secondary'}
                          className={booking.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {booking.status}
                        </Badge>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          ${booking.totalAmount}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="p-4 text-center border-t border-gray-100">
                  <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                    View all bookings
                  </Button>
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No recent bookings found</p>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Rewards Section */}
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">AutoCare Rewards</h3>
                <p className="text-purple-100 mb-4">Earn points with every booking and unlock exclusive rewards</p>
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 rounded-lg px-4 py-2">
                    <div className="text-sm text-purple-100">Current Points</div>
                    <div className="text-2xl font-bold">{user?.rewardPoints || 0}</div>
                  </div>
                  <div className="bg-white/20 rounded-lg px-4 py-2">
                    <div className="text-sm text-purple-100">Next Reward</div>
                    <div className="text-lg font-semibold">$10 Credit</div>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <Gift className="w-16 h-16 text-white/30" />
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
