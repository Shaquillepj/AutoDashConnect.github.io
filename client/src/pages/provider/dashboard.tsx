import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/navigation/header";
import { StatsCards } from "@/components/provider/stats-cards";
import { ScheduleItem } from "@/components/provider/schedule-item";
import { useUser } from "@/hooks/use-user";
import { Plus, Package, Star } from "lucide-react";
import { ServiceProvider, Booking, Service, Inventory, Review } from "@shared/schema";

export default function ProviderDashboard() {
  const { user } = useUser();

  const { data: provider, isLoading: providerLoading } = useQuery<ServiceProvider>({
    queryKey: ['/api/providers/user', user?.id],
    enabled: !!user?.id
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings/provider', provider?.id],
    enabled: !!provider?.id
  });

  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ['/api/providers', provider?.id, 'services'],
    enabled: !!provider?.id
  });

  const { data: inventory, isLoading: inventoryLoading } = useQuery<Inventory[]>({
    queryKey: ['/api/providers', provider?.id, 'inventory'],
    enabled: !!provider?.id
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ['/api/providers', provider?.id, 'reviews'],
    enabled: !!provider?.id
  });

  const todaysBookings = bookings?.filter(booking => {
    const today = new Date();
    const bookingDate = new Date(booking.scheduledAt);
    return bookingDate.toDateString() === today.toDateString();
  }).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()) || [];

  const getInventoryStatus = (item: Inventory) => {
    if (item.currentStock === 0) return { status: 'Out of stock', color: 'bg-red-500' };
    if (item.currentStock <= item.minStock) return { status: 'Low', color: 'bg-yellow-500' };
    return { status: 'In stock', color: 'bg-green-500' };
  };

  if (providerLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, <span className="font-medium">{provider?.businessName}</span>
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </div>

          {/* Stats Cards */}
          <StatsCards 
            bookings={bookings || []}
            provider={provider}
          />
        </div>

        {/* Today's Schedule */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Schedule</h2>
          <Card>
            {bookingsLoading ? (
              <CardContent className="p-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 mb-4">
                    <Skeleton className="w-16 h-16" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </CardContent>
            ) : todaysBookings.length > 0 ? (
              <CardContent className="p-0">
                {todaysBookings.map((booking, index) => (
                  <ScheduleItem 
                    key={booking.id} 
                    booking={booking} 
                    isLast={index === todaysBookings.length - 1}
                  />
                ))}
                <div className="p-4 text-center border-t border-gray-100">
                  <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                    View full schedule
                  </Button>
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No appointments scheduled for today</p>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Quick Actions & Business Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Service Management */}
          <Card>
            <CardHeader>
              <CardTitle>Service Management</CardTitle>
            </CardHeader>
            <CardContent>
              {servicesLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg">
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {services?.slice(0, 3).map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900">{service.name}</h4>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">${service.basePrice}</div>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button className="w-full mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add New Service
              </Button>
            </CardContent>
          </Card>

          {/* Inventory Management */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
            </CardHeader>
            <CardContent>
              {inventoryLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {inventory?.map((item) => {
                    const status = getInventoryStatus(item);
                    return (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 ${status.color} rounded-full`}></div>
                          <span className="font-medium text-gray-900">{item.itemName}</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm ${
                            item.currentStock === 0 ? 'text-red-600' :
                            item.currentStock <= item.minStock ? 'text-orange-600' : 'text-gray-600'
                          }`}>
                            {item.currentStock} {item.unit}
                            {item.currentStock <= item.minStock && ' (Low)'}
                            {item.currentStock === 0 && ' (Out of stock)'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <Button variant="outline" className="w-full mt-4">
                <Package className="w-4 h-4 mr-2" />
                Manage Inventory
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Customer Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {reviewsLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-1/3 mb-2" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.slice(0, 3).map((review, index) => (
                  <div key={review.id} className={`border-b border-gray-100 pb-4 ${index === reviews.length - 1 ? 'border-b-0 pb-0' : ''}`}>
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {/* Would show customer initials in real app */}
                          C
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">Customer</span>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-600 text-sm">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No reviews yet</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
